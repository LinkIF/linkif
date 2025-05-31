// MosWar 6k - Улучшенный скрипт для Московских Войн
// Часть 7/7 (финальная)

    /**
     * Добавляет наблюдатель за логами боя
     */
    function addCombatLogObserver() {
      try {
        console.log("[Combat] Adding combat log observer");
        
        // Проверяем, находимся ли на странице боя
        if (!window.location.href.includes("/fight/")) {
          return;
        }
        
        // Находим контейнер логов
        const logsContainer = document.getElementById("fightlogs");
        if (!logsContainer) {
          console.log("[Combat] Logs container not found");
          return;
        }
        
        // Добавляем панель управления логами
        const controlPanel = document.createElement("div");
        controlPanel.className = "combat-log-controls";
        controlPanel.style.cssText = `
          position: fixed;
          top: 60px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(0, 0, 0, 0.7);
          border-radius: 20px;
          padding: 5px 15px;
          display: flex;
          gap: 10px;
          z-index: 1000;
        `;
        
        // Добавляем кнопки управления
        const collapseButton = createButton("🔍 Свернуть", () => {
          const logs = document.querySelectorAll("#fightlogs .block-rounded");
          logs.forEach(log => {
            if (!log.dataset.originalHeight) {
              log.dataset.originalHeight = log.style.height || `${log.offsetHeight}px`;
            }
            log.style.height = "30px";
            log.style.overflow = "hidden";
            log.dataset.collapsed = "true";
          });
        }, "Свернуть все логи");
        
        const expandButton = createButton("🔎 Развернуть", () => {
          const logs = document.querySelectorAll("#fightlogs .block-rounded");
          logs.forEach(log => {
            if (log.dataset.originalHeight) {
              log.style.height = log.dataset.originalHeight;
            } else {
              log.style.height = "auto";
            }
            log.style.overflow = "";
            log.dataset.collapsed = "false";
          });
        }, "Развернуть все логи");
        
        const clearButton = createButton("🧹 Очистить", () => {
          const logs = document.querySelectorAll("#fightlogs .block-rounded:not(.important)");
          logs.forEach(log => {
            log.style.display = "none";
          });
        }, "Скрыть неважные логи");
        
        const refreshButton = createButton("🔄 Обновить", () => {
          window.location.reload();
        }, "Обновить страницу");
        
        controlPanel.appendChild(collapseButton);
        controlPanel.appendChild(expandButton);
        controlPanel.appendChild(clearButton);
        controlPanel.appendChild(refreshButton);
        
        document.body.appendChild(controlPanel);
        
        // Настраиваем наблюдатель за логами
        setupLogsObserver(logsContainer);
        
        console.log("[Combat] Combat log observer added");
      } catch (error) {
        console.error("Error adding combat log observer:", error);
      }
    }
    
    /**
     * Автоматический выбор действия в бою
     */
    function autoCombat() {
      try {
        console.log("[Combat] Checking for automatic combat action");
        
        // Проверяем, включен ли авто-бой
        if (loadSetting("autoFight", false) !== true) {
          return;
        }
        
        // Проверяем, находимся ли на странице боя
        if (!window.location.href.includes("/fight/")) {
          return;
        }
        
        // Проверяем, наш ли ход
        const turnIndicator = document.querySelector("#fightcontrol .block-rounded .present");
        if (!turnIndicator || !turnIndicator.innerText.includes("Ваш ход")) {
          console.log("[Combat] Not player's turn");
          return;
        }
        
        console.log("[Combat] It's player's turn, making automatic action");
        
        // Получаем информацию о нашем персонаже
        const playerHealth = document.querySelector(".fighter2 .percent");
        if (!playerHealth) {
          console.log("[Combat] Could not find player's health");
          return;
        }
        
        const healthPercent = parseInt(playerHealth.style.width, 10);
        
        // Решаем, какое действие выполнить
        let useDefense = false;
        
        // Если здоровье меньше 30%, используем защиту
        if (healthPercent < 30) {
          useDefense = true;
        }
        
        // Если здоровье больше 30%, но меньше 50%, с вероятностью 50% используем защиту
        else if (healthPercent < 50 && Math.random() < 0.5) {
          useDefense = true;
        }
        
        // Делаем ход
        setTimeout(() => makeTurn(useDefense), 1000 + Math.random() * 2000);
      } catch (error) {
        console.error("Error in auto combat:", error);
      }
    }
    
    /**
     * Сохраняет статистику боя
     */
    function saveCombatStats() {
      try {
        console.log("[Combat] Saving combat statistics");
        
        // Проверяем, находимся ли на странице боя
        if (!window.location.href.includes("/fight/")) {
          return;
        }
        
        // Проверяем, окончен ли бой
        const resultElement = document.querySelector("#fightcontrol .result");
        if (!resultElement) {
          console.log("[Combat] Combat not finished yet");
          return;
        }
        
        // Получаем результат боя
        const resultText = resultElement.innerText;
        const isVictory = resultText.includes("победили") || resultText.includes("выиграли");
        const isDefeat = resultText.includes("проиграли") || resultText.includes("проигрыш");
        const isDraw = resultText.includes("ничья") || resultText.includes("вничью");
        
        let result = "unknown";
        if (isVictory) result = "victory";
        else if (isDefeat) result = "defeat";
        else if (isDraw) result = "draw";
        
        // Получаем противников
        const opponent1 = document.querySelector(".fighter1 .user a")?.innerText || "Unknown";
        const opponent2 = document.querySelector(".fighter2 .user a")?.innerText || "Unknown";
        
        // Получаем опыт и деньги
        const expGained = document.querySelector(".experience")?.innerText.match(/\d+/) || 0;
        const moneyGained = document.querySelector(".tugriki")?.innerText.replace(/,/g, "") || 0;
        
        // Создаем запись о бое
        const combatRecord = {
          date: new Date().toISOString(),
          result,
          opponent1,
          opponent2,
          expGained: parseInt(expGained, 10),
          moneyGained: parseInt(moneyGained, 10),
          url: window.location.href
        };
        
        // Получаем сохраненную статистику
        let combatStats = JSON.parse(localStorage.getItem("mw-combat-stats") || "[]");
        
        // Добавляем новую запись
        combatStats.push(combatRecord);
        
        // Ограничиваем количество записей
        if (combatStats.length > 100) {
          combatStats = combatStats.slice(-100);
        }
        
        // Сохраняем обновленную статистику
        localStorage.setItem("mw-combat-stats", JSON.stringify(combatStats));
        
        console.log(`[Combat] Combat statistics saved: ${result}`);
      } catch (error) {
        console.error("Error saving combat stats:", error);
      }
    }
    
    /**
     * Показывает панель с боевой статистикой
     */
    function showCombatStatsPanel() {
      try {
        // Проверяем, существует ли уже панель
        if (document.getElementById("mw-combat-stats-panel")) {
          document.getElementById("mw-combat-stats-panel").style.display = "block";
          return;
        }
        
        console.log("[Combat] Showing combat statistics panel");
        
        // Получаем сохраненную статистику
        const combatStats = JSON.parse(localStorage.getItem("mw-combat-stats") || "[]");
        
        if (combatStats.length === 0) {
          showNotification("⚔️ Нет сохраненных данных о боях");
          return;
        }
        
        // Создаем оверлей
        const overlay = document.createElement("div");
        overlay.style.cssText = `
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          z-index: 9998;
        `;
        
        // Создаем панель статистики
        const panel = document.createElement("div");
        panel.id = "mw-combat-stats-panel";
        panel.style.cssText = `
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 700px;
          max-width: 90%;
          max-height: 80%;
          overflow-y: auto;
          background: white;
          border-radius: 10px;
          padding: 20px;
          z-index: 9999;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
        `;
        
        // Создаем заголовок
        const header = document.createElement("div");
        header.style.cssText = `
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 10px;
          border-bottom: 1px solid #eee;
        `;
        
        header.innerHTML = `
          <h2 style="margin: 0;">Боевая статистика</h2>
          <span id="mw-combat-stats-close" style="cursor: pointer; font-size: 24px;">&times;</span>
        `;
        
        // Анализируем статистику
        const totalCombats = combatStats.length;
        const victories = combatStats.filter(s => s.result === "victory").length;
        const defeats = combatStats.filter(s => s.result === "defeat").length;
        const draws = combatStats.filter(s => s.result === "draw").length;
        
        const victoryRate = ((victories / totalCombats) * 100).toFixed(1);
        
        const totalExp = combatStats.reduce((sum, s) => sum + (s.expGained || 0), 0);
        const totalMoney = combatStats.reduce((sum, s) => sum + (s.moneyGained || 0), 0);
        
        // Создаем общую статистику
        const summary = document.createElement("div");
        summary.style.cssText = `
          display: flex;
          flex-wrap: wrap;
          gap: 20px;
          margin-bottom: 20px;
        `;
        
        summary.innerHTML = `
          <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; min-width: 200px;">
            <h3 style="margin-top: 0;">Итоги</h3>
            <div>Всего боёв: <strong>${totalCombats}</strong></div>
            <div>Победы: <strong style="color: green;">${victories}</strong></div>
            <div>Поражения: <strong style="color: red;">${defeats}</strong></div>
            <div>Ничьи: <strong style="color: gray;">${draws}</strong></div>
            <div>Процент побед: <strong>${victoryRate}%</strong></div>
          </div>
          
          <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; min-width: 200px;">
            <h3 style="margin-top: 0;">Награды</h3>
            <div>Всего опыта: <strong>${totalExp.toLocaleString()}</strong></div>
            <div>Всего денег: <strong>${totalMoney.toLocaleString()} тг.</strong></div>
            <div>Среднее за бой: <strong>${Math.round(totalExp / totalCombats).toLocaleString()} опыта</strong></div>
            <div>Среднее за бой: <strong>${Math.round(totalMoney / totalCombats).toLocaleString()} тг.</strong></div>
          </div>
        `;
        
        // Создаем таблицу с боями
        const table = document.createElement("div");
        table.style.cssText = `
          max-height: 400px;
          overflow-y: auto;
          margin-top: 20px;
          border-top: 1px solid #eee;
          padding-top: 20px;
        `;
        
        table.innerHTML = `
          <h3>История боёв</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: #f5f5f5;">
                <th style="padding: 8px; text-align: left;">Дата</th>
                <th style="padding: 8px; text-align: left;">Результат</th>
                <th style="padding: 8px; text-align: left;">Противники</th>
                <th style="padding: 8px; text-align: right;">Опыт</th>
                <th style="padding: 8px; text-align: right;">Деньги</th>
              </tr>
            </thead>
            <tbody>
              ${combatStats.reverse().map(stat => `
                <tr style="border-bottom: 1px solid #eee;">
                  <td style="padding: 8px;">${new Date(stat.date).toLocaleString()}</td>
                  <td style="padding: 8px;">
                    <span style="color: ${
                      stat.result === "victory" ? "green" : 
                      stat.result === "defeat" ? "red" : 
                      "gray"
                    };">
                      ${
                        stat.result === "victory" ? "Победа" : 
                        stat.result === "defeat" ? "Поражение" : 
                        stat.result === "draw" ? "Ничья" : 
                        "Неизвестно"
                      }
                    </span>
                  </td>
                  <td style="padding: 8px;">${stat.opponent1} vs ${stat.opponent2}</td>
                  <td style="padding: 8px; text-align: right;">${stat.expGained?.toLocaleString() || 0}</td>
                  <td style="padding: 8px; text-align: right;">${stat.moneyGained?.toLocaleString() || 0}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        `;
        
        // Добавляем кнопку экспорта
        const exportButton = document.createElement("button");
        exportButton.className = "mw-btn";
        exportButton.textContent = "📊 Экспорт данных";
        exportButton.style.marginTop = "20px";
        
        exportButton.addEventListener("click", () => {
          try {
            // Создаем CSV строку
            let csv = "Дата;Результат;Противник 1;Противник 2;Опыт;Деньги\n";
            
            combatStats.forEach(stat => {
              csv += `${new Date(stat.date).toLocaleString()};`;
              csv += `${
                stat.result === "victory" ? "Победа" : 
                stat.result === "defeat" ? "Поражение" : 
                stat.result === "draw" ? "Ничья" : 
                "Неизвестно"
              };`;
              csv += `${stat.opponent1};`;
              csv += `${stat.opponent2};`;
              csv += `${stat.expGained || 0};`;
              csv += `${stat.moneyGained || 0}\n`;
            });
            
            // Создаем Blob и ссылку для скачивания
            const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
            const url = URL.createObjectURL(blob);
            
            // Создаем ссылку для скачивания и "кликаем" по ней
            const link = document.createElement("a");
            link.setAttribute("href", url);
            link.setAttribute("download", `moswar-combat-stats-${new Date().toISOString().slice(0, 10)}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          } catch (err) {
            console.error("Error exporting combat stats:", err);
            showNotification("❌ Ошибка при экспорте данных");
          }
        });
        
        // Собираем все вместе
        panel.appendChild(header);
        panel.appendChild(summary);
        panel.appendChild(table);
        panel.appendChild(exportButton);
        
        document.body.appendChild(overlay);
        document.body.appendChild(panel);
        
        // Добавляем обработчики закрытия
        document.getElementById("mw-combat-stats-close").addEventListener("click", () => {
          panel.remove();
          overlay.remove();
        });
        
        overlay.addEventListener("click", () => {
          panel.remove();
          overlay.remove();
        });
        
        console.log("[Combat] Combat statistics panel shown");
      } catch (error) {
        console.error("Error showing combat stats panel:", error);
      }
    }
    
    /**
     * Обрабатывает вход на страницу боя
     */
    function handleCombatPageLoad() {
      try {
        console.log("[Combat] Handling combat page load");
        
        // Проверяем, находимся ли на странице боя
        if (!window.location.href.includes("/fight/")) {
          return;
        }
        
        // Добавляем навигационную панель
        renderNavbar();
        
        // Добавляем наблюдатель за логами
        addCombatLogObserver();
        
        // Очищаем логи боя
        cleanupFightLogs();
        
        // Проверяем, нужно ли сделать автоматический ход
        autoCombat();
        
        // Проверяем, окончен ли бой
        const resultElement = document.querySelector("#fightcontrol .result");
        if (resultElement) {
          console.log("[Combat] Combat finished, saving stats");
          saveCombatStats();
        }
        
        console.log("[Combat] Combat page handlers initialized");
      } catch (error) {
        console.error("Error handling combat page load:", error);
      }
    }
    
    /**
     * Настройка обработчиков событий страниц
     */
    function setupPageHandlers() {
      try {
        console.log("[Init] Setting up page handlers");
        
        // Обработка текущей страницы
        const currentUrl = window.location.href;
        
        // Обработка страницы боя
        if (currentUrl.includes("/fight/")) {
          handleCombatPageLoad();
        }
        
        // Обработка страницы транспорта
        else if (currentUrl.includes("/automobile/")) {
          initializeButtons();
          addTransportControls();
        }
        
        // Обработка страницы гаража
        else if (currentUrl.includes("/home/")) {
          initializeButtons();
        }
        
        // Обработка общих интерфейсных элементов
        redrawMain();
        
        console.log("[Init] Page handlers set up");
      } catch (error) {
        console.error("Error setting up page handlers:", error);
      }
    }
    
    /**
     * Запуск основной функции инициализации
     */
    function startScript() {
      try {
        console.log("[Init] Starting MosWar 6k script");
        
        // Инициализируем скрипт
        init();
        
        // Устанавливаем обработчики страниц
        setupPageHandlers();
        
        // Устанавливаем наблюдатель за динамическими элементами
        setupDynamicElementsObserver();
        
        // Переопределяем функции игры
        overrideGameFunctions();
        
        // Настраиваем горячие клавиши
        setupKeyboardShortcuts();
        
        // Устанавливаем окно статуса
        if (loadSetting("showStatusWindow", true)) {
          setupStatusWindow();
        }
        
        // Устанавливаем окно настроек
        setupSettingsWindow();
        
        // Применяем настройки темы
        applyThemeSettings();
        
        // Показываем уведомление о запуске
        showNotification("✅ MosWar 6k запущен");
        
        console.log("[Init] MosWar 6k script started successfully");
      } catch (error) {
        console.error("Error starting script:", error);
      }
    }
    
    // Запускаем скрипт через небольшую задержку для полной загрузки страницы
    setTimeout(startScript, 500);

    // Экспортируем основные функции и объекты скрипта глобально
    window.MosWar6k = {
      // Основные функции
      init,
      redrawMain,
      autoPilot,
      fillAllCars,
      patrolMode,
      metroWorkMode,
      fightMode,
      
      // Функции для работы с комплектами
      saveSet,
      sendSet,
      saveSetModal,
      resetSlot,
      
      // Функции для транспорта
      checkCarFuel,
      fillCarFuel,
      
      // Функции для боя
      makeTurn,
      autoCombat,
      showCombatStatsPanel,
      
      // Функции интерфейса
      updateStatus,
      showNotification,
      showAlert,
      
      // Настройки
      saveSettings,
      loadSetting,
      
      // Текущее состояние игрока
      player
    };
})();