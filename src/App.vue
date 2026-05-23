<template>
  <v-app>
    <v-app-bar color="primary" elevation="2">
      <v-app-bar-nav-icon v-if="authStore.user" @click="drawer = !drawer" />
      <v-toolbar-title>Wedding Tools</v-toolbar-title>
      <template v-if="authStore.user" #append>
        <v-avatar
          :image="authStore.user.photoURL ?? undefined"
          color="white"
          size="32"
          class="mr-1"
        >
          <span v-if="!authStore.user.photoURL" class="text-caption text-primary font-weight-bold">
            {{ initials }}
          </span>
        </v-avatar>
        <v-btn icon="mdi-logout" variant="text" @click="signOut" />
      </template>
    </v-app-bar>

    <v-navigation-drawer v-if="authStore.user" v-model="drawer" temporary>
      <v-list-item prepend-icon="mdi-heart" title="Wedding Tools" nav />
      <v-divider />
      <v-list density="compact" nav>
        <v-list-item
          v-for="item in navItems"
          :key="item.to"
          :prepend-icon="item.icon"
          :title="item.title"
          :to="item.to"
          rounded="lg"
        />
      </v-list>
      <template #append>
        <v-divider />
        <v-list-item
          prepend-icon="mdi-logout"
          title="Se déconnecter"
          class="text-error"
          @click="signOut"
        />
      </template>
    </v-navigation-drawer>

    <v-main>
      <RouterView />
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { RouterView, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const router = useRouter()
const drawer = ref(false)

const initials = computed(() => {
  const name = authStore.user?.displayName ?? authStore.user?.email ?? ''
  return name.slice(0, 2).toUpperCase()
})

const navItems = [
  { title: 'Accueil', icon: 'mdi-home', to: '/' },
  { title: 'Plan de table', icon: 'mdi-table-chair', to: '/table-plan' },
]

async function signOut() {
  await authStore.signOut()
  drawer.value = false
  router.push({ name: 'login' })
}
</script>
