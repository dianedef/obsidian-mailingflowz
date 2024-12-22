<template>
  <div 
    class="pluginflowz-tag pluginflowz-tag-status"
    :class="[status, { selected, disabled }]"
    @click="!disabled && handleClick($event)"
    role="button"
    tabindex="0"
    @keyup.enter="!disabled && handleClick($event)"
    @keyup.space="!disabled && handleClick($event)"
  >
    {{ t(`settings.plugins.status.${status}`) }}
  </div>
</template>

<script setup lang="ts">
import type { TPluginStatus } from '../../types'
import { useTranslations } from '../../composables/useTranslations'

const props = defineProps<{
  status: TPluginStatus
  selected?: boolean
  disabled?: boolean
  isFilter?: boolean
}>()

const emit = defineEmits<{
  (e: 'click', event: MouseEvent): void
  (e: 'filter'): void
}>()

const { t } = useTranslations()

function handleClick(event: MouseEvent) {
  if (props.isFilter) {
    emit('filter')
  } else {
    emit('click', event)
  }
}
</script>

<style scoped>
.pluginflowz-tag-status {
  cursor: pointer;
  user-select: none;
  transition: all 0.2s ease;
}

.pluginflowz-tag-status:hover:not(.disabled) {
  opacity: 0.8;
  transform: translateY(-1px);
}

.pluginflowz-tag-status.selected {
  background-color: var(--interactive-accent);
  color: var(--text-on-accent);
}

.pluginflowz-tag-status.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style> 