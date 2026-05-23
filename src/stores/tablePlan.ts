import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  writeBatch,
} from 'firebase/firestore'
import { db } from '@/plugins/firebase'

export interface Guest {
  id: string
  firstName: string
  lastName: string
  tableId: string | null
  disabled: boolean
}

export interface Table {
  id: string
  name: string
  seats: number
}

export const useTablePlanStore = defineStore('tablePlan', () => {
  const guests = ref<Guest[]>([])
  const tables = ref<Table[]>([])
  const loading = ref(true)

  const activeGuests = computed(() => guests.value.filter((g) => !g.disabled))
  const disabledGuests = computed(() => guests.value.filter((g) => g.disabled))

  const unassignedGuests = computed(() =>
    guests.value.filter((g) => !g.disabled && g.tableId === null),
  )

  const assignedCount = computed(
    () => guests.value.filter((g) => !g.disabled && g.tableId !== null).length,
  )

  function guestsAtTable(tableId: string): Guest[] {
    return guests.value.filter((g) => g.tableId === tableId)
  }

  function activeGuestsAtTable(tableId: string): Guest[] {
    return guests.value.filter((g) => g.tableId === tableId && !g.disabled)
  }

  function disabledGuestsAtTable(tableId: string): Guest[] {
    return guests.value.filter((g) => g.tableId === tableId && g.disabled)
  }

  function init(): () => void {
    loading.value = true
    let guestsReady = false
    let tablesReady = false

    const unsubGuests = onSnapshot(collection(db, 'guests'), (snap) => {
      guests.value = snap.docs.map((d) => {
        const data = d.data()
        return {
          id: d.id,
          firstName: data.firstName as string,
          lastName: data.lastName as string,
          tableId: data.tableId as string | null,
          disabled: (data.disabled as boolean | undefined) ?? false,
        }
      })
      guestsReady = true
      if (tablesReady) loading.value = false
    })

    const unsubTables = onSnapshot(collection(db, 'tables'), (snap) => {
      tables.value = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Table, 'id'>),
      }))
      tablesReady = true
      if (guestsReady) loading.value = false
    })

    return () => {
      unsubGuests()
      unsubTables()
    }
  }

  async function addGuest(firstName: string, lastName: string): Promise<void> {
    await addDoc(collection(db, 'guests'), {
      firstName,
      lastName,
      tableId: null,
      disabled: false,
    })
  }

  async function updateGuest(id: string, firstName: string, lastName: string): Promise<void> {
    await updateDoc(doc(db, 'guests', id), { firstName, lastName })
  }

  async function removeGuest(id: string): Promise<void> {
    await deleteDoc(doc(db, 'guests', id))
  }

  async function toggleGuestDisabled(id: string): Promise<void> {
    const guest = guests.value.find((g) => g.id === id)
    if (guest) {
      await updateDoc(doc(db, 'guests', id), { disabled: !guest.disabled })
    }
  }

  async function addTable(name: string, seats: number): Promise<void> {
    await addDoc(collection(db, 'tables'), { name, seats })
  }

  async function updateTable(id: string, name: string, seats: number): Promise<void> {
    await updateDoc(doc(db, 'tables', id), { name, seats })
  }

  async function removeTable(id: string): Promise<void> {
    const batch = writeBatch(db)
    guests.value
      .filter((g) => g.tableId === id)
      .forEach((g) => batch.update(doc(db, 'guests', g.id), { tableId: null }))
    batch.delete(doc(db, 'tables', id))
    await batch.commit()
  }

  async function assignGuest(guestId: string, tableId: string | null): Promise<void> {
    await updateDoc(doc(db, 'guests', guestId), { tableId })
  }

  async function unassignGuest(guestId: string): Promise<void> {
    await assignGuest(guestId, null)
  }

  return {
    guests,
    tables,
    loading,
    activeGuests,
    disabledGuests,
    unassignedGuests,
    assignedCount,
    guestsAtTable,
    activeGuestsAtTable,
    disabledGuestsAtTable,
    init,
    addGuest,
    updateGuest,
    removeGuest,
    toggleGuestDisabled,
    addTable,
    updateTable,
    removeTable,
    assignGuest,
    unassignGuest,
  }
})
