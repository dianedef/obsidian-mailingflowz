import { App, Plugin, PluginSettingTab, Setting, Menu, TFolder } from 'obsidian';

export interface MailingFlowzSettings {
    apiKey: string;
    apiEndpoint: string;
    provider: string;
    emailsFolder: string;
    defaultSegmentId?: string;
    defaultFromName?: string;
    defaultFromEmail?: string;
    defaultReplyTo?: string;
}

export const DEFAULT_SETTINGS: MailingFlowzSettings = {
    apiKey: '',
    apiEndpoint: '',
    provider: 'emailit',
    emailsFolder: '',
    defaultSegmentId: '',
    defaultFromName: '',
    defaultFromEmail: '',
    defaultReplyTo: ''
};

export class Settings {
    private static plugin: Plugin;
    private static settings: MailingFlowzSettings;

    static initialize(plugin: Plugin) {
        this.plugin = plugin;
    }

    static async loadSettings(): Promise<MailingFlowzSettings> {
        const savedData = await this.plugin.loadData();
        this.settings = Object.assign({}, DEFAULT_SETTINGS, savedData || {});
        return this.settings;
    }

    static async saveSettings(settings: Partial<MailingFlowzSettings>) {
        this.settings = Object.assign(this.settings || DEFAULT_SETTINGS, settings);
        await this.plugin.saveData(this.settings);
    }
}

export class MailingFlowzSettingTab extends PluginSettingTab {
    plugin: Plugin;
    settings: MailingFlowzSettings;

    constructor(app: App, plugin: Plugin, settings: MailingFlowzSettings) {
        super(app, plugin);
        this.plugin = plugin;
        this.settings = settings;
    }

    display(): void {
        const { containerEl } = this;
        containerEl.empty();

        containerEl.createEl('h2', { text: 'Configuration MailingFlowz' });

        new Setting(containerEl)
            .setName('Dossier des emails')
            .setDesc('Choisissez le dossier où seront stockés vos emails')
            .addText(text => {
                text.inputEl.style.width = '200px';
                return text
                    .setValue(this.settings.emailsFolder || 'Aucun dossier sélectionné')
                    .setDisabled(true);
            })
            .addButton(button => {
                button.buttonEl.style.marginLeft = '10px';
                return button
                    .setIcon('folder')
                    .setButtonText('Sélectionner un dossier')
                    .onClick((e: MouseEvent) => {
                        // Créer le menu de sélection principal
                        const menu = new Menu();
                        
                        // Construire la hiérarchie des dossiers à partir de la racine
                        this.buildFolderMenu(menu, this.app.vault.getRoot());

                        // Afficher le menu à la position du clic
                        menu.showAtMouseEvent(e);
                    });
            });

        new Setting(containerEl)
            .setName('Service d\'emailing')
            .setDesc('Choisissez votre service d\'emailing')
            .addDropdown(dropdown => dropdown
                .addOption('emailit', 'Emailit')
                // On pourra ajouter d'autres services ici
                .setValue(this.settings.provider)
                .onChange(async (value) => {
                    this.settings.provider = value;
                    await Settings.saveSettings({ provider: value });
                    // Recharger la page pour mettre à jour les champs spécifiques au provider
                    this.display();
                }));

        new Setting(containerEl)
            .setName('Clé API')
            .setDesc('Entrez votre clé API')
            .addText(text => text
                .setPlaceholder('Votre clé API')
                .setValue(this.settings.apiKey)
                .onChange(async (value) => {
                    this.settings.apiKey = value;
                    await Settings.saveSettings({ apiKey: value });
                }));

        new Setting(containerEl)
            .setName('Domaine d\'envoi')
            .setDesc('Entrez le domaine que vous utilisez pour vos envois d\'emails (exemple: mail.mondomaine.com)')
            .addText(text => text
                .setPlaceholder('mail.mondomaine.com')
                .setValue(this.settings.apiEndpoint)
                .onChange(async (value) => {
                    const fullUrl = value ? `https://${value}` : '';
                    this.settings.apiEndpoint = fullUrl;
                    await Settings.saveSettings({ apiEndpoint: fullUrl });
                }));

        containerEl.createEl('p', {
            text: 'Vous pouvez trouver votre clé API dans les paramètres de votre compte.'
        });
    }

    // Construire le menu hiérarchique des dossiers
    private buildFolderMenu(menu: Menu, folder: TFolder, level: number = 0) {
        const subFolders = folder.children.filter((child): child is TFolder => child instanceof TFolder);

        subFolders.forEach(subFolder => {
            const hasChildren = subFolder.children.some(child => child instanceof TFolder);
            
            if (hasChildren) {
                // Pour les dossiers avec des enfants, créer un sous-menu
                menu.addItem(item => {
                    const titleEl = createSpan({ cls: 'menu-item-title' });
                    titleEl.appendText(subFolder.name);
                    titleEl.appendChild(createSpan({ cls: 'menu-item-arrow', text: ' →' }));

                    item.dom.querySelector('.menu-item-title')?.replaceWith(titleEl);
                    item.setIcon('folder');

                    // Créer le sous-menu
                    const subMenu = new Menu();
                    this.buildFolderMenu(subMenu, subFolder, level + 1);

                    // Configurer l'événement de survol
                    const itemDom = (item as any).dom as HTMLElement;
                    if (itemDom) {
                        let isOverItem = false;
                        let isOverMenu = false;
                        let hideTimeout: NodeJS.Timeout;

                        const showSubMenu = () => {
                            const rect = itemDom.getBoundingClientRect();
                            subMenu.showAtPosition({
                                x: rect.right,
                                y: rect.top
                            });
                        };

                        const hideSubMenu = () => {
                            hideTimeout = setTimeout(() => {
                                if (!isOverItem && !isOverMenu) {
                                    subMenu.hide();
                                }
                            }, 100);
                        };

                        itemDom.addEventListener('mouseenter', () => {
                            isOverItem = true;
                            if (hideTimeout) clearTimeout(hideTimeout);
                            showSubMenu();
                        });

                        itemDom.addEventListener('mouseleave', () => {
                            isOverItem = false;
                            hideSubMenu();
                        });

                        // Gérer le survol du sous-menu lui-même
                        const subMenuEl = (subMenu as any).dom;
                        if (subMenuEl) {
                            subMenuEl.addEventListener('mouseenter', () => {
                                isOverMenu = true;
                                if (hideTimeout) clearTimeout(hideTimeout);
                            });

                            subMenuEl.addEventListener('mouseleave', () => {
                                isOverMenu = false;
                                hideSubMenu();
                            });
                        }
                    }

                    // Ajouter le gestionnaire de clic pour sélectionner ce dossier
                    item.onClick(async () => {
                        this.settings.emailsFolder = subFolder.path;
                        await Settings.saveSettings({ emailsFolder: subFolder.path });
                        this.display();
                    });
                });
            } else {
                // Pour les dossiers sans enfants, ajouter simplement un élément de menu
                menu.addItem(item => {
                    item.setTitle(subFolder.name)
                        .setIcon('folder')
                        .onClick(async () => {
                            this.settings.emailsFolder = subFolder.path;
                            await Settings.saveSettings({ emailsFolder: subFolder.path });
                            this.display();
                        });
                });
            }
        });
    }
}