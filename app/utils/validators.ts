/**
 * Durumsuz, kullanıma hazır validatorler. Başarısızlık halinde hata mesajı
 * (string) döner, başarı halinde `null` döner.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const required = (value: string | null | undefined, label = 'Bu alan'): string | null =>
  value && value.trim().length > 0 ? null : `${label} zorunludur.`

export const email = (value: string | null | undefined): string | null => {
  if (!value) return 'E-posta zorunludur.'
  if (!EMAIL_RE.test(value.trim())) return 'Geçerli bir e-posta adresi girin.'
  return null
}

export const minLength = (
  value: string | null | undefined,
  min: number,
  label = 'Bu alan',
): string | null => {
  if (!value || value.length < min) return `${label} en az ${min} karakter olmalıdır.`
  return null
}

export const maxLength = (
  value: string | null | undefined,
  max: number,
  label = 'Bu alan',
): string | null => {
  if (value && value.length > max) return `${label} en fazla ${max} karakter olabilir.`
  return null
}

/**
 * Parola politikası (backend ile birebir aynı):
 * - 6–12 karakter
 * - En az bir harf (a–z / A–Z) ve en az bir rakam (0–9)
 *
 * @see /^(?=.*[A-Za-z])(?=.*\d).{6,12}$/
 */
export const password = (
  value: string | null | undefined,
  label = 'Şifre',
): string | null => {
  if (!value) return `${label} zorunludur.`
  if (value.length < 6 || value.length > 12) return `${label} 6-12 karakter olmalıdır.`
  if (!/[A-Za-z]/.test(value) || !/\d/.test(value)) {
    return `${label} en az bir harf ve bir rakam içermelidir.`
  }
  return null
}
