import { useEffect, useState } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'

const isStandalone = () =>
  matchMedia('(display-mode: standalone)').matches || navigator.standalone === true

export function usePWA() {
  // Service worker: atualização sob demanda (registerType: 'prompt')
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    offlineReady: [offlineReady, setOfflineReady],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_url, registration) {
      // Verifica se há nova versão a cada hora enquanto o app estiver aberto
      if (registration) setInterval(() => registration.update(), 60 * 60 * 1000)
    },
  })

  // Prompt de instalação (Chrome/Edge/Android)
  const [installEvent, setInstallEvent] = useState(null)
  const [installed, setInstalled] = useState(isStandalone)

  useEffect(() => {
    const onPrompt = (e) => { e.preventDefault(); setInstallEvent(e) }
    const onInstalled = () => { setInstalled(true); setInstallEvent(null) }
    window.addEventListener('beforeinstallprompt', onPrompt)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  const install = async () => {
    if (!installEvent) return
    await installEvent.prompt()
    setInstallEvent(null)
  }

  // Conexão
  const [online, setOnline] = useState(navigator.onLine)
  useEffect(() => {
    const up = () => setOnline(true)
    const down = () => setOnline(false)
    window.addEventListener('online', up)
    window.addEventListener('offline', down)
    return () => { window.removeEventListener('online', up); window.removeEventListener('offline', down) }
  }, [])

  return {
    needRefresh,
    offlineReady,
    update: () => updateServiceWorker(true),
    dismiss: () => { setNeedRefresh(false); setOfflineReady(false) },
    canInstall: !!installEvent && !installed,
    install,
    installed,
    online,
  }
}
