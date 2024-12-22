export class Tag {
    public container: HTMLElement;

    constructor(
        container: HTMLElement,
        private text: string,
        private onClick?: () => void,
        private className?: string
    ) {
        this.container = container.createEl('span', {
            cls: 'pluginflowz-tag',
            text: this.text
        });
        if (className) {
            className.split(' ').forEach(cls => {
                if (cls) this.container.addClass(cls);
            });
        }
        this.render();
    }

    private render() {
        if (this.onClick) {
            this.container.addEventListener('click', this.onClick);
        }
    }

    public setText(text: string) {
        this.text = text;
        this.container.textContent = text;
    }

    public getText(): string {
        return this.text;
    }
}