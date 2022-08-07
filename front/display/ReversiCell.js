import phina from 'phina.js'
import { STONE } from '../constants'
import { ReversiStone } from './ReversiStone'

/** リバーシのセル */
export const ReversiCell = phina.createClass({
  superClass: phina.display.RectangleShape,

  init(options) {
    this.superInit({
      ...options,
      width: options.size,
      height: options.size,
      fill: '#27AE60',
      stroke: '#000',
      strokeWidth: 8,
    })

    this.setInteractive(true)

    // タッチしたときのエフェクト
    const overlay = phina.display
      .RectangleShape({
        width: this.width,
        height: this.height,
        fill: 'black',
        stroke: null,
      })
      .setVisible(false)
      .addChildTo(this)

    this.on('pointstart', () => {
      // 駒がなければputイベント発火
      if (this.stone.type === STONE.NONE) {
        this.flare('put')
      }

      overlay.tweener.clear().set({
        visible: true,
        alpha: 0.25,
      })
    })
    this.on('pointend', () => {
      overlay.tweener.clear().to({ alpha: 0 }, 250).set({
        visible: false,
        alpha: 0,
      })
    })

    const offset = -this.strokeWidth / 4

    this.stone = ReversiStone({
      radius: this.width * (2 / 5),
    })
      .setPosition(offset, offset)
      .addChildTo(this)
  },
})
