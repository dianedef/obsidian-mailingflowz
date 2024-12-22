<template>
  <div class="plugin-settings">
    <div class="plugin-settings-header">
      <h1>{{ t('settings.plugins.title') }}</h1>
      
      <!-- Actions globales -->
      <div class="global-actions">
        <button class="mod-cta" @click="expandAll">
          {{ allExpanded ? t('settings.plugins.collapseAll') : t('settings.plugins.expandAll') }}
        </button>
        <button class="mod-cta" @click="refreshPlugins">
          {{ t('settings.plugins.refresh') }}
        </button>
      </div>
    </div>

    <!-- Filtres -->
    <div class="filters-container">
      <!-- Barre de recherche -->
      <div class="search-container">
        <input 
          type="text" 
          v-model="searchTerm"
          :placeholder="t('settings.plugins.search.placeholder')"
          class="search-input"
        >
        <button 
          v-if="searchTerm"
          class="clear-search"
          @click="searchTerm = ''"
          :title="t('settings.plugins.search.clear')"
        >×</button>
      </div>

      <!-- Filtres de statut -->
      <div class="status-filters">
        <label>{{ t('settings.plugins.filters.status') }}:</label>
        <div class="status-buttons">
          <button 
            v-for="status in ['exploring', 'active', 'inactive']"
            :key="status"
            :class="['status-button', { active: selectedStatuses.includes(status) }]"
            @click="toggleStatusFilter(status)"
          >
            {{ t(`settings.plugins.status.${status}`) }}
          </button>
        </div>
      </div>
    </div>

    <!-- Liste des plugins -->
    <div class="plugins-container">
      <div v-for="(pluginsInGroup, groupName) in groupedPlugins" :key="groupName">
        <div class="group-header">
          <h2>{{ groupName }}</h2>
          <span class="plugin-count">({{ pluginsInGroup.length }})</span>
        </div>
        
        <div v-for="plugin in pluginsInGroup" :key="plugin.id" class="plugin-container" :class="{ collapsed: !expandedPlugins.includes(plugin.id) }">
          <!-- En-tête du plugin -->
          <div class="plugin-header" @click="togglePlugin(plugin.id)">
            <div class="plugin-title-container">
              <span class="plugin-title">{{ plugin.title }}</span>
              
              <!-- Tags -->
              <div class="plugin-tags">
                <Tag 
                  v-for="tag in plugin.tags" 
                  :key="tag" 
                  :text="tag"
                  @remove="removeTag(plugin, tag)"
                  removable
                />
                <button 
                  class="add-tag-button"
                  @click.stop="openAddTagModal(plugin)"
                  :title="t('settings.plugins.tags.add')"
                >+</button>
              </div>
            </div>

            <!-- Indicateurs -->
            <div class="plugin-indicators">
              <StatusTag :status="plugin.status[0]" />
              <div class="plugin-metrics">
                <span class="metric" :title="t('settings.plugins.options.rating')">★ {{ plugin.rating }}/5</span>
                <span class="metric" :title="t('settings.plugins.options.urgency')">⚡ {{ plugin.urgency }}/3</span>
                <span class="metric" :title="t('settings.plugins.options.importance')">⚖️ {{ plugin.importance }}/3</span>
              </div>
            </div>

            <!-- Boutons d'action -->
            <div class="plugin-buttons">
              <ToggleButton
                :value="plugin.activate"
                @update:value="toggleActivation(plugin)"
                :tooltip="plugin.activate ? t('settings.plugins.deactivate.tooltip') : t('settings.plugins.activate.tooltip')"
              />
              <button 
                class="toggle-button"
                :title="t('settings.plugins.toggle.tooltip')"
              >
                <span class="toggle-icon" :class="{ 'is-expanded': expandedPlugins.includes(plugin.id) }">
                  ▼
                </span>
              </button>
            </div>
          </div>

          <!-- Options du plugin (visible quand développé) -->
          <div class="plugin-options" v-show="expandedPlugins.includes(plugin.id)">
            <!-- Description -->
            <div class="plugin-description">
              {{ plugin.description }}
              <a :href="plugin.url" target="_blank" class="plugin-url">{{ t('settings.plugins.viewOnline') }}</a>
            </div>

            <!-- Statut -->
            <div class="option-row">
              <label>{{ t('settings.plugins.options.status') }}</label>
              <select v-model="plugin.status[0]" @change="updatePluginStatus(plugin)">
                <option value="exploring">{{ t('settings.plugins.status.exploring') }}</option>
                <option value="active">{{ t('settings.plugins.status.active') }}</option>
                <option value="inactive">{{ t('settings.plugins.status.inactive') }}</option>
              </select>
            </div>

            <!-- Groupe -->
            <div class="option-row">
              <label>{{ t('settings.plugins.options.groups') }}</label>
              <select v-model="plugin.group[0]" @change="updatePluginGroup(plugin)">
                <option value="">{{ t('settings.plugins.groups.none') }}</option>
                <option v-for="group in groups" :key="group" :value="group">
                  {{ group }}
                </option>
              </select>
            </div>

            <!-- Note -->
            <div class="option-row">
              <label>{{ t('settings.plugins.options.rating') }}</label>
              <RatingControl
                v-model="plugin.rating"
                @update:value="updatePluginRating(plugin)"
                :max="5"
              />
            </div>

            <!-- Urgence -->
            <div class="option-row">
              <label>{{ t('settings.plugins.options.urgency') }}</label>
              <RatingControl
                v-model="plugin.urgency"
                @update:value="updatePluginUrgency(plugin)"
                :max="3"
              />
            </div>

            <!-- Importance -->
            <div class="option-row">
              <label>{{ t('settings.plugins.options.importance') }}</label>
              <RatingControl
                v-model="plugin.importance"
                @update:value="updatePluginImportance(plugin)"
                :max="3"
              />
            </div>

            <!-- Actions supplémentaires -->
            <div class="plugin-actions">
              <button @click="openPluginNote(plugin)" class="mod-cta">
                {{ t('settings.plugins.openNote') }}
              </button>
              <button @click="confirmDeletePlugin(plugin)" class="mod-warning">
                {{ t('settings.plugins.delete') }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Message si aucun résultat -->
      <div v-if="Object.keys(groupedPlugins).length === 0" class="no-results">
        {{ t('settings.plugins.noResults') }}
      </div>
    </div>

    <!-- Modal d'ajout de tag -->
    <AddTagModal
      v-if="showAddTagModal"
      :plugin="selectedPlugin"
      @close="closeAddTagModal"
      @add-tag="addTag"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Notice } from 'obsidian'
import type { IPlugin, TPluginStatus } from '../types'
import { useSettings } from '../composables/useSettings'
import { useTranslations } from '../composables/useTranslations'
import Tag from './ui/Tag.vue'
import ToggleButton from './ui/ToggleButton.vue'
import RatingControl from './ui/RatingControl.vue'
import StatusTag from './ui/StatusTag.vue'
import AddTagModal from './ui/AddTagModal.vue'

const { t } = useTranslations()
const { settings, updatePlugin, removePlugin, getPluginNote } = useSettings()

// État local
const searchTerm = ref('')
const expandedPlugins = ref<string[]>([])
const selectedStatuses = ref<TPluginStatus[]>([])
const showAddTagModal = ref(false)
const selectedPlugin = ref<IPlugin | null>(null)

// Computed
const allExpanded = computed(() => {
  return settings.value.plugins.every(p => expandedPlugins.value.includes(p.id))
})

const groups = computed(() => settings.value.groups)

// Plugins filtrés et groupés
const groupedPlugins = computed(() => {
  const term = searchTerm.value.toLowerCase()
  const filtered = settings.value.plugins.filter(plugin => {
    const matchesSearch = 
      plugin.title.toLowerCase().includes(term) ||
      plugin.description.toLowerCase().includes(term) ||
      plugin.group.some(g => g.toLowerCase().includes(term)) ||
      plugin.tags.some(t => t.toLowerCase().includes(term))

    const matchesStatus = selectedStatuses.value.length === 0 || 
      selectedStatuses.value.some(s => plugin.status.includes(s))

    return matchesSearch && matchesStatus
  })

  return filtered.reduce((acc, plugin) => {
    const group = plugin.group[0] || 'Sans groupe'
    if (!acc[group]) acc[group] = []
    acc[group].push(plugin)
    return acc
  }, {} as Record<string, IPlugin[]>)
})

// Méthodes
const expandAll = () => {
  if (allExpanded.value) {
    expandedPlugins.value = []
  } else {
    expandedPlugins.value = settings.value.plugins.map(p => p.id)
  }
}

const refreshPlugins = async () => {
  try {
    // Recharger les plugins depuis le système de fichiers
    await settings.value.refresh()
    new Notice(t('settings.plugins.refreshSuccess'))
  } catch (error) {
    console.error(error)
    new Notice(t('notices.error'))
  }
}

const toggleStatusFilter = (status: TPluginStatus) => {
  const index = selectedStatuses.value.indexOf(status)
  if (index === -1) {
    selectedStatuses.value.push(status)
  } else {
    selectedStatuses.value.splice(index, 1)
  }
}

const togglePlugin = (pluginId: string) => {
  const index = expandedPlugins.value.indexOf(pluginId)
  if (index === -1) {
    expandedPlugins.value.push(pluginId)
  } else {
    expandedPlugins.value.splice(index, 1)
  }
}

const toggleActivation = async (plugin: IPlugin) => {
  try {
    const updatedPlugin = { ...plugin, activate: !plugin.activate }
    await updatePlugin(plugin.id, updatedPlugin)
    new Notice(t(updatedPlugin.activate ? 
      'settings.plugins.activated' : 
      'settings.plugins.deactivated'
    ).replace('{title}', plugin.title))
  } catch (error) {
    console.error(error)
    new Notice(t('notices.error'))
  }
}

const updatePluginStatus = async (plugin: IPlugin) => {
  try {
    await updatePlugin(plugin.id, plugin)
  } catch (error) {
    console.error(error)
    new Notice(t('notices.error'))
  }
}

const updatePluginGroup = async (plugin: IPlugin) => {
  try {
    await updatePlugin(plugin.id, plugin)
    new Notice(t('settings.plugins.groups.updated')
      .replace('{title}', plugin.title)
      .replace('{group}', plugin.group[0] || t('settings.plugins.groups.none')))
  } catch (error) {
    console.error(error)
    new Notice(t('notices.error'))
  }
}

const updatePluginRating = async (plugin: IPlugin) => {
  try {
    await updatePlugin(plugin.id, plugin)
  } catch (error) {
    console.error(error)
    new Notice(t('notices.error'))
  }
}

const updatePluginUrgency = async (plugin: IPlugin) => {
  try {
    await updatePlugin(plugin.id, plugin)
  } catch (error) {
    console.error(error)
    new Notice(t('notices.error'))
  }
}

const updatePluginImportance = async (plugin: IPlugin) => {
  try {
    await updatePlugin(plugin.id, plugin)
  } catch (error) {
    console.error(error)
    new Notice(t('notices.error'))
  }
}

// Nouvelles méthodes
const openAddTagModal = (plugin: IPlugin) => {
  selectedPlugin.value = plugin
  showAddTagModal.value = true
}

const closeAddTagModal = () => {
  showAddTagModal.value = false
  selectedPlugin.value = null
}

const addTag = async (plugin: IPlugin, tag: string) => {
  try {
    const updatedPlugin = {
      ...plugin,
      tags: [...plugin.tags, tag]
    }
    await updatePlugin(plugin.id, updatedPlugin)
    new Notice(t('settings.plugins.tags.added').replace('{tag}', tag))
  } catch (error) {
    console.error(error)
    new Notice(t('notices.error'))
  }
}

const removeTag = async (plugin: IPlugin, tag: string) => {
  try {
    const updatedPlugin = {
      ...plugin,
      tags: plugin.tags.filter(t => t !== tag)
    }
    await updatePlugin(plugin.id, updatedPlugin)
    new Notice(t('settings.plugins.tags.removed').replace('{tag}', tag))
  } catch (error) {
    console.error(error)
    new Notice(t('notices.error'))
  }
}

const openPluginNote = async (plugin: IPlugin) => {
  try {
    const note = await getPluginNote(plugin.id)
    if (note) {
      // Ouvrir la note dans Obsidian
      app.workspace.activeLeaf.openFile(note)
    } else {
      new Notice(t('settings.plugins.noteNotFound'))
    }
  } catch (error) {
    console.error(error)
    new Notice(t('notices.error'))
  }
}

const confirmDeletePlugin = async (plugin: IPlugin) => {
  const confirmed = await new Promise<boolean>(resolve => {
    const modal = new Modal(app)
    modal.titleEl.setText(t('settings.plugins.delete.confirm'))
    modal.contentEl.setText(t('settings.plugins.delete.message').replace('{title}', plugin.title))
    
    modal.addButton(btn => btn
      .setButtonText(t('settings.plugins.delete.cancel'))
      .onClick(() => resolve(false)))
    
    modal.addButton(btn => btn
      .setButtonText(t('settings.plugins.delete.confirm'))
      .setWarning()
      .onClick(() => resolve(true)))
    
    modal.open()
  })

  if (confirmed) {
    try {
      await removePlugin(plugin.id)
      new Notice(t('settings.plugins.delete.success').replace('{title}', plugin.title))
    } catch (error) {
      console.error(error)
      new Notice(t('notices.error'))
    }
  }
}
</script>

<style scoped>
.plugin-settings {
  margin-top: 2rem;
}

.search-container {
  margin-bottom: 1rem;
}

.search-input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid var(--background-modifier-border);
  border-radius: 4px;
  background: var(--background-primary);
  color: var(--text-normal);
}

.plugins-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.plugin-container {
  border: 1px solid var(--background-modifier-border);
  border-radius: 4px;
  margin-bottom: 0.5rem;
  overflow: hidden;
}

.plugin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: var(--background-secondary);
  cursor: pointer;
}

.plugin-title-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
}

.plugin-title {
  font-weight: bold;
}

.plugin-tags {
  display: flex;
  gap: 0.25rem;
  flex-wrap: wrap;
}

.plugin-buttons {
  display: flex;
  gap: 0.5rem;
}

.toggle-button {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.toggle-icon {
  transition: transform 0.2s ease;
}

.toggle-icon.is-expanded {
  transform: rotate(180deg);
}

.plugin-options {
  padding: 1rem;
  background: var(--background-primary);
  border-top: 1px solid var(--background-modifier-border);
}

.option-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.75rem;
}

.option-row label {
  min-width: 120px;
  font-weight: 500;
}

select {
  padding: 0.25rem;
  border: 1px solid var(--background-modifier-border);
  border-radius: 4px;
  background: var(--background-primary);
  color: var(--text-normal);
}

.plugin-settings-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.global-actions {
  display: flex;
  gap: 0.5rem;
}

.filters-container {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.status-filters {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.status-buttons {
  display: flex;
  gap: 0.25rem;
}

.status-button {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  border: 1px solid var(--background-modifier-border);
  background: var(--background-primary);
  cursor: pointer;
}

.status-button.active {
  background: var(--interactive-accent);
  color: var(--text-on-accent);
}

.group-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.plugin-count {
  color: var(--text-muted);
  font-size: 0.9em;
}

.plugin-description {
  margin-bottom: 1rem;
  color: var(--text-muted);
  font-size: 0.9em;
  line-height: 1.4;
}

.plugin-url {
  display: inline-block;
  margin-left: 0.5rem;
  color: var(--text-accent);
}

.plugin-metrics {
  display: flex;
  gap: 0.75rem;
  color: var(--text-muted);
  font-size: 0.9em;
}

.metric {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.plugin-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--background-modifier-border);
}

.no-results {
  text-align: center;
  padding: 2rem;
  color: var(--text-muted);
}

.clear-search {
  position: absolute;
  right: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  font-size: 1.2em;
  padding: 0.25rem;
}

.search-container {
  position: relative;
  flex: 1;
}

.plugin-indicators {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-right: 1rem;
}

.add-tag-button {
  padding: 0 0.5rem;
  background: var(--background-modifier-border);
  border: none;
  border-radius: 4px;
  color: var(--text-muted);
  cursor: pointer;
  font-size: 1.1em;
  line-height: 1.6;
}

.add-tag-button:hover {
  background: var(--interactive-accent);
  color: var(--text-on-accent);
}
</style> 