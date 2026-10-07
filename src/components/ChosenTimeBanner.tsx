import { useMemo } from 'react';
import type { ChosenTime, Meeting } from '../types/meeting';
import { formatDayLong } from '../utilities/dates';
import { buildIcs, icsFileName } from '../utilities/ics';
import { formatTime, minutesToTime, timeToMinutes, timeZoneName } from '../utilities/time';

interface ChosenTimeBannerProps {
  meeting: Meeting;
  chosen: ChosenTime;
  isCreator: boolean;
  onClear: () => void;
}

const BUTTON_CLASS = 'rounded border border-emerald-700 px-3 py-1 text-sm font-medium text-emerald-900';

/** The picked meeting time, with .ics download and share buttons for everyone. */
export const ChosenTimeBanner = ({ meeting, chosen, isCreator, onClear }: ChosenTimeBannerProps) => {
  const endTime = minutesToTime(timeToMinutes(chosen.startTime) + meeting.durationMinutes);

  const file = useMemo(() => {
    const text = buildIcs(meeting, chosen, {
      url: `${window.location.origin}/m/${meeting.id}`,
      uidDomain: window.location.hostname,
    });
    return new File([text], icsFileName(meeting.title), { type: 'text/calendar' });
  }, [meeting, chosen]);

  const canShare = typeof navigator.canShare === 'function' && navigator.canShare({ files: [file] });

  const handleDownload = () => {
    const url = URL.createObjectURL(file);
    const link = document.createElement('a');
    link.href = url;
    link.download = file.name;
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const handleShare = async () => {
    try {
      await navigator.share({ files: [file], title: meeting.title });
    } catch (error) {
      // Closing the share sheet rejects with AbortError; that isn't a failure.
      if (!(error instanceof DOMException && error.name === 'AbortError')) handleDownload();
    }
  };

  return (
    <section aria-label="Chosen meeting time" className="flex flex-col gap-2 rounded border border-emerald-300 bg-emerald-50 p-4">
      <h2 className="font-semibold text-emerald-900">✅ Meeting time chosen</h2>
      <p className="text-lg font-semibold">
        {formatDayLong(chosen.date)}, {formatTime(chosen.startTime)}–{formatTime(endTime)}
      </p>
      <p className="text-sm text-gray-600">{timeZoneName(meeting.timeZone)}</p>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={handleDownload} className={BUTTON_CLASS}>
          Download .ics
        </button>
        {canShare && (
          <button type="button" onClick={handleShare} className={BUTTON_CLASS}>
            Share .ics
          </button>
        )}
        {isCreator && (
          <button type="button" onClick={onClear} className="rounded border border-gray-300 px-3 py-1 text-sm">
            Change time
          </button>
        )}
      </div>
    </section>
  );
};
