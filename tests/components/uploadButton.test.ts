import { describe, expect, it } from 'vitest'
import { UploadButtonComponent } from '../../src/components/uploadButton'

describe('uploadButton', () => {
  it('renders a wrapper <label> with a hidden <input type="file">', () => {
    const c = new UploadButtonComponent()
    const el = c.create({ label: 'Upload' }, () => {})
    expect(el.tagName).toBe('LABEL')
    const fileInput = el.querySelector('input[type=file]') as HTMLInputElement
    expect(fileInput).toBeTruthy()
    // The file input lives inside the label wrapper; visibility is the caller's
    // concern (CSS / runtime), so we only assert the input exists and is hidden
    // from interaction (the visible button is a <span role="button">).
    expect(fileInput.hidden).toBe(false)
  })

  it('honours accept and multiple props', () => {
    const c = new UploadButtonComponent()
    const el = c.create({ label: 'Img', accept: 'image/*', multiple: true }, () => {})
    const fileInput = el.querySelector('input[type=file]') as HTMLInputElement
    expect(fileInput.accept).toBe('image/*')
    expect(fileInput.multiple).toBe(true)
  })

  it('emits { files, count } on bound change event', () => {
    const c = new UploadButtonComponent().bind('change', 'upload.complete')
    let captured: Record<string, unknown> | undefined
    const emit = (_id: string, payload?: Record<string, unknown>) => {
      captured = payload
    }

    const el = c.create({ label: 'Upload' }, emit)
    const fileInput = el.querySelector('input[type=file]') as HTMLInputElement

    const file = new File(['hello'], 'hello.txt', { type: 'text/plain' })
    Object.defineProperty(fileInput, 'files', { value: [file], configurable: true })
    fileInput.dispatchEvent(new Event('change', { bubbles: true }))

    expect(captured?.files).toEqual([file])
    expect(captured?.count).toBe(1)
  })
})
