# CursedJP — Recommended Builds (Internal Balancing Reference)

> Three archetypes that can clear Chapter 1–2 content.
> These serve as baseline tuning targets, not prescriptive guides for players.

---

## Build A — Blade Fury Crit Samurai

**Archetype:** Melee Crit · Katana · High single-target burst  
**Chapter 1 clear power:** ~180 | **Chapter 2 clear power:** ~380

### Core Skills
| Slot | Skill Rune | Linked Support Runes |
|------|-----------|----------------------|
| 1 | Shadow Slash (skill_rune_shadowslash) | Keen Edge (link_rune_crit_amplify), Crimson Fury (link_rune_bleed_on_crit) |
| 2 | Storm Step (skill_rune_stormstep) | Steel Edge (link_rune_addedfire) |

### Passive Web Priorities
1. `node_dex_001` → `node_atk_crit_001` → `node_atk_crit_002`
2. `keystone_blade_fury` — Strike skills hit twice, less damage per hit (total increases with attack speed)
3. `node_crit_build_001` → `node_crit_build_002` → `keystone_assassin_mark`
4. `notable_swift_reflexes` for attack speed and dodge

### Item Affixes (Priority)
- Weapon: `affix_crit_chance`, `affix_crit_damage`, `affix_attack_speed`
- Amulet: `affix_crit_multiplier_on_full_hp`
- Gloves: `affix_attack_speed`

### Playstyle
Shadow Slash crits deal ×4 damage (Blade Fury doubles hits, Assassin's Mark gives ×2 crit mult).
Crimson Fury bleeds keep DoT ticking between crit windows.
Storm Step as gap-closer vs mobile enemies.

### Balance Targets
- vs Chapter 1 Common: TTK 2–4s ✓
- vs Oni General (boss): TTK 20–35s ✓
- vs Chapter 2 Common: TTK 3–5s ✓

---

## Build B — Toxic Bloom Poison Assassin

**Archetype:** Poison DoT · Tanto/Kunai · Sustained AoE damage  
**Chapter 1 clear power:** ~160 | **Chapter 2 clear power:** ~350

### Core Skills
| Slot | Skill Rune | Linked Support Runes |
|------|-----------|----------------------|
| 1 | Venom Strike (skill_rune_venom_strike) | Poison Infusion (link_rune_poison_infusion), Crimson Edge (link_rune_bleed) |
| 2 | Silk Nova (skill_rune_silk_nova) | Chain Hit (link_rune_chain_hit) |

### Passive Web Priorities
1. `node_int_001` → `node_int_002` → `node_poison_001` → `node_poison_002` → `node_poison_003`
2. `keystone_toxic_bloom` — Poison explodes on enemy death dealing 50% remaining DoT AoE
3. `notable_elemental_attunement` for chaos/poison resistance boost

### Item Affixes (Priority)
- Weapon (Tanto/Kunai): `affix_bleed_chance`, `affix_bleed_damage`
- Gloves: `affix_bleed_chance`
- Amulet: `affix_bleed_duration`, `affix_cold_damage`

### Playstyle
Apply 2× Poison stacks with Venom Strike; when a Poison-stacked enemy dies, Toxic Bloom explodes
dealing 50% remaining DoT as AoE — clears packs instantly. Silk Nova with Chain Hit cleans up
Chaos-resistant stragglers. Bleed from Crimson Edge adds Physical DoT layer vs barrier enemies.

### Balance Targets
- vs Chapter 1 Common: TTK 3–6s (DoT wind-up) ✓
- vs Oni General: TTK 25–40s ✓
- vs Jorogumo: TTK 35–55s (spider adds spawn slow) ✓

---

## Build C — Spirit Barrier Ward Priest

**Archetype:** Spirit/Holy Damage · Tanky · Effective vs Yokai  
**Chapter 1 clear power:** ~150 | **Chapter 2 clear power:** ~320

### Core Skills
| Slot | Skill Rune | Linked Support Runes |
|------|-----------|----------------------|
| 1 | Spirit Arrow (skill_rune_spirit_arrow) | Piercing Shot (link_rune_pierce), Steel Edge (link_rune_addedfire) |
| 2 | Storm Step (skill_rune_stormstep) | — |

### Passive Web Priorities
1. `node_resist_001` → `node_resist_002` → `node_barrier_001` → `node_barrier_002`
2. `keystone_spirit_shield` — Barrier blocks all damage types including Bleed
3. `notable_iron_will` — Last-stand effect once per fight
4. `notable_elemental_attunement` for Holy/Spirit resistance penetration

### Item Affixes (Priority)
- Chest/Helmet: `affix_max_barrier`, `affix_barrier_regen`, `affix_max_hp`
- Boots: `affix_dodge_chance`
- Ring/Amulet: `affix_all_resistances`

### Playstyle
High barrier regen means the player soaks damage through Barrier rather than dodging.
Spirit Arrow with Pierce hits multiple Yokai in a line for massive Spirit bonus damage.
Iron Will prevents one-shot deaths during Chapter 2 elite packs. Play at range; use Storm Step
only as emergency repositioning.

### Balance Targets
- vs Chapter 1 Common: TTK 4–7s (ranged pacing) ✓
- vs Chapter 2 Haunted Forest (Yokai): TTK 3–5s (Spirit bonus active) ✓
- vs Jorogumo: TTK 30–50s (Barrier soaks web grab) ✓

---

## Build Diversity Summary

| Build | Damage Type | Primary Resource Drain | Kill Method | Boss Priority |
|-------|------------|------------------------|-------------|---------------|
| Blade Fury Crit | Physical | High | Burst crits | Shadow Slash spam |
| Toxic Bloom | Poison + Physical DoT | Low | DoT explosion | Venom stack then burst |
| Spirit Barrier | Holy/Spirit | Medium | Sustained hits | Spirit Arrow pierce |

All three can clear both chapters without respec, validating the rune + passive systems create
meaningful build identity beyond stat totals.
