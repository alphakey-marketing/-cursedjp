import { useRuneStore } from '../store/useRuneStore'
import { usePlayerStore } from '../store/usePlayerStore'
import { validateSkillRuneWeaponCompat, validateLinkRuneEquip } from '../engine/runes/runeValidator'
import type { AnyRune, SkillRune } from '../types/rune'
import type { WeaponItem } from '../types/item'

export function useRuneEquip() {
  const { ownedRunes, skillSlots, equipSkillRune, unequipSkillRune, equipLinkRune, unequipLinkRune } =
    useRuneStore()
  const character = usePlayerStore((s) => s.character)

  /** Get the currently equipped weapon family (null if no weapon equipped). */
  function getEquippedWeaponFamily() {
    const weapon = character.equippedItems['Weapon'] as WeaponItem | undefined
    return weapon?.weaponFamily ?? null
  }

  /**
   * Attempt to equip a skill rune to a slot.
   * Returns { success: true } or { success: false, error: string }.
   */
  function equipSkill(slotIndex: number, runeId: string): { success: boolean; error?: string } {
    const rune = ownedRunes.find((r) => r.id === runeId)
    if (!rune || rune.category !== 'Skill') {
      return { success: false, error: 'Rune not found or not a Skill rune' }
    }

    const weaponFamily = getEquippedWeaponFamily()
    const compatError = validateSkillRuneWeaponCompat(rune as SkillRune, weaponFamily)
    if (compatError) return { success: false, error: compatError }

    const ok = equipSkillRune(slotIndex, runeId)
    return ok ? { success: true } : { success: false, error: 'Failed to equip skill rune' }
  }

  /**
   * Unequip a skill rune from a slot.
   */
  function unequipSkill(slotIndex: number): void {
    unequipSkillRune(slotIndex)
  }

  /**
   * Attempt to equip a link rune to a slot's sub-slot.
   */
  function equipLink(slotIndex: number, runeId: string): { success: boolean; error?: string } {
    const rune = ownedRunes.find((r) => r.id === runeId)
    if (!rune) return { success: false, error: 'Rune not found' }

    const slot = skillSlots.find((s) => s.slotIndex === slotIndex)
    if (!slot) return { success: false, error: 'Slot not found' }

    const validationError = validateLinkRuneEquip(rune as AnyRune, slot, ownedRunes)
    if (validationError) return { success: false, error: validationError }

    const ok = equipLinkRune(slotIndex, runeId)
    return ok ? { success: true } : { success: false, error: 'Failed to equip link rune' }
  }

  /**
   * Remove a link rune from a slot.
   */
  function removeLink(slotIndex: number, linkRuneId: string): void {
    unequipLinkRune(slotIndex, linkRuneId)
  }

  /**
   * Check if a skill rune is compatible with the current weapon.
   */
  function checkSkillCompat(rune: SkillRune): string | null {
    return validateSkillRuneWeaponCompat(rune, getEquippedWeaponFamily())
  }

  return { equipSkill, unequipSkill, equipLink, removeLink, checkSkillCompat, skillSlots, ownedRunes }
}
