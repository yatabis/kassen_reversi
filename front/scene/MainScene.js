import phina from 'phina.js'
import { STATE } from '../constants'
import { ReversiBoard, ScoreGauge, TurnPanel } from '../display'
import { ResultOverlay } from './ResultOverlay'

/** メインシーン */
export const MainScene = phina.createClass({
  superClass: phina.display.DisplayScene,

  init(options) {
    this.superInit(options)
    this.backgroundColor = '#fff'

    let state = STATE.NONE
    const socket = new WebSocket(`ws://${document.domain}:3000/ws`)

    const board = ReversiBoard()
      .setPosition(this.gridX.center(), this.gridY.center())
      .addChildTo(this)

    const turnPanel = TurnPanel()
      .setPosition(this.gridX.center(), 880)
      .addChildTo(this)

    const scoreGauge = ScoreGauge()
      .setPosition(this.gridX.center(), 96)
      .addChildTo(this)

    const resultOverlay = ResultOverlay()

    resultOverlay.on('retry', () => {
      this.removeChild(resultOverlay)
      socket.send(JSON.stringify({ type: 'Retry' }))
    })

    // データ受信処理
    socket.addEventListener('message', (e) => {
      const res = JSON.parse(e.data)

      const black = BigInt(res.black)
      const white = BigInt(res.white)

      state = res.state
      board.updateBoard(black, white)
      scoreGauge.updateScore(res.black_count, res.white_count)

      if (state !== STATE.NONE) {
        resultOverlay.setState(state).addChildTo(this)
      }
    })

    // ボードのセルが押されたときの処理
    board.on('put', (e) => {
      if (state !== STATE.NONE || turnPanel.isCooling) {
        return
      }

      const req = JSON.stringify({
        type: 'Put',
        turn: turnPanel.turn,
        position: e.id,
      })

      socket.send(req)
      turnPanel.setCooltime(1000)
    })
  },
})
