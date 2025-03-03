import { App, Plugin, PluginSettingTab, Setting } from 'obsidian';
import { Settings, DEFAULT_SETTINGS } from './Settings';

export class SettingsTab extends PluginSettingTab {
    plugin: Plugin;

    constructor(app: App, plugin: Plugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;
        containerEl.empty();

        new Setting(containerEl)
            .setName('Notes Folder')
            .setDesc('Dossier où seront stockées les notes des plugins')
            .addText(text => text
                .setPlaceholder('Plugins')
                .setValue(DEFAULT_SETTINGS.notesFolder)
                .onChange(async (value) => {
                    await Settings.saveSettings({
                        notesFolder: value
                    });
                }));

        new Setting(containerEl)
            .setName('Template')
            .setDesc('Template pour les notes de plugins')
            .addTextArea(text => text
                .setPlaceholder('Template pour les notes de plugins')
                .setValue(DEFAULT_SETTINGS.template)
                .onChange(async (value) => {
                    await Settings.saveSettings({
                        template: value
                    });
                }));

        new Setting(containerEl)
            .setName('Auto Update')
            .setDesc('Mettre à jour automatiquement les notes')
            .addToggle(toggle => toggle
                .setValue(DEFAULT_SETTINGS.enableAutoUpdate)
                .onChange(async (value) => {
                    await Settings.saveSettings({
                        enableAutoUpdate: value
                    });
                }));
    }
} 