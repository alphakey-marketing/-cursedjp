#!/usr/bin/env node
/**
 * generateChapterData.mjs — generates skeleton data files for a new chapter.
 *
 * Usage:
 *   node scripts/generateChapterData.mjs --id chapter_3 --name "Chapter 3: Mountain of Spirits" --number 3
 *
 * Produces (in public/data/generated/):
 *   chapter_3_region.json
 *   chapter_3_enemies.json
 *   chapter_3_bosses.json
 *   chapter_3_runes.json
 *   chapter_3_lootTable.json
 *   chapter_3_chapter_entry.json  (chapter metadata to merge into chapters.json)
 *
 * After generating, review and merge entries into the main JSON files.
 */

import { writeFileSync, mkdirSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_DIR = join(__dirname, '../public/data/generated')

// ── Parse CLI args ────────────────────────────────────────────────────────────
const args = process.argv.slice(2)
function getArg(name) {
  const idx = args.indexOf(`--${name}`)
  return idx !== -1 ? args[idx + 1] : null
}

const chapterId = getArg('id') ?? 'chapter_3'
const chapterName = getArg('name') ?? `New Chapter`
const chapterNumber = parseInt(getArg('number') ?? '3', 10)
const regionId = `region_${chapterId}`
const prefix = chapterId

if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true })

// ── Region skeleton ────────────────────────────────────────────────────────────
const region = {
  id: regionId,
  name: chapterName.replace(/^Chapter \d+:\s*/, ''),
  chapterId,
  isLocked: true,
  unlockCondition: `chapter_${chapterNumber - 1}_complete`,
  nodes: [
    {
      id: `${prefix}_node_entry`,
      label: 'Chapter Entry',
      type: 'EnemyCamp',
      position: { x: 100, y: 300 },
      connectedNodeIds: [`${prefix}_node_camp_1`],
      recommendedPower: 300,
      enemyIds: [`${prefix}_enemy_common_1`],
    },
    {
      id: `${prefix}_node_camp_1`,
      label: 'First Camp',
      type: 'EnemyCamp',
      position: { x: 220, y: 240 },
      connectedNodeIds: [`${prefix}_node_entry`, `${prefix}_node_shrine_1`, `${prefix}_node_elite_1`],
      recommendedPower: 320,
      enemyIds: [`${prefix}_enemy_common_1`, `${prefix}_enemy_common_2`],
    },
    {
      id: `${prefix}_node_shrine_1`,
      label: 'Ancient Shrine',
      type: 'Shrine',
      position: { x: 300, y: 160 },
      connectedNodeIds: [`${prefix}_node_camp_1`],
      recommendedPower: 0,
      enemyIds: [],
    },
    {
      id: `${prefix}_node_elite_1`,
      label: 'Elite Patrol',
      type: 'EnemyCamp',
      position: { x: 360, y: 280 },
      connectedNodeIds: [`${prefix}_node_camp_1`, `${prefix}_node_miniboss`],
      recommendedPower: 370,
      enemyIds: [`${prefix}_enemy_elite_1`],
    },
    {
      id: `${prefix}_node_miniboss`,
      label: 'Miniboss Lair',
      type: 'Miniboss',
      position: { x: 460, y: 220 },
      connectedNodeIds: [`${prefix}_node_elite_1`, `${prefix}_node_boss_arena`],
      recommendedPower: 420,
      enemyIds: [`${prefix}_miniboss`],
    },
    {
      id: `${prefix}_node_boss_arena`,
      label: 'Boss Arena',
      type: 'BossArena',
      position: { x: 560, y: 300 },
      connectedNodeIds: [`${prefix}_node_miniboss`],
      recommendedPower: 500,
      enemyIds: [],
      bossId: `${prefix}_boss`,
    },
  ],
}

// ── Enemies skeleton ───────────────────────────────────────────────────────────
const enemies = [
  {
    id: `${prefix}_enemy_common_1`,
    name: 'TODO: Common Enemy 1 Name',
    tier: 'Common',
    level: 18 + chapterNumber * 3,
    stats: {
      maxHP: 280,
      armor: 0.20,
      dodgeChance: 0.06,
      elementalResistances: { Physical: 0, Fire: 0, Cold: 0, Lightning: 0, Poison: 0, Holy: 0, Shadow: 0, Chaos: 0 },
    },
    attacks: [
      {
        id: 'basic_strike',
        name: 'Strike',
        damageMin: 22,
        damageMax: 35,
        cooldown: 2.0,
        damageType: 'Physical',
        deliveryMode: 'Strike',
      },
    ],
    isBoss: false,
    expReward: 60,
    dropTableId: `drop_${prefix}_common`,
    signatureDrops: [],
  },
  {
    id: `${prefix}_enemy_common_2`,
    name: 'TODO: Common Enemy 2 Name',
    tier: 'Common',
    level: 18 + chapterNumber * 3,
    stats: {
      maxHP: 220,
      armor: 0.12,
      dodgeChance: 0.10,
      elementalResistances: { Physical: 0, Fire: 0, Cold: 0, Lightning: 0, Poison: 0, Holy: 0, Shadow: 0, Chaos: 0 },
    },
    attacks: [
      {
        id: 'ranged_shot',
        name: 'Ranged Shot',
        damageMin: 18,
        damageMax: 30,
        cooldown: 2.5,
        damageType: 'Physical',
        deliveryMode: 'Projectile',
      },
    ],
    isBoss: false,
    expReward: 55,
    dropTableId: `drop_${prefix}_common`,
    signatureDrops: [],
  },
  {
    id: `${prefix}_enemy_elite_1`,
    name: 'TODO: Elite Enemy Name',
    tier: 'Elite',
    level: 22 + chapterNumber * 3,
    stats: {
      maxHP: 600,
      armor: 0.30,
      dodgeChance: 0.08,
      elementalResistances: { Physical: 0, Fire: 0.15, Cold: 0.15, Lightning: 0, Poison: 0.10, Holy: 0, Shadow: 0, Chaos: 0 },
    },
    attacks: [
      {
        id: 'heavy_smash',
        name: 'Heavy Smash',
        damageMin: 40,
        damageMax: 65,
        cooldown: 3.5,
        damageType: 'Physical',
        deliveryMode: 'Strike',
      },
    ],
    isBoss: false,
    expReward: 140,
    dropTableId: `drop_${prefix}_elite`,
    signatureDrops: [],
  },
  {
    id: `${prefix}_miniboss`,
    name: 'TODO: Miniboss Name',
    tier: 'Miniboss',
    level: 26 + chapterNumber * 3,
    stats: {
      maxHP: 2400,
      armor: 0.35,
      dodgeChance: 0.05,
      elementalResistances: { Physical: 0.10, Fire: 0.20, Cold: 0.20, Lightning: 0, Poison: 0.20, Holy: 0, Shadow: 0, Chaos: 0 },
    },
    attacks: [
      {
        id: 'miniboss_slam',
        name: 'Slam',
        damageMin: 70,
        damageMax: 100,
        cooldown: 3.0,
        damageType: 'Physical',
        deliveryMode: 'AoE',
      },
    ],
    isBoss: false,
    expReward: 350,
    dropTableId: `drop_${prefix}_elite`,
    signatureDrops: [],
  },
]

// ── Boss skeleton ──────────────────────────────────────────────────────────────
const bosses = [
  {
    id: `${prefix}_boss`,
    name: 'TODO: Boss Name',
    title: 'TODO: Boss Title',
    lore: 'TODO: Write boss lore here.',
    chapterId,
    level: 30 + chapterNumber * 3,
    stats: {
      maxHP: 8000,
      armor: 0.40,
      dodgeChance: 0.08,
      elementalResistances: { Physical: 0.15, Fire: 0.30, Cold: 0.10, Lightning: 0.10, Poison: 0.35, Holy: 0, Shadow: 0, Chaos: 0 },
    },
    phases: [
      {
        id: 'phase_1',
        hpThreshold: 1.0,
        label: 'Phase 1',
        attacks: [
          {
            id: 'boss_strike',
            name: 'Boss Strike',
            damageMin: 80,
            damageMax: 130,
            cooldown: 2.5,
            damageType: 'Physical',
            deliveryMode: 'Strike',
          },
        ],
        telegraphs: [],
      },
      {
        id: 'phase_2',
        hpThreshold: 0.5,
        label: 'Phase 2 — Enraged',
        attacks: [
          {
            id: 'boss_rage_strike',
            name: 'Enraged Strike',
            damageMin: 110,
            damageMax: 175,
            cooldown: 2.0,
            damageType: 'Physical',
            deliveryMode: 'Strike',
          },
          {
            id: 'boss_aoe',
            name: 'TODO: Signature AoE',
            damageMin: 60,
            damageMax: 90,
            cooldown: 5.0,
            damageType: 'TODO',
            deliveryMode: 'AoE',
          },
        ],
        telegraphs: [
          {
            id: 'telegraph_rage',
            eventType: 'TELEGRAPH_WARNING',
            warningDurationMs: 1200,
            followUpAttackId: 'boss_aoe',
          },
        ],
      },
    ],
    isBoss: true,
    expReward: 1200,
    dropTableId: `drop_${prefix}_boss`,
    signatureDrops: [
      {
        runeId: `skill_rune_${prefix}_signature`,
        dropChance: 0.08,
        isGuaranteedFirstKill: true,
      },
    ],
  },
]

// ── Runes skeleton ─────────────────────────────────────────────────────────────
const runes = [
  {
    id: `skill_rune_${prefix}_signature`,
    name: 'TODO: Signature Skill Rune Name',
    category: 'Skill',
    damageType: 'TODO',
    deliveryMode: 'TODO',
    skillCoef: 1.5,
    baseCooldown: 4,
    resourceCost: 28,
    maxSupportLinks: 3,
    tags: ['TODO_TAG'],
    description: 'TODO: Write skill rune description.',
    iconId: `icon_${prefix}_signature`,
    dropSourceIds: [`${prefix}_boss`],
  },
  {
    id: `link_rune_${prefix}_new`,
    name: 'TODO: Link Rune Name',
    category: 'Link',
    effectType: 'AddedDamage',
    modifiesTag: 'Strike',
    params: { addedDamageMin: 20, addedDamageMax: 35 },
    dropSourceIds: [regionId],
    iconId: `icon_${prefix}_link`,
    description: 'TODO: Write link rune description.',
  },
]

// ── Loot table skeleton ────────────────────────────────────────────────────────
const lootTable = {
  [`drop_${prefix}_common`]: {
    itemChance: 0.28,
    goldMin: 25,
    goldMax: 70,
    materials: [`TODO_${prefix.toUpperCase()}_MATERIAL_1`, `TODO_${prefix.toUpperCase()}_MATERIAL_2`],
  },
  [`drop_${prefix}_elite`]: {
    itemChance: 0.45,
    goldMin: 70,
    goldMax: 160,
    materials: [`TODO_${prefix.toUpperCase()}_RARE_MATERIAL`],
  },
  [`drop_${prefix}_boss`]: {
    itemChance: 1.0,
    goldMin: 300,
    goldMax: 600,
    materials: [`TODO_${prefix.toUpperCase()}_BOSS_MATERIAL`],
  },
}

// ── Chapter metadata skeleton ──────────────────────────────────────────────────
const chapterEntry = {
  id: chapterId,
  title: chapterName,
  number: chapterNumber,
  regionId,
  chapterBossId: `${prefix}_boss`,
  unlockCondition: `chapter_${chapterNumber - 1}_complete`,
  dialogues: [
    {
      id: `${prefix}_intro`,
      triggerCondition: 'ChapterStart',
      scenes: [
        {
          speaker: 'Narrator',
          lines: [`TODO: Write chapter ${chapterNumber} introduction text.`],
          backgroundId: `bg_${prefix}_intro`,
        },
      ],
    },
    {
      id: `${prefix}_boss_kill`,
      triggerCondition: 'BossKill',
      scenes: [
        {
          speaker: 'Narrator',
          lines: [`TODO: Write chapter ${chapterNumber} boss kill dialogue.`],
          backgroundId: `bg_${prefix}_victory`,
        },
      ],
    },
  ],
}

// ── Write files ────────────────────────────────────────────────────────────────
function writeJSON(filename, data) {
  const outPath = join(OUT_DIR, filename)
  writeFileSync(outPath, JSON.stringify(data, null, 2), 'utf8')
  console.log(`  ✓ Written: ${outPath}`)
}

console.log(`\nGenerating skeleton data for: ${chapterName} (${chapterId})\n`)
writeJSON(`${prefix}_region.json`, region)
writeJSON(`${prefix}_enemies.json`, enemies)
writeJSON(`${prefix}_bosses.json`, bosses)
writeJSON(`${prefix}_runes.json`, runes)
writeJSON(`${prefix}_lootTable.json`, lootTable)
writeJSON(`${prefix}_chapter_entry.json`, chapterEntry)

console.log(`\n✅  Done! Review files in public/data/generated/ and merge into main data files.`)
console.log(`   Search for "TODO" in generated files to fill in content.\n`)
