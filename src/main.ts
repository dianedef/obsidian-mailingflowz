import { Plugin, Menu } from 'obsidian';
import { ViewPlugin, ViewUpdate, DecorationSet } from '@codemirror/view';
import { ViewMode } from './ViewMode';
import { TViewMode } from './types';
import { registerStyles } from './RegisterStyles';
import { Settings, MailingFlowzSettingTab, DEFAULT_SETTINGS } from './settings';
import { MailingFlowzView, MAILINGFLOWZ_VIEW_TYPE } from './MailingFlowzView';
import { Translations } from './Translations';
import { Hotkeys } from './Hotkeys';

interface DecorationState {
    decorations: DecorationSet;
    settings: any;
    viewMode: ViewMode;
    update(update: ViewUpdate): void;
}

export default class MailingFlowzPlugin extends Plugin {
    private viewMode!: ViewMode;
    settings!: Settings;
    private translations: Translations = new Translations();
    private hotkeys!: Hotkeys;

    async refresh() {
        this.app.workspace.detachLeavesOfType(MAILINGFLOWZ_VIEW_TYPE);
        this.settings = await Settings.loadSettings();
        this.viewMode = new ViewMode(this);
        
        this.registerView(
            MAILINGFLOWZ_VIEW_TYPE,
            (leaf) => new MailingFlowzView(leaf)
        );
    }

    async onload() {
        await this.loadApp();
        Settings.initialize(this);
        const settings = await Settings.loadSettings();
        this.settings = settings;
        this.viewMode = new ViewMode(this);
        this.loadLanguage();

        // Initialisation des hotkeys
        this.hotkeys = new Hotkeys(this, this.settings, this.translations);
        this.hotkeys.registerHotkeys();

        this.addSettingTab(new MailingFlowzSettingTab(
            this.app,
            this,
            settings,
            this.viewMode,
            this.translations
        ));

        this.registerView(
            MAILINGFLOWZ_VIEW_TYPE,
            (leaf) => new MailingFlowzView(leaf)
        );

        // Création du menu
        const ribbonIcon = this.addRibbonIcon('mail', 'MailingFlowz', () => {});

        ribbonIcon.addEventListener('mouseenter', () => {
            const menu = new Menu();
            const createMenuItem = (title: string, icon: string, mode: TViewMode) => {
                menu.addItem((item) => {
                    item.setTitle(this.translations.t(`menu.${title}`))
                        .setIcon(icon)
                        .onClick(async () => {
                            await this.viewMode.setView(mode);
                        });
                });
            };

            createMenuItem("tabView", "tab", "tab");
            createMenuItem("sidebarView", "layout-sidebar-right", "sidebar");
            createMenuItem("overlayView", "layout-top", "overlay");

            const iconRect = ribbonIcon.getBoundingClientRect();
            menu.showAtPosition({ 
                x: iconRect.left, 
                y: iconRect.top - 10
            });

            const handleMouseLeave = (e: MouseEvent) => {
                const target = e.relatedTarget as Node;
                const menuDom = (menu as any).dom;
                const isOverIcon = ribbonIcon.contains(target);
                const isOverMenu = menuDom && menuDom.contains(target);
                
                if (!isOverIcon && !isOverMenu) {
                    menu.hide();
                    ribbonIcon.removeEventListener('mouseleave', handleMouseLeave);
                    if (menuDom) {
                        menuDom.removeEventListener('mouseleave', handleMouseLeave);
                    }
                }
            };

            ribbonIcon.addEventListener('mouseleave', handleMouseLeave);
            const menuDom = (menu as any).dom;
            if (menuDom) {
                menuDom.addEventListener('mouseleave', handleMouseLeave);
            }
        });

        registerStyles();
    }

    private async loadApp(): Promise<void> {
        return new Promise((resolve) => {
            if (this.app.workspace) {
                resolve();
            } else {
                this.app.workspace.onLayoutReady(() => resolve());
            }
        });
    }

    private loadLanguage(): void {
        const locale = document.documentElement.lang?.toLowerCase().startsWith('fr') ? 'fr' : 'en';
        this.translations.setLanguage(locale);
    }

    onunload() {
        this.app.workspace.detachLeavesOfType(MAILINGFLOWZ_VIEW_TYPE);
    }
}