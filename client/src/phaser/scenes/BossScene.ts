import Phaser from 'phaser'
import { PhaserEventBus, PHASER_EVENTS } from '../events/PhaserEventBus'
import { resolveDamage } from '../../engine/combat/damageCalc'
import type { DamagePacket, DefenseProfile } from '../../types/combat'
import type { BossTemplate, BossPhase, TelegraphAttack } from '../../types/enemy'

interface BossSceneData {
  boss: BossTemplate
  playerStats: {
    baseAttackMin: number
    baseAttackMax: number
    attackSpeed: number
    critChance: number
    critBonus: number
    additiveIncreases: number
    multiplicativeAmplifiers: number[]
    currentBarrier: number
  }
  skillSlots: Array<{
    slotIndex: number
    skillRuneId: string | null
    skillCoef: number
    damageType: string
    resourceCost: number
    baseCooldown: number
  }>
  battleSpeed: number
}

export class BossScene extends Phaser.Scene {
  private sceneData!: BossSceneData
  private bossHP: number = 0
  private bossBarrier: number = 0
  private bossSprite!: Phaser.GameObjects.Image
  private hpBarFill!: Phaser.GameObjects.Rectangle
  private phaseText!: Phaser.GameObjects.Text
  private playerSprite!: Phaser.GameObjects.Image
  private playerAttackTimer: number = 0
  private playerAttackInterval: number = 1000
  private bossAttackTimer: number = 0
  private bossAttackInterval: number = 1000
  private skillCooldowns: Map<number, number> = new Map()
  private activeSkillIndex: number = 0
  private battleEnded: boolean = false
  private currentPhaseIndex: number = 0
  private telegraphTimer: number = 0
  private telegraphActive: boolean = false
  private activeTelegraph: TelegraphAttack | null = null
  private telegraphTicksRemaining: number = 0
  battleSpeed: number = 1

  // Phase-modified stats
  private attackSpeedMultiplier: number = 1.0

  constructor() {
    super({ key: 'BossScene' })
  }

  init(data: BossSceneData) {
    // G5 fix: PreloadScene starts this scene without data on first boot.
    // Guard here so the first empty pass doesn't crash or corrupt state.
    if (!data?.boss) return

    this.sceneData = data
    this.battleEnded = false
    this.skillCooldowns.clear()
    this.playerAttackTimer = 0
    this.bossAttackTimer = 0
    this.activeSkillIndex = 0
    this.currentPhaseIndex = 0
    this.telegraphActive = false
    this.activeTelegraph = null
    this.telegraphTimer = 0
    this.attackSpeedMultiplier = 1.0
    this.battleSpeed = data.battleSpeed ?? 1
    this.bossHP = data.boss.baseHP
    this.bossBarrier = data.boss.defenseProfile.barrierMax
  }

  create() {
    // G5 fix: if init() was called without data (first PreloadScene boot),
    // sceneData is not set yet — wait for the restart with real data.
    if (!this.sceneData?.boss) return

    const { width, height } = this.scale

    // Background — darker for boss
    this.add.rectangle(0, 0, width, height, 0x060408).setOrigin(0, 0)
    this.add.rectangle(0, height * 0.72, width, 2, 0x662222).setOrigin(0, 0)

    // Player sprite
    this.playerSprite = this.add
      .image(width * 0.2, height * 0.62, 'player_sprite')
      .setScale(2)

    // Boss sprite (centered)
    const textureKey = this.textures.exists(this.sceneData.boss.spriteId)
      ? this.sceneData.boss.spriteId
      : 'enemy_boss'
    this.bossSprite = this.add.image(width * 0.65, height * 0.5, textureKey).setScale(3)
    this.bossSprite.setFlipX(true)

    // Boss HP bar (top of scene)
    const barW = width * 0.7
    this.add.rectangle(width / 2, 22, barW, 12, 0x330000).setOrigin(0.5, 0.5)
    this.hpBarFill = this.add
      .rectangle(width / 2 - barW / 2, 22, barW, 12, 0xdd2222)
      .setOrigin(0, 0.5)

    this.add
      .text(width / 2, 8, this.sceneData.boss.name.toUpperCase(), {
        fontSize: '9px',
        color: '#e0b090',
      })
      .setOrigin(0.5, 0.5)

    this.phaseText = this.add
      .text(width - 8, 22, 'Phase 1', {
        fontSize: '8px',
        color: '#888888',
      })
      .setOrigin(1, 0.5)

    // Skill cooldowns
    if (this.sceneData.skillSlots) {
      this.sceneData.skillSlots.forEach((slot) => {
        this.skillCooldowns.set(slot.slotIndex, 0)
      })
    }

    // Attack intervals
    const atkSpeed = this.sceneData.playerStats.attackSpeed ?? 1.1
    this.playerAttackInterval = Math.round(1000 / atkSpeed)
    this.bossAttackInterval = Math.round(1000 / this.sceneData.boss.attackSpeed)

    // Schedule telegraph attack
    this._scheduleNextTelegraph()

    PhaserEventBus.emit(PHASER_EVENTS.SCENE_READY, { scene: this })
  }

  update(_time: number, delta: number) {
    if (this.battleEnded) return

    const scaledDelta = delta * this.battleSpeed

    // Player attack
    this.playerAttackTimer += scaledDelta
    if (this.playerAttackTimer >= this.playerAttackInterval) {
      this.playerAttackTimer -= this.playerAttackInterval
      this._playerAttack()
    }

    // Skill cooldown tick
    this.skillCooldowns.forEach((cd, idx) => {
      if (cd > 0) this.skillCooldowns.set(idx, Math.max(0, cd - scaledDelta))
    })

    // Boss attack
    this.bossAttackTimer += scaledDelta
    const effectiveInterval = this.bossAttackInterval / this.attackSpeedMultiplier
    if (this.bossAttackTimer >= effectiveInterval) {
      this.bossAttackTimer -= effectiveInterval
      if (!this.telegraphActive) {
        this._bossAutoAttack()
      }
    }

    // Telegraph countdown
    if (this.telegraphActive && this.activeTelegraph) {
      this.telegraphTimer -= scaledDelta
      const ticksLeft = Math.max(0, Math.ceil(this.telegraphTimer / 500))
      if (ticksLeft !== this.telegraphTicksRemaining) {
        this.telegraphTicksRemaining = ticksLeft
        PhaserEventBus.emit(PHASER_EVENTS.TELEGRAPH_WARNING, {
          attackName: this.activeTelegraph.name,
          ticksRemaining: ticksLeft,
          description: this.activeTelegraph.description,
        })
      }
      if (this.telegraphTimer <= 0) {
        this._fireTelegraphAttack()
      }
    }
  }

  // ─── Player attacks ───────────────────────────────────────────────

  private _playerAttack() {
    const slots = this.sceneData.skillSlots ?? []
    let skill = null
    for (let i = 0; i < slots.length; i++) {
      const idx = (this.activeSkillIndex + i) % slots.length
      const slot = slots[idx]
      if (!slot.skillRuneId) continue
      if ((this.skillCooldowns.get(slot.slotIndex) ?? 0) > 0) continue
      skill = slot
      this.activeSkillIndex = (idx + 1) % slots.length
      break
    }

    const ps = this.sceneData.playerStats
    const baseDmg =
      (ps.baseAttackMin ?? 30) +
      Math.random() * ((ps.baseAttackMax ?? 42) - (ps.baseAttackMin ?? 30))

    const packet: DamagePacket = {
      skillId: skill?.skillRuneId ?? 'auto_attack',
      skillCoef: skill?.skillCoef ?? 1.0,
      sourceDamage: baseDmg,
      flatDamage: 0,
      damageType: (skill?.damageType as DamagePacket['damageType']) ?? 'Physical',
      deliveryMode: 'Strike',
      additiveIncreases: [ps.additiveIncreases ?? 0],
      multiplicativeAmplifiers: ps.multiplicativeAmplifiers ?? [],
      critChance: ps.critChance ?? 0.05,
      critBonus: ps.critBonus ?? 0.5,
      isDoT: false,
      bypassDodge: false,
      bypassArmor: false,
      bypassShield: false,
    }

    const defense: DefenseProfile = {
      armor: this.sceneData.boss.defenseProfile.armor,
      elementalResistances: this.sceneData.boss.defenseProfile.elementalResistances,
      dodgeChance: this.sceneData.boss.defenseProfile.dodgeChance,
      barrierCurrent: this.bossBarrier,
      barrierMax: this.sceneData.boss.defenseProfile.barrierMax,
      hpCurrent: this.bossHP,
      hpMax: this.sceneData.boss.baseHP,
      damageTakenDecrease: this.sceneData.boss.defenseProfile.damageTakenDecrease ?? [],
      dampening: this.sceneData.boss.defenseProfile.dampening ?? [],
    }

    const result = resolveDamage(packet, defense)

    if (skill) {
      this.skillCooldowns.set(skill.slotIndex, (skill.baseCooldown ?? 3) * 1000)
    }

    if (!result.missed && !result.dodged) {
      this.bossBarrier = Math.max(0, this.bossBarrier - result.barrierDamage)
      this.bossHP = Math.max(0, this.bossHP - result.hpDamage)
      this._updateBossHPBar()

      this._showDamageNumber(
        this.bossSprite.x + Phaser.Math.Between(-15, 15),
        this.bossSprite.y - 40,
        result.hpDamage,
        result.isCrit
      )

      const critStr = result.isCrit ? ' (CRIT!)' : ''
      PhaserEventBus.emit(
        PHASER_EVENTS.COMBAT_LOG,
        `> ${skill?.skillRuneId ?? 'Auto'} hit ${this.sceneData.boss.name} for ${result.hpDamage}${critStr}`
      )

      PhaserEventBus.emit(PHASER_EVENTS.DAMAGE_DEALT, {
        targetId: 'boss',
        result,
        skillId: packet.skillId,
      })

      this._checkPhaseTransition()

      if (this.bossHP <= 0) {
        this._handleBossDeath()
      }
    } else {
      PhaserEventBus.emit(
        PHASER_EVENTS.COMBAT_LOG,
        result.dodged
          ? `> ${this.sceneData.boss.name} dodged your attack`
          : `> ${skill?.skillRuneId ?? 'Attack'} missed`
      )
    }
  }

  // ─── Boss attacks ─────────────────────────────────────────────────

  private _bossAutoAttack() {
    const boss = this.sceneData.boss
    const baseDmg =
      boss.attackDamageMin +
      Math.random() * (boss.attackDamageMax - boss.attackDamageMin)

    const ps = this.sceneData.playerStats

    const packet: DamagePacket = {
      skillId: `${boss.id}_attack`,
      skillCoef: 1.0,
      sourceDamage: baseDmg,
      flatDamage: 0,
      damageType: boss.damageType as DamagePacket['damageType'],
      deliveryMode: 'Strike',
      additiveIncreases: [],
      multiplicativeAmplifiers: [],
      critChance: 0.05,
      critBonus: 0.3,
      isDoT: false,
      bypassDodge: false,
      bypassArmor: false,
      bypassShield: false,
    }

    const playerDefense: DefenseProfile = {
      armor: 0.1,
      elementalResistances: {
        Physical: 0, Fire: 0, Cold: 0, Lightning: 0,
        Poison: 0, Bleed: 0, Holy: 0, Chaos: 0,
      },
      dodgeChance: 0.05,
      barrierCurrent: ps.currentBarrier ?? 0,
      barrierMax: ps.currentBarrier ?? 0,
      hpCurrent: 300,
      hpMax: 300,
      damageTakenDecrease: [],
      dampening: [],
    }

    const result = resolveDamage(packet, playerDefense)

    if (!result.missed && !result.dodged) {
      this.tweens.add({
        targets: this.playerSprite,
        alpha: 0.3,
        duration: 80,
        yoyo: true,
      })
      const barrierStr = result.barrierDamage > 0 ? ` (${result.barrierDamage} blocked)` : ''
      PhaserEventBus.emit(
        PHASER_EVENTS.COMBAT_LOG,
        `> ${boss.name} attacked you for ${result.hpDamage}${barrierStr}`
      )
      PhaserEventBus.emit(PHASER_EVENTS.ENEMY_ATTACK, { enemyId: 'boss', result })
    } else {
      PhaserEventBus.emit(PHASER_EVENTS.COMBAT_LOG, '> You dodged the boss attack')
    }
  }

  // ─── Telegraph system ─────────────────────────────────────────────

  private _scheduleNextTelegraph() {
    const telegraphs = this.sceneData.boss.telegraphAttacks ?? []
    if (telegraphs.length === 0) return

    // Fire a telegraph every ~8–15s in scene time
    const delayMs = (8000 + Math.random() * 7000) / this.battleSpeed
    this.time.delayedCall(delayMs, () => {
      if (this.battleEnded) return
      const t = telegraphs[Math.floor(Math.random() * telegraphs.length)]
      this._startTelegraph(t)
    })
  }

  private _startTelegraph(t: TelegraphAttack) {
    this.telegraphActive = true
    this.activeTelegraph = t
    this.telegraphTimer = t.warningDurationTicks * 500 // each tick = 500ms
    this.telegraphTicksRemaining = t.warningDurationTicks

    PhaserEventBus.emit(PHASER_EVENTS.TELEGRAPH_WARNING, {
      attackName: t.name,
      ticksRemaining: t.warningDurationTicks,
      description: t.description,
    })
    PhaserEventBus.emit(
      PHASER_EVENTS.COMBAT_LOG,
      `> ⚠️ ${this.sceneData.boss.name}: ${t.name} incoming!`
    )
  }

  private _fireTelegraphAttack() {
    if (!this.activeTelegraph) return
    // G3 fix: if the battle ended (boss died or player died) while the telegraph
    // was counting down, cancel the attack silently instead of firing & chaining.
    if (this.battleEnded) {
      this.telegraphActive = false
      this.activeTelegraph = null
      PhaserEventBus.emit(PHASER_EVENTS.TELEGRAPH_WARNING, null)
      return
    }
    const t = this.activeTelegraph
    this.telegraphActive = false
    this.activeTelegraph = null

    // Telegraph warning is cleared
    PhaserEventBus.emit(PHASER_EVENTS.TELEGRAPH_WARNING, null)

    const boss = this.sceneData.boss
    const ps = this.sceneData.playerStats
    // E7 fix: roll a random value in the damage range instead of using the average.
    const baseDmg =
      boss.attackDamageMin +
      Math.random() * (boss.attackDamageMax - boss.attackDamageMin)

    const packet: DamagePacket = {
      skillId: t.id,
      skillCoef: t.damagePacket.skillCoef ?? 2.0,
      sourceDamage: baseDmg,
      flatDamage: 0,
      damageType: (t.damagePacket.damageType as DamagePacket['damageType']) ?? 'Physical',
      deliveryMode: (t.damagePacket.deliveryMode as DamagePacket['deliveryMode']) ?? 'AoE',
      additiveIncreases: [],
      multiplicativeAmplifiers: [],
      critChance: 0,
      critBonus: 0,
      isDoT: false,
      bypassDodge: false,
      bypassArmor: false,
      bypassShield: false,
    }

    const playerDefense: DefenseProfile = {
      armor: 0.1,
      elementalResistances: {
        Physical: 0, Fire: 0, Cold: 0, Lightning: 0,
        Poison: 0, Bleed: 0, Holy: 0, Chaos: 0,
      },
      dodgeChance: 0,
      barrierCurrent: ps.currentBarrier ?? 0,
      barrierMax: ps.currentBarrier ?? 0,
      hpCurrent: 300,
      hpMax: 300,
      damageTakenDecrease: [],
      dampening: [],
    }

    const result = resolveDamage(packet, playerDefense)

    // Visual flash
    this.cameras.main.shake(200, 0.01)
    this.tweens.add({
      targets: this.playerSprite,
      alpha: 0.1,
      duration: 120,
      yoyo: true,
      repeat: 2,
    })

    PhaserEventBus.emit(
      PHASER_EVENTS.COMBAT_LOG,
      `> ⚠️ ${t.name} HITS you for ${result.hpDamage}!`
    )
    PhaserEventBus.emit(PHASER_EVENTS.ENEMY_ATTACK, { enemyId: 'boss_telegraph', result })

    // Schedule next telegraph
    this._scheduleNextTelegraph()
  }

  // ─── Phase transitions ────────────────────────────────────────────

  private _checkPhaseTransition() {
    const phases = this.sceneData.boss.phases ?? []
    const hpRatio = this.bossHP / this.sceneData.boss.baseHP

    for (let i = 0; i < phases.length; i++) {
      const phase = phases[i]
      if (hpRatio <= phase.hpThreshold && this.currentPhaseIndex < phase.phaseIndex) {
        this._enterPhase(phase)
        break // G4 fix: only enter the first triggered phase per attack
      }
    }
  }

  private _enterPhase(phase: BossPhase) {
    this.currentPhaseIndex = phase.phaseIndex
    this.phaseText.setText(`Phase ${phase.phaseIndex + 1}`)

      if (phase.statMultipliers?.attackSpeed !== undefined) {
        this.attackSpeedMultiplier = phase.statMultipliers.attackSpeed
    }

    // Visual effect: tint boss red
    this.tweens.add({
      targets: this.bossSprite,
      alpha: 0.5,
      duration: 150,
      yoyo: true,
      repeat: 3,
    })
    this.bossSprite.setTint(0xff6666)

    PhaserEventBus.emit(PHASER_EVENTS.PHASE_TRANSITION, {
      phaseIndex: phase.phaseIndex,
      behaviorModifier: phase.behaviorModifier,
    })
    PhaserEventBus.emit(
      PHASER_EVENTS.COMBAT_LOG,
      `> ⚡ PHASE ${phase.phaseIndex + 1}: ${phase.behaviorModifier}`
    )
  }

  // ─── Boss death ───────────────────────────────────────────────────

  private _handleBossDeath() {
    if (this.battleEnded) return
    this.battleEnded = true

    this.tweens.add({
      targets: this.bossSprite,
      alpha: 0,
      scaleX: 0.1,
      scaleY: 0.1,
      duration: 800,
      ease: 'Cubic.easeIn',
    })

    PhaserEventBus.emit(PHASER_EVENTS.ENEMY_DIED, {
      enemyId: 'boss',
      templateId: this.sceneData.boss.id,
      expReward: this.sceneData.boss.expReward,
      dropTableId: this.sceneData.boss.dropTableId,
    })
    PhaserEventBus.emit(PHASER_EVENTS.COMBAT_LOG, `> ${this.sceneData.boss.name} was defeated!`)

    this.time.delayedCall(900, () => {
      PhaserEventBus.emit(PHASER_EVENTS.BATTLE_END, {
        victory: true,
        isBoss: true,
        bossId: this.sceneData.boss.id,
        enemies: [
          {
            templateId: this.sceneData.boss.id,
            dropTableId: this.sceneData.boss.dropTableId,
            expReward: this.sceneData.boss.expReward,
            isBoss: true,
            signatureDrops: this.sceneData.boss.signatureDrops,
          },
        ],
      })
    })
  }

  triggerPlayerDeath() {
    if (this.battleEnded) return
    this.battleEnded = true
    this.playerSprite.setAlpha(0.2)
    PhaserEventBus.emit(PHASER_EVENTS.PLAYER_DIED, {})
    PhaserEventBus.emit(PHASER_EVENTS.BATTLE_END, { victory: false, enemies: [] })
  }

  // ─── Helpers ──────────────────────────────────────────────────────

  private _updateBossHPBar() {
    const ratio = Math.max(0, this.bossHP / this.sceneData.boss.baseHP)
    const barW = this.scale.width * 0.7
    this.hpBarFill.width = barW * ratio
  }

  private _showDamageNumber(x: number, y: number, value: number, isCrit: boolean) {
    const color = isCrit ? '#f0e060' : '#ffffff'
    const size = isCrit ? '14px' : '11px'
    const text = this.add
      .text(x, y, isCrit ? `${value}!` : `${value}`, {
        fontSize: size,
        color,
        fontStyle: isCrit ? 'bold' : 'normal',
      })
      .setOrigin(0.5, 0.5)

    this.tweens.add({
      targets: text,
      y: y - 30,
      alpha: 0,
      duration: 900,
      ease: 'Cubic.easeOut',
      onComplete: () => text.destroy(),
    })
  }

  getSkillCooldowns(): Map<number, number> {
    return this.skillCooldowns
  }
}
