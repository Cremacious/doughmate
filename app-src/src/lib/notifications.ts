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

// Live fermentation timer completion notifications. Tracked under a separate
// map key so they never collide with the feed reminder ids above.
const TIMER_MAP_KEY = 'doughmate.notif.timers.v1';

function loadTimerMap(): IdMap {
  try {
    return JSON.parse(storage.getItem(TIMER_MAP_KEY) ?? '{}') as IdMap;
  } catch {
    return {};
  }
}

function saveTimerMap(map: IdMap): void {
  storage.setItem(TIMER_MAP_KEY, JSON.stringify(map));
}

export async function cancelTimerNotification(id: string): Promise<void> {
  if (!isNative) {
    return;
  }
  const map = loadTimerMap();
  const notificationId = map[id];
  if (notificationId) {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
    delete map[id];
    saveTimerMap(map);
  }
}

export async function scheduleTimerNotification(
  id: string,
  title: string,
  body: string,
  fireAt: number
): Promise<void> {
  if (!isNative) {
    return;
  }
  await cancelTimerNotification(id);
  // Nothing to schedule if the fire time is already past.
  if (fireAt <= Date.now()) {
    return;
  }
  const notificationId = await Notifications.scheduleNotificationAsync({
    content: { title, body },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: new Date(fireAt),
    },
  });
  const map = loadTimerMap();
  map[id] = notificationId;
  saveTimerMap(map);
}

export async function cancelAllTimerNotifications(): Promise<void> {
  if (!isNative) {
    return;
  }
  for (const id of Object.keys(loadTimerMap())) {
    await cancelTimerNotification(id);
  }
}

// Bake plan step reminders. Tracked under a separate map key so they never
// collide with the feed reminder or timer notification ids above.
const BAKEPLAN_MAP_KEY = 'doughmate.notif.bakeplan.v1';

function loadBakePlanMap(): IdMap {
  try {
    return JSON.parse(storage.getItem(BAKEPLAN_MAP_KEY) ?? '{}') as IdMap;
  } catch {
    return {};
  }
}

function saveBakePlanMap(map: IdMap): void {
  storage.setItem(BAKEPLAN_MAP_KEY, JSON.stringify(map));
}

export async function cancelBakePlanNotification(id: string): Promise<void> {
  if (!isNative) {
    return;
  }
  const map = loadBakePlanMap();
  const notificationId = map[id];
  if (notificationId) {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
    delete map[id];
    saveBakePlanMap(map);
  }
}

export async function scheduleBakePlanNotification(
  id: string,
  title: string,
  body: string,
  fireAt: number
): Promise<void> {
  if (!isNative) {
    return;
  }
  await cancelBakePlanNotification(id);
  // Nothing to schedule if the fire time is already past.
  if (fireAt <= Date.now()) {
    return;
  }
  const notificationId = await Notifications.scheduleNotificationAsync({
    content: { title, body },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: new Date(fireAt),
    },
  });
  const map = loadBakePlanMap();
  map[id] = notificationId;
  saveBakePlanMap(map);
}

export async function cancelAllBakePlanNotifications(): Promise<void> {
  if (!isNative) {
    return;
  }
  for (const id of Object.keys(loadBakePlanMap())) {
    await cancelBakePlanNotification(id);
  }
}
