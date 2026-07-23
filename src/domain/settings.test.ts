import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { DEFAULT_APP_SETTINGS, normalizeSettings } from "./goal";
import { strings } from "../i18n/strings";

describe("app settings defaults", () => {
  it("keeps daily reminders disabled for a fresh install", () => {
    const settings = normalizeSettings(null);

    assert.equal(DEFAULT_APP_SETTINGS.globalSettings.isReminderEnabled, false);
    assert.equal(settings.globalSettings.isReminderEnabled, false);
    assert.equal(settings.children[0].settings.notificationTime, "18:00");
  });

  it("keeps existing reminder preference when stored settings are normalized", () => {
    assert.equal(normalizeSettings({ children: [{ id: "1", name: "Child", settings: { parentLabel: "P", notificationTime: "19:30", tileColorId: "lavender" } }], globalSettings: { isReminderEnabled: true, pin: "", isPremium: false, exportData: [], appMode: null } }).globalSettings.isReminderEnabled, true);
    assert.equal(normalizeSettings({ children: [{ id: "1", name: "Child", settings: { parentLabel: "P", notificationTime: "19:30", tileColorId: "lavender" } }], globalSettings: { isReminderEnabled: false, pin: "", isPremium: false, exportData: [], appMode: null } }).globalSettings.isReminderEnabled, false);
    assert.equal(normalizeSettings({ children: [{ id: "1", name: "Child", settings: { parentLabel: "P", notificationTime: "19:30", tileColorId: "lavender" } }], globalSettings: { pin: "", isPremium: false, exportData: [], appMode: null } }).globalSettings.isReminderEnabled, false);
  });

  it("defaults the parent greeting to Rodzicu and supports custom labels", () => {
    const settings = normalizeSettings(null);

    assert.equal(settings.children[0].settings.parentLabel, "Rodzicu");
    assert.equal(strings.goals.greeting(settings.children[0].settings.parentLabel), "Cześć, Rodzicu! 👋");
    assert.equal(strings.goals.greeting("Babcia"), "Cześć, Babcia! 👋");
  });

  it("sanitizes stored parent labels", () => {
    assert.equal(normalizeSettings({ children: [{ id: "1", name: "Child", settings: { parentLabel: "  Tata  ", notificationTime: "18:00", tileColorId: "lavender" } }], globalSettings: { pin: "", isPremium: false, exportData: [], appMode: null } }).children[0].settings.parentLabel, "Tata");
    assert.equal(normalizeSettings({ children: [{ id: "1", name: "Child", settings: { parentLabel: "", notificationTime: "18:00", tileColorId: "lavender" } }], globalSettings: { pin: "", isPremium: false, exportData: [], appMode: null } }).children[0].settings.parentLabel, "Rodzicu");
  });

  it("explains where to find the parent PIN without exposing it", () => {
    assert.equal(strings.approveTask.pinSettingsHint, "PIN znajdziesz w Opcjach.");
    assert.equal(strings.approveTask.pinSettingsHint.includes("1234"), false);
  });
});
