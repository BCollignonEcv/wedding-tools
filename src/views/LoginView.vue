<template>
  <v-container class="fill-height">
    <v-row justify="center" align="center">
      <v-col cols="12" sm="8" md="5" lg="4">
        <v-card rounded="xl" elevation="4">
          <v-card-text class="text-center pa-10">
            <v-icon icon="mdi-heart" color="primary" size="64" class="mb-4" />
            <h1 class="text-h5 font-weight-bold mb-1">Wedding Tools</h1>
            <p class="text-body-2 text-medium-emphasis mb-8">
              Connectez-vous pour accéder à l'application
            </p>

            <!-- WebView warning -->
            <v-alert
              v-if="isWebView"
              type="warning"
              variant="tonal"
              rounded="lg"
              class="mb-6 text-left"
            >
              <p class="font-weight-bold mb-1">Navigateur non supporté</p>
              <p class="text-body-2">
                La connexion Google ne fonctionne pas dans ce navigateur intégré.
                Veuillez ouvrir cette page dans <strong>Safari</strong> ou <strong>Chrome</strong>.
              </p>
              <v-btn
                variant="outlined"
                size="small"
                class="mt-3"
                prepend-icon="mdi-content-copy"
                @click="copyUrl"
              >
                {{ copied ? 'Copié !' : 'Copier le lien' }}
              </v-btn>
            </v-alert>

            <template v-else>
              <v-alert
                v-if="authStore.error"
                type="error"
                variant="tonal"
                rounded="lg"
                class="mb-6 text-left"
              >
                {{ authStore.error }}
              </v-alert>

              <v-btn
                color="primary"
                size="large"
                block
                rounded="lg"
                @click="signIn"
              >
                <template #prepend>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 48 48">
                    <path fill="#fff" d="M44.5 20H24v8.5h11.8C34.7 33.9 30.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22c11 0 21-8 21-22 0-1.3-.2-2.7-.5-4z"/>
                  </svg>
                </template>
                Se connecter avec Google
              </v-btn>
            </template>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const router = useRouter()
const copied = ref(false)

function detectWebView(): boolean {
  const ua = navigator.userAgent
  return (
    /FBAN|FBAV|Instagram|Line|MicroMessenger/.test(ua) ||
    (ua.includes('iPhone') && !ua.includes('Safari')) ||
    (ua.includes('Android') && /wv|Version\/\d+\.\d+ Chrome/.test(ua))
  )
}

const isWebView = detectWebView()

async function copyUrl() {
  await navigator.clipboard.writeText(window.location.href)
  copied.value = true
  setTimeout(() => (copied.value = false), 2000)
}

// immediate: true handles the case where user is already set when the
// component mounts (after the Google redirect resolves before mount)
watch(
  () => authStore.user,
  (user) => {
    if (user && authStore.isAllowed) {
      router.push({ name: 'home' })
    }
  },
  { immediate: true },
)

function signIn() {
  authStore.signInWithGoogle()
}
</script>
