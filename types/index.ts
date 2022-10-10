export interface CreateImageJob {
  prompt: string
  height?: number
  width?: number
  cfg_scale?: string
  steps?: number
  sampler?: string
  apikey?: string
  seed?: number
  numImages?: number
}

export interface GenerateResponse {
  id: string
  message?: string
}

export interface KeypressEvent {
  keyCode: number
  preventDefault: () => {}
  shiftKey: boolean
}
