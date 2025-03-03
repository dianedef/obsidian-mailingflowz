export type TViewMode = 'tab' | 'sidebar' | 'popup';
export type TDashboardView = 'list' | 'cards';

export interface ISettings {
    currentMode: TViewMode
    activeLeafId: string | null
    plugins: IPlugin[]
    groups: string[]
    selectedStatuses?: TPluginStatus[]
}

export interface DefaultSettings {
   language: string;
   currentMode: TViewMode;
   activeLeafId: string | null;
   defaultViewMode: 'list' | 'cards';
} 