export type SpecimenType = 'organism' | 'system' | 'phenomenon' | 'process'
export type SpecimenStatus = 'live' | 'progress' | 'queued'

export interface Specimen {
  id: string
  name: string
  common: string
  type: SpecimenType
  status: SpecimenStatus
  desc: string
  quote?: string
  att?: string
  region: string
  first: string
  words: string
  links: string[]
  serial?: string
}
