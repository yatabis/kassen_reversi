import phina from 'phina.js'
import { SCREEN, TURN } from '../constants'

/** 白黒を選択するパネル */
export const TurnPanel = phina.createClass({
  superClass: phina.display.DisplayElement,

  init(options) {
    this.superInit(options)

    /** 白黒の選択状態 */
    this.turn = TURN.BLACK

    const panelOptions = {
      width: (SCREEN.WIDTH - 56) / 2,
      height: (SCREEN.WIDTH - 56) / 6,
      fill: '#27AE60',
      stroke: '#000',
      strokeWidth: 8,
    }

    const blackPanel = phina.display
      .RectangleShape(panelOptions)
      .setInteractive(true)
      .addChildTo(this)

    const whitePanel = phina.display
      .RectangleShape(panelOptions)
      .setInteractive(true)
      .addChildTo(this)

    blackPanel.right = -12
    whitePanel.left = 12
    whitePanel.alpha = 0.5

    blackPanel.on('pointstart', () => {
      this.turn = TURN.BLACK
      blackPanel.alpha = 1
      whitePanel.alpha = 0.5
    })

    whitePanel.on('pointstart', () => {
      this.turn = TURN.WHITE
      whitePanel.alpha = 1
      blackPanel.alpha = 0.5
    })

    this.blackGauge = phina.ui
      .CircleGauge({
        radius: (SCREEN.WIDTH - 56) / 14,
        fill: '#000',
        stroke: null,
      })
      .addChildTo(blackPanel)

    this.whiteGauge = phina.ui
      .CircleGauge({
        radius: (SCREEN.WIDTH - 56) / 14,
        fill: '#fff',
        stroke: null,
      })
      .addChildTo(whitePanel)
  },

  /**
   * クールタイムを設定
   * @param {Number} time
   */
  setCooltime(time) {
    const gauge = this.turn === TURN.BLACK ? this.blackGauge : this.whiteGauge

    gauge.animation = false
    gauge.value = 0

    gauge.animation = true
    gauge.animationTime = time
    gauge.value = 100
  },

  _accessor: {
    isCooling: {
      get() {
        const gauge =
          this.turn === TURN.BLACK ? this.blackGauge : this.whiteGauge

        return gauge.visualValue !== 100
      },
    },
  },
})
