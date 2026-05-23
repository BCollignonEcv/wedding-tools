<template>
  <div>
    <div class="d-flex align-center justify-space-between mb-4">
      <span class="text-body-2 text-medium-emphasis">
        {{ store.guests.length }} convive(s) ·
        <span v-if="store.disabledGuests.length > 0" class="text-error">
          {{ store.disabledGuests.length }} absent(s)
        </span>
        <span v-else class="text-success">tous présents</span>
      </span>
      <div class="d-flex ga-2">
        <v-btn variant="outlined" prepend-icon="mdi-file-delimited" @click="triggerFileInput">
          Importer CSV
        </v-btn>
        <v-btn color="primary" prepend-icon="mdi-plus" @click="openAddDialog">
          Ajouter un convive
        </v-btn>
      </div>
    </div>

    <!-- Hidden file input -->
    <input
      ref="fileInputRef"
      type="file"
      accept=".csv,text/csv"
      style="display: none"
      @change="onFileSelected"
    />

    <v-card v-if="store.guests.length === 0" variant="outlined" rounded="lg">
      <v-card-text class="text-center py-10 text-medium-emphasis">
        <v-icon icon="mdi-account-group-outline" size="48" class="mb-3" />
        <p>Aucun convive pour le moment.</p>
        <p class="text-body-2">Ajoutez vos invités ou importez un fichier CSV.</p>
      </v-card-text>
    </v-card>

    <v-list v-else lines="two" rounded="lg" border>
      <template v-for="(guest, index) in store.guests" :key="guest.id">
        <v-list-item :class="{ 'opacity-40': guest.disabled }">
          <template #prepend>
            <v-avatar :color="guest.disabled ? 'grey' : 'primary'" size="36">
              <span class="text-caption font-weight-bold text-white">
                {{ initials(guest) }}
              </span>
            </v-avatar>
          </template>

          <v-list-item-title :class="{ 'text-decoration-line-through': guest.disabled }">
            {{ guest.firstName }} {{ guest.lastName }}
            <v-chip
              v-if="guest.disabled"
              color="error"
              size="x-small"
              variant="tonal"
              class="ml-2"
            >
              Absent
            </v-chip>
          </v-list-item-title>

          <v-list-item-subtitle>
            <template v-if="guest.disabled && guest.tableId">
              <v-icon icon="mdi-alert" color="warning" size="13" class="mr-1" />
              <span class="text-warning">
                Assigné à {{ tableNameById(guest.tableId) }} — place libérée pour la planification
              </span>
            </template>
            <template v-else-if="guest.tableId">
              <v-icon icon="mdi-table-chair" size="14" class="mr-1" />
              {{ tableNameById(guest.tableId) }}
            </template>
            <span v-else class="text-medium-emphasis">Non assigné</span>
          </v-list-item-subtitle>

          <template #append>
            <v-tooltip
              :text="guest.disabled ? 'Marquer comme présent' : 'Marquer comme absent'"
              location="top"
            >
              <template #activator="{ props }">
                <v-btn
                  v-bind="props"
                  :icon="guest.disabled ? 'mdi-account-check-outline' : 'mdi-account-off-outline'"
                  :color="guest.disabled ? 'success' : 'default'"
                  variant="text"
                  size="small"
                  @click="store.toggleGuestDisabled(guest.id)"
                />
              </template>
            </v-tooltip>
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

    <!-- CSV Import preview dialog -->
    <v-dialog v-model="importDialog" max-width="560" persistent>
      <v-card rounded="xl">
        <v-card-title class="pa-6 pb-2 d-flex align-center">
          <v-icon icon="mdi-file-delimited" class="mr-2" />
          Importer depuis un CSV
        </v-card-title>

        <v-card-text class="pa-6 pt-2">
          <v-alert
            v-if="importError"
            type="error"
            variant="tonal"
            rounded="lg"
            class="mb-4"
          >
            {{ importError }}
          </v-alert>

          <template v-else>
            <p class="text-body-2 text-medium-emphasis mb-4">
              {{ importRows.length }} convive(s) détecté(s). Vérifiez l'aperçu avant d'importer.
            </p>

            <v-table density="compact" class="rounded-lg border">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Prénom</th>
                  <th>Nom</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, i) in importRows" :key="i" :class="{ 'text-disabled': !row.valid }">
                  <td class="text-medium-emphasis">{{ i + 1 }}</td>
                  <td>{{ row.firstName }}</td>
                  <td>{{ row.lastName }}</td>
                  <td>
                    <v-icon
                      v-if="!row.valid"
                      icon="mdi-alert-circle"
                      color="warning"
                      size="16"
                      :title="row.error"
                    />
                  </td>
                </tr>
              </tbody>
            </v-table>

            <v-alert
              v-if="invalidCount > 0"
              type="warning"
              variant="tonal"
              density="compact"
              rounded="lg"
              class="mt-3"
            >
              {{ invalidCount }} ligne(s) ignorée(s) car invalides.
            </v-alert>

            <v-divider class="my-4" />
            <p class="text-caption text-medium-emphasis">
              <strong>Format attendu :</strong> colonnes <code>prénom</code> et <code>nom</code>
              (ou <code>firstname</code> / <code>lastname</code>), séparées par une virgule ou un point-virgule.
              La première ligne peut être un en-tête.
            </p>
          </template>
        </v-card-text>

        <v-card-actions class="pa-6 pt-0">
          <v-spacer />
          <v-btn variant="text" @click="closeImportDialog">Annuler</v-btn>
          <v-btn
            v-if="!importError && validCount > 0"
            color="primary"
            variant="flat"
            prepend-icon="mdi-check"
            @click="confirmImport"
          >
            Importer {{ validCount }} convive(s)
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useTablePlanStore, type Guest } from '@/stores/tablePlan'

const store = useTablePlanStore()

const dialog = ref(false)
const editingGuest = ref<Guest | null>(null)
const form = reactive({ firstName: '', lastName: '' })

const deleteDialog = ref(false)
const guestToDelete = ref<Guest | null>(null)

// --- CSV import ---

interface ImportRow {
  firstName: string
  lastName: string
  valid: boolean
  error?: string
}

const fileInputRef = ref<HTMLInputElement | null>(null)
const importDialog = ref(false)
const importRows = ref<ImportRow[]>([])
const importError = ref('')

const validCount = computed(() => importRows.value.filter((r) => r.valid).length)
const invalidCount = computed(() => importRows.value.filter((r) => !r.valid).length)

function triggerFileInput() {
  fileInputRef.value?.click()
}

function onFileSelected(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    const text = e.target?.result as string
    parseCSV(text)
    importDialog.value = true
  }
  reader.readAsText(file, 'UTF-8')

  ;(event.target as HTMLInputElement).value = ''
}

function detectDelimiter(line: string): string {
  const semicolons = (line.match(/;/g) ?? []).length
  const commas = (line.match(/,/g) ?? []).length
  return semicolons >= commas ? ';' : ','
}

const FIRST_NAME_HEADERS = ['prénom', 'prenom', 'firstname', 'first_name', 'first name', 'given name', 'givenname']
const LAST_NAME_HEADERS = ['nom', 'lastname', 'last_name', 'last name', 'family name', 'familyname', 'surname']

function parseCSV(raw: string) {
  importError.value = ''
  importRows.value = []

  const lines = raw
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0)

  if (lines.length === 0) {
    importError.value = 'Le fichier est vide.'
    return
  }

  const delimiter = detectDelimiter(lines[0])
  const columns = lines[0].split(delimiter).map((c) => c.trim().replace(/^["']|["']$/g, ''))

  const firstNameIdx = columns.findIndex((c) => FIRST_NAME_HEADERS.includes(c.toLowerCase()))
  const lastNameIdx = columns.findIndex((c) => LAST_NAME_HEADERS.includes(c.toLowerCase()))

  const hasHeader = firstNameIdx !== -1 || lastNameIdx !== -1
  const dataLines = hasHeader ? lines.slice(1) : lines

  const fnIdx = hasHeader ? (firstNameIdx !== -1 ? firstNameIdx : 0) : 0
  const lnIdx = hasHeader ? (lastNameIdx !== -1 ? lastNameIdx : 1) : 1

  if (dataLines.length === 0) {
    importError.value = "Aucune donnée trouvée après l'en-tête."
    return
  }

  importRows.value = dataLines.map((line) => {
    const cells = line.split(delimiter).map((c) => c.trim().replace(/^["']|["']$/g, ''))
    const firstName = cells[fnIdx] ?? ''
    const lastName = cells[lnIdx] ?? ''

    if (!firstName && !lastName) {
      return { firstName, lastName, valid: false, error: 'Prénom et nom vides' }
    }
    return { firstName, lastName, valid: true }
  })
}

function confirmImport() {
  importRows.value
    .filter((r) => r.valid)
    .forEach((r) => store.addGuest(r.firstName, r.lastName))
  closeImportDialog()
}

function closeImportDialog() {
  importDialog.value = false
  importRows.value = []
  importError.value = ''
}

// --- Guest CRUD ---

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
