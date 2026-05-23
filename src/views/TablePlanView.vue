<template>
  <v-container class="py-6">
    <div class="d-flex align-center mb-6">
      <v-icon icon="mdi-table-chair" color="primary" size="32" class="mr-3" />
      <div>
        <h1 class="text-h5 font-weight-bold">Plan de table</h1>
        <p class="text-body-2 text-medium-emphasis">
          Gérez vos convives et organisez les tables
        </p>
      </div>
    </div>

    <v-tabs v-model="tab" color="primary" class="mb-6">
      <v-tab value="guests" prepend-icon="mdi-account-group">
        Convives
        <v-badge
          v-if="store.guests.length > 0"
          :content="store.guests.length"
          color="primary"
          inline
          class="ml-2"
        />
      </v-tab>
      <v-tab value="tables" prepend-icon="mdi-table-chair">
        Tables
        <v-badge
          v-if="store.tables.length > 0"
          :content="store.tables.length"
          color="primary"
          inline
          class="ml-2"
        />
      </v-tab>
      <v-tab value="seating" prepend-icon="mdi-seat">
        Assignation
        <v-badge
          v-if="store.unassignedGuests.length > 0"
          :content="store.unassignedGuests.length"
          color="warning"
          inline
          class="ml-2"
        />
      </v-tab>
    </v-tabs>

    <v-tabs-window v-model="tab">
      <v-tabs-window-item value="guests">
        <GuestListPanel />
      </v-tabs-window-item>

      <v-tabs-window-item value="tables">
        <TablesPanel />
      </v-tabs-window-item>

      <v-tabs-window-item value="seating">
        <SeatingPanel />
      </v-tabs-window-item>
    </v-tabs-window>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useTablePlanStore } from '@/stores/tablePlan'
import GuestListPanel from '@/components/table-plan/GuestListPanel.vue'
import TablesPanel from '@/components/table-plan/TablesPanel.vue'
import SeatingPanel from '@/components/table-plan/SeatingPanel.vue'

const store = useTablePlanStore()
const tab = ref('guests')
</script>
