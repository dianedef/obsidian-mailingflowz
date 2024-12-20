import { Plugin, Notice } from 'obsidian';
import { Settings } from './Settings';
import { Translations } from './Translations';

export class Hotkeys {
   constructor(
      private plugin: Plugin,
      private settings: Settings,
      private translations: Translations
   ) {}

   registerHotkeys() {
      // Commande 1: Afficher une notification simple
      this.plugin.addCommand({
         id: 'boilerplate-test-notice',
         name: 'Afficher une notification test',
         callback: () => {
            new Notice('Test de notification !');
         },
         hotkeys: [{ modifiers: ["Shift"], key: " " }]
      });

      // Commande 2: Afficher l'heure actuelle
      this.plugin.addCommand({
         id: 'boilerplate-show-time',
         name: 'Afficher l\'heure actuelle',
         callback: () => {
            const now = new Date();
            new Notice(`Il est ${now.toLocaleTimeString()}`);
         },
         hotkeys: [{ modifiers: ["Ctrl"], key: "t" }]
      });

      // Commande 3: Afficher un message aléatoire
      this.plugin.addCommand({
         id: 'boilerplate-random-message',
         name: 'Message aléatoire',
         callback: () => {
            const messages = [
               'Bonjour !',
               'Comment ça va ?',
               'Belle journée !',
               'Au travail !',
               'Pause café ?'
            ];
            const randomMessage = messages[Math.floor(Math.random() * messages.length)];
            new Notice(randomMessage);
         },
         hotkeys: [{ modifiers: ["Ctrl", "Shift"], key: "m" }]
      });
   }
}
