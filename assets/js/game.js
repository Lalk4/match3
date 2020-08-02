"use strict";

import {GameElement} from "./gameElement.js";
import {
    chunk,
    getCombinations,
    getElements,
    getPart,
    getRow,
    isNeighbours,
    isSame,
    random,
    rotateMatrix,
    shuffle,
    swap,
    toScore
} from "./utils.js";

/**
 * Класс для создания игры
 */
export class Game {
    /**
     * Задаём общие значения для всех игр
     * @param elements элементы для взаимодействия
     * @param fieldSize размер поля
     */
    constructor(elements, fieldSize = 15) {
        this.elements = elements;
        this.fieldSize = fieldSize;
        this.action = false;
        this.field = [];
    }

    /**
     * Начать новую игру
     * @returns {Promise<void>}
     */
    async play() {
        if (this.action) return;
        await this.pause();
        await this.init();
    }

    /**
     * Закончить игру
     * @returns {Promise<void>}
     */
    async pause() {
        if (this.action) return;
        await Promise.all(this.field.flat().map(el => el.remove()));
        this.field = [];
        this.selected = null;
        this.score = 0;
        this.steps = 0;
    }

    /**
     * Инициация игры
     * @returns {Promise<void>}
     */
    async init() {
        this.steps = 30;
        this.elements.steps.innerHTML = "30";
        this.elements.score.innerHTML = "0";
        this.fill();
        this.render();
        await this.initElements();
        await this.step();
        this.addInteraction();
    }

    /**
     * Заполнение матрицы поля элементами случайных типов
     * Матрица - массив с массивами колонок элементов
     *     0  1  2
     * 0 [ x, x, x ]
     * 1   x  x  x
     * 2   x  x  x
     */
    fill() {
        const {fieldSize} = this;
        this.field = Array
            .from({length: fieldSize})
            .map((_, x) => Array
                .from({length: fieldSize})
                .map((_, y) =>
                    new GameElement(random(5) + 1, x, y)));
    }

    /**
     * Вставка в шаблон созданных элементов
     */
    render() {
        this.elements.field.innerHTML = this.field
            .flat()
            .map(el => el.render())
            .join("");
    }

    /**
     * Инициация элементов (появление)
     * @returns {Promise<void>}
     */
    async initElements() {
        const promises = this.field
            .flat()
            .map(el => el.init().show());

        await Promise.all(promises);
    }

    /**
     * Выполнение логики игры:
     * - Проверка на наличие комбинаций
     * - Подсчёт очков
     * - Удаление комбинаций
     * - Падение элементов в пустые ячейки
     * - При наличии новых комбинаций - повторить
     * - Перемешивание при остутствии возможных ходов в корневом вызове метода
     * @param isRoot Является ли корнем
     * @returns {Promise<void>}
     */
    async step(isRoot = true) {
        this.action = true;

        const [columnCombinations, rowCombinations] = this.check();
        this.countScore([...columnCombinations, ...rowCombinations]);
        await this.removeElements(columnCombinations, rowCombinations);
        await this.fall();
        if (this.hasCombinations) await this.step(false);

        if (isRoot && !this.hasPossible) {
            this.elements.msg.innerHTML = "Нет ходов";
            await this.shuffle();
            await this.step();
            this.elements.msg.innerHTML = "";
        }

        this.action = false;
    }

    /**
     * Добавление событий на новые элементы для взаимодействия
     */
    addInteraction() {
        this.field
            .flat()
            .filter(el => el.new)
            .forEach(el => {
                el.new = false;
                el.element.addEventListener("click", () => this.select(el));
            });
    }

    /**
     * Комбинации по вертикали и горизонтали
     * @returns {Array}
     */
    check() {
        const columnCombinations = this.field.map(el => getCombinations(el.map(el => el.type)))
        const rowCombinations = this.field.map((_, i) => getCombinations(getRow(this.field, i).map(el => el.type)));
        return [columnCombinations, rowCombinations];
    }

    /**
     * Подсчёт очков по комбинациям
     * @param combinations
     */
    countScore(combinations) {
        const score = combinations
            .filter(el => el.length > 0)
            .map(toScore)
            .reduce((a, b) => a + b, 0);
        this.score += score;
        this.elements.score.innerHTML = this.score;
    }

    /**
     * Удаление комбинаций в шаблоне
     * @param columnCombinations Комбинации в колонках
     * @param rowCombinations Комбинации в строках
     * @returns {Promise<void>}
     */
    async removeElements(columnCombinations, rowCombinations) {
        const columnPositions = columnCombinations.map((el, i) => el.flat().map(elem => ({x: i, y: elem}))).flat();
        const rowPositions = rowCombinations.map((el, i) => el.flat().map(elem => ({y: i, x: elem}))).flat();

        const promises = [
            ...rowPositions,
            ...columnPositions
        ].map(el => this.field[el.x][el.y].remove());

        await Promise.all(promises);
    }

    /**
     * Падение элементов в пустые ячейки с анимацией
     * @returns {Promise<void>}
     */
    async fall() {
        const {fieldSize, elements: {field}} = this;

        this.field = this.field.map((el, x) => {
            const removed = el.filter(el => !el.removed);
            return [
                ...Array.from(
                    {length: fieldSize - removed.length},
                    (_, y) => {
                        const elem = new GameElement(random(5) + 1, x, removed.length - fieldSize + y - 2);
                        field.insertAdjacentHTML("beforeend", elem.render());
                        elem.init();
                        return elem;
                    }
                ),
                ...removed
            ];
        });

        await this.moveByIndexes();
    }

    /**
     * Переместиться по индексам матрицы
     * @returns {Promise<void>}
     */
    async moveByIndexes() {
        const {fieldSize} = this;
        const promises = this.field.flat()
            .map((el, i) => el.move({y: i % fieldSize, x: i / fieldSize ^ 0}));
        await Promise.all(promises);
    }

    /**
     * Обработка действий пользователя:
     * - Выделение элемента при отсутствии анимации и наличии шагов
     * - Смена положения с соседями при клике
     * - Выполнение хода
     * - Возврат на исходные позиции, если ничего не произошло
     * @param selected Выбранный элемент
     * @returns {Promise<void>}
     */
    async select(selected) {
        if (this.action || this.steps <= 0) return;

        if (this.selected) {
            if (isNeighbours(this.selected.position, selected.position)) {

                await this.swapElements(this.selected, selected);

                if (this.hasCombinations) {
                    this.elements.steps.innerHTML = `${--this.steps}`;
                    await this.step();
                    this.addInteraction();
                } else {
                    await this.swapElements(selected, this.selected);
                }
            }
            this.selected.unselect();
            this.selected = null;
        } else {
            selected.select();
            this.selected = selected;
        }
    }

    /**
     * Поменять 2 элемента местами в шаблоне и матрице
     * @param el1 Элемент 1
     * @param el2 Элемент 2
     * @returns {Promise<void>}
     */
    async swapElements(el1, el2) {
        await Promise.all([
            el1.move(el2.position),
            el2.move(el1.position)
        ]);
        swap(this.field, el1.position, el2.position);
    }

    /**
     * Перемешать элементы в матрице и шаблоне
     * @returns {Promise<void>}
     */
    async shuffle() {
        const {fieldSize} = this;
        this.field = chunk(shuffle(this.field.flat()), fieldSize);
        await this.moveByIndexes()
    }

    /**
     * Наличие комбинаций в матрице
     * @returns {boolean}
     */
    get hasCombinations() {
        return this.check().flat(2).length > 0;
    }

    /**
     * Наличие возможных комбинаций в матрице:
     * проверяет 4 шаблона в 4 различных направлениях по всей матрице на одинаковые элементы
     * @returns {boolean}
     */
    get hasPossible() {
        const patterns = [
            [[0, 1, 0],
             [1, 0, 1]],
            [[0, 1, 1],
             [1, 0, 0]],
            [[1, 1, 0],
             [0, 0, 1]],
            [[1, 1, 0, 1]],
        ];
        const {field, fieldSize} = this;
        const types = field.map(column => column.map(el => el.type));
        return patterns.some(el => {
            for (let i = 0; i < 4; i++) {
                el = rotateMatrix(el);
                for (let x = 0; x < fieldSize - el.length + 1; x++) {
                    for (let y = 0; y < fieldSize - el[0].length + 1; y++) {
                        const part = getPart(types, el.length, el[0].length, x, y);
                        const elements = getElements(part, el);
                        if (isSame(elements)) return true;
                    }
                }
            }
            return false;
        });
    }
}