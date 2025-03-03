<template>
  <div class="modal-container pluginflowz-modal">
    <div class="modal">
      <div class="modal-content">
        <h2>{{ t('settings.plugins.add.name') }}</h2>
        <input 
          ref="inputRef"
          v-model="tagInput"
          type="text"
          :placeholder="t('settings.plugins.add.placeholder')"
          @keyup.enter="handleSubmit"
        />
        <div class="modal-button-container">
          <button 
            class="mod-cta"
            @click="handleSubmit"
          >
            {{ t('settings.plugins.add.success') }}
          </button>
          <button @click="$emit('close')">
            {{ t('settings.plugins.delete.cancel') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useTranslations } from '../../composables/useTranslations'

const { t } = useTranslations()

const emit = defineEmits<{
  (e: 'submit', tag: string): void
  (e: 'close'): void
}>()

const tagInput = ref('')
const inputRef = ref<HTMLInputElement>()

onMounted(() => {
  // Focus sur l'input quand le modal s'ouvre
  inputRef.value?.focus()
})

const handleSubmit = () => {
  const tag = tagInput.value.trim()
  if (tag) {
    emit('submit', tag)
  }
  emit('close')
}
</script> 