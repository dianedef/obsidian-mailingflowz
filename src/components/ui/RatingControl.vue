<template>
  <div class="rating-control">
    <div 
      class="stars"
      :title="t('settings.plugins.rating.tooltip')"
    >
      <span
        v-for="star in 5"
        :key="star"
        class="star"
        :class="{ 'filled': star <= modelValue }"
        @click="updateRating(star)"
        @mouseover="hoverRating = star"
        @mouseleave="hoverRating = 0"
      >
        ★
      </span>
    </div>
    <span v-if="showReset" class="reset" @click="updateRating(0)">
      {{ t('settings.plugins.delete.cancel') }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useTranslations } from '../../composables/useTranslations'

const { t } = useTranslations()

const props = defineProps<{
  modelValue: number
  showReset?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: number): void
}>()

const hoverRating = ref(0)

const updateRating = (value: number) => {
  emit('update:modelValue', value)
}
</script> 