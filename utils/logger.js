export const logInfo = (...args) => {
  console.log('[LOG]', ...args)
}

export const logError = (...args) => {
  console.error('Error:', ...args)
}
