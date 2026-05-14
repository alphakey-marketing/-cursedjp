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

export interface BuildValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
}

/**
 * Validate a complete set of skill slots for build-level consistency.
 * Checks for duplicate skill runes, over-stacking the same link effect, and empty skill slots with links.
 */
export function validateBuildCombination(
  slots: EquippedSkillSlot[],
  ownedRunes: AnyRune[]
): BuildValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  const usedSkillRuneIds = new Set<string>()

  for (const slot of slots) {
    if (!slot.skillRuneId && slot.linkRuneIds.length > 0) {
      errors.push(`Slot ${slot.slotIndex} has link runes but no skill rune`)
      continue
    }

    if (!slot.skillRuneId) continue

    if (usedSkillRuneIds.has(slot.skillRuneId)) {
      errors.push(`Skill rune "${slot.skillRuneId}" is equipped in multiple slots`)
    } else {
      usedSkillRuneIds.add(slot.skillRuneId)
    }

    const skillRune = ownedRunes.find(
      (r) => r.id === slot.skillRuneId && r.category === 'Skill'
    ) as SkillRune | undefined

    if (!skillRune) {
      errors.push(`Slot ${slot.slotIndex}: skill rune "${slot.skillRuneId}" not found in owned runes`)
      continue
    }

    if (slot.linkRuneIds.length > skillRune.maxSupportLinks) {
      errors.push(
        `Slot ${slot.slotIndex}: ${skillRune.name} supports at most ${skillRune.maxSupportLinks} link rune(s), but ${slot.linkRuneIds.length} are equipped`
      )
    }

    // Warn about duplicate link rune IDs in the same slot
    const seenLinks = new Set<string>()
    for (const linkId of slot.linkRuneIds) {
      if (seenLinks.has(linkId)) {
        warnings.push(`Slot ${slot.slotIndex}: link rune "${linkId}" is equipped more than once`)
      }
      seenLinks.add(linkId)
    }

    // Warn about link runes that don't apply to the skill
    for (const linkId of slot.linkRuneIds) {
      const linkRune = ownedRunes.find((r) => r.id === linkId) as LinkRune | undefined
      if (!linkRune) {
        warnings.push(`Slot ${slot.slotIndex}: link rune "${linkId}" not found in owned runes`)
        continue
      }
      if (!doesLinkApplyToSkill(linkRune, skillRune)) {
        warnings.push(
          `Slot ${slot.slotIndex}: "${linkRune.name}" (tag: ${linkRune.modifiesTag}) does not apply to "${skillRune.name}" (tags: ${skillRune.tags.join(', ')})`
        )
      }
    }
  }

  return { valid: errors.length === 0, errors, warnings }
}
