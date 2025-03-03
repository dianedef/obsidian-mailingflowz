import { Plugin, WorkspaceLeaf, Modal, Notice, Setting, Component, HTMLElement } from 'obsidian';
import { TViewMode, IPlugin } from './types';
import { Settings } from './Settings';
import { Dashboard, DashboardView } from './Dashboard';
import { Translations } from './Translations';

export class ViewMode extends Component {
   private currentView: Dashboard | DashboardView | null = null;
   private currentMode: TViewMode | null = null;
   private activeLeaf: WorkspaceLeaf | null = null;
   private leafId: string | null = null;
   private translations: Translations;

   constructor(private plugin: Plugin) {
      super();
      this.translations = new Translations();
      // Initialiser les modes depuis les settings
      Settings.loadSettings().then(settings => {
         this.currentMode = settings.currentMode;
      });
      // Nettoyer les anciennes leafs au démarrage
      this.closeCurrentView();
   }

   private async closeCurrentView() {
      // Fermer la vue actuelle si elle existe
      if (this.currentView) {
         // Si c'est une leaf, la détacher
         if (this.activeLeaf) {
            this.activeLeaf.detach();
         }
         
         // Fermer toutes les autres vues existantes
         const leaves = this.plugin.app.workspace.getLeavesOfType('pluginflowz-view');
         leaves.forEach(leaf => {
            if (leaf.view instanceof DashboardView) {
               leaf.detach();
            }
         });

         this.currentView = null;
         this.activeLeaf = null;
         this.leafId = null;
      }
   }

   async setView(mode: TViewMode) {
      // Si on est déjà dans le bon mode et que ce n'est pas un popup, ne rien faire
      if (mode === this.currentMode && this.currentView && mode !== 'popup') {
         return;
      }

      // Fermer la vue actuelle et toutes les autres vues existantes
      await this.closeCurrentView();

      const workspace = this.plugin.app.workspace;

      // Gérer le mode popup séparément car il n'utilise pas de leaf
      if (mode === 'popup') {
         const modal = new Modal(this.plugin.app);
         modal.titleEl.setText(this.translations.t('dashboard.title'));
         modal.containerEl.addClass('pluginflowz-modal');

         // Créer le conteneur pour le dashboard dans la modale
         const contentEl = modal.contentEl.createDiv('pluginflowz-content');

         // Créer une instance du Dashboard en mode popup
         const dashboard = new Dashboard(
            contentEl,
            Settings,
            this.translations,
            this.plugin
         );

         // Rendre le contenu
         await dashboard.renderContent(contentEl);

         this.currentView = dashboard;
         this.activeLeaf = null;
         modal.open();
      } else {
         // Créer la leaf selon le mode
         let leaf: WorkspaceLeaf | null = null;
         switch (mode) {
            case 'sidebar':
               leaf = workspace.getRightLeaf(false) ?? workspace.getLeaf('split');
               break;
            case 'tab':
            default:
               leaf = workspace.getLeaf('split');
               break;
         }

         if (leaf) {
            await leaf.setViewState({
               type: 'pluginflowz-view',
               active: true,
               state: { 
                  mode: mode,
                  leafId: this.leafId
               }
            });

            this.currentView = leaf.view as DashboardView;
            this.activeLeaf = leaf;
            this.plugin.app.workspace.revealLeaf(leaf);
         }
      }

      this.currentMode = mode;
      await Settings.saveSettings({ currentMode: mode });
   }

   getActiveLeaf(): WorkspaceLeaf | null {
      return this.activeLeaf;
   }

   getCurrentLeafId(): string | null {
      return this.leafId;
   }
}