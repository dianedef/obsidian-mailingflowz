<template>
  <div 
    class="pluginflowz-options-menu"
    :style="menuPosition"
  >
    <div class="pluginflowz-options-list">
      <!-- Ouvrir dans Obsidian -->
      <button 
        class="pluginflowz-option-item"
        @click="$emit('open')"
        :title="t('settings.plugins.options.openInObsidian')"
      >
        <span class="option-icon">📄</span>
        {{ t('settings.plugins.options.openInObsidian') }}
      </button>

      <!-- Ouvrir sur GitHub -->
      <button 
        v-if="plugin.repository"
        class="pluginflowz-option-item"
        @click="$emit('github')"
        :title="t('settings.plugins.options.openOnGithub')"
      >
        <span class="option-icon">🔗</span>
        {{ t('settings.plugins.options.openOnGithub') }}
      </button>

      <!-- Copier l'ID -->
      <button 
        class="pluginflowz-option-item"
        @click="$emit('copy-id')"
        :title="t('settings.plugins.options.copyId')"
      >
        <span class="option-icon">📋</span>
        {{ t('settings.plugins.options.copyId') }}
      </button>

      <!-- Séparateur -->
      <div class="pluginflowz-option-separator" />

      <!-- Supprimer -->
      <button 
        class="pluginflowz-option-item danger"
        @click="$emit('delete')"
        :title="t('settings.plugins.delete.confirmMessage', { title: plugin.title })"
      >
        <span class="option-icon">🗑️</span>
        {{ t('settings.plugins.delete.button') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import type { IPlugin } from '../../types'
import { useTranslations } from '../../composables/useTranslations'

const props = defineProps<{
  plugin: IPlugin
  position: { x: number; y: number }
}>()

const emit = defineEmits<{
  (e: 'open'): void
  (e: 'github'): void
  (e: 'copy-id'): void
  (e: 'delete'): void
  (e: 'close'): void
}>()

const { t } = useTranslations()

// Calculer la position du menu
const menuPosition = computed(() => {
  const { x, y } = props.position
  return {
    left: `${x}px`,
    top: `${y}px`
  }
})

// Fermer le menu si on clique en dehors
const handleClickOutside = (event: MouseEvent) => {
  const menu = event.target as HTMLElement
  if (!menu.closest('.pluginflowz-options-menu')) {
    emit('close')
  }
}

// Ajouter/retirer les event listeners
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script> 