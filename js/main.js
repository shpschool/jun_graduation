/* Константы и переменные */
/* ****************************************************** */

// константы от html
const promptCont = document.querySelector('#prompt-container');
const promptText = promptCont.querySelector('#prompt-text');
const keycode = document.querySelector('#keycode');
const btn = document.querySelector('button');
const classCode = btn.dataset.class;

// словарь ключей
const keys = {};

// переменные хода игры
let useMark = false;
let useMath = false;
let openedBlocks = [];

// Уникальные ключи для localStorage
const STORAGE_KEYS = {
    openedBlocks: `openedBlocks_${classCode}`,
    startGame: `startGame_${classCode}`
};


/* Функции */
/* ****************************************************** */

/** сохранение прогресса ученика */
const saveProgress = () => {
    localStorage.setItem(STORAGE_KEYS.openedBlocks, openedBlocks);
};

/** получение прогресса ученика */
const getProgress = () => {
    const startDate = new Date(localStorage.getItem(STORAGE_KEYS.startGame));
    const nowDate = new Date();
    // если "игра" была начата больше дня назад, то прогресс стирается
    if (nowDate - startDate > 1000 * 60 * 60 * 24) {
        clearProgress();
    } else {
        openedBlocks = localStorage.getItem(STORAGE_KEYS.openedBlocks);
        if (openedBlocks) {
            openedBlocks = openedBlocks.split(",");
            const requiredBlocks = classCode === 'p3' ? 2 : 4;
            if (openedBlocks.length === requiredBlocks) {
                finishGame();
            } else {
                for (let block of openedBlocks) {
                    if (block === "mark") {
                        useMark = true;
                        useMath = false;
                    } else if (block === "math") {
                        useMath = true;
                        useMark = false;
                    }
                    openBlock(block);
                }
            }
        } else {
            openedBlocks = [];
        }
    }
};

/** очистка прогресса */
const clearProgress = () => {
    console.log('clear progress');
    localStorage.removeItem(STORAGE_KEYS.openedBlocks);
    localStorage.removeItem(STORAGE_KEYS.startGame);
};

/** открытие блока (после ввода верного ключа или во время получения прогресса) */
const openBlock = (keyId) => {
    let block;
    let blockCard;
    
    // Для группы P3 используем упрощенную логику
    if (classCode === 'p3') {
        block = document.getElementById(keyId);
        blockCard = block.querySelector('.back');
    } else {
        // Старая логика для других групп
        if (keyId === "math") {
            block = document.getElementById('mark');
            blockCard = block.querySelector('#math');
            const blockMark = block.querySelector('#mark-img');
            blockMark.classList.add('hidden');
        } else if (keyId === "mark") {
            block = document.getElementById('mark');
            blockCard = block.querySelector('#mark-img');
            const blockMath = block.querySelector('#math');
            blockMath.classList.add('hidden');
        } else {
            block = document.getElementById(keyId);
            blockCard = block.querySelector('.back');
        }
    }
    
    const lock = block.querySelector('.front');
    lock.classList.add('open');
    if (classCode === "j4") {
        lock.classList.remove('front');
        blockCard.classList.remove('back');
        blockCard.classList.add('front');
    } else {
        blockCard.classList.add('open');
    }
    setTimeout(() => lock.classList.add('hidden'), 700);
};

/** открытие блока подсказки по ходу игры */
const setPrompt = (prText, success) => {
    promptText.textContent = prText;
    if (success) {
        promptCont.classList.remove('error');
        promptCont.classList.add('success');
    } else {
        promptCont.classList.remove('success');
        promptCont.classList.add('error');
    }
    promptCont.classList.remove('hidden');
    setTimeout(() => {
        promptCont.classList.add('hidden');
    }, 3000);
};

/** Завершение "игры", показ ссылки на сертификат */
const finishGame = () => {
    document.querySelector('#game').classList.add('hidden');
    document.querySelector('.finish-wrap').classList.remove('hidden');
    document.querySelector('.finish-wrap').classList.add('open');
};


/* Запуск "игры" */
/* ****************************************************** */

// проверка кода по нажатию кнопки
btn.addEventListener('click', async () => {
    const key = keycode.value;
    let answer = false;
    let keyId;
    for (const k in keys) {
        if (keys[k].code === key) {
            answer = true;
            keyId = k;
            break;
        }
    }
    
    // Проверки useMark и useMath только для групп j3 и j4
    if (classCode !== 'p3') {
        // если уже ввели код для блока Марка, то больше нельзя ввести код для блока Математика
        if (keyId === "mark") useMark = true;
        if (useMark && keyId === "math") answer = false;
        // если уже ввели код для блока Математика, то больше нельзя ввести код для блока Марка
        if (keyId === "math") useMath = true;
        if (useMath && keyId === "mark") answer = false;
    }

    if (openedBlocks.includes(keyId)) {
        setPrompt('Ключ уже был использован!', false);
        keycode.value = '';
    } else if (answer) {
        openBlock(keyId);

        setPrompt(`Ключ открывает ${keys[keyId].rus}!`, true);
        keycode.value = '';

        openedBlocks.push(keyId);
        saveProgress();
    } else {
        setPrompt('Неверный ключ! Проверь себя и попробуй ввести ключ снова', false);
    }
    
    // Проверяем количество блоков в зависимости от группы
    const requiredBlocks = classCode === 'p3' ? 2 : 4;
    if (openedBlocks.length === requiredBlocks) {
        setTimeout(finishGame, 2000);
    }
});

// получение прогресса, если он есть, и кодов для блоков для старта "игры"
(async () => {
    if (localStorage.getItem(STORAGE_KEYS.startGame)) {
        getProgress();
    } else {
        localStorage.setItem(STORAGE_KEYS.startGame, new Date());
    }
    let res = await fetch('../db/db_module.json');
    res = await res.json();
    res = res[classCode];
    for (const key in res) {
        keys[key] = res[key];
    }
})();
