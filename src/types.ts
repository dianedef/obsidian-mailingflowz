export type TViewMode = 'tab' | 'sidebar' | 'overlay';

export interface MailingFlowzState {
    mode: TViewMode;
    leafId: string | null;
} 