import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { migrateSettingsV1ToV2 } from "./appStorage";

describe("AppSettings migration", () => {
  it("should migrate v0.1.12 single-child to v0.1.13 multi-child schema", () => {
    const oldSettings = {
      childName: "Alex",
      parentLabel: "Mom",
      notificationTime: "18:00",
      parentPin: "1234",
      isPremium: false,
      tileColorId: "lavender",
      appMode: "singleDevice"
    };

    const migrated = migrateSettingsV1ToV2(oldSettings as any);

    assert.equal(migrated.children.length, 1);
    assert.equal(migrated.children[0].name, "Alex");
    assert.equal(migrated.children[0].settings.parentLabel, "Mom");
    assert.equal(migrated.globalSettings.pin, "1234");
  });

  it("should handle missing childName gracefully", () => {
    const oldSettings = {
      parentLabel: "Parent",
      notificationTime: "18:00",
      parentPin: "1234",
      isPremium: false,
      tileColorId: "lavender",
      appMode: "singleDevice"
    };

    const migrated = migrateSettingsV1ToV2(oldSettings as any);
    assert.equal(migrated.children[0].name, "Child"); // fallback
  });
});
