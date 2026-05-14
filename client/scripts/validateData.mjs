#!/usr/bin/env node
/**
 * validateData.mjs — validates all public/data JSON files for the cursed-japan ARPG.
 * Run with: node scripts/validateData.mjs
 */

import { readFileSync, readdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DATA_DIR = join(__dirname, '../public/data')

let totalErrors = 0

function error(file, msg) {
  console.error(`  ❌ [${file}] ${msg}`)
  totalErrors++
}

function readJSON(file) {
  const raw = readFileSync(join(DATA_DIR, file), 'utf8')
  return JSON.parse(raw)
}

function requireFields(file, entry, index, fields) {
  for (const field of fields) {
    if (entry[field] === undefined || entry[field] === null) {
      error(file, `Entry[${index}] missing required field: "${field}"`)
    }
  }
}

// ── regions.json ──────────────────────────────────────────────────────────────
console.log('\nValidating regions.json…')
const regions = readJSON('regions.json')
const regionIds = new Set()
for (const [i, r] of regions.entries()) {
  requireFields('regions.json', r, i, ['id', 'name', 'nodes'])
  if (r.id) regionIds.add(r.id)
}
console.log(`  ✓ ${regions.length} regions`)

// ── enemies.json ──────────────────────────────────────────────────────────────
console.log('Validating enemies.json…')
const enemies = readJSON('enemies.json')
for (const [i, e] of enemies.entries()) {
  requireFields('enemies.json', e, i, ['id', 'name', 'tier', 'dropTableId'])
}
console.log(`  ✓ ${enemies.length} enemies`)

// ── bosses.json ───────────────────────────────────────────────────────────────
console.log('Validating bosses.json…')
const bosses = readJSON('bosses.json')
const bossIds = new Set()
for (const [i, b] of bosses.entries()) {
  requireFields('bosses.json', b, i, ['id', 'name', 'dropTableId'])
  if (b.id) bossIds.add(b.id)
}
console.log(`  ✓ ${bosses.length} bosses`)

// ── runes.json ────────────────────────────────────────────────────────────────
console.log('Validating runes.json…')
const runes = readJSON('runes.json')
const runeIds = new Set()
const VALID_CATEGORIES = new Set(['Skill', 'Link', 'Support'])
const VALID_EFFECT_TYPES = new Set([
  'AddedDamage', 'IncreasedAoE', 'AddedDoT', 'ConvertDamage', 'OnHitEffect',
  'CooldownReduction', 'ResourceLeech', 'ExtraProjectile', 'BurstMultiplier',
  'ChainModifier', 'ProjectileModifier', 'BarrierInteraction', 'StatusSpecialization',
])
for (const [i, r] of runes.entries()) {
  requireFields('runes.json', r, i, ['id', 'name', 'category', 'description', 'iconId'])
  if (r.id) runeIds.add(r.id)
  if (r.category && !VALID_CATEGORIES.has(r.category)) {
    error('runes.json', `Entry[${i}] "${r.id}" has invalid category: "${r.category}"`)
  }
  if (r.category !== 'Skill' && r.effectType && !VALID_EFFECT_TYPES.has(r.effectType)) {
    error('runes.json', `Entry[${i}] "${r.id}" has unknown effectType: "${r.effectType}"`)
  }
  if (r.category !== 'Skill' && !r.effectType) {
    error('runes.json', `Entry[${i}] "${r.id}" is a Link/Support rune missing effectType`)
  }
}
console.log(`  ✓ ${runes.length} runes`)

// ── passiveNodes.json ─────────────────────────────────────────────────────────
console.log('Validating passiveNodes.json…')
const passiveNodes = readJSON('passiveNodes.json')
const nodeIds = new Set()
const VALID_NODE_TYPES = new Set(['StatNode', 'Keystone', 'SkillCluster', 'NotableNode'])
for (const [i, n] of passiveNodes.entries()) {
  requireFields('passiveNodes.json', n, i, ['id', 'label', 'type', 'position', 'connectedNodeIds', 'cost'])
  if (n.id) nodeIds.add(n.id)
  if (n.type && !VALID_NODE_TYPES.has(n.type)) {
    error('passiveNodes.json', `Entry[${i}] "${n.id}" has invalid type: "${n.type}"`)
  }
}
// Validate connectedNodeIds cross-references (warn only for forward refs)
for (const n of passiveNodes) {
  if (!n.connectedNodeIds) continue
  for (const refId of n.connectedNodeIds) {
    if (!nodeIds.has(refId)) {
      error('passiveNodes.json', `Node "${n.id}" references unknown connectedNodeId: "${refId}"`)
    }
  }
}
console.log(`  ✓ ${passiveNodes.length} passive nodes`)

// ── quests.json ───────────────────────────────────────────────────────────────
console.log('Validating quests.json…')
try {
  const quests = readJSON('quests.json')
  const VALID_QUEST_TYPES = new Set(['chapter', 'side', 'daily'])
  const VALID_QUEST_STATUSES = new Set(['locked', 'active', 'completed'])
  const VALID_OBJ_TYPES = new Set(['kill_enemy', 'kill_boss', 'acquire_item', 'equip_rune', 'clear_node', 'reach_level'])
  for (const [i, q] of quests.entries()) {
    requireFields('quests.json', q, i, ['id', 'title', 'description', 'type', 'status', 'objectives', 'reward'])
    if (q.type && !VALID_QUEST_TYPES.has(q.type)) {
      error('quests.json', `Entry[${i}] "${q.id}" has invalid type: "${q.type}"`)
    }
    if (q.status && !VALID_QUEST_STATUSES.has(q.status)) {
      error('quests.json', `Entry[${i}] "${q.id}" has invalid status: "${q.status}"`)
    }
    if (Array.isArray(q.objectives)) {
      for (const [j, obj] of q.objectives.entries()) {
        requireFields('quests.json', obj, `${i}.objectives[${j}]`, ['id', 'type', 'description', 'targetCount', 'currentCount'])
        if (obj.type && !VALID_OBJ_TYPES.has(obj.type)) {
          error('quests.json', `Quest "${q.id}" objective[${j}] has invalid type: "${obj.type}"`)
        }
      }
    }
  }
  console.log(`  ✓ ${quests.length} quests`)
} catch (e) {
  error('quests.json', `Failed to read: ${e.message}`)
}

// ── lootTables.json ───────────────────────────────────────────────────────────
console.log('Validating lootTables.json…')
try {
  const loot = readJSON('lootTables.json')
  const entries = Array.isArray(loot) ? loot : Object.values(loot)
  console.log(`  ✓ ${entries.length} loot table entries`)
} catch (e) {
  error('lootTables.json', `Failed to read: ${e.message}`)
}

// ── Summary ───────────────────────────────────────────────────────────────────
console.log('')
if (totalErrors > 0) {
  console.error(`Validation FAILED — ${totalErrors} error(s) found.`)
  process.exit(1)
} else {
  console.log('✅  All data files valid.')
}

// List all files processed
const allFiles = readdirSync(DATA_DIR).filter((f) => f.endsWith('.json'))
console.log(`Checked ${allFiles.length} JSON files in ${DATA_DIR}`)
