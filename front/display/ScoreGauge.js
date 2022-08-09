import phina from 'phina.js'
import { SCREEN } from '../constants'

/** 数字をカウントアップ表示させるラベル */
const CountupLabel = phina.createClass({
  superClass: phina.display.Label,

  init(options) {
    this.superInit({
      ...options,
      text: '',
      fontSize: 100,
      fontWeight: '900',
      fill: '#000',
      stroke: '#fff',
      strokeWidth: 12,
    })

    this._value = 0
    this._visualValue = 0
  },

  setValue(v) {
    this._value = v
    this.tweener.clear().to({ visualValue: v }, 500, 'easeOutQuad')
  },

  _accessor: {
    value: {
      get() {
        return this._value
      },
      set(v) {
        this.setValue(v)
      },
    },

    visualValue: {
      get() {
        return this._visualValue
      },
      set(v) {
        this._visualValue = v
        this.text = Math.floor(v) + ''
      },
    },
  },
})

/** スコアゲージ */
export const ScoreGauge = phina.createClass({
  superClass: phina.display.DisplayElement,

  init(options) {
    this.superInit(options)

    this.gauge = phina.ui
      .Gauge({
        width: SCREEN.WIDTH - 32,
        strokeWidth: 8,
        value: 50,
        fill: '#fff',
        gaugeColor: '#000',
        stroke: '#000',
      })
      .setPosition(0, 14)
      .addChildTo(this)

    this.gauge.animationTime = 2 * 1000

    this.blackScore = CountupLabel()
      .setPosition(-SCREEN.WIDTH / 2 + 96, 0)
      .addChildTo(this)

    this.whiteScore = CountupLabel()
      .setPosition(SCREEN.WIDTH / 2 - 96, 0)
      .addChildTo(this)
  },

  /**
   * スコア表示を更新
   * @param {Number} black
   * @param {Number} white
   */
  updateScore(black, white) {
    this.blackScore.value = black
    this.whiteScore.value = white

    const blackRate = Math.floor((black / (black + white)) * 100)
    this.gauge.value = blackRate
  },
})
