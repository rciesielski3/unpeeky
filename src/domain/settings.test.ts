import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { DEFAULT_APP_SETTINGS, normalizeSettings } from "./goal";
import { strings } from "../i18n/strings";

describe("app settings defaults", () => {
  it("keeps daily reminders disabled for a fresh install", () => {
    const settings = normalizeSettings(null);

    assert.equal(DEFAULT_APP_SETTINGS.isReminderEnabled, false);
    assert.equal(settings.isReminderEnabled, false);
    assert.equal(settings.notificationTime, "18:00");
  });

  it("keeps existing reminder preference when stored settings are normalized", () => {
    assert.equal(normalizeSettings({ isReminderEnabled: true, notificationTime: "19:30" }).isReminderEnabled, true);
    assert.equal(normalizeSettings({ isReminderEnabled: false, notificationTime: "19:30" }).isReminderEnabled, false);
    assert.equal(normalizeSettings({ notificationTime: "19:30" }).isReminderEnabled, false);
  });

  it("defaults the parent greeting to Rodzicu and supports custom labels", () => {
    const settings = normalizeSettings(null);

    assert.equal(settings.parentLabel, "Rodzicu");
    assert.equal(strings.goals.greeting(settings.parentLabel), "Cześć, Rodzicu! 👋");
    assert.equal(strings.goals.greeting("Babcia"), "Cześć, Babcia! 👋");
  });

  it("sanitizes stored parent labels", () => {
    assert.equal(normalizeSettings({ parentLabel: "  Tata  " }).parentLabel, "Tata");
    assert.equal(normalizeSettings({ parentLabel: "" }).parentLabel, "Rodzicu");
  });

  it("explains where to find the parent PIN without exposing it", () => {
    assert.equal(strings.approveTask.pinSettingsHint, "PIN znajdziesz w Opcjach.");
    assert.equal(strings.approveTask.pinSettingsHint.includes("1234"), false);
  });
});
