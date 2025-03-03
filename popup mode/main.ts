import { Plugin, Menu, Notice, WorkspaceLeaf, ItemView } from 'obsidian';
import { TViewMode } from './types';
import { registerStyles } from './RegisterStyles';
import { Settings, DEFAULT_SETTINGS } from './Settings';
import { SettingsTab } from './SettingsTab';
import { useTranslations } from './composables/useTranslations';
import { usePluginManager } from './composables/usePluginManager';
import { Hotkeys } from './Hotkeys';
import { useViewMode } from './composables/useViewMode';
import { createApp } from 'vue';
import { pinia } from './stores';
import Dashboard from './components/Dashboard.vue';
import { VIEW_TYPE_PLUGINFLOWZ } from './constants';

class PluginFlowzView extends ItemView {
    private vueApp: ReturnType<typeof createApp> | null = null;

    constructor(leaf: WorkspaceLeaf) {
        super(leaf);
    }

    getViewType(): string {
        return VIEW_TYPE_PLUGINFLOWZ;
    }

    getDisplayText(): string {
        return "Plugin Dashboard";
    }

    async onOpen() {
        try {
            const container = this.containerEl.children[1];
            container.empty();
            container.addClass('pluginflowz-container');

            // Créer et monter l'application Vue
            const app = createApp(Dashboard);
            
            // S'assurer que Pinia est initialisé correctement
            try {
                app.use(pinia);
            } catch (error) {
                console.error('[PluginFlowz] Erreur lors de l\'initialisation de Pinia:', error);
            }
            
            this.vueApp = app;
            this.vueApp.mount(container);
        } catch (error) {
            console.error('[PluginFlowz] Erreur lors de l\'ouverture de la vue:', error);
            throw error;
        }
    }

    async onClose() {
        try {
            if (this.vueApp) {
                this.vueApp.unmount();
                this.vueApp = null;
            }
        } catch (error) {
            console.error('[PluginFlowz] Erreur lors de la fermeture de la vue:', error);
        }
    }
}

export default class PluginFlowz extends Plugin {
    settings!: Settings;
    private translations = useTranslations();
    private hotkeys!: Hotkeys;
    private viewMode = useViewMode();
    private pluginManager = usePluginManager();

    async onload() {
        try {
            // Enregistrer les styles en premier
            registerStyles();

            // Initialiser les settings
            this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
            await Settings.initialize(this);

            // Charger la langue
            this.loadLanguage();
            await this.loadApp();

            // Initialiser le gestionnaire de plugins
            this.pluginManager.initializeManager(this);

            // Initialiser le ViewMode et attendre qu'il soit prêt
            await this.viewMode.initializeViewMode(this);

            // Enregistrer la vue avant les hotkeys
            this.registerView(
                VIEW_TYPE_PLUGINFLOWZ,
                (leaf) => new PluginFlowzView(leaf)
            );

            // Initialiser les hotkeys avec les bonnes dépendances
            this.hotkeys = new Hotkeys(this, Settings, this.viewMode);
            this.hotkeys.registerHotkeys();

            // Ajouter l'icône dans la barre latérale
            const ribbonIconEl = this.addRibbonIcon('layout', 'PluginFlowz', async () => {
                try {
                    await this.viewMode.setView('popup');
                    new Notice(this.translations.t('notices.success'));
                } catch (error) {
                    console.error('[PluginFlowz]', error);
                    new Notice(this.translations.t('notices.error'));
                }
            });

            // Menu hover
            ribbonIconEl.addEventListener('mouseenter', () => {
                const menu = new Menu();

                const createMenuItem = (title: string, icon: string, mode: TViewMode) => {
                    menu.addItem((item) => {
                        item.setTitle(title)
                            .setIcon(icon)
                            .onClick(async () => {
                                try {
                                    await this.viewMode.setView(mode);
                                    new Notice(this.translations.t('notices.success'));
                                } catch (error) {
                                    console.error('[PluginFlowz]', error);
                                    new Notice(this.translations.t('notices.error'));
                                }
                            });
                    });
                };

                createMenuItem(this.translations.t('dashboard.viewModeTab'), "tab", "tab");
                createMenuItem(this.translations.t('dashboard.viewModeSidebar'), "layout-sidebar-right", "sidebar");
                createMenuItem(this.translations.t('dashboard.viewModePopup'), "layout-top", "popup");

                const rect = ribbonIconEl.getBoundingClientRect();
                menu.showAtPosition({ x: rect.left, y: rect.top - 10 });

                // Fermer le menu quand la souris quitte l'icône
                const handleMouseLeave = (e: MouseEvent) => {
                    const target = e.relatedTarget as HTMLElement;
                    if (!target?.closest('.menu')) {
                        menu.hide();
                        ribbonIconEl.removeEventListener('mouseleave', handleMouseLeave);
                    }
                };
                ribbonIconEl.addEventListener('mouseleave', handleMouseLeave);
            });

            // Ajouter l'onglet des paramètres
            this.addSettingTab(new SettingsTab(this.app, this));

        } catch (error) {
            console.error('[PluginFlowz] Erreur lors du chargement:', error);
            new Notice(this.translations.t('notices.error'));
        }
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }

    private async loadApp(): Promise<void> {
        return new Promise((resolve) => {
            if (!this.app.workspace) {
                setTimeout(() => this.loadApp().then(resolve), 100);
            } else {
                resolve();
            }
        });
    }

    private loadLanguage(): void {
        try {
            const locale = document.documentElement.lang?.toLowerCase().startsWith('fr') ? 'fr' : 'en';
            console.log('Langue détectée:', locale);
            this.translations.setLanguage(locale);
        } catch (error) {
            console.warn('Erreur lors de la détection de la langue, utilisation du français par défaut');
            this.translations.setLanguage('fr');
        }
    }

    onunload() {
        // Détacher les vues
        this.app.workspace.detachLeavesOfType(VIEW_TYPE_PLUGINFLOWZ);

        // Nettoyer les commandes
        (this.app as any).commands?.removeCommands?.(this.manifest.id);
    }
}
