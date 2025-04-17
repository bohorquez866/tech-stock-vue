<template>
  <q-dialog :model-value="modelValue" @update:model-value="emitUpdate" @hide="onHide" persistent>
    <q-card style="width: 500px; max-width: 80vw">
      <q-form @submit.prevent="handleSubmit" ref="addItemFormRef">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">Add New Watchlist Item</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup aria-label="Close Dialog" />
        </q-card-section>

        <q-separator />

        <q-card-section>
          <q-input
            v-model.trim="symbol"
            label="Symbol *"
            dense
            outlined
            class="q-mb-md"
            :rules="[
              (val) => !!val || 'Symbol is required',
              (val) =>
                /^[A-Z.^=:-]+$/i.test(val) ||
                'Invalid symbol format (letters, ., ^, =, :, - allowed)',
            ]"
            hint="e.g., AAPL, GOOGL, ^GSPC"
            autofocus
            @update:model-value="symbol = ($event as string).toUpperCase()"
            lazy-rules="ondemand"
            data-cy="add-symbol-input"
          />

          <q-input
            v-model.trim="companyName"
            label="Company Name *"
            dense
            outlined
            class="q-mb-md"
            :rules="[(val) => !!val || 'Company name is required']"
            hint="e.g., Apple Inc."
            lazy-rules="ondemand"
            data-cy="add-company-input"
          />

          <q-input
            v-model="notes"
            label="Notes"
            type="textarea"
            dense
            outlined
            autogrow
            hint="Optional notes about this item"
            data-cy="add-notes-input"
          />

          <div v-if="submitError" class="q-mt-sm text-negative">
            <q-icon name="error_outline" /> {{ submitError }}
          </div>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Cancel" color="grey" v-close-popup />
          <q-btn
            label="Add Item"
            color="primary"
            type="submit"
            :loading="isSubmitting"
            data-cy="add-item-submit-button"
          />
        </q-card-actions>
      </q-form>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { QForm } from 'quasar'
import { apiServiceAxios as api } from '@/lib/getStocks' // Use your actual path
import { type WatchlistAddItem, type WatchlistItem } from '@/types/stocks' // Use your actual path

const props = defineProps<{ modelValue: boolean }>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'itemAdded', newItem: WatchlistItem): void
}>()

const symbol = ref<string>('')
const companyName = ref<string>('')
const notes = ref<string>('')
const isSubmitting = ref<boolean>(false)
const submitError = ref<string | null>(null)
const addItemFormRef = ref<QForm | null>(null)

const handleSubmit = async () => {
  const isValid = await addItemFormRef.value?.validate()
  if (!isValid) {
    console.log('[Add Dialog] Form validation failed.')
    return
  }

  submitError.value = null
  isSubmitting.value = true
  console.log('[Add Dialog] Submitting:', { symbol: symbol.value, companyName: companyName.value })

  const newItemData: WatchlistAddItem = {
    symbol: symbol.value,
    companyName: companyName.value,
    notes: notes.value || '',
  }

  try {
    const addedItem = await api.addToWatchlist(newItemData)

    console.log('[Add Dialog] Item added successfully:', addedItem)

    emit('itemAdded', addedItem)

    closeDialog()
  } catch (err: any) {
    console.error('[Add Dialog] Error adding item:', err)
    submitError.value =
      err.response?.data?.message || err.message || 'Failed to add item. Please try again.'
  } finally {
    isSubmitting.value = false
  }
}

const resetForm = () => {
  symbol.value = ''
  companyName.value = ''
  notes.value = ''
  isSubmitting.value = false
  submitError.value = null
  addItemFormRef.value?.resetValidation()
}

const closeDialog = () => {
  emit('update:modelValue', false)
}

const emitUpdate = (value: boolean) => {
  emit('update:modelValue', value)
}

const onHide = () => {
  resetForm()
  console.log('[Add Dialog] Hidden, form reset.')
}
</script>
