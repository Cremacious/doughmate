// Local feed reminders via expo-notifications. Native only; every function is a
// safe no-op on web. Scheduled notification ids are tracked per starter so they
// can be rescheduled or cancelled.
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { storage } from './storage';

const MAP_KEY = 'doughmate.notif.v1';
const isNative = Platform.OS !== 'web';

if (isNative) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
}

type IdMap = Record<string, string>;

function loadMap(): IdMap {
  try {
    return JSON.parse(storage.getItem(MAP_KEY) ?? '{}') as IdMap;
  } catch {
    return {};
  }
}

function saveMap(map: IdMap): void {
  storage.setItem(MAP_KEY, JSON.stringify(map));
}

/** Ask for notification permission. Returns whether it is granted. */
export async function ensureNotificationPermission(): Promise<boolean> {
  if (!isNative) {
    return false;
  }
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) {
    return true;
  }
  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

export async function cancelFeedReminder(starterId: string): Promise<void> {
  if (!isNative) {
    return;
  }
  const map = loadMap();
  const id = map[starterId];
  if (id) {
    await Notifications.cancelScheduledNotificationAsync(id);
    delete map[starterId];
    saveMap(map);
  }
}

export interface FeedReminder {
  id: string;
  title: string;
  body: string;
  fireAtMs: number;
}

async function scheduleFeedReminder(reminder: FeedReminder): Promise<void> {
  if (!isNative) {
    return;
  }
  await cancelFeedReminder(reminder.id);
  // Nothing to schedule if the feed time is already past.
  if (reminder.fireAtMs <= Date.now()) {
    return;
  }
  const notificationId = await Notifications.scheduleNotificationAsync({
    content: { title: reminder.title, body: reminder.body },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: new Date(reminder.fireAtMs),
    },
  });
  const map = loadMap();
  map[reminder.id] = notificationId;
  saveMap(map);
}

/** Make the scheduled reminders match exactly the given set. */
export async function reconcileFeedReminders(reminders: FeedReminder[]): Promise<void> {
  if (!isNative) {
    return;
  }
  const wanted = new Set(reminders.map((r) => r.id));
  for (const starterId of Object.keys(loadMap())) {
    if (!wanted.has(starterId)) {
      await cancelFeedReminder(starterId);
    }
  }
  for (const reminder of reminders) {
    await scheduleFeedReminder(reminder);
  }
}

export async function cancelAllFeedReminders(): Promise<void> {
  if (!isNative) {
    return;
  }
  for (const starterId of Object.keys(loadMap())) {
    await cancelFeedReminder(starterId);
  }
}
