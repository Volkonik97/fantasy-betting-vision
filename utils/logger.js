function log(...args) {
  console.log(`[LOG]`, ...args);
}

function error(...args) {
  console.error(`[ERROR]`, ...args);
}

module.exports = { log, error };
