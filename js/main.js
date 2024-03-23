const promptCont = document.querySelector('#prompt-container');
const promptText = promptCont.querySelector('#prompt-text');
const keycode = document.querySelector('#keycode');
const btn = document.querySelector('button');
const classCode = btn.dataset.class;
const keys = {};

// проверка кода по нажатию кнопки
btn.addEventListener('click', async () => {
    const key = keycode.value;
    let answer = false;
    let keyId;
    for (const k in keys) {
        if (keys[k] === key) {
            answer = true;
            keyId = k;
            break;
        }
    }
    if (answer) {
        const block = document.getElementById(keyId);
        const lock = block.querySelector('.front');
        const blockCard = block.querySelector('.back');
        lock.classList.remove('front');
        lock.classList.add('hidden');
        blockCard.classList.remove('back');
        blockCard.classList.add('front');
        promptText.textContent = 'Верный ключ!';
        promptText.classList.remove('error');
        promptText.classList.add('success');
        promptCont.classList.remove('hidden');
        setTimeout(() => {
            promptCont.classList.add('hidden');
            keycode.value = '';
        }, 3000);
    } else {
        promptText.textContent = 'Неверный ключ! Проверь себя и попробуй ввести ключ снова';
        promptText.classList.remove('success');
        promptText.classList.add('error');
        promptCont.classList.remove('hidden');
        setTimeout(() => {
            promptCont.classList.add('hidden');
        }, 3000);
    }
});

// получение кодов для блоков
(async () => {
    let res = await fetch('/db/db_module.json');
    res = await res.json();
    res = res[classCode];
    for (const key in res) {
        keys[key] = res[key];
    }
})();