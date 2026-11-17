import { commonZh } from './common'
import { topbarZh } from './topbar'
import { inspectorZh } from './inspector'
import { settingsZh } from './settings'
import { shortcutsZh } from './shortcuts'
import { paletteZh } from './palette'
import { workflowZh } from './workflow'
import { filesZh } from './files'
import { runsZh } from './runs'
import { chatZh } from './chat'
import { labelsZh } from './labels'
import { docsZh } from './docs'
import { galleryZh } from './gallery'
import { loginZh } from './login'
import { memoryZh } from './memory'
import { adminZh } from './admin'
import { repositoryZh } from './repository'
import { canvasZh } from './canvas'
import type { Dict } from '../en'

export const zh: { [K in keyof Dict]: { [KK in keyof Dict[K]]: string } } = {
  common: commonZh,
  topbar: topbarZh,
  inspector: inspectorZh,
  settings: settingsZh,
  shortcuts: shortcutsZh,
  palette: paletteZh,
  workflow: workflowZh,
  files: filesZh,
  runs: runsZh,
  chat: chatZh,
  labels: labelsZh,
  docs: docsZh,
  gallery: galleryZh,
  login: loginZh,
  memory: memoryZh,
  admin: adminZh,
  repository: repositoryZh,
  canvas: canvasZh,
}
