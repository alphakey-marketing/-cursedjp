# Content Authoring Guide

This guide explains how to add new content to the Cursed Japan ARPG data pipeline.  
All data lives in `client/public/data/` as JSON files. Run `npm run validate:data` after editing to check for errors.

---

## How to Add a New Rune

Runes are defined in `client/public/data/runes.json`.

### Skill Rune

```json
{
  "id": "skill_rune_my_skill",
  "name": "My Skill",
  "category": "Skill",
  "damageType": "Physical",
  "deliveryMode": "Strike",
  "skillCoef": 1.3,
  "baseCooldown": 4,
  "resourceCost": 20,
  "maxSupportLinks": 3,
  "weaponFamilyRestriction": ["Katana"],
  "tags": ["Strike", "Melee", "SingleTarget"],
  "description": "Describe what it does.",
  "iconId": "icon_my_skill",
  "dropSourceIds": ["region_edo_streets"]
}
```

**Required fields:** `id`, `name`, `category`, `damageType`, `deliveryMode`, `skillCoef`, `baseCooldown`, `resourceCost`, `maxSupportLinks`, `tags`, `description`, `iconId`, `dropSourceIds`

### Link / Support Rune

```json
{
  "id": "link_rune_my_link",
  "name": "My Link",
  "category": "Link",
  "effectType": "AddedDamage",
  "modifiesTag": "Strike",
  "params": { "addedFireDamageMin": 10, "addedFireDamageMax": 18 },
  "dropSourceIds": ["region_edo_streets"],
  "iconId": "icon_my_link",
  "description": "Describe what it does."
}
```

**Valid `effectType` values:** `AddedDamage`, `IncreasedAoE`, `AddedDoT`, `ConvertDamage`, `OnHitEffect`, `CooldownReduction`, `ResourceLeech`, `ExtraProjectile`, `BurstMultiplier`, `ChainModifier`, `ProjectileModifier`, `BarrierInteraction`, `StatusSpecialization`

**`modifiesTag`** must match a tag on the target skill rune (`Strike`, `Projectile`, `AoE`, etc.).

---

## How to Add a New Boss

Bosses are defined in `client/public/data/bosses.json`.

```json
{
  "id": "boss_my_boss",
  "name": "My Boss",
  "tier": "Boss",
  "hp": 5000,
  "expReward": 400,
  "dropTableId": "loot_my_boss",
  "lootTableId": "loot_my_boss",
  "signatureDrops": [
    {
      "runeId": "skill_rune_my_skill",
      "dropChance": 0.08,
      "isGuaranteedFirstKill": true
    }
  ],
  "phases": [
    { "hpThreshold": 0.5, "abilityId": "phase_2_enrage" }
  ],
  "resistances": { "Physical": 0.1, "Fire": 0.3 },
  "iconId": "icon_my_boss",
  "description": "A fearsome opponent.",
  "regionId": "region_my_region"
}
```

**Required fields:** `id`, `name`, `tier`, `hp`, `expReward`, `dropTableId`

---

## How to Define a Loot Table

Loot tables are referenced by `dropTableId` in enemies and bosses. They are currently defined inline in `client/src/engine/items/dropResolver.ts` (`DROP_TABLE` constant).

To add a new table:

```ts
drop_my_enemy: {
  itemChance: 0.30,       // 0.0–1.0 probability of dropping an item
  goldMin: 20,
  goldMax: 60,
  materials: ['Iron Shard', 'Coarse Cloth'],
},
```

The `materials` array lists crafting material names that are always dropped (random quantity 1–4 each).

---

## How to Add a New Quest

Quests are defined in `client/public/data/quests.json`.

```json
{
  "id": "quest_my_quest",
  "title": "My Quest",
  "description": "Quest description shown in the quest log.",
  "type": "side",
  "status": "active",
  "objectives": [
    {
      "id": "obj_kill_something",
      "type": "kill_enemy",
      "description": "Defeat 5 enemies",
      "targetId": "enemy_ronin",
      "targetCount": 5,
      "currentCount": 0
    }
  ],
  "reward": {
    "gold": 200,
    "craftingMaterials": [{ "name": "Iron Shard", "qty": 3 }],
    "runeId": "link_rune_addedfire"
  },
  "unlockCondition": "chapter_1_complete"
}
```

**`type`:** `chapter` | `side` | `daily`  
**`status`:** `active` | `locked` | `completed`  
**`unlockCondition`:** omit for always-active quests; use `"<chapterId>_complete"` to gate on chapter completion.

**Objective types:** `kill_enemy`, `kill_boss`, `acquire_item`, `equip_rune`, `clear_node`, `reach_level`

---

## Required JSON Fields Reference

| File | Required Fields per Entry |
|------|--------------------------|
| `regions.json` | `id`, `name`, `tier`, `enemies` |
| `enemies.json` | `id`, `name`, `tier`, `dropTableId` |
| `bosses.json` | `id`, `name`, `dropTableId` |
| `runes.json` | `id`, `name`, `category`, `description`, `iconId` |
| `passiveNodes.json` | `id`, `label`, `type`, `position`, `connectedNodeIds`, `cost` |
| `quests.json` | `id`, `title`, `description`, `type`, `status`, `objectives`, `reward` |

Run `npm run validate:data` from the `client/` directory to check all files.

---

## How to Add Item Affixes

Affixes are defined in `client/public/data/affixes.json`. They describe stat bonuses that can roll on gear.

```json
{
  "id": "affix_my_stat",
  "label": "+% My Stat",
  "bucket": "Additive",
  "statKey": "myStat",
  "minValue": 0.05,
  "maxValue": 0.30,
  "allowedGrades": ["Magic", "Rare", "Legendary", "Holy"],
  "allowedSlots": ["Weapon", "Amulet"],
  "archetype": "crit"
}
```

**`bucket`:** `Additive` | `Multiplicative` | `Utility` | `Exclusive`  
**`archetype`:** optional tag used for build-diversity hints (`crit`, `bleed`, `elemental_conversion`, `tank`)

---

## Generating a New Chapter Skeleton

Use the chapter generator script to scaffold all data files for a new chapter at once:

```bash
cd client
npm run generate:chapter -- --id chapter_3 --name "Chapter 3: Mountain of Spirits" --number 3
```

Generated files appear in `public/data/generated/`. Review each file, fill in all `TODO` placeholders, then merge the entries into the main JSON files (`regions.json`, `enemies.json`, `bosses.json`, `runes.json`, `lootTables.json`, `chapters.json`).

After merging, run:
```bash
npm run validate:data
```

---

## Save Versioning

If you change the structure of the player save state, bump `CURRENT_SAVE_VERSION` in  
`client/src/engine/save/saveMigration.ts` and add a migration function to the `MIGRATIONS` map.

This ensures players with old saves are migrated gracefully on next load.
