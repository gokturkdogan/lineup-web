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

export const minLength = (value: string | null | undefined, min: number, label = 'Bu alan'): string | null => {
  if (!value || value.length < min) return `${label} en az ${min} karakter olmalıdır.`
  return null
}
