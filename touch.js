Реализация долгого тапа для сенсорных экранов
Реализовать долгий тап для сенсорных экранов вполне возможно! Это позволит пользователям на мобильных устройствах вызывать то же контекстное меню, которое доступно через правый клик мыши на десктопах.

Техническая реализация долгого тапа:






function setupLongTapDetection() {
    // Минимальное время для определения долгого тапа (в миллисекундах)
    const LONG_PRESS_DURATION = 500; 
    
    // Переменные для отслеживания состояния
    let pressTimer;
    let startX, startY;
    let hasMovedTooMuch = false;
    const MOVE_THRESHOLD = 10; // Допустимое смещение пальца в пикселях
    
    // Обработчик начала касания
    document.addEventListener('touchstart', function(e) {
        // Запоминаем начальную позицию касания
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        hasMovedTooMuch = false;
        
        // Запускаем таймер
        pressTimer = setTimeout(function() {
            // Если палец не двигался слишком сильно, считаем это долгим тапом
            if (!hasMovedTooMuch) {
                // Определяем элемент, на который был совершен долгий тап
                const target = document.elementFromPoint(startX, startY);
                showContextMenu(e, target);
            }
        }, LONG_PRESS_DURATION);
    }, {passive: false});
    
    // Отслеживаем движение пальца
    document.addEventListener('touchmove', function(e) {
        const currentX = e.touches[0].clientX;
        const currentY = e.touches[0].clientY;
        
        // Вычисляем расстояние, на которое сместился палец
        const distX = Math.abs(currentX - startX);
        const distY = Math.abs(currentY - startY);
        
        // Если смещение слишком большое, отменяем долгий тап
        if (distX > MOVE_THRESHOLD || distY > MOVE_THRESHOLD) {
            hasMovedTooMuch = true;
            clearTimeout(pressTimer);
        }
    }, {passive: false});
    
    // Отменяем таймер при завершении касания
    document.addEventListener('touchend', function() {
        clearTimeout(pressTimer);
    }, {passive: false});
    
    // Предотвращаем появление стандартного меню браузера
    document.addEventListener('contextmenu', function(e) {
        if (e.pointerType === 'touch') {
            e.preventDefault();
        }
    }, {passive: false});
}

// Функция для отображения контекстного меню
function showContextMenu(event, target) {
    // Отменяем стандартное поведение
    event.preventDefault();
    
    // Создаем контекстное меню, если оно еще не существует
    let contextMenu = document.getElementById('custom-context-menu');
    if (!contextMenu) {
        contextMenu = document.createElement('div');
        contextMenu.id = 'custom-context-menu';
        contextMenu.style.cssText = `
            position: fixed;
            background: rgba(0, 0, 0, 0.9);
            border: 1px solid #ffcc80;
            border-radius: 8px;
            padding: 5px 0;
            min-width: 150px;
            z-index: 1000;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
        `;
        document.body.appendChild(contextMenu);
    }
    
    // Определяем контент меню в зависимости от элемента
    let menuItems = determineMenuItems(target);
    
    // Очищаем и заполняем меню
    contextMenu.innerHTML = '';
    menuItems.forEach(item => {
        const menuItem = document.createElement('div');
        menuItem.className = 'context-menu-item';
        menuItem.innerHTML = item.label;
        menuItem.style.cssText = `
            padding: 8px 12px;
            color: #fff;
            cursor: pointer;
            font-size: 14px;
        `;
        
        // Добавляем разделительную линию при необходимости
        if (item.divider) {
            menuItem.style.borderTop = '1px solid rgba(255, 255, 255, 0.2)';
        }
        
        // Подсветка при наведении
        menuItem.addEventListener('mouseenter', function() {
            this.style.backgroundColor = 'rgba(255, 204, 128, 0.2)';
        });
        menuItem.addEventListener('mouseleave', function() {
            this.style.backgroundColor = '';
        });
        
        // Обработчик клика
        menuItem.addEventListener('click', function() {
            // Закрываем меню
            contextMenu.style.display = 'none';
            
            // Выполняем действие
            if (item.action) {
                item.action(target);
            }
        });
        
        contextMenu.appendChild(menuItem);
    });
    
    // Отображаем меню в месте долгого тапа
    const x = event.touches ? event.touches[0].clientX : event.clientX;
    const y = event.touches ? event.touches[0].clientY : event.clientY;
    
    // Проверяем, не выходит ли меню за границы экрана
    const menuWidth = contextMenu.offsetWidth;
    const menuHeight = contextMenu.offsetHeight;
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    
    // Корректируем позицию, если меню выходит за границы
    let posX = x;
    let posY = y;
    
    if (x + menuWidth > windowWidth) {
        posX = windowWidth - menuWidth - 5;
    }
    
    if (y + menuHeight > windowHeight) {
        posY = windowHeight - menuHeight - 5;
    }
    
    contextMenu.style.left = posX + 'px';
    contextMenu.style.top = posY + 'px';
    contextMenu.style.display = 'block';
    
    // Закрываем меню при клике вне его
    const closeContextMenu = function() {
        contextMenu.style.display = 'none';
        document.removeEventListener('click', closeContextMenu);
        document.removeEventListener('touchstart', closeContextMenu);
    };
    
    setTimeout(() => {
        document.addEventListener('click', closeContextMenu);
        document.addEventListener('touchstart', closeContextMenu);
    }, 100);
}

// Функция для определения пунктов меню в зависимости от элемента
function determineMenuItems(target) {
    // Базовое меню по умолчанию
    let menuItems = [
        { 
            label: '📋 Копировать',
            action: (el) => {
                const text = window.getSelection().toString() || el.innerText;
                if (text) {
                    navigator.clipboard.writeText(text)
                        .then(() => showNotification('✅ Текст скопирован'))
                        .catch(() => showNotification('❌ Не удалось скопировать'));
                }
            }
        }
    ];
    
    // Если это игрок (проверяем наличие ссылки на профиль)
    if (target.closest('a[href*="/player/"]') || 
        target.closest('.fighter1') || 
        target.closest('.fighter2')) {
        
        // Находим ID игрока
        let playerLink = target.closest('a[href*="/player/"]');
        let playerId;
        
        if (playerLink) {
            playerId = playerLink.href.match(/\/player\/(\d+)\//)?.[1];
        }
        
        if (playerId) {
            menuItems = [
                {
                    label: '🔍 Профиль игрока',
                    action: () => window.open(`https://www.moswar.ru/player/${playerId}/`, '_blank')
                },
                {
                    label: '📝 Написать сообщение',
                    action: () => window.open(`https://www.moswar.ru/phone/messages/send/${playerId}/`, '_blank')
                },
                {
                    label: '👥 Добавить в контакты',
                    action: () => addToContacts(playerId)
                },
                {
                    label: '⚔️ Атаковать игрока',
                    divider: true,
                    action: () => window.open(`https://www.moswar.ru/alley/fight/${playerId}/`, '_blank')
                }
            ];
        }
    }
    
    // Если элемент внутри лога боя
    else if (target.closest('.fight-log-content, .log-entry')) {
        menuItems.push(
            {
                label: '🔍 Увеличить размер текста',
                action: () => increaseFontSize('.fight-log-content')
            },
            {
                label: '🔎 Уменьшить размер текста',
                action: () => decreaseFontSize('.fight-log-content')
            },
            {
                label: '📄 Сохранить бой',
                divider: true,
                action: () => saveFightLog()
            }
        );
    }
    
    return menuItems;
}

// Вспомогательные функции для действий в меню
function showNotification(message) {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 10px 20px;
        border-radius: 20px;
        z-index: 1001;
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transition = 'opacity 0.5s';
        setTimeout(() => notification.remove(), 500);
    }, 2000);
}

function increaseFontSize(selector) {
    const element = document.querySelector(selector);
    if (element) {
        const currentSize = window.getComputedStyle(element).fontSize;
        const newSize = (parseFloat(currentSize) * 1.2) + 'px';
        element.style.fontSize = newSize;
    }
}

function decreaseFontSize(selector) {
    const element = document.querySelector(selector);
    if (element) {
        const currentSize = window.getComputedStyle(element).fontSize;
        const newSize = (parseFloat(currentSize) / 1.2) + 'px';
        element.style.fontSize = newSize;
    }
}

function saveFightLog() {
    const logContent = document.querySelector('.fight-log-content')?.innerText;
    if (!logContent) return;
    
    const date = new Date().toISOString().replace(/[T:]/g, '-').slice(0, 19);
    const fileName = `fight-log-${date}.txt`;
    
    // Создаем невидимый элемент для скачивания
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(logContent));
    element.setAttribute('download', fileName);
    element.style.display = 'none';
    
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    showNotification('✅ Лог боя сохранен');
}

function addToContacts(playerId) {
    // Реализация добавления в контакты
    fetch("https://www.moswar.ru/phone/contacts/add/", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            "X-Requested-With": "XMLHttpRequest"
        },
        body: `name=+${playerId}&clan=&info=&type=friend&__ajax=1&return_url=%2Fphone%2Fcontacts%2Fadd%2F`,
        credentials: "include"
    })
    .then(response => response.text())
    .then(() => showNotification('✅ Добавлено в контакты'))
    .catch(() => showNotification('❌ Ошибка добавления'));
}

// Инициализация обработки долгих тапов
document.addEventListener('DOMContentLoaded', setupLongTapDetection);