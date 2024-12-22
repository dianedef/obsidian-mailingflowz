<template>
  <button 
    class="pluginflowz-toggle-button"
    :class="{ active: computedValue }"
    @click="toggle"
    :title="t(computedValue ? 'settings.plugins.deactivate.tooltip' : 'settings.plugins.activate.tooltip')"
  >
    <div class="toggle-slider" />
  </button>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import { useTranslations } from '../../composables/useTranslations'

export default defineComponent({
  name: 'ToggleButton',
  props: {
    modelValue: {
      type: Boolean,
      default: undefined
    },
    value: {
      type: Boolean,
      default: false
    }
  },
  setup(props, { emit }) {
    const { t } = useTranslations()

    const computedValue = computed(() => {
      return props.modelValue !== undefined ? props.modelValue : props.value
    })

    const toggle = () => {
      const newValue = !computedValue.value
      emit('update:modelValue', newValue)
      emit('update:value', newValue)
    }

    return {
      t,
      toggle,
      computedValue
    }
  }
})
</script> 