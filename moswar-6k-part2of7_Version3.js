// MosWar 6k - Улучшенный скрипт для Московских Войн
// Часть 2/7

    
    /**
     * Получает текущее московское время
     * @returns {Date} Текущая дата/время в Москве
     */
    function getMoscowTime() {
      return new Date(
        new Date().toLocaleString("en-US", { timeZone: "Europe/Moscow" })
      );
    }
    
    /**
     * Режим работы в Шаурбургерсе
     * @param {number} t - Длительность работы в часах (1-8)
     */
    async function workMode(t = 1) {
      try {
        async function startWork() {
          // Проверяем, нет ли ошибки (уже работаем)
          const errorMessage = await f(
            "#workForm > div.time > span.error",
            "https://www.moswar.ru/shaurburgers/"
          );
          
          if (errorMessage) {
            console.log(`[Work] Already working: ${errorMessage.innerText}`);
            return false;
          }

          // Начинаем работу
          await fetch("https://www.moswar.ru/shaurburgers/", {
            headers: {
              accept: "*/*",
              "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
              "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
              "sec-fetch-dest": "empty",
              "sec-fetch-mode": "cors",
              "sec-fetch-site": "same-origin",
              "x-requested-with": "XMLHttpRequest",
            },
            referrer: "https://www.moswar.ru/shaurburgers/",
            referrerPolicy: "strict-origin-when-cross-origin",
            body: `action=work&time=${t}&__ajax=1&return_url=%2Fshaurburgers%2F`,
            method: "POST",
            mode: "cors",
            credentials: "include",
          });
          
          console.log(`[Work] Started working for ${t} hour(s)`);
          return true;
        }
        
        await startWork(t);
        
        // Устанавливаем интервал для автоматического перезапуска работы
        const intervalMinutes = t * 60 + 0.5; // Добавляем 0.5 минуты для перекрытия
        console.log(`[Work] Will restart work in ${intervalMinutes} minutes`);
        
        setTimeout(async () => workMode(t), intervalMinutes * 60 * 1000);
      } catch (error) {
        console.error("Error in work mode:", error);
        setTimeout(async () => workMode(t), 5 * 60 * 1000); // Retry after 5 minutes on error
      }
    }
    
    /**
     * Режим патрулирования
     * @param {number} t - Длительность патрулирования в минутах
     */
    async function patrolMode(t = 10) {
      try {
        let form = $(await f("form#patrolForm", "https://www.moswar.ru/alley/"));
        
        // Проверяем, достигнут ли дневной лимит патрулирования
        if (
          form.find(".timeleft").text() ===
          "На сегодня Вы уже истратили все время патруля."
        ) {
          // Вычисляем время до полуночи по МСК
          let msToMidnight = getMoscowTime().setHours(24, 1, 0, 0) - getMoscowTime();
          let secondsToMidnight = Math.floor(msToMidnight / 1000);
          
          console.log(`⏰ Patrol is over for today. Retrying in ${formatTime(secondsToMidnight)}`);
          setTimeout(async () => await patrolMode(t), msToMidnight);
          return;
        }
        
        // Проверяем, есть ли таймер кулдауна
        let cooldownTimer = form?.find("td.value")?.attr("timer");
        if (cooldownTimer) {
          console.log(`⏱️❄️ Patrol cooldown. Retry in ${formatTime(cooldownTimer)}.`);
          setTimeout(async () => await patrolMode(t), (+cooldownTimer + 3) * 1000);
          return;
        }
        
        console.log(`[🚔] Starting patrol mode (${t} minutes).`);
        await startPatrol(t);
        
        // Устанавливаем следующий запуск патруля
        setTimeout(() => patrolMode(t), t * 60 * 1000 + 3000);
      } catch (error) {
        console.error("Could not start patrol mode:", error);
        // Пробуем еще раз через 5 минут в случае ошибки
        setTimeout(() => patrolMode(t), 5 * 60 * 1000);
      }
    }
    
    /**
     * Запускает патрулирование
     * @param {number} minutes - Длительность патрулирования в минутах
     * @param {number} region - ID региона для патрулирования (1 = центр, 2 = окраины и т.д.)
     */
    async function startPatrol(minutes = 10, region = 1) {
      try {
        // Запускаем патрулирование
        await fetch("https://www.moswar.ru/alley/", {
          headers: {
            accept: "*/*",
            "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
            "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "x-requested-with": "XMLHttpRequest",
          },
          referrer: "https://www.moswar.ru/alley/",
          referrerPolicy: "strict-origin-when-cross-origin",
          body: `action=patrol&region=${region}&time=${minutes}&__ajax=1&return_url=%2Falley%2F`,
          method: "POST",
          mode: "cors",
          credentials: "include",
        });
        
        // Также посещаем пустыню для сбора ресурсов
        await fetch("https://www.moswar.ru/desert/");
        await fetch("https://www.moswar.ru/desert/rob/");
        
        updateStatus(`🚔 Патрулирование запущено на ${minutes} мин.`);
      } catch (error) {
        console.error("Error starting patrol:", error);
        updateStatus("❌ Ошибка при запуске патрулирования", true);
      }
    }
    
    /**
     * Смотреть патриотическое ТВ (получение бонусов)
     */
    async function watchTv() {
      try {
        await fetch("https://www.moswar.ru/alley/", {
          headers: {
            accept: "*/*",
            "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
            "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "x-requested-with": "XMLHttpRequest",
          },
          referrer: "https://www.moswar.ru/alley/",
          referrerPolicy: "strict-origin-when-cross-origin",
          body: "action=patriottv&time=1&__ajax=1&return_url=%2Falley%2F",
          method: "POST",
          mode: "cors",
          credentials: "include",
        });
        
        updateStatus("📺 Вы посмотрели патриотическое ТВ");
      } catch (error) {
        console.error("Error watching TV:", error);
        updateStatus("❌ Ошибка при просмотре ТВ", true);
      }
    }
    
    /**
     * Проверяет, идет ли сейчас групповой бой
     * @returns {Promise<boolean>} true если идет групповой бой
     */
    async function aIsGroupFight() {
      try {
        let currentUrl = AngryAjax.getCurrentUrl();
        return /^\/fight\/\d+\/?$/.test(currentUrl);
      } catch (error) {
        console.error("Error checking if group fight:", error);
        return false;
      }
    }
    
    /**
     * Обрабатывает бой для смурфа (альт-аккаунта)
     */
    async function handleSmurfFight() {
      try {
        await restoreHP();
        
        await attackByCriteria({
          criteria: "type",
          minLvl: +player.level + 4,
          maxLvl: +player.level + 6,
        });
        
        let cooldown = await getAlleyCooldown();
        console.log("[SMURF] Attack again in ", cooldown);
        
        setTimeout(async () => await handleSmurfFight(), 1000 * 60 * (cooldown + 3));
      } catch (error) {
        console.error("Error handling smurf fight:", error);
        setTimeout(async () => await handleSmurfFight(), 5 * 60 * 1000);
      }
    }
    
    /**
     * Проверяет, есть ли блокировка или ожидание боя
     * @param {Function} callback - Функция, которую нужно вызвать при отсутствии блокировок
     * @param {number} delay - Задержка перед повторной проверкой в секундах
     * @param  {...any} args - Аргументы для callback функции
     * @returns {boolean} true если есть блокировка или ожидание
     */
    async function checkBubble(callback, delay = 0, ...args) {
      try {
        const bubbleElement = document.querySelector(
          "#personal > a.bubble > span > span.string"
        );
        
        // Если нет пузыря, все в порядке
        if (!bubbleElement) return false;
        
        const bubbleText = bubbleElement.querySelector("span.text").innerText;
        
        // Проверяем на задержание за бои
        if (bubbleText === "Задержан за бои") {
          console.log("Задержан за бои. Налаживаю связи...");
          await fetch("https://www.moswar.ru/police/relations/");
          AngryAjax.goToUrl("/alley/");
          return true;
        } 
        // Проверяем на ожидание боя
        else if (bubbleText === "Ожидание боя") {
          try {
            const timerElement = bubbleElement.querySelector("span.timeleft");
            if (!timerElement) {
              console.log("Waiting for fight. Time unknown... skipping...");
              return true;
            }
            
            const waitTime = +timerElement.getAttribute("timer");
            console.log(bubbleText, `\nПробую заново через: `, waitTime);
            
            setTimeout(() => callback(...args), (waitTime + delay) * 1000);
            return true;
          } catch (err) {
            console.log(`Waiting for fight. Time unknown... skipping...`, err);
            return true;
          }
        }
      } catch (error) {
        console.log(`[✅] All checks passed.`);
        return false;
      }
    }
    
    /**
     * Проверяет возможность атаки и откладывает атаку при необходимости
     * @param {Function} attackFunction - Функция для атаки
     * @param {number} delay - Задержка в секундах
     * @param {Object} options - Параметры для функции атаки
     * @returns {boolean} true если атака отложена
     */
    async function attackOrReschedule(attackFunction, delay = 0, options = {}) {
      try {
        // Проверяем, не идет ли групповой бой
        if (await aIsGroupFight()) {
          console.log("🚨 Идет групповой бой, пробую заново");
          
          setTimeout(() => {
            AngryAjax.goToUrl("/alley/"); 
            attackFunction(options);
          }, (60 + delay) * 1000);
          
          return true;
        }
        
        // Проверяем, нет ли кулдауна в закоулках
        const cooldown = await getAlleyCooldown();
        if (cooldown) {
          console.log(`⏱️ Кулдаун в закоулках. Пробую через ${cooldown} сек.`);
          
          setTimeout(() => attackFunction(options), (cooldown + delay) * 1000);
          return true;
        }
        
        return false;  // Атака возможна сейчас
      } catch (error) {
        console.error("Error in attackOrReschedule:", error);
        return true; // Предотвращаем дальнейшие действия при ошибке
      }
    }
    
    /**
     * Получает время кулдауна в закоулках
     * @returns {Promise<number>} Кулдаун в секундах или 0, если кулдауна нет
     */
    async function getAlleyCooldown() {
      try {
        const page = await fetch("https://www.moswar.ru/alley/").then((r) =>
          r.text()
        );
        
        // Проверяем, есть ли сообщение о кулдауне
        const cooldownMatch = page.match(/Вы сможете подраться через (\d+) сек/);
        if (cooldownMatch) {
          return +cooldownMatch[1];
        }
        
        const hoursCooldownMatch = page.match(
          /Вы сможете подраться через (\d+) час/
        );
        if (hoursCooldownMatch) {
          return +hoursCooldownMatch[1] * 60 * 60;
        }
        
        const minutesCooldownMatch = page.match(
          /Вы сможете подраться через (\d+) мин/
        );
        if (minutesCooldownMatch) {
          return +minutesCooldownMatch[1] * 60;
        }
        
        return 0; // Нет кулдауна
      } catch (error) {
        console.error("Error getting alley cooldown:", error);
        return 60; // Возвращаем 60 секунд по умолчанию при ошибке
      }
    }
    
    /**
     * Режим работы в метро
     * @param {number} hours - Количество часов работы
     */
    async function metroWorkMode(hours = 1) {
      try {
        async function startMetroWork() {
          // Проверяем, уже работаем или нет
          const alreadyWorking = document.querySelector("#personal .metro .timer");
          if (alreadyWorking) {
            console.log("[Metro] Already working");
            return false;
          }
    
          await fetch("https://www.moswar.ru/metro/", {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
              "X-Requested-With": "XMLHttpRequest",
            },
            body: `action=work&time=${hours}&__ajax=1&return_url=%2Fmetro%2F`,
            credentials: "include",
          });
          
          console.log(`[Metro] Started working for ${hours} hour(s)`);
          return true;
        }
    
        await startMetroWork();
        
        // Устанавливаем следующий запуск работы
        const intervalMinutes = hours * 60 + 1;
        setTimeout(async () => metroWorkMode(hours), intervalMinutes * 60 * 1000);
      } catch (error) {
        console.error("Error in metro work mode:", error);
        setTimeout(async () => metroWorkMode(hours), 5 * 60 * 1000);
      }
    }
    
    /**
     * Режим Зодиака (автоматическая игра)
     */
    async function zodiacMode() {
      try {
        // Получаем текущий день недели (0 = воскресенье, 6 = суббота)
        const dayOfWeek = new Date().getDay();
        
        // Определяем ссылку на игру в зависимости от дня недели
        let gameUrl = "";
        switch (dayOfWeek) {
          case 1: // Понедельник - Таро
            gameUrl = "https://www.moswar.ru/nightclub/taro/";
            break;
          case 3: // Среда - Лохотрон
            gameUrl = "https://www.moswar.ru/nightclub/roulette/";
            break;
          case 5: // Пятница - Зодиак
            gameUrl = "https://www.moswar.ru/nightclub/zodiak/";
            break;
          default:
            console.log(`[Zodiac] No game today (day ${dayOfWeek})`);
            // Пробуем на следующий день
            const hoursToNextDay = 24 - new Date().getHours();
            setTimeout(zodiacMode, hoursToNextDay * 60 * 60 * 1000);
            return;
        }
        
        // Открываем страницу с игрой
        const gamePageResponse = await fetch(gameUrl);
        const gamePageText = await gamePageResponse.text();
        
        // Проверяем наличие признаков бесплатной игры
        if (gamePageText.includes("Сыграть бесплатно")) {
          console.log("[Zodiac] Free game available, playing...");
          
          await fetch(gameUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
              "X-Requested-With": "XMLHttpRequest",
            },
            body: "action=play&free=1&__ajax=1",
            credentials: "include",
          });
          
          updateStatus("🎮 Сыграна бесплатная игра зодиака");
        } else {
          console.log("[Zodiac] No free games available");
        }
        
        // Пробуем снова через час
        setTimeout(zodiacMode, 60 * 60 * 1000);
      } catch (error) {
        console.error("Error in zodiac mode:", error);
        // Пробуем еще раз через 10 минут в случае ошибки
        setTimeout(zodiacMode, 10 * 60 * 1000);
      }
    }
    
    /**
     * Режим трекера крысы
     * @param {number} rat - ID крысы
     */
    async function trackRatMode(rat = 7541456) {
      try {
        await trackAndAttackRat(rat);
        // Проверяем снова через 10 минут
        setTimeout(() => trackRatMode(rat), 10 * 60 * 1000);
      } catch (error) {
        console.error("Error in track rat mode:", error);
        // Пробуем еще раз через 5 минут в случае ошибки
        setTimeout(() => trackRatMode(rat), 5 * 60 * 1000);
      }
    }
    
    /**
     * Отслеживает и атакует крысу
     * @param {number} rat - ID крысы
     */
    async function trackAndAttackRat(rat = 7541456) {
      try {
        console.log(`[🐭] Отслеживание крысы #${rat}...`);
        
        // Проверяем профиль крысы
        const profileUrl = `https://www.moswar.ru/player/${rat}/`;
        const profileResponse = await fetch(profileUrl);
        const profileText = await profileResponse.text();
        
        // Проверяем, онлайн ли крыса
        if (profileText.includes("онлайн")) {
          console.log(`[🐭] Крыса #${rat} онлайн!`);
          
          // Проверяем здоровье
          await restoreHP();
          
          // Атакуем крысу
          await attackPlayer(rat);
          
          updateStatus(`🐭 Атакована крыса #${rat}`);
        } else {
          console.log(`[🐭] Крыса #${rat} не в сети`);
        }
      } catch (error) {
        console.error(`Error tracking rat ${rat}:`, error);
      }
    }
    
    /**
     * Режим работы с автомобилями
     * @param {string} mode - Режим работы (sport/comfort/family/business)
     */
    async function carBringupMode(mode = "comfort") {
      try {
        await carBringup(mode);
        // Проверяем снова через 6 часов
        setTimeout(() => carBringupMode(mode), 6 * 60 * 60 * 1000);
      } catch (error) {
        console.error("Error in car bringup mode:", error);
        // Пробуем еще раз через 30 минут в случае ошибки
        setTimeout(() => carBringupMode(mode), 30 * 60 * 1000);
      }
    }
    
    /**
     * Прокачка автомобиля
     * @param {string} mode - Тип прокачки (sport/comfort/family/business)
     */
    async function carBringup(mode = "comfort") {
      try {
        console.log(`[🚗] Прокачка автомобиля (режим: ${mode})...`);
        
        // Список идентификаторов машин для проверки
        const carsToCheck = await getCarsIds();
        
        for (const carId of carsToCheck) {
          // Проверяем, можно ли прокачать данную машину
          const canUpgrade = await checkCarUpgrade(carId, mode);
          
          if (canUpgrade) {
            // Выполняем прокачку
            await upgradeCarProperty(carId, mode);
            updateStatus(`🚗 Прокачана машина ${carId} (${mode})`);
            
            // Прокачиваем только одну машину за раз
            break;
          }
        }
      } catch (error) {
        console.error("Error in car bringup:", error);
      }
    }
    
    /**
     * Получает список ID всех автомобилей игрока
     * @returns {Promise<string[]>} Массив ID автомобилей
     */
    async function getCarsIds() {
      try {
        const garage = await f("#home-garage > div > div > a", "https://www.moswar.ru/home/");
        
        if (!garage) {
          console.error("Could not find cars in garage");
          return [];
        }
        
        return garage.map(car => car.getAttribute("href").split("/").splice(-2, 1)[0]);
      } catch (error) {
        console.error("Error getting cars IDs:", error);
        return [];
      }
    }
    
    /**
     * Проверяет возможность прокачки автомобиля
     * @param {string} carId - ID автомобиля
     * @param {string} property - Свойство для прокачки
     * @returns {Promise<boolean>} true если прокачка возможна
     */
    async function checkCarUpgrade(carId, property) {
      try {
        // Получаем страницу с информацией о машине
        const carInfoUrl = `https://www.moswar.ru/automobile/${carId}/`;
        const carInfoResponse = await fetch(carInfoUrl);
        const carInfoText = await carInfoResponse.text();
        
        // Проверяем наличие кнопки прокачки для выбранного свойства
        const propertyRegex = new RegExp(`bringup_${property}`, 'i');
        return propertyRegex.test(carInfoText);
      } catch (error) {
        console.error(`Error checking car upgrade for ${carId}:`, error);
        return false;
      }
    }
    
    /**
     * Выполняет прокачку свойства автомобиля
     * @param {string} carId - ID автомобиля
     * @param {string} property - Свойство для прокачки
     * @returns {Promise<boolean>} true если прокачка успешна
     */
    async function upgradeCarProperty(carId, property) {
      try {
        const response = await fetch("https://www.moswar.ru/automobile/bringup/", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            "X-Requested-With": "XMLHttpRequest",
          },
          body: `car=${carId}&type=${property}&__ajax=1&return_url=%2Fautomobile%2F${carId}%2F`,
          credentials: "include",
        });
        
        const result = await response.json();
        
        if (result.success) {
          console.log(`[🚗] Успешно прокачано свойство ${property} автомобиля ${carId}`);
          return true;
        } else {
          console.log(`[🚗] Не удалось прокачать свойство ${property} автомобиля ${carId}: ${result.error || "неизвестная ошибка"}`);
          return false;
        }
      } catch (error) {
        console.error(`Error upgrading car property ${property} for ${carId}:`, error);
        return false;
      }
    }

    /**
     * Проверяет уровень здоровья и травмы персонажа
     * @returns {Promise<{ health: number, maxHealth: number, injury: number }>} Информация о здоровье
     */
    async function checkInjury() {
      try {
        const response = await fetch("https://www.moswar.ru/player/");
        const text = await response.text();
        const doc = parseHtml(text);
        
        // Получаем текущее и максимальное здоровье
        const healthBar = doc.querySelector("#personal .bar");
        if (!healthBar) {
          throw new Error("Could not find health bar");
        }
        
        const healthText = healthBar.getAttribute("title");
        const healthMatch = healthText.match(/(\d+)\/(\d+)/);
        
        if (!healthMatch) {
          throw new Error(`Could not parse health from: ${healthText}`);
        }
        
        const health = parseInt(healthMatch[1], 10);
        const maxHealth = parseInt(healthMatch[2], 10);
        
        // Проверяем наличие травмы
        const injuryElement = doc.querySelector("#personal .injury span");
        const injury = injuryElement ? parseInt(injuryElement.innerText.match(/\d+/)[0], 10) : 0;
        
        return { health, maxHealth, injury };
      } catch (error) {
        console.error("Error checking injury:", error);
        return { health: 0, maxHealth: 0, injury: 0 };
      }
    }
    
    /**
     * Съесть Сникерс для восстановления здоровья
     */
    async function eatSnickers() {
      try {
        const snickersList = [];
        
        // Проверяем все типы сникерсов
        for (const snickerTypeIds of [tt.kukuruza, tt.pryaniki, tt.pasta, tt.caramels]) {
          for (const snickerId of snickerTypeIds) {
            snickersList.push(snickerId);
          }
        }
        
        // Сначала пробуем использовать таблетки
        await useDopings(tt.pillsHealth);
        await useDopings(tt.vitaminsHealth);
        
        // Затем различные сникерсы
        await useDopings(snickersList);
        
        updateStatus("🍫 Съеден Сникерс");
      } catch (error) {
        console.error("Error eating snickers:", error);
      }
    }
    
    /**
     * Проверяет здоровье и восстанавливает при необходимости
     */
    async function checkAndRestoreHealth() {
      try {
        const healthInfo = await checkInjury();
        
        // Если здоровье ниже 70% или есть травма, восстанавливаем
        if (healthInfo.health < healthInfo.maxHealth * 0.7 || healthInfo.injury > 0) {
          console.log(`[Health] Current: ${healthInfo.health}/${healthInfo.maxHealth}, Injury: ${healthInfo.injury}`);
          
          // Сначала восстанавливаем здоровье
          await restoreHP();
          
          // Если здоровье всё ещё низкое, используем Сникерс
          const updatedHealth = await checkInjury();
          if (updatedHealth.health < updatedHealth.maxHealth * 0.9) {
            await eatSnickers();
          }
        }
      } catch (error) {
        console.error("Error checking and restoring health:", error);
      }
    }
    
    /**
     * Ожидание кулдауна перед действием
     * @param {number} timestamp - Временная метка Unix, до которой нужно ждать
     * @param {Function} callback - Функция для вызова после кулдауна
     */
    async function waitForCooldown(timestamp, callback) {
      try {
        const now = Math.floor(Date.now() / 1000);
        const timeLeft = timestamp - now;
        
        if (timeLeft <= 0) {
          // Кулдаун уже закончился, вызываем функцию
          callback();
          return;
        }
        
        console.log(`[⏱️] Ожидание кулдауна: ${formatTime(timeLeft)}`);
        setTimeout(callback, timeLeft * 1000);
      } catch (error) {
        console.error("Error in waitForCooldown:", error);
        // Вызываем callback через минуту в случае ошибки
        setTimeout(callback, 60 * 1000);
      }
    }
    
    /**
     * Режим фарма гопников
     * @param {number} minLevel - Минимальный уровень
     * @param {number} maxLevel - Максимальный уровень
     * @param {string} type - Тип противника ('npc', 'player' или 'any')
     */
    async function farm(minLevel = 8, maxLevel = 9, type = "any") {
      try {
        if (await attackOrReschedule(farm, 0, { minLevel, maxLevel, type })) {
          return;
        }
        
        // Восстанавливаем здоровье перед боем
        await checkAndRestoreHealth();
        
        // Атакуем по критериям
        await attackByCriteria({
          minLvl: minLevel,
          maxLvl: maxLevel,
          criteria: type,
        });
        
        // Определяем время до следующего фарма
        const cooldown = await getAlleyCooldown();
        const waitTime = cooldown > 0 ? cooldown + 5 : 60;
        
        console.log(`[Farm] Next attack in ${waitTime} seconds`);
        setTimeout(() => farm(minLevel, maxLevel, type), waitTime * 1000);
      } catch (error) {
        console.error("Error in farm mode:", error);
        // Пробуем еще раз через 5 минут в случае ошибки
        setTimeout(() => farm(minLevel, maxLevel, type), 5 * 60 * 1000);
      }
    }
    
    /**
     * Фарм врагов из списка
     * @param {Array<string>} targets - Список ID целей
     */
    async function farmEnemies(targets = []) {
      try {
        if (await attackOrReschedule(farmEnemies, 0, { targets })) {
          return;
        }
        
        if (!targets.length) {
          console.log("[Farm] No enemies in list");
          return;
        }
        
        // Восстанавливаем здоровье
        await checkAndRestoreHealth();
        
        // Выбираем случайную цель из списка
        const randomIndex = Math.floor(Math.random() * targets.length);
        const targetId = targets[randomIndex];
        
        console.log(`[Farm] Attacking enemy: ${targetId}`);
        await attackPlayer(targetId);
        
        // Определяем время до следующего фарма
        const cooldown = await getAlleyCooldown();
        const waitTime = cooldown > 0 ? cooldown + 5 : 60;
        
        setTimeout(() => farmEnemies(targets), waitTime * 1000);
      } catch (error) {
        console.error("Error in farm enemies mode:", error);
        // Пробуем еще раз через 5 минут в случае ошибки
        setTimeout(() => farmEnemies(targets), 5 * 60 * 1000);
      }
    }
    
    /**
     * Фарм жертв из личного списка контактов
     */
    async function farmVictims() {
      try {
        if (await attackOrReschedule(farmVictims)) {
          return;
        }
        
        // Восстанавливаем здоровье
        await checkAndRestoreHealth();
        
        // Получаем список жертв из контактов
        const victims = await getVictimsList();
        
        if (!victims.length) {
          console.log("[Farm] No victims in contacts");
          setTimeout(farmVictims, 30 * 60 * 1000); // Проверяем снова через 30 минут
          return;
        }
        
        // Перебираем жертв и атакуем подходящую
        for (const victim of victims) {
          // Проверяем, подходит ли жертва для атаки
          const isWorthy = await checkVictimWorthy(victim.id);
          
          if (isWorthy) {
            console.log(`[Farm] Attacking victim: ${victim.name} (#${victim.id})`);
            await attackPlayer(victim.id);
            break;
          } else {
            console.log(`[Farm] Victim not worthy: ${victim.name} (#${victim.id})`);
          }
        }
        
        // Определяем время до следующего фарма
        const cooldown = await getAlleyCooldown();
        const waitTime = cooldown > 0 ? cooldown + 5 : 60;
        
        setTimeout(farmVictims, waitTime * 1000);
      } catch (error) {
        console.error("Error in farm victims mode:", error);
        // Пробуем еще раз через 5 минут в случае ошибки
        setTimeout(farmVictims, 5 * 60 * 1000);
      }
    }
    
    /**
     * Получает список жертв из контактов
     * @returns {Promise<Array<{id: string, name: string}>>} Список жертв
     */
    async function getVictimsList() {
      try {
        const response = await fetch("https://www.moswar.ru/phone/contacts/victims/");
        const text = await response.text();
        const doc = parseHtml(text);
        
        const victims = [];
        const victimRows = doc.querySelectorAll("table.phones tr");
        
        for (const row of victimRows) {
          const nameElement = row.querySelector("td.name a");
          if (!nameElement) continue;
          
          const name = nameElement.innerText.trim();
          const href = nameElement.getAttribute("href");
          const idMatch = href.match(/\/player\/(\d+)/);
          
          if (idMatch && idMatch[1]) {
            victims.push({ id: idMatch[1], name });
          }
        }
        
        return victims;
      } catch (error) {
        console.error("Error getting victims list:", error);
        return [];
      }
    }
    
    /**
     * Проверяет, стоит ли атаковать жертву
     * @param {string} victimId - ID потенциальной жертвы
     * @returns {Promise<boolean>} true если жертва подходит для атаки
     */
    async function checkVictimWorthy(victimId) {
      try {
        const response = await fetch(`https://www.moswar.ru/player/${victimId}/`);
        const text = await response.text();
        const doc = parseHtml(text);
        
        // Проверяем, онлайн ли игрок
        const isOnline = doc.querySelector(".profile-header .status.online") !== null;
        if (!isOnline) {
          // Если не онлайн, проверяем когда был последний вход
          const lastSeen = doc.querySelector(".profile-header .status");
          if (lastSeen) {
            const lastSeenText = lastSeen.innerText;
            // Если был в игре более 24 часов назад, не атакуем
            if (lastSeenText.includes("дней") || lastSeenText.includes("недел")) {
              return false;
            }
          }
        }
        
        // Проверяем уровень игрока (не атакуем слабых)
        const levelElement = doc.querySelector(".profile-header .level");
        if (levelElement) {
          const level = parseInt(levelElement.innerText.match(/\d+/)[0], 10);
          if (level < player.level * 0.7) {
            console.log(`[Victim] Too low level: ${level}`);
            return false;
          }
        }
        
        // Проверяем статус банды (не атакуем в большой банде)
        const gangElement = doc.querySelector(".profile-header .gang");
        if (gangElement && gangElement.innerText.trim() !== "") {
          console.log(`[Victim] Has gang: ${gangElement.innerText}`);
          return false;
        }
        
        // Можно добавить другие проверки
        
        return true;
      } catch (error) {
        console.error(`Error checking victim ${victimId}:`, error);
        return false;
      }
    }
    
    /**
     * Атака случайного игрока
     */
    async function attackRandom() {
      try {
        if (await attackOrReschedule(attackRandom)) {
          return;
        }
        
        // Восстанавливаем здоровье
        await checkAndRestoreHealth();
        
        // Открываем страницу закоулков для поиска противника
        const alleyResponse = await fetch("https://www.moswar.ru/alley/");
        const alleyText = await alleyResponse.text();
        const alleyDoc = parseHtml(alleyText);
        
        // Находим случайного противника для атаки
        const opponents = alleyDoc.querySelectorAll(".opponent");
        if (!opponents.length) {
          console.log("[Attack] No opponents found");
          setTimeout(attackRandom, 60 * 1000);
          return;
        }
        
        // Выбираем случайного противника
        const randomIndex = Math.floor(Math.random() * opponents.length);
        const opponent = opponents[randomIndex];
        
        // Находим кнопку атаки
        const attackButton = opponent.querySelector("a.button");
        if (!attackButton) {
          console.log("[Attack] No attack button found");
          setTimeout(attackRandom, 60 * 1000);
          return;
        }
        
        // Извлекаем ID противника из ссылки
        const href = attackButton.getAttribute("href");
        const idMatch = href.match(/\/player\/(\d+)/);
        
        if (idMatch && idMatch[1]) {
          const opponentId = idMatch[1];
          console.log(`[Attack] Attacking random opponent: ${opponentId}`);
          await attackPlayer(opponentId);
        }
        
        // Определяем время до следующей атаки
        const cooldown = await getAlleyCooldown();
        const waitTime = cooldown > 0 ? cooldown + 5 : 60;
        
        setTimeout(attackRandom, waitTime * 1000);
      } catch (error) {
        console.error("Error in attack random mode:", error);
        // Пробуем еще раз через 5 минут в случае ошибки
        setTimeout(attackRandom, 5 * 60 * 1000);
      }
    }