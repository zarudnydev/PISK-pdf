import * as PIXI from 'pixi.js-legacy'
import { SkiaService } from './SkiaService'
import { addRandomShape, addSprite, CANVAS_SIZE, setupInteractive } from './utils'

const pixiContainer = document.querySelector('#pixi-container') as HTMLDivElement

const app = new PIXI.Application({
  width: CANVAS_SIZE.width,
  height: CANVAS_SIZE.height,
  backgroundColor: 'white',
  forceCanvas: true,
})

pixiContainer.appendChild(app.view as HTMLCanvasElement)

const mainContainer = new PIXI.Container()
const subContainer = new PIXI.Container()
const g1 = new PIXI.Graphics()
const g2 = new PIXI.Graphics()
const g3 = new PIXI.Graphics()
const g4 = new PIXI.Graphics()

g1.beginFill('#ff0000').drawEllipse(0, 0, 100, 50).endFill()
g1.position.set(300, 300)
g1.angle = 0
setupInteractive(g1, 'Элипс')

g2.lineStyle(2, '#f30000').beginFill('#0000ff').drawRect(-50, -75, 100, 150).endFill()
g2.position.set(620, 160)
g2.scale.set(1.5, 1.7)
g2.angle = 15
setupInteractive(g2, 'Прямоугольник')

g3.lineStyle(20, '#82cd5f', 1).moveTo(0, 0).lineTo(150, 100)
g3.position.set(100, 360)
g3.angle = -20
setupInteractive(g3, 'Линия')

g4.lineStyle(10, '#e4e405', 1).moveTo(0, 70).lineTo(150, -30)
g4.angle = 20
setupInteractive(g4, 'Линия')

subContainer.position.set(75, 50)
subContainer.addChild(g3, g4)
mainContainer.addChild(subContainer, g1, g2)
app.stage.addChild(mainContainer)

let skiaService: SkiaService

const initWrapper = async () => {
  skiaService = new SkiaService()
  const skiaCanvas = document.getElementById('skia-canvas') as HTMLCanvasElement
  skiaCanvas.width = CANVAS_SIZE.width
  skiaCanvas.height = CANVAS_SIZE.height
  await skiaService.init('skia-canvas')
  await addSprite(mainContainer, 'https://pixijs.com/assets/bunny.png', 500, 400)
  mainContainer.updateTransform()
  skiaService.render(mainContainer)
  skiaService.setupEvents(mainContainer)
}

initWrapper()

const button = document.getElementById('add-random-shape') as HTMLButtonElement
const pdfButton = document.getElementById('export-pdf') as HTMLButtonElement

button.addEventListener('click', () => addRandomShape(mainContainer, app, skiaService))
pdfButton.addEventListener('click', () => {
  skiaService.exportToPDF(mainContainer, 'my-export.pdf')
})
