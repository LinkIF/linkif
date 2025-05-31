// MosWar 6k - Улучшенный скрипт для Московских Войн
// Часть 6/7

    /**
     * Главная функция инициализации скрипта
     */
    async function init() {
      try {
        console.log("[Init] Initializing MosWar 6k script");
        
        // Загружаем данные игрока
        await loadPlayerData();
        
        // Перерисовываем основной экран
        redrawMain();
        
        // Рисуем таймеры
        drawTimers();
        
        // Создаем консоль логов (для отладки)
        createLogConsole();
        
        // Обновляем индикатор активного комплекта
        updateSetIndicator();
        
        // Инициализируем наблюдатель за изменением URL
        initUrlChangeObserver();
        
        console.log("[Init] Initialization complete");
      } catch (error) {
        console.error("Error in init:", error);
      }
    }
    
    /**
     * Загружает данные игрока
     */
    async function loadPlayerData() {
      try {
        console.log("[Player] Loading player data");
        
        // Получаем имя, уровень и фракцию из текущей страницы
        player.name = document.querySelector(".user a")?.textContent || "Unknown";
        player.level = document.querySelector(".level")?.textContent.match(/\d+/)?.[0] || 0;
        player.faction = document.querySelector(".user .fraction[class*='fraction-']")?.className.match(/fraction-(\w+)/)?.[1] || "unknown";
        
        // Загружаем дополнительную информацию с профиля игрока
        const profileUrl = "https://www.moswar.ru/player/";
        try {
          const response = await fetch(profileUrl);
          const text = await response.text();
          const doc = parseHtml(text);
          
          // Получаем ID игрока
          const profileLink = doc.querySelector(".profile-link");
          if (profileLink) {
            const idMatch = profileLink.getAttribute("href").match(/\/player\/(\d+)/);
            player.id = idMatch?.[1] || "unknown";
          }
          
          // Получаем информацию о здоровье
          const healthBar = doc.querySelector("#personal .bar");
          if (healthBar) {
            const healthMatch = healthBar.getAttribute("title").match(/(\d+)\/(\d+)/);
            if (healthMatch) {
              player.health = parseInt(healthMatch[1], 10);
              player.maxHealth = parseInt(healthMatch[2], 10);
            }
          }
          
          // Получаем информацию о травме
          const injuryElement = doc.querySelector("#personal .injury span");
          if (injuryElement) {
            const injuryMatch = injuryElement.innerText.match(/\d+/);
            player.injury = injuryMatch ? parseInt(injuryMatch[0], 10) : 0;
          }
        } catch (err) {
          console.error("Error loading player profile:", err);
        }
        
        console.log(`[Player] Loaded: ${player.name} (ID: ${player.id || 'unknown'}, Level: ${player.level}, Faction: ${player.faction})`);
      } catch (error) {
        console.error("Error loading player data:", error);
      }
    }
    
    /**
     * Инициализирует наблюдатель за изменением URL
     */
    function initUrlChangeObserver() {
      try {
        console.log("[Observer] Initializing URL change observer");
        
        // Сохраняем текущий URL
        let currentUrl = window.location.href;
        
        // Создаем функцию-обработчик
        const checkUrlChange = () => {
          if (currentUrl !== window.location.href) {
            console.log(`[Observer] URL changed from ${currentUrl} to ${window.location.href}`);
            currentUrl = window.location.href;
            
            // При изменении URL перерисовываем интерфейс
            setTimeout(redrawMain, 500);
          }
        };
        
        // Запускаем проверку изменения URL каждую секунду
        setInterval(checkUrlChange, 1000);
        
        console.log("[Observer] URL change observer started");
      } catch (error) {
        console.error("Error initializing URL change observer:", error);
      }
    }
    
    /**
     * Поддержка MutationObserver для динамических элементов
     */
    function setupDynamicElementsObserver() {
      try {
        console.log("[Observer] Setting up dynamic elements observer");
        
        // Проверяем поддержку MutationObserver
        if (!('MutationObserver' in window)) {
          console.log("[Observer] MutationObserver not supported");
          return;
        }
        
        // Создаем наблюдатель
        const observer = new MutationObserver((mutations) => {
          // Проверяем каждую мутацию
          mutations.forEach((mutation) => {
            if (mutation.type === 'childList') {
              // Если добавлены новые элементы, проверяем их
              mutation.addedNodes.forEach((node) => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                  // Добавляем обработчики для динамически добавленных элементов
                  processDynamicElements(node);
                }
              });
            }
          });
        });
        
        // Запускаем наблюдатель за изменениями в DOM
        observer.observe(document.body, {
          childList: true,
          subtree: true
        });
        
        console.log("[Observer] Dynamic elements observer started");
      } catch (error) {
        console.error("Error setting up dynamic elements observer:", error);
      }
    }
    
    /**
     * Обрабатывает динамически добавленные элементы
     * @param {HTMLElement} element - Добавленный элемент
     */
    function processDynamicElements(element) {
      try {
        // Проверяем, является ли элемент формой транспорта
        if (element.id === "carstripselector" || element.classList.contains("cars-trip-choose")) {
          console.log("[Dynamic] Found transport form, adding controls");
          addTransportControls();
        }
        
        // Проверяем, является ли элемент контейнером гаража
        if (element.classList.contains("home-garage") || element.querySelector(".home-garage")) {
          console.log("[Dynamic] Found garage container, adding buttons");
          initializeButtons();
        }
        
        // Проверяем, является ли элемент контейнером логов боя
        if (element.id === "fightlogs" || element.querySelector("#fightlogs")) {
          console.log("[Dynamic] Found fight logs container, setting up observer");
          setupLogsObserver(element.id === "fightlogs" ? element : element.querySelector("#fightlogs"));
        }
        
        // Проверяем наличие таймеров
        const timers = element.querySelectorAll("[timer]");
        if (timers.length > 0) {
          console.log(`[Dynamic] Found ${timers.length} timers, drawing them`);
          drawTimers();
        }
      } catch (error) {
        console.error("Error processing dynamic elements:", error);
      }
    }
    
    /**
     * Перезапись встроенных функций игры
     * для расширения функциональности
     */
    function overrideGameFunctions() {
      try {
        console.log("[Override] Overriding game functions");
        
        // Сохраняем оригинальную функцию AngryAjax.getCurrentUrl
        if (window.AngryAjax && window.AngryAjax.getCurrentUrl) {
          const originalGetCurrentUrl = window.AngryAjax.getCurrentUrl;
          
          // Перезаписываем функцию
          window.AngryAjax.getCurrentUrl = function() {
            const url = originalGetCurrentUrl.call(this);
            
            // Добавляем возможность обработки URL
            if (url) {
              // Уведомляем о переходе на новую страницу
              if (window.linkifLastUrl !== url) {
                window.linkifLastUrl = url;
                
                // Запускаем перерисовку интерфейса с небольшой задержкой
                setTimeout(redrawMain, 300);
              }
            }
            
            return url;
          };
        }
        
        // Сохраняем оригинальную функцию AngryAjax.goToUrl
        if (window.AngryAjax && window.AngryAjax.goToUrl) {
          const originalGoToUrl = window.AngryAjax.goToUrl;
          
          // Перезаписываем функцию
          window.AngryAjax.goToUrl = function(url) {
            console.log(`[Navigation] Going to URL: ${url}`);
            return originalGoToUrl.call(this, url);
          };
        }
        
        // Сохраняем оригинальную функцию AngryAjax.updateDocumentHtml
        if (window.AngryAjax && window.AngryAjax.updateDocumentHtml) {
          const originalUpdateDocumentHtml = window.AngryAjax.updateDocumentHtml;
          
          // Перезаписываем функцию
          window.AngryAjax.updateDocumentHtml = function(e, t, n) {
            const result = originalUpdateDocumentHtml.call(this, e, t, n);
            
            // После обновления HTML перерисовываем интерфейс
            setTimeout(redrawMain, 300);
            
            return result;
          };
        }
        
        console.log("[Override] Game functions overridden successfully");
      } catch (error) {
        console.error("Error overriding game functions:", error);
      }
    }
    
    /**
     * Добавляет клавиатурные сокращения
     */
    function setupKeyboardShortcuts() {
      try {
        console.log("[Shortcuts] Setting up keyboard shortcuts");
        
        document.addEventListener("keydown", function(e) {
          // Проверяем, не находится ли фокус в текстовом поле
          if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA" || e.target.isContentEditable) {
            return;
          }
          
          // Ctrl + Alt + P: Запустить патрулирование
          if (e.ctrlKey && e.altKey && e.key === "p") {
            e.preventDefault();
            patrolMode();
            showNotification("🚔 Запущено патрулирование");
          }
          
          // Ctrl + Alt + M: Запустить работу в метро
          if (e.ctrlKey && e.altKey && e.key === "m") {
            e.preventDefault();
            metroWorkMode();
            showNotification("🚇 Запущена работа в метро");
          }
          
          // Ctrl + Alt + F: Запустить фарм
          if (e.ctrlKey && e.altKey && e.key === "f") {
            e.preventDefault();
            fightMode();
            showNotification("👊 Запущен режим фарма");
          }
          
          // Ctrl + Alt + A: Запустить автопилот
          if (e.ctrlKey && e.altKey && e.key === "a") {
            e.preventDefault();
            autoPilot();
            showNotification("🤖 Запущен автопилот");
          }
          
          // Ctrl + Alt + R: Заправить все машины
          if (e.ctrlKey && e.altKey && e.key === "r") {
            e.preventDefault();
            fillAllCars();
            showNotification("⛽ Заправляются все машины");
          }
          
          // Цифры 1-4: Загрузить комплект
          if (!e.ctrlKey && !e.altKey && !e.shiftKey && /^[1-4]$/.test(e.key)) {
            if (window.location.href.includes("moswar.ru/automobile/")) {
              e.preventDefault();
              const setIndex = parseInt(e.key, 10);
              sendSet(setIndex);
              showNotification(`📂 Загружен комплект ${setIndex}`);
            }
          }
          
          // Ctrl + Alt + S: Сохранить текущий комплект
          if (e.ctrlKey && e.altKey && e.key === "s") {
            if (window.location.href.includes("moswar.ru/automobile/")) {
              e.preventDefault();
              saveSetModal();
              showNotification("💾 Открыто окно сохранения комплекта");
            }
          }
          
          // Escape: Закрыть модальные окна
          if (e.key === "Escape") {
            const modals = document.querySelectorAll(".mw-modal");
            if (modals.length > 0) {
              e.preventDefault();
              modals.forEach(modal => modal.remove());
              const overlays = document.querySelectorAll("div[style*='position: fixed'][style*='background: rgba(0,0,0,0.5)']");
              overlays.forEach(overlay => overlay.remove());
            }
          }
        });
        
        console.log("[Shortcuts] Keyboard shortcuts set up successfully");
      } catch (error) {
        console.error("Error setting up keyboard shortcuts:", error);
      }
    }
    
    /**
     * Добавляет мини-окно с информацией о состоянии скрипта
     */
    function setupStatusWindow() {
      try {
        // Проверяем, существует ли уже окно статуса
        if (document.getElementById("mw-status-window")) {
          return;
        }
        
        console.log("[UI] Setting up status window");
        
        // Создаем окно статуса
        const statusWindow = document.createElement("div");
        statusWindow.id = "mw-status-window";
        statusWindow.style.cssText = `
          position: fixed;
          bottom: 10px;
          right: 10px;
          background: rgba(0, 0, 0, 0.7);
          color: white;
          padding: 10px 15px;
          border-radius: 8px;
          font-size: 12px;
          z-index: 999;
          display: flex;
          flex-direction: column;
          min-width: 200px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
        `;
        
        // Создаем заголовок
        const header = document.createElement("div");
        header.style.cssText = `
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 5px;
          border-bottom: 1px solid #444;
          padding-bottom: 5px;
          font-weight: bold;
        `;
        header.innerHTML = `
          <div>MosWar 6k</div>
          <div style="display: flex; gap: 10px;">
            <span id="mw-status-minimize" style="cursor: pointer;">_</span>
            <span id="mw-status-close" style="cursor: pointer;">×</span>
          </div>
        `;
        
        // Создаем содержимое
        const content = document.createElement("div");
        content.id = "mw-status-content";
        content.style.cssText = `
          display: flex;
          flex-direction: column;
          gap: 5px;
        `;
        
        content.innerHTML = `
          <div>
            <span style="color: #aaa;">Игрок:</span>
            <span id="mw-status-player">${player.name} (${player.level})</span>
          </div>
          <div>
            <span style="color: #aaa;">Здоровье:</span>
            <span id="mw-status-health">${player.health || '?'}/${player.maxHealth || '?'}</span>
          </div>
          <div>
            <span style="color: #aaa;">Травма:</span>
            <span id="mw-status-injury">${player.injury || 0}%</span>
          </div>
          <div>
            <span style="color: #aaa;">Активные режимы:</span>
            <span id="mw-status-modes">-</span>
          </div>
        `;
        
        // Добавляем элементы в окно
        statusWindow.appendChild(header);
        statusWindow.appendChild(content);
        
        // Добавляем окно на страницу
        document.body.appendChild(statusWindow);
        
        // Делаем окно перетаскиваемым
        makeDraggable(statusWindow, header);
        
        // Добавляем обработчики событий
        document.getElementById("mw-status-close").addEventListener("click", () => {
          statusWindow.style.display = "none";
        });
        
        document.getElementById("mw-status-minimize").addEventListener("click", () => {
          const content = document.getElementById("mw-status-content");
          if (content.style.display === "none") {
            content.style.display = "flex";
            document.getElementById("mw-status-minimize").innerText = "_";
          } else {
            content.style.display = "none";
            document.getElementById("mw-status-minimize").innerText = "+";
          }
        });
        
        // Обновляем информацию в окне каждые 10 секунд
        function updateStatusInfo() {
          // Обновляем информацию о здоровье
          const healthElement = document.getElementById("mw-status-health");
          if (healthElement) {
            healthElement.innerText = `${player.health || '?'}/${player.maxHealth || '?'}`;
            
            // Подсвечиваем низкое здоровье
            if (player.health && player.maxHealth && player.health < player.maxHealth * 0.5) {
              healthElement.style.color = "#f44336";
            } else {
              healthElement.style.color = "";
            }
          }
          
          // Обновляем информацию о травме
          const injuryElement = document.getElementById("mw-status-injury");
          if (injuryElement) {
            injuryElement.innerText = `${player.injury || 0}%`;
            
            // Подсвечиваем травму
            if (player.injury && player.injury > 0) {
              injuryElement.style.color = "#f44336";
            } else {
              injuryElement.style.color = "";
            }
          }
          
          // Обновляем информацию об активных режимах
          const modesElement = document.getElementById("mw-status-modes");
          if (modesElement) {
            const activeModes = [];
            
            // Проверяем активные режимы
            if (localStorage.getItem("mw-autopilot") === "true") {
              activeModes.push("Автопилот");
            }
            
            if (localStorage.getItem("mw-patrol") === "true") {
              activeModes.push("Патруль");
            }
            
            if (localStorage.getItem("mw-metro") === "true") {
              activeModes.push("Метро");
            }
            
            if (localStorage.getItem("mw-farm") === "true") {
              activeModes.push("Фарм");
            }
            
            modesElement.innerText = activeModes.length > 0 ? activeModes.join(", ") : "-";
          }
        }
        
        // Запускаем периодическое обновление
        setInterval(updateStatusInfo, 10000);
        updateStatusInfo(); // Первое обновление
        
        console.log("[UI] Status window set up successfully");
      } catch (error) {
        console.error("Error setting up status window:", error);
      }
    }
    
    /**
     * Сохраняет настройки скрипта
     * @param {Object} settings - Настройки для сохранения
     */
    function saveSettings(settings) {
      try {
        console.log("[Settings] Saving settings");
        
        // Получаем текущие настройки
        const currentSettings = JSON.parse(localStorage.getItem("mw-settings") || "{}");
        
        // Объединяем с новыми настройками
        const newSettings = { ...currentSettings, ...settings };
        
        // Сохраняем настройки
        localStorage.setItem("mw-settings", JSON.stringify(newSettings));
        
        console.log("[Settings] Settings saved successfully");
      } catch (error) {
        console.error("Error saving settings:", error);
      }
    }
    
    /**
     * Загружает настройки скрипта
     * @param {string} key - Ключ настройки
     * @param {any} defaultValue - Значение по умолчанию
     * @returns {any} Значение настройки
     */
    function loadSetting(key, defaultValue) {
      try {
        // Получаем все настройки
        const settings = JSON.parse(localStorage.getItem("mw-settings") || "{}");
        
        // Возвращаем значение по ключу или значение по умолчанию
        return settings.hasOwnProperty(key) ? settings[key] : defaultValue;
      } catch (error) {
        console.error(`Error loading setting ${key}:`, error);
        return defaultValue;
      }
    }
    
    /**
     * Добавляет окно настроек скрипта
     */
    function setupSettingsWindow() {
      try {
        console.log("[UI] Setting up settings window");
        
        // Создаем элемент для кнопки открытия настроек
        const settingsButton = document.createElement("div");
        settingsButton.id = "mw-settings-button";
        settingsButton.style.cssText = `
          position: fixed;
          top: 10px;
          right: 10px;
          background: rgba(0, 0, 0, 0.6);
          color: white;
          width: 35px;
          height: 35px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 999;
          font-size: 18px;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
        `;
        settingsButton.innerHTML = "⚙️";
        settingsButton.title = "Настройки скрипта";
        
        // Добавляем кнопку на страницу
        document.body.appendChild(settingsButton);
        
        // Добавляем обработчик клика по кнопке
        settingsButton.addEventListener("click", () => {
          // Проверяем, открыто ли уже окно настроек
          if (document.getElementById("mw-settings-window")) {
            return;
          }
          
          // Создаем окно настроек
          const settingsWindow = document.createElement("div");
          settingsWindow.id = "mw-settings-window";
          settingsWindow.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #fff;
            border-radius: 8px;
            padding: 15px;
            z-index: 1000;
            width: 600px;
            max-width: 90vw;
            max-height: 90vh;
            overflow-y: auto;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
          `;
          
          // Создаем оверлей для затемнения фона
          const overlay = document.createElement("div");
          overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            z-index: 999;
          `;
          
          // Создаем заголовок окна
          const header = document.createElement("div");
          header.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 1px solid #eee;
          `;
          header.innerHTML = `
            <h2 style="margin: 0;">Настройки скрипта</h2>
            <span id="mw-settings-close" style="cursor: pointer; font-size: 24px;">&times;</span>
          `;
          
          // Создаем контент окна
          const content = document.createElement("div");
          content.innerHTML = `
            <div style="display: flex; margin-bottom: 20px;">
              <div style="width: 200px; padding-right: 20px; border-right: 1px solid #eee;">
                <div class="mw-settings-tab active" data-tab="general">Общие</div>
                <div class="mw-settings-tab" data-tab="transport">Транспорт</div>
                <div class="mw-settings-tab" data-tab="automation">Автоматизация</div>
                <div class="mw-settings-tab" data-tab="appearance">Внешний вид</div>
                <div class="mw-settings-tab" data-tab="advanced">Расширенные</div>
                <div class="mw-settings-tab" data-tab="about">О скрипте</div>
              </div>
              
              <div style="flex-grow: 1; padding-left: 20px;">
                <div id="mw-settings-tab-general" class="mw-settings-tab-content">
                  <h3>Общие настройки</h3>
                  
                  <div class="mw-settings-field">
                    <label>
                      <input type="checkbox" id="mw-setting-show-status-window" ${loadSetting("showStatusWindow", true) ? "checked" : ""}>
                      Показывать окно статуса
                    </label>
                  </div>
                  
                  <div class="mw-settings-field">
                    <label>
                      <input type="checkbox" id="mw-setting-enable-shortcuts" ${loadSetting("enableShortcuts", true) ? "checked" : ""}>
                      Включить горячие клавиши
                    </label>
                  </div>
                  
                  <div class="mw-settings-field">
                    <label>
                      <input type="checkbox" id="mw-setting-show-notifications" ${loadSetting("showNotifications", true) ? "checked" : ""}>
                      Показывать уведомления
                    </label>
                  </div>
                </div>
                
                <div id="mw-settings-tab-transport" class="mw-settings-tab-content" style="display: none;">
                  <h3>Настройки транспорта</h3>
                  
                  <div class="mw-settings-field">
                    <label>
                      <input type="checkbox" id="mw-setting-auto-refuel" ${loadSetting("autoRefuel", true) ? "checked" : ""}>
                      Автоматически заправлять при выборе
                    </label>
                  </div>
                  
                  <div class="mw-settings-field">
                    <label>Минимальный уровень топлива для заправки:</label>
                    <input type="number" id="mw-setting-min-fuel" min="1" max="99" value="${loadSetting("minFuelLevel", 25)}" style="width: 60px;">%
                  </div>
                  
                  <div class="mw-settings-field">
                    <label>Активный комплект по умолчанию:</label>
                    <select id="mw-setting-default-set">
                      <option value="1" ${loadSetting("defaultSetSlot", 1) === 1 ? "selected" : ""}>Комплект 1</option>
                      <option value="2" ${loadSetting("defaultSetSlot", 1) === 2 ? "selected" : ""}>Комплект 2</option>
                      <option value="3" ${loadSetting("defaultSetSlot", 1) === 3 ? "selected" : ""}>Комплект 3</option>
                      <option value="4" ${loadSetting("defaultSetSlot", 1) === 4 ? "selected" : ""}>Комплект 4</option>
                    </select>
                  </div>
                </div>
                
                <div id="mw-settings-tab-automation" class="mw-settings-tab-content" style="display: none;">
                  <h3>Настройки автоматизации</h3>
                  
                  <div class="mw-settings-field">
                    <label>
                      <input type="checkbox" id="mw-setting-auto-heal" ${loadSetting("autoHeal", true) ? "checked" : ""}>
                      Автоматически лечиться при низком здоровье
                    </label>
                  </div>
                  
                  <div class="mw-settings-field">
                    <label>
                      <input type="checkbox" id="mw-setting-auto-fight" ${loadSetting("autoFight", false) ? "checked" : ""}>
                      Автоматически делать ход в бою
                    </label>
                  </div>
                  
                  <div class="mw-settings-field">
                    <label>Время патрулирования (минуты):</label>
                    <input type="number" id="mw-setting-patrol-time" min="5" max="120" value="${loadSetting("patrolTime", 10)}" style="width: 60px;">
                  </div>
                  
                  <div class="mw-settings-field">
                    <label>Время работы в метро (часы):</label>
                    <input type="number" id="mw-setting-metro-time" min="1" max="8" value="${loadSetting("metroTime", 1)}" style="width: 60px;">
                  </div>
                </div>
                
                <div id="mw-settings-tab-appearance" class="mw-settings-tab-content" style="display: none;">
                  <h3>Настройки внешнего вида</h3>
                  
                  <div class="mw-settings-field">
                    <label>
                      <input type="checkbox" id="mw-setting-dark-theme" ${loadSetting("darkTheme", false) ? "checked" : ""}>
                      Темная тема
                    </label>
                  </div>
                  
                  <div class="mw-settings-field">
                    <label>
                      <input type="checkbox" id="mw-setting-compact-mode" ${loadSetting("compactMode", false) ? "checked" : ""}>
                      Компактный режим
                    </label>
                  </div>
                  
                  <div class="mw-settings-field">
                    <label>Основной цвет:</label>
                    <input type="color" id="mw-setting-primary-color" value="${loadSetting("primaryColor", "#ffcc80")}">
                  </div>
                </div>
                
                <div id="mw-settings-tab-advanced" class="mw-settings-tab-content" style="display: none;">
                  <h3>Расширенные настройки</h3>
                  
                  <div class="mw-settings-field">
                    <label>
                      <input type="checkbox" id="mw-setting-debug-mode" ${loadSetting("debugMode", false) ? "checked" : ""}>
                      Режим отладки
                    </label>
                  </div>
                  
                  <div class="mw-settings-field">
                    <button id="mw-setting-clear-data" class="mw-btn" style="background-color: #f44336; color: white;">
                      Очистить данные скрипта
                    </button>
                  </div>
                </div>
                
                <div id="mw-settings-tab-about" class="mw-settings-tab-content" style="display: none;">
                  <h3>О скрипте</h3>
                  
                  <p>MosWar 6k - версия 2.0</p>
                  <p>Автор: LinkIF</p>
                  <p>Контакты: example@mail.ru</p>
                  
                  <p>Скрипт для автоматизации игровых действий в Московских Войнах.</p>
                </div>
              </div>
            </div>
            
            <div style="display: flex; justify-content: flex-end; border-top: 1px solid #eee; padding-top: 15px;">
              <button id="mw-settings-save" class="mw-btn" style="margin-right: 10px;">Сохранить</button>
              <button id="mw-settings-cancel" class="mw-btn">Отмена</button>
            </div>
          `;
          
          // Применяем стили для вкладок
          const style = document.createElement("style");
          style.textContent = `
            .mw-settings-tab {
              padding: 8px 10px;
              margin-bottom: 5px;
              cursor: pointer;
              border-radius: 4px;
            }
            
            .mw-settings-tab:hover {
              background-color: #f5f5f5;
            }
            
            .mw-settings-tab.active {
              background-color: #ffcc80;
              font-weight: bold;
            }
            
            .mw-settings-field {
              margin-bottom: 15px;
            }
            
            .mw-settings-field label {
              display: block;
              margin-bottom: 5px;
            }
            
            .mw-settings-field select,
            .mw-settings-field input[type="number"] {
              padding: 5px;
              border-radius: 4px;
              border: 1px solid #ccc;
            }
          `;
          
          // Добавляем элементы на страницу
          settingsWindow.appendChild(header);
          settingsWindow.appendChild(content);
          settingsWindow.appendChild(style);
          
          document.body.appendChild(overlay);
          document.body.appendChild(settingsWindow);
          
          // Добавляем обработчики событий
          
          // Закрытие окна
          document.getElementById("mw-settings-close").addEventListener("click", () => {
            settingsWindow.remove();
            overlay.remove();
          });
          
          document.getElementById("mw-settings-cancel").addEventListener("click", () => {
            settingsWindow.remove();
            overlay.remove();
          });
          
          // Переключение вкладок
          document.querySelectorAll(".mw-settings-tab").forEach(tab => {
            tab.addEventListener("click", () => {
              // Деактивируем все вкладки
              document.querySelectorAll(".mw-settings-tab").forEach(t => {
                t.classList.remove("active");
              });
              
              // Скрываем все содержимое вкладок
              document.querySelectorAll(".mw-settings-tab-content").forEach(content => {
                content.style.display = "none";
              });
              
              // Активируем выбранную вкладку
              tab.classList.add("active");
              
              // Показываем содержимое выбранной вкладки
              const tabId = tab.dataset.tab;
              document.getElementById(`mw-settings-tab-${tabId}`).style.display = "block";
            });
          });
          
          // Сохранение настроек
          document.getElementById("mw-settings-save").addEventListener("click", () => {
            // Собираем значения всех настроек
            const settings = {
              // Общие
              showStatusWindow: document.getElementById("mw-setting-show-status-window").checked,
              enableShortcuts: document.getElementById("mw-setting-enable-shortcuts").checked,
              showNotifications: document.getElementById("mw-setting-show-notifications").checked,
              
              // Транспорт
              autoRefuel: document.getElementById("mw-setting-auto-refuel").checked,
              minFuelLevel: parseInt(document.getElementById("mw-setting-min-fuel").value, 10),
              defaultSetSlot: parseInt(document.getElementById("mw-setting-default-set").value, 10),
              
              // Автоматизация
              autoHeal: document.getElementById("mw-setting-auto-heal").checked,
              autoFight: document.getElementById("mw-setting-auto-fight").checked,
              patrolTime: parseInt(document.getElementById("mw-setting-patrol-time").value, 10),
              metroTime: parseInt(document.getElementById("mw-setting-metro-time").value, 10),
              
              // Внешний вид
              darkTheme: document.getElementById("mw-setting-dark-theme").checked,
              compactMode: document.getElementById("mw-setting-compact-mode").checked,
              primaryColor: document.getElementById("mw-setting-primary-color").value,
              
              // Расширенные
              debugMode: document.getElementById("mw-setting-debug-mode").checked
            };
            
            // Сохраняем настройки
            saveSettings(settings);
            
            // Применяем некоторые настройки сразу
            if (settings.showStatusWindow) {
              setupStatusWindow();
            } else {
              const statusWindow = document.getElementById("mw-status-window");
              if (statusWindow) {
                statusWindow.style.display = "none";
              }
            }
            
            // Устанавливаем комплект по умолчанию
            localStorage.setItem("mw-last-set-used", settings.defaultSetSlot.toString());
            updateSetIndicator();
            
            // Показываем уведомление
            showNotification("⚙️ Настройки сохранены");
            
            // Закрываем окно настроек
            settingsWindow.remove();
            overlay.remove();
          });
          
          // Обработчик для кнопки очистки данных
          document.getElementById("mw-setting-clear-data").addEventListener("click", () => {
            if (confirm("Вы уверены, что хотите очистить все данные скрипта? Это действие нельзя отменить.")) {
              // Очищаем данные скрипта
              for (let i = 1; i <= 4; i++) {
                localStorage.removeItem(`mw-carset-${i}`);
              }
              
              localStorage.removeItem("mw-settings");
              localStorage.removeItem("mw-logs");
              localStorage.removeItem("mw-last-set-used");
              
              // Перезагружаем страницу
              window.location.reload();
            }
          });
        });
        
        console.log("[UI] Settings window set up successfully");
      } catch (error) {
        console.error("Error setting up settings window:", error);
      }
    }
    
    /**
     * Применяет настройки темы к интерфейсу
     */
    function applyThemeSettings() {
      try {
        console.log("[UI] Applying theme settings");
        
        const darkTheme = loadSetting("darkTheme", false);
        const compactMode = loadSetting("compactMode", false);
        const primaryColor = loadSetting("primaryColor", "#ffcc80");
        
        // Создаем стиль для темы
        const themeStyle = document.createElement("style");
        themeStyle.id = "mw-theme-style";
        
        let cssText = "";
        
        if (darkTheme) {
          cssText += `
            #mw-panel {
              background: #333;
              border-color: ${primaryColor};
              color: #fff;
            }
            
            .mw-slot {
              background: #444;
              border-color: ${primaryColor};
              color: #fff;
            }
            
            .mw-btn {
              background: linear-gradient(to bottom, ${primaryColor}, ${primaryColor}dd);
              border-color: ${primaryColor};
              color: #000;
            }
            
            .mw-status-line {
              color: #aaa;
            }
            
            #mw-transport-controls {
              background: #333;
              border-color: ${primaryColor};
              color: #fff;
            }
            
            .mw-select {
              background: #444;
              color: #fff;
              border-color: #555;
            }
          `;
        } else {
          cssText += `
            #mw-panel {
              border-color: ${primaryColor};
            }
            
            .mw-slot {
              border-color: ${primaryColor}dd;
              background: ${primaryColor}22;
            }
            
            .mw-btn {
              background: linear-gradient(to bottom, ${primaryColor}dd, ${primaryColor});
              border-color: ${primaryColor}dd;
            }
          `;
        }
        
        if (compactMode) {
          cssText += `
            #mw-panel {
              padding: 5px 10px;
            }
            
            .mw-btn {
              padding: 3px 8px;
              font-size: 12px;
            }
            
            .mw-slot {
              margin: 2px;
              padding: 3px 6px;
              font-size: 12px;
            }
            
            .mw-status-line {
              margin-top: 5px;
              font-size: 11px;
            }
          `;
        }
        
        themeStyle.textContent = cssText;
        
        // Удаляем старый стиль, если есть
        const oldStyle = document.getElementById("mw-theme-style");
        if (oldStyle) {
          oldStyle.remove();
        }
        
        // Добавляем новый стиль
        document.head.appendChild(themeStyle);
        
        console.log("[UI] Theme settings applied");
      } catch (error) {
        console.error("Error applying theme settings:", error);
      }
    }