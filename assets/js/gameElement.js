"use strict";

// Счётчик для уникальных идентификаторов в шаблоне
let counter = 1;

/**
 * Класс для элементов игры
 */
export class GameElement {
    // Размер клетки в пикселях
    cellSize = 60;

    /**
     * Задаём значения для элемента
     * @param type тип элемента
     * @param x позиция по x координате
     * @param y позиция по y координате
     */
    constructor(type, x, y) {
        this.type = type;
        this.position = {x, y};
        this.id = `el${counter++}`;
        this.removed = false;
        this.new = true;
    }

    /**
     * Инициализация после вставки элемента
     * @returns {GameElement}
     */
    init() {
        this.element = document.getElementById(this.id);
        return this;
    }

    /**
     * Отобразить элемент с анимацией
     * @returns {Promise<void>}
     */
    async show() {
        const { fieldPosX, fieldPosY, element } = this;

        const keyframes = [
            {transform: `translate(${fieldPosX}px, ${fieldPosY}px) scale(0)`},
            {transform: `translate(${fieldPosX}px, ${fieldPosY}px) scale(1)`},
        ];

        await element.animate(keyframes, {duration: 500, easing: "ease"}).finishPromise();
    }

    /**
     * Генерирует шаблон элемента
     * @returns {string} html шаблон
     */
    render() {
        let {id, fieldPosX, fieldPosY, type} = this;
        //language=HTML
        return `<img src="assets/images/element${type}.svg" 
                     id="${id}" 
                     alt="element" 
                     draggable="false"
                     class="element"
                     style="transform: translate(${fieldPosX}px, ${fieldPosY}px);">`;
    }

    /**
     * Перемещение элемента с текущей позиции на переданную с анимацией
     * @param to Позиция, на которую нужно переместить элемент
     * @returns {Promise<void>}
     */
    async move(to) {
        const { fieldPosX, fieldPosY, cellSize, element } = this;
        const { x, y } = to;
        const tx = x * cellSize;
        const ty = y * cellSize;

        const duration = Math.sqrt((tx - fieldPosX) ** 2 + (ty - fieldPosY) ** 2) * 3;

        const keyframes = [
            {transform: `translate(${fieldPosX}px, ${fieldPosY}px)`},
            {transform: `translate(${tx}px, ${ty}px)`},
        ];

        await element.animate(keyframes, {duration, fill: "forwards"}).finishPromise();
        this.position = to;
    }

    /**
     * Удаление элемента из шаблона с анимацией
     * @returns {Promise<void>}
     */
    async remove() {
        const { fieldPosX, fieldPosY, element, removed } = this;

        if (removed) return;

        const keyframes = [
            {transform: `translate(${fieldPosX}px, ${fieldPosY}px) scale(1)`},
            {transform: `translate(${fieldPosX}px, ${fieldPosY}px) scale(1.5)`},
            {transform: `translate(${fieldPosX}px, ${fieldPosY}px) scale(0)`},
        ];

        await element.animate(keyframes, {duration: 300}).finishPromise();
        this.removed = true;
        element.remove();
    }

    /**
     * Выделить элемент анимацией
     */
    select() {
        const { fieldPosX, fieldPosY, element } = this;

        const keyframes = [
            {transform: `translate(${fieldPosX}px, ${fieldPosY}px) rotate(0deg)`},
            {transform: `translate(${fieldPosX}px, ${fieldPosY}px) rotate(360deg)`},
        ];

        this.animation = element.animate(keyframes, {duration: 2000, iterations: Infinity});
    }

    /**
     * Отключить анимацию выделения
     */
    unselect() {
        this.animation.cancel();
        this.animation = undefined;
    }

    /**
     * Позиция по x в пикселях
     * @returns {number}
     */
    get fieldPosX() {
        return this.position.x * this.cellSize;
    }

    /**
     * Позиция по y в пикселях
     * @returns {number}
     */
    get fieldPosY() {
        return this.position.y * this.cellSize;
    }
}