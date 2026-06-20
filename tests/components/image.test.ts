import { describe, expect, it } from 'vitest'
import { ImageComponent } from '../../src/components/image'

describe('image', () => {
  it('renders an <img> with src and alt', () => {
    const c = new ImageComponent()
    const el = c.create({ src: 'https://example.com/a.png', alt: 'A' }, () => {})
    expect(el.tagName).toBe('IMG')
    expect((el as HTMLImageElement).src).toBe('https://example.com/a.png')
    expect((el as HTMLImageElement).alt).toBe('A')
  })

  it('honours width and height', () => {
    const c = new ImageComponent()
    const el = c.create({ src: 'a.png', width: 100, height: 50 }, () => {})
    expect((el as HTMLImageElement).width).toBe(100)
    expect((el as HTMLImageElement).height).toBe(50)
  })
})
