import * as PIXI from 'pixi.js-legacy'

export class EventService {
  isPointInGraphics(graphics: PIXI.Graphics, localX: number, localY: number): boolean {
    const bounds = graphics.getLocalBounds()

    return (
      localX >= bounds.x &&
      localX <= bounds.x + bounds.width &&
      localY >= bounds.y &&
      localY <= bounds.y + bounds.height
    )
  }

  worldToLocal(x: number, y: number, wt: any): { x: number; y: number } {
    const det = wt.a * wt.d - wt.b * wt.c
    if (det === 0) return { x: 0, y: 0 }

    const localX = (wt.d * x - wt.c * y + wt.c * wt.ty - wt.d * wt.tx) / det
    const localY = (-wt.b * x + wt.a * y + wt.b * wt.tx - wt.a * wt.ty) / det

    return { x: localX, y: localY }
  }

  getAllGraphics(container: PIXI.Container): PIXI.Graphics[] {
    const allGraphics: PIXI.Graphics[] = []

    for (const child of container.children) {
      if (child instanceof PIXI.Graphics) {
        allGraphics.push(child)
      } else if (child instanceof PIXI.Container) {
        allGraphics.push(...this.getAllGraphics(child))
      }
    }

    return allGraphics
  }
}
