import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface Guest {
  id: string
  firstName: string
  lastName: string
  tableId: string | null
}

export interface Table {
  id: string
  name: string
  seats: number
}

export const useTablePlanStore = defineStore('tablePlan', () => {
  const guests = ref<Guest[]>([])
  const tables = ref<Table[]>([])

  const unassignedGuests = computed(() =>
    guests.value.filter((g) => g.tableId === null),
  )

  const assignedCount = computed(
    () => guests.value.filter((g) => g.tableId !== null).length,
  )

  function guestsAtTable(tableId: string): Guest[] {
    return guests.value.filter((g) => g.tableId === tableId)
  }

  function addGuest(firstName: string, lastName: string) {
    guests.value.push({
      id: crypto.randomUUID(),
      firstName,
      lastName,
      tableId: null,
    })
  }

  function updateGuest(id: string, firstName: string, lastName: string) {
    const guest = guests.value.find((g) => g.id === id)
    if (guest) {
      guest.firstName = firstName
      guest.lastName = lastName
    }
  }

  function removeGuest(id: string) {
    guests.value = guests.value.filter((g) => g.id !== id)
  }

  function addTable(name: string, seats: number) {
    tables.value.push({
      id: crypto.randomUUID(),
      name,
      seats,
    })
  }

  function updateTable(id: string, name: string, seats: number) {
    const table = tables.value.find((t) => t.id === id)
    if (table) {
      table.name = name
      table.seats = seats
    }
  }

  function removeTable(id: string) {
    guests.value.forEach((g) => {
      if (g.tableId === id) g.tableId = null
    })
    tables.value = tables.value.filter((t) => t.id !== id)
  }

  function assignGuest(guestId: string, tableId: string | null) {
    const guest = guests.value.find((g) => g.id === guestId)
    if (guest) guest.tableId = tableId
  }

  function unassignGuest(guestId: string) {
    assignGuest(guestId, null)
  }

  return {
    guests,
    tables,
    unassignedGuests,
    assignedCount,
    guestsAtTable,
    addGuest,
    updateGuest,
    removeGuest,
    addTable,
    updateTable,
    removeTable,
    assignGuest,
    unassignGuest,
  }
})
