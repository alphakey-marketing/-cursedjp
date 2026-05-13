import type { SkillRune, LinkRune, AnyRune, EquippedSkillSlot } from '../../types/rune'
import type { WeaponFamily } from '../../types/item'

/**
 * Check whether a skill rune is compatible with the currently equipped weapon family.
 * Returns null if compatible, or an error string if not.
 */
export function validateSkillRuneWeaponCompat(
  rune: SkillRune,
  equippedWeaponFamily: WeaponFamily | null
): string | null {
  if (!rune.weaponFamilyRestriction || rune.weaponFamilyRestriction.length === 0) {
    return null
  }
  if (!equippedWeaponFamily) {
    return `${rune.name} requires ${rune.weaponFamilyRestriction.join(' or ')} weapon`
  }
  if (!rune.weaponFamilyRestriction.includes(equippedWeaponFamily)) {
    return `${rune.name} requires ${rune.weaponFamilyRestriction.join(' or ')} — equipped: ${equippedWeaponFamily}`
  }
  return null
}

/**
 * Check whether a link rune can be added to the given slot.
 * Validates: slot has a skill rune, link count < maxSupportLinks, not already equipped.
 */
export function validateLinkRuneEquip(
  linkRune: AnyRune,
  slot: EquippedSkillSlot,
  ownedRunes: AnyRune[]
): string | null {
  if (linkRune.category === 'Skill') {
    return 'Cannot add a Skill rune as a link'
  }

  if (!slot.skillRuneId) {
    return 'Slot has no skill rune — equip a skill rune first'
  }

  const skillRune = ownedRunes.find(
    (r) => r.id === slot.skillRuneId && r.category === 'Skill'
  ) as SkillRune | undefined

  if (!skillRune) {
    return 'Skill rune not found in owned runes'
  }

  if (slot.linkRuneIds.length >= skillRune.maxSupportLinks) {
    return `Slot is full — max ${skillRune.maxSupportLinks} link rune(s) for ${skillRune.name}`
  }

  if (slot.linkRuneIds.includes(linkRune.id)) {
    return `${linkRune.name} is already linked to this slot`
  }

  return null
}

/**
 * Check whether a link rune's modifiesTag matches any of the skill rune's tags.
 * Returns true if the link rune applies to the skill.
 */
export function doesLinkApplyToSkill(linkRune: LinkRune, skillRune: SkillRune): boolean {
  if (!linkRune.modifiesTag) return true // no tag restriction → always applies
  return skillRune.tags.includes(linkRune.modifiesTag)
}
