import type { AnyItem, WeaponItem, ArmorItem, ItemGrade } from '../../types/item'
import { BALANCE } from '../../constants/gameBalance'
import { usePlayerStore } from '../../store/usePlayerStore'

let _instanceCounter = Date.now()
function genId(prefix: string): string {
  return `${prefix}_${(_instanceCounter++).toString(36)}`
}

interface EnemyDropTable {
  id: string
  tier: string
  expReward: number
  dropTableId: string
  isFirstKill?: boolean
}

interface BossSignatureDrop {
  runeId?: string
  itemTemplateId?: string
  dropChance: number
  isGuaranteedFirstKill: boolean
}

interface BossTemplate extends EnemyDropTable {
  signatureDrops?: BossSignatureDrop[]
  lootTableId?: string
}

export interface DropResult {
  items: AnyItem[]
  gold: number
  runeIds: string[]
  materials: { name: string; qty: number }[]
  signatureRuneIds: string[]
}

// Simplified drop tables keyed by dropTableId
const DROP_TABLE: Record<
  string,
  { itemChance: number; goldMin: number; goldMax: number; materials: string[] }
> = {
  drop_ronin: {
    itemChance: 0.25,
    goldMin: 10,
    goldMax: 40,
    materials: ['Iron Shard', 'Coarse Cloth'],
  },
  drop_city_guard: {
    itemChance: 0.30,
    goldMin: 15,
    goldMax: 55,
    materials: ['Iron Shard', 'Leather Strip'],
  },
  loot_oni_general: {
    itemChance: 1.0,
    goldMin: 150,
    goldMax: 400,
    materials: ['Oni Horn', 'Dark Ore', 'Fire Essence'],
  },
  drop_ronin_captain: {
    itemChance: 0.50,
    goldMin: 40,
    goldMax: 90,
    materials: ['Iron Shard', 'Hardened Leather', 'Spirit Dust'],
  },
  drop_forest_specter: {
    itemChance: 0.20,
    goldMin: 25,
    goldMax: 70,
    materials: ['Spirit Wisp', 'Shadow Silk'],
  },
  drop_kodama_wraith: {
    itemChance: 0.25,
    goldMin: 30,
    goldMax: 80,
    materials: ['Ancient Wood', 'Spirit Wisp'],
  },
  drop_cursed_archer: {
    itemChance: 0.25,
    goldMin: 28,
    goldMax: 75,
    materials: ['Cursed Arrow', 'Venom Sac', 'Shadow Silk'],
  },
  drop_silk_spinner: {
    itemChance: 0.28,
    goldMin: 32,
    goldMax: 85,
    materials: ['Spider Silk', 'Venom Sac'],
  },
  drop_venom_spawn: {
    itemChance: 0.22,
    goldMin: 20,
    goldMax: 60,
    materials: ['Venom Sac', 'Chitin Fragment'],
  },
  drop_elder_spider: {
    itemChance: 0.70,
    goldMin: 100,
    goldMax: 280,
    materials: ['Elder Spider Fang', 'Venom Sac', 'Spider Silk', 'Forest Essence'],
  },
  loot_jorogumo: {
    itemChance: 1.0,
    goldMin: 350,
    goldMax: 900,
    materials: ['Jorogumo Silk Thread', 'Queen Venom Gland', 'Forest Essence', 'Ancient Wood'],
  },
}

// Minimal item pool used to generate drops
const ITEM_POOL: Omit<WeaponItem | ArmorItem, 'instanceId'>[] = [
  {
    templateId: 'weapon_starter_katana',
    name: 'Iron Katana',
    slot: 'Weapon',
    weaponFamily: 'Katana',
    grade: 'Normal',
    itemLevel: 1,
    quality: 0,
    prefixes: [],
    suffixes: [],
    sockets: [],
    isIdentified: true,
    isCursed: false,
    isLocked: false,
    baseDamageMin: 30,
    baseDamageMax: 42,
    attackSpeed: 1.1,
    critBaseChance: 0.05,
    exclusiveRuneIds: [],
  } as Omit<WeaponItem, 'instanceId'>,
  {
    templateId: 'weapon_balanced_katana',
    name: 'Balanced Katana',
    slot: 'Weapon',
    weaponFamily: 'Katana',
    grade: 'Magic',
    itemLevel: 5,
    quality: 20,
    prefixes: [{ affixId: 'affix_increased_attack', value: 0.12, tier: 1 }],
    suffixes: [],
    sockets: [],
    isIdentified: true,
    isCursed: false,
    isLocked: false,
    baseDamageMin: 38,
    baseDamageMax: 52,
    attackSpeed: 1.2,
    critBaseChance: 0.07,
    exclusiveRuneIds: [],
  } as Omit<WeaponItem, 'instanceId'>,
  {
    templateId: 'armor_starter_chest',
    name: 'Leather Chest',
    slot: 'Chest',
    grade: 'Normal',
    itemLevel: 1,
    quality: 0,
    prefixes: [],
    suffixes: [],
    sockets: [],
    isIdentified: true,
    isCursed: false,
    isLocked: false,
    primaryDefenseStat: 'Armor',
    baseDefenseValue: 40,
    attributeRequirement: { Strength: 10 },
  } as Omit<ArmorItem, 'instanceId'>,
  {
    templateId: 'armor_studded_chest',
    name: 'Studded Chest',
    slot: 'Chest',
    grade: 'Magic',
    itemLevel: 5,
    quality: 15,
    prefixes: [{ affixId: 'affix_increased_armor', value: 0.10, tier: 1 }],
    suffixes: [],
    sockets: [],
    isIdentified: true,
    isCursed: false,
    isLocked: false,
    primaryDefenseStat: 'Armor',
    baseDefenseValue: 65,
    attributeRequirement: { Strength: 18 },
  } as Omit<ArmorItem, 'instanceId'>,
  {
    templateId: 'armor_quick_boots',
    name: 'Nimble Boots',
    slot: 'Boots',
    grade: 'Normal',
    itemLevel: 1,
    quality: 0,
    prefixes: [],
    suffixes: [],
    sockets: [],
    isIdentified: true,
    isCursed: false,
    isLocked: false,
    primaryDefenseStat: 'Dodge',
    baseDefenseValue: 10,
    attributeRequirement: { Dexterity: 8 },
  } as Omit<ArmorItem, 'instanceId'>,
]

function pickRandomItem(): AnyItem {
  const template = ITEM_POOL[Math.floor(Math.random() * ITEM_POOL.length)]
  return { ...template, instanceId: genId('item') } as AnyItem
}

function rollMaterials(materialNames: string[]): { name: string; qty: number }[] {
  return materialNames.map((name) => ({
    name,
    qty: Math.floor(Math.random() * 4) + 1,
  }))
}

export function resolveDrops(enemies: EnemyDropTable[]): DropResult {
  const items: AnyItem[] = []
  const runeIds: string[] = []
  let gold = 0
  const materialsMap: Record<string, number> = {}
  const signatureRuneIds: string[] = []

  const playerStore = usePlayerStore.getState()
  let droppedRareOrBetter = false

  for (const enemy of enemies) {
    const table = DROP_TABLE[enemy.dropTableId]
    if (!table) continue

    gold += table.goldMin + Math.floor(Math.random() * (table.goldMax - table.goldMin + 1))

    // Pity counter: guarantee a Magic+ item if threshold reached
    const pityTriggered =
      playerStore.killsSinceLastRareDrop >= BALANCE.PITY_COUNTER_THRESHOLD

    if (pityTriggered || Math.random() < table.itemChance) {
      const item = pickRandomItem()
      items.push(item)
      if (pityTriggered && item.grade === 'Normal') {
        // Override to at least Magic grade for pity drop
        (item as AnyItem & { grade: ItemGrade }).grade = 'Magic'
      }
      if (item.grade !== 'Normal') {
        droppedRareOrBetter = true
      }
    }

    const mats = rollMaterials(table.materials)
    mats.forEach(({ name, qty }) => {
      materialsMap[name] = (materialsMap[name] ?? 0) + qty
    })

    // Boss signature drops
    const boss = enemy as BossTemplate
    if (boss.signatureDrops) {
      for (const sig of boss.signatureDrops) {
        const isFirstKillBonus = sig.isGuaranteedFirstKill && enemy.isFirstKill === true
        if (isFirstKillBonus || Math.random() < sig.dropChance) {
          if (sig.runeId) {
            runeIds.push(sig.runeId)
            signatureRuneIds.push(sig.runeId)
          }
          if (sig.itemTemplateId) {
            const found = ITEM_POOL.find((t) => t.templateId === sig.itemTemplateId)
            if (found) items.push({ ...found, instanceId: genId('item') } as AnyItem)
          }
        }
      }
    }
  }

  // Update pity counter
  if (droppedRareOrBetter) {
    playerStore.resetKillsSinceRareDrop()
  } else {
    playerStore.incrementKillsSinceRareDrop()
  }

  const materials = Object.entries(materialsMap).map(([name, qty]) => ({ name, qty }))

  return { items, gold, runeIds, materials, signatureRuneIds }
}

export function getItemSellValue(item: AnyItem): number {
  const gradeMultiplier: Record<ItemGrade, number> = {
    Normal: 1,
    Magic: 3,
    Rare: 8,
    Legendary: 25,
    Unique: 50,
    Holy: 100,
  }
  const base = item.itemLevel * 10
  return Math.floor(base * (gradeMultiplier[item.grade] ?? 1))
}
