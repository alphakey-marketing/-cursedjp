/// <reference types="node" />
import { describe, it, expect, beforeAll } from 'vitest'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { validateBuildCombination } from '../runes/runeValidator'
import type { AnyRune, EquippedSkillSlot } from '../../types/rune'

const __dirname = dirname(fileURLToPath(import.meta.url))
const dataDir = resolve(__dirname, '../../../public/data')

function loadJSON(file: string): unknown[] {
  const raw = readFileSync(resolve(dataDir, file), 'utf8')
  const parsed: unknown = JSON.parse(raw)
  return Array.isArray(parsed) ? parsed : Object.values(parsed as Record<string, unknown>)
}

let regionsData: unknown[]
let enemiesData: unknown[]
let bossesData: unknown[]
let runesData: unknown[]
let passiveNodesData: unknown[]
let questsData: unknown[]
let affixesData: unknown[]

beforeAll(() => {
  regionsData = loadJSON('regions.json')
  enemiesData = loadJSON('enemies.json')
  bossesData = loadJSON('bosses.json')
  runesData = loadJSON('runes.json')
  passiveNodesData = loadJSON('passiveNodes.json')
  questsData = loadJSON('quests.json')
  affixesData = loadJSON('affixes.json')
})

const VALID_RUNE_CATEGORIES = ['Skill', 'Link', 'Support'] as const
const VALID_EFFECT_TYPES = [
  'AddedDamage', 'IncreasedAoE', 'AddedDoT', 'ConvertDamage', 'OnHitEffect',
  'CooldownReduction', 'ResourceLeech', 'ExtraProjectile', 'BurstMultiplier',
  'ChainModifier', 'ProjectileModifier', 'BarrierInteraction', 'StatusSpecialization',
] as const
const VALID_NODE_TYPES = ['StatNode', 'Keystone', 'SkillCluster', 'NotableNode'] as const
const VALID_QUEST_TYPES = ['chapter', 'side', 'daily'] as const
const VALID_QUEST_STATUSES = ['locked', 'active', 'completed'] as const
const VALID_OBJ_TYPES = ['kill_enemy', 'kill_boss', 'acquire_item', 'equip_rune', 'clear_node', 'reach_level'] as const

describe('regions.json', () => {
  it('is a non-empty array', () => {
    expect(Array.isArray(regionsData)).toBe(true)
    expect(regionsData.length).toBeGreaterThan(0)
  })

  it('every region has required fields', () => {
    for (const region of regionsData as Array<Record<string, unknown>>) {
      expect(region.id, `region.id missing`).toBeTruthy()
      expect(region.name, `region ${region.id} missing name`).toBeTruthy()
    }
  })
})

describe('enemies.json', () => {
  it('is a non-empty array', () => {
    expect(Array.isArray(enemiesData)).toBe(true)
    expect(enemiesData.length).toBeGreaterThan(0)
  })

  it('every enemy has required fields', () => {
    for (const enemy of enemiesData as Array<Record<string, unknown>>) {
      expect(enemy.id, 'enemy.id missing').toBeTruthy()
      expect(enemy.name, `enemy ${enemy.id} missing name`).toBeTruthy()
      expect(enemy.dropTableId, `enemy ${enemy.id} missing dropTableId`).toBeTruthy()
    }
  })
})

describe('bosses.json', () => {
  it('is a non-empty array', () => {
    expect(Array.isArray(bossesData)).toBe(true)
    expect(bossesData.length).toBeGreaterThan(0)
  })

  it('every boss has required fields', () => {
    for (const boss of bossesData as Array<Record<string, unknown>>) {
      expect(boss.id, 'boss.id missing').toBeTruthy()
      expect(boss.name, `boss ${boss.id} missing name`).toBeTruthy()
      expect(boss.dropTableId, `boss ${boss.id} missing dropTableId`).toBeTruthy()
    }
  })

  it('boss IDs are unique', () => {
    const ids = (bossesData as Array<{ id: string }>).map((b) => b.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})

describe('runes.json', () => {
  it('is a non-empty array', () => {
    expect(Array.isArray(runesData)).toBe(true)
    expect(runesData.length).toBeGreaterThan(0)
  })

  it('every rune has required fields', () => {
    for (const rune of runesData as Array<Record<string, unknown>>) {
      expect(rune.id, 'rune.id missing').toBeTruthy()
      expect(rune.name, `rune ${rune.id} missing name`).toBeTruthy()
      expect(rune.category, `rune ${rune.id} missing category`).toBeTruthy()
      expect(rune.description, `rune ${rune.id} missing description`).toBeTruthy()
      expect(rune.iconId, `rune ${rune.id} missing iconId`).toBeTruthy()
    }
  })

  it('every rune has a valid category', () => {
    for (const rune of runesData as Array<{ id: string; category: string }>) {
      expect(VALID_RUNE_CATEGORIES).toContain(rune.category)
    }
  })

  it('every Link/Support rune has a valid effectType', () => {
    for (const rune of runesData as Array<{ id: string; category: string; effectType?: string }>) {
      if (rune.category !== 'Skill') {
        expect(rune.effectType, `rune ${rune.id} missing effectType`).toBeTruthy()
        expect(VALID_EFFECT_TYPES).toContain(rune.effectType)
      }
    }
  })

  it('rune IDs are unique', () => {
    const ids = (runesData as Array<{ id: string }>).map((r) => r.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})

describe('passiveNodes.json', () => {
  it('is a non-empty array', () => {
    expect(Array.isArray(passiveNodesData)).toBe(true)
    expect(passiveNodesData.length).toBeGreaterThan(0)
  })

  it('every node has required fields', () => {
    for (const node of passiveNodesData as Array<Record<string, unknown>>) {
      expect(node.id, 'node.id missing').toBeTruthy()
      expect(node.label, `node ${node.id} missing label`).toBeTruthy()
      expect(node.type, `node ${node.id} missing type`).toBeTruthy()
      expect(node.position, `node ${node.id} missing position`).toBeTruthy()
      expect(node.cost, `node ${node.id} missing cost`).toBeDefined()
    }
  })

  it('every node has a valid type', () => {
    for (const node of passiveNodesData as Array<{ id: string; type: string }>) {
      expect(VALID_NODE_TYPES).toContain(node.type)
    }
  })

  it('node IDs are unique', () => {
    const ids = (passiveNodesData as Array<{ id: string }>).map((n) => n.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('connectedNodeIds reference existing nodes', () => {
    const nodeIds = new Set(
      (passiveNodesData as Array<{ id: string }>).map((n) => n.id)
    )
    for (const node of passiveNodesData as Array<{ id: string; connectedNodeIds?: string[] }>) {
      for (const refId of node.connectedNodeIds ?? []) {
        expect(nodeIds.has(refId), `Node "${node.id}" references unknown node "${refId}"`).toBe(true)
      }
    }
  })
})

describe('quests.json', () => {
  it('is a non-empty array', () => {
    expect(Array.isArray(questsData)).toBe(true)
    expect(questsData.length).toBeGreaterThan(0)
  })

  it('every quest has required fields', () => {
    for (const quest of questsData as Array<Record<string, unknown>>) {
      expect(quest.id, 'quest.id missing').toBeTruthy()
      expect(quest.title, `quest ${quest.id} missing title`).toBeTruthy()
      expect(quest.type, `quest ${quest.id} missing type`).toBeTruthy()
      expect(quest.status, `quest ${quest.id} missing status`).toBeTruthy()
      expect(quest.objectives, `quest ${quest.id} missing objectives`).toBeTruthy()
      expect(quest.reward, `quest ${quest.id} missing reward`).toBeTruthy()
    }
  })

  it('every quest has a valid type', () => {
    for (const quest of questsData as Array<{ id: string; type: string }>) {
      expect(VALID_QUEST_TYPES).toContain(quest.type)
    }
  })

  it('every quest has a valid status', () => {
    for (const quest of questsData as Array<{ id: string; status: string }>) {
      expect(VALID_QUEST_STATUSES).toContain(quest.status)
    }
  })

  it('every objective has a valid type', () => {
    for (const quest of questsData as Array<{ id: string; objectives: Array<{ type: string }> }>) {
      for (const obj of quest.objectives ?? []) {
        expect(VALID_OBJ_TYPES).toContain(obj.type)
      }
    }
  })

  it('quest IDs are unique', () => {
    const ids = (questsData as Array<{ id: string }>).map((q) => q.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})

const VALID_AFFIX_BUCKETS = ['Additive', 'Multiplicative', 'Utility', 'Exclusive'] as const
const VALID_ITEM_SLOTS = [
  'Weapon', 'OffHand', 'Helmet', 'Chest', 'Gloves', 'Boots',
  'Ring1', 'Ring2', 'Amulet', 'Charm',
] as const

describe('affixes.json', () => {
  it('is a non-empty array', () => {
    expect(Array.isArray(affixesData)).toBe(true)
    expect(affixesData.length).toBeGreaterThan(0)
  })

  it('every affix has required fields', () => {
    for (const affix of affixesData as Array<Record<string, unknown>>) {
      expect(affix.id, 'affix.id missing').toBeTruthy()
      expect(affix.label, `affix ${String(affix.id)} missing label`).toBeTruthy()
      expect(affix.bucket, `affix ${String(affix.id)} missing bucket`).toBeTruthy()
      expect(affix.statKey, `affix ${String(affix.id)} missing statKey`).toBeTruthy()
      expect(typeof affix.minValue, `affix ${String(affix.id)} minValue not number`).toBe('number')
      expect(typeof affix.maxValue, `affix ${String(affix.id)} maxValue not number`).toBe('number')
      expect(Array.isArray(affix.allowedGrades), `affix ${String(affix.id)} allowedGrades not array`).toBe(true)
    }
  })

  it('every affix has a valid bucket', () => {
    for (const affix of affixesData as Array<{ id: string; bucket: string }>) {
      expect(VALID_AFFIX_BUCKETS).toContain(affix.bucket)
    }
  })

  it('affix minValue <= maxValue', () => {
    for (const affix of affixesData as Array<{ id: string; minValue: number; maxValue: number }>) {
      expect(affix.minValue, `affix ${affix.id}: minValue > maxValue`).toBeLessThanOrEqual(affix.maxValue)
    }
  })

  it('allowed slots are valid if present', () => {
    for (const affix of affixesData as Array<{ id: string; allowedSlots?: string[] }>) {
      for (const slot of affix.allowedSlots ?? []) {
        expect(VALID_ITEM_SLOTS).toContain(slot)
      }
    }
  })

  it('affix IDs are unique', () => {
    const ids = (affixesData as Array<{ id: string }>).map((a) => a.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})

describe('build validation — validateBuildCombination', () => {
  const ownedRunes: AnyRune[] = [
    {
      id: 'skill_rune_shadowslash',
      name: 'Shadow Slash',
      category: 'Skill',
      damageType: 'Physical',
      deliveryMode: 'Strike',
      skillCoef: 1.4,
      baseCooldown: 3,
      resourceCost: 20,
      maxSupportLinks: 3,
      weaponFamilyRestriction: ['Katana', 'Tanto'],
      tags: ['Strike', 'Melee', 'SingleTarget'],
      description: 'A swift slash.',
      iconId: 'icon_shadowslash',
      dropSourceIds: [],
    },
    {
      id: 'link_rune_addedfire',
      name: 'Infused Flame',
      category: 'Link',
      effectType: 'AddedDamage',
      modifiesTag: 'Strike',
      params: { addedFireDamageMin: 10, addedFireDamageMax: 18 },
      dropSourceIds: [],
      iconId: 'icon_infusedflame',
      description: 'Adds fire damage.',
    },
    {
      id: 'link_rune_bleed',
      name: 'Crimson Edge',
      category: 'Link',
      effectType: 'AddedDoT',
      modifiesTag: 'Strike',
      params: { bleedChance: 0.25, bleedDamagePerTick: 15, bleedDuration: 4 },
      dropSourceIds: [],
      iconId: 'icon_crimsonedge',
      description: 'Applies Bleed on hit.',
    },
  ]

  it('valid single-skill slot passes', () => {
    const slots: EquippedSkillSlot[] = [
      { slotIndex: 0, skillRuneId: 'skill_rune_shadowslash', linkRuneIds: ['link_rune_addedfire'] },
    ]
    const result = validateBuildCombination(slots, ownedRunes)
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('empty slots with no links are valid', () => {
    const slots: EquippedSkillSlot[] = [
      { slotIndex: 0, skillRuneId: 'skill_rune_shadowslash', linkRuneIds: [] },
      { slotIndex: 1, skillRuneId: null, linkRuneIds: [] },
    ]
    const result = validateBuildCombination(slots, ownedRunes)
    expect(result.valid).toBe(true)
  })

  it('link rune without a skill rune in the slot is an error', () => {
    const slots: EquippedSkillSlot[] = [
      { slotIndex: 0, skillRuneId: null, linkRuneIds: ['link_rune_addedfire'] },
    ]
    const result = validateBuildCombination(slots, ownedRunes)
    expect(result.valid).toBe(false)
    expect(result.errors.length).toBeGreaterThan(0)
  })

  it('duplicate skill rune across slots is an error', () => {
    const slots: EquippedSkillSlot[] = [
      { slotIndex: 0, skillRuneId: 'skill_rune_shadowslash', linkRuneIds: [] },
      { slotIndex: 1, skillRuneId: 'skill_rune_shadowslash', linkRuneIds: [] },
    ]
    const result = validateBuildCombination(slots, ownedRunes)
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.includes('multiple slots'))).toBe(true)
  })

  it('exceeding maxSupportLinks is an error', () => {
    const slots: EquippedSkillSlot[] = [
      {
        slotIndex: 0,
        skillRuneId: 'skill_rune_shadowslash',
        // shadowslash has maxSupportLinks=3; provide 4 links
        linkRuneIds: [
          'link_rune_addedfire',
          'link_rune_bleed',
          'link_rune_addedfire',
          'link_rune_bleed',
        ],
      },
    ]
    const result = validateBuildCombination(slots, ownedRunes)
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.includes('at most'))).toBe(true)
  })

  it('incompatible link rune tag generates a warning, not an error', () => {
    const projectileLink: AnyRune = {
      id: 'link_rune_pierce',
      name: 'Piercing Shot',
      category: 'Link',
      effectType: 'ProjectileModifier',
      modifiesTag: 'Projectile',
      params: { pierceCount: 2 },
      dropSourceIds: [],
      iconId: 'icon_pierce',
      description: 'Projectile pierces.',
    }
    const slots: EquippedSkillSlot[] = [
      {
        slotIndex: 0,
        skillRuneId: 'skill_rune_shadowslash',
        linkRuneIds: ['link_rune_pierce'],
      },
    ]
    const result = validateBuildCombination(slots, [...ownedRunes, projectileLink])
    expect(result.valid).toBe(true) // tag mismatch is a warning, not an error
    expect(result.warnings.some((w) => w.includes('does not apply'))).toBe(true)
  })
})
