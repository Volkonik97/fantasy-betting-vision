export const logInfo = (...args) => {
  console.log('[LOG]', ...args)
}

export const logError = (...args) => {
  console.error('Error:', ...args)
}

export const logWarn = (...args) => {
  console.warn('[WARN]', ...args)
}
