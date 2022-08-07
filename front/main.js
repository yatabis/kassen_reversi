import phina from 'phina.js'
import { MainScene } from './scene'
import { SCREEN } from './constants'

// Sceneを登録
phina.register('kr.MainScene', MainScene)

const scenes = [
  {
    className: 'kr.MainScene',
    label: 'main',
  },
]

phina.main(() => {
  // const runner = (e) => {
  //   requestAnimationFrame(e)
  // }

  const app = phina.game.GameApp({
    width: SCREEN.WIDTH,
    height: SCREEN.HEIGHT,
    startLabel: 'main',
    // runner,
    scenes,
  })

  app.run()
})
