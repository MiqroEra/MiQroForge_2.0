import { commonEn } from './common'
import { topbarEn } from './topbar'
import { inspectorEn } from './inspector'
import { settingsEn } from './settings'
import { shortcutsEn } from './shortcuts'
import { paletteEn } from './palette'
import { workflowEn } from './workflow'
import { filesEn } from './files'
import { runsEn } from './runs'
import { chatEn } from './chat'
import { labelsEn } from './labels'
import { docsEn } from './docs'
import { galleryEn } from './gallery'
import { loginEn } from './login'
import { memoryEn } from './memory'
import { adminEn } from './admin'
import { repositoryEn } from './repository'
import { canvasEn } from './canvas'

export const en = {
  common: commonEn,
  topbar: topbarEn,
  inspector: inspectorEn,
  settings: settingsEn,
  shortcuts: shortcutsEn,
  palette: paletteEn,
  workflow: workflowEn,
  files: filesEn,
  runs: runsEn,
  chat: chatEn,
  labels: labelsEn,
  docs: docsEn,
  gallery: galleryEn,
  login: loginEn,
  memory: memoryEn,
  admin: adminEn,
  repository: repositoryEn,
  canvas: canvasEn,
}

export type Dict = typeof en
