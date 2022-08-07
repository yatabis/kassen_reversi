import phina from 'phina.js'
import { SCREEN, STONE } from '../constants'
import { ReversiCell } from './ReversiCell'

/** リバーシの盤面 */
export const ReversiBoard = phina.createClass({
  superClass: phina.display.DisplayElement,

  init(options) {
    this.superInit(options)

    /** セルのサイズ */
    const size = (SCREEN.WIDTH - 32) / 8
    /** セルの座標オフセット */
    const offset = -(SCREEN.WIDTH - 32) / 2 + size / 2

    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        ReversiCell({ size })
          .setPosition(size * x + offset, size * y + offset)
          .on('put', () => {
            this.flare('put', { id: y * 8 + x })
          })
          .addChildTo(this)
      }
    }
  },

  /**
   * リバーシの盤面を更新
   * @param {BigInt} black
   * @param {BigInt} white
   */
  updateBoard(black, white) {
    for (let i = 0n; i < 64n; i++) {
      const stone = this.children[i].stone

      if ((black >> i) & 1n) {
        stone.type = STONE.BLACK
      } else if ((white >> i) & 1n) {
        stone.type = STONE.WHITE
      } else {
        stone.type = STONE.NONE
      }
    }
  },
})
