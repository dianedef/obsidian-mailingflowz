import { ItemView, WorkspaceLeaf } from 'obsidian';
import { MailingFlowzState } from './types';

export const MAILINGFLOWZ_VIEW_TYPE = 'mailingflowz-view';

export class MailingFlowzView extends ItemView {
    constructor(leaf: WorkspaceLeaf) {
        super(leaf);
    }

    getViewType(): string {
        return MAILINGFLOWZ_VIEW_TYPE;
    }

    getDisplayText(): string {
        return 'MailingFlowz';
    }

    getIcon(): string {
        return 'mail';
    }

    async onOpen() {
        const container = this.containerEl.children[1];
        container.empty();
        container.createEl('h4', { text: 'MailingFlowz Newsletter' });
        // Ici nous ajouterons plus tard l'interface de création de newsletter
    }

    async setState(state: MailingFlowzState, result: any) {
        await super.setState(state, result);
        // Gérer l'état de la vue
    }
} 