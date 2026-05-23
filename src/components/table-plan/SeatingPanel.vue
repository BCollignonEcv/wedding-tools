<template>
  <div>
    <!-- Stats -->
    <v-row class="mb-4" dense>
      <v-col cols="6" sm="3">
        <v-card rounded="lg" variant="tonal" color="primary">
          <v-card-text class="text-center pa-4">
            <div class="text-h5 font-weight-bold">{{ store.guests.length }}</div>
            <div class="text-caption">Convives</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="6" sm="3">
        <v-card rounded="lg" variant="tonal" color="success">
          <v-card-text class="text-center pa-4">
            <div class="text-h5 font-weight-bold">{{ store.assignedCount }}</div>
            <div class="text-caption">Assignés</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="6" sm="3">
        <v-card rounded="lg" variant="tonal" color="warning">
          <v-card-text class="text-center pa-4">
            <div class="text-h5 font-weight-bold">{{ store.unassignedGuests.length }}</div>
            <div class="text-caption">Non assignés</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="6" sm="3">
        <v-card rounded="lg" variant="tonal" color="secondary">
          <v-card-text class="text-center pa-4">
            <div class="text-h5 font-weight-bold">{{ totalSeats }}</div>
            <div class="text-caption">Places totales</div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-alert
      v-if="store.tables.length === 0 || store.guests.length === 0"
      type="info"
      variant="tonal"
      rounded="lg"
      class="mb-4"
    >
      <span v-if="store.tables.length === 0 && store.guests.length === 0">
        Ajoutez des convives et des tables pour commencer l'assignation.
      </span>
      <span v-else-if="store.tables.length === 0">
        Créez des tables dans l'onglet "Tables" pour commencer l'assignation.
      </span>
      <span v-else>
        Ajoutez des convives dans l'onglet "Convives" pour commencer l'assignation.
      </span>
    </v-alert>

    <!-- Tables grid -->
    <v-row>
      <v-col
        v-for="table in store.tables"
        :key="table.id"
        cols="12"
        sm="6"
        lg="4"
      >
        <v-card rounded="lg" elevation="2" border>
          <v-card-title class="d-flex align-center justify-space-between pa-4 pb-2">
            <div class="d-flex align-center gap-2">
              <v-icon icon="mdi-table-chair" color="primary" size="20" />
              <span>{{ table.name }}</span>
            </div>
            <v-chip
              :color="isTableFull(table.id, table.seats) ? 'success' : 'primary'"
              size="small"
              variant="tonal"
            >
              {{ store.guestsAtTable(table.id).length }}/{{ table.seats }}
            </v-chip>
          </v-card-title>

          <v-card-text class="pa-4 pt-2">
            <v-chip
              v-for="guest in store.guestsAtTable(table.id)"
              :key="guest.id"
              class="ma-1"
              closable
              size="small"
              color="primary"
              variant="tonal"
              @click:close="store.unassignGuest(guest.id)"
            >
              {{ guest.firstName }} {{ guest.lastName }}
            </v-chip>

            <v-btn
              v-if="!isTableFull(table.id, table.seats) && store.unassignedGuests.length > 0"
              variant="dashed"
              color="primary"
              size="small"
              prepend-icon="mdi-plus"
              class="mt-2"
              block
              @click="openAssignDialog(table.id)"
            >
              Ajouter un convive
            </v-btn>

            <p
              v-else-if="store.guestsAtTable(table.id).length === 0"
              class="text-caption text-medium-emphasis text-center mt-2"
            >
              Aucun convive assigné
            </p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Unassigned guests -->
    <v-card
      v-if="store.unassignedGuests.length > 0"
      rounded="lg"
      variant="outlined"
      class="mt-6"
    >
      <v-card-title class="pa-4 pb-2">
        <v-icon icon="mdi-account-question" class="mr-2" />
        Convives non assignés ({{ store.unassignedGuests.length }})
      </v-card-title>
      <v-card-text class="pa-4 pt-2">
        <v-chip
          v-for="guest in store.unassignedGuests"
          :key="guest.id"
          class="ma-1"
          size="small"
          variant="outlined"
          @click="openAssignGuestDialog(guest.id)"
        >
          <v-icon start icon="mdi-account" />
          {{ guest.firstName }} {{ guest.lastName }}
        </v-chip>
      </v-card-text>
    </v-card>

    <!-- Assign guest to table dialog -->
    <v-dialog v-model="assignDialog" max-width="420">
      <v-card rounded="xl">
        <v-card-title class="pa-6 pb-2">Assigner un convive</v-card-title>
        <v-card-text class="pa-6 pt-2">
          <v-list density="compact" rounded="lg" border>
            <v-list-item
              v-for="guest in store.unassignedGuests"
              :key="guest.id"
              :title="`${guest.firstName} ${guest.lastName}`"
              rounded="lg"
              @click="assignGuest(guest.id)"
            >
              <template #prepend>
                <v-avatar color="primary" size="32">
                  <span class="text-caption text-white font-weight-bold">
                    {{ guest.firstName.charAt(0) }}{{ guest.lastName.charAt(0) }}
                  </span>
                </v-avatar>
              </template>
            </v-list-item>
          </v-list>
        </v-card-text>
        <v-card-actions class="pa-6 pt-0">
          <v-spacer />
          <v-btn variant="text" @click="assignDialog = false">Fermer</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Assign guest to table dialog (guest first) -->
    <v-dialog v-model="assignGuestDialog" max-width="420">
      <v-card rounded="xl">
        <v-card-title class="pa-6 pb-2">Choisir une table</v-card-title>
        <v-card-text class="pa-6 pt-2">
          <v-list density="compact" rounded="lg" border>
            <v-list-item
              v-for="table in availableTables"
              :key="table.id"
              :title="table.name"
              :subtitle="`${store.guestsAtTable(table.id).length}/${table.seats} places`"
              rounded="lg"
              @click="assignGuestToTable(table.id)"
            >
              <template #prepend>
                <v-icon icon="mdi-table-chair" color="primary" />
              </template>
            </v-list-item>
          </v-list>
        </v-card-text>
        <v-card-actions class="pa-6 pt-0">
          <v-spacer />
          <v-btn variant="text" @click="assignGuestDialog = false">Fermer</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTablePlanStore } from '@/stores/tablePlan'

const store = useTablePlanStore()

const assignDialog = ref(false)
const targetTableId = ref<string | null>(null)

const assignGuestDialog = ref(false)
const targetGuestId = ref<string | null>(null)

const totalSeats = computed(() =>
  store.tables.reduce((sum, t) => sum + t.seats, 0),
)

const availableTables = computed(() =>
  store.tables.filter(
    (t) => store.guestsAtTable(t.id).length < t.seats,
  ),
)

function isTableFull(tableId: string, seats: number): boolean {
  return store.guestsAtTable(tableId).length >= seats
}

function openAssignDialog(tableId: string) {
  targetTableId.value = tableId
  assignDialog.value = true
}

function assignGuest(guestId: string) {
  if (targetTableId.value) {
    store.assignGuest(guestId, targetTableId.value)
  }
  assignDialog.value = false
}

function openAssignGuestDialog(guestId: string) {
  targetGuestId.value = guestId
  assignGuestDialog.value = true
}

function assignGuestToTable(tableId: string) {
  if (targetGuestId.value) {
    store.assignGuest(targetGuestId.value, tableId)
  }
  assignGuestDialog.value = false
}
</script>
