// ==UserScript==
// @name           Тестирую
// @author         barifan
// @namespace      Linkif
// @version        2.0.0
// @description    Полный функционал: логи, блок кнопок для управления транспортом, модули боя, таймеры и многое другое
// @include        *moswar.ru*
// @include        https://*.moswar.mail.ru*
// @match          *://*.moswar.ru/*
// @icon           https://www.google.com/s2/favicons?sz=64&domain=moswar.ru
// @grant          none
// ==/UserScript==

(function() {
    'use strict';

    // Добавляем глобальный обработчик ошибок для отлова проблем со скриптом
    window.addEventListener('error', function(event) {
        console.error(`[${new Date().toISOString()}] [LinkIF] Global error:`, event.error);
    });

    // Обработчик непойманных отклонённых промисов
    window.addEventListener('unhandledrejection', function(event) {
        console.error(`[${new Date().toISOString()}] [LinkIF] Unhandled rejection:`, event.reason);
    });


    /**
 * Анализирует DOM-структуру страницы и выводит основные элементы
 */
// НАЧАЛО ФУНКЦИИ analyzeDOM
function analyzeDOM() {
    try {
        console.log('[LinkIF] Анализируем DOM-структуру страницы...');

        // Проверяем основные контейнеры
        const body = document.body;
        console.log(`[LinkIF] Body найден: ${body ? 'да' : 'нет'}`);

        const content = document.getElementById('content');
        console.log(`[LinkIF] #content найден: ${content ? 'да' : 'нет'}`);

        const dataDiv = content ? content.querySelector('.data') : null;
        console.log(`[LinkIF] .data в #content найден: ${dataDiv ? 'да' : 'нет'}`);

        // Проверяем наличие наших панелей
        const transportPanel = document.getElementById('linkif-transport-panel');
        console.log(`[LinkIF] #linkif-transport-panel найден: ${transportPanel ? 'да' : 'нет'}`);
        if (transportPanel) {
            console.log(`[LinkIF] Размеры панели: ${transportPanel.offsetWidth}x${transportPanel.offsetHeight}`);
            console.log(`[LinkIF] Видимость панели: display=${getComputedStyle(transportPanel).display}, visibility=${getComputedStyle(transportPanel).visibility}, opacity=${getComputedStyle(transportPanel).opacity}`);
            console.log(`[LinkIF] Позиция панели: position=${getComputedStyle(transportPanel).position}, z-index=${getComputedStyle(transportPanel).zIndex}`);
        }

        // Если находимся на странице транспорта, проверяем специфичные элементы
        if (window.location.href.includes('/automobile/')) {
            const carsList = document.querySelector('.cars-trip, .cars-list');
            console.log(`[LinkIF] Список машин найден: ${carsList ? 'да' : 'нет'}`);

            const tripChoose = document.querySelector('.cars-trip-choose');
            console.log(`[LinkIF] Выбор поездки найден: ${tripChoose ? 'да' : 'нет'}`);

            // Проверяем непосредственных потомков content
            if (content) {
                console.log(`[LinkIF] Дочерние элементы #content: ${content.children.length}`);
                Array.from(content.children).forEach((child, index) => {
                    console.log(`[LinkIF] #content ребенок ${index}: ${child.tagName}#${child.id}.${child.className}`);
                });
            }
        }

        console.log('[LinkIF] Анализ DOM завершен');
    } catch (error) {
        console.error("Error analyzing DOM:", error);
    }
}
// КОНЕЦ ФУНКЦИИ analyzeDOM

    // === СТИЛИ ДЛЯ ПАНЕЛИ УПРАВЛЕНИЯ ===
    try {
        const style = document.createElement('style');
        style.textContent = `
            #mw-panel {
                background: #fff8e1;
                border: 2px solid #ffcc80;
                padding: 10px 15px;
                border-radius: 12px;
                box-shadow: 0 4px 8px rgba(0,0,0,0.1);
                width: fit-content;
                margin: 10px;
                font-family: Arial, sans-serif;
            }
            .mw-slot {
                display: inline-block;
                margin: 4px;
                padding: 6px 10px;
                border: 1px solid #ffb74d;
                border-radius: 6px;
                background: #ffe0b2;
                font-weight: bold;
                position: relative;
            }
            .mw-slot .reset-btn {
                position: absolute;
                top: -6px;
                right: -6px;
                background: #ef5350;
                color: white;
                border: none;
                border-radius: 50%;
                width: 18px;
                height: 18px;
                font-size: 12px;
                cursor: pointer;
            }
            .mw-divider {
                display: inline-block;
                width: 10px;
                height: 32px;
            }
            .mw-btn {
                background: linear-gradient(to bottom, #ffe082, #ffca28);
                border: 2px solid #f57f17;
                border-radius: 8px;
                padding: 6px 12px;
                font-weight: bold;
                margin: 5px;
                cursor: pointer;
            }
            .mw-status-line {
                margin-top: 10px;
                font-style: italic;
                color: #555;
            }
            .mw-select {
                margin-left: 5px;
                padding: 4px 8px;
                border-radius: 5px;
                border: 1px solid #ccc;
            }
            #logs-me {
                margin: 5px 0;
                padding: 5px;
                background: rgba(0,0,0,0.1);
                border-radius: 5px;
            }
            #logs-me p {
                margin: 3px 0;
                padding: 3px 5px;
            }
            .me-logs {
                border-left: 3px solid #4caf50;
                padding-left: 5px;
            }
            .ability-log-container {
                border-left: 3px solid #2196f3;
                padding-left: 5px;
                margin-top: 5px;
            }
        `;
        document.head.appendChild(style);
    } catch (error) {
        console.error("Error adding styles:", error);
    }

    // === ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ===

    /**
     * Обновляет статусный текст на панели управления
     * @param {string} text - Текст для отображения
     * @param {boolean} isError - Указывает, является ли это ошибкой
     */
    function updateStatus(text, isError = false) {
        try {
            const el = document.getElementById("mw-status");
            if (!el) return;

            el.innerHTML = text;
            el.style.color = isError ? '#ff6b6b' : '#51cf66';

            if (!isError) {
                setTimeout(() => {
                    if (el.innerHTML === text) {
                        el.innerHTML = 'Ожидание действий...';
                        el.style.color = '#868e96';
                    }
                }, 5000);
            }
        } catch (error) {
            console.error("Error updating status:", error);
        }
    }

    /**
     * Преобразует время из строкового формата ЧЧ:ММ:СС в миллисекунды
     * @param {string} t - Строка времени в формате ЧЧ:ММ:СС
     * @returns {number} Время в миллисекундах
     */
    function timeToMs(t) {
        try {
            let e = t.split(":").map(Number),
                n = 0,
                o = 0,
                r = 0;

            e.length === 3 ? (n = e[0], o = e[1], r = e[2]) :
            e.length === 2 ? (o = e[0], r = e[1]) :
            e.length === 1 && (r = e[0]);

            return (n * 3600 + o * 60 + r) * 1e3;
        } catch (error) {
            console.error("Error converting time to ms:", error);
            return 0;
        }
    }

    /**
     * Форматирует время в секундах в формат ММ:СС или ЧЧ:ММ:СС
     * @param {number} t - Время в секундах
     * @returns {string} Отформатированное время
     */
    function formatTime(t) {
        try {
            let e = Math.floor(t / 3600),
                n = Math.floor((t % 3600) / 60),
                o = t % 60;

            return [
                e > 0 ? String(e).padStart(2, "0") : null,
                String(n).padStart(2, "0"),
                String(o).padStart(2, "0"),
            ]
            .filter(Boolean)
            .join(":");
        } catch (error) {
            console.error("Error formatting time:", error);
            return "00:00";
        }
    }

    /**
     * Форматирует числа для лучшей читаемости (K, M, B)
     * @param {number} t - Число для форматирования
     * @returns {string} Отформатированное число
     */
    function formatNumber(t) {
        try {
            t = `${t}`.split(",").join("");
            return Math.abs(t) >= 1e9
                ? Math.floor((t / 1e9) * 10) / 10 + "B"
                : Math.abs(t) >= 1e6
                    ? Math.floor((t / 1e6) * 10) / 10 + "M"
                    : Math.abs(t) >= 1e3
                        ? Math.floor((t / 1e3) * 10) / 10 + "K"
                        : t.toString();
        } catch (error) {
            console.error("Error formatting number:", error);
            return t.toString();
        }
    }

    /**
     * Создает промис с задержкой исполнения
     * @param {number} t - Задержка в секундах
     * @returns {Promise} Промис, который выполнится через указанное время
     */
    function delay(t = 1) {
        return new Promise((e) => setTimeout(e, t * 1e3));
    }

    /**
     * Находит элементы на странице по URL и селектору
     * @param {string} t - CSS селектор
     * @param {string} e - URL страницы
     * @returns {Promise} Найденные элементы
     */
    async function getElementsOnThePage(t, e) {
        try {
            let o = await (await fetch(e)).text();
            let r = $(parseHtml(o));
            if (!r || !r.length) return;

            let a = r.find(t);
            return a.length ? (a.length === 1 ? a[0] : a.toArray()) : null;
        } catch (error) {
            console.error(`Error getting elements from ${e}: ${error.message}`);
            return null;
        }
    }

    /**
     * Парсит HTML строку в DOM объект
     * @param {string} t - HTML строка
     * @returns {Document} DOM объект
     */
    function parseHtml(t) {
        try {
            let e = new DOMParser();
            let n = t.replace(/\\&quot;/g, '"').replace(/\\"/g, '"');
            return e.parseFromString(n, "text/html");
        } catch (error) {
            console.error("Error parsing HTML:", error);
            return document.implementation.createHTMLDocument("");
        }
    }

    /**
     * Извлекает ID игрока из URL
     * @param {string} t - URL профиля игрока
     * @returns {string|null} ID игрока или null
     */
    function convertPlayerUrlToId(t) {
        try {
            let e = t.match(/\player\/(\d+)\//);
            return e ? e[1] : null;
        } catch (error) {
            console.error("Error converting player URL to ID:", error);
            return null;
        }
    }

    /**
     * Получает ID игрока из DOM
     * @param {Element} t - DOM элемент, содержащий информацию об игроке
     * @returns {string|null} ID игрока или null
     */
    function getPlayerId(t) {
        try {
            let e = t.querySelector(".fighter2 .user a").href;
            return convertPlayerUrlToId(e);
        } catch (err) {
            console.log("🚧 Could not find player id");
            return null;
        }
    }

    /**
     * Фильтрует логи для поиска потенциальных жертв
     * @param {Document} t - DOM документ для анализа
     * @returns {Array} Массив ID потенциальных жертв
     */
    function filterLogs(t = window.document) {
        try {
            return [...t.querySelectorAll("tr")]
                .filter(
                    (r) =>
                        r.querySelector("td.actions div.c")?.innerText ===
                        "В список жертв"
                )
                .map((r) => {
                    let a = +r
                        .querySelector(".text .tugriki")
                        .innerText.split(",")
                        .join(""),
                    s = r.querySelector(".user a").href;
                    if (a > 3e5) return s;
                })
                .filter((r) => r)
                .map((r) => convertPlayerUrlToId(r));
        } catch (error) {
            console.error("Error filtering logs:", error);
            return [];
        }
    }


    /**
     * Создает обратный отсчет на элементе
     * @param {Element|string} element - Элемент или его селектор
     * @param {number} startTime - Начальное время в секундах
     * @param {boolean} hideOnComplete - Скрывать элемент после окончания отсчета
     * @param {Function} onComplete - Функция, вызываемая по окончании отсчета
     */
    function countdown(element, startTime = 0, hideOnComplete = false, onComplete = null) {
        try {
            // Получаем DOM элемент, если передан селектор
            const el = typeof element === 'string' ? document.querySelector(element) : element;
            if (!el) return;

            // Если время уже задано в атрибуте элемента
            let timeLeft = startTime || Number(el.getAttribute('timer'));
            if (isNaN(timeLeft) || timeLeft <= 0) {
                if (hideOnComplete) el.style.display = 'none';
                if (onComplete && typeof onComplete === 'function') onComplete();
                return;
            }

            // Функция обновления времени
            const updateTime = () => {
                if (timeLeft <= 0) {
                    clearInterval(interval);
                    if (hideOnComplete) el.style.display = 'none';
                    if (onComplete && typeof onComplete === 'function') onComplete();
                    return;
                }

                // Форматируем и отображаем время
                el.textContent = formatTime(timeLeft);
                timeLeft--;
            };

            // Запускаем интервал обновления
            updateTime();
            const interval = setInterval(updateTime, 1000);

            // Сохраняем ID интервала, чтобы можно было очистить его позже
            el._countdownInterval = interval;

            return interval;
        } catch (error) {
            console.error("Error in countdown:", error);
            return null;
        }
    }

    /**
     * Получает текущий счет побед за день
     * @returns {Promise<number>} Количество побед
     */
    async function getTodayScore() {
        try {
            const element = await getElementsOnThePage(".my .value b", "https://www.moswar.ru/rating/wins/");
            return element ? +element.innerText : 0;
        } catch (error) {
            console.error("Error getting daily score:", error);
            return 0;
        }
    }

    /**
     * Преобразует строку HTML в DOM элемент
     * @param {string} t - HTML строка
     * @returns {Element} Первый элемент из строки
     */
    function strToHtml(t) {
        try {
            let e = document.createElement("div");
            e.innerHTML = t.trim();
            return e.firstChild;
        } catch (error) {
            console.error("Error converting string to HTML:", error);
            return document.createElement("div");
        }
    }

    /**
     * Обрабатывает список игроков в бою для добавления дополнительной информации
     * @param {JQuery} listElement - DOM элемент списка игроков
     */
    function processFightUserList(listElement) {
        try {
            if (!listElement || !listElement.length) return;

            // Добавляем стилизацию для контейнера
            listElement.css({
                'background-color': 'rgba(0, 0, 0, 0.5)',
                'border-radius': '5px',
                'padding': '3px',
                'margin-bottom': '3px'
            });

            // Обрабатываем каждого игрока в списке
            listElement.find('li').each(function() {
                const player = $(this);
                const playerName = player.find('.name').text().trim();

                // Проверяем локальное хранилище на наличие заметок о игроке
                const playerNotes = localStorage.getItem(`player_notes_${playerName}`);

                // Добавляем визуальные индикаторы, если есть заметки
                if (playerNotes) {
                    player.find('.name').css('text-decoration', 'underline dotted yellow');
                    player.attr('title', playerNotes);
                }

                // Добавляем подсветку для важных игроков (враги, друзья и т.д.)
                const contactType = localStorage.getItem(`player_contact_${playerName}`);
                if (contactType) {
                    let borderColor = '';
                    switch(contactType) {
                        case 'enemy': borderColor = '#ff4444'; break;
                        case 'friend': borderColor = '#44ff44'; break;
                        case 'victim': borderColor = '#ffaa44'; break;
                        default: borderColor = '#aaaaaa';
                    }
                    player.css('border-left', `3px solid ${borderColor}`);
                }
            });
        } catch (error) {
            console.error("Error processing fight user list:", error);
        }
    }












 
    // ВСТАВИТЬ СЮДА ↓
/**
 * Проверяет бак машины и при необходимости заправляет
 */
async function checkCarTank(carId) {
    try {
        const response = await fetch("https://www.moswar.ru/automobile/transport-info/", {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "X-Requested-With": "XMLHttpRequest"
            },
            body: `car=${carId}&__ajax=1&return_url=%2Fautomobile%2F`
        });

        const data = await response.text();
        const jsonData = JSON.parse(data);

        if (!jsonData || !jsonData.content) {
            console.error(`Failed to get info for car ${carId}`);
            return;
        }

        // Парсим HTML из ответа
        const htmlDoc = parseHtml(jsonData.content);
        const fuelDiv = htmlDoc.querySelector("td.fuel div");

        if (!fuelDiv) {
            console.error(`No fuel info for car ${carId}`);
            return;
        }

        const fuelWidth = fuelDiv.style.width;
        const fuelLevel = parseInt(fuelWidth, 10);

        if (isNaN(fuelLevel)) {
            console.error(`Invalid fuel level format for car ${carId}: ${fuelWidth}`);
            return;
        }

        if (fuelLevel < 25) {
            console.log(`[⛽] Car ${carId} needs refueling (${fuelLevel}%)`);
            await fillCarTank(carId);
        }
    } catch (error) {
        console.error(`Error checking car tank ${carId}:`, error);
    }
}

/**
 * Заправляет машину
 */
async function fillCarTank(carId) {
    try {
        await fetch("https://www.moswar.ru/automobile/fill/", {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "X-Requested-With": "XMLHttpRequest"
            },
            body: `car=${carId}&__ajax=1&return_url=%2Fautomobile%2F`
        });

        console.log(`[⛽] Car ${carId} refueled`);
    } catch (error) {
        console.error(`Error filling car tank ${carId}:`, error);
    }
}



/**
 * Настройка наблюдателя за логами боя
 */
// НАЧАЛО ФУНКЦИИ setupLogsObserver
function setupLogsObserver(logsContainer) {
    try {
        console.log('[LinkIF] Настраиваем наблюдатель за логами боя');

        // Если уже есть наблюдатель, отключаем его
        if (window.linkIfLogsObserver) {
            window.linkIfLogsObserver.disconnect();
        }

        // Создаем наблюдатель
        window.linkIfLogsObserver = new MutationObserver((mutations) => {
            // Проверяем, добавились ли новые логи
            let newLogsAdded = false;

            for (const mutation of mutations) {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    // Проверяем, содержат ли добавленные узлы новые логи
                    for (const node of mutation.addedNodes) {
                        if (node.nodeType === Node.ELEMENT_NODE &&
                            (node.classList.contains('block-rounded') ||
                             node.querySelector('.block-rounded'))) {
                            newLogsAdded = true;
                            break;
                        }
                    }
                    if (newLogsAdded) break;
                }
            }

            // Если добавлены новые логи, обновляем навигацию
            if (newLogsAdded) {
                console.log('[LinkIF] Обнаружены новые логи, обновляем панель навигации');
                setTimeout(cleanupFightLogs, 100);
            }
        });

        // Начинаем наблюдение
        window.linkIfLogsObserver.observe(logsContainer, {
            childList: true,
            subtree: true
        });

        console.log('[LinkIF] Наблюдатель за логами боя установлен');
    } catch (error) {
        console.error("[LinkIF] Ошибка при настройке наблюдателя за логами боя:", error);
    }
}
// КОНЕЦ ФУНКЦИИ setupLogsObserver

/**
 * Обновляет индикатор активного комплекта
 */
function updateSetIndicator(element = null) {
    try {
        const indicator = element || document.getElementById('mw-active-set');
        if (!indicator) return;

        // Находим последний использованный комплект
        const lastSetUsed = localStorage.getItem("mw-last-set-used") || "1";
        const setStr = localStorage.getItem(`mw-carset-${lastSetUsed}`);
        const setData = setStr ? JSON.parse(setStr) : [];

        indicator.textContent = `Комплект ${lastSetUsed} (${setData.length})`;
    } catch (error) {
        console.error("Error updating set indicator:", error);
    }
}

/**
 * Отображает сводку по сохраненным комплектам
 */
function drawSetSummary(container = null) {
    try {
        const summaryContainer = container || document.getElementById('mw-sets-summary');
        if (!summaryContainer) return;

        summaryContainer.innerHTML = '';

        // Создаем слоты для каждого комплекта
        for (let i = 1; i <= 4; i++) {
            const setStr = localStorage.getItem(`mw-carset-${i}`);
            const setData = setStr ? JSON.parse(setStr) : [];
            const count = setData.length;

            const slot = document.createElement('div');
            slot.className = 'mw-slot';
            slot.textContent = `Комплект ${i}: ${count} машин`;

            // Добавляем кнопку сброса
            if (count > 0) {
                const resetBtn = document.createElement('button');
                resetBtn.className = 'reset-btn';
                resetBtn.textContent = '×';
                resetBtn.title = 'Очистить этот комплект';

                resetBtn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    localStorage.removeItem(`mw-carset-${i}`);
                    updateSetIndicator();
                    drawSetSummary(summaryContainer);
                    updateStatus(`🗑️ Комплект ${i} очищен`);
                });

                slot.appendChild(resetBtn);
            }

            // При клике на слот отправляем этот комплект
            slot.addEventListener('click', function() {
                if (count > 0) {
                    sendSet(i);
                } else {
                    updateStatus("❌ В комплекте нет машин", true);
                }
            });

            summaryContainer.appendChild(slot);
        }
    } catch (error) {
        console.error("Error drawing set summary:", error);
    }
}

/**
 * Сохраняет выбранный набор транспорта
 */
function saveSet(slotNumber = 1) {
    try {
        if (slotNumber < 1 || slotNumber > 4) {
            console.error("Invalid set slot:", slotNumber);
            return;
        }

        // Получаем выбранные машины
        const selectedCheckboxes = document.querySelectorAll('.cars-trip-choose input[type="checkbox"]:checked:not([disabled])');
        if (!selectedCheckboxes.length) {
            console.log("No cars selected");
            updateStatus("❌ Не выбраны машины", true);
            return;
        }

        // Собираем информацию о выбранных машинах
        const selectedCars = Array.from(selectedCheckboxes).map((checkbox) => {
            const li = checkbox.closest("li");
            if (!li) return null;

            const carInput = li.querySelector('input[name="car"]');
            const dirInput = li.querySelector('input[name="direction"]:checked');

            if (!carInput || !dirInput) return null;

            return {
                carId: carInput.value,
                rideId: dirInput.value,
            };
        }).filter(car => car !== null);

        // Сохраняем в локальное хранилище
        localStorage.setItem(`mw-carset-${slotNumber}`, JSON.stringify(selectedCars));
        updateStatus(`💾 Сохранено ${selectedCars.length} машин в комплект ${slotNumber}`);

        // Обновляем индикаторы
        updateSetIndicator();
        drawSetSummary();

        return selectedCars.length;
    } catch (error) {
        console.error("Error saving car set:", error);
        updateStatus("❌ Ошибка при сохранении комплекта", true);
        return 0;
    }
}

/**
 * Отправляет выбранный комплект транспорта
 */
async function sendSet(slotNumber = 1) {
    try {
        if (slotNumber < 1 || slotNumber > 4) {
            console.error("Invalid set slot:", slotNumber);
            return;
        }

        // Загружаем комплект из хранилища
        const setStr = localStorage.getItem(`mw-carset-${slotNumber}`);
        if (!setStr) {
            updateStatus(`❌ Комплект ${slotNumber} пуст`, true);
            return;
        }

        const setData = JSON.parse(setStr);
        if (!setData.length) {
            updateStatus(`❌ Комплект ${slotNumber} пуст`, true);
            return;
        }

        // Запоминаем последний использованный комплект
        localStorage.setItem("mw-last-set-used", slotNumber.toString());
        updateSetIndicator();

        // Отмечаем все чекбоксы
        const checkboxes = document.querySelectorAll('.cars-trip-choose input[type="checkbox"]:not([disabled])');
        checkboxes.forEach(checkbox => checkbox.checked = false);

        // Отмечаем машины из комплекта
        let sentCount = 0;
        for (let car of setData) {
            try {
                // Находим соответствующие элементы
                let carInput = document.querySelector(`.cars-trip-choose input[name="car"][value="${car.carId}"]`);
                if (!carInput) continue;

                let li = carInput.closest("li");
                if (!li) continue;

                // Находим направление и чекбокс
                let dirInput = li.querySelector(`input[name="direction"][value="${car.rideId}"]`);
                if (!dirInput) continue;

                let checkbox = li.querySelector('input[type="checkbox"]');
                if (!checkbox || checkbox.disabled) continue;

                // Выбираем направление и отмечаем чекбокс
                dirInput.checked = true;
                checkbox.checked = true;

                // Проверяем и заправляем машину
                await checkCarTank(car.carId);
                sentCount++;
            } catch (err) {
                console.warn(`Error processing car ${car.carId}:`, err);
            }
        }

        updateStatus(`📋 Выбрано ${sentCount} машин из комплекта ${slotNumber}`);
    } catch (error) {
        console.error("Error sending car set:", error);
        updateStatus("❌ Ошибка при отправке комплекта", true);
    }
}

/**
 * Отображает модальное окно для сохранения комплекта
 */
function saveSetModal() {
    try {
        // Проверяем, есть ли выбранные машины
        let selectedCount = document.querySelectorAll('.cars-trip-choose input[type="checkbox"]:checked:not([disabled])').length;
        if (selectedCount === 0) {
            updateStatus("❌ Не выбрано ни одной машины", true);
            return;
        }

        // Создаем модальное окно с затемнением
        const overlay = document.createElement('div');
        overlay.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 9998;';

        const modal = document.createElement('div');
        modal.className = 'mw-modal';
        modal.style.cssText = 'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: #fff8e1; border: 2px solid #ffcc80; border-radius: 12px; padding: 20px; z-index: 9999; box-shadow: 0 4px 8px rgba(0,0,0,0.2); min-width: 300px;';

        // Заголовок
        const heading = document.createElement('h3');
        heading.textContent = `Сохранить ${selectedCount} машин в комплект:`;
        heading.style.cssText = 'margin-top: 0; text-align: center;';

        // Кнопки для выбора комплектов
        const buttonsContainer = document.createElement('div');
        buttonsContainer.style.cssText = 'display: flex; justify-content: center; gap: 10px; margin-top: 15px;';

        // Создаем кнопки для каждого слота
        for (let i = 1; i <= 4; i++) {
            let setStr = localStorage.getItem(`mw-carset-${i}`);
            let existingCount = setStr ? JSON.parse(setStr).length : 0;

            let btn = document.createElement('button');
            btn.className = 'mw-btn';
            btn.textContent = `Комплект ${i}` + (existingCount ? ` (${existingCount})` : "");
            btn.style.cssText = 'padding: 8px 12px; cursor: pointer;';

            btn.addEventListener('click', function() {
                saveSet(i);
                modal.remove();
                overlay.remove();
            });

            buttonsContainer.appendChild(btn);
        }

        // Кнопка закрытия
        const closeBtn = document.createElement('button');
        closeBtn.textContent = '×';
        closeBtn.style.cssText = 'position: absolute; top: 10px; right: 10px; background: none; border: none; cursor: pointer; font-size: 16px;';
        closeBtn.addEventListener('click', function() {
            modal.remove();
            overlay.remove();
        });

        // Собираем всё вместе
        modal.appendChild(heading);
        modal.appendChild(buttonsContainer);
        modal.appendChild(closeBtn);

        // Добавляем на страницу
        document.body.appendChild(overlay);
        document.body.appendChild(modal);

        // Закрытие по клику на оверлей
        overlay.addEventListener('click', function() {
            modal.remove();
            overlay.remove();
        });
    } catch (error) {
        console.error("Error showing save set modal:", error);
        updateStatus("❌ Ошибка при открытии окна сохранения", true);
    }
}

/**
 * Отображает модальное окно для выбора комплекта
 */
function createSetSelectionModal() {
    try {
        // Создаем модальное окно
        const overlay = document.createElement('div');
        overlay.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 9998;';

        const modal = document.createElement('div');
        modal.className = 'mw-modal';
        modal.style.cssText = 'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: #fff8e1; border: 2px solid #ffcc80; border-radius: 12px; padding: 20px; z-index: 9999; box-shadow: 0 4px 8px rgba(0,0,0,0.2); min-width: 300px;';

        // Заголовок
        const heading = document.createElement('h3');
        heading.textContent = "Выберите комплект для отправки:";
        heading.style.cssText = 'margin-top: 0; text-align: center;';

        // Кнопки для выбора комплектов
        const buttonsContainer = document.createElement('div');
        buttonsContainer.style.cssText = 'display: flex; flex-direction: column; gap: 10px; margin-top: 15px;';

        let hasAnySet = false;

        // Создаем кнопки для каждого слота
        for (let i = 1; i <= 4; i++) {
            let setStr = localStorage.getItem(`mw-carset-${i}`);
            let setData = setStr ? JSON.parse(setStr) : [];
            let existingCount = setData.length;

            if (existingCount === 0) {
                // Пропускаем пустые комплекты
                continue;
            }

            hasAnySet = true;

            // Группируем рейсы по направлениям для более информативного отображения
            let destinations = {};
            for (let car of setData) {
                if (!destinations[car.rideId]) {
                    destinations[car.rideId] = 0;
                }
                destinations[car.rideId]++;
            }

            // Формируем описание комплекта
            let destinationsText = Object.entries(destinations)
                .map(([rideId, count]) => `${count} шт. на рейс ${rideId}`)
                .join(", ");

            let btn = document.createElement('button');
            btn.className = 'mw-btn';
            btn.innerHTML = `<strong>Комплект ${i}</strong> (${existingCount})<br><small>${destinationsText}</small>`;
            btn.style.cssText = 'padding: 8px 12px; cursor: pointer; text-align: left;';

            btn.addEventListener('click', function() {
                sendSet(i);
                modal.remove();
                overlay.remove();
            });

            buttonsContainer.appendChild(btn);
        }

        // Если нет сохраненных комплектов
        if (!hasAnySet) {
            const noSetsMsg = document.createElement('p');
            noSetsMsg.textContent = 'Нет сохраненных комплектов';
            noSetsMsg.style.textAlign = 'center';
            buttonsContainer.appendChild(noSetsMsg);
        }

        // Кнопка закрытия
        const closeBtn = document.createElement('button');
        closeBtn.textContent = '×';
        closeBtn.style.cssText = 'position: absolute; top: 10px; right: 10px; background: none; border: none; cursor: pointer; font-size: 16px;';
        closeBtn.addEventListener('click', function() {
            modal.remove();
            overlay.remove();
        });

        // Собираем всё вместе
        modal.appendChild(heading);
        modal.appendChild(buttonsContainer);
        modal.appendChild(closeBtn);

        // Добавляем на страницу
        document.body.appendChild(overlay);
        document.body.appendChild(modal);

        // Закрытие по клику на оверлей
        overlay.addEventListener('click', function() {
            modal.remove();
            overlay.remove();
        });
    } catch (error) {
        console.error("Error showing set selection modal:", error);
        updateStatus("❌ Ошибка при открытии окна выбора", true);
    }
}

    /**
     * Отображает уведомление
     * @param {string} t - Заголовок
     * @param {string} e - Текст сообщения
     */
    function showAlert(t = "", e = "") {
        try {
            let n = document.querySelector("#alert");
            if (n) n.remove();

            let o = document.createElement("div");
            o.id = "alert";
            o.innerHTML = `
                <div id="alert" style="position: fixed; left: 50%; top: 10%; transform: translateX(-50%); background-color: #fffbdb; border: 5px ridge #ffcc80; border-radius: 8px; box-shadow: 0 0 15px rgba(0, 0, 0, 0.2); min-width: 300px; max-width: 80%; padding: 10px 20px; z-index: 9999; animation: fadeIn 0.3s ease-out;">
                <h3 style="margin-top: 0; text-align: center;">${t}</h3>
                <div>${e}</div>
                <button id="alert-close" style="position: absolute; top: 5px; right: 5px; background: none; border: none; font-size: 18px; cursor: pointer;">&times;</button>
                </div>
            `;

            document.body.appendChild(o);
            document.getElementById("alert-close").addEventListener("click", () => {
                o.remove();
            });

            setTimeout(() => {
                o.remove();
            }, 5000);
        } catch (error) {
            console.error("Error showing alert:", error);
        }
    }

   // ======================================================= БЛОК БОЕВОЙ СИСТЕМЫ НАЧАЛО ==================================================//
    /**
 * Добавляет кнопки управления боем и включает автобой
 */
// НАЧАЛО ФУНКЦИИ setupBattleEnhancements
function setupBattleEnhancements() {
    // Если не страница боя, выходим
    if (!location.href.includes('/fight/')) return;

    console.log('[LinkIF] Настройка улучшений боя');

    // Проверяем, не добавлены ли уже улучшения
    if (document.querySelector('.linkif-fight-ctrl')) return;

    // Создаем контейнер для кнопок
    const controlPanel = document.createElement('div');
    controlPanel.className = 'linkif-fight-ctrl';
    controlPanel.style.cssText = 'text-align: center; margin: 10px 0;';

    // Кнопка автобоя
    const autoFightBtn = document.createElement('button');
    autoFightBtn.textContent = '⏩ Автобой';
    autoFightBtn.style.cssText = 'background: linear-gradient(to bottom, #ffe082, #ffca28); border: 2px solid #f57f17; border-radius: 5px; padding: 5px 10px; margin: 0 5px; cursor: pointer; font-weight: bold;';
    autoFightBtn.onclick = toggleAutoBattle;
    controlPanel.appendChild(autoFightBtn);

    // Кнопка фильтрации логов
    const filterLogsBtn = document.createElement('button');
    filterLogsBtn.textContent = '🧹 Фильтр логов';
    filterLogsBtn.style.cssText = 'background: linear-gradient(to bottom, #ffe082, #ffca28); border: 2px solid #f57f17; border-radius: 5px; padding: 5px 10px; margin: 0 5px; cursor: pointer; font-weight: bold;';
    filterLogsBtn.onclick = toggleLogsFilter;
    controlPanel.appendChild(filterLogsBtn);

    // Находим место для вставки
    const fightForm = document.getElementById('fightForm') || document.getElementById('fightGroupForm');
    if (!fightForm) {
        console.log('[LinkIF] Форма боя не найдена, пробуем найти другое место для вставки');
        const logContainer = document.querySelector('.log');
        if (logContainer) {
            logContainer.parentNode.insertBefore(controlPanel, logContainer);
        } else {
            console.log('[LinkIF] Не найдено подходящее место для вставки панели боя');
            return;
        }
    } else {
        fightForm.parentNode.insertBefore(controlPanel, fightForm);
    }

    // Если в URL есть npc=1, автоматически включаем автобой
    if (location.href.includes('npc=1') || location.href.includes('npc')) {
        console.log('[LinkIF] Обнаружен бой с NPC, включаем автобой');
        toggleAutoBattle();
    }

    console.log('[LinkIF] Улучшения боя настроены');
}
// КОНЕЦ ФУНКЦИИ setupBattleEnhancements

/**
 * Переключает режим автобоя
 */
// НАЧАЛО ФУНКЦИИ toggleAutoBattle
function toggleAutoBattle() {
    if (window.autoBattleInterval) {
        clearInterval(window.autoBattleInterval);
        window.autoBattleInterval = null;
        showNotification('Автобой отключен');
        return;
    }

    showNotification('Автобой включен');

    // Запускаем первый ход сразу
    doFightAction();

    // Устанавливаем интервал для последующих действий
    window.autoBattleInterval = setInterval(doFightAction, 1000);
}
// КОНЕЦ ФУНКЦИИ toggleAutoBattle

/**
 * Выполняет действие в бою
 */
// НАЧАЛО ФУНКЦИИ doFightAction
function doFightAction() {
    console.log('[LinkIF] Выполнение действия в бою');

    // Если мы ждем других игроков
    if (document.querySelector('#fight-actions > div.waiting')) {
        console.log('[LinkIF] Ожидание других игроков');
        return;
    }

    // Ищем разные варианты кнопок для нажатия

    // Вариант 1: Кнопка пропуска хода
    const skipBtn = document.querySelector('#actionSkip');
    if (skipBtn) {
        console.log('[LinkIF] Нажимаем кнопку пропуска хода');
        skipBtn.click();
        return;
    }

    // Вариант 2: Кнопка атаки
    const attackBtn = document.querySelector('input[name="action"][value="attack"]');
    if (attackBtn) {
        console.log('[LinkIF] Нажимаем кнопку атаки');
        attackBtn.click();
        return;
    }

    // Вариант 3: Кнопка skip
    const skipInputBtn = document.querySelector('input[name="action"][value="skip"]');
    if (skipInputBtn) {
        console.log('[LinkIF] Нажимаем кнопку пропуска');
        skipInputBtn.click();
        return;
    }

    // Вариант 4: Чекбокс автобоя
    const autoFightCheckbox = document.querySelector('#auto-fight-checkbox');
    if (autoFightCheckbox && !autoFightCheckbox.checked) {
        console.log('[LinkIF] Включаем встроенный автобой');
        autoFightCheckbox.click();
        return;
    }

    console.log('[LinkIF] Не найдено доступных действий');
}
// КОНЕЦ ФУНКЦИИ doFightAction

/**
 * Переключает фильтрацию логов боя
 */
// НАЧАЛО ФУНКЦИИ toggleLogsFilter
function toggleLogsFilter() {
    const logContainer = document.querySelector('.log > ul.fight-log .text');
    if (!logContainer) {
        console.log('[LinkIF] Контейнер логов не найден');
        return;
    }

    if (window.isLogsFiltered) {
        window.isLogsFiltered = false;

        // Восстанавливаем оригинальные логи
        if (window.originalLogs) {
            logContainer.innerHTML = window.originalLogs;
        }

        showNotification('Фильтрация логов отключена');
    } else {
        // Сохраняем оригинальные логи
        window.originalLogs = logContainer.innerHTML;
        window.isLogsFiltered = true;

        // Фильтруем логи
        filterBattleLogs();

        showNotification('Фильтрация логов включена');
    }
}
// КОНЕЦ ФУНКЦИИ toggleLogsFilter

/**
 * Фильтрует логи боя
 */
// НАЧАЛО ФУНКЦИИ filterBattleLogs
function filterBattleLogs() {
    const logContainer = document.querySelector('.log > ul.fight-log .text');
    if (!logContainer) {
        console.log('[LinkIF] Контейнер логов не найден для фильтрации');
        return;
    }

    console.log('[LinkIF] Фильтрация логов боя');

    // Находим имя игрока
    const playerName = document.querySelector('.fighter-name strong')?.textContent.trim() || '';

    // Обрабатываем все записи логов
    const entries = logContainer.querySelectorAll(':scope > div');
    entries.forEach(entry => {
        const text = entry.textContent.trim();

        // Скрываем сообщения NPC и неинформативные сообщения
        if (text.startsWith('NPC:') || text.includes('никто не пострадал') || text.includes('Брат Михалыча')) {
            entry.style.cssText = 'font-size: 0.9em; opacity: 0.6; color: #777;';
        }

        // Выделяем сообщения с уроном
        if (text.includes('наносит') && text.includes('урон')) {
            entry.style.cssText = 'font-weight: bold; color: #d32f2f;';
        }

        // Выделяем сообщения с лечением
        if (text.includes('Здоровье') && text.includes('восстанавливается')) {
            entry.style.cssText = 'font-weight: bold; color: #388e3c;';
        }

        // Выделяем сообщения с упоминанием игрока
        if (playerName && text.includes(playerName)) {
            entry.style.cssText = 'font-weight: bold; background-color: rgba(33, 150, 243, 0.1); border-left: 3px solid #2196F3; padding-left: 5px;';
        }
    });

    console.log('[LinkIF] Фильтрация логов боя завершена');
}
// КОНЕЦ ФУНКЦИИ filterBattleLogs

   //  ========================================================== БЛОК БОЕВОЙ СИСТЕМЫ КОНЕЦ  =================================================== //

/**
 * Функция инициализации скрипта
 */
// НАЧАЛО ФУНКЦИИ init
function init() {
    try {
        console.log('[LinkIF] Скрипт инициализируется...');

        // Инициализируем соответствующие функции в зависимости от текущей страницы
        const currentUrl = window.location.href;

        // Страница транспорта
        if (currentUrl.includes('/automobile/')) {
            console.log('[LinkIF] Обнаружена страница транспорта');
            initializeTransportPanel();
        }

        // Страница боя
        if (currentUrl.includes('/fight/')) {
            console.log('[LinkIF] Обнаружена страница боя');
            setupBattleEnhancements();
        }

        // Настраиваем наблюдатель за изменением URL
        setupUrlObserver();

        console.log('[LinkIF] Скрипт успешно инициализирован');
    } catch (error) {
        console.error("[LinkIF] Ошибка при инициализации скрипта:", error);
    }
}
// КОНЕЦ ФУНКЦИИ init

/**
 * Настраивает наблюдатель за изменениями URL
 */
// НАЧАЛО ФУНКЦИИ setupUrlObserver
function setupUrlObserver() {
    try {
        console.log('[LinkIF] Настраиваем наблюдатель за изменением URL');

        // Храним текущий URL
        let lastUrl = window.location.href;

        // Создаем функцию обработки изменений
        const handleUrlChange = () => {
            const currentUrl = window.location.href;

            if (currentUrl !== lastUrl) {
                console.log(`[LinkIF] Обнаружена навигация с ${lastUrl} на ${currentUrl}`);

                // Запускаем инициализацию при смене страницы
                if (currentUrl.includes('/automobile/') && !lastUrl.includes('/automobile/')) {
                    console.log('[LinkIF] Переход на страницу транспорта');
                    initializeTransportPanel();
                }

                if (currentUrl.includes('/fight/')) {
                    console.log('[LinkIF] Переход на страницу боя');
                    setupBattleEnhancements();
                }

                lastUrl = currentUrl;
            }
        };

        // Создаем наблюдателя за изменениями в DOM
        const observer = new MutationObserver(handleUrlChange);
        observer.observe(document.documentElement, {
            childList: true,
            subtree: true
        });

        // Также слушаем события popstate и pushstate
        window.addEventListener('popstate', handleUrlChange);

        // Отслеживаем программную смену URL
        const originalPushState = window.history.pushState;
        window.history.pushState = function() {
            originalPushState.apply(this, arguments);
            handleUrlChange();
        };

        console.log('[LinkIF] Наблюдатель за изменением URL установлен');
    } catch (error) {
        console.error("[LinkIF] Ошибка при настройке наблюдателя за URL:", error);
    }
}
// КОНЕЦ ФУНКЦИИ setupUrlObserver


/**
 * Инициализирует панель на странице транспорта
 */
// НАЧАЛО ФУНКЦИИ initializeTransportPanel
function initializeTransportPanel() {
    try {
        console.log('[LinkIF] Начинаем инициализацию панели транспорта');

        // Проверяем, что мы на странице транспорта
        if (!window.location.href.includes('/automobile/')) {
            console.log('[LinkIF] Не страница транспорта, инициализация панели отменена');
            return;
        }

        // Удаляем существующие панели
        ['mw-panel', 'linkif-panel', 'linkif-transport-panel'].forEach(id => {
            const oldPanel = document.getElementById(id);
            if (oldPanel) {
                console.log(`[LinkIF] Удаляем существующую панель ${id}`);
                oldPanel.remove();
            }
        });

        // Создаем CSS для панели, точно такой же, как в 6к
        addStyles(`
            .linkif-panel {
                background-color: #fff8e1;
                border-radius: 8px;
                border: 1px solid #e6af4b;
                padding: 10px;
                margin-bottom: 15px;
                text-align: center;
                box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            }
            .linkif-header {
                color: #ff5722;
                font-weight: bold;
                font-size: 16px;
                margin-bottom: 10px;
                text-shadow: 0 1px 1px rgba(0,0,0,0.1);
            }
            .linkif-active-set {
                font-size: 14px;
                margin-bottom: 15px;
                color: #333;
            }
            .linkif-slots {
                display: flex;
                justify-content: center;
                flex-wrap: wrap;
                margin-bottom: 15px;
                gap: 10px;
            }
            .linkif-slot {
                background-color: #ffe0b2;
                border: 1px solid #ffb74d;
                border-radius: 5px;
                padding: 8px 15px;
                position: relative;
                cursor: pointer;
                min-width: 80px;
                transition: all 0.2s ease;
            }
            .linkif-slot:hover {
                background-color: #ffd180;
                box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            }
            .linkif-slot-remove {
                position: absolute;
                top: -8px;
                right: -8px;
                background-color: #ef5350;
                color: white;
                width: 18px;
                height: 18px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 14px;
                font-weight: bold;
                cursor: pointer;
                box-shadow: 0 1px 3px rgba(0,0,0,0.2);
            }
            .linkif-status {
                font-style: italic;
                color: #666;
                margin: 10px 0;
                min-height: 20px;
            }
            .linkif-buttons {
                display: flex;
                justify-content: center;
                flex-wrap: wrap;
                gap: 10px;
                margin-bottom: 15px;
            }
            .linkif-button {
                background: linear-gradient(to bottom, #ffe082, #ffca28);
                border: 2px solid #f57f17;
                border-radius: 6px;
                padding: 8px 15px;
                font-weight: bold;
                cursor: pointer;
                min-width: 100px;
                transition: all 0.2s ease;
                box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            }
            .linkif-button:hover {
                background: linear-gradient(to bottom, #ffca28, #ffb300);
                box-shadow: 0 2px 5px rgba(0,0,0,0.2);
            }
            .linkif-kit-select {
                padding: 6px 10px;
                border: 1px solid #e6af4b;
                border-radius: 5px;
                margin-right: 10px;
                background-color: #fff;
                min-width: 120px;
            }
            .cars-container {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                gap: 12px;
                margin: 0 auto;
                max-width: 1100px;
                justify-content: center;
            }
            .cars-trip-choose.clearfix {
                position: relative;
                width: 100%;
                max-width: 1200px;
                margin-left: auto !important;
                margin-right: auto !important;
            }
            .cars-trip-choose.clearfix > div > ul {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                gap: 12px;
                margin: 0 auto;
                max-width: 1100px;
                justify-content: center;
            }
            .cars-trip-choose.clearfix > div > ul > li {
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
                border-radius: 8px;
                overflow: hidden;
                min-height: auto;
                height: auto;
                transition: transform 0.2s ease;
            }
            .cars-trip-choose.clearfix > div > ul > li:hover {
                transform: translateY(-3px);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
            }
        `);

        // Создаем основную панель
        const panel = document.createElement('div');
        panel.className = 'linkif-panel';

        // Создаем заголовок
        const header = document.createElement('div');
        header.className = 'linkif-header';
        header.textContent = 'LinkIF: Управление транспортом';
        panel.appendChild(header);

        // Создаем информацию об активном комплекте
        const activeSetInfo = document.createElement('div');
        activeSetInfo.className = 'linkif-active-set';
        activeSetInfo.id = 'linkif-active-set';

        const activeSetNum = window.activeSet || 0;
        const setStr = activeSetNum ? localStorage.getItem(`mw-carset-${activeSetNum}`) : null;
        const setCount = setStr ? JSON.parse(setStr).length : 0;

        activeSetInfo.textContent = `Активный комплект: ${activeSetNum || '-'} (${setCount} ${getNumEnding(setCount, ['машина', 'машины', 'машин'])})`;
        panel.appendChild(activeSetInfo);

        // Создаем контейнер для слотов
        const slotsContainer = document.createElement('div');
        slotsContainer.className = 'linkif-slots';

        // Создаем слоты
        for (let i = 1; i <= 4; i++) {
            const setStr = localStorage.getItem(`mw-carset-${i}`);
            const setCount = setStr ? JSON.parse(setStr).length : 0;

            const slot = document.createElement('div');
            slot.className = 'linkif-slot';
            slot.textContent = `Слот ${i} (${setCount})`;
            slot.setAttribute('data-slot', i);
            slot.onclick = function() {
                loadCarSet(parseInt(this.getAttribute('data-slot')));
            };

            // Добавляем крестик для удаления, если в слоте есть машины
            if (setCount > 0) {
                const removeBtn = document.createElement('div');
                removeBtn.className = 'linkif-slot-remove';
                removeBtn.textContent = '×';
                removeBtn.setAttribute('data-slot', i);
                removeBtn.onclick = function(e) {
                    e.stopPropagation();
                    clearSlot(parseInt(this.getAttribute('data-slot')));
                };
                slot.appendChild(removeBtn);
            }

            slotsContainer.appendChild(slot);
        }
        panel.appendChild(slotsContainer);

        // Создаем строку статуса
        const statusLine = document.createElement('div');
        statusLine.className = 'linkif-status';
        statusLine.id = 'linkif-status';
        statusLine.textContent = 'Ожидание действий...';
        panel.appendChild(statusLine);

        // Создаем контейнер для кнопок
        const buttonsContainer = document.createElement('div');
        buttonsContainer.className = 'linkif-buttons';

        // Создаем кнопки
        const saveBtn = document.createElement('button');
        saveBtn.className = 'linkif-button';
        saveBtn.textContent = 'Сохранить';
        saveBtn.onclick = saveCurrentCarSet;

        const sendBtn = document.createElement('button');
        sendBtn.className = 'linkif-button';
        sendBtn.textContent = 'Отправить';
        sendBtn.onclick = sendSelectedCars;

        const refuelBtn = document.createElement('button');
        refuelBtn.className = 'linkif-button';
        refuelBtn.textContent = 'Заправить все';
        refuelBtn.onclick = refuelAllCars;

        // Добавляем кнопки
        buttonsContainer.appendChild(saveBtn);
        buttonsContainer.appendChild(sendBtn);
        buttonsContainer.appendChild(refuelBtn);

        panel.appendChild(buttonsContainer);

        // Создаем выпадающий список и кнопку отправки комплекта
        const kitContainer = document.createElement('div');
        kitContainer.style.cssText = 'display: flex; justify-content: center; align-items: center;';

        const kitSelect = document.createElement('select');
        kitSelect.className = 'linkif-kit-select';
        kitSelect.id = 'linkif-kit-select';

        // Добавляем опции в выпадающий список
        for (let i = 1; i <= 4; i++) {
            const setStr = localStorage.getItem(`mw-carset-${i}`);
            const setCount = setStr ? JSON.parse(setStr).length : 0;

            const option = document.createElement('option');
            option.value = i;
            option.textContent = `Комплект ${i} (${setCount})`;
            kitSelect.appendChild(option);
        }

        const sendKitBtn = document.createElement('button');
        sendKitBtn.className = 'linkif-button';
        sendKitBtn.textContent = 'Отправить комплект';
        sendKitBtn.onclick = function() {
            const selectedKit = parseInt(kitSelect.value);
            if (!isNaN(selectedKit)) {
                loadAndSendCarSet(selectedKit);
            }
        };

        kitContainer.appendChild(kitSelect);
        kitContainer.appendChild(sendKitBtn);
        panel.appendChild(kitContainer);

        // Вставляем панель на страницу
        const insertTarget = document.querySelector("#content > div > div.block-bordered");

        if (insertTarget) {
            insertTarget.innerHTML = '';
            insertTarget.appendChild(panel);
            console.log('[LinkIF] Панель вставлена в блок block-bordered');
        } else {
            const carsList = document.querySelector('.cars-trip-choose, .cars-trip');
            if (carsList) {
                carsList.parentNode.insertBefore(panel, carsList);
                console.log('[LinkIF] Панель вставлена перед списком машин');
            }
        }

        // Запускаем реорганизацию сетки машин
        setTimeout(reorganizeCarsGrid, 300);

        console.log('[LinkIF] Панель управления транспортом инициализирована');
    } catch (error) {
        console.error("[LinkIF] Ошибка при инициализации панели транспорта:", error);
    }
}
// КОНЕЦ ФУНКЦИИ initializeTransportPanel

/**
 * Добавляет стили на страницу
 */
// НАЧАЛО ФУНКЦИИ addStyles
function addStyles(stylesText) {
    try {
        const styleElement = document.createElement('style');
        styleElement.textContent = stylesText;
        document.head.appendChild(styleElement);
    } catch (error) {
        console.error("[LinkIF] Ошибка при добавлении стилей:", error);
    }
}
// КОНЕЦ ФУНКЦИИ addStyles

/**
 * Реорганизует сетку машин по образцу из 6к
 */
// НАЧАЛО ФУНКЦИИ reorganizeCarsGrid
function reorganizeCarsGrid() {
    try {
        console.log('[LinkIF] Начинаем реорганизацию сетки машин');

        // Находим контейнер с машинами
        const carsList = document.querySelector('.cars-trip-choose.clearfix > div > ul');
        if (!carsList) {
            console.log('[LinkIF] Контейнер с машинами не найден');
            return;
        }

        // Получаем все машины
        const carItems = carsList.querySelectorAll('li');
        if (!carItems.length) {
            console.log('[LinkIF] Машины не найдены');
            return;
        }

        console.log(`[LinkIF] Найдено ${carItems.length} машин`);

        // Применяем стили к контейнеру с машинами
        carsList.style.cssText = `
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
            grid-gap: 10px;
            justify-content: center;
            width: 100%;
            max-width: 1200px;
            margin: 0 auto;
        `;

        // Настраиваем родительский контейнер
        const carsContainer = document.querySelector('.cars-trip-choose.clearfix');
        if (carsContainer) {
            carsContainer.style.cssText = `
                width: 100% !important;
                max-width: 1200px;
                margin: 0 auto !important;
            `;
        }

        // Разделяем машины по категориям
        let specialCars = [];      // Особые машины
        let airsAndBoats = [];     // Авиация и водный транспорт
        let normalCars = [];       // Обычные машины
        let disabledCars = [];     // Машины в поездке или с таймаутом

        // Сортируем машины по категориям
        carItems.forEach(car => {
            // Очищаем ненужные элементы
            car.querySelectorAll('table.title, table.ride-info').forEach(el => el.remove());

            // Улучшаем отображение машины
            car.style.cssText = `
                box-shadow: 0 2px 8px rgba(0,0,0,0.2);
                border-radius: 8px;
                overflow: hidden;
                min-height: auto;
                height: auto;
                transition: all 0.2s ease;
            `;

            // Добавляем эффект при наведении
            car.addEventListener('mouseenter', () => {
                car.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
                car.style.transform = 'translateY(-2px)';
            });

            car.addEventListener('mouseleave', () => {
                car.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
                car.style.transform = 'translateY(0)';
            });

            // Очищаем таймеры
            const timeout = car.querySelector('.timeout');
            if (timeout) {
                timeout.style.height = 'auto';
                Array.from(timeout.childNodes).forEach(node => {
                    if (node.nodeType === Node.TEXT_NODE) {
                        node.textContent = '';
                    }
                });
            }

            // Определяем категорию машины
            const carInput = car.querySelector('input[name="car"]');
            if (!carInput) return;

            const carId = parseInt(carInput.value);

            // Распределяем по категориям из 6к
            if ([11, 18, 15, 25, 26, 32, 33, 41, 42, 43, 44].includes(carId)) {
                specialCars.push(car);
            } else if (car.querySelector('.name')?.textContent.match(/самолет|лодка|яхта/i)) {
                airsAndBoats.push(car);
            } else if (car.querySelector('.timeout')) {
                disabledCars.push(car);
            } else {
                normalCars.push(car);
            }
        });

        // Очищаем контейнер и добавляем машины в нужном порядке
        carsList.innerHTML = '';

        // Добавляем машины в порядке из 6к
        [...specialCars, ...airsAndBoats, ...normalCars, ...disabledCars].forEach(car => {
            carsList.appendChild(car);
        });

        console.log('[LinkIF] Реорганизация сетки машин завершена');
    } catch (error) {
        console.error("[LinkIF] Ошибка при реорганизации сетки машин:", error);
    }
}
// КОНЕЦ ФУНКЦИИ reorganizeCarsGrid


/**
 * Загружает и отправляет комплект машин
 */
// НАЧАЛО ФУНКЦИИ loadAndSendCarSet
function loadAndSendCarSet(slotNumber) {
    try {
        console.log(`[LinkIF] Загружаем и отправляем комплект ${slotNumber}`);

        // Получаем сохраненный комплект
        const setStr = localStorage.getItem(`mw-carset-${slotNumber}`);

        if (!setStr) {
            updateTransportStatus(`Комплект ${slotNumber} пуст`);
            return;
        }

        const carSet = JSON.parse(setStr);

        if (carSet.length === 0) {
            updateTransportStatus(`Комплект ${slotNumber} пуст`);
            return;
        }

        // Устанавливаем текущий комплект
        window.activeSet = slotNumber;
        updateActiveSetInfo();

        updateTransportStatus(`Отправляем комплект ${slotNumber}: ${carSet.length} ${getNumEnding(carSet.length, ['машина', 'машины', 'машин'])}`);

        // Отправляем машины
        sendCarsFromSet(carSet);
    } catch (error) {
        console.error(`[LinkIF] Ошибка при загрузке и отправке комплекта ${slotNumber}:`, error);
    }
}
// КОНЕЦ ФУНКЦИИ loadAndSendCarSet

/**
 * Отправляет машины из комплекта
 */
// НАЧАЛО ФУНКЦИИ sendCarsFromSet
function sendCarsFromSet(carSet) {
    try {
        // Создаем массив элементов для отправки
        const elementsToSend = [];

        // Для каждой машины в комплекте находим соответствующий элемент
        carSet.forEach(car => {
            const carInput = document.querySelector(`input[name="car"][value="${car.carId}"]`);
            if (carInput) {
                const li = carInput.closest('li');
                elementsToSend.push({
                    carId: car.carId,
                    rideId: car.rideId,
                    element: li
                });
            }
        });

        // Отправляем найденные элементы
        sendCarsFromElements(elementsToSend);
    } catch (error) {
        console.error("[LinkIF] Ошибка при отправке машин из комплекта:", error);
    }
}
// КОНЕЦ ФУНКЦИИ sendCarsFromSet

/**
 * Отправляет машины по элементам
 */
// НАЧАЛО ФУНКЦИИ sendCarsFromElements
function sendCarsFromElements(elements) {
    try {
        // Счетчики
        let sent = 0;
        const total = elements.length;

        // Обновляем статус
        updateTransportStatus(`Отправляем ${total} ${getNumEnding(total, ['машину', 'машины', 'машин'])} из комплекта...`);

        // Функция для отправки одной машины
        async function sendOne(element) {
            try {
                const carId = element.carId;
                const rideId = element.rideId;

                // Заправляем машину
                await fetch(`/automobile/buypetrol/${carId}/`, {
                    method: "POST",
                    credentials: "include",
                    headers: { "Content-Type": "application/x-www-form-urlencoded" },
                    body: `__ajax=1&return_url=%2Fautomobile%2Fcar%2F${carId}`
                });

                // Отправляем машину
                await fetch("/automobile/ride/", {
                    method: "POST",
                    credentials: "include",
                    headers: { "Content-Type": "application/x-www-form-urlencoded" },
                    body: `car=${carId}&direction=${rideId}&__ajax=1`
                });

                console.log(`[LinkIF] Отправлена машина ${carId} в поездку ${rideId} из комплекта`);
                return true;
            } catch (e) {
                console.error('[LinkIF] Ошибка при отправке машины из комплекта:', e);
                return false;
            }
        }

        // Отправляем все машины последовательно
        async function processAll() {
            for (const element of elements) {
                const success = await sendOne(element);
                if (success) {
                    sent++;
                    updateTransportStatus(`Отправлено ${sent}/${total} из комплекта...`);
                }
            }

            // Обновляем окончательный статус
            updateTransportStatus(`Отправлено ${sent}/${total} ${getNumEnding(sent, ['машина', 'машины', 'машин'])} из комплекта`);

            // Обновляем сетку машин
            setTimeout(reorganizeCarsGrid, 500);
        }

        // Запускаем процесс
        processAll();
    } catch (error) {
        console.error("[LinkIF] Ошибка при отправке машин по элементам:", error);
    }
}
// КОНЕЦ ФУНКЦИИ sendCarsFromElements




/**
 * Заправляет все машины, кроме полных
 */
// НАЧАЛО ФУНКЦИИ refuelAllCars
function refuelAllCars() {
    try {
        console.log('[LinkIF] Начинаем заправку машин с неполным баком');

        // Находим все машины
        const carItems = document.querySelectorAll('li');
        if (!carItems.length) {
            updateTransportStatus('Машины для заправки не найдены');
            return;
        }

        // Фильтруем машины, у которых бак не полон
        const needsRefuel = [];
        carItems.forEach(item => {
            const fuelEl = item.querySelector('.fuel');
            if (fuelEl) {
                const fuelText = fuelEl.textContent;
                const match = fuelText.match(/(\d+)\/(\d+)/);

                if (match && match.length === 3) {
                    const current = parseInt(match[1]);
                    const max = parseInt(match[2]);

                    if (current < max) {
                        const carInput = item.querySelector('input[name="car"]');
                        if (carInput) {
                            needsRefuel.push(carInput);
                        }
                    }
                }
            }
        });

        const totalCars = needsRefuel.length;
        console.log(`[LinkIF] Найдено ${totalCars} машин для заправки`);

        if (totalCars === 0) {
            updateTransportStatus('Все баки полные');
            return;
        }

        // Обновляем статус
        updateTransportStatus(`Заправляем ${totalCars} ${getNumEnding(totalCars, ['машину', 'машины', 'машин'])}...`);

        // Заправляем машины последовательно
        refuelCarsSequentially(needsRefuel);
    } catch (error) {
        console.error("[LinkIF] Ошибка при заправке машин:", error);
        updateTransportStatus('Ошибка при заправке');
    }
}
// КОНЕЦ ФУНКЦИИ refuelAllCars

/**
 * Заправляет машины последовательно
 */
// НАЧАЛО ФУНКЦИИ refuelCarsSequentially
async function refuelCarsSequentially(carElements) {
    try {
        let refueledCount = 0;
        const totalCars = carElements.length;

        // Функция для заправки одной машины
        async function refuelOne(element) {
            try {
                const carId = element.value;

                await fetch(`/automobile/buypetrol/${carId}/`, {
                    method: "POST",
                    credentials: "include",
                    headers: { "Content-Type": "application/x-www-form-urlencoded" },
                    body: `__ajax=1&return_url=%2Fautomobile%2Fcar%2F${carId}`
                });

                console.log(`[LinkIF] Заправлена машина ${carId}`);
                return true;
            } catch (e) {
                console.error(`[LinkIF] Ошибка при заправке машины ${element.value}:`, e);
                return false;
            }
        }

        // Заправляем все машины последовательно
        for (const element of carElements) {
            const success = await refuelOne(element);
            if (success) {
                refueledCount++;
                updateTransportStatus(`Заправляем: ${refueledCount}/${totalCars}`);
            }
        }

        // Финальное обновление статуса
        updateTransportStatus(`Заправлено ${refueledCount}/${totalCars} ${getNumEnding(refueledCount, ['машина', 'машины', 'машин'])}`);

        // Обновляем сетку машин после заправки
        setTimeout(reorganizeCarsGrid, 500);
    } catch (error) {
        console.error("[LinkIF] Ошибка при последовательной заправке машин:", error);
    }
}
// КОНЕЦ ФУНКЦИИ refuelCarsSequentially

/**
 * Сохраняет текущий набор выбранных машин
 */
// НАЧАЛО ФУНКЦИИ saveCurrentCarSet
function saveCurrentCarSet() {
    try {
        console.log('[LinkIF] Сохраняем текущий набор машин');

        // Показываем модальное окно для выбора слота
        const slotNumber = window.prompt("Укажите номер слота (1-4) для сохранения комплекта:", "1");

        if (!slotNumber || isNaN(parseInt(slotNumber)) || parseInt(slotNumber) < 1 || parseInt(slotNumber) > 4) {
            console.log('[LinkIF] Некорректный номер слота или отмена');
            return;
        }

        const slot = parseInt(slotNumber);

        // Собираем выбранные машины
        const selectedCars = [];
        const checkboxes = document.querySelectorAll('input[type="checkbox"]:checked');

        console.log(`[LinkIF] Найдено ${checkboxes.length} выбранных машин`);

        checkboxes.forEach(checkbox => {
            const li = checkbox.closest("li");
            if (!li) return;

            const carInput = li.querySelector('input[name="car"]');
            const dirInput = li.querySelector('input[name="direction"]');

            if (!carInput || !dirInput) return;

            selectedCars.push({
                carId: carInput.value,
                rideId: dirInput.value,
                name: li.querySelector(".name")?.textContent || `Машина ${carInput.value}`
            });
        });

        // Сохраняем в localStorage
        localStorage.setItem(`mw-carset-${slot}`, JSON.stringify(selectedCars));
        console.log(`[LinkIF] Сохраняем ${selectedCars.length} машин в слот ${slot}`);

        // Обновляем текст в слоте
        const slotElement = document.querySelector(`.linkif-slot[data-slot="${slot}"]`);
        if (slotElement) {
            // Обновляем текст
            slotElement.textContent = `Слот ${slot} (${selectedCars.length})`;

            // Добавляем или обновляем кнопку удаления
            if (selectedCars.length > 0) {
                // Удаляем старую кнопку, если есть
                const oldRemoveBtn = slotElement.querySelector('.linkif-slot-remove');
                if (oldRemoveBtn) {
                    oldRemoveBtn.remove();
                }

                // Добавляем новую кнопку
                const removeBtn = document.createElement('div');
                removeBtn.className = 'linkif-slot-remove';
                removeBtn.textContent = '×';
                removeBtn.setAttribute('data-slot', slot);
                removeBtn.onclick = function(e) {
                    e.stopPropagation();
                    clearSlot(parseInt(this.getAttribute('data-slot')));
                };
                slotElement.appendChild(removeBtn);
            }
        }

        // Обновляем выпадающий список
        const kitSelect = document.getElementById('linkif-kit-select');
        if (kitSelect) {
            const options = kitSelect.querySelectorAll('option');
            options.forEach(option => {
                if (parseInt(option.value) === slot) {
                    option.textContent = `Комплект ${slot} (${selectedCars.length})`;
                }
            });
        }

        // Обновляем статус и показываем уведомление
        updateTransportStatus(`Сохранено ${selectedCars.length} ${getNumEnding(selectedCars.length, ['машина', 'машины', 'машин'])} в комплект ${slot}`);
        showNotification(`✅ Сохранено ${selectedCars.length} ${getNumEnding(selectedCars.length, ['машина', 'машины', 'машин'])} в комплект ${slot}`);

        // Устанавливаем текущий активный слот
        window.activeSet = slot;
        updateActiveSetInfo();
    } catch (error) {
        console.error("[LinkIF] Ошибка при сохранении комплекта машин:", error);
        showNotification("❌ Ошибка при сохранении комплекта машин", true);
    }
}
// КОНЕЦ ФУНКЦИИ saveCurrentCarSet

/**
 * Загружает сохраненный набор машин из слота
 */
// НАЧАЛО ФУНКЦИИ loadCarSet
function loadCarSet(slotNumber) {
    try {
        console.log(`[LinkIF] Загружаем комплект машин из слота ${slotNumber}`);

        // Получаем сохраненный комплект
        const setStr = localStorage.getItem(`mw-carset-${slotNumber}`);

        if (!setStr) {
            updateTransportStatus(`Комплект ${slotNumber} пуст`);
            return;
        }

        const carSet = JSON.parse(setStr);

        if (carSet.length === 0) {
            updateTransportStatus(`Комплект ${slotNumber} пуст`);
            return;
        }

        // Сбрасываем текущий выбор
        document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            checkbox.checked = false;
        });

        // Устанавливаем галочки согласно комплекту
        let appliedCount = 0;

        carSet.forEach(car => {
            const selector = `input[name="car"][value="${car.carId}"]`;
            const carInput = document.querySelector(selector);

            if (carInput) {
                const li = carInput.closest("li");
                if (!li) return;

                const checkbox = li.querySelector('input[type="checkbox"]');
                if (checkbox && !checkbox.disabled) {
                    checkbox.checked = true;
                    appliedCount++;
                }
            }
        });

        // Обновляем информацию
        window.activeSet = slotNumber;
        updateActiveSetInfo();

        updateTransportStatus(`Загружен комплект ${slotNumber}: отмечено ${appliedCount} ${getNumEnding(appliedCount, ['машина', 'машины', 'машин'])}`);
    } catch (error) {
        console.error(`[LinkIF] Ошибка при загрузке комплекта машин из слота ${slotNumber}:`, error);
    }
}
// КОНЕЦ ФУНКЦИИ loadCarSet

/**
 * Отправляет выбранные машины в поездку с уведомлениями
 */
// НАЧАЛО ФУНКЦИИ sendSelectedCars
function sendSelectedCars() {
    try {
        console.log('[LinkIF] Отправка выбранных машин');

        // Находим все выбранные чекбоксы
        const selectedCheckboxes = document.querySelectorAll('input[type="checkbox"]:checked');

        if (selectedCheckboxes.length === 0) {
            updateTransportStatus('Нет выбранных машин для отправки');
            showNotification('Нет выбранных машин для отправки', true);
            return;
        }

        console.log(`[LinkIF] Найдено ${selectedCheckboxes.length} выбранных машин`);

        // Собираем машины для отправки
        const carsToSend = [];

        selectedCheckboxes.forEach(checkbox => {
            const li = checkbox.closest("li");
            if (!li) return;

            const carInput = li.querySelector('input[name="car"]');
            const dirInput = li.querySelector('input[name="direction"]');

            if (!carInput || !dirInput) return;

            carsToSend.push({
                carId: carInput.value,
                rideId: dirInput.value,
                checkbox: checkbox
            });
        });

        // Счетчики для отслеживания прогресса
        let successCount = 0;
        let totalToSend = carsToSend.length;

        // Обновляем статус
        updateTransportStatus(`Отправляем ${totalToSend} ${getNumEnding(totalToSend, ['машину', 'машины', 'машин'])}...`);

        // Функция для отправки одной машины
        async function sendCar(car) {
            try {
                const carId = car.carId;
                const rideId = car.rideId;

                // Заправляем машину
                await fetch(`/automobile/buypetrol/${carId}/`, {
                    method: "POST",
                    credentials: "include",
                    headers: { "Content-Type": "application/x-www-form-urlencoded" },
                    body: `__ajax=1&return_url=%2Fautomobile%2Fcar%2F${carId}`
                });

                // Отправляем в поездку
                const response = await fetch("/automobile/ride/", {
                    method: "POST",
                    credentials: "include",
                    headers: { "Content-Type": "application/x-www-form-urlencoded" },
                    body: `car=${carId}&direction=${rideId}&__ajax=1`
                });

                // Снимаем выделение
                car.checkbox.checked = false;

                console.log(`[LinkIF] Отправлена машина ${carId} в поездку ${rideId}`);

                const carName = car.checkbox.closest("li").querySelector(".name")?.textContent || `Машина ${carId}`;
                showNotification(`✅ ${carName}<br>Успешно отправлена`);

                return true;
            } catch (error) {
                console.error(`[LinkIF] Ошибка при отправке машины ${carId}:`, error);
                showNotification(`❌ Ошибка при отправке машины ${carId}`, true);
                return false;
            }
        }

        // Отправляем машины последовательно
        async function sendAllCarsSequentially() {
            for (const car of carsToSend) {
                const success = await sendCar(car);
                if (success) {
                    successCount++;

                    // Обновляем статус после каждой успешной отправки
                    updateTransportStatus(`Отправляем: ${successCount}/${totalToSend}`);
                }
            }

            // Финальное обновление статуса
            updateTransportStatus(`Отправлено ${successCount}/${totalToSend} ${getNumEnding(successCount, ['машина', 'машины', 'машин'])}`);
            showNotification(`🚗 Отправлено ${successCount} из ${totalToSend} машин`);

            // Обновляем сетку машин после завершения отправки
            setTimeout(reorganizeCarsGrid, 500);
        }

        // Запускаем отправку
        sendAllCarsSequentially();
    } catch (error) {
        console.error("[LinkIF] Ошибка при отправке выбранных машин:", error);
        showNotification("❌ Произошла ошибка при отправке машин", true);
    }
}
// КОНЕЦ ФУНКЦИИ sendSelectedCars


    /**
 * Отправляет машины последовательно
 */
// НАЧАЛО ФУНКЦИИ sendCarsSequentially
function sendCarsSequentially(elements) {
    try {
        // Счетчики для отслеживания процесса
        let sent = 0;
        const total = elements.length;

        // Обновляем статус
        updateTransportStatus(`Отправляем ${total} ${getNumEnding(total, ['машину', 'машины', 'машин'])}...`);

        // Функция для отправки одной машины
        async function sendOne(element) {
            try {
                // Находим данные о машине
                const li = element.closest('li');
                if (!li) return false;

                const carInput = li.querySelector('input[name="car"]');
                const dirInput = li.querySelector('input[name="direction"]');

                if (!carInput || !dirInput) return false;

                const carId = carInput.value;
                const rideId = dirInput.value;

                // Заправляем машину
                await fetch(`/automobile/buypetrol/${carId}/`, {
                    method: "POST",
                    credentials: "include",
                    headers: { "Content-Type": "application/x-www-form-urlencoded" },
                    body: `__ajax=1&return_url=%2Fautomobile%2Fcar%2F${carId}`
                });

                // Отправляем машину
                await fetch("/automobile/ride/", {
                    method: "POST",
                    credentials: "include",
                    headers: { "Content-Type": "application/x-www-form-urlencoded" },
                    body: `car=${carId}&direction=${rideId}&__ajax=1`
                });

                // Снимаем выделение с чекбокса
                if (element.tagName === 'INPUT') {
                    element.checked = false;
                }

                console.log(`[LinkIF] Отправлена машина ${carId} в поездку ${rideId}`);
                return true;
            } catch (e) {
                console.error('[LinkIF] Ошибка при отправке машины:', e);
                return false;
            }
        }

        // Отправляем машины последовательно
        async function processAll() {
            for (const element of elements) {
                const success = await sendOne(element);
                if (success) {
                    sent++;
                    updateTransportStatus(`Отправлено ${sent}/${total}...`);
                }
            }

            // Обновляем окончательный статус
            updateTransportStatus(`Отправлено ${sent}/${total} ${getNumEnding(sent, ['машина', 'машины', 'машин'])}`);

            // Обновляем сетку машин
            setTimeout(reorganizeCarsGrid, 500);
        }

        // Запускаем процесс
        processAll();
    } catch (error) {
        console.error("[LinkIF] Ошибка при последовательной отправке машин:", error);
    }
}
// КОНЕЦ ФУНКЦИИ sendCarsSequentially





// НАЧАЛО ФУНКЦИИ updateActiveSetInfo
function updateActiveSetInfo() {
    try {
        const activeSetEl = document.querySelector('.linkif-active-set');
        if (!activeSetEl) return;

        const activeSetNum = window.activeSet || 0;
        const setStr = activeSetNum ? localStorage.getItem(`mw-carset-${activeSetNum}`) : null;
        const setCount = setStr ? JSON.parse(setStr).length : 0;

        activeSetEl.textContent = `Активный комплект: ${activeSetNum || '-'} (${setCount} ${getNumEnding(setCount, ['машина', 'машины', 'машин'])})`;
    } catch (error) {
        console.error("[LinkIF] Ошибка при обновлении информации об активном комплекте:", error);
    }
}
// КОНЕЦ ФУНКЦИИ updateActiveSetInfo

/**
 * Обновляет статусную строку
 */
// НАЧАЛО ФУНКЦИИ updateTransportStatus
function updateTransportStatus(message) {
    try {
        const statusElement = document.getElementById('linkif-status');
        if (statusElement) {
            statusElement.textContent = message;

            // Добавляем анимацию обновления
            statusElement.style.backgroundColor = '#fff8dc';
            setTimeout(() => {
                statusElement.style.backgroundColor = 'transparent';
                statusElement.style.transition = 'background-color 1s ease-out';
            }, 100);
        } else {
            console.log(`[LinkIF] Статус: ${message}`);
        }
    } catch (error) {
        console.error("[LinkIF] Ошибка при обновлении статуса:", error);
    }
}
// КОНЕЦ ФУНКЦИИ updateTransportStatus

    /**
 * Обновляет статусную строку информацией о текущем комплекте
 */
// НАЧАЛО ФУНКЦИИ updateStatusWithCurrentKit
function updateStatusWithCurrentKit() {
    try {
        const kitSelect = document.getElementById('linkif-kit-select');
        if (!kitSelect) return;

        const selectedSlot = parseInt(kitSelect.value) || 1;
        const setStr = localStorage.getItem(`mw-carset-${selectedSlot}`);

        if (!setStr || JSON.parse(setStr).length === 0) {
            updateTransportStatus(`Комплект ${selectedSlot} пуст`);
        } else {
            const cars = JSON.parse(setStr);
            updateTransportStatus(`Комплект ${selectedSlot} содержит ${cars.length} ${getNumEnding(cars.length, ['машина', 'машины', 'машин'])}`);
        }
    } catch (error) {
        console.error("[LinkIF] Ошибка при обновлении статуса комплекта:", error);
    }
}
// КОНЕЦ ФУНКЦИИ updateStatusWithCurrentKit

/**
 * Вспомогательная функция для правильных окончаний
 */
// НАЧАЛО ФУНКЦИИ getNumEnding
function getNumEnding(number, endings) {
    const cases = [2, 0, 1, 1, 1, 2];
    return endings[(number % 100 > 4 && number % 100 < 20) ? 2 : cases[Math.min(number % 10, 5)]];
}
// КОНЕЦ ФУНКЦИИ getNumEnding

/**
 * Настройка наблюдателей для панелей с меньшим количеством логов
 */
// НАЧАЛО ФУНКЦИИ setupPanelObservers
function setupPanelObservers() {
    try {
        console.log('[LinkIF] Настраиваем наблюдатели за панелями');

        // Наблюдатель за изменениями URL - проверяем каждые 2 секунды
        const currentUrl = window.location.href;

        // Если уже есть интервал, очищаем его
        if (window.linkIfUrlInterval) {
            clearInterval(window.linkIfUrlInterval);
        }

        window.linkIfUrlInterval = setInterval(() => {
            if (window.location.href !== currentUrl) {
                console.log(`[LinkIF] Обнаружена навигация на новый URL: ${window.location.href}`);

                // Перезапускаем инициализацию для новой страницы
                init();

                // Очищаем текущий интервал
                clearInterval(window.linkIfUrlInterval);
            }
        }, 2000);

        // Наблюдатель за DOM для страницы транспорта
        if (currentUrl.includes('/automobile/')) {
            // Если уже есть наблюдатель, отключаем его
            if (window.linkIfTransportObserver) {
                window.linkIfTransportObserver.disconnect();
            }

            // Наблюдаем за целевым элементом block-bordered
            const targetBlock = document.querySelector("#content > div > div.block-bordered");

            if (targetBlock) {
                window.linkIfTransportObserver = new MutationObserver((mutations) => {
                    // Проверяем, не была ли уже запущена панель недавно
                    if (!document.getElementById('mw-panel') &&
                        !document.getElementById('mw-panel-processing') &&
                        typeof Ut === "function") {

                        console.log('[LinkIF] Панель транспорта отсутствует, создаем');

                        // Временная метка, что панель обрабатывается
                        const processingMark = document.createElement('div');
                        processingMark.id = 'mw-panel-processing';
                        processingMark.style.display = 'none';
                        document.body.appendChild(processingMark);

                        // Создаем панель с небольшой задержкой
                        setTimeout(() => {
                            initializeTransportPanel();
                            processingMark.remove();
                        }, 100);
                    }
                });

                window.linkIfTransportObserver.observe(targetBlock, {
                    childList: true,
                    subtree: false
                });

                console.log('[LinkIF] Наблюдатель за страницей транспорта настроен');
            }
        }
    } catch (error) {
        console.error("[LinkIF] Ошибка при настройке наблюдателей:", error);
    }
}
// КОНЕЦ ФУНКЦИИ setupPanelObservers

/**
 * Добавляет стили для панели транспорта
 */
// НАЧАЛО ФУНКЦИИ addTransportPanelStyles
function addTransportPanelStyles() {
    // Удаляем старые стили если они есть
    const oldStyles = document.getElementById('mw-panel-styles');
    if (oldStyles) oldStyles.remove();

    const style = document.createElement('style');
    style.id = 'mw-panel-styles';
    style.textContent = `
        #mw-panel {
            background: #fff8e1;
            border: 2px solid #ffcc80;
            padding: 0;
            border-radius: 12px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
            width: 100%;
            margin: 0 0 15px 0;
            font-family: Arial, sans-serif;
            position: relative;
            z-index: 1000;
        }
        .mw-header {
            background-color: #ffe0b2;
            color: #e65100;
            font-weight: bold;
            padding: 10px;
            border-bottom: 1px solid #ffcc80;
            border-radius: 10px 10px 0 0;
            text-align: center;
        }
        .mw-content {
            padding: 10px 15px;
        }
        #mw-active-set {
            font-weight: bold;
            margin-bottom: 10px;
            color: #e65100;
            text-align: center;
        }
        #mw-slots {
            display: flex;
            justify-content: center;
            flex-wrap: wrap;
        }
        .mw-slot {
            display: inline-block;
            margin: 4px;
            padding: 6px 10px;
            border: 1px solid #ffb74d;
            border-radius: 6px;
            background: #ffe0b2;
            font-weight: bold;
            position: relative;
            cursor: pointer;
        }
        .mw-slot:hover {
            background: #ffd180;
        }
        .mw-slot .reset-btn {
            position: absolute;
            top: -6px;
            right: -6px;
            background: #ef5350;
            color: white;
            border: none;
            border-radius: 50%;
            width: 18px;
            height: 18px;
            font-size: 12px;
            cursor: pointer;
            z-index: 2;
        }
        .mw-divider {
            display: inline-block;
            width: 10px;
            height: 32px;
        }
        .mw-btn {
            background: linear-gradient(to bottom, #ffe082, #ffca28);
            border: 2px solid #f57f17;
            border-radius: 8px;
            padding: 6px 12px;
            font-weight: bold;
            margin: 5px;
            cursor: pointer;
        }
        .mw-btn:hover {
            background: linear-gradient(to bottom, #ffca28, #ffb300);
        }
        .mw-status-line {
            margin-top: 10px;
            font-style: italic;
            color: #555;
            text-align: center;
        }
    `;
    document.head.appendChild(style);
    console.log('[LinkIF] Стили для панели транспорта добавлены');
}
// КОНЕЦ ФУНКЦИИ addTransportPanelStyles
// КОНЕЦ ФУНКЦИИ initializeTransportPanel
// КОНЕЦ ФУНКЦИИ initializeTransportPanel  //  Конец функции ======initializeTransportPanel


    /**
 * Устанавливает обработчик для отслеживания скрытия панели
 */
// НАЧАЛО ФУНКЦИИ setupPanelWatcher
function setupPanelWatcher() {
    try {
        console.log('[LinkIF] Настраиваем наблюдатель за панелью транспорта');

        // Наблюдатель за изменениями в DOM
        const observer = new MutationObserver((mutations) => {
            // Проверяем видимость панели
            const panel = document.getElementById('linkif-transport-panel');

            if (!panel && window.location.href.includes('/automobile/')) {
                console.log('[LinkIF] Панель транспорта исчезла, пересоздаем');
                initializeTransportPanel();
                return;
            }

            if (panel) {
                const style = window.getComputedStyle(panel);
                if (style.display === 'none' || style.visibility === 'hidden' || parseFloat(style.opacity) < 0.1) {
                    console.log('[LinkIF] Панель транспорта скрыта CSS-правилами, восстанавливаем');
                    panel.style.display = 'block !important';
                    panel.style.visibility = 'visible !important';
                    panel.style.opacity = '1 !important';

                    // Если это не помогло, пересоздаем
                    setTimeout(() => {
                        const recheckedStyle = window.getComputedStyle(panel);
                        if (recheckedStyle.display === 'none' || recheckedStyle.visibility === 'hidden' || parseFloat(recheckedStyle.opacity) < 0.1) {
                            initializeTransportPanel();
                        }
                    }, 300);
                }
            }
        });

        // Настраиваем наблюдатель за всей страницей
        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['style', 'class', 'id']
        });

        console.log('[LinkIF] Наблюдатель за панелью транспорта настроен');

        // Дополнительно запускаем периодическую проверку
        window.linkIfPanelInterval = setInterval(() => {
            if (window.location.href.includes('/automobile/')) {
                const panel = document.getElementById('linkif-transport-panel');
                if (!panel) {
                    console.log('[LinkIF] Периодическая проверка: панель отсутствует, пересоздаем');
                    initializeTransportPanel();
                } else {
                    const style = window.getComputedStyle(panel);
                    if (style.display === 'none' || style.visibility === 'hidden' || parseFloat(style.opacity) < 0.1) {
                        console.log('[LinkIF] Периодическая проверка: панель скрыта, пересоздаем');
                        initializeTransportPanel();
                    }
                }
            } else {
                clearInterval(window.linkIfPanelInterval);
            }
        }, 3000);
    } catch (error) {
        console.error("Error setting up panel watcher:", error);
    }
}
// КОНЕЦ ФУНКЦИИ setupPanelWatcher







/**
 * Сохраняет выбранные машины в указанный слот
 */
function saveSelectedCarsToSlot(slotNumber, selectedCars) {
    try {
        // Собираем данные о выбранных машинах
        const carsData = Array.from(selectedCars).map(checkbox => {
            const li = checkbox.closest('li');
            if (!li) return null;

            const carInput = li.querySelector('input[name="car"]');
            const dirInput = li.querySelector('input[name="direction"]:checked');

            if (!carInput || !dirInput) return null;

            return {
                carId: carInput.value,
                rideId: dirInput.value
            };
        }).filter(car => car !== null);

        console.log(`[LinkIF] Сохраняем ${carsData.length} машин в слот ${slotNumber}`);

        // Сохраняем в локальное хранилище
        localStorage.setItem(`mw-carset-${slotNumber}`, JSON.stringify(carsData));
        localStorage.setItem('mw-last-set-used', slotNumber.toString());

        updateTransportStatus(`Сохранено ${carsData.length} машин в комплект ${slotNumber}`);

        // Обновляем интерфейс
        updateActiveSetInfo();
        updateSlotButtons();
    } catch (error) {
        console.error("Error saving cars to slot:", error);
        updateTransportStatus("Ошибка при сохранении комплекта", true);
    }
}



/**
 * Очищает слот с комплектом машин
 */
// НАЧАЛО ФУНКЦИИ clearSlot
function clearSlot(slotNumber) {
    try {
        console.log(`[LinkIF] Очищаем слот ${slotNumber}`);

        // Проверяем существование данных в слоте
        const setStr = localStorage.getItem(`mw-carset-${slotNumber}`);
        if (!setStr) {
            updateTransportStatus(`Слот ${slotNumber} уже пуст`);
            return;
        }

        // Подтверждение очистки
        if (!confirm(`Вы действительно хотите очистить слот ${slotNumber}?`)) {
            return;
        }

        // Удаляем данные из localStorage
        localStorage.removeItem(`mw-carset-${slotNumber}`);

        // Обновляем отображение слота
        const slotElement = document.querySelector(`.linkif-slot[data-slot="${slotNumber}"]`);
        if (slotElement) {
            // Удаляем крестик, если он есть
            const removeBtn = slotElement.querySelector('.linkif-slot-remove');
            if (removeBtn) {
                removeBtn.remove();
            }

            // Обновляем текст
            slotElement.textContent = `Слот ${slotNumber} (0)`;
        }

        // Обновляем активный комплект, если это был он
        if (window.activeSet === slotNumber) {
            window.activeSet = 0;
            updateActiveSetInfo();
        }

        // Обновляем статус и показываем уведомление
        updateTransportStatus(`Слот ${slotNumber} очищен`);
        showNotification(`🗑 Слот ${slotNumber} очищен`);
    } catch (error) {
        console.error(`[LinkIF] Ошибка при очистке слота ${slotNumber}:`, error);
        showNotification(`❌ Ошибка при очистке слота ${slotNumber}`, true);
    }
}
// КОНЕЦ ФУНКЦИИ clearSlot

/**
 * Обновляет кнопки слотов
 */
function updateSlotButtons() {
    try {
        for (let i = 1; i <= 4; i++) {
            const setStr = localStorage.getItem(`mw-carset-${i}`);
            const setCount = setStr ? JSON.parse(setStr).length : 0;

            const slotBtn = document.querySelector(`.linkif-slot-button[data-slot="${i}"]`);
            if (slotBtn) {
                // Обновляем текст кнопки
                slotBtn.textContent = `Слот ${i} (${setCount})`;

                // Управляем кнопкой очистки
                let clearBtn = slotBtn.querySelector('.linkif-slot-clear');
                if (setCount > 0) {
                    if (!clearBtn) {
                        clearBtn = document.createElement('span');
                        clearBtn.className = 'linkif-slot-clear';
                        clearBtn.textContent = '×';
                        clearBtn.setAttribute('data-slot', i);
                        clearBtn.addEventListener('click', function(e) {
                            e.stopPropagation();
                            clearSlot(i);
                        });
                        slotBtn.appendChild(clearBtn);
                    }
                } else if (clearBtn) {
                    clearBtn.remove();
                }
            }
        }
    } catch (error) {
        console.error("Error updating slot buttons:", error);
    }
}

/**
 * Обрабатывает очередь отправки машин
 */
function processSendQueue(queue, index, successCount) {
    if (index >= queue.length) {
        updateTransportStatus(`Отправлено ${successCount} машин из ${queue.length}`);
        return;
    }

    const item = queue[index];
    const statusEl = document.getElementById('linkif-status');
    if (statusEl) {
        statusEl.textContent = `Отправляем ${index + 1} из ${queue.length}...`;
    }

    // Заправляем машину перед отправкой
    checkAndRefuelCar(item.carId)
        .then(() => {
            // Отправляем машину
            return fetch("https://www.moswar.ru/automobile/ride/", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    "X-Requested-With": "XMLHttpRequest"
                },
                body: `car=${item.carId}&direction=${item.rideId}&__ajax=1&return_url=%2Fautomobile%2F`
            });
        })
        .then(() => {
            // Снимаем выделение с отправленной машины
            item.checkbox.checked = false;
            successCount++;

            // Продолжаем со следующей машиной после небольшой задержки
            setTimeout(() => {
                processSendQueue(queue, index + 1, successCount);
            }, 300);
        })
        .catch(error => {
            console.error(`Error sending car ${item.carId}:`, error);
            // Продолжаем со следующей машиной даже при ошибке
            setTimeout(() => {
                processSendQueue(queue, index + 1, successCount);
            }, 300);
        });
}

/**
 * Проверяет и заправляет машину при необходимости
 */
function checkAndRefuelCar(carId) {
    return new Promise((resolve, reject) => {
        // Получаем информацию о машине
        fetch("https://www.moswar.ru/automobile/transport-info/", {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "X-Requested-With": "XMLHttpRequest"
            },
            body: `car=${carId}&__ajax=1&return_url=%2Fautomobile%2F`
        })
        .then(response => response.text())
        .then(data => {
            try {
                const jsonData = JSON.parse(data);
                if (!jsonData || !jsonData.content) {
                    resolve();
                    return;
                }

                // Создаем временный элемент для парсинга HTML
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = jsonData.content;

                // Проверяем уровень топлива
                const fuelDiv = tempDiv.querySelector("td.fuel div");
                if (!fuelDiv) {
                    resolve();
                    return;
                }

                const fuelWidth = fuelDiv.style.width;
                const fuelLevel = parseInt(fuelWidth, 10);

                if (isNaN(fuelLevel) || fuelLevel >= 30) {
                    resolve();
                    return;
                }

                // Заправляем машину если топлива мало
                console.log(`[⛽] Машина ${carId} нуждается в заправке (${fuelLevel}%)`);

                fetch("https://www.moswar.ru/automobile/fill/", {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                        "X-Requested-With": "XMLHttpRequest"
                    },
                    body: `car=${carId}&__ajax=1&return_url=%2Fautomobile%2F`
                })
                .then(() => {
                    console.log(`[⛽] Машина ${carId} заправлена`);
                    resolve();
                })
                .catch(error => {
                    console.error(`Ошибка при заправке машины ${carId}:`, error);
                    resolve(); // Продолжаем даже при ошибке
                });
            } catch (e) {
                console.error(`Ошибка при проверке топлива машины ${carId}:`, e);
                resolve(); // Продолжаем даже при ошибке
            }
        })
        .catch(error => {
            console.error(`Ошибка при получении информации о машине ${carId}:`, error);
            resolve(); // Продолжаем даже при ошибке
        });
    });
}

/**
 * Заправляет все машины
 */

/**
 * Обрабатывает очередь заправки машин
 */
function processRefuelQueue(carIds, index, refueledCount) {
    if (index >= carIds.length) {
        updateTransportStatus(`Проверено ${carIds.length} машин, заправлено: ${refueledCount}`);
        return;
    }

    const carId = carIds[index];
    const statusEl = document.getElementById('linkif-status');
    if (statusEl) {
        statusEl.textContent = `Проверяем топливо ${index + 1} из ${carIds.length}...`;
    }

    // Получаем информацию о машине
    fetch("https://www.moswar.ru/automobile/transport-info/", {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "X-Requested-With": "XMLHttpRequest"
        },
        body: `car=${carId}&__ajax=1&return_url=%2Fautomobile%2F`
    })
    .then(response => response.text())
    .then(data => {
        try {
            const jsonData = JSON.parse(data);
            if (!jsonData || !jsonData.content) {
                processNextCar();
                return;
            }

            // Создаем временный элемент для парсинга HTML
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = jsonData.content;

            // Проверяем уровень топлива
            const fuelDiv = tempDiv.querySelector("td.fuel div");
            if (!fuelDiv) {
                processNextCar();
                return;
            }

            const fuelWidth = fuelDiv.style.width;
            const fuelLevel = parseInt(fuelWidth, 10);

            if (isNaN(fuelLevel) || fuelLevel >= 30) {
                processNextCar();
                return;
            }

            // Заправляем машину если топлива мало
            console.log(`[⛽] Машина ${carId} нуждается в заправке (${fuelLevel}%)`);

            fetch("https://www.moswar.ru/automobile/fill/", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    "X-Requested-With": "XMLHttpRequest"
                },
                body: `car=${carId}&__ajax=1&return_url=%2Fautomobile%2F`
            })
            .then(() => {
                console.log(`[⛽] Машина ${carId} заправлена`);
                processNextCar(true);
            })
            .catch(error => {
                console.error(`Ошибка при заправке машины ${carId}:`, error);
                processNextCar();
            });
        } catch (e) {
            console.error(`Ошибка при проверке топлива машины ${carId}:`, e);
            processNextCar();
        }
    })
    .catch(error => {
        console.error(`Ошибка при получении информации о машине ${carId}:`, error);
        processNextCar();
    });

    function processNextCar(wasRefueled = false) {
        setTimeout(() => {
            processRefuelQueue(carIds, index + 1, refueledCount + (wasRefueled ? 1 : 0));
        }, 300);
    }
}



function addUrlChangeListener() {
    try {
        // Сохраняем текущий URL для отслеживания изменений
        let currentUrl = window.location.href;

        // Функция для проверки изменений URL
        const checkUrlChange = () => {
            if (window.location.href !== currentUrl) {
                const previousUrl = currentUrl;
                currentUrl = window.location.href;

                // При смене URL переинициализируем компоненты
                console.log(`[LinkIF] Обнаружена навигация с ${previousUrl} на ${currentUrl}`);

                if (currentUrl.includes("/fight/")) {
                    console.log("[LinkIF] Обнаружена страница боя, инициализируем обработку логов");

                    // Если сразу не получилось, пробуем несколько раз с интервалом
                    let attempts = 0;
                    const maxAttempts = 5;

                    function attemptCleanupLogs() {
                        attempts++;
                        cleanupFightLogs();

                        // Проверяем, создана ли панель
                        if (!document.getElementById('linkif-fight-controls') && attempts < maxAttempts) {
                            console.log(`[LinkIF] Попытка ${attempts}/${maxAttempts} не удалась, пробуем снова через 500ms`);
                            setTimeout(attemptCleanupLogs, 500);
                        }
                    }

                    // Запускаем первую попытку сразу
                    attemptCleanupLogs();
                }

                if (currentUrl.includes("/automobile/")) {
                    console.log("[LinkIF] Обнаружена страница транспорта, инициализируем панель");

                    // Если сразу не получилось, пробуем несколько раз с интервалом
                    let attempts = 0;
                    const maxAttempts = 5;

                    function attemptInitPanel() {
                        attempts++;
                        initializeTransportPanel();

                        // Проверяем, создана ли панель
                        if (!document.getElementById('linkif-transport-panel') && attempts < maxAttempts) {
                            console.log(`[LinkIF] Попытка ${attempts}/${maxAttempts} не удалась, пробуем снова через 500ms`);
                            setTimeout(attemptInitPanel, 500);
                        }
                    }

                    // Запускаем первую попытку с небольшой задержкой
                    setTimeout(attemptInitPanel, 300);
                }
            }
        };

        // Проверяем URL каждую секунду
        setInterval(checkUrlChange, 1000);

        // Также слушаем события pushState и replaceState
        const originalPushState = history.pushState;
        const originalReplaceState = history.replaceState;

        history.pushState = function() {
            originalPushState.apply(this, arguments);
            setTimeout(checkUrlChange, 100);
        };

        history.replaceState = function() {
            originalReplaceState.apply(this, arguments);
            setTimeout(checkUrlChange, 100);
        };

        // И события popstate
        window.addEventListener('popstate', () => setTimeout(checkUrlChange, 100));

        console.log('[LinkIF] Добавлен слушатель изменений URL');
    } catch (error) {
        console.error("Error adding URL change listener:", error);
    }
}
    // Запускаем скрипт после загрузки страницы
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
// ВСТАВИТЬ СЮДА ↓
    /**
 * Инициализирует таймеры для различных активностей
 */
    function initializeTimers() {
        try {
            // Проверяем, что таймеры еще не инициализированы
            if (document.getElementById('mw-timers')) return;

            // Стили для таймеров
            const timerStyles = `
            #mw-timers {
                position: fixed;
                right: 10px;
                top: 60px;
                width: 250px;
                background: rgba(255, 248, 225, 0.9);
                border: 2px solid #ffcc80;
                border-radius: 12px;
                padding: 10px;
                z-index: 999;
                box-shadow: 0 4px 8px rgba(0,0,0,0.1);
                font-family: Arial, sans-serif;
            }
            #mw-timers h3 {
                margin-top: 0;
                margin-bottom: 10px;
                text-align: center;
                border-bottom: 1px solid #ffcc80;
                padding-bottom: 5px;
            }
            #mw-timers-toggle {
                position: fixed;
                right: 10px;
                top: 10px;
                background: rgba(255, 248, 225, 0.9);
                border: 2px solid #ffcc80;
                border-radius: 50%;
                width: 40px;
                height: 40px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                z-index: 999;
                box-shadow: 0 2px 5px rgba(0,0,0,0.1);
                font-size: 20px;
            }
            .mw-timer-item {
                display: flex;
                align-items: center;
                margin-bottom: 5px;
                padding: 5px;
                border-radius: 5px;
                transition: background-color 0.2s;
            }
            .mw-timer-item:hover {
                background-color: rgba(255, 204, 128, 0.3);
            }
            .mw-timer-icon {
                width: 24px;
                height: 24px;
                margin-right: 10px;
                object-fit: contain;
            }
            .mw-timer-value {
                margin-left: auto;
                font-weight: bold;
            }
        `;

            // Добавляем стили
            const styleEl = document.createElement('style');
            styleEl.textContent = timerStyles;
            document.head.appendChild(styleEl);

            // Создаем кнопку переключения таймеров
            const toggleBtn = document.createElement('div');
            toggleBtn.id = 'mw-timers-toggle';
            toggleBtn.textContent = '⏱️';
            toggleBtn.title = 'Показать/скрыть таймеры';
            document.body.appendChild(toggleBtn);

            // Создаем контейнер для таймеров
            const timersContainer = document.createElement('div');
            timersContainer.id = 'mw-timers';
            timersContainer.innerHTML = '<h3>Таймеры</h3><div id="mw-timers-list"></div>';
            document.body.appendChild(timersContainer);

            // Устанавливаем видимость на основе сохраненного значения
            const visible = localStorage.getItem('mw-timers-visible') !== 'false';
            timersContainer.style.display = visible ? 'block' : 'none';

            // Обработчик для кнопки переключения
            toggleBtn.addEventListener('click', function() {
                const isVisible = timersContainer.style.display !== 'none';
                timersContainer.style.display = isVisible ? 'none' : 'block';
                localStorage.setItem('mw-timers-visible', isVisible ? 'false' : 'true');
            });

            // Конфигурация таймеров
            const timerConfig = [
                {
                    selector: "#timer-shaurburgers-work .value",
                    url: "https://www.moswar.ru/shaurburgers/",
                    imgSrc: "/@/images/obj/clan/shaurburgers/logo.png",
                    targetHref: "/shaurburgers/",
                    name: "Шаурбургерс"
                },
                {
                    selector: "#timer-patrol .value",
                    url: "https://www.moswar.ru/alley/",
                    imgSrc: "/@/images/pers/man2_thumb.png",
                    targetHref: "/alley/",
                    name: "Патруль"
                },
                {
                    selector: "#kopaem .process td#metrodig",
                    url: "https://www.moswar.ru/metro/",
                    imgSrc: "/@/images/pers/npc1_thumb.png",
                    targetHref: "/metro/",
                    name: "Метро"
                }
            ];

            // Функция для создания элемента таймера
            function createTimerElement(config, timerValue) {
                const timerItem = document.createElement('div');
                timerItem.className = 'mw-timer-item';

                const icon = document.createElement('img');
                icon.className = 'mw-timer-icon';
                icon.src = config.imgSrc;

                const name = document.createElement('span');
                name.className = 'mw-timer-name';
                name.textContent = config.name || '';

                const value = document.createElement('span');
                value.className = 'mw-timer-value';
                value.textContent = formatTime(timerValue);

                timerItem.appendChild(icon);
                timerItem.appendChild(name);
                timerItem.appendChild(value);

                // При клике переходить на страницу активности
                timerItem.style.cursor = 'pointer';
                timerItem.addEventListener('click', function() {
                    window.location.href = config.targetHref;
                });

                return { timerItem, valueElement: value };
            }

            // Функция для обновления таймеров
            async function updateTimers() {
                const timersList = document.getElementById('mw-timers-list');
                if (!timersList) return;

                timersList.innerHTML = '';

                for (const config of timerConfig) {
                    try {
                        // Получаем данные таймера с указанной страницы
                        const response = await fetch(config.url);
                        const html = await response.text();
                        const htmlDoc = parseHtml(html);

                        const element = htmlDoc.querySelector(config.selector);
                        if (!element) continue;

                        const timerVal = element.getAttribute('timer');
                        if (!timerVal || timerVal <= 0) continue;

                        // Создаем элемент таймера
                        const { timerItem, valueElement } = createTimerElement(config, timerVal);
                        timersList.appendChild(timerItem);

                        // Запускаем отсчет
                        let remainingTime = parseInt(timerVal);
                        const interval = setInterval(() => {
                            remainingTime--;
                            if (remainingTime <= 0) {
                                clearInterval(interval);
                                valueElement.textContent = 'Готово!';
                                valueElement.style.color = '#4caf50';
                            } else {
                                valueElement.textContent = formatTime(remainingTime);
                            }
                        }, 1000);
                    } catch (error) {
                        console.error(`Error updating timer for ${config.url}:`, error);
                    }
                }
            }

            // Инициализируем таймеры и обновляем их каждые 5 минут
            updateTimers();
            setInterval(updateTimers, 5 * 60 * 1000);

            console.log("[LinkIF] Таймеры инициализированы");
        } catch (error) {
            console.error("Error initializing timers:", error);
        }
    }

// Закрывающие скобки скрипта после вставки















/**
 * Создает и показывает всплывающее уведомление
 * @param {string} message - Текст сообщения
 * @param {boolean} isError - Флаг ошибки (меняет цвет уведомления)
 * @param {number} timeout - Время отображения в миллисекундах
 */
// НАЧАЛО ФУНКЦИИ showNotification
function showNotification(message, isError = false, timeout = 3000) {
    try {
        // Удаляем старые уведомления
        const existingNotifications = document.querySelectorAll('.linkif-notification');
        if (existingNotifications.length > 5) {
            existingNotifications.forEach((notification, index) => {
                if (index < existingNotifications.length - 5) {
                    notification.remove();
                }
            });
        }

        // Создаем контейнер для уведомлений, если его нет
        let notificationsContainer = document.getElementById('linkif-notifications');
        if (!notificationsContainer) {
            notificationsContainer = document.createElement('div');
            notificationsContainer.id = 'linkif-notifications';
            notificationsContainer.style.cssText = 'position: fixed; bottom: 20px; right: 20px; z-index: 9999; width: 250px;';
            document.body.appendChild(notificationsContainer);
        }

        // Создаем само уведомление
        const notification = document.createElement('div');
        notification.className = 'linkif-notification';
        notification.innerHTML = message;
        notification.style.cssText = `
            background-color: ${isError ? '#ffcdd2' : '#e8f5e9'};
            color: ${isError ? '#b71c1c' : '#1b5e20'};
            border-left: 4px solid ${isError ? '#f44336' : '#4caf50'};
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            border-radius: 4px;
            padding: 10px 15px;
            margin-top: 8px;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;

        // Добавляем уведомление на страницу
        notificationsContainer.appendChild(notification);

        // Плавное появление
        setTimeout(() => {
            notification.style.opacity = '1';
        }, 10);

        // Таймер для исчезновения
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 300);
        }, timeout);

    } catch (error) {
        console.error("[LinkIF] Ошибка при показе уведомления:", error);
    }
}
// КОНЕЦ ФУНКЦИИ showNotification




})();