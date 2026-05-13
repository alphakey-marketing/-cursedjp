import { usePlayerStore } from '../store/usePlayerStore'
import { useInventoryStore } from '../store/useInventoryStore'
import type { AnyItem, ItemSlot, WeaponItem } from '../types/item'

export function useItemEquip() {
  const character = usePlayerStore((s) => s.character)
  const equipItem = usePlayerStore((s) => s.equipItem)
  const addGold = usePlayerStore((s) => s.addGold)
  const addToBag = useInventoryStore((s) => s.addToBag)
  const equipFromBag = useInventoryStore((s) => s.equipFromBag)
  const sellItem = useInventoryStore((s) => s.sellItem)

  /**
   * Validate whether an item can be equipped by the player.
   * Returns null if valid, or an error message string.
   */
  function validateEquip(item: AnyItem): string | null {
    // Level requirement
    if (item.itemLevel > character.stats.level) {
      return `Requires level ${item.itemLevel}`
    }

    // Attribute requirements for armor
    if ('attributeRequirement' in item && item.attributeRequirement) {
      const req = item.attributeRequirement as Partial<Record<string, number>>
      if (req.Strength && character.stats.strength < req.Strength) {
        return `Requires ${req.Strength} Strength`
      }
      if (req.Dexterity && character.stats.dexterity < req.Dexterity) {
        return `Requires ${req.Dexterity} Dexterity`
      }
      if (req.Intelligence && character.stats.intelligence < req.Intelligence) {
        return `Requires ${req.Intelligence} Intelligence`
      }
    }

    // Weapon family check against equipped runes
    if (item.slot === 'Weapon') {
      const weapon = item as WeaponItem
      for (const slot of character.skillSlots) {
        if (!slot.skillRuneId) continue
        const rune = character.runeInventory.find((r) => r.id === slot.skillRuneId)
        if (
          rune &&
          rune.category === 'Skill' &&
          'weaponFamilyRestriction' in rune &&
          Array.isArray(rune.weaponFamilyRestriction) &&
          rune.weaponFamilyRestriction.length > 0 &&
          !rune.weaponFamilyRestriction.includes(weapon.weaponFamily)
        ) {
          return `Equipped rune "${rune.name}" requires ${rune.weaponFamilyRestriction.join('/')} weapon`
        }
      }
    }

    return null
  }

  /**
   * Equip an item directly (e.g. from ResultScreen).
   * Moves previously equipped item to bag.
   */
  function equipDirectly(item: AnyItem): { success: boolean; error?: string } {
    const error = validateEquip(item)
    if (error) return { success: false, error }

    const slot = item.slot as ItemSlot
    const previouslyEquipped = character.equippedItems[slot]

    // Add to bag first if previously equipped
    if (previouslyEquipped) {
      addToBag(previouslyEquipped)
    }

    equipItem(slot, item)
    return { success: true }
  }

  /**
   * Equip an item from the bag.
   */
  function equipFromInventory(instanceId: string, slot: ItemSlot): { success: boolean; error?: string } {
    const item = useInventoryStore.getState().bag.find((i) => i.instanceId === instanceId)
    if (!item) return { success: false, error: 'Item not found in bag' }

    const error = validateEquip(item)
    if (error) return { success: false, error }

    equipFromBag(instanceId, slot)
    equipItem(slot, item)
    return { success: true }
  }

  /**
   * Sell an item from bag and credit gold.
   */
  function sellFromBag(instanceId: string, price: number): boolean {
    const sold = sellItem(instanceId, price)
    if (sold) addGold(price)
    return sold
  }

  return { validateEquip, equipDirectly, equipFromInventory, sellFromBag }
}
