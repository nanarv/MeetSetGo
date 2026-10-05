import {
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
  type DocumentData,
  type Timestamp,
  type Unsubscribe,
} from 'firebase/firestore';
import type { Availability, Meeting, MeetingDetails, NewMeeting, Participant } from '../types/meeting';
import { generateShortId } from '../utilities/shortId';
import { db } from './firebase';

const MAX_ID_ATTEMPTS = 5;

const meetingsCollection = collection(db, 'meetings');
const meetingRef = (meetingId: string) => doc(db, 'meetings', meetingId);
const participantsCollection = (meetingId: string) => collection(db, 'meetings', meetingId, 'participants');
const participantRef = (meetingId: string, userId: string) =>
  doc(db, 'meetings', meetingId, 'participants', userId);

const toMeeting = (id: string, data: DocumentData): Meeting => ({
  id,
  title: data.title,
  description: data.description ?? '',
  location: data.location ?? '',
  durationMinutes: data.durationMinutes,
  days: data.days,
  startTime: data.startTime,
  endTime: data.endTime,
  timeZone: data.timeZone,
  creatorId: data.creatorId,
  participantIds: data.participantIds ?? [],
  createdAt: data.createdAt ? (data.createdAt as Timestamp).toDate() : null,
});

const toParticipant = (id: string, data: DocumentData): Participant => ({
  id,
  name: data.name,
  availability: data.availability ?? {},
});

const findUnusedId = async (): Promise<string> => {
  for (let attempt = 0; attempt < MAX_ID_ATTEMPTS; attempt++) {
    const id = generateShortId();
    const snapshot = await getDoc(meetingRef(id));
    if (!snapshot.exists()) return id;
  }
  throw new Error('Could not create a unique meeting link. Please try again.');
};

/** Creates the meeting with its creator as the first participant. Returns the short id. */
export const createMeeting = async (
  meeting: NewMeeting,
  creator: { uid: string; name: string },
): Promise<string> => {
  const id = await findUnusedId();
  const batch = writeBatch(db);
  batch.set(meetingRef(id), {
    ...meeting,
    creatorId: creator.uid,
    participantIds: [creator.uid],
    createdAt: serverTimestamp(),
  });
  batch.set(participantRef(id, creator.uid), {
    name: creator.name,
    availability: {},
    updatedAt: serverTimestamp(),
  });
  await batch.commit();
  return id;
};

export const subscribeToMeeting = (
  meetingId: string,
  onMeeting: (meeting: Meeting | null) => void,
  onError: (error: Error) => void,
): Unsubscribe =>
  onSnapshot(
    meetingRef(meetingId),
    (snapshot) => onMeeting(snapshot.exists() ? toMeeting(snapshot.id, snapshot.data()) : null),
    onError,
  );

export const subscribeToParticipants = (
  meetingId: string,
  onParticipants: (participants: Participant[]) => void,
  onError: (error: Error) => void,
): Unsubscribe =>
  onSnapshot(
    participantsCollection(meetingId),
    (snapshot) =>
      onParticipants(
        snapshot.docs
          .map((d) => toParticipant(d.id, d.data()))
          .sort((a, b) => a.name.localeCompare(b.name)),
      ),
    onError,
  );

/** Meetings this browser created or joined, newest first. */
export const subscribeToMyMeetings = (
  userId: string,
  onMeetings: (meetings: Meeting[]) => void,
  onError: (error: Error) => void,
): Unsubscribe =>
  onSnapshot(
    query(meetingsCollection, where('participantIds', 'array-contains', userId)),
    (snapshot) =>
      onMeetings(
        snapshot.docs
          .map((d) => toMeeting(d.id, d.data()))
          .sort((a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0)),
      ),
    onError,
  );

export const joinMeeting = async (meetingId: string, userId: string, name: string): Promise<void> => {
  const batch = writeBatch(db);
  batch.set(participantRef(meetingId, userId), {
    name,
    availability: {},
    updatedAt: serverTimestamp(),
  });
  batch.update(meetingRef(meetingId), { participantIds: arrayUnion(userId) });
  await batch.commit();
};

export const saveAvailability = async (
  meetingId: string,
  userId: string,
  availability: Availability,
): Promise<void> => {
  await updateDoc(participantRef(meetingId, userId), { availability, updatedAt: serverTimestamp() });
};

export const updateMeetingDetails = async (meetingId: string, details: MeetingDetails): Promise<void> => {
  await updateDoc(meetingRef(meetingId), { ...details });
};

export const deleteMeeting = async (meetingId: string): Promise<void> => {
  const participants = await getDocs(participantsCollection(meetingId));
  const batch = writeBatch(db);
  participants.docs.forEach((d) => batch.delete(d.ref));
  batch.delete(meetingRef(meetingId));
  await batch.commit();
};
