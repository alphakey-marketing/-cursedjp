import Phaser from 'phaser'

/**
 * PreloadScene — loads all placeholder assets before the BattleScene starts.
 * Uses Phaser's built-in graphics to generate placeholder sprites when real assets
 * are not present, so the game is always runnable without external files.
 */
export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' })
  }

  preload() {
    // Progress bar feedback
    const { width, height } = this.scale
    const bar = this.add.graphics()
    bar.fillStyle(0x4040a0)
    this.load.on('progress', (value: number) => {
      bar.clear()
      bar.fillStyle(0x4040a0)
      bar.fillRect(width / 4, height / 2, (width / 2) * value, 8)
    })
    this.load.on('complete', () => bar.destroy())
  }

  create() {
    // Generate placeholder textures programmatically so the game works
    // without external sprite assets.
    this._makeRect('player_sprite', 0x60a0e0, 28, 40)
    this._makeRect('enemy_ronin', 0xe06060, 24, 36)
    this._makeRect('enemy_city_guard', 0xe0a040, 26, 38)
    this._makeRect('enemy_boss', 0xc030c0, 40, 50)

    // Start whichever combat scene was registered
    if (this.scene.get('BattleScene')) {
      this.scene.start('BattleScene')
    } else {
      this.scene.start('BossScene')
    }
  }

  private _makeRect(key: string, color: number, w: number, h: number) {
    if (this.textures.exists(key)) return
    const g = this.make.graphics({ x: 0, y: 0 })
    g.fillStyle(color)
    g.fillRect(0, 0, w, h)
    g.generateTexture(key, w, h)
    g.destroy()
  }
}
