import Phaser from 'phaser'
import { PhaserEventBus, PHASER_EVENTS } from '../events/PhaserEventBus'
import { resolveDamage } from '../../engine/combat/damageCalc'
import type { DamagePacket, DefenseProfile } from '../../types/combat'
import type { EnemyTemplate } from '../../types/enemy'

interface EnemyState {
  template: EnemyTemplate
  instanceId: string
  currentHP: number
  currentBarrier: number
  sprite: Phaser.GameObjects.Image
  hpBarBg: Phaser.GameObjects.Rectangle
  hpBarFill: Phaser.GameObjects.Rectangle
  nameText: Phaser.GameObjects.Text
  attackTimer: number
}

interface BattleSceneData {
  enemies: EnemyTemplate[]
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

export class BattleScene extends Phaser.Scene {
  private enemies: EnemyState[] = []
  private playerSprite!: Phaser.GameObjects.Image
  private playerAttackTimer: number = 0
  private playerAttackInterval: number = 1000 // ms
  private skillCooldowns: Map<number, number> = new Map()
  private sceneData!: BattleSceneData
  private battleEnded: boolean = false
  private tickAccum: number = 0
  private activeSkillIndex: number = 0
  private battleSpeed: number = 1

  constructor() {
    super({ key: 'BattleScene' })
  }

  init(data: BattleSceneData) {
    this.sceneData = data
    this.battleEnded = false
    this.enemies = []
    this.skillCooldowns.clear()
    this.playerAttackTimer = 0
    this.tickAccum = 0
    this.activeSkillIndex = 0
    this.battleSpeed = data.battleSpeed ?? 1
  }

  create() {
    const { width, height } = this.scale

    // Background
    this.add.rectangle(0, 0, width, height, 0x0d0b08).setOrigin(0, 0)

    // Ground line
    this.add
      .rectangle(0, height * 0.72, width, 2, 0x443322)
      .setOrigin(0, 0)

    // Player sprite
    this.playerSprite = this.add
      .image(width * 0.2, height * 0.62, 'player_sprite')
      .setScale(2)

    // Spawn enemies
    const enemyData = this.sceneData?.enemies ?? []
    const count = Math.min(enemyData.length, 3)
    for (let i = 0; i < count; i++) {
      this._spawnEnemy(enemyData[i], i, count)
    }

    // Initialize skill cooldowns to 0
    if (this.sceneData?.skillSlots) {
      this.sceneData.skillSlots.forEach((slot) => {
        this.skillCooldowns.set(slot.slotIndex, 0)
      })
    }

    // Set player attack interval based on attackSpeed
    const atkSpeed = this.sceneData?.playerStats?.attackSpeed ?? 1.1
    this.playerAttackInterval = Math.round(1000 / atkSpeed)

    PhaserEventBus.emit(PHASER_EVENTS.SCENE_READY, { scene: this })
  }

  update(_time: number, delta: number) {
    if (this.battleEnded) return

    const scaledDelta = delta * this.battleSpeed

    // Player auto-attack ticker
    this.playerAttackTimer += scaledDelta
    if (this.playerAttackTimer >= this.playerAttackInterval) {
      this.playerAttackTimer -= this.playerAttackInterval
      this._playerAutoAttack()
    }

    // Skill cooldown tick
    this.skillCooldowns.forEach((cd, slotIndex) => {
      if (cd > 0) {
        this.skillCooldowns.set(slotIndex, Math.max(0, cd - scaledDelta))
      }
    })

    // Enemy attack tickers
    this.enemies.forEach((enemy) => {
      if (enemy.currentHP <= 0) return
      enemy.attackTimer += scaledDelta
      const atkInterval = Math.round(1000 / enemy.template.attackSpeed)
      if (enemy.attackTimer >= atkInterval) {
        enemy.attackTimer -= atkInterval
        this._enemyAttack(enemy)
      }
    })
  }

  // ─── Player attacks ────────────────────────────────────────────────

  private _playerAutoAttack() {
    const target = this._getFirstAliveEnemy()
    if (!target) return

    // Try to fire the next skill in rotation
    const slots = this.sceneData?.skillSlots ?? []
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

    const ps = this.sceneData?.playerStats
    const baseDmg =
      (ps?.baseAttackMin ?? 30) +
      Math.random() * ((ps?.baseAttackMax ?? 42) - (ps?.baseAttackMin ?? 30))

    const packet: DamagePacket = {
      skillId: skill?.skillRuneId ?? 'auto_attack',
      skillCoef: skill?.skillCoef ?? 1.0,
      sourceDamage: baseDmg,
      flatDamage: 0,
      damageType: (skill?.damageType as DamagePacket['damageType']) ?? 'Physical',
      deliveryMode: 'Strike',
      additiveIncreases: [ps?.additiveIncreases ?? 0],
      multiplicativeAmplifiers: ps?.multiplicativeAmplifiers ?? [],
      critChance: ps?.critChance ?? 0.05,
      critBonus: ps?.critBonus ?? 0.5,
      isDoT: false,
      bypassDodge: false,
      bypassArmor: false,
      bypassShield: false,
    }

    const defense: DefenseProfile = {
      armor: target.template.defenseProfile.armor,
      elementalResistances: target.template.defenseProfile.elementalResistances,
      dodgeChance: target.template.defenseProfile.dodgeChance,
      barrierCurrent: target.currentBarrier,
      barrierMax: target.template.defenseProfile.barrierMax,
      hpCurrent: target.currentHP,
      hpMax: target.template.baseHP,
      damageTakenDecrease: target.template.defenseProfile.damageTakenDecrease ?? [],
      dampening: target.template.defenseProfile.dampening ?? [],
    }

    const result = resolveDamage(packet, defense)

    // Set skill cooldown
    if (skill) {
      this.skillCooldowns.set(skill.slotIndex, (skill.baseCooldown ?? 3) * 1000)
    }

    let logMsg: string
    if (result.missed) {
      logMsg = `> ${skill?.skillRuneId ?? 'Attack'} missed ${target.template.name}`
    } else if (result.dodged) {
      logMsg = `> ${target.template.name} dodged your ${skill?.skillRuneId ?? 'attack'}`
    } else {
      // Apply damage
      target.currentBarrier = Math.max(0, target.currentBarrier - result.barrierDamage)
      target.currentHP = Math.max(0, target.currentHP - result.hpDamage)
      this._updateEnemyHPBar(target)

      // Floating damage number
      this._showDamageNumber(
        target.sprite.x + Phaser.Math.Between(-10, 10),
        target.sprite.y - 30,
        result.hpDamage,
        result.isCrit,
        false
      )

      const statusStr =
        result.statusProcs.length > 0 ? `, ${result.statusProcs.join(', ')} applied` : ''
      const critStr = result.isCrit ? ' (CRIT!)' : ''
      logMsg = `> ${skill?.skillRuneId ?? 'Auto'} hit ${target.template.name} for ${result.hpDamage}${critStr} (${packet.damageType}${statusStr})`

      PhaserEventBus.emit(PHASER_EVENTS.DAMAGE_DEALT, {
        targetId: target.instanceId,
        result,
        skillId: packet.skillId,
      })

      if (target.currentHP <= 0) {
        this._handleEnemyDeath(target)
      }
    }

    PhaserEventBus.emit(PHASER_EVENTS.COMBAT_LOG, logMsg)
  }

  // ─── Enemy attacks ────────────────────────────────────────────────

  private _enemyAttack(enemy: EnemyState) {
    const baseDmg =
      enemy.template.attackDamageMin +
      Math.random() * (enemy.template.attackDamageMax - enemy.template.attackDamageMin)

    const ps = this.sceneData?.playerStats

    const packet: DamagePacket = {
      skillId: `${enemy.template.id}_attack`,
      skillCoef: 1.0,
      sourceDamage: baseDmg,
      flatDamage: 0,
      damageType: enemy.template.damageType as DamagePacket['damageType'],
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

    // Use a simplified player defense profile
    const playerDefense: DefenseProfile = {
      armor: 0.1,
      elementalResistances: {
        Physical: 0,
        Fire: 0,
        Cold: 0,
        Lightning: 0,
        Poison: 0,
        Bleed: 0,
        Holy: 0,
        Chaos: 0,
      },
      dodgeChance: 0.05,
      barrierCurrent: ps?.currentBarrier ?? 0,
      barrierMax: ps?.currentBarrier ?? 0,
      hpCurrent: 300,
      hpMax: 300,
      damageTakenDecrease: [],
      dampening: [],
    }

    const result = resolveDamage(packet, playerDefense)

    let logMsg: string
    if (result.missed || result.dodged) {
      logMsg = `> You dodged ${enemy.template.name}'s attack`
    } else {
      const barrierStr = result.barrierDamage > 0 ? ` (${result.barrierDamage} blocked by Barrier)` : ''
      logMsg = `> ${enemy.template.name} attacked you for ${result.hpDamage}${barrierStr}`

      // Flash player sprite red
      this.tweens.add({
        targets: this.playerSprite,
        alpha: 0.3,
        duration: 80,
        yoyo: true,
      })

      PhaserEventBus.emit(PHASER_EVENTS.ENEMY_ATTACK, {
        enemyId: enemy.instanceId,
        result,
      })
    }

    PhaserEventBus.emit(PHASER_EVENTS.COMBAT_LOG, logMsg)
  }

  // ─── Enemy death ───────────────────────────────────────────────────

  private _handleEnemyDeath(enemy: EnemyState) {
    enemy.sprite.setAlpha(0.2)
    enemy.hpBarFill.setAlpha(0)
    enemy.nameText.setAlpha(0.3)

    PhaserEventBus.emit(PHASER_EVENTS.ENEMY_DIED, {
      enemyId: enemy.instanceId,
      templateId: enemy.template.id,
      expReward: enemy.template.expReward,
      dropTableId: enemy.template.dropTableId,
    })

    PhaserEventBus.emit(PHASER_EVENTS.COMBAT_LOG, `> ${enemy.template.name} DIED`)

    // Check if all enemies dead
    const allDead = this.enemies.every((e) => e.currentHP <= 0)
    if (allDead && !this.battleEnded) {
      this.battleEnded = true
      this.time.delayedCall(600, () => {
        PhaserEventBus.emit(PHASER_EVENTS.BATTLE_END, {
          victory: true,
          enemies: this.enemies.map((e) => ({
            templateId: e.template.id,
            dropTableId: e.template.dropTableId,
            expReward: e.template.expReward,
          })),
        })
      })
    }
  }

  // ─── Player death notification ──────────────────────────────────────

  triggerPlayerDeath() {
    if (this.battleEnded) return
    this.battleEnded = true
    this.playerSprite.setAlpha(0.2)
    PhaserEventBus.emit(PHASER_EVENTS.PLAYER_DIED, {})
    PhaserEventBus.emit(PHASER_EVENTS.BATTLE_END, { victory: false, enemies: [] })
  }

  // ─── Helpers ──────────────────────────────────────────────────────

  private _getFirstAliveEnemy(): EnemyState | null {
    return this.enemies.find((e) => e.currentHP > 0) ?? null
  }

  private _spawnEnemy(template: EnemyTemplate, index: number, total: number) {
    const { width, height } = this.scale
    const spacing = width / (total + 1)
    const x = spacing * (index + 1) + width * 0.15
    const y = height * 0.55

    const textureKey = this.textures.exists(template.spriteId)
      ? template.spriteId
      : template.id === 'boss_oni_general'
        ? 'enemy_boss'
        : index % 2 === 0
          ? 'enemy_ronin'
          : 'enemy_city_guard'

    const sprite = this.add.image(x, y, textureKey).setScale(2)
    sprite.setFlipX(true)

    // HP bar background
    const barW = 60
    const hpBarBg = this.add.rectangle(x, y - 36, barW, 6, 0x333333)
    const hpBarFill = this.add.rectangle(x - barW / 2, y - 36, barW, 6, 0xe05050).setOrigin(0, 0.5)

    const nameText = this.add
      .text(x, y - 48, template.name, {
        fontSize: '9px',
        color: '#e0b090',
      })
      .setOrigin(0.5, 0.5)

    const enemyState: EnemyState = {
      template,
      instanceId: `${template.id}_${index}`,
      currentHP: template.baseHP,
      currentBarrier: template.defenseProfile.barrierMax,
      sprite,
      hpBarBg,
      hpBarFill,
      nameText,
      attackTimer: Math.random() * 500, // stagger initial attacks
    }

    this.enemies.push(enemyState)
  }

  private _updateEnemyHPBar(enemy: EnemyState) {
    const ratio = Math.max(0, enemy.currentHP / enemy.template.baseHP)
    const barW = 60
    enemy.hpBarFill.width = barW * ratio
  }

  private _showDamageNumber(
    x: number,
    y: number,
    value: number,
    isCrit: boolean,
    isEnemy: boolean
  ) {
    const color = isEnemy ? '#e07070' : isCrit ? '#f0e060' : '#ffffff'
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
