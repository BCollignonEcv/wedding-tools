<template>
  <div>
    <div class="d-flex align-center justify-space-between mb-4">
      <span class="text-body-2 text-medium-emphasis">
        {{ store.tables.length }} table(s)
      </span>
      <v-btn color="primary" prepend-icon="mdi-plus" @click="openAddDialog">
        Ajouter une table
      </v-btn>
    </div>

    <v-card v-if="store.tables.length === 0" variant="outlined" rounded="lg">
      <v-card-text class="text-center py-10 text-medium-emphasis">
        <v-icon icon="mdi-table-chair" size="48" class="mb-3" />
        <p>Aucune table pour le moment.</p>
        <p class="text-body-2">Créez vos tables pour commencer l'assignation.</p>
      </v-card-text>
    </v-card>

    <v-row v-else>
      <v-col
        v-for="table in store.tables"
        :key="table.id"
        cols="12"
        sm="6"
        md="4"
      >
        <v-card rounded="lg" border elevation="0">
          <v-card-title class="d-flex align-center justify-space-between">
            <span>{{ table.name }}</span>
            <div>
              <v-btn
                icon="mdi-pencil"
                variant="text"
                size="small"
                @click="openEditDialog(table)"
              />
              <v-btn
                icon="mdi-delete"
                variant="text"
                size="small"
                color="error"
                @click="confirmDelete(table)"
              />
            </div>
          </v-card-title>
          <v-card-text class="pt-0">
            <v-progress-linear
              :model-value="occupancy(table.id, table.seats)"
              color="primary"
              rounded
              height="6"
              class="mb-2"
            />
            <div class="d-flex justify-space-between text-caption text-medium-emphasis">
              <span>
                <v-icon icon="mdi-account" size="14" />
                {{ store.guestsAtTable(table.id).length }} / {{ table.seats }} places
              </span>
              <v-chip
                :color="isFull(table.id, table.seats) ? 'success' : 'default'"
                size="x-small"
                variant="tonal"
              >
                {{ isFull(table.id, table.seats) ? 'Complet' : 'Disponible' }}
              </v-chip>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Add / Edit dialog -->
    <v-dialog v-model="dialog" max-width="400" persistent>
      <v-card rounded="xl">
        <v-card-title class="pa-6 pb-2">
          {{ editingTable ? 'Modifier la table' : 'Ajouter une table' }}
        </v-card-title>
        <v-card-text class="pa-6 pt-2">
          <v-text-field
            v-model="form.name"
            label="Nom de la table"
            variant="outlined"
            density="comfortable"
            autofocus
            class="mb-3"
            @keyup.enter="save"
          />
          <v-text-field
            v-model.number="form.seats"
            label="Nombre de places"
            type="number"
            variant="outlined"
            density="comfortable"
            min="1"
            @keyup.enter="save"
          />
        </v-card-text>
        <v-card-actions class="pa-6 pt-0">
          <v-spacer />
          <v-btn variant="text" @click="dialog = false">Annuler</v-btn>
          <v-btn
            color="primary"
            variant="flat"
            :disabled="!form.name.trim() || form.seats < 1"
            @click="save"
          >
            {{ editingTable ? 'Modifier' : 'Ajouter' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete confirmation -->
    <v-dialog v-model="deleteDialog" max-width="400">
      <v-card rounded="xl">
        <v-card-title class="pa-6 pb-2">Supprimer la table</v-card-title>
        <v-card-text class="pa-6 pt-2">
          <p>
            Voulez-vous vraiment supprimer la table
            <strong>{{ tableToDelete?.name }}</strong> ?
          </p>
          <v-alert
            v-if="tableToDelete && store.guestsAtTable(tableToDelete.id).length > 0"
            type="warning"
            variant="tonal"
            density="compact"
            class="mt-3"
          >
            {{ store.guestsAtTable(tableToDelete.id).length }} convive(s) seront désassignés.
          </v-alert>
        </v-card-text>
        <v-card-actions class="pa-6 pt-0">
          <v-spacer />
          <v-btn variant="text" @click="deleteDialog = false">Annuler</v-btn>
          <v-btn color="error" variant="flat" @click="deleteTable">Supprimer</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useTablePlanStore, type Table } from '@/stores/tablePlan'

const store = useTablePlanStore()

const dialog = ref(false)
const editingTable = ref<Table | null>(null)
const form = reactive({ name: '', seats: 8 })

const deleteDialog = ref(false)
const tableToDelete = ref<Table | null>(null)

function occupancy(tableId: string, seats: number): number {
  return Math.round((store.guestsAtTable(tableId).length / seats) * 100)
}

function isFull(tableId: string, seats: number): boolean {
  return store.guestsAtTable(tableId).length >= seats
}

function openAddDialog() {
  editingTable.value = null
  form.name = ''
  form.seats = 8
  dialog.value = true
}

function openEditDialog(table: Table) {
  editingTable.value = table
  form.name = table.name
  form.seats = table.seats
  dialog.value = true
}

function save() {
  if (!form.name.trim() || form.seats < 1) return
  if (editingTable.value) {
    store.updateTable(editingTable.value.id, form.name.trim(), form.seats)
  } else {
    store.addTable(form.name.trim(), form.seats)
  }
  dialog.value = false
}

function confirmDelete(table: Table) {
  tableToDelete.value = table
  deleteDialog.value = true
}

function deleteTable() {
  if (tableToDelete.value) {
    store.removeTable(tableToDelete.value.id)
  }
  deleteDialog.value = false
}
</script>
