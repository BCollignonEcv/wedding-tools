import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth'
import { auth } from '@/plugins/firebase'

const allowedEmails: string[] = import.meta.env.VITE_ALLOWED_EMAILS
  ? import.meta.env.VITE_ALLOWED_EMAILS.split(',').map((e: string) => e.trim().toLowerCase())
  : []

// Safari's ITP blocks the cookie Firebase needs to restore state after a redirect.
// Use popup on Safari, redirect everywhere else.
function isSafari(): boolean {
  const ua = navigator.userAgent
  return /Safari/.test(ua) && !/Chrome|CriOS|FxiOS|Android/.test(ua)
}

async function checkAllowlist(email: string | null | undefined): Promise<boolean> {
  if (allowedEmails.length === 0) return true
  return allowedEmails.includes(email?.toLowerCase() ?? '')
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const loading = ref(true)
  const error = ref('')

  let resolveReady!: () => void
  const readyPromise = new Promise<void>((resolve) => {
    resolveReady = resolve
  })

  function init(): () => void {
    getRedirectResult(auth).then(async (result) => {
      if (result) {
        const allowed = await checkAllowlist(result.user.email)
        if (!allowed) {
          await firebaseSignOut(auth)
          error.value = `L'adresse ${result.user.email} n'est pas autorisée.`
        }
      }
    })

    return onAuthStateChanged(auth, (u) => {
      user.value = u
      loading.value = false
      resolveReady()
    })
  }

  function ready(): Promise<void> {
    return readyPromise
  }

  const isAllowed = computed(() => {
    if (!user.value) return false
    if (allowedEmails.length === 0) return true
    return allowedEmails.includes(user.value.email?.toLowerCase() ?? '')
  })

  async function signInWithGoogle(): Promise<void> {
    error.value = ''
    const provider = new GoogleAuthProvider()

    if (isSafari()) {
      try {
        const result = await signInWithPopup(auth, provider)
        const allowed = await checkAllowlist(result.user.email)
        if (!allowed) {
          await firebaseSignOut(auth)
          error.value = `L'adresse ${result.user.email} n'est pas autorisée.`
        }
      } catch (e: unknown) {
        const code = (e as { code?: string }).code
        if (code !== 'auth/popup-closed-by-user' && code !== 'auth/cancelled-popup-request') {
          error.value = 'Erreur lors de la connexion. Veuillez réessayer.'
        }
      }
    } else {
      await signInWithRedirect(auth, provider)
    }
  }

  async function signOut(): Promise<void> {
    await firebaseSignOut(auth)
  }

  return { user, loading, error, isAllowed, init, ready, signInWithGoogle, signOut }
})
