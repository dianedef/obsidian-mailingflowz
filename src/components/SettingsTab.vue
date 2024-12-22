<template>
  <div class="settings-tab">
    <!-- Mode d'affichage par défaut -->
    <div class="setting-item">
      <div class="setting-item-info">
        <div class="setting-item-name">{{ t('settings.defaultViewMode') }}</div>
        <div class="setting-item-description">{{ t('settings.defaultViewModeDesc') }}</div>
      </div>
      <div class="setting-item-control">
        <select v-model="currentMode" @change="updateViewMode">
          <option value="tab">{{ t('settings.tab') }}</option>
          <option value="sidebar">{{ t('settings.sidebar') }}</option>
          <option value="popup">{{ t('settings.popup') }}</option>
        </select>
      </div>
    </div>

    <!-- Dossier des plugins -->
    <div class="setting-item">
      <div class="setting-item-info">
        <div class="setting-item-name">{{ t('settings.pluginFolder.name') }}</div>
        <div class="setting-item-description">{{ t('settings.pluginFolder.desc') }}</div>
      </div>
      <div class="setting-item-control">
        <input 
          type="text" 
          v-model="notesFolder"
          @change="updateNotesFolder"
        >
      </div>
    </div>

    <!-- Template des notes -->
    <div class="setting-item">
      <div class="setting-item-info">
        <div class="setting-item-name">{{ t('settings.template.name') }}</div>
        <div class="setting-item-description">{{ t('settings.template.desc') }}</div>
      </div>
      <div class="setting-item-control">
        <textarea 
          v-model="template"
          @change="updateTemplate"
          placeholder="# {{name}}\n\n{{description}}\n\n{{url}}"
        ></textarea>
      </div>
    </div>

    <hr>

    <!-- Section Import/Export -->
    <h1>{{ t('settings.importExport.title') }}</h1>
    
    <!-- Import JSON -->
    <div class="setting-item">
      <div class="setting-item-info">
        <div class="setting-item-name">{{ t('settings.importExport.jsonImport.name') }}</div>
        <div class="setting-item-description">{{ t('settings.importExport.jsonImport.desc') }}</div>
      </div>
      <div class="setting-item-control">
        <button @click="importJSON" class="mod-cta">
          {{ t('settings.importExport.jsonImport.button') }}
        </button>
      </div>
    </div>

    <!-- Export JSON -->
    <div class="setting-item">
      <div class="setting-item-info">
        <div class="setting-item-name">{{ t('settings.importExport.jsonExport.name') }}</div>
        <div class="setting-item-description">{{ t('settings.importExport.jsonExport.desc') }}</div>
      </div>
      <div class="setting-item-control">
        <button @click="exportJSON" class="mod-cta">
          {{ t('settings.importExport.jsonExport.button') }}
        </button>
      </div>
    </div>

    <hr>

    <!-- Section Groupes -->
    <h1>{{ t('settings.groups.title') }}</h1>
    
    <!-- Liste des groupes existants -->
    <div v-for="group in groups" :key="group" class="setting-item" v-if="group !== 'Sans groupe'">
      <div class="setting-item-info">
        <div class="setting-item-name">{{ group }}</div>
      </div>
      <div class="setting-item-control">
        <button @click="deleteGroup(group)" class="mod-warning">
          {{ t('settings.groups.delete.button') }}
        </button>
      </div>
    </div>

    <!-- Ajouter un nouveau groupe -->
    <div class="setting-item">
      <div class="setting-item-info">
        <div class="setting-item-name">{{ t('settings.groups.add.name') }}</div>
        <div class="setting-item-description">{{ t('settings.groups.add.desc') }}</div>
      </div>
      <div class="setting-item-control">
        <input 
          type="text" 
          v-model="newGroupName"
          :placeholder="t('settings.groups.add.placeholder')"
          @keyup.enter="addNewGroup"
        >
      </div>
    </div>

    <hr>

    <!-- Section Plugins -->
    <PluginSettings />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Notice } from 'obsidian'
import { useSettings } from '../composables/useSettings'
import { useTranslations } from '../composables/useTranslations'
import { useViewMode } from '../composables/useViewMode'
import PluginSettings from './PluginSettings.vue'

const { t } = useTranslations()
const { settings, saveSettings, initializeFolders } = useSettings()
const { setView } = useViewMode()

// Refs pour les champs de formulaire
const currentMode = ref(settings.value.currentMode)
const notesFolder = ref(settings.value.notesFolder)
const template = ref(settings.value.template)
const groups = ref(settings.value.groups)
const newGroupName = ref('')

// Méthodes de mise à jour
const updateViewMode = async () => {
  try {
    await setView(currentMode.value)
    await saveSettings({ currentMode: currentMode.value })
    new Notice(t('notices.success'))
  } catch (error) {
    console.error(error)
    new Notice(t('notices.error'))
  }
}

const updateNotesFolder = async () => {
  try {
    await initializeFolders(notesFolder.value, groups.value)
    new Notice(t('settings.pluginFolder.updated'))
  } catch (error) {
    console.error(error)
    new Notice(t('notices.error'))
  }
}

const updateTemplate = async () => {
  try {
    await saveSettings({ template: template.value })
    new Notice(t('settings.template.updated'))
  } catch (error) {
    console.error(error)
    new Notice(t('notices.error'))
  }
}

// Gestion des groupes
const addNewGroup = async () => {
  if (!newGroupName.value.trim()) {
    new Notice(t('settings.groups.add.error'))
    return
  }

  try {
    const newGroups = [...groups.value, newGroupName.value.trim()]
    await saveSettings({ groups: newGroups })
    await initializeFolders(notesFolder.value, newGroups)
    groups.value = newGroups
    newGroupName.value = ''
    new Notice(t('settings.groups.add.success'))
  } catch (error) {
    console.error(error)
    new Notice(t('notices.error'))
  }
}

const deleteGroup = async (groupName: string) => {
  try {
    const newGroups = groups.value.filter(g => g !== groupName)
    await saveSettings({ groups: newGroups })
    groups.value = newGroups
    new Notice(t('settings.groups.delete.success').replace('{name}', groupName))
  } catch (error) {
    console.error(error)
    new Notice(t('notices.error'))
  }
}

// Import/Export
const importJSON = async () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.json'
  input.style.display = 'none'
  document.body.appendChild(input)

  input.onchange = async (e: Event) => {
    const target = e.target as HTMLInputElement
    if (!target.files?.length) return

    const loadingNotice = new Notice(t('settings.importExport.jsonImport.loading'), 0)

    try {
      const file = target.files[0]
      const reader = new FileReader()

      reader.onload = async (event: ProgressEvent<FileReader>) => {
        try {
          if (event.target?.result) {
            const config = JSON.parse(event.target.result as string)
            await saveSettings(config)
            new Notice(t('settings.importExport.jsonImport.success'))
            // Recharger les valeurs
            Object.assign(settings.value, config)
          }
        } catch (error) {
          console.error(error)
          new Notice(t('settings.importExport.jsonImport.error'))
        } finally {
          loadingNotice.hide()
        }
      }

      reader.readAsText(file)
    } catch (error) {
      console.error(error)
      loadingNotice.hide()
      new Notice(t('settings.importExport.jsonImport.error'))
    }
  }

  input.click()
}

const exportJSON = async () => {
  try {
    const jsonString = JSON.stringify(settings.value, null, 2)
    const blob = new Blob([jsonString], { type: 'application/json' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'plugin-flowz-config.json'
    a.click()
    window.URL.revokeObjectURL(url)
    new Notice(t('settings.importExport.jsonExport.success'))
  } catch (error) {
    console.error(error)
    new Notice(t('settings.importExport.jsonExport.error'))
  }
}

// Initialisation
onMounted(async () => {
  // Charger les paramètres initiaux si nécessaire
})
</script>

<style scoped>
.settings-tab {
  padding: 1rem;
}

.setting-item {
  margin-bottom: 1.5rem;
}

.setting-item-info {
  margin-bottom: 0.5rem;
}

.setting-item-name {
  font-weight: bold;
  margin-bottom: 0.25rem;
}

.setting-item-description {
  color: var(--text-muted);
  font-size: 0.9em;
}

.setting-item-control {
  display: flex;
  gap: 0.5rem;
}

input, select, textarea {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid var(--background-modifier-border);
  border-radius: 4px;
  background: var(--background-primary);
  color: var(--text-normal);
}

textarea {
  min-height: 100px;
  font-family: monospace;
}

button {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}

button.mod-warning {
  background-color: var(--background-modifier-error);
  color: var(--text-on-accent);
}

hr {
  margin: 2rem 0;
  border: none;
  border-top: 1px solid var(--background-modifier-border);
}

h1 {
  margin: 1.5rem 0;
  font-size: 1.5em;
  font-weight: bold;
}
</style> 