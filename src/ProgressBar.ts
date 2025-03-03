import { Notice } from 'obsidian';

export class ProgressBar {
    private container: HTMLElement;
    private bar: HTMLElement;
    private text: HTMLElement;
    private cancelButton: HTMLElement;
    private onCancel?: () => void;

    constructor() {
        // Créer les éléments
        this.container = document.createElement('div');
        this.container.addClass('progress-bar-container');
        
        const progressWrapper = this.container.createDiv('progress-wrapper');
        this.bar = progressWrapper.createDiv('progress-bar');
        this.text = progressWrapper.createDiv('progress-text');

        // Bouton d'annulation
        this.cancelButton = this.container.createEl('button', {
            cls: 'progress-cancel-button',
            text: '✕'
        });
        
        this.cancelButton.addEventListener('click', () => {
            if (this.onCancel) this.onCancel();
        });

        // Styles
        document.body.appendChild(this.container);
    }

    public setProgress(progress: number) {
        this.bar.style.width = `${progress}%`;
        this.text.textContent = `${progress.toFixed(1)}%`;
    }

    public show(onCancel?: () => void) {
        this.onCancel = onCancel;
        this.container.style.display = 'flex';
    }

    public hide() {
        this.container.style.display = 'none';
    }
} 