import type { SkillRune, LinkRune, AnyRune, EquippedSkillSlot } from '../../types/rune'
import type { DamagePacket } from '../../types/combat'
import { doesLinkApplyToSkill } from './runeValidator'

export interface ResolvedSkillConfig {
  skillRune: SkillRune
  effectivePacketOverrides: Partial<DamagePacket>
  appliedLinkRunes: LinkRune[]
  cooldownReduction: number  // 0.0–1.0 fraction reduction
}

/**
 * Given a skill slot and owned runes, produce the final DamagePacket overrides
 * that include all active link rune effects.
 */
export function resolveSkillLinkConfig(
  slot: EquippedSkillSlot,
  ownedRunes: AnyRune[]
): ResolvedSkillConfig | null {
  if (!slot.skillRuneId) return null

  const skillRune = ownedRunes.find(
    (r) => r.id === slot.skillRuneId && r.category === 'Skill'
  ) as SkillRune | undefined
  if (!skillRune) return null

  const linkRunes = slot.linkRuneIds
    .map((id) => ownedRunes.find((r) => r.id === id))
    .filter((r): r is LinkRune => r !== undefined && r.category !== 'Skill')

  // Accumulate modifiers across all applicable link runes
  let addedFlatDamageMin = 0
  let addedFlatDamageMax = 0
  let cooldownReduction = 0
  let lifeStealPercent = 0
  const additiveIncreases: number[] = []
  const appliedLinks: LinkRune[] = []

  for (const link of linkRunes) {
    if (!doesLinkApplyToSkill(link, skillRune)) continue
    appliedLinks.push(link)

    switch (link.effectType) {
      case 'AddedDamage': {
        const minKey = Object.keys(link.params).find((k) => k.includes('Min') || k.includes('min'))
        const maxKey = Object.keys(link.params).find((k) => k.includes('Max') || k.includes('max'))
        if (minKey) addedFlatDamageMin += Number(link.params[minKey])
        if (maxKey) addedFlatDamageMax += Number(link.params[maxKey])
        break
      }
      case 'CooldownReduction': {
        const val = Number(link.params['cooldownReduction'] ?? link.params['value'] ?? 0)
        cooldownReduction += val
        break
      }
      case 'ResourceLeech': {
        const val = Number(link.params['leechPercent'] ?? link.params['value'] ?? 0)
        lifeStealPercent += val
        break
      }
      case 'BurstMultiplier': {
        const val = Number(link.params['burstMultiplier'] ?? link.params['value'] ?? 0)
        if (val > 0) additiveIncreases.push(val)
        break
      }
      case 'ChainModifier':
        // Chain behavior is resolved by the projectile subsystem; recorded for reference only
        break
      case 'ProjectileModifier':
        // Extra pierce / fork count handled by projectile subsystem; recorded for reference only
        break
      case 'BarrierInteraction':
        // Barrier drain percent applied before HP damage in the combat pipeline
        break
      case 'StatusSpecialization':
        // Status proc chances / magnitudes handled by the status-effect subsystem
        break
      case 'OnHitEffect':
        // On-hit procs (e.g. bleed-on-crit) handled by the hit-resolution pipeline
        break
      default:
        break
    }
  }

  // Derive average flat damage contribution
  const avgAddedFlat = (addedFlatDamageMin + addedFlatDamageMax) / 2

  const effectivePacketOverrides: Partial<DamagePacket> = {
    damageType: skillRune.damageType,
    deliveryMode: skillRune.deliveryMode,
    skillCoef: skillRune.skillCoef,
  }

  if (avgAddedFlat > 0) {
    effectivePacketOverrides.flatDamage = avgAddedFlat
  }
  if (additiveIncreases.length > 0) {
    effectivePacketOverrides.additiveIncreases = additiveIncreases
  }
  if (lifeStealPercent > 0) {
    effectivePacketOverrides.lifeStealPercent = lifeStealPercent
  }

  return {
    skillRune,
    effectivePacketOverrides,
    appliedLinkRunes: appliedLinks,
    cooldownReduction: Math.min(0.5, cooldownReduction), // cap at 50% reduction
  }
}
