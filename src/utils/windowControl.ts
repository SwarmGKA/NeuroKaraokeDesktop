export const minimizeWindow = () => {
  window.electronAPI?.minimizeWindow()
}

export const maximizeWindow = () => {
  window.electronAPI?.maximizeWindow()
}

export const closeWindow = () => {
  window.electronAPI?.closeWindow()
}

export const startDragging = () => {
  window.electronAPI?.startDragging()
}
