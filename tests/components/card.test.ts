import { describe, expect, it } from 'vitest'
import { CardComponent } from '../../src/components/card'

describe('card', () => {
  it('renders a <div> container without title', () => {
    const c = new CardComponent()
    const el = c.create({}, () => {})
    expect(el).toBeInstanceOf(HTMLDivElement)
    expect(el.querySelector('h3')).toBeNull()
  })

  it('renders a title heading when provided', () => {
    const c = new CardComponent()
    const el = c.create({ title: 'Profile' }, () => {})
    const heading = el.querySelector('h3')
    expect(heading?.textContent).toBe('Profile')
  })

  it('marks itself as a container (allows children)', () => {
    const c = new CardComponent()
    expect(c.container).toBe(true)
  })
})
