import { ref } from 'vue'

type TranslationKey = string

interface Translations {
  t: (key: TranslationKey, params?: Record<string, string>) => string;
  setLanguage: (locale: string) => void;
  currentLocale: string;
}

const translations: Record<string, Record<string, string>> = {
  fr: {
    // Dashboard
    'dashboard.title': 'Tableau de bord des plugins',
    'dashboard.viewModeTab': 'Ouvrir en onglet',
    'dashboard.viewModeSidebar': 'Ouvrir en barre latérale',
    'dashboard.viewModePopup': 'Ouvrir en popup',
    'dashboard.loading': 'Chargement...',
    'dashboard.searchPlaceholder': 'Rechercher des plugins...',
    'dashboard.listView': 'Vue liste',
    'dashboard.cardView': 'Vue cartes',
    'dashboard.noPlugins': 'Aucun plugin trouvé',
    'dashboard.showNotes': 'Avec notes',
    'dashboard.hideNotes': 'Sans notes',

    // Paramètres généraux
    'settings.defaultViewMode': 'Mode d\'affichage par défaut',
    'settings.defaultViewModeDesc': 'Choisissez comment le tableau de bord s\'affiche par défaut',
    'settings.tab': 'Onglet',
    'settings.sidebar': 'Barre latérale',
    'settings.popup': 'Popup',

    // Dossiers et templates
    'settings.pluginFolder.name': 'Dossier des plugins',
    'settings.pluginFolder.desc': 'Dossier où seront stockées les notes des plugins',
    'settings.pluginFolder.updated': 'Dossier des plugins mis à jour',
    'settings.template.name': 'Template des notes',
    'settings.template.desc': 'Template utilisé pour créer les notes des plugins',
    'settings.template.updated': 'Template mis à jour',

    // Import/Export
    'settings.importExport.title': 'Import/Export',
    'settings.importExport.jsonImport.name': 'Importer depuis JSON',
    'settings.importExport.jsonImport.desc': 'Importer une configuration depuis un fichier JSON',
    'settings.importExport.jsonImport.button': 'Importer',
    'settings.importExport.jsonImport.loading': 'Importation en cours...',
    'settings.importExport.jsonImport.success': 'Configuration importée avec succès',
    'settings.importExport.jsonImport.error': 'Erreur lors de l\'importation',
    'settings.importExport.jsonExport.name': 'Exporter vers JSON',
    'settings.importExport.jsonExport.desc': 'Exporter la configuration vers un fichier JSON',
    'settings.importExport.jsonExport.button': 'Exporter',
    'settings.importExport.jsonExport.success': 'Configuration exportée avec succès',
    'settings.importExport.jsonExport.error': 'Erreur lors de l\'exportation',

    // Groupes
    'settings.groups.title': 'Groupes',
    'settings.groups.add.name': 'Ajouter un groupe',
    'settings.groups.add.desc': 'Créer un nouveau groupe de plugins',
    'settings.groups.add.placeholder': 'Nom du groupe',
    'settings.groups.add.button': 'Ajouter',
    'settings.groups.add.success': 'Groupe ajouté avec succès',
    'settings.groups.add.error': 'Le nom du groupe ne peut pas être vide',
    'settings.groups.delete.button': 'Supprimer',
    'settings.groups.delete.success': 'Groupe {name} supprimé',
    'settings.groups.none': 'Sans groupe',

    // Plugins
    'settings.plugins.title': 'Plugins',
    'settings.plugins.search.placeholder': 'Rechercher un plugin...',
    'settings.plugins.search.clear': 'Effacer la recherche',
    'settings.plugins.noResults': 'Aucun plugin trouvé',
    'settings.plugins.expandAll': 'Tout développer',
    'settings.plugins.collapseAll': 'Tout réduire',
    'settings.plugins.refresh': 'Rafraîchir',
    'settings.plugins.refreshSuccess': 'Plugins rafraîchis avec succès',

    // Filtres
    'settings.plugins.filters.status': 'Statut',
    'settings.plugins.status.exploring': 'En exploration',
    'settings.plugins.status.active': 'Actif',
    'settings.plugins.status.inactive': 'Inactif',
    'settings.plugins.status.ignoring': 'Ignoré',

    // Options des plugins
    'settings.plugins.options.status': 'Statut',
    'settings.plugins.options.groups': 'Groupe',
    'settings.plugins.options.rating': 'Note',
    'settings.plugins.options.urgency': 'Urgence',
    'settings.plugins.options.importance': 'Importance',
    'settings.plugins.groups.updated': 'Plugin {title} déplacé vers {group}',

    // Actions sur les plugins
    'settings.plugins.activate.tooltip': 'Activer le plugin',
    'settings.plugins.deactivate.tooltip': 'Désactiver le plugin',
    'settings.plugins.toggle.tooltip': 'Afficher/Masquer les options',
    'settings.plugins.activated': 'Plugin {title} activé',
    'settings.plugins.deactivated': 'Plugin {title} désactivé',
    'settings.plugins.viewOnline': 'Voir en ligne',
    'settings.plugins.openNote': 'Ouvrir la note',
    'settings.plugins.noteNotFound': 'Note non trouvée',

    // Tags
    'settings.plugins.tags.add': 'Ajouter un tag',
    'settings.plugins.tags.added': 'Tag {tag} ajouté',
    'settings.plugins.tags.removed': 'Tag {tag} supprimé',
    'settings.plugins.add.name': 'Ajouter un tag',
    'settings.plugins.add.placeholder': 'Nom du tag',
    'settings.plugins.add.success': 'Ajouter',

    // Suppression
    'settings.plugins.delete': 'Supprimer',
    'settings.plugins.delete.confirm': 'Confirmer la suppression',
    'settings.plugins.delete.message': 'Voulez-vous vraiment supprimer le plugin {title} ?',
    'settings.plugins.delete.cancel': 'Annuler',
    'settings.plugins.delete.success': 'Plugin {title} supprimé',

    // Notifications
    'notices.success': 'Opération réussie',
    'notices.error': 'Une erreur est survenue',

    // Commandes
    'commands.openDashboard': 'Ouvrir le tableau de bord',
    'commands.activateTechGroup': 'Activer le groupe Tech',
    'commands.activateOutilsGroup': 'Activer le groupe Outils',
    'commands.activateBaseGroup': 'Activer le groupe Base',

    // Erreurs
    'errors.openDashboard': 'Erreur lors de l\'ouverture du tableau de bord',
    'errors.activateTechGroup': 'Erreur lors de l\'activation du groupe Tech',
    'errors.activateOutilsGroup': 'Erreur lors de l\'activation du groupe Outils',
    'errors.activateBaseGroup': 'Erreur lors de l\'activation du groupe Base'
  },
  en: {
    // Dashboard
    'dashboard.title': 'Plugin Dashboard',
    'dashboard.viewModeTab': 'Open in tab',
    'dashboard.viewModeSidebar': 'Open in sidebar',
    'dashboard.viewModePopup': 'Open in popup',
    'dashboard.loading': 'Loading...',
    'dashboard.searchPlaceholder': 'Search plugins...',
    'dashboard.listView': 'List view',
    'dashboard.cardView': 'Card view',
    'dashboard.noPlugins': 'No plugins found',
    'dashboard.showNotes': 'With notes',
    'dashboard.hideNotes': 'Without notes',


    // General Settings
    'settings.defaultViewMode': 'Default View Mode',
    'settings.defaultViewModeDesc': 'Choose how the dashboard will display by default',
    'settings.tab': 'Tab',
    'settings.sidebar': 'Sidebar',
    'settings.popup': 'Popup',

    // Folders and Templates
    'settings.pluginFolder.name': 'Plugin Folder',
    'settings.pluginFolder.desc': 'Where plugin notes will be stored',
    'settings.pluginFolder.updated': 'Plugin folder updated',
    'settings.template.name': 'Note Template',
    'settings.template.desc': 'Template used to create plugin notes',
    'settings.template.updated': 'Template updated',

    // Import/Export
    'settings.importExport.title': 'Import/Export',
    'settings.importExport.jsonImport.name': 'Import from JSON',
    'settings.importExport.jsonImport.desc': 'Import configuration from a JSON file',
    'settings.importExport.jsonImport.button': 'Import',
    'settings.importExport.jsonImport.loading': 'Importing...',
    'settings.importExport.jsonImport.success': 'Configuration imported successfully',
    'settings.importExport.jsonImport.error': 'Error importing configuration',
    'settings.importExport.jsonExport.name': 'Export to JSON',
    'settings.importExport.jsonExport.desc': 'Export configuration to a JSON file',
    'settings.importExport.jsonExport.button': 'Export',
    'settings.importExport.jsonExport.success': 'Configuration exported successfully',
    'settings.importExport.jsonExport.error': 'Error exporting configuration',

    // Groups
    'settings.groups.title': 'Groups',
    'settings.groups.add.name': 'Add Group',
    'settings.groups.add.desc': 'Create a new plugin group',
    'settings.groups.add.placeholder': 'Group name',
    'settings.groups.add.button': 'Add',
    'settings.groups.add.success': 'Group added successfully',
    'settings.groups.add.error': 'Group name cannot be empty',
    'settings.groups.delete.button': 'Delete',
    'settings.groups.delete.success': 'Group {name} deleted',
    'settings.groups.none': 'No group',

    // Plugins
    'settings.plugins.title': 'Plugins',
    'settings.plugins.search.placeholder': 'Search plugins...',
    'settings.plugins.search.clear': 'Clear search',
    'settings.plugins.noResults': 'No plugins found',
    'settings.plugins.expandAll': 'Expand all',
    'settings.plugins.collapseAll': 'Collapse all',
    'settings.plugins.refresh': 'Refresh',
    'settings.plugins.refreshSuccess': 'Plugins refreshed successfully',

    // Filters
    'settings.plugins.filters.status': 'Status',
    'settings.plugins.status.exploring': 'Exploring',
    'settings.plugins.status.active': 'Active',
    'settings.plugins.status.inactive': 'Inactive',
    'settings.plugins.status.ignoring': 'Ignoring',

    // Plugin Options
    'settings.plugins.options.status': 'Status',
    'settings.plugins.options.groups': 'Group',
    'settings.plugins.options.rating': 'Rating',
    'settings.plugins.options.urgency': 'Urgency',
    'settings.plugins.options.importance': 'Importance',
    'settings.plugins.groups.updated': 'Plugin {title} moved to {group}',

    // Plugin Actions
    'settings.plugins.activate.tooltip': 'Activate plugin',
    'settings.plugins.deactivate.tooltip': 'Deactivate plugin',
    'settings.plugins.toggle.tooltip': 'Show/Hide options',
    'settings.plugins.activated': 'Plugin {title} activated',
    'settings.plugins.deactivated': 'Plugin {title} deactivated',
    'settings.plugins.viewOnline': 'View online',
    'settings.plugins.openNote': 'Open note',
    'settings.plugins.noteNotFound': 'Note not found',

    // Tags
    'settings.plugins.tags.add': 'Add tag',
    'settings.plugins.tags.added': 'Tag {tag} added',
    'settings.plugins.tags.removed': 'Tag {tag} removed',
    'settings.plugins.add.name': 'Add tag',
    'settings.plugins.add.placeholder': 'Tag name',
    'settings.plugins.add.success': 'Add',

    // Delete
    'settings.plugins.delete': 'Delete',
    'settings.plugins.delete.confirm': 'Confirm deletion',
    'settings.plugins.delete.message': 'Are you sure you want to delete plugin {title}?',
    'settings.plugins.delete.cancel': 'Cancel',
    'settings.plugins.delete.success': 'Plugin {title} deleted',

    // Notifications
    'notices.success': 'Operation successful',
    'notices.error': 'An error occurred',

    // Commands
    'commands.openDashboard': 'Open Dashboard',
    'commands.activateTechGroup': 'Activate Tech Group',
    'commands.activateOutilsGroup': 'Activate Tools Group',
    'commands.activateBaseGroup': 'Activate Base Group',

    // Errors
    'errors.openDashboard': 'Error opening dashboard',
    'errors.activateTechGroup': 'Error activating Tech group',
    'errors.activateOutilsGroup': 'Error activating Tools group',
    'errors.activateBaseGroup': 'Error activating Base group'
  }
}

export function useTranslations(): Translations {
  const currentLocale = ref(document.documentElement.lang?.toLowerCase().startsWith('fr') ? 'fr' : 'en')

  const t = (key: TranslationKey, params?: Record<string, string>): string => {
    let text = translations[currentLocale.value]?.[key] || translations['en'][key] || key

    // Replace parameters if present
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        text = text.replace(`{${key}}`, value)
      })
    }

    return text
  }

  const setLanguage = (locale: string) => {
    if (translations[locale]) {
      currentLocale.value = locale
    }
  }

  return {
    t,
    setLanguage,
    currentLocale: currentLocale.value
  }
} 