"use strict";

import {Game} from "./game.js";

/**
 * Промис окончания анимации для асинхронного ожидания окончания
 * @returns {Promise}
 */
Animation.prototype.finishPromise = function () {
    return new Promise(resolve => this.onfinish = resolve);
}

const elements = {
    play: document.querySelector('.play'),
    pause: document.querySelector('.pause'),
    field: document.querySelector('.field'),
    msg: document.querySelector('.msg'),
    score: document.querySelector('.score'),
    steps: document.querySelector('.steps'),
};

const game = new Game(elements);

elements.pause.addEventListener("click", () => game.pause());
elements.play.addEventListener("click", () => game.play());