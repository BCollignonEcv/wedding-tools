<template>
  <v-container class="py-10">
    <v-row justify="center">
      <v-col cols="12" class="text-center mb-8">
        <h1 class="text-h3 font-weight-bold mt-4">Wedding Tools</h1>
        <p class="text-subtitle-1 text-medium-emphasis mt-2">
          Tous les outils pour organiser votre jour parfait
        </p>
      </v-col>
    </v-row>

    <v-row justify="center">
      <v-col
        v-for="tool in tools"
        :key="tool.to"
        cols="12"
        sm="6"
        md="4"
        lg="3"
      >
        <v-card :to="tool.to" hover rounded="xl" elevation="3" height="200">
          <v-card-text class="d-flex flex-column align-center justify-center h-100 pa-8">
            <v-icon :icon="tool.icon" color="primary" size="56" />
            <h2 class="text-h6 font-weight-bold mt-4 text-center">
              {{ tool.title }}
            </h2>
            <p class="text-body-2 text-medium-emphasis mt-2 text-center">
              {{ tool.description }}
            </p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
const tools = [
  {
    title: 'Plan de table',
    icon: 'mdi-table-chair',
    to: '/table-plan',
    description: 'Gérez votre liste de convives et assignez les places.',
  },
]
</script>
