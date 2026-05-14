# CursedJP — Skill Runes & Support Runes Reference
> Designed specifically for *Cursed Japan ARPG* based on GDD v1.0.
> Runes follow the game's Japan-themed setting (samurai, ninja, yokai, spirits, priests).
> Organized by development phase. Phase 1 is intentionally minimal (MVP vertical slice).
> Damage types: Physical · Fire · Cold · Lightning · Poison · Bleed · Holy/Spirit · Chaos/Curse

---

## Table of Contents
1. [Rune System Rules](#rune-system-rules)
2. [Skill Tags Reference](#skill-tags-reference)
3. [Phase 1 — MVP (Vertical Slice)](#phase-1--mvp-vertical-slice)
4. [Phase 2 — Early Content Expansion](#phase-2--early-content-expansion)
5. [Phase 3 — Mid-Game Unlock](#phase-3--mid-game-unlock)
6. [Phase 4 — Endgame & Build Diversity](#phase-4--endgame--build-diversity)
7. [Support Rune Compatibility Matrix](#support-rune-compatibility-matrix)

---

## Rune System Rules

| Rule | Detail |
|---|---|
| Max active skills | 4 skill runes equipped at once |
| Support slots per skill | Up to 4 (expandable via gear/grade) |
| Slot colors | Red (STR) · Green (DEX) · Blue (INT) |
| Support compatibility | Support Rune must match slot color AND skill tags |
| Weapon restriction | Some Skill Runes require a specific weapon family equipped |
| Drop source | Runes drop from enemies, bosses, and crafting — never quest-unlocked |
| Starting runes | 2 Skill Runes given at game start (see Phase 1) |
| Conversion limit | Only 1 Damage Conversion support per Skill Rune |
| DoT exceptions | DoT skips Dodge check, cannot Crit unless explicitly stated |

---

## Skill Tags Reference

| Tag | Meaning |
|---|---|
| **Attack** | Scales with attack stats; uses weapon base damage |
| **Spell** | Scales with spell/spirit stats; cast-based |
| **Melee** | Hits at melee range |
| **Projectile** | Fires a projectile entity |
| **AoE** | Deals damage in an area |
| **Strike** | Discrete hit(s); subject to crit, dodge, hit rules |
| **DoT** | Damage over time tick; skips dodge, no crit by default |
| **Channel** | Sustained skill held to activate |
| **Duration** | Effect persists for a timed window |
| **Toggle** | Persistent on/off mode; drains resource while active |
| **Movement** | Repositions the player character |
| **Physical** | Physical damage type |
| **Fire** | Fire elemental type |
| **Cold** | Cold elemental type |
| **Lightning** | Lightning elemental type |
| **Poison** | Toxic/poison type; commonly DoT |
| **Bleed** | Physical DoT type; bypasses Barrier by default |
| **Spirit / Holy** | Spirit/divine type; effective vs yokai and undead |
| **Curse / Chaos** | True damage / bypass type; ignores some resistances |
| **Minion** | Summons a persistent entity that acts independently |
| **Shout** | Buff/debuff aura-type activation |
| **Stance** | Changes player combat mode |
| **Trap** | Placed triggered mechanism |

---

## Phase 1 — MVP (Vertical Slice)

> **Scope:** 2 starting Skill Runes + 2 unlockable drops in Region 1.
> **Support Runes:** 8 total — simple, readable, no complex chains.
> **Design goal:** Validate core loop. Player must feel two distinct playstyles (melee vs ranged) from the start.

### Phase 1 — Skill Runes

| # | Rune Name | JP Flavor Name | Weapon | Tags | Description | Unlock |
|---|---|---|---|---|---|---|
| S01 | **Falling Blade** | 抜刀斬 *(Battōzan)* | Katana · Nodachi · Naginata | Attack · Melee · AoE · Strike · Physical | Draw-slash that hits all enemies in a frontal arc. Core starter melee skill. SkillCoef 1.2 | **Starting Rune A** |
| S02 | **Reed Arrow** | 葦矢 *(Ashiya)* | Yumi | Attack · Projectile · Strike · Physical | Fast single arrow with moderate pierce. Core starter ranged skill. SkillCoef 1.0 | **Starting Rune B** |
| S03 | **Shadow Dash** | 影走り *(Kagehashiri)* | Any | Attack · Melee · Strike · Physical · Movement | Dash through enemies in a line dealing physical damage. CD 5s, Mana 4 | Region 1 enemy drop |
| S04 | **Ember Strike** | 炎撃 *(Engeki)* | Katana · Nodachi · Shakujo | Attack · Melee · Strike · Fire | Quick fire-infused slash; applies Ignite on hit. SkillCoef 1.1, Mana 5 | Region 1 boss drop |

---

### Phase 1 — Support Runes (Link Runes)

> Simple modifiers only. No activation chains or complex conditionals in Phase 1.

| # | Rune Name | JP Flavor Name | Color | Compatible Tags | Effect |
|---|---|---|---|---|---|
| L01 | **Steel Edge** | 鋼刃 *(Kōba)* | 🔴 Red | Attack · Physical | +Flat Physical Damage to linked skill |
| L02 | **Keen Eye** | 鷹眼 *(Takame)* | 🟢 Green | Attack · Strike | +Critical Hit Rate |
| L03 | **Swift Strike** | 疾撃 *(Shigeki)* | 🟢 Green | Attack | +Attack Speed |
| L04 | **Spread Shot** | 散射 *(Sansha)* | 🟢 Green | Projectile (no Channel/Minion/Movement) | Fires 1 additional projectile |
| L05 | **Fierce Blow** | 豪打 *(Gōda)* | 🔴 Red | Melee · Strike | +Melee Damage Amplification (×1.15) |
| L06 | **Vital Strike** | 急所打 *(Kyūshouchi)* | 🟢 Green | Strike (no Toggle/Minion) | Increases damage vs enemies above 70% HP |
| L07 | **Lasting Wound** | 深傷 *(Fukakizu)* | 🔴 Red | Physical · Strike | Hits apply a short Bleed DoT (bypasses Barrier) |
| L08 | **Mana Saver** | 節術 *(Setsujutsu)* | 🔵 Blue | Any Skill (no Toggle) | Reduces linked skill Mana cost by 20% |

---

## Phase 2 — Early Content Expansion

> **Scope:** Regions 2–3 unlocked. Introduce Spirit/Poison elements, first Minion, Stances, and more support depth.
> **New Skill Runes:** 8 | **New Support Runes:** 10
> **Design goal:** Add elemental buildcraft and introduce first DoT/Minion options.

### Phase 2 — Skill Runes

| # | Rune Name | JP Flavor Name | Weapon | Tags | Description | Unlock |
|---|---|---|---|---|---|---|
| S05 | **Serpent Fang** | 蛇牙 *(Jaga)* | Tanto · Kunai | Attack · Melee · Strike · Poison | Fast dagger strike; stacks Poison DoT per hit. SkillCoef 0.9, Mana 3 | Region 2 enemy drop |
| S06 | **Ofuda Bolt** | 御札弾 *(Ofudadan)* | Shakujo · Ofuda/Scroll | Spell · Strike · Spirit · Projectile | Fires a paper talisman bolt dealing Spirit/Holy damage. Good vs Yokai. SkillCoef 1.1, Mana 5 | Region 2 boss drop |
| S07 | **Ghost Volley** | 霊矢連射 *(Reiya Rensha)* | Yumi | Attack · Projectile · Strike · Physical · Spirit | Fires 3 arrows in a spread; one is spirit-infused. SkillCoef 0.85×3, Mana 6 | Region 2 chest |
| S08 | **Cursed Sweep** | 呪斬 *(Noritan)* | Naginata · Nodachi | Attack · Melee · AoE · Strike · Physical · Curse | Wide spinning sweep; applies Curse debuff (−resist) on hit. Mana 6, CD 6s | Region 2 miniboss drop |
| S09 | **Summon Kodama** | 木霊召喚 *(Kodama Shōkan)* | Any | Spell · Minion · Spirit | Summons a small Kodama spirit that attacks with spirit damage. Mana 20, CD 3s | Region 3 boss drop |
| S10 | **Oni Slam** | 鬼叩 *(Oni Tataki)* | Nodachi · Shakujo | Attack · Melee · AoE · Strike · Physical | Leaps and slams the ground; radius explosion. Mana 5, CD 4s, Knockback | Region 3 enemy drop |
| S11 | **Frost Shuriken** | 氷手裏剣 *(Kōri Shuriken)* | Tanto · Kunai · Yumi | Attack · Projectile · Strike · Cold | Spinning ice shuriken piercing enemies; applies Chill. SkillCoef 1.0, Mana 4 | Region 3 enemy drop |
| S12 | **Samurai's Wrath** | 武士の怒り *(Bushi no Ikari)* | Katana · Nodachi | Spell · Attack · Enhance · Duration · Stance | Stance skill: +Physical DMG, +Attack Speed, +Bleed chance for 12s. Mana 18, CD 20s | Region 3 shrine event |

---

### Phase 2 — Support Runes

| # | Rune Name | JP Flavor Name | Color | Compatible Tags | Effect |
|---|---|---|---|---|---|
| L09 | **Venom Coat** | 毒塗り *(Doku-nuri)* | 🟢 Green | Poison · Strike | +Flat Poison DoT per stack; extends Poison duration |
| L10 | **Spreading Curse** | 呪拡 *(Norihiro)* | 🔵 Blue | Curse · Strike | Curse spreads to 1 nearby enemy on kill |
| L11 | **Piercing Edge** | 貫通刃 *(Kantsūba)* | 🔴 Red | Physical · Strike · Projectile | Reduces enemy Armor Mitigation by 10% per hit |
| L12 | **Chain Spirit** | 連霊 *(Renrei)* | 🔵 Blue | Spirit · Strike · Projectile | Projectile or hit chains to 1 additional nearby enemy |
| L13 | **Minion Speed** | 式速 *(Shikisoku)* | 🔵 Blue | Minion | +Minion Attack Speed and Movement Speed |
| L14 | **Minion Endure** | 式耐 *(Shikitai)* | 🔵 Blue | Minion | +Minion HP and Armor |
| L15 | **Multishot** | 連射 *(Rensha)* | 🟢 Green | Projectile (no Channel/Toggle/Minion/Movement) | Fires 2 additional projectiles (total 3 path spread) |
| L16 | **Exploit Weakness** | 急所突 *(Kyūshotsuki)* | 🟢 Green | Strike (no Toggle/Minion) | +30% damage vs Poisoned or Cursed enemies |
| L17 | **Armor Shatter** | 鎧砕 *(Yoroi Kudaki)* | 🔴 Red | Melee · Strike · Physical | Applies Armor Shred debuff on hit (stacks ×3) |
| L18 | **Spirit Amplify** | 霊増幅 *(Rei Zōfuku)* | 🔵 Blue | Spirit · Spell | ×1.2 Spirit/Holy damage amplification (multiplicative) |

---

## Phase 3 — Mid-Game Unlock

> **Scope:** Regions 4–6. Introduce Lightning/Fire elemental builds, Traps, Totems, Shouts, and Summon diversity.
> **New Skill Runes:** 10 | **New Support Runes:** 12
> **Design goal:** Full elemental build diversity. Support chains (Activation-type links) introduced.

### Phase 3 — Skill Runes

| # | Rune Name | JP Flavor Name | Weapon | Tags | Description | Unlock |
|---|---|---|---|---|---|---|
| S13 | **Thunder Slash** | 雷斬 *(Raisan)* | Katana · Nodachi | Attack · Melee · Strike · Lightning | Strike sends a lightning arc through enemies in a line. Applies Shock. Mana 5 | Region 4 enemy drop |
| S14 | **Fire Pillar** | 炎柱 *(Enchū)* | Shakujo · Ofuda/Scroll | Spell · AoE · Strike · Fire | Summons a rising fire pillar at target location. Mana 8, CD 3s | Region 4 boss drop |
| S15 | **Kunai Storm** | 苦無嵐 *(Kunai Arashi)* | Tanto · Kunai | Attack · AoE · Projectile · Strike · Physical | Throws a burst of 8 kunai in a cone. SkillCoef 0.7×8, Mana 7 | Region 4 miniboss drop |
| S16 | **Spirit Ward Totem** | 霊護柱 *(Reigo Bashira)* | Any | Spell · Totem · Duration | Places a totem that reduces enemy DMG and increases ally Spirit Resist nearby. Mana 20, CD 1s | Region 4 shrine event |
| S17 | **Whirlwind Katana** | 旋風 *(Senpū)* | Katana | Attack · Melee · AoE · Channel · Strike · Physical | Channel: spin-attack dealing continuous physical damage in all directions. Mana 3/tick | Region 5 enemy drop |
| S18 | **Lightning Trap** | 雷罠 *(Kaminari Wana)* | Any | Attack · Trap · Strike · Lightning · AoE | Placed trap that erupts with lightning on enemy trigger. Applies Shock. Mana 5 | Region 5 chest |
| S19 | **Battle Cry** | 雄叫び *(Otakebi)* | Any | Spell · AoE · Shout · Duration | Shout that boosts own Physical DMG and Armor for 10s, taunts nearby enemies. Mana 15, CD 15s | Region 5 boss drop |
| S20 | **Summon Oni Shadow** | 鬼影召喚 *(Oni Kage Shōkan)* | Any | Spell · Minion · Physical · AoE · Melee | Summons a heavy Oni melee fighter that charges enemies and knocks back. Mana 40, CD 30s | Region 5 boss drop (rare) |
| S21 | **Blizzard Fan** | 吹雪扇 *(Fubuki Ōgi)* | Naginata · Ofuda/Scroll | Spell · AoE · Strike · Cold | Spreads a wide blizzard fan; Freezes on full chill stacks. Mana 12, CD 5s | Region 6 enemy drop |
| S22 | **Death Spiral** | 死螺旋 *(Shi Rasen)* | Tanto · Kunai · Katana | Attack · Melee · AoE · Strike · Physical · Bleed | Rapid multi-hit spiral; each hit stacks Bleed. High hit count, low per-hit coef. Mana 6 | Region 6 boss drop |

---

### Phase 3 — Support Runes

| # | Rune Name | JP Flavor Name | Color | Compatible Tags | Effect |
|---|---|---|---|---|---|
| L19 | **Ignite** | 点火 *(Tenka)* | 🔴 Red | Fire · Strike | Fire hits apply Ignite DoT; killing Ignited enemies triggers explosion |
| L20 | **Blazing Burst** | 爆炎 *(Bakuen)* | 🔴 Red | Fire · Strike (no Toggle/Minion) | Killing an Ignited enemy creates a Fire Explosion in AoE |
| L21 | **Continuous Shock** | 連電 *(Renden)* | 🔵 Blue | Lightning · Strike | Extends Shock duration; Shocked enemies take +15% DMG from all sources |
| L22 | **Flash Conductor** | 閃電 *(Senden)* | 🔵 Blue | Lightning · Strike · Projectile | Chains lightning to 2 additional nearby enemies on hit |
| L23 | **Frost Lock** | 氷封 *(Hyōfū)* | 🔵 Blue | Cold · Strike | Extends Chill; Chill stacks trigger Freeze at threshold |
| L24 | **Frost Shatter** | 氷砕 *(Hyō Kudaki)* | 🔵 Blue | Cold · Strike | Frozen enemies take +25% Physical and Cold DMG on next hit; clears Freeze |
| L25 | **Trap Range** | 罠範囲 *(Wana Han'i)* | 🟢 Green | Trap | Expands trap trigger and explosion radius |
| L26 | **Trap Barrage** | 連罠 *(Renwana)* | 🟢 Green | Trap · Projectile | Trap fires multiple projectiles instead of one |
| L27 | **Totem Affinity** | 式縁 *(Shiki-en)* | 🔵 Blue | Totem | Totem stats scale with caster INT/Spirit stats |
| L28 | **Extended Totem** | 永久柱 *(Eikyū Bashira)* | 🔵 Blue | Totem | Totem duration ×1.5 |
| L29 | **Shout Amplify** | 叫増幅 *(Sakebi Zōfuku)* | 🔴 Red | Shout | Shout effect magnitude increased by 25% |
| L30 | **Spell on Melee Hit** | 打呪発動 *(Uchiju Hatsudō)* | 🔵 Blue | Attack · Melee (register Spell in adjacent slot) | Triggers linked Spell Skill when melee attack lands |

---

## Phase 4 — Endgame & Build Diversity

> **Scope:** Regions 7+, Pagoda Tower, Cursed Variant zones.
> **New Skill Runes:** 8 | **New Support Runes:** 10
> **Design goal:** Build-defining, exotic, and conversion-heavy runes that create late-game identity. Include rare boss-only drops.

### Phase 4 — Skill Runes

| # | Rune Name | JP Flavor Name | Weapon | Tags | Description | Unlock |
|---|---|---|---|---|---|---|
| S23 | **Cursed Moon Slash** | 呪月斬 *(Noriduki San)* | Katana · Nodachi | Attack · Melee · AoE · Strike · Physical · Curse | Giant crescent slash; Curse debuff reduces enemy resistance by 20% for 5s. Boss-tier. Mana 12 | Endgame boss drop |
| S24 | **Divine Talisman Rain** | 神符雨 *(Shinpu Ame)* | Ofuda/Scroll | Spell · AoE · Strike · Spirit · Projectile | Rains 12 talismans onto target area; each hit deals Spirit DMG. Mana 25, CD 8s | Pagoda Floor 5+ drop |
| S25 | **Poison Miasma Cloud** | 毒霧陣 *(Dokugiri Jin)* | Any | Spell · AoE · DoT · Poison · Duration | Places a persistent poison cloud for 8s; deals stacking Poison DoT/tick to all inside. Mana 20, CD 10s | Region 7 boss drop |
| S26 | **Summon Tengu Archer** | 天狗弓兵 *(Tengu Yūhei)* | Any | Spell · Minion · Projectile · Spirit · Strike | Summons a Tengu who fires rapid spirit-infused arrows. High single-target DPS minion. Mana 45, CD 40s | Endgame boss drop (rare) |
| S27 | **Void Katana** | 虚無刀 *(Komu-tō)* | Katana | Attack · Melee · Strike · Chaos / Curse | Cuts through all resistances; deals Chaos damage that bypasses Armor and Resistance. Low coef, high penetration. Mana 8 | Pagoda Floor 10+ drop |
| S28 | **Ryū no Ikari (Dragon's Wrath)** | 龍の怒り | Nodachi · Shakujo | Spell · AoE · Strike · Fire · Lightning | Dragon energy burst hitting in a large cross-pattern with Fire+Lightning mixed damage. Mana 30, CD 12s | Final region boss drop |
| S29 | **Phantom Steps** | 幻歩 *(Maboroshi Ayumi)* | Tanto · Kunai | Attack · Movement · Strike · Physical | Blink to 3 separate enemies in sequence dealing strikes; resets CD on kill. Mana 6, CD 8s | Endgame chest |
| S30 | **Iron Fortress** | 鉄城 *(Tetsujō)* | Any (Shield off-hand required) | Spell · Defense · Enhance · Stance · Duration | Enters defensive stance: massively increases Armor and Barrier Regen; reduces Movement Speed. Mana 20, CD 20s | Region 7 shrine event |

---

### Phase 4 — Support Runes

| # | Rune Name | JP Flavor Name | Color | Compatible Tags | Effect |
|---|---|---|---|---|---|
| L31 | **Convert to Fire** | 火転換 *(Hi Tenkan)* | 🔴 Red | Physical · Attack (no other Convert) | Converts 50% of Physical Damage to Fire Damage |
| L32 | **Convert to Cold** | 氷転換 *(Kōri Tenkan)* | 🔵 Blue | Physical · Attack (no other Convert) | Converts 50% of Physical Damage to Cold Damage |
| L33 | **Convert to Lightning** | 雷転換 *(Kaminari Tenkan)* | 🔵 Blue | Physical · Attack (no other Convert) | Converts 50% of Physical Damage to Lightning Damage |
| L34 | **Convert to Spirit** | 霊転換 *(Rei Tenkan)* | 🔵 Blue | Any DMG · Spell (no other Convert) | Converts 40% of any damage to Spirit/Holy Damage |
| L35 | **Bleed Explosion** | 血爆 *(Ketsubaku)* | 🔴 Red | Physical · Strike · Bleed | Killing a Bleeding enemy triggers physical explosion (AoE); does not consume Bleed stack |
| L36 | **Finishing Strike** | 止め *(Tome)* | 🟢 Green | Strike (no Toggle/Minion) | +40% damage to enemies below 30% HP |
| L37 | **Spell on Kill** | 殺呪発動 *(Satsuju Hatsudō)* | 🟢 Green | Strike (register Spell in adjacent slot) | Triggers linked Spell Skill on enemy kill |
| L38 | **Element Mastery** | 元素極意 *(Genso Gokui)* | 🔵 Blue | Elemental DMG (Fire·Cold·Lightning·Spirit) | ×1.25 multiplier to all Elemental Damage (multiplicative bucket) |
| L39 | **Reduce Cooldown** | 術速 *(Jutsusoku)* | 🔵 Blue | Skills with Cooldown (no Toggle) | Reduces linked skill cooldown by 25% |
| L40 | **Minion Sacrifice** | 式爆 *(Shikibaku)* | 🔴 Red | Minion | On Minion death → triggers physical explosion; nearby enemies take AoE DMG |

---

## Support Rune Compatibility Matrix

> Quick reference for which Support Runes work with each Skill Rune category. ✅ = Compatible, ⚠️ = Conditional, ❌ = Incompatible.

| Support Rune | Melee Attack | Ranged Projectile | Spell | DoT / Poison | Minion | Totem / Trap | Shout / Stance |
|---|---|---|---|---|---|---|---|
| Steel Edge (L01) | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Keen Eye (L02) | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Swift Strike (L03) | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Spread / Multishot (L04/L15) | ❌ | ✅ | ⚠️ Projectile Spell only | ❌ | ❌ | ❌ | ❌ |
| Fierce Blow (L05) | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Lasting Wound (L07) | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Venom Coat (L09) | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Piercing Edge (L11) | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Chain Spirit (L12) | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Exploit Weakness (L16) | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Ignite (L19) | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ Trap | ❌ |
| Spirit Amplify (L18) | ❌ | ⚠️ Spirit only | ✅ | ❌ | ✅ Spirit Minion | ✅ Spirit Totem | ❌ |
| Spell on Melee Hit (L30) | ✅ (triggers spell) | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Element Mastery (L38) | ⚠️ Elemental only | ⚠️ Elemental only | ✅ | ⚠️ Poison/Spirit only | ✅ Elemental Minion | ✅ | ❌ |
| Convert Runes (L31–L34) | ✅ | ✅ | ⚠️ L34 only | ❌ | ❌ | ❌ | ❌ |
| Finishing Strike (L36) | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ |
| Minion Speed/Endure/Sacrifice (L13/L14/L40) | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| Totem Affinity / Extended (L27/L28) | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ Totem only | ❌ |
| Shout Amplify (L29) | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ Shout only |
| Reduce Cooldown (L39) | ⚠️ Has CD only | ⚠️ Has CD only | ✅ | ⚠️ Has CD only | ❌ | ✅ | ✅ |

---

## Phase Summary

| Phase | Regions | Skill Runes Added | Support Runes Added | New Mechanics Introduced |
|---|---|---|---|---|
| Phase 1 — MVP | Region 1 | 4 (2 starting) | 8 | Core melee + ranged; Bleed; basic support |
| Phase 2 — Early | Regions 2–3 | 8 | 10 | Poison, Spirit, Curse, first Minion, Stance |
| Phase 3 — Mid | Regions 4–6 | 10 | 12 | Lightning, Traps, Totems, Shouts, Spell-on-Hit chain |
| Phase 4 — Endgame | Region 7+, Pagoda | 8 | 10 | Conversion, Chaos/True DMG, exotic bosses, advanced synergies |
| **Total** | | **30 Skill Runes** | **40 Support Runes** | Full build system |

---

*CursedJP Rune Reference v1.0 — Generated for alphakey-marketing/-cursedjp*
*Aligned with GDD v1.0, Damage Pipeline v1.0, and Japan ARPG setting.*
