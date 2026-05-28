import * as PIXI from 'pixi.js-legacy'
import CanvasKitInit from '@rollerbird/canvaskit-wasm-pdf'
import { PaintFactory } from './PaintFactory'
import { Drawer } from './Drawer'
import { EventService } from './EventService'
import { type Canvas, type CanvasKit, type Surface } from '@rollerbird/canvaskit-wasm-pdf'

export class SkiaService {
  private canvasKit!: CanvasKit
  private surface!: Surface
  private canvas!: Canvas
  private paintFactory!: PaintFactory
  private drawer!: Drawer
  private events!: EventService
  private imageCache: Map<string, HTMLImageElement> = new Map()

  async init(canvasElementId: string) {
    const basePath = import.meta.env.BASE_URL

    this.canvasKit = await CanvasKitInit({
      locateFile: (file) => {
        if (file === 'canvaskit.wasm') {
          return `${basePath}skia/canvaskit-pdf.wasm`
        }
        return `${basePath}skia/${file}`
      },
    })

    const surface = this.canvasKit.MakeSWCanvasSurface(canvasElementId)
    if (!surface) throw new Error('Ошибка создания поверхности')
    this.surface = surface
    this.canvas = this.surface.getCanvas()
    this.canvas.clear(this.canvasKit.WHITE)
    this.surface.flush()
    this.paintFactory = new PaintFactory(this.canvasKit)
    this.drawer = new Drawer(this.canvasKit, this.paintFactory)
    this.events = new EventService()
  }

  render(container: PIXI.Container) {
    if (!this.canvas) {
      console.error('SkiaService не инициализирован')
      return
    }

    this.canvas.clear(this.canvasKit.WHITE)
    this.renderRecursive(container)
    this.surface.flush()
  }

  setupEvents(container: PIXI.Container) {
    const canvas = document.getElementById('skia-canvas') as HTMLCanvasElement
    canvas.addEventListener('click', (event) => {
      const rect = canvas.getBoundingClientRect()
      const scaleX = canvas.width / rect.width
      const scaleY = canvas.height / rect.height
      const canvasX = (event.clientX - rect.left) * scaleX
      const canvasY = (event.clientY - rect.top) * scaleY
      const allGraphics = this.events.getAllGraphics(container)

      for (const graphics of allGraphics) {
        const wt = graphics.worldTransform
        const local = this.events.worldToLocal(canvasX, canvasY, wt)
        const pointerInfo = {
          x: canvasX,
          y: canvasY,
        }

        if (this.events.isPointInGraphics(graphics, local.x, local.y)) {
          graphics.emit('pointerdown', {
            ...pointerInfo,
            type: 'pointerdown',
          } as PIXI.FederatedPointerEvent)
          graphics.emit('pointerup', {
            ...pointerInfo,
            type: 'pointerup',
          } as PIXI.FederatedPointerEvent)
          break
        }
      }
    })
  }

  private renderRecursive(item: PIXI.DisplayObject) {
    if (item instanceof PIXI.Graphics) {
      this.drawPixiGraphicsToSkia(item)
    } else if (item instanceof PIXI.Sprite) {
      this.drawSprite(item)
    } else if (item instanceof PIXI.Container) {
      for (const child of item.children) {
        this.renderRecursive(child)
      }
    }
  }

  private drawPixiGraphicsToSkia(graphics: PIXI.Graphics) {
    const wt = graphics.worldTransform
    const skMatrix = [wt.a, wt.c, wt.tx, wt.b, wt.d, wt.ty]
    this.canvas.save()
    this.canvas.concat(skMatrix)

    const graphicsData = graphics.geometry.graphicsData

    for (const data of graphicsData) {
      const { shape, fillStyle, lineStyle } = data

      switch (shape.type) {
        case PIXI.SHAPES.RECT:
          this.drawer.drawRect(this.canvas, shape, fillStyle, lineStyle)
          break
        case PIXI.SHAPES.ELIP:
          this.drawer.drawEllipse(this.canvas, shape, fillStyle, lineStyle)
          break
        case PIXI.SHAPES.CIRC:
          this.drawer.drawCircle(this.canvas, shape, fillStyle, lineStyle)
          break
        case PIXI.SHAPES.POLY:
          this.drawer.drawPoly(this.canvas, shape, lineStyle)
          break
      }
    }

    this.canvas.restore()
  }

  private drawSprite(sprite: PIXI.Sprite) {
    const texture = sprite.texture
    if (!texture || !texture.valid) return

    const baseTexture = texture.baseTexture
    const resource = baseTexture.resource
    const src = resource.src
    const wt = sprite.worldTransform
    const skiaMatrix = [wt.a, wt.c, wt.tx, wt.b, wt.d, wt.ty]
    const anchorX = sprite.anchor.x ?? 0
    const anchorY = sprite.anchor.y ?? 0
    const width = texture.width
    const height = texture.height
    const offsetX = -anchorX * width
    const offsetY = -anchorY * height

    const draw = (img: HTMLImageElement) => {
      const skiaImage = this.canvasKit.MakeImageFromCanvasImageSource(img)
      if (!skiaImage) return

      this.canvas.save()
      this.canvas.concat(skiaMatrix)
      this.canvas.drawImage(skiaImage, offsetX, offsetY)
      this.canvas.restore()
      skiaImage.delete()
      this.surface.flush()
    }

    if (this.imageCache.has(src)) {
      draw(this.imageCache.get(src)!)
      return
    }

    const img = new Image()
    img.crossOrigin = 'Anonymous'
    img.onload = () => {
      this.imageCache.set(src, img)
      draw(img)
    }
    img.src = src
  }

  private downloadPDF(pdfBytes: Uint8Array, filename: string) {
    const blob = new Blob([pdfBytes as unknown as ArrayBuffer], { type: 'application/pdf' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  async exportToPDF(container: PIXI.Container, filename: string = 'export') {
    try {
      const pdfDoc = this.canvasKit.MakePDFDocument({
        rootTag: {},
      })

      const pdfCanvas = pdfDoc.beginPage(this.surface.width(), this.surface.height())
      const originalCanvas = this.canvas
      this.canvas = pdfCanvas
      this.render(container)
      this.canvas = originalCanvas
      pdfDoc.endPage()
      const pdfBuffer = pdfDoc.close()
      const pdfBytes = new Uint8Array(pdfBuffer)
      this.downloadPDF(pdfBytes, filename)
    } catch (error) {
      console.error('Ошибка при экспорте в PDF:', error)
    }
  }
}
