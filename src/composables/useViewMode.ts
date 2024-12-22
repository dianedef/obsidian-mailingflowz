import { ref } from 'vue'
import { Plugin, WorkspaceLeaf } from 'obsidian'
import type { TViewMode } from '../types'
import { Settings } from '../Settings'
import { createApp } from 'vue'
import Dashboard from '../components/Dashboard.vue'
import { pinia } from '../stores'
import { VIEW_TYPE_PLUGINFLOWZ } from '../constants'

class CustomModal {
    public vueApp: ReturnType<typeof createApp> | null = null;
    public container: HTMLDivElement;
    public modalContent: HTMLDivElement;
    private app: Plugin['app'];

    constructor(plugin: Plugin) {
        this.app = plugin.app;
        
        // Créer le conteneur modal
        this.container = document.createElement('div');
        this.container.addClass('modal-container');
        this.container.addClass('pluginflowz-modal');
        this.container.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        `;

        // Créer le contenu modal
        this.modalContent = document.createElement('div');
        this.modalContent.addClass('modal-content');
        this.modalContent.style.cssText = `
            background: var(--background-primary);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 8px;
            padding: 20px;
            width: 90%;
            max-width: 1200px;
            height: 90vh;
            max-height: 90vh;
            overflow-y: auto;
            position: relative;
            box-shadow: 0 0 15px rgba(0, 0, 0, 0.3);
            display: flex;
            flex-direction: column;
        `;

        // Ajouter une barre de titre
        const titleBar = document.createElement('div');
        titleBar.addClass('modal-title-bar');
        titleBar.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding-bottom: 20px;
            margin-bottom: 20px;
            border-bottom: 1px solid var(--background-modifier-border);
        `;

        const title = document.createElement('h2');
        title.textContent = 'Plugin Dashboard';
        title.style.cssText = `
            margin: 0;
            font-size: 1.5em;
            color: var(--text-normal);
        `;

        const closeButton = document.createElement('button');
        closeButton.addClass('modal-close-button');
        closeButton.innerHTML = '×';
        closeButton.style.cssText = `
            background: transparent;
            border: none;
            border-radius: 50%;
            color: var(--text-normal);
            font-size: 24px;
            cursor: pointer;
            width: 28px;
            height: 28px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: background-color 0.2s ease;
            padding: 0;
            margin: 0;
            line-height: 1;
        `;
        closeButton.addEventListener('mouseover', () => {
            closeButton.style.backgroundColor = 'var(--background-modifier-hover)';
        });
        closeButton.addEventListener('mouseout', () => {
            closeButton.style.backgroundColor = 'transparent';
        });
        closeButton.addEventListener('click', () => this.close());

        titleBar.appendChild(title);
        titleBar.appendChild(closeButton);
        this.modalContent.appendChild(titleBar);

        // Créer le conteneur pour le contenu Vue
        const vueContainer = document.createElement('div');
        vueContainer.addClass('modal-vue-container');
        vueContainer.style.cssText = `
            flex: 1;
            overflow-y: auto;
            padding-right: 10px;
            margin: 0 -10px;
            padding: 0 10px;
        `;
        this.modalContent.appendChild(vueContainer);

        this.container.appendChild(this.modalContent);

        // Gestionnaire d'événements pour Échap
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                e.stopPropagation();
                this.close();
            }
        };

        // Gestionnaire pour le clic en dehors
        this.container.addEventListener('mousedown', (e) => {
            if (e.target === this.container) {
                this.close();
            }
        });

        // Ajouter/retirer les événements
        document.addEventListener('keydown', handleKeyDown);
        this.container.addEventListener('remove', () => {
            document.removeEventListener('keydown', handleKeyDown);
        });
    }

    public open() {
        // Monter l'application Vue avec Pinia
        const app = createApp(Dashboard);
        app.use(pinia);
        this.vueApp = app;
        this.vueApp.mount(this.modalContent.querySelector('.modal-vue-container')!);

        // Ajouter la modale au DOM
        document.body.appendChild(this.container);
    }

    public close() {
        // Démonter Vue
        if (this.vueApp) {
            this.vueApp.unmount();
            this.vueApp = null;
        }

        // Retirer du DOM
        this.container.remove();

        // Restaurer le focus sur l'app
        const mainContainer = this.app.workspace.containerEl;
        if (mainContainer) {
            mainContainer.focus();
        }
    }
}

interface ViewModeState {
    plugin: Plugin | null;
    currentMode: TViewMode;
    activeLeafId: string | null;
    modal: CustomModal | null;
}

const state = ref<ViewModeState>({
    plugin: null,
    currentMode: 'tab',
    activeLeafId: null,
    modal: null
})

export function useViewMode() {
    const initializeViewMode = async (p: Plugin) => {
        if (!p) {
            throw new Error('[PluginFlowz] Plugin non fourni pour l\'initialisation du ViewMode');
        }

        state.value.plugin = p;
        
        try {
            const settings = await Settings.loadSettings();
            state.value.currentMode = settings.currentMode || 'tab';
            state.value.activeLeafId = settings.activeLeafId || null;

            // Vérifier que l'initialisation est complète
            if (!state.value.plugin || state.value.currentMode === undefined) {
                throw new Error('[PluginFlowz] ViewMode non initialisé correctement');
            }
        } catch (error) {
            console.error('[PluginFlowz] Erreur lors de l\'initialisation du ViewMode:', error);
            throw error;
        }
    }

    const setView = async (mode: TViewMode): Promise<void> => {
        if (!state.value.plugin) {
            throw new Error('[PluginFlowz] ViewMode non initialisé')
        }

        try {
            const workspace = state.value.plugin.app.workspace

            // Fermer la vue existante si elle existe
            const leaves = workspace.getLeavesOfType("pluginflowz-view")
            leaves.forEach(leaf => leaf.detach())

            // Fermer la modale si elle existe
            if (state.value.modal) {
                state.value.modal.close()
                state.value.modal = null
            }

            let leaf: WorkspaceLeaf | null = null

            // Créer la nouvelle vue selon le mode
            switch (mode) {
                case 'tab':
                    try {
                        // Essayer d'abord de créer un onglet dans la zone principale
                        leaf = workspace.getLeaf('tab')
                    } catch (error) {
                        console.warn('[PluginFlowz] Impossible de créer un onglet directement, tentative alternative...')
                        // Si ça échoue, créer un nouvel onglet à côté de l'onglet actif
                        if (workspace.activeLeaf) {
                            leaf = workspace.createLeafBySplit(workspace.activeLeaf)
                        } else {
                            // Si pas d'onglet actif, créer un nouvel onglet
                            leaf = workspace.getLeaf(true)
                        }
                    }
                    break
                    
                case 'sidebar':
                    leaf = workspace.getRightLeaf(false)
                    break
                    
                case 'popup':
                    // Créer et ouvrir la modale
                    const modal = new CustomModal(state.value.plugin)
                    state.value.modal = modal
                    modal.open()
                    break
                    
                default:
                    throw new Error(`[PluginFlowz] Mode non supporté: ${mode}`)
            }

            if (mode !== 'popup' && leaf) {
                // Définir la vue
                await leaf.setViewState({
                    type: "pluginflowz-view",
                    active: true
                })

                // Activer la vue
                workspace.revealLeaf(leaf)

                // Générer un ID unique pour la feuille si nécessaire
                const leafId = (leaf as any).id || crypto.randomUUID()
                state.value.activeLeafId = leafId
            }

            // Mettre à jour l'état
            state.value.currentMode = mode

            // Sauvegarder dans les settings
            await Settings.saveSettings({ 
                currentMode: mode,
                activeLeafId: mode === 'popup' ? null : state.value.activeLeafId
            })

        } catch (error) {
            console.error('[PluginFlowz] Erreur lors du changement de vue:', error)
            throw error
        }
    }

    const getCurrentMode = (): TViewMode => {
        return state.value.currentMode
    }

    const getActiveLeafId = (): string | null => {
        return state.value.activeLeafId
    }

    const isViewActive = (): boolean => {
        if (state.value.currentMode === 'popup') {
            return state.value.modal !== null
        }
        
        if (!state.value.plugin || !state.value.activeLeafId) return false
        
        const leaves = state.value.plugin.app.workspace.getLeavesOfType("pluginflowz-view")
        return leaves.some(leaf => (leaf as any).id === state.value.activeLeafId)
    }

    return {
        initializeViewMode,
        setView,
        getCurrentMode,
        getActiveLeafId,
        isViewActive
    }
} 