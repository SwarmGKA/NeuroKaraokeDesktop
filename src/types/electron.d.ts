export interface ElectronAPI {
  minimizeWindow: () => void
  maximizeWindow: () => void
  closeWindow: () => void
  startDragging: () => void
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}
