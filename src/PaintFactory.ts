import { type CanvasKit } from '@rollerbird/canvaskit-wasm-pdf'

export class PaintFactory {
  private canvasKit: CanvasKit

  constructor(canvasKit: CanvasKit) {
    this.canvasKit = canvasKit
  }

  createFillPaint(color: string | number) {
    const paint = new this.canvasKit.Paint()
    paint.setColor(this.hexToSkiaColor(color))
    paint.setStyle(this.canvasKit.PaintStyle.Fill)
    paint.setAntiAlias(true)
    return paint
  }

  createStrokePaint(color: string | number, width: number) {
    const paint = new this.canvasKit.Paint()
    paint.setColor(this.hexToSkiaColor(color))
    paint.setStyle(this.canvasKit.PaintStyle.Stroke)
    paint.setStrokeWidth(width)
    paint.setAntiAlias(true)
    return paint
  }

  hexToSkiaColor(hex: string | number) {
    let colorHex: string
    if (typeof hex === 'number') {
      colorHex = '#' + hex.toString(16).padStart(6, '0')
    } else {
      colorHex = hex
    }
    const r = parseInt(colorHex.slice(1, 3), 16)
    const g = parseInt(colorHex.slice(3, 5), 16)
    const b = parseInt(colorHex.slice(5, 7), 16)
    return this.canvasKit.Color(r, g, b, 255)
  }
}
