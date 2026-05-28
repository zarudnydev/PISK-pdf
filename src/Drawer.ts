import * as PIXI from 'pixi.js-legacy'
import { PaintFactory } from './PaintFactory'
import { type Canvas, type CanvasKit, type Path } from '@rollerbird/canvaskit-wasm-pdf'

export class Drawer {
  private canvasKit: CanvasKit
  private paintFactory: PaintFactory

  constructor(canvasKit: CanvasKit, paintFactory: PaintFactory) {
    this.canvasKit = canvasKit
    this.paintFactory = paintFactory
  }

  drawRect(
    canvas: Canvas,
    rect: PIXI.Rectangle,
    fillStyle: PIXI.FillStyle,
    lineStyle: PIXI.LineStyle,
  ) {
    const skiaRect = this.canvasKit.XYWHRect(rect.x, rect.y, rect.width, rect.height)

    if (fillStyle?.visible) {
      const paint = this.paintFactory.createFillPaint(fillStyle.color)
      canvas.drawRect(skiaRect, paint)
      paint.delete()
    }

    if (lineStyle?.visible) {
      const paint = this.paintFactory.createStrokePaint(lineStyle.color, lineStyle.width)
      canvas.drawRect(skiaRect, paint)
      paint.delete()
    }
  }

  drawEllipse(
    canvas: Canvas,
    shape: PIXI.Ellipse,
    fillStyle: PIXI.FillStyle,
    lineStyle: PIXI.LineStyle,
  ) {
    const left = shape.x - shape.width
    const top = shape.y - shape.height
    const width = shape.width * 2
    const height = shape.height * 2
    const rect = this.canvasKit.XYWHRect(left, top, width, height)

    if (fillStyle?.visible) {
      const paint = this.paintFactory.createFillPaint(fillStyle.color)
      canvas.drawOval(rect, paint)
      paint.delete()
    }

    if (lineStyle?.visible) {
      const paint = this.paintFactory.createStrokePaint(lineStyle.color, lineStyle.width)
      canvas.drawOval(rect, paint)
      paint.delete()
    }
  }

  drawCircle(
    canvas: Canvas,
    shape: PIXI.Circle,
    fillStyle: PIXI.FillStyle,
    lineStyle: PIXI.LineStyle,
  ) {
    if (fillStyle?.visible) {
      const paint = this.paintFactory.createFillPaint(fillStyle.color)
      canvas.drawCircle(shape.x, shape.y, shape.radius, paint)
      paint.delete()
    }

    if (lineStyle?.visible) {
      const paint = this.paintFactory.createStrokePaint(lineStyle.color, lineStyle.width)
      canvas.drawCircle(shape.x, shape.y, shape.radius, paint)
      paint.delete()
    }
  }

  drawPoly(canvas: Canvas, shape: PIXI.Polygon, lineStyle: PIXI.LineStyle) {
    const points = shape.points
    if (!points || points.length < 4) return

    const path = this.buildPathFromPoints(points)

    if (lineStyle?.visible) {
      const paint = this.paintFactory.createStrokePaint(lineStyle.color, lineStyle.width)
      canvas.drawPath(path, paint)
      paint.delete()
    }

    path.delete()
  }

  private buildPathFromPoints(points: number[]) {
    const cmds: number[] = []
    const MOVE_VERB = 0
    const LINE_VERB = 1
    cmds.push(MOVE_VERB, points[0], points[1])

    for (let i = 2; i < points.length; i += 2) {
      cmds.push(LINE_VERB, points[i], points[i + 1])
    }

    const path = this.canvasKit.Path.MakeFromCmds(cmds) as Path

    if (!path) {
      console.error('Ошибка создания пути')
    }

    return path
  }
}
