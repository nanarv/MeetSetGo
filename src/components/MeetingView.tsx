import { useMemo, useState } from 'react';
import { joinMeeting, saveAvailability, setChosenTime } from '../services/meetingService';
import type { Availability, ChosenTime, Meeting, Participant } from '../types/meeting';
import { isDatedMeeting } from '../utilities/dates';
import { errorMessage } from '../utilities/errors';
import type { Pen } from '../utilities/grid';
import { SLOT_MINUTES, getTimeSlots, timeZoneName } from '../utilities/time';
import type { TimeCandidate } from '../utilities/topTimes';
import { AvailabilityGrid } from './AvailabilityGrid';
import { ChosenTimeBanner } from './ChosenTimeBanner';
import { GroupHeatmap, type HighlightWindow } from './GroupHeatmap';
import { JoinForm } from './JoinForm';
import { MeetingHeader } from './MeetingHeader';
import { PenSelector } from './PenSelector';
import { RespondentList } from './RespondentList';
import { TopTimesPanel } from './TopTimesPanel';

interface MeetingViewProps {
  meeting: Meeting;
  participants: Participant[];
  userId: string;
}

type Tab = 'mine' | 'group';

const TAB_LABELS: Record<Tab, string> = { mine: 'My availability', group: 'Group' };

export const MeetingView = ({ meeting, participants, userId }: MeetingViewProps) => {
  const [tab, setTab] = useState<Tab>('mine');
  const [pen, setPen] = useState<Pen>('available');
  const [saveError, setSaveError] = useState<string | null>(null);
  const [pickError, setPickError] = useState<string | null>(null);
  const [hovered, setHovered] = useState<TimeCandidate | null>(null);

  const me = participants.find((p) => p.id === userId);
  const slots = useMemo(() => getTimeSlots(meeting.startTime, meeting.endTime), [meeting.startTime, meeting.endTime]);
  const zone = timeZoneName(meeting.timeZone);
  const isCreator = meeting.creatorId === userId;
  const dated = isDatedMeeting(meeting.days);
  // Someone besides the organizer has joined, so there is something to compare.
  const hasResponses = participants.length >= 2;

  const savePick = async (chosen: ChosenTime | null) => {
    setPickError(null);
    try {
      await setChosenTime(meeting.id, chosen);
    } catch (error) {
      setPickError(errorMessage(error));
    }
  };

  const chosenWindow: HighlightWindow | null = (() => {
    if (!meeting.chosenTime) return null;
    const dayIndex = meeting.days.indexOf(meeting.chosenTime.date);
    const startSlotIndex = slots.indexOf(meeting.chosenTime.startTime.replace(':', ''));
    if (dayIndex < 0 || startSlotIndex < 0) return null;
    return { dayIndex, startSlotIndex, slotCount: Math.max(1, Math.ceil(meeting.durationMinutes / SLOT_MINUTES)) };
  })();
  // Hovering or focusing a suggested time outlines it; otherwise the chosen time stays outlined.
  const highlight: HighlightWindow | null = hovered ?? chosenWindow;

  const handleCommit = async (availability: Availability) => {
    setSaveError(null);
    try {
      await saveAvailability(meeting.id, userId, availability);
    } catch (error) {
      setSaveError(errorMessage(error));
    }
  };

  const panelClass = (panel: Tab) => `${tab === panel ? 'flex' : 'hidden'} flex-col gap-3 lg:flex`;

  return (
    <div className="flex flex-col gap-6">
      <MeetingHeader meeting={meeting} isCreator={isCreator} />
      {meeting.chosenTime && (
        <ChosenTimeBanner
          meeting={meeting}
          chosen={meeting.chosenTime}
          isCreator={isCreator}
          onClear={() => savePick(null)}
        />
      )}
      <RespondentList participants={participants} creatorId={meeting.creatorId} userId={userId} />

      <div role="tablist" aria-label="Views" className="flex gap-2 lg:hidden">
        {(['mine', 'group'] as const).map((value) => (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={tab === value}
            onClick={() => setTab(value)}
            className="rounded-full border border-gray-300 px-4 py-1 text-sm aria-selected:bg-gray-900 aria-selected:text-white"
          >
            {TAB_LABELS[value]}
          </button>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <section className={panelClass('mine')}>
          <h2 className="text-lg font-semibold">{me ? `${me.name}'s availability` : 'Your availability'}</h2>
          {me ? (
            <>
              <p className="text-sm text-gray-600">
                Click or drag to paint. Start on a painted cell to erase. Times in {zone}.
              </p>
              <PenSelector pen={pen} onChange={setPen} />
              <AvailabilityGrid
                days={meeting.days}
                slots={slots}
                availability={me.availability}
                pen={pen}
                onCommit={handleCommit}
              />
              {saveError && (
                <p role="alert" className="text-sm text-red-700">
                  Couldn't save: {saveError}
                </p>
              )}
            </>
          ) : (
            <JoinForm onJoin={(name) => joinMeeting(meeting.id, userId, name)} />
          )}
        </section>

        <section className={panelClass('group')}>
          <h2 className="text-lg font-semibold">Group availability</h2>
          <p className="text-sm text-gray-600">Times in {zone}.</p>
          <GroupHeatmap days={meeting.days} slots={slots} participants={participants} highlight={highlight} />
        </section>
      </div>

      {dated && !hasResponses && (
        <p className="text-sm text-gray-500">Suggested meeting times appear once someone besides the organizer responds.</p>
      )}
      {dated && hasResponses && (
        <>
          <TopTimesPanel
            meeting={meeting}
            participants={participants}
            slots={slots}
            isCreator={isCreator}
            onHighlight={setHovered}
            onPick={savePick}
          />
          {pickError && (
            <p role="alert" className="text-sm text-red-700">
              Couldn't save the chosen time: {pickError}
            </p>
          )}
        </>
      )}
    </div>
  );
};
