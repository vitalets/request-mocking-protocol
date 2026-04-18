/**
 * Environment helpers for client defaults.
 */

export function getEnvDebug() {
  const envDebug = process.env.REQUEST_MOCKING_DEBUG;
  if (envDebug) {
    return envDebug !== '0' && envDebug !== 'false';
  }
}
