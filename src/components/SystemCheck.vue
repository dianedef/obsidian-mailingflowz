<template>
  <div class="system-check">
    <h3>Vérification du système</h3>
    <div class="requirements-list">
      <div class="requirement" :class="{ 'is-installed': requirements.python }">
        <span class="icon">{{ requirements.python ? '✓' : '✗' }}</span>
        <span>Python</span>
      </div>
      <div class="requirement" :class="{ 'is-installed': requirements.ffmpeg }">
        <span class="icon">{{ requirements.ffmpeg ? '✓' : '✗' }}</span>
        <span>FFmpeg</span>
      </div>
      <div class="requirement" :class="{ 'is-installed': requirements.ytdlp }">
        <span class="icon">{{ requirements.ytdlp ? '✓' : '✗' }}</span>
        <span>yt-dlp</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { checkSystemRequirements } from '../systemCheck'

const requirements = ref({
  python: false,
  ffmpeg: false,
  ytdlp: false
})

onMounted(async () => {
  requirements.value = await checkSystemRequirements()
})
</script>

<style scoped>
.system-check {
  padding: 1rem;
}

.requirements-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.requirement {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-muted);
}

.requirement.is-installed {
  color: var(--text-normal);
}

.icon {
  width: 1.5em;
}

.is-installed .icon {
  color: var(--text-success);
}
</style> 