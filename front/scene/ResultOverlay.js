import phina from 'phina.js'
import { SCREEN, STATE } from '../constants'

export const ResultOverlay = phina.createClass({
  superClass: phina.display.DisplayElement,

  init() {
    this.superInit()

    phina.display
      .RectangleShape({
        width: SCREEN.WIDTH,
        height: SCREEN.HEIGHT,
        fill: 'rgba(0,0,0,0.5)',
        stroke: null,
      })
      .setPosition(SCREEN.WIDTH / 2, SCREEN.HEIGHT / 2)
      .addChildTo(this)

    const textRect = phina.display
      .RectangleShape({
        width: SCREEN.WIDTH - 64,
        height: (SCREEN.WIDTH - 64) / 4,
        fill: '#fff',
        stroke: '#000',
        strokeWidth: 8,
      })
      .setPosition(SCREEN.WIDTH / 2, SCREEN.HEIGHT * (6 / 16))
      .addChildTo(this)

    this.label = phina.display
      .Label({
        text: '',
        fontSize: 72,
        fontWeight: '900',
      })
      .addChildTo(textRect)

    phina.ui
      .Button({
        text: 'はじめから',
        fill: '#fff',
        fontColor: '#000',
        stroke: '#000',
        strokeWidth: 8,
        width: SCREEN.WIDTH / 2,
        height: SCREEN.WIDTH / 6,
      })
      .setPosition(SCREEN.WIDTH / 2, SCREEN.HEIGHT * (10 / 16))
      .on('click', () => this.flare('retry'))
      .addChildTo(this)
  },

  /** ゲームステータスを設定 */
  setState(state) {
    const text = (() => {
      if (state === STATE.DRAW) {
        return '引き分け！'
      }
      const color = state === STATE.BLACK ? '黒' : '白'
      return color + 'の勝ち！'
    })()

    this.label.text = text

    return this
  },
})
