# Cursed Japan ARPG — Game Design Document v1.0

## Overview

This project is a browser-first action RPG with idle support, built around a connected overworld, targeted boss farming, and build-defining rune drops. The core fantasy is: a wandering warrior explores a cursed Japan and hunts bosses for runes that reshape their build.[cite:41][cite:69]

The design intentionally narrows scope to fit a React + Phaser production path rather than a full AAA action RPG. The game emphasizes readable progression, finite endgame tiers, strong loot identity, and selective manual play for meaningful encounters instead of large-scale MMO simulation.[cite:71][cite:74]

## Vision

The game combines several proven motivations into one loop: freeform build growth inspired by rune-based ARPG systems, open-area farming and boss chasing, story chapters that enrich the world, and idle progression that keeps long-term play rewarding.[cite:69][cite:74] The goal is not endless enemy scaling; earlier zones remain weak so players can return and feel dramatically stronger, while harder areas are visible early and act as long-term aspirations rather than locked content.[web:77][web:80]

The intended experience is a hybrid of auto-flow and high-value intervention. Normal enemies are largely cleared through low-control combat and idle farming, while bosses become the main moments of tension, loot payoff, and build validation.[cite:41][web:85]

## Pillars

### Build identity

Builds are defined through weapon families, skill runes, support links, passive web routes, and equipment affixes. The player starts with only two basic skill runes, but over time assembles a personalized four-skill loadout shaped by target-farmed boss drops and gear specialization.[cite:69]

### Power fantasy

Power growth must be visible and permanent. Early areas do not scale upward with the player, which preserves the pleasure of returning to old maps and overwhelming once-dangerous enemies.[web:77][web:80]

### Boss hunting

Bosses are the premium source of build-defining rewards. Common enemies supply experience, common materials, and low-tier drops, but manual boss kills are the primary source of rare runes, signature uniques, and major progression spikes.[web:85][web:91]

### Efficient scope

The project is designed for a browser implementation using React and Phaser, with fake open-world complexity instead of true MMO roaming. The overworld should feel broad and interconnected while remaining technically manageable through node-based regions, camps, shrines, and arenas.[web:56][cite:71]

## Platform and audience

The target platform is browser, with a technical direction aligned to React for meta systems and Phaser for combat presentation and moment-to-moment encounters.[web:53][web:56] The target audience includes players who enjoy ARPG buildcraft, boss farming, idle progression, and structured long-term progression inspired by games such as Undecember and Path of Exile.[cite:69]

The game is single-player first. Social systems, trading, guilds, PvP, and large shared-world features are intentionally excluded from v1 in order to keep the project finishable and to validate the core loop before expanding scope.[cite:71][cite:74]

## World and setting

The setting is a cursed version of ancient Japan populated by samurai, ninja, pirates, daimyo, yokai, monsters, and gods. This creates room for grounded human enemies, folklore-driven creatures, supernatural bosses, and escalating mythic stakes across later chapters.

The protagonist is a blank-slate customizable warrior. Character origin is cosmetic only in v1, allowing appearance and role-play flexibility without forcing branching mechanical starts.

## Overworld structure

The game presents a single continuous-feel overworld rather than a truly free-roaming simulation. In practice, this is implemented as a connected regional map with traversable links between combat nodes, shrines, camps, miniboss zones, and boss arenas, which supports the feeling of an open world without the production cost of fully simulated exploration.[web:87][web:90]

### Region design

Each region contains:

- Enemy camps for repeatable farming.
- Shrine checkpoints for respawn and safe return.
- Miniboss spots for mid-tier rewards.
- One or more major boss arenas.
- Environmental theme and enemy family identity.

All regions are visible or discoverable early, but high-level regions remain practically inaccessible until the player’s build and gear are strong enough. This creates natural progression through danger rather than through hard locks, which is a known and effective open-world RPG structure.[web:77][web:80]

### Navigation

Navigation uses auto-routing and node-based movement. The player does not need to manually walk a character around an expansive world in real time; instead, the game provides the feeling of traversing a connected landscape through efficient map interaction and lightweight scene transitions. This is the recommended compromise for browser scope and performance.[cite:71][web:57]

## Core loop

The main loop is:

1. Choose a region, camp, miniboss, or boss target.
2. Auto-farm normal enemies for EXP, crafting materials, and common drops.
3. Improve runes, gear, passive nodes, and crafting outcomes.
4. Attempt stronger bosses manually for rare runes and signature items.
5. Unlock more viable regions and chapter progress.
6. Return to easier areas as an overpowered hunter or push into harder content.

This loop is reinforced by offline progression. When away from the game, the player accumulates EXP and materials from eligible zones, which sustains momentum and supports long-term retention without replacing the value of active boss kills.[cite:41]

## Combat model

Combat is a hybrid of automation and intervention. Normal enemy clearing is primarily auto-resolved or low-control, supporting idle play and long sessions. Boss fights are the major manual layer, especially later in progression.[cite:41]

### Boss structure

Bosses follow a mixed model:

- Early bosses are mostly stat and timing checks.
- Later bosses introduce more telegraphed attacks and mechanic checks.
- Telegraphs should be readable and limited, not full twitch-action complexity.

This approach fits browser production realities while still allowing bosses to feel more active and authored over time.[web:75][web:81][cite:71]

### Control philosophy

The player should not be burdened with intensive movement and dodge systems at the start. The initial manual interaction focus is on skill timing, defensive response, burst windows, interrupt timing, and build readiness. This keeps the game approachable and consistent with the intended action-idle identity.

## Skills and rune systems

The build system is intentionally close to the appeal of rune-driven ARPGs. It consists of two connected layers: a skill-link system and a passive spider web.[cite:69]

### Skill runes

- The player begins with two basic skill runes.
- Skill runes are pure drops rather than quest unlocks.
- Up to four active skills can be equipped at full build.
- Players have full freedom in skill selection, subject to weapon compatibility rules.

### Support links

Support or link runes modify skill behavior, coefficients, damage types, hit patterns, on-hit effects, and utility. Examples include extra projectiles, damage conversion, added DoT, wider area, burst multipliers, or resource interactions.

### Weapon restrictions

Weapon-exclusive runes can only be equipped if the matching weapon family is equipped. This creates build constraints naturally, without forcing a rigid class system.

### Passive spider web

The passive system combines two node types:

- Edge nodes: small stat increases such as attack, crit, resistances, HP, dodge, barrier, or resource support.
- Cluster keystones: larger build-shaping nodes near key skill clusters.

This structure is intended to preserve the feeling of meaningful pathing and specialization while remaining lighter than a massive full-scale passive atlas.[cite:69]

## Weapon families and equipment

The equipment system follows an Undecember-style philosophy, adapted to an ancient Japan setting and the project’s scope. Weapons create major playstyle identity, while armor, accessories, charms, affixes, and sockets shape the deeper expression of each build.

### Equipment slots

The planned slots are:

- Main weapon
- Off-hand
- Helmet
- Chest
- Gloves
- Boots
- Ring 1
- Ring 2
- Amulet
- Charm

Off-hand supports both sub-weapons and shield/scroll-style items, allowing offensive and defensive secondary identities.

### Weapon families

| Weapon family | Role | Example identity |
| --- | --- | --- |
| Katana | 1H balanced/fast | slashes, bleed, combo strings |
| Nodachi | 2H heavy | burst, cleave, high base damage |
| Tanto / Kunai | 1H dagger | high crit, poison, rapid hits |
| Naginata | 2H polearm | sweep arcs, control, reach |
| Yumi | ranged bow | projectile, pierce, kiting-style builds |
| Shakujo / Staff | hybrid caster-melee | spirit damage, spell scaling |
| Ofuda / Scroll | off-hand caster tool | elemental and support synergy |

### Item grades

The intended progression ladder is:

- Normal
- Magic
- Rare
- Legendary
- Unique
- Holy

Higher grades unlock more affix slots, higher-tier option pools, and access to rarer build-defining effects.

### Armor and defense identity

Armor ties defensive identity to attribute leaning:

- Strength-oriented gear emphasizes Armor and HP.
- Dexterity-oriented gear emphasizes Dodge and evasion-style defense.
- Intelligence-oriented gear emphasizes Barrier and magical resilience.
- Hybrid gear supports mixed defenses.

This mapping is intentionally aligned with the six-stage combat pipeline so that defense layers remain legible rather than collapsing into one abstract survivability number.

## Damage model

The game uses a six-stage damage and defense pipeline so each system has a clear function in buildcraft and balancing.

### Stage pipeline

1. Base construction: build the raw hit from skill coefficient, source damage, and flat bonus.
2. Type conversion: optionally convert portions of damage into another damage type.
3. Offensive scaling: apply additive increases and then multiplicative amplifiers in separate buckets.
4. Crit resolution: apply crit expectation or crit outcome after offensive scaling.
5. Hit outcome: determine miss, dodge, or successful hit before mitigation.
6. Defense mitigation and application: apply defense layers, then subtract from barrier/shield first and HP second.

### Reference equations

Base damage:

```text
Base = SkillCoef × SourceDamage + FlatDamage
```

Type conversion:

```text
ConvertedBase = Base × (1 − conv%) + (Base × conv%)
```

Offensive scaling:

```text
Scaled = ConvertedBase × (1 + ΣAdditiveIncreases) × (1 + Amp_i)
```

Crit expectation:

```text
ExpectedAfterCrit = Scaled × [(1 − CritChance) + CritChance × (1 + CritBonus)]
```

Defense mitigation:

```text
Mitigated = DamageBeforeDefense × (1 − AvoidanceEffective) × (1 − ArmorMitigation) × (1 − ResistanceMitigation) × (1 − ΣDamageTakenDecrease) × (1 − Dampening_i)
```

### Implementation rules

- Additive increases and multiplicative amplifiers must remain in distinct buckets.
- Crit multiplies the fully-built offensive hit, not the raw base.
- Armor mitigates physical portions; resistances mitigate elemental portions.
- Dodge and miss are resolved before mitigation as binary or probability outcomes.
- Barrier absorbs damage before HP.
- Penetration modifies final mitigation values and must be kept separate from conversion.

### Damage types

The damage type set follows a broad Undecember-like model:

- Physical
- Fire
- Cold
- Lightning
- Poison / Toxic
- Bleed / Wound
- Holy / Light
- Chaos / True

Projectile, Strike, and DoT are not standalone elements; they are delivery modes or damage application tags.

### Status interactions

Typical elemental/status pairings include:

- Fire → Ignite / Burn
- Cold → Chill / Freeze
- Lightning → Shock / Stun
- Poison → stacking toxic DoT
- Bleed → physical DoT, often bypassing some defenses
- Utility tags → Blind, Slow, Weaken, and related effects

### DoT exceptions

DoT and status effects may skip hit, dodge, and crit checks depending on the skill or ailment. Some may partially bypass armor, shield, or other defensive layers. These rules must be explicit in data rather than hidden in code exceptions.

## Itemization and affixes

Items contribute both raw power and identity. Build diversity comes not only from runes, but from how gear supports rune choices with sockets, affixes, and grade scaling.[web:91]

### Affix buckets

Affixes should be divided into distinct categories that mirror the damage and defense framework:

- Common additive affixes: flat attack, % attack, HP, resistances, stats.
- Rare multiplicative affixes: damage amplification, crit damage, special conversion bonuses.
- Utility affixes: life steal, resource sustain, status chance, speed, on-hit effects.
- Exclusive affixes: weapon-only, slot-only, grade-only, or unique-only modifiers.

### Quality and sockets

Quality improves base stats rather than affix count. Rune-compatible sockets are a major customization axis and should be limited by slot and item grade to preserve progression meaning.

### Unique and holy items

Unique and Holy items provide fixed rare options, signature mechanics, and possible set-like synergies. These items should remain rare and build-shaping rather than replacing the value of well-crafted rares.

## Crafting and enchanting

Crafting depth is light-B: substantial enough to support long-term item goals, but not so broad that it becomes impossible to balance or explain in v1.[cite:73]

Planned functions include:

- Grade upgrades.
- Targeted rerolls.
- Add/remove option crafting within limits.
- Essence or material-based specialization.
- Limited corruption or risk-reward enhancement.

The design goal is to support both targeted improvement and RNG excitement. Resource costs must scale enough to prevent trivial optimization loops.

## Loot philosophy

Loot clarity matters as much as loot quantity. Bosses should be designed as target-farmable reward sources with visible signature tables, because target farming is most satisfying when players can connect a boss identity to a specific build goal.[web:85][web:91]

### Drop structure

| Source | Primary rewards |
| --- | --- |
| Normal enemies | EXP, common materials, low-tier gear, common runes |
| Elite packs / minibosses | better materials, mid-tier gear, chance of rarer runes |
| Manual boss kills | signature runes, unique items, high-tier crafting materials |

### Boss tables

Boss UI should show the full loot table in v1. A recommended structure is:

- Signature rune list.
- Signature unique list.
- Shared regional loot pool.
- Suggested power level / recommended build readiness.

This reduces blind frustration and strengthens player planning around farming routes.

## Progression and leveling

Progression occurs across several parallel vectors:

- Character level and core stats.
- Skill rune collection and upgrading.
- Support rune linking.
- Passive web pathing.
- Equipment grade and affix optimization.
- Region access by practical strength rather than hard lock.

The player should consistently feel stronger through both horizontal and vertical progression. Old maps staying permanently weak is a non-negotiable part of the power fantasy and must be protected from automatic level scaling.[web:77][web:80]

## Story structure

The story uses a chapter-based structure with dialogue scenes and key characters. Exact chapter count remains open, but the framework is already clear:

- Each chapter introduces a regional theme and conflict.
- Each chapter culminates in a major boss or divine threat.
- Dialogue and character scenes reinforce world-building without overwhelming the action loop.

For v1, placeholder chapter regions can be defined and iterated later, for example urban unrest, haunted forests, pirate coasts, cursed war provinces, and divine or spirit domains.

## Death, shrines, and difficulty flow

The current death model is intentionally forgiving. On death, the player respawns at the nearest shrine with no major penalty. This supports experimentation, exploration of too-strong regions, and repeated boss attempts without excessive frustration.[web:89]

Shrines also serve as:

- Safe return points.
- Route anchors in the overworld.
- Likely future points for healing, teleport, or map binding.

## Offline progression

Offline gains include EXP and materials. This keeps the game aligned with its idle ambition while preserving active play as the primary route to boss-specific power and premium rune acquisition.[cite:41]

Recommended guardrails:

- Restrict offline farming to zones the player has proven they can safely clear.
- Cap gains by zone difficulty and time.
- Keep rare boss loot outside passive accrual.

## Endgame direction

The endgame is finite rather than infinite. This is a deliberate response to the user goal that power should feel real rather than endlessly normalized against infinitely scaling enemies.[cite:74]

Two compatible endgame structures remain open for later iteration:

- A floor-based tower or pagoda challenge.
- Cursed or empowered variants of existing regions.

Either approach should retain fixed ceilings, clear milestones, and visible completion states rather than dissolving into endless stat inflation.

## UI and screen structure

The game will likely require these major screens:

- Overworld map / node navigation.
- Battle view.
- Boss detail and loot table screen.
- Inventory and equipment.
- Rune inventory and rune link configuration.
- Passive spider web.
- Crafting / enchanting.
- Shrine / respawn / travel panel.
- Offline gains summary.
- Story dialogue / chapter scene panels.

React is best suited for most of these progression-heavy screens, while Phaser is best reserved for combat scenes and encounter presentation.[web:56][cite:71]

## Technical scope assumptions

The project should be built with strict separation between logic and presentation. Core combat formulas, rune rules, item schemas, drop tables, and passive node definitions should all exist in engine-agnostic data structures so the game can be prototyped in text-heavy or UI-heavy form before full visual polish.[web:56][cite:71]

A practical architecture is:

- React for world map, menus, inventory, crafting, passive web, loot UI, and story.
- Phaser for battle scenes, boss encounters, enemy feedback, and combat animation layers.

This structure matches the user’s current strengths and reduces the risk of overcommitting to visual scope before the systems are proven.[cite:41][cite:71]

## MVP recommendation

A sensible first playable vertical slice should contain:

- One connected region.
- One shrine.
- Two normal enemy camp types.
- One miniboss.
- One chapter boss.
- Two starting skill runes.
- Four total skill slots in the interface.
- A minimal passive web.
- Basic item drops and one or two signature boss rune drops.
- Offline EXP + material summary.
- One crafting screen with grade upgrade and reroll.

This slice is enough to validate the core identity: auto-farm for growth, boss hunt for build-defining rewards, and build expression through runes, gear, and passive pathing.[cite:41][cite:74]

## Out of scope for v1

To protect scope, the following are excluded from the initial version:

- PvP
- Trading
- Guild systems
- Shared-world multiplayer
- Large battlefield warfare
- Complex social economy
- Fully open-world free-roam simulation
- Excessive weapon families beyond the initial planned set
- Deep multi-currency crafting labyrinths

These systems can be revisited only after the single-player progression loop proves fun and sustainable.[cite:71][cite:74]

## Tuning principles

Balancing should follow several hard rules:

- Tune with time-to-kill curves across early, mid, and endgame.
- Adjust enemy HP, behavior, and dampening before endlessly inflating player multipliers.
- Keep offensive and defensive buckets readable and separable.
- Cap or compress any scaling layer that risks runaway numbers.
- Ensure boss rewards feel meaningfully better than passive farming rewards.

This preserves long-term clarity and keeps growth satisfying without collapsing into either total triviality or infinite treadmill design.

## Production direction

The project should be developed in layers:

1. Build the systems prototype in React-driven UI.
2. Validate combat formulas, drops, and progression with low visual cost.
3. Create one polished Phaser battle slice.
4. Expand content by templates, not by inventing new major systems each cycle.

This approach is the safest route from concept to shipped prototype given the intended complexity and the current development stack.[cite:41][cite:71]
