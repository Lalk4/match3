"use strict";

/**
 * Сгенерировать случайное целое число от 0 до max
 * @param max максимальное число
 * @returns {number} случайное целое число от 0 до max
 */
export const random = max => Math.random() * max ^ 0;

/**
 * Проверить, являются ли позиции соседними
 * @param pos1 Позиция 1
 * @param pos2 Позиция 2
 * @returns {boolean} соседи или нет
 */
export const isNeighbours = (pos1, pos2) => Math.abs(pos1.x - pos2.x) + Math.abs(pos1.y - pos2.y) === 1;

/**
 * Поменять элементы местами в матрице
 * @param matrix матрица
 * @param pos1 Позиция 1 элемента
 * @param pos2 Позиция 2 элемента
 */
export const swap = (matrix, pos1, pos2) => {
    const temp = matrix[pos1.x][pos1.y];
    matrix[pos1.x][pos1.y] = matrix[pos2.x][pos2.y];
    matrix[pos2.x][pos2.y] = temp;
};

/**
 * Сгенерировать диапазон от from к to
 * @param from начальное число
 * @param to конечное число
 * @returns {*[]} диапазон
 */
export const range = (from, to) => Array.from({length: to - from + 1}, (_, i) => i + from);

/**
 * Получить индексы всех комбинаций в линии
 * @param line массив
 * @returns {[]} индексы комбинаций
 */
export const getCombinations = line => {
    const combinations = [];
    let prev;
    let counter = 0;

    for (let i = 0; i < line.length; i++) {
        if (prev === line[i]) {
            counter++;
        } else {
            if (counter >= 2) combinations.push(range(i - 1 - counter, i - 1));
            counter = 0;
        }
        prev = line[i];
    }
    if (counter >= 2) combinations.push(range(line.length - 1 - counter, line.length - 1));

    return combinations;
}

/**
 * Получить строку в матрице по индексу
 * @param matrix матрица
 * @param index индекс строки
 * @returns {*[]} строка
 */
export const getRow = (matrix, index) => matrix.map(el => el[index]);

/**
 * Преобразовать комбинацию в очки
 * 3 - 1 очко
 * 4 - 2 очка
 * 5 и более - 6 очков
 * @param combination Комбинация
 * @returns {number} очки
 */
export const toScore = combination => {
    switch (combination.length) {
        case 3:
            return 1;
        case 4:
            return 2;
        default:
            return 6;
    }
}

/**
 * Получить часть матрицы
 * @param matrix Матрица
 * @param width ширина части
 * @param height высота части
 * @param x начальная координата x
 * @param y начальная координата y
 * @returns {*[][]} часть матрицы
 */
export const getPart = (matrix, width, height, x, y) => Array
    .from({length: width})
    .map((_, dx) =>
        Array
            .from({length: height})
            .map((_, dy) => matrix[x + dx][y + dy])
    );

/**
 * Получить элементы из матрицы по шаблону
 * @param matrix матрица
 * @param pattern шаблон
 * @returns {[]} элементы матрицы
 */
export const getElements = (matrix, pattern) => {
    const flatten = pattern.flat();
    return matrix.flat().filter((_, i) => flatten[i]);
}

/**
 * Являются ли элементы одинаковыми
 * Если размер множества элементов равен 1, то все элементы одинаковые
 * @param elements элементы
 * @returns {boolean} одинаковые или нет
 */
export const isSame = elements => [...new Set(elements)].length === 1;

/**
 * Поворот матрицы
 * @param matrix матрица
 * @returns {*[][]} повернутая матрица
 */
export const rotateMatrix = matrix => Array
    .from({length: matrix[0].length})
    .map((_, x) => Array
        .from({length: matrix.length})
        .map((_, y) => matrix[y][matrix[0].length - 1 - x]));

/**
 * Перемешать массив
 * @param arr массив
 * @returns {[]} перемешанный массив
 */
export const shuffle = arr => {
    const result = [];
    while (arr.length) result.push(arr.splice(random(arr.length), 1));
    return result.flat();
}

/**
 * Поделить массив на равные части
 * @param arr массив
 * @param n размер части
 * @returns {*[][]} матрица
 */
export const chunk = (arr, n) => arr.length ? [arr.slice(0, n), ...chunk(arr.slice(n), n)] : [];
