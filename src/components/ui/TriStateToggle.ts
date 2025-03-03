import { Component, setIcon } from 'obsidian';

export class TriStateToggle extends Component {
    private container: HTMLElement;
    private slider: HTMLElement;
    private leftPos: HTMLElement;
    private middlePos: HTMLElement;
    private rightPos: HTMLElement;

    constructor(
        containerEl: HTMLElement,
        private onChange?: (state: 'left' | 'middle' | 'right') => void
    ) {
        super();
        this.container = containerEl.createDiv('tri-state-toggle');
        this.createToggle();
    }

    private createToggle() {
        this.slider = this.container.createDiv('tri-state-slider');
        
        // Position gauche (désactivé)
        this.leftPos = this.container.createDiv('tri-state-position left');
        const leftIcon = this.leftPos.createDiv('tri-state-icon');
        setIcon(leftIcon, 'x-circle');
        
        // Position milieu (mixte)
        this.middlePos = this.container.createDiv('tri-state-position middle');
        const middleIcon = this.middlePos.createDiv('tri-state-icon');
        setIcon(middleIcon, 'minus-circle');
        
        // Position droite (activé)
        this.rightPos = this.container.createDiv('tri-state-position right');
        const rightIcon = this.rightPos.createDiv('tri-state-icon');
        setIcon(rightIcon, 'check-circle');

        // Événements
        this.registerDomEvent(this.leftPos, 'click', () => {
            this.setState('left');
            this.onChange?.('left');
        });

        this.registerDomEvent(this.middlePos, 'click', () => {
            this.setState('middle');
            this.onChange?.('middle');
        });

        this.registerDomEvent(this.rightPos, 'click', () => {
            this.setState('right');
            this.onChange?.('right');
        });
    }

    setState(state: 'left' | 'middle' | 'right') {
        this.slider.removeClass('left', 'middle', 'right');
        this.slider.addClass(state);
    }

    getState(): 'left' | 'middle' | 'right' {
        if (this.slider.hasClass('left')) return 'left';
        if (this.slider.hasClass('right')) return 'right';
        return 'middle';
    }
} 