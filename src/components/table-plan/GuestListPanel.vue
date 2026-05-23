<template>
  <div>
    <div class="d-flex align-center justify-space-between mb-4">
      <span class="text-body-2 text-medium-emphasis">
        {{ store.guests.length }} convive(s)
      </span>
      <v-btn color="primary" prepend-icon="mdi-plus" @click="openAddDialog">
        Ajouter un convive
      </v-btn>
    </div>

    <v-card v-if="store.guests.length === 0" variant="outlined" rounded="lg">
      <v-card-text class="text-center py-10 text-medium-emphasis">
        <v-icon icon="mdi-account-group-outline" size="48" class="mb-3" />
        <p>Aucun convive pour le moment.</p>
        <p class="text-body-2">Ajoutez vos invités pour commencer.</p>
      </v-card-text>
    </v-card>

    <v-list v-else lines="two" rounded="lg" border>
      <template v-for="(guest, index) in store.guests" :key="guest.id">
        <v-list-item>
          <template #prepend>
            <v-avatar color="primary" size="36">
              <span class="text-caption font-weight-bold text-white">
                {{ initials(guest) }}
              </span>
            </v-avatar>
          </template>

          <v-list-item-title>
            {{ guest.firstName }} {{ guest.lastName }}
          </v-list-item-title>
          <v-list-item-subtitle>
            <span v-if="guest.tableId">
              <v-icon icon="mdi-table-chair" size="14" class="mr-1" />
              {{ tableNameById(guest.tableId) }}
            </span>
            <span v-else class="text-medium-emphasis">Non assigné</span>
          </v-list-item-subtitle>

          <template #append>
            <v-btn
              icon="mdi-pencil"
              variant="text"
              size="small"
              @click="openEditDialog(guest)"
            />
            <v-btn
              icon="mdi-delete"
              variant="text"
              size="small"
              color="error"
              @click="confirmDelete(guest)"
            />
          </template>
        </v-list-item>
        <v-divider v-if="index < store.guests.length - 1" />
      </template>
    </v-list>

    <!-- Add / Edit dialog -->
    <v-dialog v-model="dialog" max-width="420" persistent>
      <v-card rounded="xl">
        <v-card-title class="pa-6 pb-2">
          {{ editingGuest ? 'Modifier le convive' : 'Ajouter un convive' }}
        </v-card-title>
        <v-card-text class="pa-6 pt-2">
          <v-row dense>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.firstName"
                label="Prénom"
                variant="outlined"
                density="comfortable"
                autofocus
                @keyup.enter="save"
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.lastName"
                label="Nom"
                variant="outlined"
                density="comfortable"
                @keyup.enter="save"
              />
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions class="pa-6 pt-0">
          <v-spacer />
          <v-btn variant="text" @click="dialog = false">Annuler</v-btn>
          <v-btn
            color="primary"
            variant="flat"
            :disabled="!form.firstName.trim() && !form.lastName.trim()"
            @click="save"
          >
            {{ editingGuest ? 'Modifier' : 'Ajouter' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete confirmation -->
    <v-dialog v-model="deleteDialog" max-width="380">
      <v-card rounded="xl">
        <v-card-title class="pa-6 pb-2">Supprimer le convive</v-card-title>
        <v-card-text class="pa-6 pt-2">
          Voulez-vous vraiment supprimer
          <strong>{{ guestToDelete?.firstName }} {{ guestToDelete?.lastName }}</strong> ?
        </v-card-text>
        <v-card-actions class="pa-6 pt-0">
          <v-spacer />
          <v-btn variant="text" @click="deleteDialog = false">Annuler</v-btn>
          <v-btn color="error" variant="flat" @click="deleteGuest">Supprimer</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useTablePlanStore, type Guest } from '@/stores/tablePlan'

const store = useTablePlanStore()

const dialog = ref(false)
const editingGuest = ref<Guest | null>(null)
const form = reactive({ firstName: '', lastName: '' })

const deleteDialog = ref(false)
const guestToDelete = ref<Guest | null>(null)

function initials(guest: Guest): string {
  return `${guest.firstName.charAt(0)}${guest.lastName.charAt(0)}`.toUpperCase()
}

function tableNameById(tableId: string): string {
  return store.tables.find((t) => t.id === tableId)?.name ?? 'Table inconnue'
}

function openAddDialog() {
  editingGuest.value = null
  form.firstName = ''
  form.lastName = ''
  dialog.value = true
}

function openEditDialog(guest: Guest) {
  editingGuest.value = guest
  form.firstName = guest.firstName
  form.lastName = guest.lastName
  dialog.value = true
}

function save() {
  if (!form.firstName.trim() && !form.lastName.trim()) return
  if (editingGuest.value) {
    store.updateGuest(editingGuest.value.id, form.firstName.trim(), form.lastName.trim())
  } else {
    store.addGuest(form.firstName.trim(), form.lastName.trim())
  }
  dialog.value = false
}

function confirmDelete(guest: Guest) {
  guestToDelete.value = guest
  deleteDialog.value = true
}

function deleteGuest() {
  if (guestToDelete.value) {
    store.removeGuest(guestToDelete.value.id)
  }
  deleteDialog.value = false
}
</script>
