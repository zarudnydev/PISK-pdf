import * as PIXI from 'pixi.js-legacy'
import type { SkiaService } from './SkiaService'

export function addRandomShape(
  mainContainer: PIXI.Container,
  app: PIXI.Application,
  skiaService: SkiaService,
) {
  const shape = new PIXI.Graphics()

  const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff']
  const color = colors[Math.floor(Math.random() * colors.length)]
  const type = Math.floor(Math.random() * 3)

  const x = Math.random() * 600 + 50
  const y = Math.random() * 400 + 50

  if (type === 0) {
    const width = Math.random() * 80 + 20
    const height = Math.random() * 80 + 20
    shape.beginFill(color)
    shape.drawRect(-width / 2, -height / 2, width, height)
    shape.endFill()
  } else if (type === 1) {
    const radiusX = Math.random() * 60 + 20
    const radiusY = Math.random() * 60 + 20
    shape.beginFill(color)
    shape.drawEllipse(0, 0, radiusX, radiusY)
    shape.endFill()
  } else {
    const length = Math.random() * 150 + 30
    const angle = Math.random() * Math.PI * 2
    const dx = Math.cos(angle) * length
    const dy = Math.sin(angle) * length
    shape.lineStyle(5, color, 1)
    shape.moveTo(-dx / 2, -dy / 2)
    shape.lineTo(dx / 2, dy / 2)
  }

  shape.position.set(x, y)
  shape.angle = Math.random() * 360
  shape.scale.set(Math.random() * 1.5 + 0.5, Math.random() * 1.5 + 0.5)
  setupInteractive(shape, `Тип объекта: ${type}`)
  mainContainer.addChild(shape)
  app.renderer.render(app.stage)
  skiaService.render(mainContainer)
}

export function setupInteractive(graphics: PIXI.Graphics, name: string) {
  graphics.eventMode = 'static'
  graphics.on('pointerdown', () => {
    console.log(`${name} pointerdown!`)
  })
  graphics.on('pointerup', () => {
    console.log(`${name} pointerup!`)
  })
}

export const addSprite = async (container: PIXI.Container, url: string, x: number, y: number) => {
  try {
    const texture = await PIXI.Assets.load(url)
    const bunny = new PIXI.Sprite(texture)
    bunny.position.set(x, y)
    bunny.angle = 10
    bunny.scale.set(2, 2)
    container.addChild(bunny)
  } catch (error) {
    console.error('Ошибка загрузки спрайта:', error)
  }
}

export const CANVAS_SIZE = {
  width: 740,
  height: 500,
} as const
