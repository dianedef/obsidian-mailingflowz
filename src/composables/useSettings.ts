import { ref } from 'vue'
import type { Plugin, TFile } from 'obsidian'
import type { TViewMode, TPluginStatus, TDashboardView, IPlugin } from '../../popup mode/types'
import { usePluginManager } from './usePluginManager'

export interface DefaultSettings {
   language: string
   currentMode: TViewMode
   activeLeafId: string | null
   enableAutoUpdate: boolean
   notesFolder: string
   template: string
   currentViewMode: TDashboardView
   plugins: IPlugin[]
   selectedStatuses: TPluginStatus[]
   groups: string[]
}

export const DEFAULT_SETTINGS: DefaultSettings = {
   language: 'fr',
   currentMode: 'popup',
   activeLeafId: null,
   enableAutoUpdate: true,
   notesFolder: 'pluginNotes',
   template: '# {{name}}\n\n{{description}}\n\n{{url}}',
   currentViewMode: 'cards',
   selectedStatuses: [],
   plugins: [],
   groups: ['Sans groupe']
}

export function useSettings() {
   const plugin = ref<Plugin | null>(null)
   const settings = ref<DefaultSettings>(DEFAULT_SETTINGS)
   const { getAllPlugins, updatePluginNote } = usePluginManager()

   const initialize = (p: Plugin) => {
      plugin.value = p
   }

   const loadSettings = async (): Promise<DefaultSettings> => {
      if (!plugin.value) throw new Error('Plugin not initialized')
      
      const savedData = await plugin.value.loadData()
      settings.value = Object.assign({}, DEFAULT_SETTINGS, savedData || {})
      return settings.value
   }

   const saveSettings = async (newSettings: Partial<DefaultSettings>) => {
      if (!plugin.value) throw new Error('Plugin not initialized')
      
      settings.value = Object.assign(settings.value, newSettings)
      await plugin.value.saveData(settings.value)
   }

   const getViewMode = async (): Promise<TViewMode> => {
      if (!plugin.value) throw new Error('Plugin not initialized')
      
      const data = await plugin.value.loadData()
      return (data?.currentMode || DEFAULT_SETTINGS.currentMode) as TViewMode
   }

   // Gestion des dossiers et des notes
   const ensureFolder = async (path: string): Promise<void> => {
      if (!plugin.value) throw new Error('Plugin not initialized')
      
      try {
         const folder = plugin.value.app.vault.getAbstractFileByPath(path)
         if (!folder) {
            await plugin.value.app.vault.createFolder(path)
         }
      } catch (error) {
         console.error(`Erreur lors de la création du dossier ${path}:`, error)
         throw error
      }
   }

   const initializeFolders = async (notesFolder: string, groups: string[]): Promise<void> => {
      if (!plugin.value) throw new Error('Plugin not initialized')
      
      try {
         // Créer le dossier principal
         await ensureFolder(notesFolder)

         // Créer les sous-dossiers pour chaque groupe
         for (const group of groups) {
            await ensureFolder(`${notesFolder}/${group}`)
         }

         // Mettre à jour les settings
         await saveSettings({ notesFolder })
      } catch (error) {
         console.error('Erreur lors de l\'initialisation des dossiers:', error)
         throw error
      }
   }

   const getPluginNote = async (pluginId: string): Promise<TFile | null> => {
      if (!plugin.value) throw new Error('Plugin not initialized')
      
      const currentSettings = await loadSettings()
      const pluginData = await getPlugin(pluginId)
      
      if (!pluginData) return null

      const notePath = `${currentSettings.notesFolder}/${pluginData.group[0]}/${pluginId}.md`
      return plugin.value.app.vault.getAbstractFileByPath(notePath) as TFile || null
   }

   const createPluginNote = async (pluginData: IPlugin): Promise<void> => {
      if (!plugin.value) throw new Error('Plugin not initialized')
      
      const currentSettings = await loadSettings()
      const notePath = `${currentSettings.notesFolder}/${pluginData.group[0]}/${pluginData.id}.md`
      
      try {
         // Vérifier si la note existe déjà
         const existingNote = await getPluginNote(pluginData.id)
         if (existingNote) return

         // Créer le contenu de la note à partir du template
         let content = currentSettings.template
         content = content.replace('{{name}}', pluginData.title)
         content = content.replace('{{description}}', pluginData.description)
         content = content.replace('{{url}}', pluginData.url)

         // Créer la note
         await plugin.value.app.vault.create(notePath, content)
      } catch (error) {
         console.error(`Erreur lors de la création de la note pour ${pluginData.id}:`, error)
         throw error
      }
   }

   const movePluginNote = async (pluginId: string, fromGroup: string, toGroup: string): Promise<void> => {
      if (!plugin.value) throw new Error('Plugin not initialized')
      
      const currentSettings = await loadSettings()
      const oldPath = `${currentSettings.notesFolder}/${fromGroup}/${pluginId}.md`
      const newPath = `${currentSettings.notesFolder}/${toGroup}/${pluginId}.md`
      
      try {
         const file = plugin.value.app.vault.getAbstractFileByPath(oldPath) as TFile
         if (file) {
            await plugin.value.app.vault.rename(file, newPath)
         }
      } catch (error) {
         console.error(`Erreur lors du déplacement de la note ${pluginId}:`, error)
         throw error
      }
   }

   const deletePluginNote = async (pluginId: string): Promise<void> => {
      if (!plugin.value) throw new Error('Plugin not initialized')
      
      const note = await getPluginNote(pluginId)
      if (note) {
         await plugin.value.app.vault.delete(note)
      }
   }

   // Gestion des groupes
   const updateGroups = async (groups: string[]): Promise<void> => {
      if (!plugin.value) throw new Error('Plugin not initialized')

      const currentSettings = await loadSettings()
      const oldGroups = currentSettings.groups
      
      // Sauvegarder les nouveaux groupes
      await saveSettings({ groups })

      // Si un groupe a été supprimé, mettre à jour les plugins qui l'utilisaient
      const removedGroups = oldGroups.filter(g => !groups.includes(g))
      if (removedGroups.length > 0) {
         const plugins = await getAllPlugins()
         
         for (const plugin of plugins) {
            const pluginGroups = plugin.group.filter(g => !removedGroups.includes(g))
            if (pluginGroups.length !== plugin.group.length) {
               plugin.group = pluginGroups.length > 0 ? pluginGroups : ['Sans groupe']
               await updatePluginNote(plugin)
            }
         }
      }
   }

   const addGroup = async (groupName: string): Promise<void> => {
      if (!plugin.value) throw new Error('Plugin not initialized')
      
      const currentSettings = await loadSettings()
      if (!currentSettings.groups.includes(groupName)) {
         const newGroups = [...currentSettings.groups, groupName]
         await saveSettings({ groups: newGroups })
      }
   }

   const removeGroup = async (groupName: string): Promise<void> => {
      if (!plugin.value) throw new Error('Plugin not initialized')
      if (groupName === 'Sans groupe') return // Protection du groupe par défaut
      
      const currentSettings = await loadSettings()
      const newGroups = currentSettings.groups.filter(g => g !== groupName)
      await updateGroups(newGroups)
   }

   const getGroups = async (): Promise<string[]> => {
      const currentSettings = await loadSettings()
      return currentSettings.groups
   }

   // Gestion des plugins
   const updatePlugin = async (pluginId: string, updates: Partial<IPlugin>): Promise<void> => {
      if (!plugin.value) throw new Error('Plugin not initialized')
      
      const currentSettings = await loadSettings()
      const pluginIndex = currentSettings.plugins.findIndex(p => p.id === pluginId)
      
      if (pluginIndex !== -1) {
         const updatedPlugin = {
            ...currentSettings.plugins[pluginIndex],
            ...updates
         }
         currentSettings.plugins[pluginIndex] = updatedPlugin
         await saveSettings({ plugins: currentSettings.plugins })
         await updatePluginNote(updatedPlugin)
      }
   }

   const addPlugin = async (newPlugin: IPlugin): Promise<void> => {
      if (!plugin.value) throw new Error('Plugin not initialized')
      
      const currentSettings = await loadSettings()
      if (!currentSettings.plugins.some(p => p.id === newPlugin.id)) {
         const updatedPlugins = [...currentSettings.plugins, newPlugin]
         await saveSettings({ plugins: updatedPlugins })
         await updatePluginNote(newPlugin)
      }
   }

   const removePlugin = async (pluginId: string): Promise<void> => {
      if (!plugin.value) throw new Error('Plugin not initialized')
      
      const currentSettings = await loadSettings()
      const updatedPlugins = currentSettings.plugins.filter(p => p.id !== pluginId)
      await saveSettings({ plugins: updatedPlugins })
   }

   const getPlugin = async (pluginId: string): Promise<IPlugin | undefined> => {
      const currentSettings = await loadSettings()
      return currentSettings.plugins.find(p => p.id === pluginId)
   }

   const getPluginsByGroup = async (groupName: string): Promise<IPlugin[]> => {
      const currentSettings = await loadSettings()
      return currentSettings.plugins.filter(p => p.group.includes(groupName))
   }

   const getPluginsByStatus = async (status: TPluginStatus): Promise<IPlugin[]> => {
      const currentSettings = await loadSettings()
      return currentSettings.plugins.filter(p => p.status.includes(status))
   }

   return {
      settings,
      initialize,
      loadSettings,
      saveSettings,
      getViewMode,
      // Fonctions de gestion des dossiers et des notes
      ensureFolder,
      initializeFolders,
      getPluginNote,
      createPluginNote,
      movePluginNote,
      deletePluginNote,
      // Fonctions de gestion des groupes
      updateGroups,
      addGroup,
      removeGroup,
      getGroups,
      // Fonctions de gestion des plugins
      updatePlugin,
      addPlugin,
      removePlugin,
      getPlugin,
      getPluginsByGroup,
      getPluginsByStatus
   }
} 