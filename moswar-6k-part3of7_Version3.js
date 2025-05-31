// MosWar 6k - Улучшенный скрипт для Московских Войн
// Часть 3/7

    /**
     * Атака игрока
     * @param {string|number} playerId - ID игрока для атаки
     * @returns {Promise<boolean>} Результат атаки
     */
    async function attackPlayer(playerId) {
      try {
        console.log(`[Attack] Attacking player ${playerId}`);
        
        // Проверяем здоровье перед боем
        await checkAndRestoreHealth();
        
        // Выполняем запрос на атаку
        const attackResponse = await fetch(`https://www.moswar.ru/alley/attack/${playerId}/`, {
          method: "GET",
          credentials: "include"
        });
        
        // Проверяем успешность атаки
        const attackUrl = attackResponse.url;
        if (attackUrl.includes("/fight/")) {
          // Удалось начать бой
          const fightId = attackUrl.match(/\/fight\/(\d+)/)?.[1];
          console.log(`[Attack] Started fight #${fightId} with player ${playerId}`);
          
          // Пробуем сделать ход в бою
          setTimeout(() => makeTurn(), 1000);
          return true;
        } else {
          // Не удалось начать бой
          console.log(`[Attack] Failed to attack player ${playerId}`);
          return false;
        }
      } catch (error) {
        console.error(`Error attacking player ${playerId}:`, error);
        return false;
      }
    }
    
    /**
     * Атака по критериям
     * @param {Object} options - Параметры атаки
     * @param {string} options.criteria - Критерий атаки ('any', 'type', 'clan')
     * @param {number} options.minLvl - Минимальный уровень
     * @param {number} options.maxLvl - Максимальный уровень
     * @param {string} options.type - Тип противника ('npc', 'player')
     * @param {string} options.clan - Клан противника
     * @returns {Promise<boolean>} Результат атаки
     */
    async function attackByCriteria({
      criteria = "any",
      minLvl = 1,
      maxLvl = 999,
      type = "any",
      clan = ""
    }) {
      try {
        console.log(`[Attack] Searching target: ${criteria}, levels ${minLvl}-${maxLvl}, type ${type}, clan "${clan}"`);
        
        // Открываем страницу закоулков для поиска противников
        const alleyResponse = await fetch("https://www.moswar.ru/alley/");
        const alleyText = await alleyResponse.text();
        const alleyDoc = parseHtml(alleyText);
        
        // Собираем информацию о всех противниках
        const opponents = alleyDoc.querySelectorAll(".opponent");
        const opponentsList = [];
        
        for (const opponent of opponents) {
          try {
            // Получаем ссылку на профиль
            const profileLink = opponent.querySelector(".user a");
            if (!profileLink) continue;
            
            // Извлекаем ID игрока из ссылки
            const href = profileLink.getAttribute("href");
            const idMatch = href.match(/\/player\/(\d+)/);
            if (!idMatch || !idMatch[1]) continue;
            
            const opponentId = idMatch[1];
            
            // Получаем уровень игрока
            const levelElement = opponent.querySelector(".level");
            if (!levelElement) continue;
            
            const levelMatch = levelElement.innerText.match(/\d+/);
            if (!levelMatch) continue;
            
            const level = parseInt(levelMatch[0], 10);
            
            // Определяем тип противника (игрок или NPC)
            const isNpc = opponent.classList.contains("npc");
            const opponentType = isNpc ? "npc" : "player";
            
            // Проверяем, подходит ли противник по уровню
            if (level < minLvl || level > maxLvl) continue;
            
            // Проверяем, подходит ли противник по типу
            if (type !== "any" && type !== opponentType) continue;
            
            // Получаем клан противника (если есть)
            const clanElement = opponent.querySelector(".clan");
            const opponentClan = clanElement ? clanElement.innerText.trim() : "";
            
            // Проверяем, подходит ли противник по клану
            if (clan && opponentClan !== clan) continue;
            
            // Противник подходит по всем критериям, добавляем в список
            opponentsList.push({
              id: opponentId,
              level,
              type: opponentType,
              clan: opponentClan
            });
          } catch (err) {
            console.warn("Error processing opponent:", err);
          }
        }
        
        // Если нет подходящих противников, возвращаем false
        if (opponentsList.length === 0) {
          console.log("[Attack] No suitable opponents found");
          return false;
        }
        
        // Выбираем случайного противника из подходящих
        const randomIndex = Math.floor(Math.random() * opponentsList.length);
        const target = opponentsList[randomIndex];
        
        console.log(`[Attack] Found suitable opponent: #${target.id} (lvl ${target.level}, ${target.type}${target.clan ? ', clan: ' + target.clan : ''})`);
        
        // Атакуем выбранного противника
        return await attackPlayer(target.id);
      } catch (error) {
        console.error("Error in attackByCriteria:", error);
        return false;
      }
    }
    
    /**
     * Делает ход в бою
     * @param {boolean} defense - Выбрать защиту вместо атаки
     * @returns {Promise<boolean>} Результат хода
     */
    async function makeTurn(defense = false) {
      try {
        // Проверяем, находимся ли мы в бою
        const currentUrl = window.location.href;
        if (!currentUrl.includes("/fight/")) {
          console.log("[Fight] Not in fight, cannot make turn");
          return false;
        }
        
        // Получаем ID боя из URL
        const fightId = currentUrl.match(/\/fight\/(\d+)/)?.[1];
        if (!fightId) {
          console.log("[Fight] Could not get fight ID from URL");
          return false;
        }
        
        // Проверяем, наш ли ход
        const turnIndicator = document.querySelector("#fightcontrol .block-rounded .present");
        if (!turnIndicator || !turnIndicator.innerText.includes("Ваш ход")) {
          console.log("[Fight] Not your turn");
          
          // Проверяем, окончен ли бой
          const fightEnded = document.querySelector("#fightcontrol .result");
          if (fightEnded) {
            console.log("[Fight] Fight ended");
            
            // Проверяем результат боя
            const resultText = fightEnded.innerText;
            const isVictory = resultText.includes("победили") || resultText.includes("выиграли");
            const isDefeat = resultText.includes("проиграли") || resultText.includes("проигрыш");
            const isDraw = resultText.includes("ничья") || resultText.includes("вничью");
            
            console.log(`[Fight] Result: ${isVictory ? 'Victory' : isDefeat ? 'Defeat' : isDraw ? 'Draw' : 'Unknown'}`);
            
            // Возвращаемся на страницу закоулков
            setTimeout(() => {
              window.location.href = "https://www.moswar.ru/alley/";
            }, 2000);
          }
          
          return false;
        }
        
        // Выбираем тип хода (атака или защита)
        const moveType = defense ? "defense" : "attack";
        
        // Выполняем ход
        const response = await fetch(`https://www.moswar.ru/fight/${fightId}/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            "X-Requested-With": "XMLHttpRequest"
          },
          body: `action=${moveType}&__ajax=1&return_url=%2Ffight%2F${fightId}%2F`,
          credentials: "include"
        });
        
        const result = await response.json();
        
        // Проверяем результат хода
        if (result.success) {
          console.log(`[Fight] Turn made: ${moveType}`);
          
          // Обновляем страницу для отображения результатов
          setTimeout(() => {
            window.location.reload();
          }, 1500);
          
          return true;
        } else {
          console.log(`[Fight] Failed to make turn: ${result.error || "Unknown error"}`);
          return false;
        }
      } catch (error) {
        console.error("Error making turn:", error);
        return false;
      }
    }
    
    /**
     * Проверяет необходимость атаки
     * @returns {Promise<boolean>} true если нужно атаковать
     */
    async function shouldAttack() {
      try {
        // Проверяем, есть ли у игрока открытый бой
        const response = await fetch("https://www.moswar.ru/alley/");
        const text = await response.text();
        
        // Проверяем наличие сообщения об ожидании боя
        const waitingForFight = text.includes("Ожидание боя");
        if (waitingForFight) {
          console.log("[Attack] Already waiting for fight");
          return false;
        }
        
        // Проверяем наличие кулдауна в закоулках
        const cooldown = await getAlleyCooldown();
        if (cooldown > 0) {
          console.log(`[Attack] Alley on cooldown: ${cooldown} seconds`);
          return false;
        }
        
        // Проверяем здоровье персонажа
        const healthInfo = await checkInjury();
        if (healthInfo.health < healthInfo.maxHealth * 0.5) {
          console.log(`[Attack] Low health: ${healthInfo.health}/${healthInfo.maxHealth}`);
          await checkAndRestoreHealth();
          
          // Проверяем здоровье еще раз после лечения
          const updatedHealth = await checkInjury();
          if (updatedHealth.health < updatedHealth.maxHealth * 0.5) {
            console.log("[Attack] Still low health after healing");
            return false;
          }
        }
        
        // Проверяем наличие травмы
        if (healthInfo.injury > 0) {
          console.log(`[Attack] Has injury: ${healthInfo.injury}%`);
          await heal();
          
          // Проверяем травму еще раз после лечения
          const updatedHealth = await checkInjury();
          if (updatedHealth.injury > 0) {
            console.log("[Attack] Still has injury after healing");
            return false;
          }
        }
        
        return true;
      } catch (error) {
        console.error("Error in shouldAttack:", error);
        return false;
      }
    }
    
    /**
     * Режим присоединения к хаотичному бою
     */
    async function joinChaoticFight() {
      try {
        console.log("[Chaotic] Looking for chaotic fight");
        
        // Проверяем возможность атаки
        if (!(await shouldAttack())) {
          console.log("[Chaotic] Cannot attack, will retry later");
          setTimeout(joinChaoticFight, 60 * 1000);
          return;
        }
        
        // Получаем страницу с хаотичными боями
        const response = await fetch("https://www.moswar.ru/alley/chaotic/");
        const text = await response.text();
        const doc = parseHtml(text);
        
        // Ищем доступные хаотичные бои
        const chaoticFights = doc.querySelectorAll(".available-fights .fight-preview");
        
        if (chaoticFights.length === 0) {
          console.log("[Chaotic] No available chaotic fights");
          setTimeout(joinChaoticFight, 60 * 1000);
          return;
        }
        
        console.log(`[Chaotic] Found ${chaoticFights.length} chaotic fights`);
        
        // Выбираем случайный бой
        const randomIndex = Math.floor(Math.random() * chaoticFights.length);
        const fight = chaoticFights[randomIndex];
        
        // Находим кнопку присоединения
        const joinButton = fight.querySelector("a.join");
        
        if (!joinButton) {
          console.log("[Chaotic] Could not find join button");
          setTimeout(joinChaoticFight, 60 * 1000);
          return;
        }
        
        // Получаем URL для присоединения
        const joinUrl = joinButton.getAttribute("href");
        
        // Присоединяемся к бою
        console.log(`[Chaotic] Joining fight: ${joinUrl}`);
        
        const joinResponse = await fetch(`https://www.moswar.ru${joinUrl}`, {
          method: "GET",
          credentials: "include"
        });
        
        // Проверяем успешность присоединения
        const joinedUrl = joinResponse.url;
        if (joinedUrl.includes("/fight/")) {
          // Удалось присоединиться
          const fightId = joinedUrl.match(/\/fight\/(\d+)/)?.[1];
          console.log(`[Chaotic] Joined fight #${fightId}`);
          
          // Пробуем сделать ход
          setTimeout(() => makeTurn(), 1000);
        } else {
          console.log("[Chaotic] Failed to join fight");
          setTimeout(joinChaoticFight, 60 * 1000);
        }
      } catch (error) {
        console.error("Error joining chaotic fight:", error);
        setTimeout(joinChaoticFight, 5 * 60 * 1000);
      }
    }
    
    /**
     * Режим хаотичного боя
     * @param {number} cooldown - Кулдаун между боями в минутах
     */
    async function chaoticFightMode(cooldown = 10) {
      try {
        await joinChaoticFight();
        setTimeout(() => chaoticFightMode(cooldown), cooldown * 60 * 1000);
      } catch (error) {
        console.error("Error in chaotic fight mode:", error);
        setTimeout(() => chaoticFightMode(cooldown), 5 * 60 * 1000);
      }
    }
    
    /**
     * Режим присоединения к групповому бою (протекции)
     */
    async function joinProt() {
      try {
        console.log("[Prot] Looking for protection fight");
        
        // Проверяем возможность атаки
        if (!(await shouldAttack())) {
          console.log("[Prot] Cannot attack, will retry later");
          setTimeout(joinProt, 60 * 1000);
          return;
        }
        
        // Получаем страницу с защитой района
        const response = await fetch("https://www.moswar.ru/alley/groupfight/");
        const text = await response.text();
        const doc = parseHtml(text);
        
        // Ищем доступные бои за район
        const protFights = doc.querySelectorAll(".available-fights .fight-preview");
        
        if (protFights.length === 0) {
          console.log("[Prot] No available protection fights");
          setTimeout(joinProt, 60 * 1000);
          return;
        }
        
        console.log(`[Prot] Found ${protFights.length} protection fights`);
        
        // Выбираем случайный бой
        const randomIndex = Math.floor(Math.random() * protFights.length);
        const fight = protFights[randomIndex];
        
        // Находим кнопку присоединения
        const joinButton = fight.querySelector("a.join");
        
        if (!joinButton) {
          console.log("[Prot] Could not find join button");
          setTimeout(joinProt, 60 * 1000);
          return;
        }
        
        // Получаем URL для присоединения
        const joinUrl = joinButton.getAttribute("href");
        
        // Присоединяемся к бою
        console.log(`[Prot] Joining fight: ${joinUrl}`);
        
        const joinResponse = await fetch(`https://www.moswar.ru${joinUrl}`, {
          method: "GET",
          credentials: "include"
        });
        
        // Проверяем успешность присоединения
        const joinedUrl = joinResponse.url;
        if (joinedUrl.includes("/fight/")) {
          // Удалось присоединиться
          const fightId = joinedUrl.match(/\/fight\/(\d+)/)?.[1];
          console.log(`[Prot] Joined fight #${fightId}`);
          
          // Пробуем сделать ход
          setTimeout(() => makeTurn(), 1000);
        } else {
          console.log("[Prot] Failed to join fight");
          setTimeout(joinProt, 60 * 1000);
        }
      } catch (error) {
        console.error("Error joining prot fight:", error);
        setTimeout(joinProt, 5 * 60 * 1000);
      }
    }
    
    /**
     * Режим протекций (защита района)
     * @param {number} cooldown - Кулдаун между боями в минутах
     */
    async function protMode(cooldown = 10) {
      try {
        await joinProt();
        setTimeout(() => protMode(cooldown), cooldown * 60 * 1000);
      } catch (error) {
        console.error("Error in prot mode:", error);
        setTimeout(() => protMode(cooldown), 5 * 60 * 1000);
      }
    }
    
    /**
     * Режим боя (основной режим сражений)
     * @param {Object} options - Параметры боя
     * @param {string} options.type - Тип боя ('npc', 'player', 'prot', 'chaotic')
     * @param {number} options.minLevel - Минимальный уровень противника
     * @param {number} options.maxLevel - Максимальный уровень противника
     */
    async function fightMode(options = {}) {
      try {
        const { type = "npc", minLevel = 8, maxLevel = 12 } = options;
        
        // Выбираем режим боя в зависимости от типа
        switch (type.toLowerCase()) {
          case "prot":
          case "protection":
            await protMode();
            break;
            
          case "chaotic":
            await chaoticFightMode();
            break;
            
          case "npc":
            await farm(minLevel, maxLevel, "npc");
            break;
            
          case "player":
            await farm(minLevel, maxLevel, "player");
            break;
            
          default:
            await farm(minLevel, maxLevel, "any");
            break;
        }
      } catch (error) {
        console.error("Error in fight mode:", error);
        // Пробуем еще раз через 5 минут в случае ошибки
        setTimeout(() => fightMode(options), 5 * 60 * 1000);
      }
    }
    
    /**
     * Инициализация для смурфа (альт-аккаунта)
     * @param {Object} options - Параметры инициализации
     * @param {string} options.mode - Режим работы ('patrol', 'metro', 'farm')
     * @param {number} options.minLevel - Минимальный уровень противника
     * @param {number} options.maxLevel - Максимальный уровень противника
     */
    async function smurfInit(options = {}) {
      try {
        const { mode = "patrol", minLevel = 8, maxLevel = 12 } = options;
        
        console.log(`[Smurf] Initializing in mode: ${mode}`);
        
        // Проверяем выбранный режим
        switch (mode.toLowerCase()) {
          case "patrol":
            // Запускаем патрулирование
            await patrolMode(60);
            break;
            
          case "metro":
            // Работаем в метро
            await metroWorkMode(8);
            break;
            
          case "farm":
            // Фармим противников
            await farm(minLevel, maxLevel, "npc");
            break;
            
          default:
            console.log(`[Smurf] Unknown mode: ${mode}`);
            break;
        }
      } catch (error) {
        console.error("Error in smurf initialization:", error);
      }
    }
    
    /**
     * Играть в гадалку у цыганки
     */
    async function playGypsy() {
      try {
        console.log("[Gypsy] Trying to play fortune telling");
        
        // Проверяем наличие бесплатной игры
        const response = await fetch("https://www.moswar.ru/gypsy/");
        const text = await response.text();
        
        if (!text.includes("Погадать бесплатно")) {
          console.log("[Gypsy] No free fortune telling available");
          return;
        }
        
        // Играем бесплатно
        await fetch("https://www.moswar.ru/gypsy/", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            "X-Requested-With": "XMLHttpRequest"
          },
          body: "action=gamefree&__ajax=1&return_url=%2Fgypsy%2F",
          credentials: "include"
        });
        
        console.log("[Gypsy] Played free fortune telling");
        updateStatus("🔮 Погадали у цыганки");
      } catch (error) {
        console.error("Error playing gypsy:", error);
      }
    }
    
    /**
     * Записаться на Сити-FM (для получения бонусов)
     */
    async function signUpForSiri() {
      try {
        console.log("[Siri] Signing up for Siti-FM");
        
        // Проверяем возможность записи
        const response = await fetch("https://www.moswar.ru/radio/");
        const text = await response.text();
        const doc = parseHtml(text);
        
        // Проверяем, есть ли кнопка записи
        const signupButton = doc.querySelector("button[onclick*='signupRadio']");
        if (!signupButton) {
          console.log("[Siri] Cannot sign up for Siti-FM");
          return;
        }
        
        // Записываемся
        await fetch("https://www.moswar.ru/radio/", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            "X-Requested-With": "XMLHttpRequest"
          },
          body: "action=signupRadio&__ajax=1&return_url=%2Fradio%2F",
          credentials: "include"
        });
        
        console.log("[Siri] Signed up for Siti-FM");
        updateStatus("📻 Вы записались на Сити-FM");
      } catch (error) {
        console.error("Error signing up for Siri:", error);
      }
    }
    
    /**
     * Обменять все токены на Сити-FM
     */
    async function tradeAllSiri() {
      try {
        console.log("[Siri] Trading all tokens");
        
        // Получаем страницу Сити-FM
        const response = await fetch("https://www.moswar.ru/radio/");
        const text = await response.text();
        const doc = parseHtml(text);
        
        // Проверяем наличие токенов
        const tokensElement = doc.querySelector(".radio-tokens-block .tugriki");
        if (!tokensElement) {
          console.log("[Siri] No tokens found");
          return;
        }
        
        // Получаем количество токенов
        const tokens = parseInt(tokensElement.innerText.replace(/,/g, ""), 10);
        if (isNaN(tokens) || tokens <= 0) {
          console.log("[Siri] No tokens to trade");
          return;
        }
        
        console.log(`[Siri] Trading ${tokens} tokens`);
        
        // Обмениваем токены
        await fetch("https://www.moswar.ru/radio/", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            "X-Requested-With": "XMLHttpRequest"
          },
          body: "action=announceRadio&__ajax=1&return_url=%2Fradio%2F",
          credentials: "include"
        });
        
        console.log("[Siri] Tokens traded successfully");
        updateStatus(`📻 Обменяно ${tokens} токенов Сити-FM`);
      } catch (error) {
        console.error("Error trading Siri tokens:", error);
      }
    }
    
    /**
     * Ускорение в подземке
     */
    async function dungeonSpeedUp() {
      try {
        console.log("[Dungeon] Checking dungeon status");
        
        // Проверяем статус подземки
        const response = await fetch("https://www.moswar.ru/dungeon/");
        const text = await response.text();
        const doc = parseHtml(text);
        
        // Проверяем, идет ли сейчас подземка
        const dungeonInProgress = doc.querySelector(".dungeon-status .active");
        if (!dungeonInProgress) {
          console.log("[Dungeon] No active dungeon");
          return;
        }
        
        // Проверяем, есть ли кнопка ускорения
        const speedUpButton = doc.querySelector("button[onclick*='speedupdungeon']");
        if (!speedUpButton) {
          console.log("[Dungeon] Speed up not available");
          return;
        }
        
        console.log("[Dungeon] Speed up available, using it");
        
        // Используем ускорение
        await fetch("https://www.moswar.ru/dungeon/", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            "X-Requested-With": "XMLHttpRequest"
          },
          body: "action=speedupdungeon&__ajax=1&return_url=%2Fdungeon%2F",
          credentials: "include"
        });
        
        console.log("[Dungeon] Speed up used successfully");
        updateStatus("🏔️ Использовано ускорение в подземке");
      } catch (error) {
        console.error("Error in dungeon speed up:", error);
      }
    }
    
    /**
     * Ускорение на Поле Чудес
     */
    async function kubovichSpeedUp() {
      try {
        console.log("[Kubovich] Checking Pole Chudes status");
        
        // Проверяем статус Поля Чудес
        const response = await fetch("https://www.moswar.ru/casino/kubovich/");
        const text = await response.text();
        const doc = parseHtml(text);
        
        // Проверяем, доступно ли ускорение
        const speedUpButton = doc.querySelector("input[name='action'][value='speedup']");
        if (!speedUpButton) {
          console.log("[Kubovich] Speed up not available");
          return;
        }
        
        console.log("[Kubovich] Speed up available, using it");
        
        // Используем ускорение
        await fetch("https://www.moswar.ru/casino/kubovich/", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            "X-Requested-With": "XMLHttpRequest"
          },
          body: "action=speedup&__ajax=1&return_url=%2Fcasino%2Fkubovich%2F",
          credentials: "include"
        });
        
        console.log("[Kubovich] Speed up used successfully");
        updateStatus("🎡 Использовано ускорение на Поле Чудес");
      } catch (error) {
        console.error("Error in Kubovich speed up:", error);
      }
    }
    
    /**
     * Пропуск боя с Нефть Ленином
     */
    async function neftLeninSkipFight() {
      try {
        console.log("[Neft Lenin] Checking boss fight status");
        
        // Проверяем статус боя с боссом
        const response = await fetch("https://www.moswar.ru/neftlenin/");
        const text = await response.text();
        const doc = parseHtml(text);
        
        // Проверяем, доступен ли пропуск боя
        const skipButton = doc.querySelector("button[onclick*='skipfight']");
        if (!skipButton) {
          console.log("[Neft Lenin] Skip fight not available");
          return;
        }
        
        console.log("[Neft Lenin] Skip fight available, using it");
        
        // Пропускаем бой
        await fetch("https://www.moswar.ru/neftlenin/", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            "X-Requested-With": "XMLHttpRequest"
          },
          body: "action=skipfight&__ajax=1&return_url=%2Fneftlenin%2F",
          credentials: "include"
        });
        
        console.log("[Neft Lenin] Fight skipped successfully");
        updateStatus("🛢️ Пропущен бой с Нефть Ленином");
      } catch (error) {
        console.error("Error in Neft Lenin skip fight:", error);
      }
    }
    
    /**
     * Проверка деталей бронежилета
     */
    async function checkBronikPieces() {
      try {
        console.log("[Bronik] Checking armor pieces");
        
        // Получаем страницу профиля
        const response = await fetch("https://www.moswar.ru/player/");
        const text = await response.text();
        const doc = parseHtml(text);
        
        // Поиск частей бронежилета в инвентаре
        const armorPieces = [];
        const inventoryItems = doc.querySelectorAll(".inventory .object");
        
        // Проверяем каждый предмет в инвентаре
        for (const item of inventoryItems) {
          const titleElement = item.querySelector(".name");
          if (!titleElement) continue;
          
          const itemTitle = titleElement.innerText.trim();
          
          // Проверяем, является ли предмет частью бронежилета
          if (itemTitle.includes("Деталь бронежилета")) {
            const idElement = item.querySelector("img[data-st]");
            if (!idElement) continue;
            
            const dataSt = idElement.getAttribute("data-st");
            const dataId = idElement.getAttribute("data-id");
            
            armorPieces.push({
              title: itemTitle,
              dataSt,
              dataId
            });
          }
        }
        
        console.log(`[Bronik] Found ${armorPieces.length} armor pieces`);
        
        if (armorPieces.length > 0) {
          // Выводим найденные части
          for (const piece of armorPieces) {
            console.log(`[Bronik] - ${piece.title} (ID: ${piece.dataId})`);
          }
          
          updateStatus(`🛡️ Найдено ${armorPieces.length} дет. бронежилета`);
        }
        
        return armorPieces;
      } catch (error) {
        console.error("Error checking bronik pieces:", error);
        return [];
      }
    }
    
    /**
     * Буст клана
     */
    async function boostClan() {
      try {
        console.log("[Clan] Checking clan boost status");
        
        // Получаем страницу клана
        const response = await fetch("https://www.moswar.ru/clan/profile/");
        const text = await response.text();
        const doc = parseHtml(text);
        
        // Проверяем, есть ли кнопка буста
        const boostButton = doc.querySelector(".boost-available");
        if (!boostButton) {
          console.log("[Clan] Boost not available");
          return;
        }
        
        console.log("[Clan] Boost available, using it");
        
        // Используем буст
        await fetch("https://www.moswar.ru/clan/profile/", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            "X-Requested-With": "XMLHttpRequest"
          },
          body: "action=boost&__ajax=1&return_url=%2Fclan%2Fprofile%2F",
          credentials: "include"
        });
        
        console.log("[Clan] Boost used successfully");
        updateStatus("🏙️ Клан бустован");
      } catch (error) {
        console.error("Error in clan boost:", error);
      }
    }
    
    /**
     * Покупка фишек в казино
     * @param {number} amount - Количество фишек для покупки
     */
    async function buyCasinoTokens(amount = 5) {
      try {
        console.log(`[Casino] Buying ${amount} tokens`);
        
        // Покупаем фишки
        await fetch("https://www.moswar.ru/casino/", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            "X-Requested-With": "XMLHttpRequest"
          },
          body: `action=buy&count=${amount}&__ajax=1&return_url=%2Fcasino%2F`,
          credentials: "include"
        });
        
        console.log(`[Casino] Bought ${amount} tokens successfully`);
        updateStatus(`🎰 Куплено ${amount} фишек казино`);
      } catch (error) {
        console.error("Error buying casino tokens:", error);
      }
    }