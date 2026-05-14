/// <reference types="node" />
import { describe, it, expect, beforeAll } from 'vitest'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

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

beforeAll(() => {
  regionsData = loadJSON('regions.json')
  enemiesData = loadJSON('enemies.json')
  bossesData = loadJSON('bosses.json')
  runesData = loadJSON('runes.json')
  passiveNodesData = loadJSON('passiveNodes.json')
  questsData = loadJSON('quests.json')
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
