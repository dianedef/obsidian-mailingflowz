<template>
  <div 
    class="pluginflowz-tag"
    :class="{ 
      'pluginflowz-tag-removable': removable,
      [tagClass]: true
    }"
    @click="$emit('click')"
  >
    {{ text }}
    <span 
      v-if="removable"
      class="pluginflowz-tag-remove"
      @click.stop="$emit('remove')"
    >
      ×
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  text: string
  removable?: boolean
}>()

const tagClass = computed(() => 
  `pluginflowz-tag-${props.text.replace(/\s+/g, '-').toLowerCase()}`
)</script> 