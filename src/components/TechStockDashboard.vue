<template>
  <div class="q-pa-md">
    <q-table
      title="My Watchlist"
      :rows="watchlistRows"
      :columns="tableColumns"
      row-key="id"
      :loading="isLoading"
      :rows-per-page-options="[10, 20, 50, 0]"
      @row-click="onRowClick"
      clickable
      class="cursor-pointer"
    >
      <template v-slot:loading>
        <q-inner-loading showing color="primary" />
      </template>
      <template v-slot:no-data="{ icon, message }">
        <div class="full-width row flex-center text-negative q-gutter-sm">
          <q-icon size="2em" :name="loadingError ? 'warning' : icon" />
          <span> {{ loadingError || message || 'No data available' }} </span>
        </div>
      </template>

      <template v-slot:body-cell-actions="props">
        <q-td :props="props" class="q-gutter-sm">
          <q-btn
            icon="visibility"
            size="sm"
            color="grey"
            dense
            @click.stop="openDetailDialog(props.row.id)"
            aria-label="View Details"
          />
          <q-btn
            icon="delete"
            size="sm"
            color="negative"
            dense
            @click.stop="promptDeleteConfirmation(props.row)"
            aria-label="Delete Item"
          />
        </q-td>
      </template>
    </q-table>

    <div
      v-if="loadingError && !isLoading"
      class="q-mt-md text-negative bg-red-1 q-pa-sm rounded-borders"
    >
      <q-icon name="error" class="q-mr-sm" />
      <strong>Error loading table data:</strong> {{ loadingError }}
    </div>

    <q-dialog v-model="isConfirmDeleteDialogOpen">
      <q-card style="width: 400px; max-width: 80vw">
        <q-card-section class="row items-center no-wrap">
          <q-avatar icon="warning" color="negative" text-color="white" class="q-mr-md" />
          <div class="text-h6">Confirm Deletion</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          Are you sure you want to delete item
          <strong>{{
            itemToDelete?.symbol ? `'${itemToDelete.symbol}'` : `ID ${itemToDelete?.id}`
          }}</strong
          >?
          <br />
          <span class="text-weight-medium">This action cannot be undone.</span>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="primary" v-close-popup />
          <q-btn
            label="Delete"
            color="negative"
            :loading="isDeleting"
            @click="handleDeleteConfirmed"
            v-close-popup
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { type QTableProps } from 'quasar'

import { apiServiceAxios as api } from '@/lib/getStocks'
import { type WatchlistItem } from '@/types/stocks'

const watchlistRows = ref<WatchlistItem[]>([])
const isLoading = ref<boolean>(false) // Loading state for the table itself
const loadingError = ref<string | null>(null) // Error state for table loading

// --- State for the Detail Dialog (Placeholder - if needed) ---
// const isDetailDialogVisible = ref<boolean>(false);
// const selectedSymbolForDialog = ref<string | null>(null);

// --- State for the Confirmation Dialog ---
const isConfirmDeleteDialogOpen = ref<boolean>(false)
const itemToDelete = ref<WatchlistItem | null>(null) // Store the item to be deleted
const isDeleting = ref<boolean>(false) // Loading state for the delete button in the dialog

// --- Table Column Definitions (Example - Define your actual columns) ---
const tableColumns = computed<QTableProps['columns']>(() => [
  { name: 'id', label: 'ID', align: 'left', field: 'id', sortable: true },
  { name: 'symbol', label: 'Symbol', align: 'left', field: 'symbol', sortable: true },
  { name: 'company_name', label: 'Company', align: 'left', field: 'company_name', sortable: true },
  { name: 'notes', label: 'Notes', align: 'left', field: 'notes', sortable: false },
  {
    name: 'created_at',
    label: 'Created At',
    align: 'left',
    field: 'created_at',
    sortable: true,
    format: (val) => (val ? new Date(val).toLocaleDateString() : 'N/A'),
  },
  { name: 'actions', label: 'Actions', align: 'center', field: 'actions' },
])

const loadWatchlist = async () => {
  isLoading.value = true
  loadingError.value = null
  try {
    watchlistRows.value = await api.getWatchlist()
  } catch (err: any) {
    console.error('Failed to load watchlist', err)
    loadingError.value = `Failed to load watchlist data: ${err.message || 'Unknown error'}`
    watchlistRows.value = []
  } finally {
    isLoading.value = false
  }
}

const promptDeleteConfirmation = (item: WatchlistItem) => {
  itemToDelete.value = item
  isConfirmDeleteDialogOpen.value = true
}

const handleDeleteConfirmed = async () => {
  if (!itemToDelete.value) {
    console.error('No item selected for deletion.')
    return
  }

  isDeleting.value = true
  const deletedItemInfo = itemToDelete.value.symbol || `ID ${itemToDelete.value.id}`
  const deletedItemId = itemToDelete.value.symbol

  console.log(`Attempting to delete item: ${deletedItemInfo}`)

  try {
    await api.removeFromWatchlist(String(deletedItemId))
    console.log(`Successfully deleted item: ${deletedItemInfo}`)

    await loadWatchlist()
  } catch (err: any) {
    console.error(`Failed to delete item: ${deletedItemInfo}`, err)
  } finally {
    isDeleting.value = false
    itemToDelete.value = null
  }
}

const onRowClick = (evt: Event, row: WatchlistItem) => {
  console.log('Row clicked:', row.symbol)
}

const openDetailDialog = (symbol: string | null) => {
  console.log('Request to open detail dialog for:', symbol)
}

onMounted(() => {
  loadWatchlist()
})
</script>

<style scoped>
.q-table th {
  font-weight: bold;
}
</style>
