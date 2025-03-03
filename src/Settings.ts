import { App, Plugin, PluginSettingTab, Setting, Menu, TFolder, Notice } from 'obsidian';
<<<<<<< HEAD
import { DomainFolderMapping } from './types';
import { Translations } from './Translations';
import { ViewMode } from './ViewMode';
=======
import { testYtdl, downloadVideo } from './ytdl';
>>>>>>> d4f16a55177a16b17f571965d9669ea066967ee4

export interface TestWhisperSettings {
    apiKey: string;
    apiEndpoint: string;
    provider: string;
    downloadFolder: string;
    defaultSegmentId?: string;
    defaultFromName?: string;
    defaultFromEmail?: string;
    defaultReplyTo?: string;
    domainFolderMappings: DomainFolderMapping[];
}

export const DEFAULT_SETTINGS: TestWhisperSettings = {
    apiKey: '',
    apiEndpoint: '',
    provider: 'emailit',
    downloadFolder: 'downloads',
    defaultSegmentId: '',
    defaultFromName: '',
    defaultFromEmail: '',
    defaultReplyTo: '',
    domainFolderMappings: []
};

export class Settings {
    private static plugin: Plugin;
    private static settings: TestWhisperSettings;

    static initialize(plugin: Plugin) {
        this.plugin = plugin;
    }

    static async loadSettings(): Promise<TestWhisperSettings> {
        const savedData = await this.plugin.loadData();
        this.settings = Object.assign({}, DEFAULT_SETTINGS, savedData || {});
        return this.settings;
    }

    static async saveSettings(settings: Partial<TestWhisperSettings>) {
        this.settings = Object.assign(this.settings || DEFAULT_SETTINGS, settings);
        await this.plugin.saveData(this.settings);
    }
}

export class TestWhisperSettingTab extends PluginSettingTab {
    plugin: Plugin;
<<<<<<< HEAD
    settings: MailingFlowzSettings;
    translations: Translations;
    domains: string[];

    constructor(app: App, plugin: Plugin, settings: MailingFlowzSettings, viewMode: ViewMode, translations: Translations) {
=======
    settings: TestWhisperSettings;

    constructor(app: App, plugin: Plugin, settings: TestWhisperSettings) {
>>>>>>> d4f16a55177a16b17f571965d9669ea066967ee4
        super(app, plugin);
        this.plugin = plugin;
        this.settings = settings;
        this.translations = translations;
        // Initialiser les domaines disponibles à partir de apiEndpoint
        this.domains = [this.settings.apiEndpoint.replace('https://', '')].filter(Boolean);
    }

    display(): void {
        const { containerEl } = this;
        containerEl.empty();

        containerEl.createEl('h2', { text: 'Test YouTube Download' });

        // Ajout d'un bouton de test
        new Setting(containerEl)
            .setName('Test YouTube Download')
            .setDesc('Tester le téléchargement d\'une vidéo YouTube')
            .addButton(button => button
                .setButtonText('Tester')
                .onClick(async () => {
                    try {
                        const result = await testYtdl();
                        if (result) {
                            new Notice('Test réussi ! Vérifiez la console pour plus de détails');
                        } else {
                            new Notice('Échec du test. Vérifiez la console pour les erreurs');
                        }
                    } catch (error) {
                        console.error('Erreur lors du test:', error);
                        new Notice('Erreur lors du test. Vérifiez la console');
                    }
                }));

        // Ajout d'un bouton de téléchargement
        new Setting(containerEl)
            .setName('Tester le téléchargement')
            .setDesc('Télécharger une vidéo YouTube')
            .addButton(button => button
                .setButtonText('Télécharger')
                .onClick(async () => {
                    try {
                        const filePath = await downloadVideo('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
                        new Notice(`Vidéo téléchargée : ${filePath}`);
                    } catch (error) {
                        console.error('Erreur lors du téléchargement:', error);
                        new Notice('Erreur lors du téléchargement');
                    }
                }));

        containerEl.createEl('h2', { text: 'Configuration MailingFlowz' });

        new Setting(containerEl)
            .setName('Dossier de téléchargement')
            .setDesc('Choisissez le dossier où seront stockées les vidéos')
            .addText(text => {
                text.inputEl.style.width = '200px';
                return text
                    .setValue(this.settings.downloadFolder || 'Aucun dossier sélectionné')
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

        containerEl.createEl('p', {
            text: 'Vous pouvez trouver votre clé API dans les paramètres de votre compte.'
        });

        new Setting(containerEl)
            .setName('Domaine d\'envoi principal')
            .setDesc('Entrez le domaine principal pour vos envois d\'emails (exemple: mail.mondomaine.com)')
            .addText(text => text
                .setPlaceholder('mail.mondomaine.com')
                .setValue(this.settings.apiEndpoint.replace('https://', ''))
                .onChange(async (value) => {
                    const fullUrl = value ? `https://${value}` : '';
                    this.settings.apiEndpoint = fullUrl;
                    // Mise à jour des domaines disponibles
                    this.domains = [value].filter(Boolean);
                    await Settings.saveSettings({ apiEndpoint: fullUrl });
                }));

        // Section Mappages Domaine-Dossier
        containerEl.createEl('h3', { text: 'Configuration des sous-domaines' });
        
        const descriptionLine = new Setting(containerEl)
            .setName('Sous-domaines d\'envoi')
            .setDesc('Associez chaque sous-domaine à un dossier spécifique pour organiser vos emails')
            .addButton(button => button
                .setIcon('plus')
                .setButtonText('Ajouter un sous-domaine')
                .setCta()
                .onClick(async () => {
                    if (!this.settings.emailsFolder) {
                        new Notice('Veuillez d\'abord sélectionner un dossier principal');
                        return;
                    }
                    if (!this.domains.length) {
                        new Notice('Veuillez d\'abord configurer un domaine principal');
                        return;
                    }
                    this.settings.domainFolderMappings.push({
                        domain: this.domains[0],
                        folder: ''
                    });
                    await Settings.saveSettings({ domainFolderMappings: this.settings.domainFolderMappings });
                    this.display();
                }));

        descriptionLine.settingEl.addClass('description-with-button');

        // Conteneur pour les mappages existants
        const mappingsContainer = containerEl.createEl('div');
        
        // Fonction pour créer un nouveau mapping
        const createMappingElement = (mapping: DomainFolderMapping, index: number) => {
            const mappingDiv = mappingsContainer.createEl('div', { cls: 'mapping-container' });
            
            // Conteneur pour la ligne de mapping
            const mappingLine = new Setting(mappingDiv)
            .setClass('compact-setting')
            // Label "Domaine"
            .addText(text => {
                text.inputEl.addClass('label-text');
                text.setValue(this.translations.t('settings.domain'));
                text.setDisabled(true);
                return text;
            })
            // Dropdown des domaines
            .addDropdown(dropdown => {
                this.domains.forEach(domain => {
                    dropdown.addOption(domain, domain);
                });
                dropdown.setValue(mapping.domain);
                dropdown.onChange(value => {
                    this.settings.domainFolderMappings[index].domain = value;
                });
                dropdown.selectEl.addClass('domain-dropdown');
                return dropdown;
            })
            // Champ de saisie du dossier avec son label
            .addButton(button => button
                .setButtonText(mapping.folder || this.translations.t('settings.folder'))
                .onClick((e: MouseEvent) => {
                    // Créer le menu de sélection principal
                    const menu = new Menu();
                    
                    // Construire la hiérarchie des dossiers à partir de la racine
                    this.buildFolderMenu(menu, this.app.vault.getRoot(), index);

                    // Afficher le menu à la position du clic
                    menu.showAtMouseEvent(e);
                }))
            // Boutons d'action
            .addButton(button => button
                .setIcon('checkmark')
                .setTooltip(this.translations.t('settings.save'))
                .setCta()
                .onClick(async () => {
                    await Settings.saveSettings({ domainFolderMappings: this.settings.domainFolderMappings });
                    new Notice(this.translations.t('notices.saved'));
                }))
            .addButton(button => button
                .setIcon('trash')
                .setTooltip(this.translations.t('settings.remove'))
                .onClick(async () => {
                    this.settings.domainFolderMappings.splice(index, 1);
                    await Settings.saveSettings({ domainFolderMappings: this.settings.domainFolderMappings });
                    new Notice(this.translations.t('notices.saved'));
                    this.display();
                }));

            // Ajouter des styles pour aligner les éléments
            mappingLine.settingEl.addClass('mapping-line');
        };

        // Afficher les mappages existants
        this.settings.domainFolderMappings.forEach((mapping, index) => {
            createMappingElement(mapping, index);
        });

        // Section Mode d'affichage
        containerEl.createEl('h2', { text: this.translations.t('settings.viewMode') });

        new Setting(containerEl)
            .setName(this.translations.t('settings.defaultViewMode'))
            .setDesc(this.translations.t('settings.defaultViewModeDesc'))
            .addDropdown(dropdown => dropdown
            .addOption('tab', this.translations.t('settings.tab'))
            .addOption('sidebar', this.translations.t('settings.sidebar'))
            .addOption('overlay', this.translations.t('settings.overlay'))
            .setValue(this.settings.viewMode)
            .onChange(async (value: 'tab' | 'sidebar' | 'overlay') => {
                this.settings.viewMode = value;
                await Settings.saveSettings({ viewMode: value });
                new Notice(this.translations.t('notices.saved'));
            }));
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
                        this.settings.downloadFolder = subFolder.path;
                        await Settings.saveSettings({ downloadFolder: subFolder.path });
                        this.display();
                    });
                });
            } else {
                // Pour les dossiers sans enfants, ajouter simplement un élément de menu
                menu.addItem(item => {
                    item.setTitle(subFolder.name)
                        .setIcon('folder')
                        .onClick(async () => {
                            this.settings.downloadFolder = subFolder.path;
                            await Settings.saveSettings({ downloadFolder: subFolder.path });
                            this.display();
                        });
                });
            }
        });
    }
}