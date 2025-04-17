<template>
  <q-dialog :model-value="modelValue" @update:model-value="emitUpdate" @hide="onHide">
    <q-card style="width: 700px; max-width: 80vw">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">Details for {{ symbol }}</div>
        <q-space />
        <q-btn icon="close" flat round dense @click="closeDialog" />
      </q-card-section>

      <q-separator />

      <q-card-section style="max-height: 70vh" class="scroll">
        <div v-if="isLoading" class="text-center q-pa-lg">
          <q-spinner-dots color="primary" size="40px" />
          <p class="q-mt-sm">Loading details...</p>
        </div>

        <div v-else-if="loadingError" class="q-pa-md">
          <q-banner inline-actions rounded class="text-white bg-negative">
            <template v-slot:avatar>
              <q-icon name="warning" color="white" />
            </template>
            {{ loadingError }}
            <template v-slot:action>
              <q-btn
                flat
                color="white"
                label="Retry"
                @click="fetchWatchlistItem"
                :disable="!symbol"
              />
            </template>
          </q-banner>
        </div>

        <div v-else-if="watchlistItem">
          <div class="text-subtitle1 q-mb-sm">{{ watchlistItem.company_name }}</div>
          <q-list bordered separator>
            <q-item>
              <q-item-section avatar>
                <q-icon color="primary" name="tag" />
              </q-item-section>
              <q-item-section>
                <q-item-label>ID</q-item-label>
                <q-item-label caption>{{ watchlistItem.id }}</q-item-label>
              </q-item-section>
            </q-item>

            <q-item>
              <q-item-section avatar>
                <q-icon color="primary" name="account_circle" />
              </q-item-section>
              <q-item-section>
                <q-item-label>User ID</q-item-label>
                <q-item-label caption>{{ watchlistItem.user_id }}</q-item-label>
              </q-item-section>
            </q-item>

            <q-item>
              <q-item-section avatar>
                <q-icon color="primary" name="notes" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Notes</q-item-label>
                <q-item-label caption style="white-space: pre-wrap">{{
                  watchlistItem.notes || '-'
                }}</q-item-label>
              </q-item-section>
            </q-item>

            <q-item>
              <q-item-section avatar>
                <q-icon color="primary" name="event" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Created At</q-item-label>
                <q-item-label caption>{{ formattedDate(watchlistItem.created_at) }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </div>
        <div v-else-if="!symbol && !isLoading" class="text-center text-grey q-pa-lg">
          No symbol selected.
        </div>
      </q-card-section>

      <q-separator />

      <q-card-actions align="right">
        <q-btn flat label="Close" color="primary" @click="closeDialog" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { QSpinnerDots, QBanner } from 'quasar'
import { apiServiceAxios as api } from '@/lib/getStocks'
import { type WatchlistItem } from '@/types/stocks'

const props = defineProps<{ modelValue: boolean; symbol: string | null }>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'closed'): void
}>()

const watchlistItem = ref<WatchlistItem | null>(null)
const isLoading = ref<boolean>(false)
const loadingError = ref<string | null>(null)

const fetchWatchlistItem = async () => {
  if (!props.symbol) {
    loadingError.value = 'No Stock Symbol was provided.'
    watchlistItem.value = null
    isLoading.value = false
    return
  }

  console.log(`Dialog fetching details for: ${props.symbol}`)
  isLoading.value = true
  loadingError.value = null
  watchlistItem.value = null

  try {
    const data = await api.getWatchlistItemBySymbol(props.symbol)
    watchlistItem.value = data
  } catch (err: any) {
    console.error(`Dialog error fetching ${props.symbol}:`, err)
    if (err.response?.status === 404) {
      loadingError.value = `Item with symbol "${props.symbol}" not found.`
    } else if (err.response?.data?.message) {
      loadingError.value = `API Error: ${err.response.data.message}`
    } else {
      loadingError.value = err.message || 'An unknown error occurred.'
    }
  } finally {
    isLoading.value = false
  }
}

const closeDialog = () => {
  emit('update:modelValue', false)
}

const emitUpdate = (value: boolean) => {
  emit('update:modelValue', value)
}

const formattedDate = (dateString: string | null | undefined): string => {
  if (!dateString) return 'N/A'
  try {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
    })
  } catch {
    return dateString
  }
}

const onHide = () => {
  watchlistItem.value = null
  loadingError.value = null
  isLoading.value = false
  emit('closed')
  console.log('Dialog hidden, state reset')
}

watch(
  () => ({ visible: props.modelValue, symbol: props.symbol }),
  (newVal, oldVal) => {
    if (newVal.visible && newVal.symbol && (!oldVal?.visible || newVal.symbol !== oldVal?.symbol)) {
      fetchWatchlistItem()
    }
  },
  { immediate: false },
)
</script>

<style scoped>
.q-item__label--caption {
  word-break: break-word;
}
</style>
