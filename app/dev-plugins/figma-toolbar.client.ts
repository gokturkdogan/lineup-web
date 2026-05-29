/**
 * Figma handoff — yalnızca development (`nuxt dev`).
 * Production build'de bu plugin hiç yüklenmez (`nuxt.config` → yalnızca `isDev`).
 *
 * URL: `?figma=1` → "Figma bar'ı aç" → tıkla → Panoya kopyala → Figma'da Cmd+V.
 */
const SESSION_KEY = 'lineup-figma-toolbar'
const LAUNCHER_ID = 'lineup-figma-launch'
const CAPTURE_SCRIPT = 'https://mcp.figma.com/mcp/html-to-design/capture.js'
const TOOLBAR_HASH = 'figmacapture'

let scriptReady: Promise<void> | null = null
let toolbarOpen = false
let openingToolbar = false

const loadCaptureScript = (): Promise<void> => {
  if (scriptReady) return scriptReady

  scriptReady = new Promise((resolve, reject) => {
    const existing = document.querySelector(
      `script[src="${CAPTURE_SCRIPT}"]`,
    ) as HTMLScriptElement | null

    if (existing?.dataset.figmaReady === '1') {
      resolve()
      return
    }

    const script = existing ?? document.createElement('script')
    if (!existing) {
      script.src = CAPTURE_SCRIPT
      script.async = true
      document.head.appendChild(script)
    }

    const onReady = () => {
      script.dataset.figmaReady = '1'
      resolve()
    }

    if (script.dataset.figmaReady === '1') {
      onReady()
      return
    }

    script.addEventListener('load', onReady, { once: true })
    script.addEventListener('error', () => reject(new Error('Figma script yüklenemedi')), {
      once: true,
    })
  })

  return scriptReady
}

const removeLauncher = () => {
  document.getElementById(LAUNCHER_ID)?.remove()
}

const isCaptureHashActive = () => location.hash.includes(TOOLBAR_HASH)

/** Hash sonrası script hash'i görsün diye bookmarklet deseni — tek seferlik. */
const reinjectCaptureScript = async () => {
  await new Promise((r) => window.setTimeout(r, 200))
  const reinject = document.createElement('script')
  reinject.src = CAPTURE_SCRIPT
  document.head.appendChild(reinject)
}

/** Toolbar'ı kullanıcı tıklamasıyla aç. */
const openToolbar = async () => {
  if (openingToolbar) return
  if (toolbarOpen && isCaptureHashActive()) return

  openingToolbar = true
  removeLauncher()

  try {
    if (!isCaptureHashActive()) {
      const url = `${location.pathname}${location.search}#${TOOLBAR_HASH}`
      history.replaceState(history.state, '', url)
    }

    await loadCaptureScript()
    await reinjectCaptureScript()

    toolbarOpen = true
  } catch {
    toolbarOpen = false
    if (isCaptureHashActive()) {
      history.replaceState(
        history.state,
        '',
        `${location.pathname}${location.search}`,
      )
    }
    alert('Figma capture script yüklenemedi. Ağı / reklam engelleyiciyi kontrol et.')
    mountLauncher()
  } finally {
    openingToolbar = false
  }
}

const closeToolbar = () => {
  if (!isCaptureHashActive()) return

  history.replaceState(
    history.state,
    '',
    `${location.pathname}${location.search}`,
  )
  toolbarOpen = false
  mountLauncher()
}

const mountLauncher = () => {
  if (isCaptureHashActive()) return

  removeLauncher()

  const btn = document.createElement('button')
  btn.id = LAUNCHER_ID
  btn.type = 'button'
  btn.textContent = 'Figma bar\'ı aç'
  Object.assign(btn.style, {
    position: 'fixed',
    top: 'calc(env(safe-area-inset-top, 0px) + 8px)',
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: '2147483646',
    padding: '10px 18px',
    fontSize: '13px',
    fontWeight: '700',
    letterSpacing: '0.04em',
    color: '#064e3b',
    background: '#fff',
    border: 'none',
    borderRadius: '999px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.22)',
    cursor: 'pointer',
  })

  btn.addEventListener('click', (e) => {
    e.preventDefault()
    e.stopPropagation()
    void openToolbar()
  })

  document.body.append(btn)
}

const isFigmaMode = (query: Record<string, unknown>): boolean => {
  const v = query.figma
  return v === '1' || v === 'true'
}

export default defineNuxtPlugin(() => {
  if (!import.meta.dev) return

  const route = useRoute()

  const syncMode = () => {
    if (isFigmaMode(route.query)) {
      sessionStorage.setItem(SESSION_KEY, '1')
    }
    return sessionStorage.getItem(SESSION_KEY) === '1'
  }

  const boot = () => {
    if (!syncMode()) return

    toolbarOpen = isCaptureHashActive()
    if (toolbarOpen) {
      void loadCaptureScript().then(() => reinjectCaptureScript())
    } else {
      mountLauncher()
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true })
  } else {
    boot()
  }

  const onKeydown = (event: KeyboardEvent) => {
    if (sessionStorage.getItem(SESSION_KEY) !== '1') return
    if (event.altKey && event.shiftKey && event.code === 'KeyF') {
      event.preventDefault()
      if (isCaptureHashActive()) {
        closeToolbar()
      } else {
        void openToolbar()
      }
    }
  }

  window.addEventListener('keydown', onKeydown)

  // Yalnızca sayfa değişince toolbar kapat — hash (#figmacapture) toolbar açıkken kalır.
  watch(
    () => route.path,
    () => {
      if (!syncMode()) return
      if (openingToolbar) return

      toolbarOpen = false
      if (isCaptureHashActive()) {
        history.replaceState(
          history.state,
          '',
          `${location.pathname}${location.search}`,
        )
      }
      nextTick(mountLauncher)
    },
  )
})
