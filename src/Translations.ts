export type TranslationKey = 
   // Notices
   | 'notices.saved'
   | 'notices.error'
   | 'notices.success'
   | 'notices.featureEnabled'
   | 'notices.featureDisabled'
   // Commands
   // Errors
   // Settings
   | 'settings.defaultViewMode'
   | 'settings.defaultViewModeDesc'
   | 'settings.tab'
   | 'settings.sidebar'
   | 'settings.overlay'

export const translations: { [lang: string]: Record<TranslationKey, string> } = {
   en: {
      // Notices
      'notices.saved': '✅ Settings saved',
      'notices.error': '❌ Error: {message}',
      'notices.success': '✅ Operation successful',
      'notices.featureEnabled': '✅ Feature enabled',
      'notices.featureDisabled': '❌ Feature disabled',
      // Commands
      // Errors
      // Settings
      'settings.defaultViewMode': 'Default View Mode',
      'settings.defaultViewModeDesc': 'Choose how videos will open by default',
      'settings.tab': 'Tab',
      'settings.sidebar': 'Sidebar',
      'settings.overlay': 'Overlay',
   },
   fr: {
      // Notices
      'notices.saved': '✅ Paramètres sauvegardés',
      'notices.error': '❌ Erreur: {message}',
      'notices.success': '✅ Opération réussie',
      'notices.featureEnabled': '✅ Fonctionnalité activée',
      'notices.featureDisabled': '❌ Fonctionnalité désactivée',
      // Commands
      // Errors
      // Settings
      'settings.defaultViewMode': 'Mode d\'affichage par défaut',
      'settings.defaultViewModeDesc': 'Choisissez comment les vidéos s\'ouvriront par défaut',
      'settings.tab': 'Onglet',
      'settings.sidebar': 'Barre latérale',
      'settings.overlay': 'Superposition',
   }
};

export class Translations {
   private currentLang: string;

   constructor(initialLang: string = 'fr') {
      this.currentLang = initialLang;
   }

   setLanguage(lang: string): void {
      this.currentLang = lang;
   }

   t(key: TranslationKey): string {
      return translations[this.currentLang]?.[key] || translations['en'][key] || key;
   }
}
