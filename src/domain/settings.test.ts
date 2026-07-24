import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { DEFAULT_APP_SETTINGS, normalizeSettings, resolveReminderTimeForActiveChild } from "./goal";
import type { AppSettings } from "./goal";
import { strings } from "../i18n/strings";

describe("app settings defaults", () => {
  it("keeps daily reminders disabled for a fresh install", () => {
    const settings = normalizeSettings(null);

    assert.equal(DEFAULT_APP_SETTINGS.globalSettings.isReminderEnabled, false);
    assert.equal(settings.globalSettings.isReminderEnabled, false);
    assert.equal(settings.children[0]!.settings.notificationTime, "18:00");
  });

  it("keeps existing reminder preference when stored settings are normalized", () => {
    assert.equal(
      normalizeSettings({
        children: [
          { id: "1", name: "Child", settings: { parentLabel: "P", notificationTime: "19:30", tileColorId: "lavender" } }
        ],
        globalSettings: { isReminderEnabled: true, pin: "", isPremium: false, exportData: [], appMode: null }
      }).globalSettings.isReminderEnabled,
      true
    );
    assert.equal(
      normalizeSettings({
        children: [
          { id: "1", name: "Child", settings: { parentLabel: "P", notificationTime: "19:30", tileColorId: "lavender" } }
        ],
        globalSettings: { isReminderEnabled: false, pin: "", isPremium: false, exportData: [], appMode: null }
      }).globalSettings.isReminderEnabled,
      false
    );
    assert.equal(
      normalizeSettings({
        children: [
          { id: "1", name: "Child", settings: { parentLabel: "P", notificationTime: "19:30", tileColorId: "lavender" } }
        ],
        globalSettings: { pin: "", isPremium: false, exportData: [], appMode: null }
      }).globalSettings.isReminderEnabled,
      false
    );
  });

  it("defaults the parent greeting to Rodzicu and supports custom labels", () => {
    const settings = normalizeSettings(null);

    assert.equal(settings.children[0]!.settings.parentLabel, "Rodzicu");
    assert.equal(strings.goals.greeting(settings.children[0]!.settings.parentLabel), "Cześć, Rodzicu! 👋");
    assert.equal(strings.goals.greeting("Babcia"), "Cześć, Babcia! 👋");
  });

  it("sanitizes stored parent labels", () => {
    assert.equal(
      normalizeSettings({
        children: [
          {
            id: "1",
            name: "Child",
            settings: { parentLabel: "  Tata  ", notificationTime: "18:00", tileColorId: "lavender" }
          }
        ],
        globalSettings: { pin: "", isPremium: false, exportData: [], appMode: null }
      }).children[0]!.settings.parentLabel,
      "Tata"
    );
    assert.equal(
      normalizeSettings({
        children: [
          { id: "1", name: "Child", settings: { parentLabel: "", notificationTime: "18:00", tileColorId: "lavender" } }
        ],
        globalSettings: { pin: "", isPremium: false, exportData: [], appMode: null }
      }).children[0]!.settings.parentLabel,
      "Rodzicu"
    );
  });

  it("explains where to find the parent PIN without exposing it", () => {
    assert.equal(strings.approveTask.pinSettingsHint, "PIN znajdziesz w Opcjach.");
    assert.equal(strings.approveTask.pinSettingsHint.includes("1234"), false);
  });
});

describe("per-child reminder scheduling", () => {
  const settings: AppSettings = {
    children: [
      { id: "c1", name: "Alex", settings: { parentLabel: "Mama", notificationTime: "08:15", tileColorId: "lavender" } },
      { id: "c2", name: "Jordan", settings: { parentLabel: "Tata", notificationTime: "19:45", tileColorId: "mint" } }
    ],
    globalSettings: { pin: "1234", isPremium: false, exportData: [], appMode: "singleDevice", isReminderEnabled: true }
  };

  it("uses the active child's notification time when scheduling", () => {
    assert.equal(resolveReminderTimeForActiveChild(settings, "c1"), "08:15");
    assert.equal(resolveReminderTimeForActiveChild(settings, "c2"), "19:45");
  });

  it("reschedules to the new active child's time when the active child switches", () => {
    const before = resolveReminderTimeForActiveChild(settings, "c1");
    const after = resolveReminderTimeForActiveChild(settings, "c2");

    assert.equal(before, "08:15");
    assert.equal(after, "19:45");
    assert.notEqual(before, after);
  });

  it("falls back to the first child when the active id is unknown", () => {
    assert.equal(resolveReminderTimeForActiveChild(settings, "does-not-exist"), "08:15");
  });

  it("returns null (cancel reminder) when reminders are disabled", () => {
    const disabled: AppSettings = {
      ...settings,
      globalSettings: { ...settings.globalSettings, isReminderEnabled: false }
    };

    assert.equal(resolveReminderTimeForActiveChild(disabled, "c2"), null);
  });
});
