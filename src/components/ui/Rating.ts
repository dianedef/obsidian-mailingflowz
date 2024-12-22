import { Settings } from '../../Settings';

export class Rating {
    private container: HTMLElement;
    private progressBar: HTMLElement;
    private valueText: HTMLElement;

    constructor(
        container: HTMLElement,
        private value: number,
        private maxValue: number = 5,
        private onChange?: (value: number) => void
    ) {
        this.container = container.createDiv('pluginflowz-card-rating');
        this.render();
    }

    private render() {
        // Star icon
        const ratingText = this.container.createEl('span', {
            text: '⭐ ',
            cls: 'pluginflowz-rating-text'
        });

        // Quick set to 0
        ratingText.style.cursor = 'pointer';
        ratingText.addEventListener('click', () => this.setValue(0));

        // Progress bar
        const progressContainer = this.container.createDiv('progress-container');
        this.progressBar = progressContainer.createDiv('progress-bar');

        // Value text - créé avant updateProgressBar
        this.valueText = this.container.createEl('span', {
            text: `${this.value}/${this.maxValue}`,
            cls: 'pluginflowz-rating-value'
        });

        // Quick set to max
        this.valueText.style.cursor = 'pointer';
        this.valueText.addEventListener('click', () => this.setValue(this.maxValue));

        // Mettre à jour la barre de progression après avoir créé valueText
        this.updateProgressBar();

        // Interactive progress bar
        this.setupProgressBarInteraction(progressContainer);
    }

    private setupProgressBarInteraction(container: HTMLElement) {
        const updateFromMouseEvent = (e: MouseEvent) => {
            const rect = container.getBoundingClientRect();
            const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
            const newValue = Math.round((x / rect.width) * this.maxValue);
            this.setValue(newValue);
        };

        container.addEventListener('mousemove', (e) => {
            if (e.buttons === 1) {
                updateFromMouseEvent(e);
            }
            // Tooltip
            const rect = container.getBoundingClientRect();
            const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
            const hoverValue = Math.round((x / rect.width) * this.maxValue);
            container.setAttribute('title', `${hoverValue}/${this.maxValue}`);
        });

        container.addEventListener('click', updateFromMouseEvent);
    }

    private updateProgressBar() {
        this.progressBar.style.width = `${(this.value / this.maxValue) * 100}%`;
        this.valueText.textContent = `${this.value}/${this.maxValue}`;
    }

    public setValue(value: number) {
        this.value = Math.max(0, Math.min(this.maxValue, value));
        this.updateProgressBar();
        this.onChange?.(this.value);
    }

    public getValue(): number {
        return this.value;
    }
} 