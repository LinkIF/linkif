// MosWar 6k - Улучшенный скрипт для Московских Войн
// Часть 1/7

(async function () {
    "use strict";
    
    // Добавляем глобальный обработчик ошибок
    window.addEventListener('error', function(event) {
        console.error(`[${new Date().toISOString()}] [LinkIF] Global error:`, event.error);
    });

    window.addEventListener('unhandledrejection', function(event) {
        console.error(`[${new Date().toISOString()}] [LinkIF] Unhandled rejection:`, event.reason);
    });

    // === СТИЛИ ДЛЯ ПАНЕЛИ ===
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
        
        /* Стили для панели управления логами */
        .logs-control-panel {
            background: rgba(0, 0, 0, 0.85);
            border-radius: 8px;
            padding: 8px;
            position: absolute;
            top: 10px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 100;
            width: 300px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            gap: 5px;
            color: #fff;
        }
        .logs-control-panel .header {
            color: #ffcc80;
            font-weight: bold;
            width: 100%;
            text-align: center;
            margin-bottom: 5px;
            font-size: 14px;
        }
        .log-toggle {
            background-color: rgba(255, 255, 255, 0.1);
            border: 1px solid;
            border-radius: 4px;
            padding: 3px 8px;
            font-size: 12px;
            cursor: pointer;
            user-select: none;
        }
        .log-toggle.active {
            background-color: rgba(255, 255, 255, 0.3);
        }
        
        /* Стили для блокировки кликов в бою */
        .fighter-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            z-index: 100;
            cursor: pointer;
            background-color: rgba(255,255,255,0);
        }
        .fighter-selected {
            box-shadow: inset 0 0 0 3px #ffcc80, 0 0 8px #ffcc80;
            background-color: rgba(255, 204, 128, 0.1);
            border-radius: 5px;
        }
        .fighter-checkbox {
            transform: scale(1.5);
            margin: 8px;
        }
    `;
    document.head.appendChild(style);

    /**
     * Обновляет статус на панели управления
     * @param {string} text - Текст для отображения
     * @param {boolean} isError - Является ли сообщение ошибкой
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
     * Показывает временное уведомление
     * @param {string} message - Текст уведомления
     */
    function showNotification(message) {
        try {
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
                font-size: 14px;
            `;
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.style.opacity = '0';
                notification.style.transition = 'opacity 0.5s';
                setTimeout(() => notification.remove(), 500);
            }, 2000);
        } catch (error) {
            console.error("Error showing notification:", error);
        }
    }

    /**
     * Сброс слота с комплектом
     * @param {number} slotIndex - Индекс слота (начиная с 0)
     */
    function resetSlot(slotIndex) {
        try {
            const raw = localStorage.getItem("moswar_saved_sets");
            if (!raw) return;

            const allSets = JSON.parse(raw);
            if (!Array.isArray(allSets) || !allSets[slotIndex]) return;

            allSets[slotIndex] = null;
            localStorage.setItem("moswar_saved_sets", JSON.stringify(allSets));

            drawSetSummary();
            updateSetIndicator();
            updateStatus(`Слот ${slotIndex + 1} очищен`);
        } catch (error) {
            console.error(`Error resetting slot ${slotIndex}:`, error);
            updateStatus(`Ошибка при сбросе слота ${slotIndex + 1}`, true);
        }
    }

    /**
     * Обновляет индикатор активного комплекта
     */
    function updateSetIndicator() {
        try {
            const indicator = document.getElementById('mw-active-set');
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

    var utils_ = (() => {
        var ft = Object.defineProperty;
        var Be = Object.getOwnPropertyDescriptor;
        var Oe = Object.getOwnPropertyNames;
        var Ne = Object.prototype.hasOwnProperty;
        var Re = (t, e) => {
            for (var n in e) ft(t, n, { get: e[n], enumerable: !0 });
        },
        Ee = (t, e, n, o) => {
            if ((e && typeof e == "object") || typeof e == "function")
                for (let r of Oe(e))
                    !Ne.call(t, r) &&
                    r !== n &&
                    ft(t, r, {
                        get: () => e[r],
                        enumerable: !(o = Be(e, r)) || o.enumerable,
                    });
            return t;
        };
        var He = (t) => Ee(ft({}, "__esModule", { value: !0 }), t);
        var Gn = {};
        Re(Gn, {
      BANNED_CARS: () => qt,
      DOPINGS_DATA_ST: () => tt,
      EXCEPTION_CARS: () => Y,
      EXCEPTION_PLANES_AND_BOATS_RIDES_IDS: () => ce,
      HEADERS: () => Vt,
      LEGACY_initGroupFightLogs: () => Fe,
      PLANES_AND_BOATS_RIDES_IDS: () => H,
      aIsGroupFight: () => Ct,
      attackByCriteria: () => N,
      attackOrReschedule: () => oe,
      attackPlayer: () => _t,
      attackRandom: () => sn,
      autoPilot: () => Hn,
      boostClan: () => Ot,
      buyCasinoTokens: () => Rn,
      carBringup: () => le,
      carBringupMode: () => B,
      chaoticFightMode: () => At,
      checkBronikPieces: () => gt,
      checkBubble: () => ne,
      checkCarFuel: () => checkCarFuel,    // Заменено Mt
      checkInjury: () => Tt,
      checkVictimWorthy: () => re,
      convertPlayerUrlToId: () => ht,
      createButton: () => k,
      createPopover: () => D,
      delay: () => I,
      drawSetSummary: () => drawSetSummary,  // Новая функция
      drawTimers: () => Kt,
      dungeonSpeedUp: () => zt,
      eatSilly: () => bt,
      eatSnickers: () => nt,
      farm: () => St,
      farmEnemies: () => et,
      farmVictims: () => vt,
      fightMode: () => $t,
      fillCarFuel: () => fillCarFuel,    // Заменено Pt
      filterLogs: () => Ge,
      formatNumber: () => Q,
      formatTime: () => v,
      fillAllCars: () => fillAllCars,    // Заменено nn
      gatherStats: () => Xe,
      getAlleyCooldown: () => E,
      getElementsOnThePage: () => f,
      getPlayerId: () => K,
      getTodayScore: () => ze,
      handleSmurfFight: () => R,
      handleUI: () => mt,
      heal: () => Ve,
      init: () => Dn,
      joinChaoticFight: () => kt,
      joinProt: () => Bt,
      kubovichSpeedUp: () => Dt,
      makeTurn: () => Ze,
      mapDataStToDataId: () => wt,
      metroWorkMode: () => J,
      neftLeninSkipFight: () => Gt,
      parseHtml: () => L,
      patrolMode: () => P,
      playGypsy: () => rt,
      player: () => Le,
      protMode: () => an,
      redrawMain: () => dt,
      renderCandyCountdown: () => ut,
      renderNavbar: () => Ht,
      renderPanel: () => Et,
      resetSlot: () => resetSlot,       // Добавлено
      restoreHP: () => j,
      saveSet: () => saveSet,           // Добавлено
      saveSetModal: () => saveSetModal, // Добавлено
      scrapeStat: () => Jt,
      sendCars: () => de,
      sendMessage: () => Qt,
      sendPlanesAndBoats: () => pe,
      sendRide: () => Lt,
      sendSet: () => sendSet,           // Добавлено
      setupLogsObserver: () => setupLogsObserver, // Добавлено
      shouldAttack: () => Je,
      showAlert: () => showAlert,       // Заменено
      showNotification: () => showNotification, // Добавлено
      signUpForSiri: () => ot,
      smurfInit: () => Me,
      sortGarage: () => initializeButtons,
      startPatrol: () => ee,
      strToHtml: () => A,
      takeDailyDose: () => Ke,
      timeToMs: () => De,
      trackAndAttackRat: () => ie,
      trackRatMode: () => C,
      tradeAllSiri: () => jt,
      undressItem: () => En,
      updateSetIndicator: () => updateSetIndicator, // Добавлено
      updateStatus: () => updateStatus,  // Заменено
      useDopings: () => yt,
      useItem: () => W,
      waitForCooldown: () => it,
      watchTv: () => We,
      workMode: () => U,
      zodiacMode: () => O,
    });
    var V = window.$;
    
    function De(t) {
      try {
        let e = t.split(":").map(Number),
          n = 0,
          o = 0,
          r = 0;
        return (
          e.length === 3
            ? ((n = e[0]), (o = e[1]), (r = e[2]))
            : e.length === 2
              ? ((o = e[0]), (r = e[1]))
              : e.length === 1 && (r = e[0]),
          (n * 3600 + o * 60 + r) * 1e3
        );
      } catch (error) {
        console.error("Error converting time to ms:", error);
        return 0;
      }
    }
    
    function v(t) {
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
    
    function Q(t) {
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
    
    function I(t = 1) {
      return new Promise((e) => setTimeout(e, t * 1e3));
    }
    
    async function f(t, e) {
      try {
        let o = await (await fetch(e)).text(),
          r = V(L(o));
        if (!r || !r.length) return;
        let a = r.find(t);
        return a.length ? (a.length === 1 ? a[0] : a.toArray()) : null;
      } catch (error) {
        console.error(`Error getting elements from ${e}: ${error.message}`);
        return null;
      }
    }
    
    function L(t) {
      try {
        let e = new DOMParser(),
          n = t.replace(/\\&quot;/g, '"').replace(/\\"/g, '"');
        return e.parseFromString(n, "text/html");
      } catch (error) {
        console.error("Error parsing HTML:", error);
        return document.implementation.createHTMLDocument("");
      }
    }

    /**
     * Отображает модальное окно с сообщением
     * @param {string} title - Заголовок сообщения
     * @param {string} message - Текст сообщения
     */
    function showAlert(title = "", message = "") {
        try {
            let notification = document.querySelector("#alert");
            if (notification) notification.remove();

            notification = document.createElement("div");
            notification.id = "alert";
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: rgba(0, 0, 0, 0.8);
                color: white;
                padding: 15px 20px;
                border-radius: 8px;
                z-index: 10000;
                max-width: 300px;
                box-shadow: 0 4px 8px rgba(0,0,0,0.2);
                font-family: Arial, sans-serif;
                transition: opacity 0.3s ease-in-out;
            `;

            const titleEl = document.createElement("div");
            titleEl.style.cssText = `
                font-weight: bold;
                margin-bottom: 5px;
                font-size: 16px;
            `;
            titleEl.textContent = title;

            const messageEl = document.createElement("div");
            messageEl.style.cssText = `
                font-size: 14px;
            `;
            messageEl.textContent = message;

            notification.appendChild(titleEl);
            notification.appendChild(messageEl);
            document.body.appendChild(notification);

            setTimeout(() => {
                notification.style.opacity = '0';
                setTimeout(() => notification.remove(), 300);
            }, 3000);
        } catch (error) {
            console.error("Error showing alert:", error);
        }
    }
    
    function ht(t) {
      try {
        let e = t.match(/\player\/(\d+)\//);
        return e ? e[1] : null;
      } catch (error) {
        console.error("Error converting player URL to ID:", error);
        return null;
      }
    }
    
    function K(t) {
      try {
        let e = t.querySelector(".fighter2 .user a").href;
        return ht(e);
      } catch (error) {
        console.log("\u{1F6A7} Could not find player id");
        return null;
      }
    }
    
    function Ge(t = window.document) {
      try {
        return [...t.querySelectorAll("tr")]
          .filter(
            (r) =>
              r.querySelector("td.actions div.c")?.innerText ===
              "\u0412 \u0441\u043F\u0438\u0441\u043E\u043A \u0436\u0435\u0440\u0442\u0432"
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
          .map((r) => ht(r));
      } catch (error) {
        console.error("Error filtering logs:", error);
        return [];
      }
    }
    
    async function ze() {
      try {
        const element = await f(".my .value b", "https://www.moswar.ru/rating/wins/");
        return element ? +element.innerText : 0;
      } catch (error) {
        console.error("Error getting today score:", error);
        return 0;
      }
    }
    
    function A(t) {
      try {
        let e = document.createElement("div");
        e.innerHTML = t.trim();
        return e.firstChild;
      } catch (error) {
        console.error("Error converting string to HTML:", error);
        return document.createElement("div");
      }
    }
    
    async function Jt(t) {
      try {
        let e = `#stats-accordion > dd:nth-child(2) > ul > li:nth-child(${t}) > div.label > span`;
        V(`${e}`).trigger("mouseenter"),
          await new Promise((w) => setTimeout(w, 250));
        let o = `#tooltip${t + 1}`,
          r = `${o} > h2`,
          a = V(r)[0]?.innerText;
        if (!a) return console.error(`Key not found for tooltip ${o}`), null;
        let s = `${o} > div > span:nth-child(1)`,
          c = V(s)[0]?.innerText || "",
          l = parseInt(c.split(":")[1].trim(), 10),
          p = `${o} > div > span:nth-child(3)`,
          d = V(p)[0]?.innerText || "",
          g = parseInt(d.split("+")[1].trim(), 10);
        return {
          [a]: {
            Персонаж: l || 0,
            ["\u0421\u0443\u043F\u0435\u0440" + a.toLowerCase()]: g || 0,
            Сумма: (l || 0) + (g || 0),
          },
        };
      } catch (error) {
        console.error(`Error scraping stat ${t}:`, error);
        return null;
      }
    }
    
    async function Xe() {
      try {
        let t = {
          Дата: new Date().toLocaleDateString("ru-RU").replace(/\./g, "/"),
        };
        for (let e = 1; e <= 7; e++) {
          let n = await Jt(e);
          n && Object.assign(t, n);
        }
        return t;
      } catch (error) {
        console.error("Error gathering stats:", error);
        return { Дата: new Date().toLocaleDateString("ru-RU").replace(/\./g, "/") };
      }
    }
    
    var tt = {
      heal: 51,
      pyani: 52,
      tvorog: 53,
      vitaminsHealth: 3397,
      pillsHealth: 3840,
      deMinerale: 3841,
      bomjori: 3381,
      kukuruza: [9904, 9905, 9906, 9907, 9908, 9909],
      pryaniki: [7375, 7376, 7377, 7378, 7379, 7380],
      pasta: [3551, 3552, 3553, 3554, 3555, 3556],
      caramels: [1209, 1210, 1211, 1212, 1213, 1214],
      cocktails: [2656, 2657, 2658, 2659, 2660, 2661],
      glupaya: 2872,
    };
    
    async function wt(t) {
      try {
        let e = Array.isArray(t) ? t : [t];
        return await Promise.all(
          e.map(async (o) =>
            (
              await f(`img[data-st="${o}"]`, "https://www.moswar.ru/player/")
            )?.getAttribute("data-id")
          )
        );
      } catch (error) {
        console.error("Error mapping data st to data id:", error);
        return [];
      }
    }
    
    async function yt(t) {
      try {
        let e = await wt(t);
        await Promise.all(e.map((n) => W(n)));
      } catch (error) {
        console.error("Error using dopings:", error);
      }
    }
    
    async function Ve() {
      try {
        await yt(tt.heal);
      } catch (error) {
        console.error("Error healing:", error);
      }
    }
    
    async function W(t = "2474213164") {
      try {
        let n = await (
            await fetch(`https://www.moswar.ru/player/json/use/${t}/`)
          ).text(),
          { inventory: o } = JSON.parse(n);
        return o;
      } catch (error) {
        console.error(`Error using item ${t}:`, error);
        return null;
      }
    }
    
    async function Ke(t = !0) {
      try {
        let {
            bomjori: e,
            kukuruza: n,
            pryaniki: o,
            pasta: r,
            caramels: a,
            pillsHealth: s,
            vitaminsHealth: c,
            glupaya: l,
          } = tt,
          p = [...n, ...a, ...o, ...r, s, c, e, t ? l : null].filter(Boolean);
        await Promise.all(p.map((d) => yt(d)));
      } catch (error) {
        console.error("Error taking daily dose:", error);
      }
    }
    
    async function j() {
      try {
        await fetch("https://www.moswar.ru/player/checkhp/", {
          headers: {
            accept: "*/*",
            "accept-language": "en-GB,en;q=0.9",
            "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "x-requested-with": "XMLHttpRequest",
          },
          referrerPolicy: "strict-origin-when-cross-origin",
          body: "action=restorehp",
          method: "POST",
          mode: "cors",
          credentials: "include",
        });
      } catch (error) {
        console.error("Error restoring HP:", error);
      }
    }
    
    async function bt() {
      try {
        let t = await wt(tt.glupaya);
        await W(t);
      } catch (error) {
        console.error("Error eating silly:", error);
      }
    }
    
    async function Yt(t, e = "victim") {
      try {
        fetch("https://www.moswar.ru/phone/contacts/add/", {
          headers: {
            accept: "*/*",
            "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
            "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
            "sec-ch-ua": '"Chromium";v="131", "Not_A Brand";v="24"',
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": '"macOS"',
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "x-requested-with": "XMLHttpRequest",
          },
          referrer: "https://www.moswar.ru/phone/contacts/add/",
          referrerPolicy: "strict-origin-when-cross-origin",
          body: `name=+${t}&clan=&info=&type=${e}&__ajax=1&return_url=%2Fphone%2Fcontacts%2Fadd%2F7178077%2F`,
          method: "POST",
          mode: "cors",
          credentials: "include",
        });
      } catch (error) {
        console.error(`Error adding contact ${t}:`, error);
      }
    }
    
    async function Zt(t, e) {
      try {
        console.log(`\u{1F525} Removing ${t} from contacts.`),
          await fetch("https://www.moswar.ru/phone/contacts/", {
            headers: {
              accept: "*/*",
              "accept-language": "en-GB,en;q=0.9",
              "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
              "sec-ch-ua": '"Chromium";v="131", "Not_A Brand";v="24"',
              "sec-ch-ua-mobile": "?0",
              "sec-ch-ua-platform": '"macOS"',
              "sec-fetch-dest": "empty",
              "sec-fetch-mode": "cors",
              "sec-fetch-site": "same-origin",
              "x-requested-with": "XMLHttpRequest",
            },
            referrer: "https://www.moswar.ru/phone/contacts/victims/",
            referrerPolicy: "strict-origin-when-cross-origin",
            body: `action=delete&id=${e}&nickname=+${t}&type=contact&__referrer=%2Fphone%2Fcontacts%2Fvictims%2F&return_url=%2Fphone%2Fcontacts%2Fvictims%2F`,
            method: "POST",
            mode: "cors",
            credentials: "include",
          });
      } catch (error) {
        console.error(`Error removing contact ${t}:`, error);
      }
    }
    
    async function Qt(t, e) {
      try {
        let n = (
          await f('input[name="post_key"]', "https://www.moswar.ru/phone/")
        ).value;
        await fetch("https://www.moswar.ru/phone/messages/send/", {
          headers: {
            accept: "*/*",
            "accept-language": "en-GB,en;q=0.9",
            "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
            "sec-ch-ua": '"Chromium";v="131", "Not_A Brand";v="24"',
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": '"macOS"',
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "x-requested-with": "XMLHttpRequest",
          },
          referrer: "https://www.moswar.ru/phone/messages/send/",
          referrerPolicy: "strict-origin-when-cross-origin",
          body: `maxTextSize=10000&post_key=${n}&name=${t}&text=${e}&__ajax=1&return_url=%2Fphone%2F`,
          method: "POST",
          mode: "cors",
          credentials: "include",
        });
        showAlert("Phone \u2705", `Message sent to ${t}`);
      } catch (error) {
        showAlert("Phone \u274C", "Could not send message");
        console.error("Error sending message:", error);
      }
    }

    /**
     * Функция для работы с модальным окном сохранения комплекта транспорта
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
            modal.style.cssText = 'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: #fff8e1; border: 2px solid #ffcc80; border-radius: 12px; padding: 20px; z-index: 9999; min-width: 300px;';

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
     * Сохраняет текущий набор транспорта
     * @param {number} slotNumber - Номер слота для сохранения (1-4)
     * @returns {number} Количество сохраненных машин
     */
    function saveSet(slotNumber = 1) {
        try {
            if (slotNumber < 1 || slotNumber > 4) {
                console.error("Invalid set slot:", slotNumber);
                return 0;
            }

            // Получаем выбранные машины
            const selectedCheckboxes = document.querySelectorAll('.cars-trip-choose input[type="checkbox"]:checked:not([disabled])');
            if (!selectedCheckboxes.length) {
                console.log("No cars selected");
                updateStatus("❌ Не выбраны машины", true);
                return 0;
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
     * @param {number} slotNumber - Номер слота с комплектом (1-4)
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
                    await checkCarFuel(car.carId);
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
     * Проверяет уровень топлива в автомобиле и заправляет при необходимости
     * @param {string} carId - ID автомобиля
     */
    async function checkCarFuel(carId = "979786") {
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
            const htmlDoc = L(jsonData.content);
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
                await fillCarFuel(carId);
            }
        } catch (error) {
            console.error(`Error checking car fuel ${carId}:`, error);
        }
    }

    /**
     * Заправляет автомобиль
     * @param {string} carId - ID автомобиля
     */
    async function fillCarFuel(carId = "1095154") {
        try {
            const response = await fetch("https://www.moswar.ru/automobile/fill/", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    "X-Requested-With": "XMLHttpRequest"
                },
                body: `car=${carId}&__ajax=1&return_url=%2Fautomobile%2F`
            });
            
            console.log(`[⛽] Car ${carId} refueled`);
            updateStatus(`⛽ Автомобиль ${carId} заправлен`);
            return true;
        } catch (error) {
            console.error(`Error filling car fuel ${carId}:`, error);
            updateStatus(`❌ Ошибка заправки ${carId}`, true);
            return false;
        }
    }

    /**
     * Заправляет все автомобили
     */
    async function fillAllCars() {
        try {
            updateStatus("⛽ Заправка всех автомобилей...");
            
            let e = (
                await f("#home-garage > div > div > a", "https://www.moswar.ru/home/")
            ).map((n) => n.getAttribute("href").split("/").splice(-2, 1)[0]);
            
            console.log(`[Fill All Cars] Found ${e.length} cars to refuel`);
            
            let successCount = 0;
            
            // Заправляем каждый автомобиль по очереди
            for (const carId of e) {
                const success = await fillCarFuel(carId);
                if (success) successCount++;
                // Небольшая задержка для предотвращения спама запросов
                await new Promise(resolve => setTimeout(resolve, 300));
            }
            
            updateStatus(`✅ Заправлено ${successCount} из ${e.length} автомобилей`);
        } catch (error) {
            console.error("[Fill All Cars] Error refueling all cars:", error);
            updateStatus("❌ Ошибка при заправке автомобилей", true);
        }
    }

    /**
     * Настраивает наблюдатель за логами боя
     * @param {HTMLElement} logsContainer - Контейнер с логами
     */
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

    // Экспортируем основные функции глобально
    window.LinkIF = {
        checkCarFuel,
        fillCarFuel,
        fillAllCars,
        saveSet,
        sendSet,
        saveSetModal,
        updateStatus,
        showAlert,
        showNotification,
        setupLogsObserver,
        updateSetIndicator,
        drawSetSummary
    };
})();