export type TViewMode = 'tab' | 'sidebar' | 'overlay';

export interface DomainFolderMapping {
    domain: string;
    folder: string;
}

export interface MailingFlowzState {
    mode: TViewMode;
    leafId: string | null;
} 