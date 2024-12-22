<template>
  <div class="tri-state-toggle">
    <div 
      class="tri-state-position"
      @click="setState('left')"
    >
      <div class="tri-state-icon">✕</div>
    </div>
    <div 
      class="tri-state-position"
      @click="setState('middle')"
    >
      <div class="tri-state-icon">~</div>
    </div>
    <div 
      class="tri-state-position"
      @click="setState('right')"
    >
      <div class="tri-state-icon">✓</div>
    </div>
    <div 
      class="tri-state-slider"
      :class="currentState"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

type TState = 'left' | 'middle' | 'right'

const props = defineProps<{
  initialState: TState
}>()

const emit = defineEmits<{
  (e: 'change', state: TState): void
}>()

const currentState = ref<TState>(props.initialState)

// Mettre à jour l'état quand la prop change
watch(() => props.initialState, (newState) => {
  if (newState !== currentState.value) {
    currentState.value = newState
  }
})

const setState = (state: TState) => {
  currentState.value = state
  emit('change', state)
}
</script> 