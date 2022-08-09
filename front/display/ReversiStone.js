import phina from 'phina.js'
import { STONE } from '../constants'

/** リバーシの駒 */
export const ReversiStone = phina.createClass({
  superClass: phina.display.CircleShape,

  init(options) {
    this.superInit({
      ...options,
      fill: null,
      stroke: null,
    })

    this._type = STONE.NONE
  },

  /** 駒タイプを設定 */
  setType(type) {
    this._type = type

    let fill = null
    switch (type) {
      case STONE.BLACK:
        fill = 'black'
        break
      case STONE.WHITE:
        fill = 'white'
        break
    }
    this.fill = fill
  },

  _accessor: {
    type: {
      get() {
        return this._type
      },
      set(v) {
        this.setType(v)
      },
    },
  },
})
