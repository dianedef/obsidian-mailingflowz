import { Plugin, WorkspaceLeaf } from 'obsidian';
import { TViewMode } from './types';
import { Settings } from './settings';
import { TestWhisperView, TEST_WHISPER_VIEW_TYPE } from './MailingFlowzView';

export class ViewMode {
    private currentView: MailingFlowzView | null = null;
    private currentMode: TViewMode | null = null;
    private activeLeaf: WorkspaceLeaf | null = null;
    private leafId: string | null = null;

    constructor(private plugin: Plugin) {
        Settings.loadSettings().then(settings => {
            // Pour l'instant on ne charge pas le mode depuis les settings
            this.currentMode = 'tab';
        });
        this.closeCurrentView();
    }

    private async closeCurrentView() {
        if (this.currentView) {
            const leaves = this.plugin.app.workspace.getLeavesOfType(TEST_WHISPER_VIEW_TYPE);
            leaves.forEach(leaf => {
                if (leaf.view instanceof TestWhisperView) {
                    leaf.detach();
                }
            });
            this.currentView = null;
            this.activeLeaf = null;
            this.leafId = null;
        }
    }

    private getLeafForMode(mode: TViewMode): WorkspaceLeaf {
        const workspace = this.plugin.app.workspace;
        
        const existingLeaves = workspace.getLeavesOfType(TEST_WHISPER_VIEW_TYPE);
        existingLeaves.forEach(leaf => {
            if (leaf.view instanceof TestWhisperView) {
                leaf.detach();
            }
        });
        
        let leaf: WorkspaceLeaf;
        switch (mode) {
            case 'sidebar':
                leaf = workspace.getRightLeaf(false) ?? workspace.getLeaf('split');
                break;
            case 'overlay':
                const activeLeaf = workspace.getMostRecentLeaf() ?? workspace.getLeaf('split');
                leaf = workspace.createLeafBySplit(activeLeaf, 'horizontal', true);
                break;
            case 'tab':
            default:
                leaf = workspace.getLeaf('split');
                break;
        }

        return leaf;
    }

    async setView(mode: TViewMode) {
        if (mode === this.currentMode && this.currentView && this.activeLeaf) {
            return;
        }

        await this.closeCurrentView();

        const leaf = this.getLeafForMode(mode);
        await leaf.setViewState({
            type: TEST_WHISPER_VIEW_TYPE,
            active: true,
            state: { 
                mode: mode,
                leafId: this.leafId
            }
        });

        this.currentMode = mode;
        this.currentView = leaf.view as TestWhisperView;
        this.activeLeaf = leaf;
        this.plugin.app.workspace.revealLeaf(leaf);
    }

    getActiveLeaf(): WorkspaceLeaf | null {
        return this.activeLeaf;
    }

    getCurrentLeafId(): string | null {
        return this.leafId;
    }
} 