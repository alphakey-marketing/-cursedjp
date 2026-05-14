import type { AnyItem, BaseItem, ItemGrade, ItemAffix } from '../../types/item'

// Crafting material costs
const SALVAGE_DUST_BY_GRADE: Record<ItemGrade, number> = {
  Normal: 5,
  Magic: 15,
  Rare: 40,
  Legendary: 120,
  Unique: 0,   // Unique items cannot be salvaged normally
  Holy: 0,
}

const SALVAGE_GOLD_BY_GRADE: Record<ItemGrade, number> = {
  Normal: 2,
  Magic: 8,
  Rare: 25,
  Legendary: 80,
  Unique: 0,
  Holy: 0,
}

export interface SalvageResult {
  runeDust: number
  gold: number
  materials: { name: string; qty: number }[]
  success: boolean
  message: string
}

export interface RerollResult {
  item: AnyItem
  success: boolean
  message: string
}

export interface UpgradeResult {
  item: AnyItem
  newGrade: ItemGrade
  success: boolean
  message: string
}

const GRADE_ORDER: ItemGrade[] = ['Normal', 'Magic', 'Rare', 'Legendary', 'Unique', 'Holy']

function nextGrade(grade: ItemGrade): ItemGrade | null {
  const idx = GRADE_ORDER.indexOf(grade)
  if (idx < 0 || idx >= GRADE_ORDER.indexOf('Legendary')) return null
  return GRADE_ORDER[idx + 1]
}

function clampAffixValue(affix: ItemAffix, min: number, max: number): ItemAffix {
  return { ...affix, value: min + Math.random() * (max - min) }
}

// Material drops from salvage based on item family/type
function getSalvageMaterials(item: AnyItem): { name: string; qty: number }[] {
  const slot = item.slot
  const materials: { name: string; qty: number }[] = []

  if (slot === 'Weapon') {
    materials.push({ name: 'Iron Shard', qty: Math.floor(Math.random() * 3) + 1 })
  } else if (slot === 'Chest' || slot === 'Helmet' || slot === 'Gloves' || slot === 'Boots') {
    materials.push({ name: 'Leather Strip', qty: Math.floor(Math.random() * 3) + 1 })
  } else {
    materials.push({ name: 'Coarse Cloth', qty: Math.floor(Math.random() * 2) + 1 })
  }

  // Bonus material for higher grades
  if (item.grade === 'Rare' || item.grade === 'Legendary') {
    materials.push({ name: 'Spirit Dust', qty: Math.floor(Math.random() * 2) + 1 })
  }

  return materials
}

/**
 * Salvage an item into crafting materials.
 * Unique and Holy items cannot be salvaged.
 */
export function salvageItem(item: AnyItem): SalvageResult {
  if (item.grade === 'Unique' || item.grade === 'Holy') {
    return { runeDust: 0, gold: 0, materials: [], success: false, message: 'Unique and Holy items cannot be salvaged.' }
  }
  if (item.isLocked) {
    return { runeDust: 0, gold: 0, materials: [], success: false, message: 'Item is locked. Unlock it before salvaging.' }
  }

  const runeDust = SALVAGE_DUST_BY_GRADE[item.grade]
  const gold = SALVAGE_GOLD_BY_GRADE[item.grade]
  const materials = getSalvageMaterials(item)

  return {
    runeDust,
    gold,
    materials,
    success: true,
    message: `Salvaged ${item.name} → ${runeDust} Rune Dust, ${gold} Gold.`,
  }
}

/**
 * Reroll all affixes on an item.
 * Costs: Normal 20 dust, Magic 50 dust, Rare 120 dust.
 * Preserves grade and base stats; only rerolls prefix/suffix values.
 */
export function rerollAffixes(item: AnyItem, availableDust: number): RerollResult {
  const costs: Partial<Record<ItemGrade, number>> = {
    Normal: 20,
    Magic: 50,
    Rare: 120,
    Legendary: 300,
  }

  const cost = costs[item.grade]
  if (cost === undefined) {
    return { item, success: false, message: 'This item grade cannot have its affixes rerolled.' }
  }
  if (availableDust < cost) {
    return { item, success: false, message: `Not enough Rune Dust. Need ${cost}, have ${availableDust}.` }
  }
  if (item.grade === 'Normal' && (item as BaseItem).prefixes.length === 0 && (item as BaseItem).suffixes.length === 0) {
    return { item, success: false, message: 'Normal items have no affixes to reroll.' }
  }

  const base = item as BaseItem
  const rerolledPrefixes = base.prefixes.map((affix) =>
    clampAffixValue(affix, affix.value * 0.7, affix.value * 1.3)
  )
  const rerolledSuffixes = base.suffixes.map((affix) =>
    clampAffixValue(affix, affix.value * 0.7, affix.value * 1.3)
  )

  const rerolledItem: AnyItem = {
    ...item,
    prefixes: rerolledPrefixes,
    suffixes: rerolledSuffixes,
  } as AnyItem

  return {
    item: rerolledItem,
    success: true,
    message: `Rerolled affixes on ${item.name}. Cost: ${cost} Rune Dust.`,
  }
}

/**
 * Upgrade an item's grade by one tier.
 * Normal → Magic → Rare → Legendary (max via crafting).
 * Costs scale with target grade.
 */
export function upgradeItemGrade(item: AnyItem, availableDust: number, availableGold: number): UpgradeResult {
  const upgradeDustCost: Partial<Record<ItemGrade, number>> = {
    Normal: 30,   // Normal → Magic
    Magic: 80,    // Magic → Rare
    Rare: 200,    // Rare → Legendary
  }
  const upgradeGoldCost: Partial<Record<ItemGrade, number>> = {
    Normal: 50,
    Magic: 150,
    Rare: 500,
  }

  const next = nextGrade(item.grade)
  if (!next) {
    return { item, newGrade: item.grade, success: false, message: 'This item cannot be upgraded further through crafting.' }
  }

  const dustCost = upgradeDustCost[item.grade] ?? 0
  const goldCost = upgradeGoldCost[item.grade] ?? 0

  if (availableDust < dustCost) {
    return { item, newGrade: item.grade, success: false, message: `Not enough Rune Dust. Need ${dustCost}, have ${availableDust}.` }
  }
  if (availableGold < goldCost) {
    return { item, newGrade: item.grade, success: false, message: `Not enough Gold. Need ${goldCost}, have ${availableGold}.` }
  }

  // Add a new affix when upgrading grade
  const newPrefix: ItemAffix = {
    affixId: `affix_upgraded_${next.toLowerCase()}`,
    value: 0.05 + Math.random() * 0.10,
    tier: 1,
  }

  const upgraded: AnyItem = {
    ...item,
    grade: next,
    prefixes: [...(item as BaseItem).prefixes, newPrefix],
  } as AnyItem

  return {
    item: upgraded,
    newGrade: next,
    success: true,
    message: `Upgraded ${item.name} to ${next} tier! Cost: ${dustCost} Rune Dust, ${goldCost} Gold.`,
  }
}

/**
 * Get the cost breakdown for a crafting operation.
 */
export function getCraftingCost(
  item: AnyItem,
  operation: 'salvage' | 'reroll' | 'upgrade'
): { dust: number; gold: number } {
  if (operation === 'salvage') {
    return { dust: 0, gold: 0 }
  }
  if (operation === 'reroll') {
    const costs: Partial<Record<ItemGrade, number>> = { Normal: 20, Magic: 50, Rare: 120, Legendary: 300 }
    return { dust: costs[item.grade] ?? 0, gold: 0 }
  }
  // upgrade
  const dustCosts: Partial<Record<ItemGrade, number>> = { Normal: 30, Magic: 80, Rare: 200 }
  const goldCosts: Partial<Record<ItemGrade, number>> = { Normal: 50, Magic: 150, Rare: 500 }
  return { dust: dustCosts[item.grade] ?? 0, gold: goldCosts[item.grade] ?? 0 }
}
