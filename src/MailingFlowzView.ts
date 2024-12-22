import { ItemView, WorkspaceLeaf } from 'obsidian';
import { MailingFlowzState } from './types';

export const TEST_WHISPER_VIEW_TYPE = 'test-whisper-view';

export class TestWhisperView extends ItemView {
    constructor(leaf: WorkspaceLeaf) {
        super(leaf);
    }

    getViewType(): string {
        return TEST_WHISPER_VIEW_TYPE;
    }

    getDisplayText(): string {
        return 'Test Whisper';
    }

    async onOpen() {
        const container = this.containerEl.children[1];
        container.empty();
        container.createEl('h4', { text: 'Test Whisper' });
        // Ici nous ajouterons plus tard l'interface de création de newsletter
    }

    async setState(state: TestWhisperState, result: any) {
        await super.setState(state, result);
        // Gérer l'état de la vue
    }
} 