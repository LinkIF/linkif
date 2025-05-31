// MosWar 6k - Улучшенный скрипт для Московских Войн
// Часть 4/7

    /**
     * Автопилот - автоматическое выполнение различных игровых действий
     */
    async function autoPilot() {
      try {
        console.log("[AutoPilot] Starting automated tasks");
        
        // Проверяем и восстанавливаем здоровье
        await checkAndRestoreHealth();
        
        // Проверяем наличие бесплатных игр у Цыганки
        await playGypsy();
        
        // Пробуем записаться на радио Сити-FM
        await signUpForSiri();
        
        // Пробуем обменять токены Сити-FM
        await tradeAllSiri();
        
        // Проверяем возможность ускорения в подземке
        await dungeonSpeedUp();
        
        // Проверяем возможность ускорения на Поле Чудес
        await kubovichSpeedUp();
        
        // Проверяем возможность пропуска боя с Нефть Ленином
        await neftLeninSkipFight();
        
        // Проверяем наличие деталей бронежилета
        await checkBronikPieces();
        
        // Пробуем буст клана
        await boostClan();
        
        // Запускаем патрулирование
        await patrolMode();
        
        // Запускаем работу в метро
        await metroWorkMode();
        
        updateStatus("🤖 Выполнены автоматические задачи");
        
        // Запускаем автопилот снова через 1 час
        setTimeout(autoPilot, 60 * 60 * 1000);
      } catch (error) {
        console.error("Error in autoPilot:", error);
        // В случае ошибки пробуем снова через 10 минут
        setTimeout(autoPilot, 10 * 60 * 1000);
      }
    }
    
    /**
     * Снимаем предмет экипировки
     * @param {string} slotId - ID слота экипировки
     */
    async function undressItem(slotId = "hat") {
      try {
        console.log(`[Undress] Removing item from slot ${slotId}`);
        
        // Отправляем запрос на снятие предмета
        await fetch("https://www.moswar.ru/player/", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            "X-Requested-With": "XMLHttpRequest"
          },
          body: `action=undress_${slotId}&undress=${slotId}&__ajax=1&return_url=%2Fplayer%2F`,
          credentials: "include"
        });
        
        console.log(`[Undress] Item removed from slot ${slotId}`);
        updateStatus(`👕 Снят предмет из слота ${slotId}`);
      } catch (error) {
        console.error(`Error undressing item from slot ${slotId}:`, error);
      }
    }
    
    // Константа для блокировки машины в гараже
    var BANNED_CARS = ["vergil"];
    
    // Константа для определения исключений машин
    var EXCEPTION_CARS = ["eclipse", "бентли", "мотоцикл", "премиум"];
    
    // Константа для определения типов поездок на самолетах и лодках
    var PLANES_AND_BOATS_RIDES_IDS = {
      boats: ["7", "8", "9", "10"],
      planes: ["3", "4", "5", "6"]
    };
    
    // Константа для определения исключений типов поездок на самолетах и лодках
    var EXCEPTION_PLANES_AND_BOATS_RIDES_IDS = [];
    
    // HTTP заголовки для запросов
    var HEADERS = {
      accept: "*/*",
      "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
      "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin",
      "x-requested-with": "XMLHttpRequest"
    };
    
    /**
     * Отправляет выбранный транспорт
     */
    async function sendTransport() {
      try {
        console.log("[Transport] Sending selected transport");
        
        const transportForm = document.getElementById("carstripselector");
        if (!transportForm) {
          console.error("[Transport] Transport form not found");
          return;
        }
        
        // Получаем выбранные машины
        const selectedTransport = document.querySelectorAll(".cars-trip-choose input[type='checkbox']:checked");
        if (!selectedTransport.length) {
          console.error("[Transport] No transport selected");
          updateStatus("❌ Не выбрано ни одной машины", true);
          return;
        }
        
        console.log(`[Transport] Sending ${selectedTransport.length} vehicles`);
        
        // Собираем данные формы
        const formData = new FormData(transportForm);
        
        // Преобразуем FormData в строку запроса
        const body = new URLSearchParams(formData).toString() + "&action=send&__ajax=1&return_url=%2Fautomobile%2F";
        
        // Отправляем запрос
        const response = await fetch("https://www.moswar.ru/automobile/", {
          method: "POST",
          headers: {
            ...HEADERS,
            "content-type": "application/x-www-form-urlencoded; charset=UTF-8"
          },
          body,
          credentials: "include"
        });
        
        const result = await response.json();
        
        if (result.success) {
          console.log(`[Transport] ${selectedTransport.length} vehicles sent successfully`);
          updateStatus(`🚗 Отправлено ${selectedTransport.length} ед. транспорта`);
        } else {
          console.error("[Transport] Failed to send transport:", result.error || "Unknown error");
          updateStatus("❌ Ошибка при отправке транспорта", true);
        }
      } catch (error) {
        console.error("Error sending transport:", error);
        updateStatus("❌ Ошибка при отправке транспорта", true);
      }
    }
    
    /**
     * Рисует основную панель управления
     */
    function renderPanel() {
      try {
        // Проверяем, существует ли уже панель
        if (document.getElementById("mw-panel")) {
          return;
        }
        
        console.log("[UI] Rendering control panel");
        
        // Создаем панель
        const panel = document.createElement("div");
        panel.id = "mw-panel";
        panel.innerHTML = `
          <h3 style="margin-top: 0;">MosWar 6k</h3>
          
          <div id="mw-sets-summary"></div>
          
          <div class="mw-buttons-row">
            <button class="mw-btn" id="mw-patrol">🚔 Патруль</button>
            <button class="mw-btn" id="mw-metro">🚇 Метро</button>
            <button class="mw-btn" id="mw-farm">👊 Фарм</button>
            <button class="mw-btn" id="mw-tv">📺 ТВ</button>
            <div class="mw-divider"></div>
            <button class="mw-btn" id="mw-fill-all">⛽ Заправить все</button>
            <button class="mw-btn" id="mw-save-set">💾 Сохранить комплект</button>
            <button class="mw-btn" id="mw-autopilot">🤖 Автопилот</button>
          </div>
          
          <div class="mw-status-line">
            <span id="mw-active-set">Комплект 1</span>
            <span style="margin-left: 20px;" id="mw-status">Ожидание действий...</span>
          </div>
        `;
        
        // Добавляем панель на страницу
        document.body.insertBefore(panel, document.body.firstChild);
        
        // Обновляем индикатор активного комплекта
        updateSetIndicator();
        
        // Рисуем сводку по комплектам
        drawSetSummary();
        
        // Добавляем обработчики событий
        document.getElementById("mw-patrol").addEventListener("click", () => patrolMode());
        document.getElementById("mw-metro").addEventListener("click", () => metroWorkMode());
        document.getElementById("mw-farm").addEventListener("click", () => fightMode());
        document.getElementById("mw-tv").addEventListener("click", () => watchTv());
        document.getElementById("mw-fill-all").addEventListener("click", () => fillAllCars());
        document.getElementById("mw-save-set").addEventListener("click", () => saveSetModal());
        document.getElementById("mw-autopilot").addEventListener("click", () => autoPilot());
        
        // Добавляем кнопки управления комплектами на странице транспорта
        if (window.location.href.includes("moswar.ru/automobile/")) {
          addTransportControls();
        }
        
        console.log("[UI] Control panel rendered");
      } catch (error) {
        console.error("Error rendering panel:", error);
      }
    }
    
    /**
     * Добавляет элементы управления транспортом на странице транспорта
     */
    function addTransportControls() {
      try {
        // Проверяем, существуют ли уже элементы управления
        if (document.getElementById("mw-transport-controls")) {
          return;
        }
        
        console.log("[UI] Adding transport controls");
        
        // Находим форму выбора транспорта
        const transportForm = document.getElementById("carstripselector");
        if (!transportForm) {
          return;
        }
        
        // Создаем панель управления транспортом
        const controls = document.createElement("div");
        controls.id = "mw-transport-controls";
        controls.style.cssText = `
          margin: 15px 0;
          padding: 10px;
          background: #fff8e1;
          border: 2px solid #ffcc80;
          border-radius: 8px;
        `;
        
        // Создаем выпадающий список для выбора комплекта
        const selectContainer = document.createElement("div");
        selectContainer.className = "mw-select-container";
        selectContainer.style.cssText = `
          margin-bottom: 10px;
          display: flex;
          align-items: center;
        `;
        
        const selectLabel = document.createElement("label");
        selectLabel.textContent = "Активный комплект:";
        selectLabel.style.marginRight = "10px";
        
        const select = document.createElement("select");
        select.id = "mw-active-slot-select";
        select.className = "mw-select";
        
        // Добавляем опции для выбора комплекта
        for (let i = 1; i <= 4; i++) {
          const setStr = localStorage.getItem(`mw-carset-${i}`);
          const setData = setStr ? JSON.parse(setStr) : [];
          
          const option = document.createElement("option");
          option.value = i;
          option.textContent = `Комплект ${i} (${setData.length})`;
          select.appendChild(option);
        }
        
        // Устанавливаем активный комплект
        const lastSetUsed = localStorage.getItem("mw-last-set-used") || "1";
        select.value = lastSetUsed;
        
        // Добавляем обработчик изменения комплекта
        select.addEventListener("change", function() {
          localStorage.setItem("mw-last-set-used", this.value);
          updateSetIndicator();
        });
        
        selectContainer.appendChild(selectLabel);
        selectContainer.appendChild(select);
        
        // Создаем контейнер для кнопок
        const buttonsContainer = document.createElement("div");
        buttonsContainer.style.cssText = `
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 10px;
        `;
        
        // Добавляем кнопки управления
        const saveButton = createButton("💾 Сохранить", () => saveSetModal(), "Сохранить текущий выбор как комплект");
        const sendButton = createButton("✈️ Отправить", () => sendTransport(), "Отправить выбранный транспорт");
        const fillAllButton = createButton("⛽ Заправить все", () => fillAllCars(), "Заправить весь транспорт");
        const loadSetButton = createButton("📂 Загрузить комплект", () => {
          const activeSlot = parseInt(document.getElementById("mw-active-slot-select").value, 10);
          sendSet(activeSlot);
        }, "Загрузить сохраненный комплект");
        
        buttonsContainer.appendChild(saveButton);
        buttonsContainer.appendChild(sendButton);
        buttonsContainer.appendChild(fillAllButton);
        buttonsContainer.appendChild(loadSetButton);
        
        // Добавляем статус-бар для поездок
        const statusBar = document.createElement("div");
        statusBar.id = "mw-transport-status";
        statusBar.className = "mw-status-line";
        statusBar.textContent = "Управление транспортом";
        statusBar.style.cssText = `
          margin-top: 15px;
          padding: 5px;
          background: #f5f5f5;
          border-radius: 5px;
          border-left: 3px solid #ffcc80;
          font-style: italic;
        `;
        
        // Собираем все элементы вместе
        controls.appendChild(selectContainer);
        controls.appendChild(buttonsContainer);
        controls.appendChild(statusBar);
        
        // Добавляем элементы управления перед формой
        transportForm.parentNode.insertBefore(controls, transportForm);
        
        console.log("[UI] Transport controls added");
      } catch (error) {
        console.error("Error adding transport controls:", error);
      }
    }
    
    /**
     * Рисует навигационную панель для боев
     */
    function renderNavbar() {
      try {
        // Проверяем, находимся ли на странице боя
        if (!window.location.href.includes("/fight/")) {
          return;
        }
        
        // Проверяем, существует ли уже навигационная панель
        if (document.getElementById("mw-fight-navbar")) {
          return;
        }
        
        console.log("[UI] Rendering fight navbar");
        
        // Создаем панель
        const navbar = document.createElement("div");
        navbar.id = "mw-fight-navbar";
        navbar.style.cssText = `
          position: fixed;
          top: 10px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(0, 0, 0, 0.8);
          border-radius: 15px;
          padding: 10px 15px;
          display: flex;
          gap: 10px;
          z-index: 1000;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        `;
        
        navbar.innerHTML = `
          <button class="mw-btn" id="mw-fight-attack">⚔️ Атака</button>
          <button class="mw-btn" id="mw-fight-defense">🛡️ Защита</button>
          <button class="mw-btn" id="mw-fight-leave">🚪 Выход</button>
          <button class="mw-btn" id="mw-fight-refresh">🔄 Обновить</button>
        `;
        
        // Добавляем панель на страницу
        document.body.appendChild(navbar);
        
        // Добавляем обработчики событий
        document.getElementById("mw-fight-attack").addEventListener("click", () => makeTurn(false));
        document.getElementById("mw-fight-defense").addEventListener("click", () => makeTurn(true));
        document.getElementById("mw-fight-leave").addEventListener("click", () => {
          window.location.href = "https://www.moswar.ru/alley/";
        });
        document.getElementById("mw-fight-refresh").addEventListener("click", () => {
          window.location.reload();
        });
        
        console.log("[UI] Fight navbar rendered");
        
        // Добавляем наблюдатель за логами боя
        const logsContainer = document.getElementById("fightlogs");
        if (logsContainer) {
          setupLogsObserver(logsContainer);
        }
      } catch (error) {
        console.error("Error rendering navbar:", error);
      }
    }
    
    /**
     * Очищает логи боя от лишней информации
     */
    function cleanupFightLogs() {
      try {
        // Находим все логи боя
        const logs = document.querySelectorAll("#fightlogs .block-rounded");
        if (!logs.length) {
          return;
        }
        
        console.log(`[Fight] Cleaning up ${logs.length} fight logs`);
        
        for (const log of logs) {
          // Ищем критические удары и промахи
          const criticalHit = log.innerText.includes("критический удар");
          const miss = log.innerText.includes("промахнулся") || log.innerText.includes("промахнулась");
          
          // Применяем стили в зависимости от содержания лога
          if (criticalHit) {
            log.style.backgroundColor = "rgba(255, 215, 0, 0.1)";
            log.style.borderLeft = "3px solid gold";
          } else if (miss) {
            log.style.opacity = "0.6";
          }
          
          // Добавляем кнопку сворачивания лога
          const collapseButton = document.createElement("div");
          collapseButton.style.cssText = `
            position: absolute;
            top: 5px;
            right: 5px;
            background: rgba(0,0,0,0.2);
            color: white;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            font-size: 14px;
          `;
          collapseButton.innerText = "-";
          
          // Делаем лог скрываемым
          log.style.position = "relative";
          log.style.transition = "height 0.2s ease";
          
          collapseButton.addEventListener("click", () => {
            if (log.dataset.collapsed === "true") {
              log.style.height = log.dataset.originalHeight;
              log.dataset.collapsed = "false";
              collapseButton.innerText = "-";
            } else {
              log.dataset.originalHeight = log.style.height || `${log.offsetHeight}px`;
              log.style.height = "30px";
              log.style.overflow = "hidden";
              log.dataset.collapsed = "true";
              collapseButton.innerText = "+";
            }
          });
          
          log.appendChild(collapseButton);
        }
      } catch (error) {
        console.error("Error cleaning up fight logs:", error);
      }
    }
    
    /**
     * Отображает обратный отсчет до конфеты
     */
    function renderCandyCountdown() {
      try {
        // Проверяем, существует ли уже счетчик
        if (document.getElementById("mw-candy-countdown")) {
          return;
        }
        
        console.log("[UI] Rendering candy countdown");
        
        // Получаем время до следующей конфеты
        const candyTimerElement = document.querySelector(".candy-timer");
        if (!candyTimerElement) {
          return;
        }
        
        const timerValue = candyTimerElement.getAttribute("timer");
        if (!timerValue) {
          return;
        }
        
        // Создаем счетчик
        const countdown = document.createElement("div");
        countdown.id = "mw-candy-countdown";
        countdown.style.cssText = `
          position: fixed;
          bottom: 10px;
          right: 10px;
          background: rgba(0, 0, 0, 0.7);
          color: white;
          padding: 8px 12px;
          border-radius: 20px;
          font-size: 12px;
          z-index: 1000;
        `;
        
        // Добавляем счетчик на страницу
        document.body.appendChild(countdown);
        
        // Обновляем счетчик каждую секунду
        let remainingTime = parseInt(timerValue, 10);
        
        function updateCountdown() {
          if (remainingTime <= 0) {
            countdown.innerHTML = "🍬 Конфета доступна!";
            countdown.style.backgroundColor = "rgba(76, 175, 80, 0.7)";
            // Показываем уведомление
            showNotification("🍬 Конфета доступна!");
            return;
          }
          
          const hours = Math.floor(remainingTime / 3600);
          const minutes = Math.floor((remainingTime % 3600) / 60);
          const seconds = remainingTime % 60;
          
          countdown.innerHTML = `🍬 ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
          
          remainingTime--;
          setTimeout(updateCountdown, 1000);
        }
        
        updateCountdown();
        
        console.log("[UI] Candy countdown rendered");
      } catch (error) {
        console.error("Error rendering candy countdown:", error);
      }
    }
    
    /**
     * Функция для создания всплывающей подсказки
     * @param {HTMLElement} button - Кнопка, к которой привязывается подсказка
     * @param {string} text - Текст подсказки
     */
    function createPopover(button, text) {
      try {
        if (!button || !text) {
          return;
        }
        
        // Создаем элемент подсказки
        const popover = document.createElement("div");
        popover.classList.add("mw-popover");
        popover.style.cssText = `
          position: absolute;
          background: rgba(0, 0, 0, 0.8);
          color: white;
          padding: 8px 12px;
          border-radius: 5px;
          font-size: 12px;
          z-index: 1001;
          max-width: 200px;
          visibility: hidden;
          opacity: 0;
          transition: opacity 0.2s, visibility 0.2s;
          pointer-events: none;
        `;
        popover.innerText = text;
        
        // Добавляем подсказку на страницу
        document.body.appendChild(popover);
        
        // Показываем подсказку при наведении на кнопку
        button.addEventListener("mouseenter", () => {
          const rect = button.getBoundingClientRect();
          popover.style.visibility = "visible";
          popover.style.opacity = "1";
          
          // Позиционируем подсказку над кнопкой
          popover.style.left = `${rect.left + rect.width / 2 - popover.offsetWidth / 2}px`;
          popover.style.top = `${rect.top - popover.offsetHeight - 5}px`;
        });
        
        // Скрываем подсказку при уходе с кнопки
        button.addEventListener("mouseleave", () => {
          popover.style.visibility = "hidden";
          popover.style.opacity = "0";
        });
      } catch (error) {
        console.error("Error creating popover:", error);
      }
    }
    
    /**
     * Создает кнопку с заданными параметрами
     * @param {string} text - Текст кнопки
     * @param {Function} callback - Функция обработчик нажатия
     * @param {string} tooltip - Текст подсказки (опционально)
     * @returns {HTMLElement} Созданная кнопка
     */
    function createButton(text, callback, tooltip = "") {
      try {
        const button = document.createElement("button");
        button.className = "mw-btn";
        button.innerText = text;
        
        if (callback && typeof callback === "function") {
          button.addEventListener("click", callback);
        }
        
        if (tooltip) {
          createPopover(button, tooltip);
        }
        
        return button;
      } catch (error) {
        console.error("Error creating button:", error);
        return document.createElement("button");
      }
    }