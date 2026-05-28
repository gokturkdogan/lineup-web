/**
 * Sunucu tarafında imzalanmış JWT'lerin yalnızca payload kısmını okumak için
 * minimal bir helper. **İmza doğrulaması yapmaz** — UI'da hızlı claim
 * erişimi içindir (kimlik doğrulama her zaman API tarafında yapılır).
 */

const base64UrlToString = (input: string): string => {
  const normalized = input.replace(/-/g, '+').replace(/_/g, '/')
  const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4)

  const binary =
    typeof atob === 'function'
      ? atob(padded)
      : Buffer.from(padded, 'base64').toString('binary')

  // UTF-8 güvenli decode
  return decodeURIComponent(
    binary
      .split('')
      .map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
      .join(''),
  )
}

export const decodeJwtPayload = <T = Record<string, unknown>>(
  token: string | null | undefined,
): T | null => {
  if (!token) return null
  try {
    const parts = token.split('.')
    if (parts.length < 2 || !parts[1]) return null
    return JSON.parse(base64UrlToString(parts[1])) as T
  } catch {
    return null
  }
}
