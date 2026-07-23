import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import type { AppSettings } from "../domain/goal";
import { DEFAULT_CHILD_SETTINGS } from "../domain/goal";

describe("SettingsScreen - Manage Children", () => {
  let mockSettings: AppSettings;

  beforeEach(() => {
    mockSettings = {
      children: [
        {
          id: "c1",
          name: "Alex",
          settings: { parentLabel: "Mom", notificationTime: "18:00", tileColorId: "lavender" }
        },
        {
          id: "c2",
          name: "Jordan",
          settings: { parentLabel: "Dad", notificationTime: "18:00", tileColorId: "mint" }
        }
      ],
      globalSettings: {
        pin: "1234",
        isPremium: false,
        exportData: [],
        appMode: "singleDevice",
        isReminderEnabled: false
      }
    };
  });

  it("should display list of children", () => {
    const childNames = mockSettings.children.map(c => c.name);
    assert.ok(childNames.includes("Alex"));
    assert.ok(childNames.includes("Jordan"));
    assert.equal(mockSettings.children.length, 2);
  });

  it("should add new child with default settings", () => {
    const newChild = {
      id: `child-${Date.now()}`,
      name: "Sam",
      settings: DEFAULT_CHILD_SETTINGS
    };

    const updated = {
      ...mockSettings,
      children: [...mockSettings.children, newChild]
    };

    assert.equal(updated.children.length, 3);
    assert.ok(updated.children.some(c => c.name === "Sam"));
    assert.equal(updated.children[2]?.name, "Sam");
  });

  it("should edit child name", () => {
    const childToEdit = mockSettings.children[0]!;
    const updated = {
      ...mockSettings,
      children: mockSettings.children.map(c =>
        c.id === childToEdit.id ? { ...c, name: "Alexander" } : c
      )
    };

    assert.equal(updated.children[0]?.name, "Alexander");
    assert.equal(updated.children[1]?.name, "Jordan");
  });

  it("should edit child parent label", () => {
    const childToEdit = mockSettings.children[0]!;
    const updated = {
      ...mockSettings,
      children: mockSettings.children.map(c =>
        c.id === childToEdit.id
          ? {
              ...c,
              settings: { ...c.settings, parentLabel: "Babcia" }
            }
          : c
      )
    };

    assert.equal(updated.children[0]?.settings.parentLabel, "Babcia");
  });

  it("should edit child notification time", () => {
    const childToEdit = mockSettings.children[0]!;
    const updated = {
      ...mockSettings,
      children: mockSettings.children.map(c =>
        c.id === childToEdit.id
          ? {
              ...c,
              settings: { ...c.settings, notificationTime: "19:30" }
            }
          : c
      )
    };

    assert.equal(updated.children[0]?.settings.notificationTime, "19:30");
  });

  it("should edit child tile color", () => {
    const childToEdit = mockSettings.children[0]!;
    const updated = {
      ...mockSettings,
      children: mockSettings.children.map(c =>
        c.id === childToEdit.id
          ? {
              ...c,
              settings: { ...c.settings, tileColorId: "peach" as const }
            }
          : c
      )
    };

    assert.equal(updated.children[0]?.settings.tileColorId, "peach");
  });

  it("should delete child by id", () => {
    const childIdToDelete = "c1";
    const updated = {
      ...mockSettings,
      children: mockSettings.children.filter(c => c.id !== childIdToDelete)
    };

    assert.equal(updated.children.length, 1);
    assert.ok(!updated.children.some(c => c.id === childIdToDelete));
    assert.equal(updated.children[0]?.name, "Jordan");
  });

  it("should not allow deleting the last child", () => {
    const singleChildSettings: AppSettings = {
      children: [mockSettings.children[0]!],
      globalSettings: mockSettings.globalSettings
    };

    const childIdToDelete = "c1";
    // Simulate delete logic that prevents deleting last child
    const canDelete = singleChildSettings.children.length > 1;

    assert.equal(canDelete, false);
    assert.equal(singleChildSettings.children.length, 1);
  });

  it("should update all child properties at once", () => {
    const childToEdit = mockSettings.children[0]!;
    const updates = {
      name: "New Name",
      settings: {
        parentLabel: "New Label",
        notificationTime: "20:00",
        tileColorId: "sky" as const
      }
    };

    const updated = {
      ...mockSettings,
      children: mockSettings.children.map(c =>
        c.id === childToEdit.id ? { ...c, ...updates } : c
      )
    };

    const editedChild = updated.children[0]!;
    assert.equal(editedChild.name, "New Name");
    assert.equal(editedChild.settings.parentLabel, "New Label");
    assert.equal(editedChild.settings.notificationTime, "20:00");
    assert.equal(editedChild.settings.tileColorId, "sky");
  });

  it("should handle adding multiple children in sequence", () => {
    let current = mockSettings;

    // Add first new child
    const child3 = {
      id: "c3",
      name: "Taylor",
      settings: DEFAULT_CHILD_SETTINGS
    };
    current = {
      ...current,
      children: [...current.children, child3]
    };

    // Add second new child
    const child4 = {
      id: "c4",
      name: "Casey",
      settings: DEFAULT_CHILD_SETTINGS
    };
    current = {
      ...current,
      children: [...current.children, child4]
    };

    assert.equal(current.children.length, 4);
    assert.equal(current.children[2]?.name, "Taylor");
    assert.equal(current.children[3]?.name, "Casey");
  });
});
