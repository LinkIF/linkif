// MosWar 6k - Улучшенный скрипт для Московских Войн
// Часть 5/7

    /**
     * Инициализирует кнопки сортировки гаража
     */
    function initializeButtons() {
      try {
        // Проверяем, есть ли уже кнопки сортировки
        if (document.querySelector(".mw-sort-buttons")) {
          return;
        }
        
        console.log("[Garage] Initializing sorting buttons");
        
        // Создаем контейнер для кнопок сортировки
        const sortingContainer = document.createElement("div");
        sortingContainer.className = "mw-sort-buttons";
        sortingContainer.style.cssText = `
          display: flex;
          flex-wrap: wrap;
          gap: 5px;
          margin: 10px 0;
          padding: 10px;
          background: #f5f5f5;
          border-radius: 5px;
        `;
        
        // Определяем доступные типы сортировки
        const sortTypes = [
          { id: "ready", label: "🟢 Готовы", tooltip: "Готовые к поездке" },
          { id: "refuel", label: "⛽ Заправить", tooltip: "Требуют заправки" },
          { id: "busy", label: "🚗 В пути", tooltip: "Машины в пути" },
          { id: "all", label: "🔄 Показать все", tooltip: "Все машины" }
        ];
        
        // Создаем кнопки сортировки
        for (const sort of sortTypes) {
          const button = createButton(sort.label, () => sortGarageByType(sort.id), sort.tooltip);
          sortingContainer.appendChild(button);
        }
        
        // Находим элемент гаража для вставки кнопок
        const garageElement = document.querySelector(".cars-trip-choose, .home-garage");
        
        if (garageElement) {
          // Вставляем перед гаражом
          garageElement.parentNode.insertBefore(sortingContainer, garageElement);
          
          // Также добавляем кнопку заправить все
          const refuelButton = createButton("⛽ Заправить все", fillAllCars, "Заправить весь транспорт");
          sortingContainer.appendChild(refuelButton);
          
          console.log("[Garage] Sorting buttons added");
        } else {
          console.log("[Garage] Garage element not found");
        }
      } catch (error) {
        console.error("Error initializing buttons:", error);
      }
    }
    
    /**
     * Сортирует гараж по заданному типу
     * @param {string} sortType - Тип сортировки ("ready", "refuel", "busy", "all")
     */
    async function sortGarageByType(sortType = "all") {
      try {
        console.log(`[Garage] Sorting by type: ${sortType}`);
        
        // Находим все элементы транспорта
        const transportElements = document.querySelectorAll(".cars-trip-choose li, .home-garage .objects > div");
        
        if (!transportElements.length) {
          console.log("[Garage] No transport elements found");
          return;
        }
        
        // Обрабатываем каждый элемент транспорта
        for (const element of transportElements) {
          // Устанавливаем обратную видимость по умолчанию
          element.style.display = "";
          
          // Проверяем соответствие типу сортировки
          if (sortType === "all") {
            // Показываем все элементы
            continue;
          } 
          else if (sortType === "busy") {
            // Показываем только занятые (в пути)
            const isBusy = element.querySelector(".timeleft, .car-countdown");
            if (!isBusy) {
              element.style.display = "none";
            }
          }
          else if (sortType === "refuel") {
            // Показываем только требующие заправки
            const fuelElement = element.querySelector(".fuel div");
            if (!fuelElement) {
              element.style.display = "none";
              continue;
            }
            
            const fuelWidth = fuelElement.style.width;
            const fuelLevel = parseInt(fuelWidth, 10);
            
            if (isNaN(fuelLevel) || fuelLevel >= 25) {
              element.style.display = "none";
            }
          }
          else if (sortType === "ready") {
            // Показываем только готовые к поездке (не в пути и с достаточным топливом)
            const isBusy = element.querySelector(".timeleft, .car-countdown");
            if (isBusy) {
              element.style.display = "none";
              continue;
            }
            
            const fuelElement = element.querySelector(".fuel div");
            if (!fuelElement) {
              element.style.display = "none";
              continue;
            }
            
            const fuelWidth = fuelElement.style.width;
            const fuelLevel = parseInt(fuelWidth, 10);
            
            if (isNaN(fuelLevel) || fuelLevel < 25) {
              element.style.display = "none";
            }
            
            // Также проверяем чекбоксы (если это страница поездок)
            const checkbox = element.querySelector("input[type='checkbox']");
            if (checkbox && checkbox.disabled) {
              element.style.display = "none";
            }
          }
        }
        
        updateStatus(`🔍 Отфильтрован транспорт: ${sortType}`);
      } catch (error) {
        console.error(`Error sorting garage by type ${sortType}:`, error);
      }
    }
    
    /**
     * Перерисовывает главный экран
     */
    function redrawMain() {
      try {
        console.log("[UI] Redrawing main screen");
        
        // Рисуем основную панель управления
        renderPanel();
        
        // Рисуем навигационную панель для боев
        renderNavbar();
        
        // Рисуем обратный отсчет до конфеты
        renderCandyCountdown();
        
        // Инициализируем кнопки сортировки гаража
        initializeButtons();
        
        // Обрабатываем пользовательский интерфейс
        handleUI();
      } catch (error) {
        console.error("Error redrawing main:", error);
      }
    }
    
    /**
     * Обрабатывает пользовательский интерфейс в зависимости от текущей страницы
     */
    function handleUI() {
      try {
        const currentUrl = window.location.href;
        
        // Обработка страницы боя
        if (currentUrl.includes("/fight/")) {
          console.log("[UI] Handling fight page");
          
          // Очищаем логи боя
          cleanupFightLogs();
          
          // Автоматический ход (если включен автопилот)
          if (localStorage.getItem("mw-autopilot") === "true") {
            setTimeout(() => makeTurn(false), 1000);
          }
        }
        
        // Обработка страницы гаража или транспорта
        if (currentUrl.includes("/automobile/") || currentUrl.includes("/home/")) {
          console.log("[UI] Handling garage page");
          
          // Добавляем кнопки сортировки гаража
          initializeButtons();
        }
      } catch (error) {
        console.error("Error handling UI:", error);
      }
    }
    
    /**
     * Рисует таймеры заданий
     */
    function drawTimers() {
      try {
        console.log("[UI] Drawing timers");
        
        // Находим все таймеры на странице
        const timerElements = document.querySelectorAll("[timer]");
        
        if (!timerElements.length) {
          console.log("[UI] No timers found");
          return;
        }
        
        console.log(`[UI] Found ${timerElements.length} timers`);
        
        // Обрабатываем каждый таймер
        for (const element of timerElements) {
          // Получаем значение таймера
          const timerValue = parseInt(element.getAttribute("timer"), 10);
          
          if (isNaN(timerValue)) {
            continue;
          }
          
          // Обновляем текст таймера
          function updateTimer() {
            const hours = Math.floor(timerValue / 3600);
            const minutes = Math.floor((timerValue % 3600) / 60);
            const seconds = timerValue % 60;
            
            element.textContent = `${hours > 0 ? hours + "ч " : ""}${minutes > 0 ? minutes + "м " : ""}${seconds}с`;
            
            // Обновляем атрибут таймера
            const currentValue = parseInt(element.getAttribute("timer"), 10);
            if (currentValue > 0) {
              element.setAttribute("timer", currentValue - 1);
              setTimeout(updateTimer, 1000);
            } else {
              element.textContent = "Готово!";
              element.style.color = "#4caf50";
            }
          }
          
          // Запускаем обновление таймера
          updateTimer();
        }
      } catch (error) {
        console.error("Error drawing timers:", error);
      }
    }
    
    /**
     * Инициализация наблюдателя за логами группового боя
     */
    function LEGACY_initGroupFightLogs() {
      try {
        console.log("[Fight] Initializing group fight logs");
        
        // Находим контейнер логов
        const logsContainer = document.getElementById("fightlogs");
        
        if (!logsContainer) {
          console.log("[Fight] Logs container not found");
          return;
        }
        
        // Создаем наблюдателя за изменениями логов
        const observer = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            if (mutation.addedNodes.length > 0) {
              console.log("[Fight] New logs detected");
              
              // Очищаем новые логи
              cleanupFightLogs();
            }
          });
        });
        
        // Запускаем наблюдатель
        observer.observe(logsContainer, {
          childList: true,
          subtree: true
        });
        
        console.log("[Fight] Group fight logs observer started");
      } catch (error) {
        console.error("Error initializing group fight logs:", error);
      }
    }
    
    /**
     * Информация об игроке
     */
    var player = {
      name: document.querySelector(".user a")?.textContent || "Unknown",
      level: document.querySelector(".level")?.textContent.match(/\d+/)?.[0] || 0,
      faction: document.querySelector(".user .fraction[class*='fraction-']")?.className.match(/fraction-(\w+)/)?.[1] || "unknown"
    };
    
    console.log(`[Player] Name: ${player.name}, Level: ${player.level}, Faction: ${player.faction}`);
    
    /**
     * Логирование в систему журналирования с временной меткой
     * @param {string} message - Сообщение для записи в лог
     * @param {string} level - Уровень сообщения (info, warn, error)
     */
    function logWithTimestamp(message, level = "info") {
      try {
        const timestamp = new Date().toISOString();
        const logMessage = `[${timestamp}] [LinkIF] ${message}`;
        
        switch (level) {
          case "warn":
            console.warn(logMessage);
            break;
          case "error":
            console.error(logMessage);
            break;
          default:
            console.log(logMessage);
            break;
        }
        
        // Дополнительно можно сохранять логи в хранилище для отладки
        const logs = JSON.parse(localStorage.getItem("mw-logs") || "[]");
        logs.push({ timestamp, message, level });
        
        // Ограничиваем количество хранимых логов
        if (logs.length > 100) {
          logs.shift(); // Удаляем самый старый лог
        }
        
        localStorage.setItem("mw-logs", JSON.stringify(logs));
      } catch (error) {
        console.error("Error logging with timestamp:", error);
      }
    }
    
    /**
     * Фильтр логов боя
     * @param {string} selector - CSS-селектор для поиска логов
     */
    function filterLogsByClass(selector = ".journal") {
      try {
        console.log(`[Logs] Filtering logs by selector: ${selector}`);
        
        // Находим все элементы логов
        const logElements = document.querySelectorAll(selector);
        
        if (!logElements.length) {
          console.log("[Logs] No log elements found");
          return;
        }
        
        console.log(`[Logs] Found ${logElements.length} log elements`);
        
        // Создаем панель управления логами
        const controlPanel = document.createElement("div");
        controlPanel.className = "logs-control-panel";
        controlPanel.innerHTML = `
          <div class="header">Фильтр логов</div>
        `;
        
        // Определяем типы фильтров
        const filterTypes = [
          { id: "attack", label: "Атаки" },
          { id: "defense", label: "Защита" },
          { id: "dodge", label: "Уклонение" },
          { id: "critical", label: "Критические" },
          { id: "damage", label: "Урон" },
          { id: "heal", label: "Лечение" },
          { id: "buff", label: "Баффы" },
          { id: "control", label: "Контроль" },
          { id: "all", label: "Все" }
        ];
        
        // Создаем кнопки фильтров
        for (const filter of filterTypes) {
          const button = document.createElement("div");
          button.className = "log-toggle";
          button.dataset.filter = filter.id;
          button.textContent = filter.label;
          
          if (filter.id === "all") {
            button.classList.add("active");
          }
          
          // Добавляем обработчик клика
          button.addEventListener("click", () => {
            // Если нажата кнопка "Все", активируем только её
            if (filter.id === "all") {
              document.querySelectorAll(".log-toggle").forEach(btn => {
                btn.classList.remove("active");
              });
              button.classList.add("active");
              
              // Показываем все логи
              logElements.forEach(log => {
                log.style.display = "";
              });
              
              return;
            }
            
            // Деактивируем кнопку "Все"
            document.querySelector(".log-toggle[data-filter='all']").classList.remove("active");
            
            // Переключаем активность текущей кнопки
            button.classList.toggle("active");
            
            // Собираем все активные фильтры
            const activeFilters = [...document.querySelectorAll(".log-toggle.active")].map(el => el.dataset.filter);
            
            // Если нет активных фильтров, активируем "Все"
            if (activeFilters.length === 0) {
              document.querySelector(".log-toggle[data-filter='all']").classList.add("active");
              logElements.forEach(log => {
                log.style.display = "";
              });
              return;
            }
            
            // Применяем фильтры к логам
            logElements.forEach(log => {
              const text = log.textContent.toLowerCase();
              const show = activeFilters.some(filter => {
                switch (filter) {
                  case "attack": 
                    return text.includes("атак") || text.includes("бьёт");
                  case "defense":
                    return text.includes("защищается") || text.includes("блокирует");
                  case "dodge":
                    return text.includes("уклоняется") || text.includes("уворачивается") || text.includes("промах");
                  case "critical":
                    return text.includes("критический") || text.includes("критическая");
                  case "damage":
                    return text.includes("урон") || text.includes("повреждений");
                  case "heal":
                    return text.includes("лечит") || text.includes("восстанавливает");
                  case "buff":
                    return text.includes("усиливает") || text.includes("эффект");
                  case "control":
                    return text.includes("оглушает") || text.includes("замораживает") || text.includes("контроль");
                  default:
                    return false;
                }
              });
              
              log.style.display = show ? "" : "none";
            });
          });
          
          controlPanel.appendChild(button);
        }
        
        // Добавляем панель управления на страницу
        document.body.appendChild(controlPanel);
        
        console.log("[Logs] Filter control panel added");
      } catch (error) {
        console.error("Error filtering logs by class:", error);
      }
    }

    /**
     * Добавляет функциональность перетаскивания для элемента
     * @param {HTMLElement} element - Элемент, который можно перетаскивать
     * @param {HTMLElement} handle - Элемент, за который можно перетаскивать (опционально)
     */
    function makeDraggable(element, handle = null) {
      try {
        if (!element) return;
        
        const dragHandle = handle || element;
        let offsetX = 0;
        let offsetY = 0;
        let isDragging = false;
        
        // Функция начала перетаскивания
        const dragStart = (e) => {
          // Проверяем, что кликнули именно по handle
          if (e.target !== dragHandle && !dragHandle.contains(e.target)) {
            return;
          }
          
          e.preventDefault();
          
          // Запоминаем позицию курсора относительно элемента
          const rect = element.getBoundingClientRect();
          offsetX = e.clientX - rect.left;
          offsetY = e.clientY - rect.top;
          isDragging = true;
          
          // Добавляем стили для индикации перетаскивания
          element.style.transition = "none";
          element.style.opacity = "0.8";
          
          // Добавляем слушателей событий для перетаскивания
          document.addEventListener("mousemove", drag);
          document.addEventListener("mouseup", dragEnd);
        };
        
        // Функция перетаскивания
        const drag = (e) => {
          if (!isDragging) return;
          
          e.preventDefault();
          
          // Рассчитываем новую позицию, учитывая смещение
          const x = e.clientX - offsetX;
          const y = e.clientY - offsetY;
          
          // Ограничиваем позицию границами окна
          const maxX = window.innerWidth - element.offsetWidth;
          const maxY = window.innerHeight - element.offsetHeight;
          
          const boundedX = Math.max(0, Math.min(x, maxX));
          const boundedY = Math.max(0, Math.min(y, maxY));
          
          // Устанавливаем новую позицию
          element.style.left = `${boundedX}px`;
          element.style.top = `${boundedY}px`;
        };
        
        // Функция окончания перетаскивания
        const dragEnd = () => {
          isDragging = false;
          element.style.opacity = "1";
          element.style.transition = "";
          
          // Удаляем слушателей событий
          document.removeEventListener("mousemove", drag);
          document.removeEventListener("mouseup", dragEnd);
          
          // Сохраняем позицию элемента
          localStorage.setItem(`${element.id}-position`, JSON.stringify({
            left: element.style.left,
            top: element.style.top
          }));
        };
        
        // Добавляем слушателя события mousedown для начала перетаскивания
        dragHandle.addEventListener("mousedown", dragStart);
        
        // Добавляем индикатор возможности перетаскивания
        dragHandle.style.cursor = "move";
        
        // Восстанавливаем сохраненную позицию элемента
        const savedPosition = JSON.parse(localStorage.getItem(`${element.id}-position`));
        if (savedPosition) {
          element.style.left = savedPosition.left;
          element.style.top = savedPosition.top;
        }
        
        // Делаем элемент позиционированным абсолютно, если еще не сделано
        const computedStyle = window.getComputedStyle(element);
        if (computedStyle.position === "static") {
          element.style.position = "absolute";
        }
        
        console.log(`[UI] Element ${element.id} made draggable`);
      } catch (error) {
        console.error("Error making element draggable:", error);
      }
    }
    
    /**
     * Создает журнал операций для отладки
     */
    function createLogConsole() {
      try {
        // Проверяем, существует ли уже консоль
        if (document.getElementById("mw-log-console")) {
          return;
        }
        
        console.log("[UI] Creating log console");
        
        // Создаем элемент консоли
        const logConsole = document.createElement("div");
        logConsole.id = "mw-log-console";
        logConsole.style.cssText = `
          position: fixed;
          bottom: 10px;
          left: 10px;
          width: 400px;
          height: 300px;
          background: rgba(0, 0, 0, 0.8);
          color: #ccc;
          border-radius: 8px;
          padding: 10px;
          font-family: monospace;
          font-size: 12px;
          display: none;
          z-index: 9999;
          overflow: hidden;
          flex-direction: column;
        `;
        
        // Создаем заголовок консоли
        const header = document.createElement("div");
        header.style.cssText = `
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 5px;
          border-bottom: 1px solid #444;
          margin-bottom: 5px;
        `;
        header.innerHTML = `
          <div>LinkIF Console</div>
          <div>
            <button id="mw-log-clear" style="background: none; border: none; color: #ccc; cursor: pointer; margin-right: 10px;">Clear</button>
            <button id="mw-log-close" style="background: none; border: none; color: #ccc; cursor: pointer;">×</button>
          </div>
        `;
        
        // Создаем контейнер для логов
        const logsContainer = document.createElement("div");
        logsContainer.id = "mw-log-entries";
        logsContainer.style.cssText = `
          flex-grow: 1;
          overflow-y: auto;
          padding-right: 10px;
        `;
        
        // Создаем контейнер для ввода
        const inputContainer = document.createElement("div");
        inputContainer.style.cssText = `
          display: flex;
          margin-top: 5px;
          border-top: 1px solid #444;
          padding-top: 5px;
        `;
        
        // Создаем поле ввода
        const input = document.createElement("input");
        input.type = "text";
        input.placeholder = "Enter command...";
        input.style.cssText = `
          flex-grow: 1;
          background: #222;
          color: #fff;
          border: none;
          border-radius: 4px;
          padding: 5px;
          outline: none;
        `;
        
        // Создаем кнопку отправки
        const sendButton = document.createElement("button");
        sendButton.textContent = "↵";
        sendButton.style.cssText = `
          margin-left: 5px;
          background: #444;
          color: #fff;
          border: none;
          border-radius: 4px;
          padding: 0 10px;
          cursor: pointer;
        `;
        
        // Добавляем элементы в консоль
        inputContainer.appendChild(input);
        inputContainer.appendChild(sendButton);
        
        logConsole.appendChild(header);
        logConsole.appendChild(logsContainer);
        logConsole.appendChild(inputContainer);
        
        // Добавляем консоль на страницу
        document.body.appendChild(logConsole);
        
        // Делаем консоль перетаскиваемой
        makeDraggable(logConsole, header);
        
        // Добавляем обработчики событий
        document.getElementById("mw-log-close").addEventListener("click", () => {
          logConsole.style.display = "none";
        });
        
        document.getElementById("mw-log-clear").addEventListener("click", () => {
          document.getElementById("mw-log-entries").innerHTML = "";
        });
        
        // Обработка ввода команд
        function handleCommand() {
          const command = input.value.trim();
          
          if (!command) return;
          
          addLogEntry(`> ${command}`, "command");
          
          try {
            // Обрабатываем команду
            const result = processCommand(command);
            
            if (result !== undefined) {
              addLogEntry(result, "result");
            }
          } catch (err) {
            addLogEntry(`Error: ${err.message}`, "error");
          }
          
          // Очищаем поле ввода
          input.value = "";
        }
        
        sendButton.addEventListener("click", handleCommand);
        input.addEventListener("keydown", (e) => {
          if (e.key === "Enter") {
            handleCommand();
          }
        });
        
        // Функция для добавления записи в лог
        function addLogEntry(message, type = "info") {
          const entry = document.createElement("div");
          entry.className = `log-entry log-${type}`;
          entry.style.cssText = `
            margin-bottom: 3px;
            border-left: 3px solid ${type === "error" ? "#f44336" : type === "command" ? "#2196f3" : type === "result" ? "#8bc34a" : "#aaa"};
            padding-left: 5px;
            word-wrap: break-word;
          `;
          entry.innerText = message;
          
          const logsContainer = document.getElementById("mw-log-entries");
          logsContainer.appendChild(entry);
          logsContainer.scrollTop = logsContainer.scrollHeight;
        }
        
        // Функция для обработки команд
        function processCommand(command) {
          const parts = command.split(" ");
          const cmd = parts[0].toLowerCase();
          const args = parts.slice(1);
          
          switch (cmd) {
            case "help":
              return `
                Available commands:
                - help: Show this help
                - show: Show console
                - hide: Hide console
                - clear: Clear logs
                - status: Show script status
                - player: Show player info
                - version: Show script version
              `;
              
            case "show":
              logConsole.style.display = "flex";
              return "Console shown";
              
            case "hide":
              logConsole.style.display = "none";
              return "Console hidden";
              
            case "clear":
              document.getElementById("mw-log-entries").innerHTML = "";
              return "Logs cleared";
              
            case "status":
              return `
                Script status: Running
                Current page: ${window.location.href}
                Player: ${player.name} (Level ${player.level}, ${player.faction})
                Last activity: ${new Date().toLocaleTimeString()}
              `;
              
            case "player":
              return JSON.stringify(player, null, 2);
              
            case "version":
              return "MosWar 6k v2.0";
              
            default:
              // Если команда не распознана, проверяем, является ли она вызовом функции
              try {
                // Получаем доступ к глобальному объекту
                const globalObj = window;
                
                // Проверяем, есть ли такая функция
                if (typeof globalObj[cmd] === "function") {
                  // Вызываем функцию с аргументами
                  const result = globalObj[cmd](...args);
                  return `Function ${cmd} executed, result: ${JSON.stringify(result)}`;
                }
                
                return `Unknown command: ${cmd}. Type 'help' for available commands.`;
              } catch (err) {
                return `Error executing command: ${err.message}`;
              }
          }
        }
        
        // Добавляем горячую клавишу для показа консоли (Ctrl+.)
        document.addEventListener("keydown", (e) => {
          if (e.ctrlKey && e.key === ".") {
            e.preventDefault();
            logConsole.style.display = logConsole.style.display === "none" ? "flex" : "none";
          }
        });
        
        console.log("[UI] Log console created (press Ctrl+. to show)");
      } catch (error) {
        console.error("Error creating log console:", error);
      }
    }