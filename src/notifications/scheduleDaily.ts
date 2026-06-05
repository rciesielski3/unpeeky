import * as Notifications from "expo-notifications";

import { strings } from "../i18n/strings";

type ScheduleDailyResult = "scheduled" | "denied" | "invalid" | "error";

type ParsedTime = {
  hour: number;
  minute: number;
};

const DAILY_REMINDER_IDENTIFIER = "daily-reminder";

export async function scheduleDaily(notificationTime: string): Promise<ScheduleDailyResult> {
  const parsedTime = parseNotificationTime(notificationTime);

  if (!parsedTime) {
    return "invalid";
  }

  try {
    const permission = await Notifications.requestPermissionsAsync();

    if (permission.status !== "granted") {
      return "denied";
    }

    await Notifications.scheduleNotificationAsync({
      identifier: DAILY_REMINDER_IDENTIFIER,
      content: {
        body: strings.notifications.body,
        sound: true,
        title: strings.notifications.title
      },
      trigger: {
        hour: parsedTime.hour,
        minute: parsedTime.minute,
        repeats: true
      }
    });

    return "scheduled";
  } catch {
    return "error";
  }
}

export async function cancelDailyReminder(): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(DAILY_REMINDER_IDENTIFIER);
  } catch {
    // Notification cancellation is best-effort; settings should still reflect the user's choice.
  }
}

export function parseNotificationTime(notificationTime: string): ParsedTime | null {
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(notificationTime);

  if (!match) {
    return null;
  }

  const [, hour, minute] = match;

  if (!hour || !minute) {
    return null;
  }

  return {
    hour: Number(hour),
    minute: Number(minute)
  };
}
