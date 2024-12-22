<template>
  <div class="pluginflowz-dashboard-container">
    <!-- Loading overlay -->
    <div 
      v-if="isLoading"
      class="pluginflowz-loading-overlay"
    >
      <div class="pluginflowz-loading-spinner">
        <div class="spinner"></div>
        <span>{{ t('dashboard.loading') }}</span>
      </div>
    </div>

    <!-- Header avec recherche et toggle de vue -->
    <div class="pluginflowz-header">
      <div class="pluginflowz-search">
        <input 
          v-model="searchQuery" 
          type="text" 
          :placeholder="t('dashboard.searchPlaceholder')"
          class="pluginflowz-search-input"
          :disabled="isLoading"
        />
      </div>
      
      <div class="pluginflowz-header-buttons">
        <button 
          class="pluginflowz-view-button"
          @click="toggleView"
          :disabled="isLoading"
        >
          {{ t(currentViewMode === 'cards' ? 'dashboard.listView' : 'dashboard.cardView') }}
        </button>

        <button 
          class="pluginflowz-view-button"
          @click="toggleNotesDisplay"
          :disabled="isLoading"
        >
          {{ t(showNotes ? 'dashboard.hideNotes' : 'dashboard.showNotes') }}
        </button>
      </div>
    </div>

    <!-- Filtres -->
    <div class="pluginflowz-filters">
      <div class="pluginflowz-filter-groups">
        <tri-state-toggle 
          :initial-state="globalToggleState"
          @change="handleGlobalToggle"
          :disabled="isLoading"
        />
      </div>

      <div class="pluginflowz-filter-status">
        <template v-for="status in availableStatuses" :key="status">
          <status-tag 
            :status="status"
            :selected="statusStore.isSelected(status)"
            :is-filter="true"
            @filter="statusStore.toggleStatus(status)"
            :disabled="isLoading"
          />
        </template>
      </div>

      <div class="pluginflowz-filter-tags">
        <template v-for="tag in uniqueTags" :key="tag">
          <tag 
            :text="tag"
            :removable="false"
            @click="filterByTag(tag)"
            :disabled="isLoading"
          />
        </template>
      </div>
    </div>

    <!-- Liste ou Grille de plugins -->
    <plugin-list
      v-if="currentViewMode === 'list'"
      :plugins="filteredPlugins"
      :show-notes="showNotes"
      @update="handlePluginUpdate"
      @delete="handlePluginDelete"
      :disabled="isLoading"
    />
    <plugin-cards
      v-else
      :plugins="filteredPlugins"
      :show-notes="showNotes"
      @update="handlePluginUpdate"
      @delete="handlePluginDelete"
      :disabled="isLoading"
    />

    <!-- Message si aucun plugin -->
    <div 
      v-if="!plugins.length && !isLoading"
      class="pluginflowz-no-plugins"
    >
      {{ t('dashboard.noPlugins') }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import type { IPlugin, TPluginStatus, TDashboardView } from '../types'
import TriStateToggle from './ui/TriStateToggle.vue'
import StatusTag from './ui/StatusTag.vue'
import Tag from './ui/Tag.vue'
import { useTranslations } from '../composables/useTranslations'
import { Settings } from '../Settings'

// Props avec typage correct
interface Props {
  plugin: any; // Type du plugin Obsidian
  settings: any; // Type des settings
  translations: any; // Type des translations
  onLoaded?: (plugins: IPlugin[]) => void;
}

const props = withDefaults(defineProps<Props>(), {
  onLoaded: undefined
})

// Composables
const { t } = useTranslations()
const statusStore = useStatusStore()

// État réactif

const searchQuery = ref('')
const currentViewMode = ref<TDashboardView>('cards')
const isLoading = ref(false)
const showNotes = ref(false)

// Ajouter une ref pour suivre les mises à jour en cours
const updatingPlugins = ref(new Set<string>())

// Computed properties
const availableStatuses = computed<TPluginStatus[]>(() => 
  ['exploring', 'active', 'inactive', 'ignoring']
)

const uniqueTags = computed(() => 
  [...new Set(plugins.value.flatMap(p => p.tags))]
)

// Modifier la computed property filteredPlugins pour enlever la gestion temporaire
const filteredPlugins = computed(() => {
  return plugins.value.filter(plugin => {
    // Filtre par recherche
    const matchesSearch = 
      plugin.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      plugin.description.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      plugin.tags.some(tag => tag.toLowerCase().includes(searchQuery.value.toLowerCase()))

    // Filtre par status
    const matchesStatus = 
      statusStore.selectedStatuses.length === 0 || 
      plugin.status.some(s => statusStore.selectedStatuses.includes(s as TPluginStatus))

    return matchesSearch && matchesStatus
  })
})

// Computed property pour l'état du toggle global
const globalToggleState = computed<'left' | 'middle' | 'right'>(() => {
  const activeCount = plugins.value.filter(p => p.activate).length;
  if (activeCount === 0) return 'left';
  if (activeCount === plugins.value.length) return 'right';
  return 'middle';
})

// Méthodes
const toggleView = () => {
  currentViewMode.value = currentViewMode.value === 'cards' ? 'list' : 'cards'
}

const handleGlobalToggle = async (state: 'left' | 'middle' | 'right') => {
  const newValue = state === 'right'
  isLoading.value = true
  try {
    for (const plugin of plugins.value) {
      plugin.activate = newValue
      await updatePluginNote(plugin)
    }
  } catch (error) {
    console.error('Erreur lors de la mise à jour globale:', error)
  } finally {
    isLoading.value = false
  }
}

// Modifier handlePluginUpdate pour gérer les erreurs et ajouter un délai
const handlePluginUpdate = async (plugin: IPlugin) => {
  // Si le plugin est déjà en cours de mise à jour, ignorer
  if (updatingPlugins.value.has(plugin.title)) {
    console.log('Plugin déjà en cours de mise à jour:', plugin.title)
    return
  }

  const index = plugins.value.findIndex(p => p.title === plugin.title)
  if (index !== -1) {
    // Marquer le plugin comme en cours de mise à jour
    updatingPlugins.value.add(plugin.title)
    
    try {
      // Mettre à jour l'état local immédiatement
      plugins.value[index] = plugin

      // Attendre un court délai avant de sauvegarder
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // Sauvegarder dans Obsidian
      await updatePluginNote(plugin)
    } catch (error) {
      console.error('Erreur lors de la mise à jour du plugin:', error)
      // Restaurer l'état précédent en cas d'erreur
      plugins.value[index] = { ...plugins.value[index] }
      
      // Si l'erreur est "File already exists", réessayer après un délai plus long
      if (error.message?.includes('File already exists')) {
        console.log('Réessai de la mise à jour dans 500ms...')
        setTimeout(() => handlePluginUpdate(plugin), 500)
      }
    } finally {
      // Retirer le plugin de la liste des mises à jour en cours
      updatingPlugins.value.delete(plugin.title)
    }
  }
}

const handlePluginDelete = async (plugin: IPlugin) => {
  try {
    await deletePluginNote(plugin)
    plugins.value = plugins.value.filter(p => p.title !== plugin.title)
  } catch (error) {
    console.error('Erreur lors de la suppression du plugin:', error)
  }
}

const filterByTag = (tag: string) => {
  searchQuery.value = tag
}

const loadPlugins = async (retryCount = 0, maxRetries = 3) => {
  isLoading.value = true
  try {
    plugins.value = await getAllPlugins()
    if (plugins.value.length === 0 && retryCount < maxRetries) {
      // Si aucun plugin n'est chargé et qu'on n'a pas dépassé le nombre max de tentatives
      console.log(`Tentative ${retryCount + 1}/${maxRetries} de chargement des plugins...`)
      // Attendre 500ms avant de réessayer
      setTimeout(() => loadPlugins(retryCount + 1, maxRetries), 500)
      return
    }
    // Si on a des plugins, appeler la callback onLoaded
    if (plugins.value.length > 0 && props.onLoaded) {
      props.onLoaded(plugins.value)
    }
  } catch (error) {
    console.error('Erreur lors du chargement des plugins:', error)
    if (retryCount < maxRetries) {
      // En cas d'erreur, réessayer également
      setTimeout(() => loadPlugins(retryCount + 1, maxRetries), 500)
      return
    }
  } finally {
    isLoading.value = false
  }
}

// Correction du watch pour le type Settings
watch(currentViewMode, async (newMode: TDashboardView) => {
  await Settings.saveSettings({
    currentViewMode: newMode
  } as Partial<MailingFlowzSettings>)
})

// Charger les plugins au montage
onMounted(async () => {
  await statusStore.initializeStore()
  await loadPlugins()
})

const toggleNotesDisplay = () => {
  showNotes.value = !showNotes.value
}
</script> 