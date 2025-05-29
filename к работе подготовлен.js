// ==UserScript==
// @name           К работе подготовлен
// @author         barifan
// @namespace      Linkif
// @version        
// @description    Реализовано: логи, блок кнопок (дизайн)
// @include        *moswar.ru*
// @include        https://*.moswar.mail.ru*
// @match          *://*.moswar.ru/*
// @grant          none
// ==/UserScript==
(async function () {


// === СТИЛИ ДЛЯ ПАНЕЛИ ===
// === 1. Стили панели (визуальный вид кнопок и блоков)
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
`;
document.head.appendChild(style);

// === 2. HTML-панель: слоты, кнопки, селектор комплектов
const panel = document.createElement('div');
panel.id = 'mw-panel';
panel.innerHTML = `
    <div id="mw-slots">
        ${[1,2,3,4].map(i => `
            <div class="mw-slot" id="slot-${i}">
                Слот ${i} (0)
                <button class="reset-btn" onclick="resetSlot(${i})">×</button>
            </div>
            ${i < 4 ? '<div class="mw-divider"></div>' : ''}
        `).join('')}
    </div>
    <div class="mw-status-line" id="mw-status">Ожидание действий...</div>
    <div style="margin-top: 10px;">
        <button class="mw-btn" id="btn-save">Сохранить</button>
        <button class="mw-btn" id="btn-send-current">Отправить</button>
        <button class="mw-btn" id="btn-refuel">Заправить</button>
        <select id="kit-select" class="mw-select"></select>
        <button class="mw-btn" id="btn-send-kit">Отправить комплект</button>
    </div>
`;
document.body.prepend(panel);

// === 3. Логика кнопок: реакции на нажатия



// Кнопка сброса отдельного слота
function resetSlot(index) {
    const raw = localStorage.getItem("moswar_saved_sets");
    if (!raw) return;

    const allSets = JSON.parse(raw);
    if (!Array.isArray(allSets) || !allSets[index]) return;

    allSets[index] = null; // или {} или [] — зависит от структуры

    localStorage.setItem("moswar_saved_sets", JSON.stringify(allSets));

    drawSetSummary();        // перерисовать список слотов
    updateSetIndicator();    // обновить индикатор активного
    updateStatus(`Слот ${index + 1} очищен`);
}


// Кнопка "Сохранить"
document.getElementById("btn-save").onclick = () => {
    updateStatus("Комплект сохранён");
    saveSetModal(); // вызываем сохранение комплекта
};

//  ===== Кнопка "Отправить технику из слота... ======
document.getElementById("btn-send-current").onclick = () => {
    const slot = 0; // можно подставить активный слот или выбрать вручную
    updateStatus(`Отправка слота ${slot}...`);
    sendSet(slot); // отправляем комплект из слота
};


// Кнопка "Заправить" (вся техника с неполным топливом)
document.getElementById("btn-refuel").onclick = () => {
    updateStatus("Заправка техники...");
    refuelAllTransport();
};

    // ========= Теперь нужна функция updateStatus(text): =========
    function updateStatus(text) {
    const el = document.getElementById("mw-status");
    if (el) el.textContent = text;
}



document.getElementById("btn-send-kit").onclick = () => {
    const selectedSlot = parseInt(document.getElementById("kit-select").value, 10);
    updateStatus(`Отправка комплекта #${selectedSlot}...`);
    applySavedSet(selectedSlot); // применяем комплект
    sendSet(selectedSlot);       // и сразу отправляем
};


// Заполняем список комплектов в выпадающем меню
/*
function loadKitOptions() {
    const select = document.getElementById("kit-select");
    const kits = getSavedKits(); // ← вот тут и рвётся
    ...
}
loadKitOptions();
*/



// ============ Конец Async ================


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
      checkCarTank: () => Mt,
      checkInjury: () => Tt,
      checkVictimWorthy: () => re,
      convertPlayerUrlToId: () => ht,
      createButton: () => k,
      createPopover: () => D,
      delay: () => I,
      drawTimers: () => Kt,
      dungeonSpeedUp: () => zt,
      eatSilly: () => bt,
      eatSnickers: () => nt,
      farm: () => St,
      farmEnemies: () => et,
      farmVictims: () => vt,
      fightMode: () => $t,
      fillCarTank: () => Pt,
      filterLogs: () => Ge,
      formatNumber: () => Q,
      formatTime: () => v,
      fuelAllCars: () => nn,
      gatherStats: () => Xe,
      getAlleyCooldown: () => E,
      getElementsOnThePage: () => f,
      getGarageRides: () => It,
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
      restoreHP: () => j,
      scrapeStat: () => Jt,
      sendCars: () => de,
      sendMessage: () => Qt,
      sendPlanesAndBoats: () => pe,
      sendRide: () => Lt,
      shouldAttack: () => Je,
      showAlert: () => Xt,
      signUpForSiri: () => ot,
      smurfInit: () => Me,
      sortGarage: () => Ut,
      startPatrol: () => ee,
      strToHtml: () => A,
      takeDailyDose: () => Ke,
      timeToMs: () => De,
      trackAndAttackRat: () => ie,
      trackRatMode: () => C,
      tradeAllSiri: () => jt,
      undressItem: () => En,
      useDopings: () => yt,
      useItem: () => W,
      waitForCooldown: () => it,
      watchTv: () => We,
      workMode: () => U,
      zodiacMode: () => O,
    });
    var V = window.$;
    function De(t) {
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
    }
    function v(t) {
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
    }
    function Q(t) {
      return (
        (t = `${t}`.split(",").join("")),
        Math.abs(t) >= 1e9
          ? Math.floor((t / 1e9) * 10) / 10 + "B"
          : Math.abs(t) >= 1e6
            ? Math.floor((t / 1e6) * 10) / 10 + "M"
            : Math.abs(t) >= 1e3
              ? Math.floor((t / 1e3) * 10) / 10 + "K"
              : t.toString()
      );
    }
    function I(t = 1) {
      return new Promise((e) => setTimeout(e, t * 1e3));
    }
    async function f(t, e) {
      let o = await (await fetch(e)).text(),
        r = V(L(o));
      if (!r || !r.length) return;
      let a = r.find(t);
      return a.length ? (a.length === 1 ? a[0] : a.toArray()) : null;
    }
    function L(t) {
      let e = new DOMParser(),
        n = t.replace(/\\&quot;/g, '"').replace(/\\"/g, '"');
      return e.parseFromString(n, "text/html");
    }
    function ht(t) {
      let e = t.match(/\player\/(\d+)\//);
      return e ? e[1] : null;
    }
    function K(t) {
      try {
        let e = t.querySelector(".fighter2 .user a").href;
        return ht(e);
      } catch {
        console.log("\u{1F6A7} Could not find player id");
      }
    }
    function Ge(t = window.document) {
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
    }
    async function ze() {
      return +(await f(".my .value b", "https://www.moswar.ru/rating/wins/"))
        .innerText;
    }
    function A(t) {
      let e = document.createElement("div");
      return (e.innerHTML = t.trim()), e.firstChild;
    }
    async function Jt(t) {
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
    }
    async function Xe() {
      let t = {
        Дата: new Date().toLocaleDateString("ru-RU").replace(/\./g, "/"),
      };
      for (let e = 1; e <= 7; e++) {
        let n = await Jt(e);
        n && Object.assign(t, n);
      }
      return t;
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
      let e = Array.isArray(t) ? t : [t];
      return await Promise.all(
        e.map(async (o) =>
          (
            await f(`img[data-st="${o}"]`, "https://www.moswar.ru/player/")
          )?.getAttribute("data-id")
        )
      );
    }
    async function yt(t) {
      let e = await wt(t);
      await Promise.all(e.map((n) => W(n)));
    }
    async function Ve() {
      await yt(tt.heal);
    }
    async function W(t = "2474213164") {
      let n = await (
          await fetch(`https://www.moswar.ru/player/json/use/${t}/`)
        ).text(),
        { inventory: o } = JSON.parse(n);
      return o;
    }
    async function Ke(t = !0) {
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
        p = [...n, ...a, ...o, ...r, s, c, e, t ? l : null];
      await Promise.all(p.map((d) => yt(d)));
    }
    async function j() {
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
    }
    async function bt() {
      let t = await wt(tt.glupaya);
      await W(t);
    }
    async function Yt(t, e = "victim") {
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
    }
    async function Zt(t, e) {
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
        }),
          showAlert("Phone \u2705", `Message sent to ${t}`);
      } catch {
        showAlert("Phone \u274C", "Could not send message"),
          console.log("Could not send message");
      }
    }
    function xt() {
      return new Date(
        new Date().toLocaleString("en-US", { timeZone: "Europe/Moscow" })
      );
    }
    async function U(t = 1) {
      async function e() {
        (await f(
          "#workForm > div.time > span.error",
          "https://www.moswar.ru/shaurburgers/"
        )) ||
          (await fetch("https://www.moswar.ru/shaurburgers/", {
            headers: {
              accept: "*/*",
              "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
              "content-type":
                "application/x-www-form-urlencoded; charset=UTF-8",
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
          }));
      }
      await e(t), setTimeout(async () => U(t), 60.05 * 60 * 1e3);
    }
    async function P(t = 10) {
      try {
        let e = $(await f("form#patrolForm", "https://www.moswar.ru/alley/"));
        if (
          e.find(".timeleft").text() ===
          "\u041D\u0430 \u0441\u0435\u0433\u043E\u0434\u043D\u044F \u0412\u044B \u0443\u0436\u0435 \u0438\u0441\u0442\u0440\u0430\u0442\u0438\u043B\u0438 \u0432\u0441\u0435 \u0432\u0440\u0435\u043C\u044F \u043F\u0430\u0442\u0440\u0443\u043B\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u044F."
        ) {
          let r = Math.floor(
            (new Date(
              new Date().toLocaleString("en-US", { timeZone: "Europe/Moscow" })
            ).setHours(24, 1, 0, 0) -
              new Date()) /
              1e3
          );
          return (
            console.log(`\u23F0 Patrol is over. Retrying in ${v(r)}`),
            setTimeout(async () => await P(t), r * 1e3)
          );
        }
        let o = e?.find("td.value")?.attr("timer");
        if (o) {
          console.log(
            `\u23F1\uFE0F\u2744\uFE0F Patrol cooldown. Retry in ${v(o)}.`
          ),
            setTimeout(async () => await P(t), (+o + 3) * 1e3);
          return;
        }
        console.log(`[\u{1F694}] Patrol Mode (${t} minutes).`),
          await ee(t),
          setTimeout(() => P(t), t * 60 * 1e3 + 3e3);
      } catch (e) {
        console.log(
          `Could not start patrol mode
`,
          e
        );
      }
    }
    async function ee(t = 10, e = 1) {
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
        body: `action=patrol&region=${e}&time=${t}&__ajax=1&return_url=%2Falley%2F`,
        method: "POST",
        mode: "cors",
        credentials: "include",
      }),
        await fetch("https://www.moswar.ru/desert/"),
        await fetch("https://www.moswar.ru/desert/rob/");
    }
    async function We() {
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
    }
    function oo() {
      let t = AngryAjax.getCurrentUrl();
      return /^\/fight\/\d+\/?$/.test(t);
    }
    async function R() {
      await j(),
        await N({
          criteria: "type",
          minLvl: +player.level + 4,
          maxLvl: +player.level + 6,
        });
      let t = await E();
      console.log("[SMURF] Attack again in ", t),
        setTimeout(async () => await R(), 1e3 * 60 * (t + 3));
    }
    async function ne(t, e = 0, ...n) {
      try {
        let o = document.querySelector(
            "#personal > a.bubble > span > span.string"
          ),
          r = o.querySelector("span.text").innerText;
        if (
          r ===
          "\u0417\u0430\u0434\u0435\u0440\u0436\u0430\u043D \u0437\u0430 \u0431\u043E\u0438"
        )
          console.log(
            "\u0417\u0430\u0434\u0435\u0440\u0436\u0430\u043D \u0437\u0430 \u0431\u043E\u0438. \u041D\u0430\u043B\u0430\u0436\u0438\u0432\u0430\u044E \u0441\u0432\u044F\u0437\u0438..."
          ),
            await fetch("https://www.moswar.ru/police/relations/"),
            AngryAjax.goToUrl("/alley/");
        else if (
          r ===
          "\u041E\u0436\u0438\u0434\u0430\u043D\u0438\u0435 \u0431\u043E\u044F"
        )
          try {
            let a = +o.querySelector("span.timeleft").getAttribute("timer");
            return (
              console.log(
                r,
                `
\u041F\u0440\u043E\u0431\u0443\u044E \u0437\u0430\u043D\u043E\u0432\u043E \u0447\u0435\u0440\u0435\u0437: `,
                a
              ),
              setTimeout(() => t(...n), (a + e) * 1e3),
              !0
            );
          } catch (a) {
            return (
              console.log(
                `Waiting for fight. Time unknown... skipping...
`,
                a
              ),
              !1
            );
          }
      } catch {
        return (
          console.log(`[\u2705] All checks passed.
`),
          !1
        );
      }
    }
    async function oe(t, e = 0, n = {}) {
      if (await Ct())
        return (
          console.log(
            "\u{1F6A8} \u0418\u0434\u0435\u0442 \u0433\u0440\u0443\u043F\u043F\u043E\u0432\u043E\u0439 \u0431\u043E\u0439, \u043F\u0440\u043E\u0431\u0443\u044E \u0437\u0430\u043D\u043E\u0432\u043E \u0447\u0435\u0440\u0435\u0437 \u043C\u0438\u043D\u0443\u0442\u0443..."
          ),
          setTimeout(
            () => {
              AngryAjax.goToUrl("/alley/"), t(n);
            },
            (60 + e) * 1e3
          ),
          !0
        );
      let r = await E();
      return r
        ? (console.log(
            `\u23F1\uFE0F \u041A\u0443\u043B\u0434\u0430\u0443\u043D \u0432 \u0437\u0430\u043A\u043E\u0443\u043B\u043A\u0430\u0445. \u041F\u0440\u043E\u0431\u0443\u044E \u0447\u0435\u0440\u0435\u0437 ${v(r)}.`
          ),
          setTimeout(() => t(n), (r + e) * 1e3),
          !0)
        : !1;
    }
    async function vt() {
      if (await it(vt)) return;
      console.log("\u{1F37C} Searching for victims...");
      let e = await (
          await fetch("https://www.moswar.ru/alley/search/type/", {
            headers: {
              accept: "*/*",
              "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
              "content-type":
                "application/x-www-form-urlencoded; charset=UTF-8",
              "sec-fetch-dest": "empty",
              "sec-fetch-mode": "cors",
              "sec-fetch-site": "same-origin",
              "x-requested-with": "XMLHttpRequest",
            },
            referrer: "https://www.moswar.ru/alley/search/type/",
            referrerPolicy: "strict-origin-when-cross-origin",
            body: "type=victim&werewolf=0&nowerewolf=1&__ajax=1&return_url=%2Falley%2F",
            method: "POST",
            mode: "cors",
            credentials: "include",
          })
        ).text(),
        { content: n } = JSON.parse(e),
        o = L(n),
        r = K(o);
      if (!r) return console.log("\u{1F50E} Could not find victim.");
      console.log("\u{1F50E} Found victim:", r);
      let a = await _t(r);
      return (
        a && (console.log("\u2705 Fight completed. ", a), await re(a)),
        setTimeout(() => vt(), 5.1 * 60 * 1e3)
      );
    }
    async function et(t = 5) {
      if (await it(et)) return;
      let n = await (
          await fetch("https://www.moswar.ru/alley/search/type/", {
            headers: {
              accept: "*/*",
              "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
              "content-type":
                "application/x-www-form-urlencoded; charset=UTF-8",
              "sec-fetch-dest": "empty",
              "sec-fetch-mode": "cors",
              "sec-fetch-site": "same-origin",
              "x-requested-with": "XMLHttpRequest",
            },
            referrer: "https://www.moswar.ru/alley/search/type/",
            referrerPolicy: "strict-origin-when-cross-origin",
            body: "type=enemy&werewolf=0&__ajax=1&return_url=%2Falley%2F",
            method: "POST",
            mode: "cors",
            credentials: "include",
          })
        ).text(),
        { content: o } = JSON.parse(n),
        r = L(o),
        a = K(r);
      if (!a)
        return (
          console.log(
            "\u{1F50E} Could not find enemy, searching again in 1 minute..."
          ),
          setTimeout(() => et(), 60 * 1e3)
        );
      console.log("\u{1F94A} Found enemy, attacking:", a),
        (await _t(a)) &&
          (console.log("\u2705 Fight completed. Searching again in 5 minutes."),
          setTimeout(() => et(), t * 60 * 1e3));
    }
    function Je(t, e = 10) {
      let n = [...t.querySelectorAll(".fighter2-cell .stats > .stat span.num")]
        .slice(0, -1)
        .map((r) => +r.innerText)
        .reduce((r, a) => r + a, 0);
      return [...t.querySelectorAll(".fighter1-cell .stats > .stat span.num")]
        .slice(0, -1)
        .map((r) => +r.innerText)
        .reduce((r, a) => r + a, 0) -
        n <
        e
        ? (console.log("Opponent too strong, looking for another opponent."),
          !1)
        : !0;
    }
    async function re(t) {
      let n = await (await fetch("https://www.moswar.ru/fight/" + t)).text(),
        r = new DOMParser().parseFromString(n, "text/html");
      try {
        let a = +r
            .querySelector(".result .tugriki")
            .innerText.split(",")
            .join(""),
          s = r.querySelector(".fighter2 .user a").innerHTML.slice(1);
        if (
          (console.log(`\u{1F50E} Loot: ${a} \u{1F4B5} from opponent: ${s} `),
          a < 2e5)
        ) {
          let c = r.querySelector(".fighter2 .user a").innerHTML.slice(1),
            l = K(r);
          await Zt(c, l);
        } else a > 3e5 && (await Yt(s, "victim"));
        return t;
      } catch (a) {
        console.log("Fight not found", a);
      }
      return !1;
    }
    async function Tt() {
      return !!(await f(
        "#content > table.layout > tbody > tr > td.slots-cell > ul > li.avatar.avatar-back-12 > div.icons-place > a > i",
        "https://www.moswar.ru/player/"
      ));
    }
    async function $t({
      intervalMinutes: t,
      minLvl: e,
      maxLvl: n,
      criteria: o,
    }) {
      if (await Tt()) {
        console.log("\u{1F6A8} You have an injury. Skipping fight mode.");
        return;
      }
      await j(),
        console.log(`[\u{1F94A}] Fight mode started.
Searching by level (${e}-${n})`);
      try {
        await N({ minLvl: e, maxLvl: n });
      } catch {
        console.log(
          "\u{1F6A7} Could not find opponent. Retrying in 1 minute..."
        ),
          setTimeout(
            () => $t({ intervalMinutes: t, minLvl: e, maxLvl: n, criteria: o }),
            60 * 1e3
          );
      }
      setTimeout(
        () => $t({ intervalMinutes: t, minLvl: e, maxLvl: n, criteria: o }),
        t * 60 * 1e3
      );
    }
    async function C(t = 5) {
      try {
        if (await Tt()) {
          console.log("\u{1F6A8} You have an injury. Skipping rat mode.");
          return;
        }
        if (await ne(C, t)) {
          console.log("\u{1F6A8} You are busy. Skipping rat mode.");
          return;
        }
        let o = await f(
          "#content-no-rat > tbody > tr > td:nth-child(1) > div:nth-child(1) > div > div > p.holders > small",
          "https://www.moswar.ru/metro/"
        );
        if (o) {
          let s = +o.getAttribute("timer");
          return (
            console.log(`\u{1F400} Rat over. Retrying in ${v(s)}.`),
            setTimeout(() => C(t), (s + 2) * 1e3)
          );
        }
        if (AngryAjax.getCurrentUrl().includes("fight")) {
          let s = setInterval(groupFightMakeStep, 500);
          setTimeout(() => clearInterval(s), 4e3);
        }
        let r = await E();
        if (r) {
          console.log(`[\u{1F400} Track Rat] \u2744\uFE0F Alley Cooldown.
 Retrying in ${v(r)}`),
            setTimeout(() => C(), r * 1e3);
          return;
        }
        let a = (
          await f("#timer-rat-fight .value", "https://www.moswar.ru/metro/")
        )?.getAttribute("timer");
        if (a && +a > 0) {
          let s = +a;
          return (
            console.log(`[\u{1F400} Track Rat] Rat Cooldown.
Retrying in ${v(s)}.`),
            setTimeout(() => C(), s * 1e3)
          );
        }
        console.log("[\u{1F400} Track Rat] ATTACK!!1"),
          await j(),
          await ie(),
          setTimeout(() => C(), t * 60 * 1e3);
      } catch (e) {
        console.log(
          `[\u{1F400} Track Rat] Could not find rat.
`,
          e
        );
      }
    }
    async function ie() {
      await j(),
        await fetch("https://www.moswar.ru/metro/track-rat/", {
          headers: {
            accept: "*/*",
            "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
            "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "x-requested-with": "XMLHttpRequest",
          },
          referrer: "https://www.moswar.ru/metro/",
          referrerPolicy: "strict-origin-when-cross-origin",
          body: "__referrer=%2Fmetro%2F&return_url=%2Fmetro%2F",
          method: "POST",
          mode: "cors",
          credentials: "include",
        }),
        await I(0.5),
        await fetch("https://www.moswar.ru/metro/fight-rat/", {
          headers: {
            accept: "*/*",
            "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
            "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "x-requested-with": "XMLHttpRequest",
          },
          referrer: "https://www.moswar.ru/metro/",
          referrerPolicy: "strict-origin-when-cross-origin",
          body: "__referrer=%2Fmetro%2F&return_url=%2Fmetro%2F",
          method: "POST",
          mode: "cors",
          credentials: "include",
        }),
        await AngryAjax.goToUrl("/metro");
    }
    async function te(t = "work") {
      await fetch("https://www.moswar.ru/metro/", {
        headers: {
          accept: "*/*",
          "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
          "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
          "x-requested-with": "XMLHttpRequest",
        },
        body: `action=${t}&__referrer=%2Fmetro%2F&return_url=%2Fmetro%2F`,
        method: "POST",
        mode: "cors",
        credentials: "include",
      });
    }
    async function Ye() {
      await fetch("https://www.moswar.ru/alley/attack-npc/1/", {
        headers: {
          accept: "*/*",
          "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
          "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
          "x-requested-with": "XMLHttpRequest",
        },
        body: `player=${player.id}&__referrer=%2Fmetro%2F&return_url=%2Fmetro%2F`,
        method: "POST",
        mode: "cors",
        credentials: "include",
      });
    }
    async function J() {
      let e = (
        await f("#kopaem .process td#metrodig", "https://www.moswar.ru/metro/")
      )?.getAttribute("timer");
      if (e) {
        console.log(
          `[\u26CF\uFE0F Metro] Metro work cooldown. Retry in ${v(+e)}.`
        ),
          showAlert(
            "\u0423\u0436\u0435 \u0432 \u043C\u0435\u0442\u0440\u043E \u26CF\uFE0F",
            `<div><img src="/@/images/pers/npc1_thumb.png" align="right" title="\u041A\u0440\u044B\u0441\u043E\u043C\u0430\u0445\u0430" alt="\u041A\u0440\u044B\u0441\u043E\u043C\u0430\u0445\u0430"><br><span>\u0421\u043B\u0435\u0434\u0443\u044E\u0449\u0438\u0439 \u0441\u043F\u0443\u0441\u043A \u0447\u0435\u0440\u0435\u0437 ${v(+e)}.</span></div>`
          ),
          setTimeout(async () => await J(), +e * 1e3);
        return;
      }
      showAlert(
        "\u041A\u043E\u043F\u0430\u0435\u043C \u0432\u0435\u0442\u043A\u0443 \u043C\u0435\u0442\u0440\u043E \u26CF\uFE0F",
        '<div><img src="/@/images/pers/npc1_thumb.png" align="right" title="\u041A\u0440\u044B\u0441\u043E\u043C\u0430\u0445\u0430" alt="\u041A\u0440\u044B\u0441\u043E\u043C\u0430\u0445\u0430"><br><span>\u0421\u043B\u0435\u0434\u0443\u044E\u0449\u0438\u0439 \u0441\u043F\u0443\u0441\u043A \u0447\u0435\u0440\u0435\u0437 10:00.</span></div>'
      ),
        await Ye(),
        await te("dig"),
        await te("work"),
        setTimeout(
          async () => {
            await J();
          },
          10.1 * 60 * 1e3
        );
    }
    async function N({
      minLvl = +player.level - 1,
      maxLvl = +player.level - 1,
      criteria = "level",
      performChecks = !0,
      werewolf = 0,
    } = {}) {
      if (
        performChecks &&
        (await oe(N, 0, { minLvl, maxLvl, criteria, performChecks, werewolf }))
      )
        return;
      let attackPayload = {
          level: `werewolf=${Number(werewolf)}&nowerewolf=${+!werewolf}&minlevel=${minLvl}&maxlevel=${maxLvl}&__ajax=1&return_url=%2Falley%2F`,
          type: `type=weak&=${Number(werewolf)}=${Number(werewolf)}&nowerewolf=${+!werewolf}&__ajax=1&return_url=%2Falley%2F`,
        },
        res = await fetch(`https://www.moswar.ru/alley/search/${criteria}/`, {
          headers: {
            "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
            "sec-ch-ua": '"Chromium";v="131", "Not_A Brand";v="24"',
            "sec-fetch-mode": "cors",
            "x-requested-with": "XMLHttpRequest",
          },
          referrer: "https://www.moswar.ru/alley/search/level/",
          referrerPolicy: "strict-origin-when-cross-origin",
          body: attackPayload[criteria],
          method: "POST",
          mode: "cors",
          credentials: "include",
        }),
        data = await res.text(),
        htmlStr = await JSON.parse(data).content,
        doc = L(htmlStr);
      console.log(criteria, attackPayload[criteria]);
      let opponentName = doc.querySelector(".fighter2").innerText,
        opponentLevel = +doc
          .querySelector(".fighter2 .level")
          .innerText.slice(1, -1),
        onclick = doc
          .querySelector("#content > div > div.button.button-fight > a")
          .getAttribute("onclick");
      if (
        criteria === "type" &&
        (opponentLevel < minLvl || opponentLevel > maxLvl)
      ) {
        console.log(
          "Opponent:",
          opponentName,
          opponentLevel,
          `
Level is too high or too low (${minLvl}-${maxLvl}). Retrying...`
        ),
          await N({ minLvl, maxLvl, criteria, performChecks, werewolf });
        return;
      }
      console.log("\u{1F94A} Found enemy, attacking:", opponentName),
        eval(onclick.split(";")[0]);
    }
    async function St(t = 25) {
      for (let e = 0; e < t; e++)
        await nt(),
          await N({
            minLvl: +player.level,
            maxLvl: +player.level,
            criteria: "level",
            performChecks: !1,
          }),
          await I(0.1);
    }
    async function nt() {
      await fetch("https://www.moswar.ru/alley/", {
        headers: {
          accept: "application/json, text/javascript, */*; q=0.01",
          "accept-language": "en-GB,en;q=0.9",
          "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-origin",
          "x-requested-with": "XMLHttpRequest",
        },
        referrer: "https://www.moswar.ru/alley/",
        referrerPolicy: "strict-origin-when-cross-origin",
        body: "action=rest_cooldown&code=snikers&ajax=true",
        method: "POST",
        mode: "cors",
        credentials: "include",
      });
    }
    async function _t(t, e = !1) {
      let o = await (
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
          referrer: "https://www.moswar.ru/alley/search/type/",
          referrerPolicy: "strict-origin-when-cross-origin",
          body: `action=attack&player=${t}&werewolf=${e ? 1 : 0}&useitems=0&__referrer=%2Falley%2Fsearch%2Ftype%2F&return_url=%2Falley%2Fsearch%2Ftype%2F`,
          method: "POST",
          mode: "cors",
          credentials: "include",
        })
      ).json();
      return o.return_url && o.return_url.includes("alley/fight/")
        ? "https://www.moswar.ru" + o.return_url
        : null;
    }
    async function E() {
      try {
        let e = (
          await f(
            "#alley-search-myself span.timer",
            "https://www.moswar.ru/alley/"
          )
        ).getAttribute("timer");
        return +e < 0 ? !1 : +e;
      } catch {
        return console.log("\u{1F6A7} Could not find cooldown"), !1;
      }
    }
    async function kt() {
      await j(),
        AngryAjax.reload(),
        await fetch("https://www.moswar.ru/fight/", {
          headers: {
            accept: "*/*",
            "accept-language": "en-GB,en;q=0.9",
            "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "x-requested-with": "XMLHttpRequest",
          },
          referrer: "https://www.moswar.ru/fight/",
          referrerPolicy: "strict-origin-when-cross-origin",
          body: "action=join+fight&fight=0&price=money&type=chaotic&__ajax=1&return_url=%2Falley%2F",
          method: "POST",
          mode: "cors",
          credentials: "include",
        }),
        await fetch("https://www.moswar.ru/fight/", {
          headers: {
            accept: "*/*",
            "accept-language": "en-GB,en;q=0.9",
            "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "x-requested-with": "XMLHttpRequest",
          },
          referrer: "https://www.moswar.ru/fight/",
          referrerPolicy: "strict-origin-when-cross-origin",
          body: "action=join+fight&fight=0&price=huntbadge&type=chaotic&__ajax=1&return_url=%2Falley%2F",
          method: "POST",
          mode: "cors",
          credentials: "include",
        }),
        await fetch("https://www.moswar.ru/fight/", {
          headers: {
            accept: "*/*",
            "accept-language": "en-GB,en;q=0.9",
            "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "x-requested-with": "XMLHttpRequest",
          },
          referrer: "https://www.moswar.ru/fight/",
          referrerPolicy: "strict-origin-when-cross-origin",
          body: "action=join+fight&fight=0&price=zub&type=chaotic&__ajax=1&return_url=%2Falley%2F",
          method: "POST",
          mode: "cors",
          credentials: "include",
        }),
        AngryAjax.reload();
    }
    async function At() {
      function t() {
        let n = new Date(),
          o = { timeZone: "Europe/Moscow", hour12: !1 },
          r = new Intl.DateTimeFormat("en-US", {
            ...o,
            hour: "2-digit",
            minute: "2-digit",
          }).format(n),
          [a, s] = r.split(":").map(Number),
          c = a * 60 + s;
        return c >= 690 && c <= 1411;
      }
      if (!t()) return;
      console.log(
        "[\u{1F93A}] Chaotic fight mode. Waiting for the next scheduled fight..."
      );
      async function e() {
        let n = new Date(),
          o = n.getMinutes(),
          r = [14, 29, 44, 59].find((p) => o < p),
          a = r === void 0 ? n.getHours() + 1 : n.getHours(),
          s = r !== void 0 ? r : 14,
          c = new Date(n.getFullYear(), n.getMonth(), n.getDate(), a, s, 30),
          l = c.getTime() - n.getTime();
        showAlert(
          "\u0412\u0441\u0451 \u043F\u0440\u0430\u0432\u0438\u043B\u044C\u043D\u043E \u0441\u0434\u0435\u043B\u0430\u043B!",
          `\u0417\u0430\u043F\u0438\u0441\u044C \u043D\u0430 \u0445\u0430\u043E\u0442 \u0432 ${c.toUTCString()} (\u0447\u0435\u0440\u0435\u0437 ${v(Math.floor(l / 1e3))})`
        ),
          l > 0
            ? setTimeout(async () => {
                await kt(), setTimeout(async () => await e(), 60 * 1e3);
              }, l)
            : (await kt(), setTimeout(async () => await e(), 60 * 1e3));
      }
      e();
    }
    async function Ze(t = 10) {
      if (AngryAjax.getCurrentUrl().includes("fight"))
        for (let e = 0; e < t; e++) {
          let n = document.querySelector("#fight-actions > div.waiting");
          if (n) {
            console.log(n);
            return;
          }
          console.log(
            "\u041F\u0440\u043E\u043F\u0443\u0441\u043A\u0430\u044E \u0445\u043E\u0434..."
          ),
            groupFightMakeStep(),
            AngryAjax.reload(),
            await I(0.5);
        }
    }
    async function ot() {
      let t = [11, 15, 19, 23],
        e = xt(),
        n = e.getHours(),
        o = t.find((c) => c > n) || t[0];
      o === t[0] && n > t[t.length - 1] && (o = t[0]);
      let r = xt();
      o <= n && r.setDate(r.getDate() + 1), r.setHours(o - 1, 59, 57, 0);
      let s = r.getTime() - e.getTime();
      showAlert(
        "\u0412\u0441\u0451 \u043F\u0440\u0430\u0432\u0438\u043B\u044C\u043D\u043E \u0441\u0434\u0435\u043B\u0430\u043B!",
        `<img src="/@/images/pers/man131_thumb.png"> <span>\u0417\u0430\u043F\u0438\u0441\u044B\u0432\u0430\u044E\u0441\u044C \u043D\u0430 \u0418\u0418 \u0447\u0435\u0440\u0435\u0437 ${v(s / 1e3)} (\u0432 ${r.toLocaleTimeString("ru-RU")})!</span>`
      ),
        typeof window.nodeLog == "function" &&
          nodeLog(
            player?.nickname || "Unknown Player",
            `\u0418\u0418 \u0437\u0430\u043F\u0438\u0441\u044C \u0432 ${r.toLocaleTimeString("ru-RU")}`
          ),
        setTimeout(async () => {
          await fetch("https://www.moswar.ru/phone/call/joinPhoneBoss/", {
            headers: {
              accept: "application/json, text/javascript, */*; q=0.01",
              "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
              "content-type":
                "application/x-www-form-urlencoded; charset=UTF-8",
              "sec-ch-ua": '"Not A(Brand";v="8", "Chromium";v="132"',
              "sec-ch-ua-mobile": "?0",
              "sec-ch-ua-platform": '"macOS"',
              "sec-fetch-dest": "empty",
              "sec-fetch-mode": "cors",
              "sec-fetch-site": "same-origin",
              "x-requested-with": "XMLHttpRequest",
            },
            body: "ajax=1&slot=phone3&type=phoneboss3",
            method: "POST",
            mode: "cors",
            credentials: "include",
          });
        }, s),
        setTimeout(
          async () => {
            await ot();
          },
          s + 20 * 1e3
        );
    }
    async function rt() {
      await fetch("https://www.moswar.ru/camp/gypsy/", {
        headers: {
          accept: "application/json, text/javascript, */*; q=0.01",
          "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
          "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
          "x-requested-with": "XMLHttpRequest",
        },
        referrer: "https://www.moswar.ru/camp/gypsy/",
        body: "action=gypsyStart&gametype=0",
        method: "POST",
        mode: "cors",
        credentials: "include",
      }),
        await fetch("https://www.moswar.ru/camp/gypsy/", {
          headers: {
            accept: "application/json, text/javascript, */*; q=0.01",
            "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
            "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
            "x-requested-with": "XMLHttpRequest",
          },
          referrer: "https://www.moswar.ru/camp/gypsy/",
          body: "action=gypsyAuto",
          method: "POST",
          mode: "cors",
        }),
        AngryAjax.goToUrl("/camp/gypsy/");
    }
    function Qe(t, e) {
      return (
        (t = t.toLowerCase()),
        Object.values(e).filter((n) => n.name.toLowerCase().includes(t))
      );
    }
    function tn(t) {
      return Object.values(t).map((e) => ({
        expiryDate: e[0],
        count: Number(e[1]),
        itemId: e[3],
      }));
    }
    async function en(t) {
      await fetch("https://www.moswar.ru/phone/call/tradeItemView/", {
        headers: {
          accept: "application/json, text/javascript, */*; q=0.01",
          "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
          "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
          "sec-ch-ua": '"Not:A-Brand";v="24", "Chromium";v="134"',
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": '"macOS"',
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-origin",
          "x-requested-with": "XMLHttpRequest",
        },
        body: `ajax=1&item=${t}&slot=phone3`,
        method: "POST",
        mode: "cors",
        credentials: "include",
      });
      let n = await (
          await fetch("https://www.moswar.ru/phone/call/giveItem/", {
            headers: {
              accept: "application/json, text/javascript, */*; q=0.01",
              "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
              "content-type":
                "application/x-www-form-urlencoded; charset=UTF-8",
              "sec-fetch-mode": "cors",
              "sec-fetch-site": "same-origin",
              "x-requested-with": "XMLHttpRequest",
            },
            referrer: "https://www.moswar.ru/phone/call",
            referrerPolicy: "strict-origin-when-cross-origin",
            body: "ajax=1&slot=phone3",
            method: "POST",
            mode: "cors",
            credentials: "include",
          })
        ).text(),
        { prize: o } = JSON.parse(n);
      return console.log(o), $(`<div class="prize-container">${o}</div>`);
    }
    async function jt() {
      let t = await W(0),
        e = Qe("\u0441\u0438\u0440\u0438", t)[0],
        n = tn(e.stackList);
      console.log(n);
      for (let o of n) for (let r = 0; r < o.count; r++) await en(o.itemId);
    }
    async function ae() {
      let n = (
        await (
          await fetch("https://www.moswar.ru/casino/blackjack/", {
            method: "POST",
            headers: {
              accept: "application/json, text/javascript, */*; q=0.01",
              "content-type":
                "application/x-www-form-urlencoded; charset=UTF-8",
              "x-requested-with": "XMLHttpRequest",
            },
            body: "action=new&bet=10",
            credentials: "include",
          })
        ).json()
      ).newRightHand.reduce((o, r) => o + r[2], 0);
      for (; n < 17; ) {
        await new Promise((a) => setTimeout(a, 500));
        let r = await (
          await fetch("https://www.moswar.ru/casino/blackjack/", {
            method: "POST",
            headers: {
              accept: "application/json, text/javascript, */*; q=0.01",
              "content-type":
                "application/x-www-form-urlencoded; charset=UTF-8",
              "x-requested-with": "XMLHttpRequest",
            },
            body: "action=more",
            credentials: "include",
          })
        ).json();
        if (!r.card || ((n += r.card[0][2]), n > 21)) break;
      }
      await new Promise((o) => setTimeout(o, 500)),
        await fetch("https://www.moswar.ru/casino/blackjack/", {
          method: "POST",
          headers: {
            accept: "application/json, text/javascript, */*; q=0.01",
            "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
            "x-requested-with": "XMLHttpRequest",
          },
          body: "action=stop",
          credentials: "include",
        });
    }
    function k({
      text: t,
      onClick: e = () => {},
      title: n,
      className: o,
      disableAfterClick: r = !0,
    }) {
      let a = A(
        `<button type="button" class="${o}-btn button"><span style="float: none;" class="f"><i class="rl"></i><i class="bl"></i><i class="brc"></i><div class="c">${t}</div></span></button>`
      );
      return (
        (a.setText = function (s) {
          $(a).find(".c").text(s);
        }),
        a.addEventListener("click", async (s) => {
          if (!a.classList.contains("disabled")) {
            a.classList.add("disabled");
            try {
              await e(s);
            } catch (c) {
              console.error(e.toString(), c);
            }
            r || a.classList.remove("disabled");
          }
        }),
        n && (a.title = n),
        a
      );
    }
    function Ft({ toggleText: t, className: e, items: n, isOpen: o = !0 }) {
      let r = $(`<div class="dropdown ${e}"></div>`).css({
        display: "flex",
        gap: "8px",
        justifyContent: "center",
        flexWrap: "wrap",
        alignItems: "center",
      });
      o || r.hide(),
        n.forEach((c) => {
          r.append(c);
        });
      let a = k({
          text: t,
          onClick: (c) => {
            let l = c.currentTarget;
            r.toggle("fast"), l.classList.remove("disabled");
          },
        }),
        s = $("<div>")
          .css({
            display: "flex",
            gap: "8px",
            justifyContent: "center",
            flexDirection: "column",
            alignItems: "center",
          })
          .append(a, r);
      return (
        (s.append = (c) => {
          r.append(c);
        }),
        s
      );
    }
    function at({
      label: t,
      action: e,
      className: n,
      min: o = 1,
      max: r = 500,
    }) {
      let a = $(`<div class="${n} btn-input-field"></div>`).css({
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "4px",
          padding: "4px",
        }),
        s = $("<input>", {
          type: "number",
          min: o,
          max: r,
          value: o,
          class: "input-field",
        })
          .css({ width: "60px", textAlign: "center" })
          .on("input", function () {
            let l = parseInt($(this).val(), 10);
            l || $(this).val(o),
              l > r && $(this).val(r),
              l < o && $(this).val(o),
              c.setText(`${t} x${$(this).val()}`);
          }),
        c = k({
          text: `${t} x${o}`,
          className: n,
          onClick: async () => {
            let l = parseInt(s.val(), 10);
            if (isNaN(l) || l < o || l > r) return;
            c.classList.add("disabled");
            let p = Date.now();
            for (let u = 0; u < l; u++) await e();
            let g = Date.now() - p;
            c.classList.remove("disabled"),
              showAlert(
                "\u0413\u043E\u0442\u043E\u0432\u043E",
                `\u041F\u043E\u0432\u0442\u043E\u0440\u0438\u043B \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0435 ${l} \u0440\u0430\u0437 \u0437\u0430 ${v(Math.floor(g / 1e3))}.`
              );
          },
        });
      return a.append(s, $(c)), a;
    }
    var Y = [
        160, 198, 64, 48, 165, 46, 167, 211, 197, 56, 50, 122, 215, 47, 110,
        115, 220, 196, 133, 87, 92,
      ],
      ce = [155, 97, 93, 190, 121, 158],
      H = [
        192, 158, 190, 121, 93, 97, 135, 155, 182, 178, 195, 219, 59, 216, 212,
        183, 173, 159, 156, 149, 146, 134, 119, 111, 95, 88, 84, 78, 74, 69, 68,
        65, 58, 55, 54, 52, 51, 49, 44, 38, 36, 35,
      ],
      qt = [141, 19, 85];
    async function le(t = "979786") {
      await Mt(t),
        fetch("https://www.moswar.ru/automobile/bringup/", {
          headers: {
            accept: "*/*",
            "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
            "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "x-requested-with": "XMLHttpRequest",
          },
          referrer: "https://www.moswar.ru/automobile/bringup/",
          referrerPolicy: "strict-origin-when-cross-origin",
          body: `car=${t}&__ajax=1&return_url=%2Farbat%2F`,
          method: "POST",
          mode: "cors",
          credentials: "include",
        });
    }
    async function B(t = "979786") {
      if (
        !(
          new Intl.DateTimeFormat("en-US", {
            weekday: "long",
            timeZone: "Europe/Moscow",
          }).format(new Date()) === "Monday"
        )
      ) {
        showAlert(
          "\u{1F695}",
          "\u041D\u0435 \u043F\u043E\u043D\u0435\u0434\u0435\u043B\u044C\u043D\u0438\u043A."
        );
        return;
      }
      let n = await f("#cooldown", "https://www.moswar.ru/arbat/");
      if (n)
        try {
          let a = await n.getAttribute("timer");
          console.log(`[\u{1F695}] Retrying in ${v(a)} minutes.`),
            setTimeout(() => B(t), +a * 1e3);
          return;
        } catch {
          console.log("[\u{1F695}] Cooldown timer not found.");
        }
      await le(t), await I(3);
      let r = await (
        await f("#cooldown", "https://www.moswar.ru/arbat/")
      ).getAttribute("timer");
      console.log(`[\u{1F695}] \u2705 Done. Retrying in ${v(r)} minutes.`),
        setTimeout(() => B(t), +r * 1e3);
    }
    async function Pt(t = "1095154") {
      await fetch(`https://www.moswar.ru/automobile/buypetrol/${t}/`, {
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
        referrer: `https://www.moswar.ru/automobile/buypetrol/${t}/`,
        referrerPolicy: "strict-origin-when-cross-origin",
        body: `__ajax=1&return_url=%2Fautomobile%2Fcar%2F${t}`,
        method: "POST",
        mode: "cors",
        credentials: "include",
      });
    }
    async function nn() {
      try {
        let e = (
          await f("#home-garage > div > div > a", "https://www.moswar.ru/home/")
        ).map((n) => n.getAttribute("href").split("/").splice(-2, 1)[0]);
        await Promise.all(e.map((n) => Pt(n)));
      } catch {
        console.log("Could not fuel all cars");
      }
    }

      // Я ПОПРОБУЮ УДАЛИТЬ ЭТО, МАЛО ЛИ - ЕЩЕОДНА

      function It() {
  return [...document.querySelectorAll('.actions input[type="checkbox"]:checked')]
    .map((cb) => {
      const li = cb.closest("li");
      if (!li) return null;

      const car = li.querySelector('input[name="car"]');
      const dir = li.querySelector('input[name="direction"]');
      if (!car || !dir) return null;

      return {
        carId: +car.value,
        rideId: +dir.value
      };
    })
    .filter(Boolean);
}

      // ЕЩЕОДНА конец

    async function Lt(t, e) {
      await Mt(t);
      let o = await (
          await fetch("https://www.moswar.ru/automobile/ride/", {
            body: new URLSearchParams({ direction: e, car: t, __ajax: "1" }),
            method: "POST",
            mode: "cors",
            credentials: "include",
          })
        ).text(),
        a = L(o).querySelector("body > .alert");
      (a.style.display = "block"),
        (a.style.position = "static"),
        (a.style.margin = "5px"),
        a.querySelector(".close-cross").remove();
      let s = $("#ride-alerts");
      s.length < 1 && (s = D("ride-alerts")),
        s.css({
          "align-items": "flex-start",
          overflowY: "scroll",
          maxHeight: "65vh",
          width: "90vw",
        }),
        s.append(a);
    }

      // ВРЕМЕННАЯ ЗАМЕНА 1

async function pe() {
  const saved = JSON.parse(localStorage.getItem("moswar_saved_transport_set") || "[]");
  const rides = saved.length > 0 ? saved : It();
  alert(`[pe()] Подготовлено ${rides.length} машин:\n` + rides.map(r => `• carId: ${r.carId}, rideId: ${r.rideId}`).join("\n"));
}

async function de() {
  const saved = JSON.parse(localStorage.getItem("moswar_saved_transport_set") || "[]");
  const rides = saved.length > 0 ? saved : It();
  alert(`[de()] Подготовлено ${rides.length} машин:\n` + rides.map(r => `• carId: ${r.carId}, rideId: ${r.rideId}`).join("\n"));
}


      // Временная ЗАМЕНА 1 - КОНЕЦ

    async function Mt(t = "979786") {
      let e = await f(
        ".fuel .neft",
        `https://www.moswar.ru/automobile/car/${t}/`
      );
      try {
        +e.innerText.split(":")[1].split("/")[0] === 0 &&
          (console.log("[Check Car Tank] Car tank is empty!"), await Pt(t));
      } catch {
        console.log("[Check Car Tank] Car tank not found");
      }
    }


// === Функция отрисовки списка слотов ===
function drawSetSummary() {
  const container = document.querySelector(".set-summary");
  if (!container) return;

  const sets = JSON.parse(localStorage.getItem("moswar_saved_sets") || "{}");
  container.innerHTML = "";

  for (let i = 1; i <= 4; i++) {
    const count = sets[i]?.length || 0;
    if (count > 0) {
      const slot = document.createElement("span");
      slot.textContent = `Слот ${i} (${count})`;
      slot.style.margin = "30px";
      container.appendChild(slot);
    }
  }
}
        // === Функция сохранения комплекта ===

      function saveSetModal() {
        const rides = It();
        console.log("💾 Выбрано:", rides);
        alert("💾 Сохранение комплекта: " + rides.length + " машин");

        if (!rides.length) return;

        const slot = prompt("Введите номер слота (1, 2, 3 или 4):");
        if (!["1", "2", "3", "4"].includes(slot)) return;

        const sets = JSON.parse(localStorage.getItem("moswar_saved_sets") || "{}");
        sets[slot] = rides;
        localStorage.setItem("moswar_saved_sets", JSON.stringify(sets));
        localStorage.setItem("moswar_active_set", slot);
        updateSetIndicator();
        applySavedSet(slot); // Новая строка: Применяем сохраненный комплект сразу
        drawSetSummary();

        alert("✅ Сохранено!");
    }

      // === Функция сохранения комплекта_ конец ===


      // Проба переноса из async

      function sendSet(slot) {
				  const sets = JSON.parse(localStorage.getItem("moswar_saved_sets") || "{}");
				  const set = sets[String(slot)];
				  if (!set || !set.length) {
					alert("❌ Комплект не найден или пуст");
					return;
				  }

				  localStorage.setItem("moswar_active_set", String(slot));
				  updateSetIndicator();

				// drawSetSummary_начало

				// === Функция: отрисовка количества машин по слотам ===

				// drawSetSummary_конец

				  let refueled = 0;
				  let launched = 0;

				  const delay = (ms) => new Promise(res => setTimeout(res, ms));

				  const sendAll = async () => {
					for (let { carId, rideId } of set) {
					  try {
						const fuel = await fetch(`/automobile/car/${carId}/`, {
						  credentials: "include"
						}).then(r => r.text());

						const fuelMatch = fuel.match(/Топливо:[^0-9]*([0-9]+)/i);
						const currentFuel = fuelMatch ? parseInt(fuelMatch[1], 10) : 0;

						if (currentFuel === 0) {
						  await fetch(`/automobile/buypetrol/${carId}/`, {
							method: "POST",
							credentials: "include",
							headers: { "Content-Type": "application/x-www-form-urlencoded" },
							body: `__ajax=1&return_url=%2Fautomobile%2Fcar%2F${carId}`
						  });
						  refueled++;
						  console.log(`⛽ Заправлена машина ${carId}`);
						  await delay(500);
						}

						await fetch("/automobile/ride/", {
						 method: "POST",
						 credentials: "include",
						 headers: { "Content-Type": "application/x-www-form-urlencoded" },
						 body: `car=${carId}&direction=${rideId}&__ajax=1`
						 });

						launched++;
						console.log(`📤 Отправлена машина ${carId} ➜ ${rideId}`);
						await delay(500);

					  } catch (err) {
						console.warn(`❌ Ошибка с машиной ${carId}:`, err);
					  }
					}

					alert(`✅ Комплект ${slot} отправлен.\nОтправлено: ${launched}, заправлено: ${refueled}`);
				  };

				  sendAll();
				}





    // ========== ЛОГИКА: сохранение, отправка и индикатор комплекта ==========

    function It() {
        return [...document.querySelectorAll('input.dynamic-checkbox:checked')]
            .map(cb => {
                const li = cb.closest("li");
                if (!li) return null;

                const carInput = li.querySelector('input[name="car"]');
                const dirInput = li.querySelector('input[name="direction"]');
                if (!carInput || !dirInput) return null;

                return {
                    carId: +carInput.value,
                    rideId: +dirInput.value
                };
            })
            .filter(Boolean);
    }



								// Функиция отправки комплекта
							   function createSetSelectionModal() {
					  const slot = prompt("Введите номер комплекта (1-4):");
					  if (!slot) return;

					  const sets = JSON.parse(localStorage.getItem("moswar_saved_sets") || "{}");
					  const set = sets[String(slot)];
					  if (!set || !set.length) {
						alert("❌ Комплект не найден или пуст");
						return;
					  }

					  localStorage.setItem("moswar_active_set", String(slot));
					  updateSetIndicator();

					  let refueled = 0;
					  let launched = 0;

					  const delay = (ms) => new Promise(res => setTimeout(res, ms));

					  const sendAll = async () => {
						for (let { carId, rideId } of set) {
						  try {
							const fuel = await fetch(`/automobile/car/${carId}/`, {
							  credentials: "include"
							}).then(r => r.text());

							const fuelMatch = fuel.match(/Топливо:[^0-9]*([0-9]+)/i);
							const currentFuel = fuelMatch ? parseInt(fuelMatch[1], 10) : 0;

							if (currentFuel === 0) {
							  await fetch(`/automobile/buypetrol/${carId}/`, {
								method: "POST",
								credentials: "include",
								headers: { "Content-Type": "application/x-www-form-urlencoded" },
								body: `__ajax=1&return_url=%2Fautomobile%2Fcar%2F${carId}`
							  });
							  refueled++;
							  console.log(`⛽ Заправлена машина ${carId}`);
							  await delay(500);
							}

							await fetch("/automobile/ride/", {
							  method: "POST",
							  credentials: "include",
							  headers: { "Content-Type": "application/x-www-form-urlencoded" },
							  body: `car=${carId}&direction=${rideId}&__ajax=1`
							});

							launched++;
							console.log(`📤 Отправлена машина ${carId} ➜ ${rideId}`);
							await delay(500);

						  } catch (err) {
							console.warn(`❌ Ошибка с машиной ${carId}:`, err);
						  }
						}

						alert(`✅ Комплект ${slot} отправлен.\nОтправлено: ${launched}, заправлено: ${refueled}`);
					  };

					  sendAll();
					}

					// Функиция отправки комплекта_конец

		// === Функция: отображение активного слота (если требуется где-то ещё) ===
    function updateSetIndicator() {
        const slot = localStorage.getItem("moswar_active_set") || "–";
        const label = document.querySelector(".set-indicator-label");
        if (label) {
            const sets = JSON.parse(localStorage.getItem("moswar_saved_sets") || "{}");
            const count = sets[slot]?.length || 0;
            label.textContent = slot !== "–" ? `Комплект: ${slot} (${count})` : "Комплект: –";
        }
    }



    // Новая функция для применения сохраненного комплекта
    function applySavedSet(slot) {
        const sets = JSON.parse(localStorage.getItem("moswar_saved_sets") || "{}");
        const selected = sets[slot];
        if (selected && selected.length) {
            // Очищаем текущие выбранные элементы
            document.querySelectorAll('input.dynamic-checkbox:checked').forEach(cb => cb.checked = false);
            // Применяем сохраненный комплект
            selected.forEach(s => {
                const carInput = document.querySelector(`input[name="car"][value="${s.carId}"]`);
                if (carInput) {
                    const li = carInput.closest("li");
                    const dirInput = li.querySelector(`input[name="direction"][value="${s.rideId}"]`);
                    if (dirInput) {
                        const checkbox = li.querySelector('input.dynamic-checkbox');
                        if (checkbox) checkbox.checked = true;
                    }
                }
            });
            console.log(`✅ Применен комплект из слота ${slot}`);
        }
    }

    // Инициализация и восстановление последнего активного комплекта при загрузке страницы
    document.addEventListener("DOMContentLoaded", () => {
        const activeSet = localStorage.getItem("moswar_active_set");
        if (activeSet) {
            applySavedSet(activeSet); // Новая строка: Восстанавливаем последний активный комплект
            updateSetIndicator(); // Новая строка: Обновляем индикатор
        }

        // Добавляем MutationObserver для обеспечения добавления кнопок и повторного применения комплектов при необходимости
        const observer = new MutationObserver(() => {
            const target = document.querySelector("#content > div > div.block-bordered");
            if (typeof Ut === "function" && target && !target.querySelector("button")) {
                console.log("[🧪] Вызов Ut() для вставки кнопок");
                Ut();
                if (activeSet) applySavedSet(activeSet); // Новая строка: Переприменяем комплект после обновления UI
                updateSetIndicator(); // Новая строка: Обновляем индикатор после обновления UI
            }
        });
        observer.observe(document.body, { childList: true, subtree: true });

        // Добавляем кнопки или другие элементы UI, если нужно
        if (typeof Ut === "function") {
            Ut();


	   }
    });

      // Конец переноса


// === Блок построения интерфейса поездок === функция Ut
// === Блок построения интерфейса поездок и комплектов ===

 // === Интерфейс поездок и комплектов — компактная горизонтальная версия ===




      function Ut() {
  const container = $("<div>").css({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "12px",
    padding: "10px"
  });

  // === Горизонтальный блок кнопок ===
  const topBar = document.createElement("div");
  topBar.style.display = "flex";
  topBar.style.flexWrap = "wrap";
  topBar.style.gap = "70px";
  topBar.style.justifyContent = "center";

  function makeButton(text, title, className, handler) {
    const b = document.createElement("button");
    b.textContent = text;
    b.title = title;
    b.className = className;
    b.onclick = handler;
    return b;
  }

  // Кнопки
  topBar.append(
    makeButton("🟢 Отправить", "Отправить выбранный транспорт", "mw-btn-green", async () => {
      const selected = [...document.querySelectorAll('input[type=checkbox]:checked')];
      for (let cb of selected) {
        try {
          const li = cb.closest("li");
          if (!li) continue;
          const carInput = li.querySelector('input[name="car"]');
          const dirInput = li.querySelector('input[name="direction"]');
          if (!carInput || !dirInput) continue;
          const carId = carInput.value;
          const rideId = dirInput.value;

          await Mt(carId);
          await fetch("/automobile/ride/", {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: `car=${carId}&direction=${rideId}&__ajax=1`
          });

          cb.checked = false;
          console.log(`📤 Отправлена машина ${carId} ➜ ${rideId}`);
        } catch (err) {
          console.warn("❌ Ошибка при отправке:", err);
        }
      }
    }),

    makeButton("⛽ Заправить", "Заправить все машины", "mw-btn-blue", async (event) => {
      const btn = event?.target;
      const originalText = btn.textContent;
      btn.textContent = "⏳ Заправка...";
      btn.disabled = true;

      const cars = Array.from(document.querySelectorAll('input[name="car"]'));
      let refueled = 0;

      await Promise.all(cars.map(async input => {
        const carId = input.value;
        try {
          await fetch(`https://www.moswar.ru/automobile/buypetrol/${carId}/`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: `__ajax=1&return_url=%2Fautomobile%2Fcar%2F${carId}`
          });
          console.log(`⛽ Заправлена машина: ${carId}`);
          refueled++;
        } catch (err) {
          console.warn(`❌ Ошибка при заправке ${carId}:`, err);
        }
      }));

      btn.textContent = `✅ ${refueled}`;
      setTimeout(() => {
        btn.textContent = originalText;
        btn.disabled = false;
      }, 3000);
    }),

    makeButton("💾", "Сохранить текущий комплект", "", () => saveSetModal()),
    makeButton("📤", "Выбрать комплект для отправки", "", () => createSetSelectionModal()),
    makeButton("🧹", "Сбросить все сохранённые комплекты", "", () => {
      localStorage.removeItem("moswar_saved_sets");
      localStorage.removeItem("moswar_active_set");
      updateSetIndicator();
      drawSetSummary();
      alert("🧹 Все комплекты удалены.");
    })
  );

  container.append(topBar);

  // === Список комплектов (только он!) ===
  const summary = document.createElement("div");
  summary.className = "set-summary";
  summary.style.fontSize = "13px";
  summary.style.lineHeight = "1.5";
  summary.style.marginTop = "4px";
  container.append(summary);

// Очищаем блок и вставляем новую панель
$("#content > div > div.block-bordered").html(""); // очищаем старую
$("#content > div > div.block-bordered").append(panel); // вставляем новую



  // Стилизацию транспорта и сетку оставим как есть
  const o = $("#content > div > div.cars-trip-choose.clearfix > div ul li");

  function r(c) {
    const { exceptionCars: l, planesAndBoats: p, rest: d, bannedCars: g } = rn(c);
    const u = [...l, ...p, ...on(d.reverse()), ...g];
    const w = $("#content > div > div.cars-trip-choose.clearfix > div ul");
    $(u).appendTo(w);
  }

  function a(c) {
    c.each((l, p) => {
      $(p).find("table.title").remove();
      $(p).find("table.ride-info").remove();
      $(p).css({ minHeight: "auto", height: "auto" });
      $(p).find(".picture .timeout").each((d, g) => {
        $(g).css({ height: "auto" });
        $(g).contents().not("span.ride-cooldown").remove();
      });
    });
  }

  r(o);
  a(o);

  const s = $("#content > div > div.cars-trip-choose.clearfix > div ul");
  o.css("box-shadow", "0px 1px 9px 2px rgba(24, 22, 38, 0.5)");
  s.css({
    display: "grid",
    "grid-template-columns": "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "10px",
  });

  $(".cars-trip-choose.clearfix").css({
    position: "relative",
    left: "35%",
    transform: "translateX(-50%)",
    width: "80vw",
    margin: "auto",
    "z-index": 9998,
  });

  $(".cars-trip-accordion").css({
    background: "rgba(255, 255, 255, 0.2)",
    "backdrop-filter": "blur(10px)",
    "-webkit-backdrop-filter": "blur(10px)",
    "border-radius": "10px",
    border: "1px solid rgba(255, 255, 255, 0.3)",
    padding: "20px",
    width: "100%",
    "box-shadow": "0 4px 10px rgba(0, 0, 0, 0.1)",
  });


          // Еще одна функция function drawSetSummary()



          // ========== Конец еще одной функции function drawSetSummary() ===========

  drawSetSummary();
  updateSetIndicator();
}

		// ======= Конец функции Ut ======



    function se(t) {
      let e = t.find(".car .car-cooldown").attr("timer");
      return e ? parseInt(e, 10) : -1;
    }
    function on(t) {
      return (
        Array.isArray(t) || (t = t.toArray()),
        t.sort((e, n) => se($(n)) - se($(e)))
      );
    }
    function rn(t) {
      let e = [],
        n = [],
        o = [],
        r = [];
      return (
        t.each((a, s) => {
          let c = $(s),
            l = +c.attr("data-direction-id");
          Y.includes(l)
            ? (c.css("background", "#b9dfc7"), e.push(s))
            : H.includes(l)
              ? (c.css("background", "#aad7f8"), n.push(s))
              : qt.includes(l)
                ? (c.css("background", "#b9060e"), r.push(s))
                : (c.css("background", "#f8d7aa"), o.push(s));
          function p(d, g) {
            let u = g.indexOf(d);
            return u === -1 ? 1 / 0 : u;
          }
          return (
            e.sort((d, g) => {
              let u = +$(d).attr("data-direction-id"),
                w = +$(g).attr("data-direction-id");
              return p(u, Y) - p(w, Y);
            }),
            n.sort((d, g) => {
              let u = +$(d).attr("data-direction-id"),
                w = +$(g).attr("data-direction-id");
              return p(u, H) - p(w, H);
            }),
            [...e, ...n, ...o]
          );
        }),
        { exceptionCars: e, planesAndBoats: n, rest: o, bannedCars: r }
      );
    }
    async function Bt() {
      await j(),
        AngryAjax.goToUrl("/alley/"),
        $(document).one("ajaxStop", async () => {
          function t() {
            let n = $(
              '.alley-sovet h3:contains("\u041F\u0440\u043E\u0442\u0438\u0432\u043E\u0441\u0442\u043E\u044F\u043D\u0438\u0435")'
            )
              .parent()
              .find("span.f")
              .attr("onclick");
            if (!n) return null;
            let o = n.match(/'([^']+)'(?:\s*\))/);
            return o ? o[1] : null;
          }
          let e = t();
          await fetch("https://www.moswar.ru/sovet/join_metro_fight/", {
            headers: {
              accept: "*/*",
              "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
              "content-type":
                "application/x-www-form-urlencoded; charset=UTF-8",
              "sec-fetch-mode": "cors",
              "sec-fetch-site": "same-origin",
              "x-requested-with": "XMLHttpRequest",
            },
            body: `action=join_metro_fight&metro=2&type=metro&joinkey=${e}&__referrer=%2Falley%2F&return_url=%2Falley%2F`,
            method: "POST",
            mode: "cors",
          }),
            AngryAjax.goToUrl("/sovet/map/"),
            Groups.showCreateGroup("sovet");
        });
    }
    async function Ot() {
      await fetch("https://www.moswar.ru/clan/profile/banzai/", {
        headers: {
          accept: "*/*",
          "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
          "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
          "x-requested-with": "XMLHttpRequest",
        },
        referrer: "https://www.moswar.ru/clan/profile/banzai/",
        referrerPolicy: "strict-origin-when-cross-origin",
        body: `player=${player.id}&boost%5Bratingaccur%5D=10000&boost%5Bratingdamage%5D=10000&boost%5Bratingcrit%5D=10000&boost%5Bratingdodge%5D=10000&boost%5Bratingresist%5D=10000&boost%5Bratinganticrit%5D=10000&hours=8&__ajax=1&return_url=%2Fclan%2Fprofile%2Fbanzai%2F`,
        method: "POST",
        mode: "cors",
        credentials: "include",
      }),
        AngryAjax.goToUrl("/clan/profile/banzai/");
    }
    async function an() {
      showAlert(
        "\u{1F454} \u0420\u0435\u0436\u0438\u043C \u043F\u0440\u043E\u0442\u0438\u0432\u043E\u0441\u0442\u043E\u044F\u043D\u0438\u044F \u0432\u043A\u043B\u044E\u0447\u0435\u043D!",
        "\u0417\u0430\u043F\u0438\u0441\u044B\u0432\u0430\u044E\u0441\u044C \u0432 \u043F\u0440\u043E\u0442 \u043A\u0430\u0436\u0434\u044B\u0435 30 \u043C\u0438\u043D\u0443\u0442, 5 \u043C\u0438\u043D\u0443\u0442 \u0434\u043E \u0431\u043E\u044F."
      );
    }
    async function sn(t) {
      await fetch("https://www.moswar.ru/fight/", {
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
        referrer: `https://www.moswar.ru/fight/${t}/`,
        referrerPolicy: "strict-origin-when-cross-origin",
        body: `action=attack&json=1&__referrer=%2Ffight%2F${t}%2F&return_url=%2Ffight%2F${t}%2F`,
        method: "POST",
        mode: "cors",
        credentials: "include",
      });
    }
    var pt = {
        gloryLossCoefficient: 0.02,
        targets: [
          "\u041C\u043E\u0421\u043A\u0412\u0438\u0427\u043A\u0410",
          "\u041A\u043E\u0434\u0438 \u0411\u0430\u043A\u0441\u0442\u0435\u0440",
          "error 404",
          "KREATOR_007",
          "_\u0422\u0430\u0442\u0430\u0440\u0438\u043D_",
          "\u0420\u0435\u0430\u043A\u0442\u0438\u0432\u043D\u044B\u0439",
          "Kitsune",
          "\u0424\u0435\u0434\u043E\u0440 \u041C\u0430\u0440\u043C\u0435\u043B\u0430\u0434\u043E\u0432\u0438\u0447",
          "\u0427\u0443\u0434\u043E \u042E\u0434\u043E",
          "Sid_Ss",
          "\u041A\u0432\u0430\u0437\u0438\u043C\u043E\u0434\u044B\u0447",
          "\u0447\u0435\u0448\u0438\u043D\u043E\u0433\u0430",
        ],
      },
      cn = !1;
    async function ue() {
      AngryAjax.getCurrentUrl() !== "/travel2/" &&
        (console.log("[PVP] Not on Travel2 page. Navigating there..."),
        AngryAjax.goToUrl("/travel2/"));
      let t = ye(),
        e = mn();
      if (t == e) {
        showAlert(
          "\u0412\u044B \u0443\u0436\u0435 \u043D\u0430 \u043F\u043E\u0441\u043B\u0435\u0434\u043D\u0435\u043C \u0443\u0440\u043E\u0432\u043D\u0435!",
          "\u041F\u0435\u0440\u0435\u0439\u0434\u0438\u0442\u0435 \u0432 \u0434\u0440\u0443\u0433\u0443\u044E \u0441\u0442\u0440\u0430\u043D\u0443 \u0447\u0442\u043E\u0431\u044B \u043D\u0430\u0447\u0430\u0442\u044C \u0441\u043F\u0438\u0434\u0440\u0430\u043D. <br>"
        );
        return;
      }
      console.log("[PVP] Speedrun started."),
        $e(),
        await be(),
        $(document).one("ajaxStop", () => setTimeout(G, 1e3)),
        $(document).one("endOfTurn", () => setTimeout(ue, 3e3));
    }
    async function ln() {
      !AngryAjax.getCurrentUrl() !== "/travel2/" &&
        AngryAjax.goToUrl("/travel2/"),
        await Nt();
    }
    async function me() {
      $(document).one("ajaxStop", G), Worldtour2.startFight(), await he(2);
    }
    async function G() {
      if (AngryAjax.getCurrentUrl().includes("fight")) {
        if (!$(".block-rounded").children().first().hasClass("current")) {
          showAlert(
            "\u0423\u043F\u0441...",
            "\u041F\u0435\u0440\u0435\u0439\u0434\u0438\u0442\u0435 \u043D\u0430 \u043F\u043E\u0441\u043B\u0435\u0434\u043D\u0438\u0439 \u0445\u043E\u0434!"
          );
          return;
        }
        if (
          $(
            "#fightGroupForm > table > tbody > tr > td.log > ul > li:nth-child(1) > div.result"
          ).length > 0
        ) {
          showAlert(
            "\u0423\u043F\u0441...",
            "\u0411\u043E\u0439 \u0443\u0436\u0435 \u0437\u0430\u043A\u043E\u043D\u0447\u0435\u043D! \u{1F440}"
          );
          return;
        }
        console.log("[PVP] Handle group fight."),
          await ct(st.roar),
          await ct(st.secondSelf),
          await ct(st.topot),
          await ct(st.krovotok),
          await pn(10),
          console.log("[PVP] Group fight handler finished execution.");
      }
    }
    async function pn(t = 10) {
      if (AngryAjax.getCurrentUrl().includes("fight"))
        for (let e = 0; e < t; e++) {
          let n = document.querySelector("#fight-actions > div.waiting");
          if ((console.log(n), n)) {
            dn();
            return;
          }
          console.log("Making turn..."),
            groupFightMakeStep(),
            AngryAjax.reload(),
            await he(0.5);
        }
    }
    function dn() {
      let t =
        document
          .querySelector("#fightGroupForm > h3 > div.group1")
          .innerText.split(" ")[1]
          .slice(1, -1)
          .split("/")[0] === "0";
      return (cn = t), t;
    }
    async function Nt() {
      if (!pt.targets || pt.targets.length === 0) {
        showAlert(
          "\u041E\u0448\u0438\u0431\u043A\u0430!",
          "\u0423\u043A\u0430\u0436\u0438\u0442\u0435 \u0441\u043F\u0438\u0441\u043E\u043A \u0446\u0435\u043B\u0435\u0439 \u0434\u043B\u044F \u043F\u043E\u0438\u0441\u043A\u0430 \u0441\u0438\u043B\u044C\u043D\u044B\u0445."
        );
        return;
      }
      let { name: t, maxPoints: e, victoryPoints: n } = ge();
      try {
        for (let o = 0; o <= 10; o++) {
          if (!t) throw new Error("Nickname not found");
          if (
            (console.log("[\u{1F4C1}pvp.js:175] ", t, e, n),
            pt.targets.includes(t))
          ) {
            showConfirm(
              `<b>${t}</b> <br> \u0417\u0430 \u043F\u043E\u0431\u0435\u0434\u0443 \u0432\u044B \u043F\u043E\u043B\u0443\u0447\u0438\u0442\u0435 <b>${n}</b> / <b>${e}</b> \u043E\u0447\u043A\u043E\u0432! (${e - n})`,
              [
                {
                  title: "\u041D\u0430\u043F\u0430\u0441\u0442\u044C!",
                  callback: me,
                },
                {
                  title: "\u041E\u0442\u043C\u0435\u043D\u0430",
                  callback: function (a) {
                    closeAlert(a);
                  },
                },
              ],
              {
                __title:
                  "\u041F\u0440\u043E\u0442\u0438\u0432\u043D\u0438\u043A \u043D\u0430\u0439\u0434\u0435\u043D!",
              }
            );
            return;
          }
          showAlert(
            "\u041F\u043E\u0438\u0441\u043A \u0434\u043E\u0441\u0442\u043E\u0439\u043D\u043E\u0433\u043E \u043F\u0440\u043E\u0442\u0438\u0432\u043D\u0438\u043A\u0430",
            `\u041F\u043E\u043F\u044B\u0442\u043A\u0430 ${o + 1}: <b>${t}</b>.<br>\u0418\u0449\u0435\u043C \u0434\u0430\u043B\u044C\u0448\u0435...`
          );
          let r = await fe(o === 0);
          (t = r.name), (e = r.maxPoints), (n = r.victoryPoints);
        }
        showConfirm(
          "\u041D\u0438\u043A\u043E\u0433\u043E \u0438\u0437 \u0441\u043F\u0438\u0441\u043A\u0430 \u043D\u0435 \u043D\u0430\u0448\u0435\u043B. \u0414\u0430\u043B\u044C\u043D\u0435\u0439\u0448\u0438\u0435 \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u044F?",
          [
            {
              title:
                "\u041F\u0440\u043E\u0434\u043E\u043B\u0436\u0438\u0442\u044C \u043F\u043E\u0438\u0441\u043A!",
              callback: Nt,
            },
            {
              title: "\u041E\u0442\u043C\u0435\u043D\u0430",
              callback: function (o) {
                closeAlert(o);
              },
            },
          ],
          {
            __title:
              "\u0411\u0435\u0437 \u0443\u0441\u043F\u0435\u0445\u0430... :(",
          }
        );
      } catch (o) {
        console.log(
          `Could not search for opponent:
`,
          o
        );
      }
    }
    async function un() {
      AngryAjax.getCurrentUrl() !== "/travel2/" &&
        AngryAjax.goToUrl("/travel2/");
      try {
        let t = document.querySelector(
            "#content > div.worldtour-stats > div > p:nth-child(3) > span:nth-child(4)"
          ).innerText,
          e = ge(),
          n = t * pt.gloryLossCoefficient;
        for (let o = 0; o <= 10; o++) {
          if (
            (console.log("[\u{1F4C1}pvp.js:251] opponent:", e),
            t - e.victoryPoints < n)
          ) {
            showConfirm(
              `<b>${e.name}</b> <br> \u0417\u0430 \u043F\u043E\u0431\u0435\u0434\u0443 \u0432\u044B \u043F\u043E\u043B\u0443\u0447\u0438\u0442\u0435 <b>${e.victoryPoints}</b> / <b>${t}</b> \u043E\u0447\u043A\u043E\u0432! (${t - e.victoryPoints})`,
              [
                {
                  title: "\u041D\u0430\u043F\u0430\u0441\u0442\u044C!",
                  callback: me,
                },
                {
                  title: "\u041E\u0442\u043C\u0435\u043D\u0430",
                  callback: function (a) {
                    closeAlert(a);
                  },
                },
              ],
              {
                __title:
                  "\u041F\u0440\u043E\u0442\u0438\u0432\u043D\u0438\u043A \u043D\u0430\u0439\u0434\u0435\u043D!",
              }
            );
            return;
          }
          showAlert(
            "\u041F\u043E\u0438\u0441\u043A \u043F\u0440\u043E\u0442\u0438\u0432\u043D\u0438\u043A\u0430 \u0441 \u043C\u0430\u043A\u0441\u0438\u043C\u0443\u043C \u0441\u043B\u0430\u0432\u043E\u0439",
            `\u041F\u043E\u043F\u044B\u0442\u043A\u0430 ${o + 1}: <b>${e.name}</b> (<b>${e.victoryPoints}</b>).<br>\u0418\u0449\u0435\u043C \u0434\u0430\u043B\u044C\u0448\u0435 \u0432 \u0434\u0438\u0430\u043F\u0430\u0437\u043E\u043D\u0435 (<span class="dpoints"><i></i> ${Math.floor(t - n)} ... ${t}</span>)`
          ),
            (e = await fe(o === 0));
        }
        showConfirm(
          "\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u043D\u0430\u0439\u0442\u0438 \u043F\u0440\u043E\u0442\u0438\u0432\u043D\u0438\u043A\u0430 \u0441 \u043C\u0430\u043A\u0441\u0438\u043C\u0443\u043C \u0441\u043B\u0430\u0432\u044B. \u0414\u0430\u043B\u044C\u043D\u0435\u0439\u0448\u0438\u0435 \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u044F?",
          [
            {
              title:
                "\u041F\u0440\u043E\u0434\u043E\u043B\u0436\u0438\u0442\u044C \u043F\u043E\u0438\u0441\u043A!",
              callback: Nt,
            },
            {
              title: "\u041E\u0442\u043C\u0435\u043D\u0430",
              callback: function (o) {
                closeAlert(o);
              },
            },
          ],
          {
            __title:
              "\u0411\u0435\u0437 \u0443\u0441\u043F\u0435\u0445\u0430... :(",
          }
        );
      } catch (t) {
        console.log(
          `Could not search for opponent:
`,
          t
        );
      }
    }
    function ge() {
      try {
        let t = document.querySelector(".worldtour__enemy-nickname").innerText,
          e = we(document);
        return { name: t, ...e };
      } catch {
        showAlert("Could not get opponent name.");
        return;
      }
    }
    async function fe(t = !1) {
      if (pvpTickets.boss < 50)
        throw (
          (showAlert(
            "\u0411\u0438\u043B\u0435\u0442\u044B \u0437\u0430\u043A\u0430\u043D\u0447\u0438\u0432\u0430\u044E\u0442\u0441\u044F!",
            `\u0423 \u0432\u0430\u0441 \u043E\u0441\u0442\u0430\u043B\u043E\u0441\u044C <span class="shuffle2">${pvpTickets.boss}<i></i></span> \u0431\u0438\u043B\u0435\u0442\u043E\u0432 \u0434\u043B\u044F \u041F\u043E\u0438\u0441\u043A\u0430 \u0422\u043E\u043F 20. <br> \u041F\u043E\u043F\u0440\u043E\u0431\u0443\u0439\u0442\u0435 \u043F\u043E\u0437\u0436\u0435, \u0438\u043B\u0438 \u0441\u043D\u0438\u043C\u0438\u0442\u0435 \u043E\u0433\u0440\u0430\u043D\u0438\u0447\u0435\u043D\u0438\u0435.`
          ),
          new Error("Not enough boss tickets!"))
        );
      if (pvpTickets.normal < 100)
        throw (
          (showAlert(
            "\u0411\u0438\u043B\u0435\u0442\u044B \u0437\u0430\u043A\u0430\u043D\u0447\u0438\u0432\u0430\u044E\u0442\u0441\u044F!",
            `\u0423 \u0432\u0430\u0441 \u043E\u0441\u0442\u0430\u043B\u043E\u0441\u044C <span class="shuffle">${pvpTickets.boss}<i></i></span> \u0431\u0438\u043B\u0435\u0442\u043E\u0432 \u0434\u043B\u044F \u0441\u043C\u0435\u043D\u044B \u043F\u0440\u043E\u0442\u0438\u0432\u043D\u0438\u043A\u0430. <br> \u041F\u043E\u043F\u0440\u043E\u0431\u0443\u0439\u0442\u0435 \u043F\u043E\u0437\u0436\u0435, \u0438\u043B\u0438 \u0441\u043D\u0438\u043C\u0438\u0442\u0435 \u043E\u0433\u0440\u0430\u043D\u0438\u0447\u0435\u043D\u0438\u0435.`
          ),
          new Error("Not enough normal tickets!"))
        );
      try {
        let n = await (
            await fetch("https://www.moswar.ru/travel2/", {
              headers: {
                accept:
                  "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                "accept-language": "en-US,en;q=0.9,ru;q=0.8",
                "cache-control": "max-age=0",
                "content-type": "application/x-www-form-urlencoded",
                "upgrade-insecure-requests": "1",
              },
              referrer: "https://www.moswar.ru/travel2/",
              referrerPolicy: "strict-origin-when-cross-origin",
              body: `action=roll${t ? "2" : ""}&ajax=1&__referrer=%2Ftravel2%2F&return_url=%2Ftravel2%2F`,
              method: "POST",
              mode: "cors",
              credentials: "include",
            })
          ).text(),
          o = xe(n),
          r = o.querySelector(".worldtour__enemy-nickname").innerText,
          a = we(o);
        return t ? pvpTickets.boss-- : pvpTickets.normal--, { name: r, ...a };
      } catch {
        return console.log("Could not reroll PvP."), !1;
      }
    }
    var st = { roar: -310, topot: -311, krovotok: -313, secondSelf: 363 };
    async function ct(t) {
      await fetch("https://www.moswar.ru/fight/", {
        headers: {
          "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
        },
        body: `action=useabl&json=1&target=${t}`,
        method: "POST",
        credentials: "include",
      });
    }
    async function he(t = 1) {
      return new Promise((e) => setTimeout(e, t * 1e3));
    }
    function we(t = window.document) {
      try {
        let e = +t
            .querySelector(
              "#content > div.worldtour-stats > div > p:nth-child(3) > span:nth-child(4)"
            )
            .innerText.split(" ")[0],
          n = +t
            .querySelector(
              "#content > div.worldtour-stats > div > p:nth-child(3) > span:nth-child(1)"
            )
            .innerText.split(" ")[0];
        return { maxPoints: e, victoryPoints: n };
      } catch {
        console.log("[\u{1F30E}]Could not get PvP points rewards.");
      }
    }
    function ye() {
      try {
        return +document
          .querySelector("#content > div.worldtour-stats > div > h3")
          .innerText.match(/\d+/)[0];
      } catch {
        console.log("Could not get current country index.");
      }
    }
    function mn() {
      try {
        return [...document.querySelector("#travel-2-country")]
          .pop()
          .innerText.split(".")[0];
      } catch (t) {
        console.log("Could not get max level. Error:", t);
      }
    }
    async function be() {
      console.log("[PVP] START FIGHT..."),
        await fetch("https://www.moswar.ru/travel2/", {
          headers: {
            accept: "*/*",
            "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
            "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "x-requested-with": "XMLHttpRequest",
          },
          referrer: "https://www.moswar.ru/travel2/",
          referrerPolicy: "strict-origin-when-cross-origin",
          body: "action=fight&ajax=1&__referrer=%2Ftravel2%2F&return_url=%2Ftravel2%2F",
          method: "POST",
          mode: "cors",
          credentials: "include",
        }),
        AngryAjax.reload();
    }
    function xe(t) {
      let e = new DOMParser(),
        n = t.replace(/\\&quot;/g, '"').replace(/\\"/g, '"');
      return e.parseFromString(n, "text/html");
    }
    function lt(t) {
      let e = document.createElement("div");
      return (e.innerHTML = t.trim()), e.firstChild;
    }
    async function ve() {
      AngryAjax.getCurrentUrl() !== "/travel2/" &&
        (console.log("[PVP] Not on Travel2 page. Navigating there..."),
        AngryAjax.goToUrl("/travel2/"));
      let t = ye();
      console.log(`[PVP] \u2B50\uFE0F Farming stars in ${t}.`),
        $e(),
        await be(),
        $(document).one("ajaxStop", () => setTimeout(G, 1e3)),
        $(document).one("endOfTurn", () => setTimeout(ve, 1e3));
    }
    function $e() {
      $.post("/player/checkhp/", { action: "restorehp" }, function (t) {});
    }
    async function gn(t = !1) {
      let n = await (
          await fetch("https://www.moswar.ru/travel2/", {
            headers: {
              accept:
                "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
              "accept-language": "en-US,en;q=0.9,ru;q=0.8",
              "cache-control": "max-age=0",
              "content-type": "application/x-www-form-urlencoded",
              "upgrade-insecure-requests": "1",
            },
            referrer: "https://www.moswar.ru/travel2/",
            referrerPolicy: "strict-origin-when-cross-origin",
            body: `action=roll${t ? "2" : ""}&ajax=1&__referrer=%2Ftravel2%2F&return_url=%2Ftravel2%2F`,
            method: "POST",
            mode: "cors",
            credentials: "include",
          })
        ).text(),
        o = xe(n),
        r = $(o).find(".worldtour-stats"),
        a = $(o).find(".worldtour__team.worldtour__team--right");
      $(".worldtour-stats").replaceWith(r),
        $(".worldtour__team.worldtour__team--right").replaceWith(a),
        Te();
    }
    function ke() {
      if ($("#pvp-totals").length) return;
      let t = { current: 0, max: 0 };
      $("#travel-2-country option").each(function () {
        let n = $(this)
          .text()
          .match(/(\d+)\/(\d+)/);
        n && ((t.current += Number(n[1])), (t.max += Number(n[2])));
      });
      let e = $(
        `<span id="pvp-totals" style="font-size:140%" class="dpoints">${t.current} / ${t.max}<i></i></span>`
      );
      $(".worldtour-stats__content").append(e),
        $("span.dpoints").css({ "text-shadow": "1px 1px 1px #00000073" });
    }
    function Te() {
      $(
        "#content > div.worldtour.worldtour--2.worldtour--atlantida > div.worldtour__footer > div.worldtour__footer-actions-2 button"
      ).each((t, e) => {
        $(e)
          .off("click")
          .removeAttr("onclick")
          .on("click", async () => {
            await gn(t === 1), ke();
          });
      }),
        $(".worldtour__button-border-blue .worldtour__button-small").on(
          "click",
          Se
        );
    }
    function Se() {
      let t = $(".worldtour-helpers-inner");
      t.html(t.children().slice(0, 10)),
        t.css({
          width: "auto",
          "margin-left": "0%",
          display: "flex",
          "flex-direction": "column",
          height: "100%",
        }),
        $(".worldtour__pagination").remove();
    }
    function _e() {
      if (
        (Te(),
        Se(),
        ke(),
        $(".worldtour-rating-place").css({ position: "absolute" }),
        document.querySelector(".auto-pvp"))
      ) {
        console.log("[PVP] Panel already initialized.");
        return;
      }
      let t = lt(
        '<div class="button auto-pvp" id="travel-classic-button" class="auto-pvp"><a class="f"><i class="rl"></i><i class="bl"></i><i class="brc"></i><div class="c"><span class="cool-1"><i></i>\u041F\u043E\u0438\u0441\u043A \u0421\u0438\u043B\u044C\u043D\u044B\u0445</span></div></a></div>'
      );
      t.addEventListener("click", ln);
      let e = lt(
        '<div class="button" id="travel-classic-button"><a class="f""><i class="rl"></i><i class="bl"></i><i class="brc"></i><div class="c"><span class="star"><i></i> \u0424\u0430\u0440\u043C\u0438\u0442\u044C \u0417\u0432\u0435\u0437\u0434\u044B </span></div></a></div>'
      );
      e.addEventListener("click", ve);
      let n = lt(
        '<div class="button" id="travel-classic-button"><a class="f"><i class="rl"></i><i class="bl"></i><i class="brc"></i><div class="c"><span>\u{1F3CE}\uFE0F \u0421\u043F\u0438\u0434\u0440\u0430\u043D</span></div></a></div>'
      );
      n.addEventListener("click", ue);
      let o = lt(
        '<div class="button" id="travel-classic-button"><a class="f"><i class="rl"></i><i class="bl"></i><i class="brc"></i><div class="c"><span class="dpoints"><i></i> \u041C\u0430\u043A\u0441\u0438\u043C\u0443\u043C \u0421\u043B\u0430\u0432\u044B</span></div></a></div>'
      );
      o.addEventListener("click", async () => await un()),
        $("#travel-pvp-button").after(t),
        $("#travel-pvp-button").after(o),
        $("#travel-classic-button").after(e),
        $("#travel-classic-button").after(n);
    }
    function fn(t) {
      let e = t.split("/"),
        n = e.at(-2),
        o = e.at(-1).split(".")[0];
      return [n, o];
    }
    function hn() {
      try {
        return $(".object-thumbs .object-thumb")
          .has(".action.disabled")
          .find("img")
          .attr("src");
      } catch (t) {
        console.log(
          `Could not find active tattoo.
`,
          t
        );
      }
    }
    async function Rt(t = 10) {
      let e = hn();
      for (let n = 0; n < t; n++) e && (await wn(e));
      $(document).one("ajaxStop", () => bn()),
        AngryAjax.goToUrl(AngryAjax.getCurrentUrl());
    }
    async function wn(t) {
      let [e, n] = fn(t);
      await fetch("https://www.moswar.ru/tattoo/", {
        headers: {
          accept: "*/*",
          "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
          "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-origin",
          "x-requested-with": "XMLHttpRequest",
        },
        referrer: "https://www.moswar.ru/tattoo/",
        referrerPolicy: "strict-origin-when-cross-origin",
        body: `action=tattoo_mf&honey=0&style=${e}&id=${n}&ajax=1&__referrer=%2Ftattoo%2F&return_url=%2Ftattoo%2F`,
        method: "POST",
        mode: "cors",
        credentials: "include",
      });
    }
    var yn = k({
      text: "\u262F\uFE0F x10",
      onClick: async () => {
        await Rt(10), yn.classList.remove("disabled");
      },
      title:
        "10 \u043C\u043E\u0434\u0438\u0444\u0438\u043A\u0430\u0446\u0438\u0439 \u0432\u044B\u0431\u0440\u0430\u043D\u043D\u044B\u0445 \u0442\u0430\u0442\u0443\u0438\u0440\u043E\u043A",
    });
    function bn() {
      let t = $("#tattoo-alerts");
      t.length || (t = D("tattoo-alerts")),
        $(".alert").each((e, n) => {
          t.has(n).length ||
            ($(n).css("position", "static").css("display", "inline-block"),
            $(n)
              .find("#alert-text")
              .text()
              .includes(
                "\u0443\u0441\u043F\u0435\u0448\u043D\u043E \u0443\u043B\u0443\u0447\u0448\u0438\u043B\u0438"
              ) &&
              ($(n).find("#alert-title").css("background", "green"),
              $(n).find(".close-cross").remove(),
              t.append(n)));
        });
    }
    async function xn(t) {
      let e = new DOMParser(),
        n = t.replace(/\\&quot;/g, '"').replace(/\\"/g, '"');
      return e.parseFromString(n, "text/html");
    }
    async function vn(t, e) {
      let o = await (await fetch(e)).text(),
        a = (await xn(o)).querySelectorAll(t);
      if (a.length !== 0) return a.length === 1 ? a[0] : Array.from(a);
    }
    async function $n() {
      try {
        let [t, e] = await vn(
          ".zodiak-snake-participiants",
          "https://www.moswar.ru/zodiac/"
        );
        return +t.innerText.trim().slice(-1);
      } catch {
        console.log(
          "\u2649\uFE0F \u041D\u0435 \u043D\u0430\u0448\u0435\u043B \u0431\u0438\u043B\u0435\u0442\u043E\u0432 \u0437\u043E\u0434\u0438\u0430\u043A\u0430."
        );
        return;
      }
    }
    async function kn(t = 1) {
      await fetch("https://www.moswar.ru/zodiac/", {
        headers: {
          accept: "*/*",
          "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
          "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
          "sec-fetch-site": "same-origin",
          "x-requested-with": "XMLHttpRequest",
        },
        referrer: "https://www.moswar.ru/zodiac/",
        referrerPolicy: "strict-origin-when-cross-origin",
        body: `action=buy_ticket&value=${t}&__referrer=%2Fzodiac%2F&return_url=%2Fzodiac%2F`,
        method: "POST",
        mode: "cors",
        credentials: "include",
      });
    }
    async function O(
      { count: t, intervalMin: e } = { count: 1, intervalMin: 60 }
    ) {
      let n = await $n();
      if (n === void 0)
        return showAlert(
          "\u041E\u0448\u0438\u0431\u043A\u0430",
          "\u2649\uFE0F \u041D\u0435\u0442\u0443 \u0437\u043E\u0434\u0438\u0430\u043A\u0430."
        );
      n < 1
        ? (showAlert(
            "\u0417\u043E\u0434\u0438\u0430\u043A \u2649\uFE0F",
            `\u041D\u0435 \u043D\u0430\u0448\u0435\u043B \u0431\u0438\u043B\u0435\u0442\u043E\u0432. \u041F\u043E\u043A\u0443\u043F\u0430\u044E ${t} \u0448\u0442.`
          ),
          await kn(1))
        : showAlert(
            "\u0417\u043E\u0434\u0438\u0430\u043A \u2649\uFE0F",
            `\u041D\u0430\u0448\u0435\u043B ${n} \u0431\u0438\u043B\u0435\u0442 \u0437\u043E\u0434\u0438\u0430\u043A\u0430. \u0421\u043A\u0438\u043F...`
          ),
        showAlert(
          "\u0417\u043E\u0434\u0438\u0430\u043A \u2649\uFE0F",
          `\u2649\uFE0F \u041F\u0440\u043E\u0431\u0443\u044E \u0437\u0430\u043D\u043E\u0432\u043E \u0447\u0435\u0440\u0435\u0437 ${e} \u043C\u0438\u043D\u0443\u0442(\u044B).`
        ),
        setTimeout(
          async () => await O({ count: t, intervalMin: e }),
          e * 60 * 1e3
        );
    }
    function Ae() {
      let t = _n(),
        e = $(".log > ul.fight-log .text"),
        n = $("#logs-me");
      n.length ||
        (n = $("<div id='logs-me'></div>")
          .css("display", "flex")
          .css("flexDirection", "column")),
        $(".list-users--left, .list-users--right").each(function () {
          Tn($(this));
        });
      let o = [
        {
          text: "\u0412\u043E\u0440\u043E\u043D\u043A\u0430",
          icon: "/@/images/obj/../ico/ability/tugboat.png",
        },
        {
          text: "\u043F\u0443\u0441\u043A\u0430\u0435\u0442 \u043D\u0430 \u043A\u043E\u0442\u043E\u0448\u0430\u0432\u0435\u0440\u043C\u0443 \u0441\u0435\u0440\u0434\u0438\u0442\u043E\u0433\u043E \u043A\u043E\u0442\u0438\u043A\u0430",
          icon: "/@/images/obj/../ico/ability/burrito_abil.png",
        },
        {
          text: "\u0414\u044B\u043C\u043E\u0432\u0443\u044E \u0437\u0430\u0432\u0435\u0441\u0443",
          icon: "/@/images/ico/ability/kuzn_abil.png",
        },
        {
          text: "\u041A\u043E\u043C\u043F\u044C\u044E\u0442\u0435\u0440\u043D\u044B\u0439 \u0412\u0438\u0440\u0443\u0441",
          icon: "/@/images/loc/hacker/abil_1.png",
        },
        {
          text: "\u0411\u0440\u0430\u0442 \u041C\u0438\u0445\u0430\u043B\u044B\u0447\u0430",
          condition: (l) => l.hasClass("rupor"),
          action: (l) => l.remove(),
        },
        {
          text: "\u043D\u0438\u043A\u0442\u043E \u043D\u0435 \u043F\u043E\u0441\u0442\u0440\u0430\u0434\u0430\u043B",
          action: (l) => l.remove(),
        },
        {
          text: "\u0431\u0430\u0442\u0430\u0440\u0435\u0439\u043A\u0438 \u0422\u0435\u0441\u043B\u044B",
          icon: "/@/images/ico/ability/tesla_expl.png",
        },
        {
          text: "\u0441 \u043F\u043E\u043C\u043E\u0449\u044C\u044E \u0440\u0435\u043B\u0438\u043A\u0442\u0430 \u0441\u043D\u0438\u0436\u0430\u0435\u0442 \u043A\u0440\u0443\u0442\u043E\u0441\u0442\u044C",
          icon: "/@/images/obj/relict/rock77_128.png",
        },
        {
          text: "\u043F\u043E\u0434\u0436\u0438\u0433\u0430\u0435\u0442 \u0442\u0440\u043E\u043D",
          icon: "/@/images/obj/relict/rock38_128.png",
        },
        {
          text: "\u0420\u0435\u043B\u0438\u043A\u0442 \u0434\u0435\u043B\u0430\u044E\u0442 \u0432\u0435\u043B\u0438\u043A\u0438\u043C",
          icon: "/@/images/obj/relict/rock47_128.png",
        },
        {
          text: "\u0443\u0432\u043E\u0437\u0438\u0442 \u0443 \u0438\u0433\u0440\u043E\u043A\u0430",
          icon: "/@/images/obj/cars/129-big.png",
        },
        {
          text: "\u043A\u043E\u043C\u0430\u043D\u0434\u0443\u0435\u0442 \u041E\u041C\u041E\u041D\u0443 \u0440\u0430\u0437\u0433\u043E\u043D\u044F\u0442\u044C \u043D\u0435\u0441\u043E\u0433\u043B\u0430\u0441\u043D\u044B\u0445",
          icon: "/@/images/obj/confr_ability/fight_ability6.png",
        },
        {
          text: "\u043F\u0440\u0435\u0432\u0440\u0430\u0449\u0430\u0435\u0442 \u0432 \u043A\u0443\u043A\u043B\u0443",
          icon: "/@/images/loc/squid2025/abils/6.png",
        },
        {
          text: "\u043F\u0440\u0438\u0437\u044B\u0432\u0430\u0435\u0442 \u0411\u043E\u0435\u0432\u043E\u0433\u043E \u043C\u0438\u0433\u0440\u0430\u043D\u0442\u0430, \u0440\u0430\u0437\u043C\u0430\u0445\u0438\u0432\u0430\u044F \u0422\u0440\u0443\u0434\u043E\u0432\u043E\u0439 \u043A\u043D\u0438\u0436\u043A\u043E\u0439",
          icon: "/@/images/obj/fight_item/migrant.png",
        },
        {
          text: "\u0435\u0441\u0442 \u043A\u0438\u0442\u0430\u0439\u0441\u043A\u0438 \u043F\u0435\u0447\u0435\u043D\u044C\u043A\u0438 \u0438 \u0432\u043E\u0441\u0441\u0442\u0430\u043D\u0430\u0432\u043B\u0438\u0432\u0430\u0435\u0442 \u0441\u0435\u0431\u0435",
          icon: "/@/images/loc/squid2025/abils/5.png",
        },
        {
          text: "\u0438\u0433\u0440\u0430\u0435\u0442 \u0432 \u041A\u0430\u043C\u0435\u0448\u043A\u0438",
          icon: "/@/images/loc/squid2025/abils/2.png",
        },
        {
          text: "\u0434\u0451\u0440\u0433\u0430\u0435\u0442 \u0437\u0430 \u0441\u0442\u0440\u0443\u043D\u044B!",
          icon: "/@/images/ico/ability/balalajka.png",
        },
        {
          text: "\u0434\u0435\u043B\u0430\u0435\u0442 \u043A\u0443\u0441\u044C \u043F\u0438\u0442\u043E\u043C\u0446\u0443",
          icon: "/@/images/ico/ability/wolfie_2.png",
        },
        {
          text: "\u044F\u0440\u043E\u0441\u0442\u043D\u043E \u043F\u0440\u0438\u0437\u044B\u0432\u0430\u0435\u0442 \u0432 \u0431\u043E\u0439 \u043A\u043B\u043E\u043D\u0430",
          icon: "/@/images/ico/ability/fury_7.png",
        },
        {
          text: "\u041F\u0440\u0438\u0448\u0435\u043B\u0435\u0446 \u043F\u0440\u0438\u0437\u044B\u0432\u0430\u0435\u0442 \u043D\u0430 \u043F\u043E\u043C\u043E\u0449\u044C \u043C\u0438\u043D\u0438-\u041F\u0440\u0438\u0448\u0435\u043B\u044C\u0446\u0430!",
          icon: "/@/images/ico/ability/alien_many.png",
        },
        {
          text: "\u043E\u0431\u044A\u0435\u0434\u0438\u043D\u044F\u0435\u0442 \u0442\u0440\u0435\u0445 \u043C\u0438\u043D\u0438-\u043F\u0440\u0438\u0448\u0435\u043B\u044C\u0446\u0435\u0432",
          icon: "/@/images/ico/ability/alien_uber.png",
        },
        {
          text: "\u043F\u0440\u0438\u0432\u043E\u0437\u0438\u0442 \u0432 \u0431\u043E\u0439 \u043D\u0430 \u0441\u0432\u043E\u0435\u043C \u041C\u0430\u0439\u0431\u0430\u0431\u0430\u0445\u0435",
          icon: "/@/images/obj/gifts2017/mers/invite-big.png",
        },
        {
          text: "\u043F\u0440\u043E\u0432\u043E\u0434\u0438\u0442 \u0443\u0434\u0430\u0440 \u0441 \u0431\u0435\u0441\u043F\u0438\u043B\u043E\u0442\u043D\u0438\u043A\u0430!",
          icon: "/@/images/ico/ability/bpla_abil.png",
        },
        {
          text: "\u041A\u043E\u0441\u043C\u0438\u0447\u0435\u0441\u043A\u0430\u044F \u041F\u044B\u043B\u044C \u043F\u0440\u0438\u0445\u043E\u0434\u0438\u0442 \u043D\u0430 \u043F\u043E\u043C\u043E\u0449\u044C",
          icon: "/@/images/ico/ability/cloud3.png",
        },
        {
          text: "\u0441\u0442\u0440\u0435\u043B\u044F\u0435\u0442 \u043A\u0430\u043A \u0432 \u043A\u0438\u043D\u043E",
          icon: "/@/images/ico/ability/gru_1.png",
        },
        {
          text: "\u0431\u044C\u0435\u0442 \u0441 \u043F\u043E\u043C\u043E\u0449\u044C\u044E \u043B\u0430\u043F\u0438\u0449\u0438",
          icon: "/@/images/ico/ability/lion_1.png",
        },
        {
          text: "\u043F\u0440\u0435\u0434\u044A\u044F\u0432\u0438\u0442\u044C \u0434\u043E\u043A\u0443\u043C\u0435\u043D\u0442\u044B",
          icon: "/@/images/ico/ability/tetris_abil.png",
        },
        {
          text: "\u0438\u0441\u043F\u043E\u043B\u044C\u0437\u0443\u044F \u0414\u0436\u0435\u0439\u043B \u0411\u0440\u0435\u0439\u043A, \u0441\u043D\u0438\u043C\u0430\u0435\u0442",
          icon: "/@/images/loc/hacker/abil_2.png",
        },
        {
          text: "\u041A\u0430\u0442\u0443\u0448\u043A\u0443 \u0422\u0435\u0441\u043B\u0443",
          icon: "/@/images/obj/gifts2018/car/tesla_coil_128.png",
        },
        {
          text: "\u0425\u0430\u043A\u0435\u0440 [??] \u0447\u0438\u043F\u0438\u0440\u0443\u0435\u0442",
          icon: "/@/images/ico/ability/bigbro_2.png",
        },
        {
          text: "\u0425\u0430\u043A\u0435\u0440 \u043C\u043E\u0431\u0438\u043B\u0438\u0437\u0443\u0435\u0442\u0441\u044F \u0438 \u043F\u0440\u0438\u0445\u043E\u0434\u0438\u0442 \u043D\u0430 \u043F\u043E\u043C\u043E\u0449\u044C",
          icon: "/@/images/loc/hacker/abil_6.png",
        },
        {
          text: "\u0441\u0442\u0430\u043D\u043E\u0432\u0438\u0442\u0441\u044F \u0411\u043E\u0441\u0441\u043E\u043C",
          icon: "/@/images/loc/squid2025/abils/3.png",
        },
        {
          text: "\u0433\u0440\u043E\u043C\u043A\u043E \u0447\u0438\u0442\u0430\u0435\u0442 QR-\u043A\u043E\u0434",
          icon: "/@/images/ico/ability/bigbro_3.png",
        },
        {
          text: "\u043F\u0440\u0438\u0437\u044B\u0432\u0430\u0435\u0442 \u0441\u0438\u043B\u044C\u043D\u0435\u0439\u0448\u0438\u0445 \u0434\u0443\u0445\u043E\u0432 \u0441\u043E\u043F\u0435\u0440\u043D\u0438\u043A\u043E\u0432",
          icon: "/@/images/ico/ability/abil_shaman_ultra.png",
        },
        { text: "\u041C\u044D\u0440", icon: "/@/images/ico/ability/major.png" },
        {
          text: "\u041C\u043E\u0441\u0413\u043E\u0441\u0421\u0442\u0440\u0430\u0445!",
          icon: "/@/images/obj/relict/rock72_128.png",
        },
        {
          text: "\u041F\u044B\u043B\u0430\u044E\u0449\u0438\u0439 \u0441\u043B\u0435\u0434",
          icon: "/@/images/ico/ability/car220.png",
        },
        {
          text: "\u0438\u0441\u043F\u043E\u043B\u044C\u0437\u0443\u0435\u0442 \u0434\u0443\u0431\u0438\u043D\u043E\u0447\u043A\u0443 \u0438 \u043D\u0430\u043D\u043E\u0441\u0438\u0442 50% \u0443\u0440\u043E\u043D\u0430",
          icon: "/@/images/ico/ability/omon_weapon.png",
        },
        {
          text: "\u043F\u0440\u0438\u0437\u044B\u0432\u0430\u0435\u0442 \u0428\u0442\u0443\u0440\u043C\u043E\u0432\u0438\u043A\u0430, \u0440\u0430\u0437\u043C\u0430\u0445\u0438\u0432\u0430\u044F \u0443\u0434\u043E\u0441\u0442\u043E\u0432\u0435\u0440\u0435\u043D\u0438\u0435\u043C",
          icon: "/@/images/obj/fight_item/migrant4_128.png",
        },
        {
          text: "\u0432\u044B\u0441\u0430\u0436\u0438\u0432\u0430\u0435\u0442 \u0432 \u0431\u043E\u0439 \u0414\u0435\u0441\u0430\u043D\u0442",
          icon: "/@/images/ico/ability/heli_cage.png",
        },
        {
          text: "\u0432\u043E\u0437\u0432\u0440\u0430\u0449\u0430\u0435\u0442\u0441\u044F \u0438 \u0441\u0431\u0440\u0430\u0441\u044B\u0432\u0430\u0435\u0442 \u0411\u0430\u043B\u043B\u0430\u0441\u0442",
          icon: "/@/images/ico/ability/afg.png",
        },
        {
          text: "\u043F\u0440\u043E\u043B\u0435\u0442\u0430\u0435\u0442 \u043D\u0430 \u0434\u0436\u0435\u0442\u0435 \u0438 \u0443\u0432\u0435\u043B\u0438\u0447\u0438\u0432\u0430\u0435\u0442 \u0441\u0432\u043E\u044E \u043C\u0430\u043A\u0441\u0438\u043C\u0430\u043B\u044C\u043D\u0443\u044E \u044F\u0440\u043E\u0441\u0442\u044C",
          icon: "/@/images/obj/cars/361-big.png",
        },
        {
          text: "\u043F\u0440\u043E\u0433\u043E\u043D\u044F\u0435\u0442 \u0432\u0441\u0435\u0445 \u0432\u0442\u043E\u0440\u044B\u0445 \u043F\u0438\u0442\u043E\u043C\u0446\u0435\u0432",
          icon: "/@/images/obj/../ico/ability/burrito_abil.png",
        },
        {
          text: "\u041F\u0440\u0438\u0448\u0435\u043B\u0435\u0446 \u0437\u0430\u0440\u0430\u0436\u0430\u0435\u0442 \u043F\u0430\u0440\u0430\u0437\u0438\u0442\u043E\u043C",
          icon: "/@/images/ico/ability/alien_par.png",
        },
        {
          text: "\u041C\u0430\u0440\u0441\u0438\u0430\u043D\u0438\u043D",
          icon: "/@/images/loc/mars/abils/abil5.png",
        },
        {
          text: "\u0440\u0430\u043A\u0435\u0442\u0443 DIY",
          icon: "/@/images/loc/rocket/rocket.png",
        },
        {
          text: "\u0433\u043E\u0440\u044F\u0447\u0443\u044E \u043A\u0430\u0440\u0442\u043E\u0448\u043A\u0443",
          icon: "/@/images/loc/mars/potato@2x.png",
        },
        {
          text: "\u0433\u0438\u043F\u043D\u043E\u0442\u0438\u0437\u0438\u0440\u0443\u0435\u0442",
          icon: "/@/images/ico/ability/abys_abil.png",
        },
        {
          text: "\u0422\u0438\u0442\u0430\u043D\u043E\u0441 \u0434\u0435\u043B\u0430\u0435\u0442 \u0432\u0435\u043B\u0438\u043A\u0438\u043C",
          icon: "/@/images/loc/tanos/talant_3.png",
        },
        {
          text: "\u0440\u043E\u0439 \u043F\u0447\u0451\u043B",
          icon: "/@/images/obj/bear_ability/bear_ability_1.png",
        },
        {
          text: "\u0440\u043E\u0439 \u043F\u0447\u0451\u043B",
          icon: "/@/images/obj/bear_ability/bear_ability_1.png",
        },
        {
          text: "\u0411\u041F\u041B\u0410",
          icon: "/@/images/obj/cars/338-big.png",
        },
        {
          text: "\u043F\u0440\u044F\u0447\u0435\u0442\u0441\u044F \u043F\u043E\u0434 \u043A\u0440\u044B\u043B\u043E\u043C \u0441\u0430\u043C\u043E\u043B\u0451\u0442\u0430 \u0438 \u0435\u0433\u043E \u0437\u0434\u043E\u0440\u043E\u0432\u044C\u0435 \u043D\u0435 \u043F\u0430\u0434\u0430\u0435\u0442 \u043D\u0438\u0436\u0435",
          icon: "/@/images/obj/cars/319-big.png",
        },
        {
          text: "\u043A\u0443\u0431\u0440\u0438\u043A-\u0440\u0443\u0431\u0438\u043A\u0430",
          icon: "/@/images/obj/gifts2025/ny/rubik/8_256.png",
        },
      ];
      function r(l, p) {
        return p || console.log(l), p.split(/\s+/).every((d) => l.includes(d));
      }
      let a = $("<div>").css({
          display: "flex",
          flexDirection: "column",
          gap: "8px",
        }),
        s = new Map();
      e.children().each(function () {
        let l = $(this),
          p = l.text();
        for (let { text: d, icon: g, action: u, condition: w } of o)
          r(p, d) &&
            (!w || w(l)) &&
            (d.includes("") &&
              (s.has(d) ||
                s.set(
                  d,
                  Ft({
                    toggleText: `<img src="${g}" style="height:64px; width: 64px;" class="ability-log-icon" />`,
                    items: [],
                    className: "ability-log-container",
                    isOpen: !1,
                  })
                )),
            g && Sn(l, g),
            u && u(l),
            s.get(d).append(l));
        t &&
          p.includes(t) &&
          !p.toLowerCase().includes("\u043A\u043B\u043E\u043D") &&
          n.append(l);
      }),
        s.forEach((l) => a.append(l)),
        e.append(a);
      let c = Ft({
        toggleText: "\u041C\u043E\u0438 \u043B\u043E\u0433\u0438",
        className: "me-logs",
        items: [n],
        isOpen: !0,
      }).css({
        outline: "4px inset lightseagreen",
        borderRadius: "2px",
        padding: "6px 0px",
      });
      !$(".me-logs").length && n.length > 0 && e.prepend(c);
    }
    function Tn(t) {
      var e = $("<div>").css("display", "flex").css("flexDirection", "column"),
        n,
        o = [],
        r = [],
        a = [];
      t.find("li").each(function () {
        var s = $(this),
          c = s.find(".player-rage");
        if (c.length) {
          var l = parseFloat(c.find(".percent").css("width"));
          s.hasClass("me")
            ? (n = s)
            : s.hasClass("dead")
              ? o.push(s)
              : s
                    .find(".user")
                    .text()
                    .includes(
                      "\u0411\u0440\u0430\u0442 \u041C\u0438\u0445\u0430\u043B\u044B\u0447\u0430"
                    )
                ? a.push({ li: s, rage: l })
                : r.push({ li: s, rage: l });
        }
      }),
        r.sort(function (s, c) {
          return c.rage - s.rage;
        }),
        a.sort(function (s, c) {
          return c.rage - s.rage;
        }),
        n && e.prepend(n),
        r.forEach(function (s) {
          e.append(s.li);
        }),
        a.forEach(function (s) {
          e.append(s.li);
        }),
        o.forEach(function (s) {
          e.append(s);
        }),
        t.prepend(e);
    }
    function Sn(t, e) {
      t.css({ display: "flex", alignItems: "center", gap: "4px" });
      let n = $("<img>").attr("src", e).css({ width: "32px", height: "32px" }),
        o = $("<span>").html(t.html());
      t.empty().append(n).append(o);
    }
    function _n() {
      return $(".me .user a[href*='player']")?.text();
    }
    function D(t, e = "") {
      let n = $(`#${t}`);
      if (!n.length) {
        (n = $("<div>", { id: t }).css({
          position: "fixed",
          width: "50%",
          top: "30%",
          left: "50%",
          transform: "translateX(-50%)",
          minHeight: "35vh",
          "overflow-y": "auto",
          "overflow-x": "hidden",
          display: "flex",
          "flex-wrap": "wrap",
          "justify-content": "center",
          "align-items": "center",
          gap: "10px",
          padding: "10px",
          "border-radius": "8px",
          background: "rgba(0, 0, 0, 0.8)",
          "box-shadow": "0px 4px 10px rgba(0, 0, 0, 0.3)",
          "z-index": 9999,
          "scrollbar-width": "thin",
          "pointer-events": "auto",
          border: "none",
        })),
          e && n.attr("style", `${n.attr("style")}; ${e}`);
        let o = k({
            text: "X",
            onClick: () => {
              n.remove(), AngryAjax.reload();
            },
            title:
              "\u0417\u0430\u043A\u0440\u044B\u0442\u044C \u043E\u043A\u043D\u043E",
          }),
          r = $(o).css({ position: "absolute", top: "2%", right: "2%" });
        n.append(r), $("body").prepend(n);
      }
      return n;
    }
    var An = [
        {
          text: "\u{1F354}",
          title:
            "\u0420\u0430\u0431\u043E\u0442\u0430 \u0438 \u043F\u0430\u0442\u0440\u0443\u043B\u044C",
          onClick: async () => {
            await U(1), await P(10);
          },
        },
        {
          text: "\u{1F400}",
          title:
            "\u041A\u0440\u044B\u0441\u044B \u0430\u0432\u0442\u043E\u043F\u0438\u043B\u043E\u0442",
          onClick: async () => await C(5),
        },
        {
          text: "\u{1F4B5}",
          title:
            "\u041F\u043E\u043A\u0430\u0437\u0430\u0442\u044C \u0432\u0430\u043B\u044E\u0442\u0443",
          className: "show-currency",
          onClick: async (t) => {
            let e = t.currentTarget,
              n = await Cn();
            $("#currency-container").length
              ? $("#currency-container").replaceWith(n)
              : (n.hide(), $(e).parent().append(n), n.slideToggle());
          },
          disableAfterClick: !1,
        },
        {
          text: "\u2649\uFE0F",
          title: "\u0417\u043E\u0434\u0438\u0430\u043A",
          onClick: async () => await O(),
        },
        {
          text: "\u{1F52E}",
          title: "\u0421\u0438\u0440\u0438",
          onClick: async () => await ot(),
        },

        // ПРОБУЮ ИСПРАВИТЬ 10 БОЕВ

         {
          text: "\u{1F44A}",
          title:
            "10 \u0431\u043E\u0435\u0432 \u0432 \u0437\u0430\u043A\u043E\u0443\u043B\u043A\u0438 (\u041D\u0423\u0416\u0415\u041D \u041C\u0410\u0416\u041E\u0420)",
          onClick: async () => await St(),

          disableAfterClick: !1,
        },
        {
          text: '<img src="/@/images/obj/jobs/item6.png" style="width: 16px; height: 16px; transform: scale(1.5);">',
          onClick: nt,
          title:
            "\u041A\u0443\u0448\u0430\u0442\u044C \u0441\u043D\u0438\u043A\u0435\u0440\u0441",
          disableAfterClick: !1,
        },

        // ТУТ КОНЕЦ КОДА ДЛЯ 10 БОЕВ
       // НАЧАЛО АВТОБОЙ


        /// КОНЕЦ АВТОБОЙ

        // КЛИК ТУРЕЛИ

        /// КЛИК ТУРЕЛИ

        {
          text: "\u{1F93A}",
          title:
            "\u0417\u0430\u043F\u0438\u0441\u044C \u043D\u0430 \u0445\u0430\u043E\u0442 \u0437\u0430 30 \u0441\u0435\u043A\u0443\u043D\u0434 \u0434\u043E \u0431\u043E\u044F, \u043A\u0430\u0436\u0434\u044B\u0435 15 \u043C\u0438\u043D\u0443\u0442.",
          onClick: At,
        },
        {
          text: "\u{1F454}",
          title: `\u0417\u0430\u043F\u0438\u0441\u044C \u043D\u0430 \u043F\u0440\u043E\u0442.
(\u0412\u043E\u043A\u0437\u0430\u043B\u044C\u043D\u044B\u0439)`,
          onClick: Bt,
          disableAfterClick: !1,
        },

        /// ПРИЛИВ БОДРОСТИ



        /// КОНЕЦ ПРИЛИВ БОДРОСТИ

        // КОЛЛЕКЦИЯ ЩЕЛКУНЧИКА



       /// КОНЕЦ КОЛЛЕКЦИЯ ЩЕЛКУНЧИКА

      ],
      jn = [
        {
          href: "/dungeon",
          text: "\u{1F573}\uFE0F \u041F\u043E\u0434\u0437\u0435\u043C\u043A\u0430",
        },
        {
          href: "/neftlenin/",
          text: "\u{1F6E2}\uFE0F \u041D\u0435\u0444\u0442\u044C",
        },
        { href: "/metro/", text: "\u{1F400} \u041A\u0440\u044B\u0441\u044B" },
        { href: "/square/tvtower/", text: "\u{1F4FA} \u0422\u0412" },
        { href: "/nightclub/", text: "\u{1FAA9} \u041A\u043B\u0443\u0431" },
        {
          href: "/butovo/",
          text: "\u{1F3D9}\uFE0F \u0411\u0443\u0442\u043E\u0432\u043E"
            },
        {
          href: "/camp/gypsy/",
          text: "\u2728 \u0426\u044B\u0433\u0430\u043D\u043A\u0430",
        },
        {
          href: "/berezka/section/mixed/",
          text: "\u{1F6CD}\uFE0F \u0411\u0435\u0440\u0435\u0437\u043A\u0430",
        },
        {
          href: "/metrowar/clan/",
          text: "\u{1F687} \u041C\u0435\u0442\u0440\u043E\u0432\u0430\u0440",
        },

        {
          href: "/sovet/career/",
          text: "\u{1F454} \u0413\u043E\u0441\u041F\u0440\u043E\u043C",
        },
        { href: "/petarena/", text: "\u{1F9AE} \u041F\u0435\u0442\u044B" },
        { href: "/travel2/", text: "\u{1F30D} \u0420\u0435\u0439\u0434\u044B" },
        {
          href: "/automobile/ride/",
          text: "\u{1F695} \u041F\u043E\u0435\u0437\u0434\u043A\u0430",
        },
      ];
    async function Et() {
      try {
        let t = $('<div id="assistant-container"></div>').css({
          position: "absolute",
          display: "flex",
          maxWidth: "120px",
          maxHeight: "600px",
          height: "auto",
          gap: "20px",
          flexDirection: "column",
          alignItems: "flex-end",
          backgroundColor: "rgb(255, 244, 225)",
          top: "258px",
          padding: "12px 10px",
          borderWidth: "2px",
          borderStyle: "solid",
          borderColor: "rgb(209, 148, 92)",
          borderRadius: "12px",
          zIndex: "999999",
        });
        $(".body-bg").append(t),
          t.hide(),
          $(document).on("click", () => t.hide()),
          t.on("click", (n) => n.stopPropagation()),
          $(document).on("contextmenu", (n) => {
            n.preventDefault(),
              t.css({ left: n.pageX, top: n.pageY }).slideToggle("fast");
          });
        let e = $('<div id="assistant-autopilot"></div>').css({
          display: "flex",
          gap: "8px",
          width: "100%",
          minWidth: "80px",
          flexWrap: "wrap",
          justifyContent: "space-around",
        });
        An.forEach(
          ({
            text: n,
            title: o,
            onClick: r,
            condition: a,
            disableAfterClick: s,
          }) => {
            if (a === !1) return;
            let c = k({ text: n, title: o, onClick: r, disableAfterClick: s });
            e.append(c);
          }
        ),
          t.append(e);
      } catch (t) {
        console.log(
          `\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u043D\u0430\u0440\u0438\u0441\u043E\u0432\u0430\u0442\u044C \u043F\u0430\u043D\u0435\u043B\u044C \u043D\u0430\u0432\u0438\u0433\u0430\u0446\u0438\u0438.
`,
          t
        );
      }
    }
    async function Ht() {
      if ($("#navbar-links").length > 0) return;
      let t = $('<div id="navbar-links" class="borderdata"></div>').css({
        display: "flex",
        justifyContent: "center",
        flexWrap: "wrap",
        gap: "20px 60px",
        alignItems: "center",
        padding: "10px 20px",
        zIndex: "102",
        border: "none",
      });
      jn.forEach(({ href: n, text: o, onClick: r }) => {
        let a = $("<a></a>").text(o).css("text-decoration", "none");
        r
          ? a.attr("href", "#").on("click", (s) => {
              s.preventDefault(), r();
            })
          : a.attr({
              href: n,
              onclick: "return AngryAjax.goToUrl(this, event);",
            }),
          t.append(a);
      }),
        $("#main").children().eq(1).before(t);
    }
    async function Cn() {
      let t = await f(
          ".borderdata",
          "https://www.moswar.ru/berezka/section/mixed/"
        ),
        e = $('<div id="currency-container"></div>');
      e.css({
        width: "100%",
        "min-width": "120px",
        display: "flex",
        "flex-wrap": "wrap",
        gap: "12px 2px",
        "justify-content": "space-between",
      });
      let n = [...Array.from(t.children)].map((o) => {
        let r = o.innerText,
          a = parseInt(r.replace(/[^0-9]/g, ""), 10);
        return (
          isNaN(a) ||
            ((o.title = r),
            (o.innerHTML = Q(a) + o.querySelector("i").outerHTML)),
          $(o).css({ display: "inline-flex", alignItems: "center" }),
          o
        );
      });
      return e.empty().append(n), e;
    }
    async function dt() {
      if (AngryAjax.getCurrentUrl() !== "/player/") {
        console.log("[redrawMain] Not on /player page.");
        return;
      }
      location.pathname.search(/\/player\/$/) !== -1 && je();
      function t() {
        (document.querySelector(
          "#content > table.inventary > tbody > tr > td.equipment-cell > div"
        ).style.width = "577px"),
          (document.querySelector(
            "#content > table.inventary > tbody > tr > td.equipment-cell > div > dl"
          ).style.width = "577px"),
          (document.querySelector(
            "#content > table.inventary > tbody > tr > td.equipment-cell > div > dl > dd"
          ).style.width = "577px");
      }
      function e() {
        if (
          ((document.querySelector("#dopings-accordion").style.width = "80px"),
          (document.querySelector("#dopings-accordion > dd").style.width =
            "80px"),
          $("#dopings-accordion > dd > .object-thumbs").css({
            height: "955.5px",
          }),
          $(".action.use-all-siri").length)
        )
          return;
        let r = $(`
      <div class="action use-all-siri"><span>\u043E\u0431\u043C\u0435\u043D \u0432\u0441\u0435</span></div>
    `);
        r.on("click", async () => {
          r.hasClass("disabled") ||
            (r.addClass("disabled"), await jt(), r.removeClass("disabled"));
        }),
          $(
            '.object-thumbs[htab="inventory"] img[src="/@/images/obj/phones/siri_64.png"]'
          )
            .parent()
            .append(r);
      }
      function n() {
        (document.querySelector("#pet-accordion").style.width = "220px"),
          (document.querySelector(
            "#pet-accordion > dd > div.object-thumbs"
          ).style.width = "220px");
      }
      let o = document.querySelector(
        "#content > table.inventary > tbody > tr > td.equipment-cell > div > dl > dd > div:nth-child(1)"
      );
      e(),
        t(),
        n(),
        je(),
        Fn(),
        o &&
          o.offsetHeight < 300 &&
          (console.log("[i] toggle inventory expand"),
          inventaryExpand.toggle());
    }
    var je = function () {
        typeof localStorage.mw_alerts > "u" && (localStorage.mw_alerts = "[]");
        let alertsData = JSON.parse(localStorage.mw_alerts);
        if (alertsData.length > 0) {
          for (var i in alertsData)
            showAlert(
              "\u041E\u043F\u043E\u0432\u0435\u0449\u0435\u043D\u0438\u0435",
              alertsData[i]
            );
          (alertsData = []), (localStorage.mw_alerts = "[]");
        }
        (window.parseData = function (t, e) {
          var n = JSON.parse(t);
          console.log(n);
          var o = new Array();
          for (var r in n.alerts) o.push(n.alerts[r].text);
          for (var a in n.inventory)
            if ("inventory-" + n.inventory[a].code + "-btn" == e) {
              var s = { id: n.inventory[a].id, alerts: o };
              return s;
            }
          var s = { alerts: o };
          return s;
        }),
          (window.parseDataItem = function (t, e) {
            var n = JSON.parse(t);
            console.log(n);
            var o = new Array();
            for (var r in n.alerts) o.push(n.alerts[r].text);
            for (var a in n.inventory)
              if ("/@/images/obj/" + n.inventory[a].image == e) {
                var s = { id: n.inventory[a].id, alerts: o };
                return s;
              }
            var s = { alerts: o };
            return s;
          }),
          (window.buyNextGift = function (t, e, n, o, r, a) {
            typeof r > "u" &&
              (r = "\u041F\u043E\u0434\u0430\u0440\u043E\u043A"),
              t > 0
                ? $.get("/player/json/" + o + "/" + e + "/", function (s) {
                    moswar.showPopup(
                      r + " \u043E\u0442\u043A\u0440\u044B\u0442!",
                      "\u041E\u0441\u0442\u0430\u043B\u043E\u0441\u044C: " +
                        (t - 1),
                      4e3
                    );
                    var c = parseData(s, n);
                    if (typeof c.id < "u") {
                      var l = JSON.parse(localStorage.mw_alerts);
                      for (var p in c.alerts) l.push(c.alerts[p]);
                      (localStorage.mw_alerts = JSON.stringify(l)),
                        buyNextGift(t - 1, c.id, n, o, r, a);
                    } else {
                      var l = JSON.parse(localStorage.mw_alerts);
                      for (var p in c.alerts) l.push(c.alerts[p]);
                      (localStorage.mw_alerts = JSON.stringify(l)),
                        a == "1"
                          ? ((localStorage.listGiftsN =
                              Number(localStorage.listGiftsN) - 1),
                            Number(localStorage.listGiftsN) < 1 &&
                              setTimeout("AngryAjax.goToUrl('/player/');", 1e3))
                          : setTimeout("AngryAjax.goToUrl2('/player/');", 2e3);
                    }
                  })
                : a == "1"
                  ? ((localStorage.listGiftsN =
                      Number(localStorage.listGiftsN) - 1),
                    Number(localStorage.listGiftsN) < 1 &&
                      setTimeout("AngryAjax.goToUrl2('/player/');", 1e3))
                  : setTimeout("AngryAjax.goToUrl2('/player/');", 2e3);
          });
        var buyNextItem = function (t, e, n, o, r, a) {
          typeof r > "u" && (r = "\u041F\u0440\u0435\u0434\u043C\u0435\u0442"),
            t > 0
              ? $.get("/player/json/" + o + "/" + e + "/", function (s) {
                  moswar.showPopup(
                    r + " \u043E\u0442\u043A\u0440\u044B\u0442!",
                    "\u041E\u0441\u0442\u0430\u043B\u043E\u0441\u044C: " +
                      (t - 1),
                    4e3
                  );
                  var c = parseDataItem(s, n);
                  if (typeof c.id < "u") {
                    var l = JSON.parse(localStorage.mw_alerts);
                    for (var p in c.alerts) l.push(c.alerts[p]);
                    (localStorage.mw_alerts = JSON.stringify(l)),
                      buyNextItem(t - 1, c.id, n, o, r, a);
                  } else {
                    var l = JSON.parse(localStorage.mw_alerts);
                    for (var p in c.alerts) l.push(c.alerts[p]);
                    (localStorage.mw_alerts = JSON.stringify(l)),
                      a == "1"
                        ? ((localStorage.listGiftsN =
                            Number(localStorage.listGiftsN) - 1),
                          Number(localStorage.listGiftsN) < 1 &&
                            setTimeout("AngryAjax.goToUrl2('/player/');", 1e3))
                        : setTimeout("AngryAjax.goToUrl2('/player/');", 2e3);
                  }
                })
              : a == "1"
                ? ((localStorage.listGiftsN =
                    Number(localStorage.listGiftsN) - 1),
                  Number(localStorage.listGiftsN) < 1 &&
                    setTimeout("AngryAjax.goToUrl2('/player/');", 1e3))
                : setTimeout("AngryAjax.goToUrl2('/player/');", 2e3);
        };
        (window.multOpenGift = function (t) {
          var e = $(t).parent().parent().find("img").attr("data-id"),
            n = $(t).parent().parent().find(".action").attr("id"),
            o = $(t).parent().parent().find(".action").attr("data-action"),
            r = [];
          r.push({
            title: "\u041E\u0442\u043A\u0440\u044B\u0442\u044C",
            callback: function (a) {
              (alertsData = []),
                buyNextGift(
                  $("#multbuy").attr("value"),
                  e,
                  n,
                  o,
                  m.items[e].info.title,
                  "0"
                ),
                closeAlert(a);
            },
          }),
            r.push({
              title: "\u041E\u0442\u043C\u0435\u043D\u0430",
              callback: null,
            }),
            showConfirm(
              '<p align="center">\u041A\u043E\u043B\u0438\u0447\u0435\u0441\u0442\u0432\u043E: <input id="multbuy" value="' +
                $(t)
                  .parent()
                  .parent()
                  .find(".count")
                  .text()
                  .replace(/#/gi, "") +
                '"></p>',
              r,
              {
                __title:
                  "\u041E\u0442\u043A\u0440\u044B\u0442\u044C \u043C\u043D\u043E\u0433\u043E :)",
              }
            );
        }),
          (window.multOpenItem = function (t) {
            var e = $(t).parent().parent().find("img").attr("data-id"),
              n = $(t).parent().parent().find("img").attr("src"),
              o = $(t).parent().parent().find(".action").attr("data-action"),
              r = [];
            r.push({
              title: "\u041E\u0442\u043A\u0440\u044B\u0442\u044C",
              callback: function (a) {
                (alertsData = []),
                  buyNextItem(
                    $("#multbuy").attr("value"),
                    e,
                    n,
                    o,
                    m.items[e].info.title,
                    "0"
                  ),
                  closeAlert(a);
              },
            }),
              r.push({
                title: "\u041E\u0442\u043C\u0435\u043D\u0430",
                callback: null,
              }),
              showConfirm(
                '<p align="center">\u041A\u043E\u043B\u0438\u0447\u0435\u0441\u0442\u0432\u043E: <input id="multbuy" value="' +
                  $(t)
                    .parent()
                    .parent()
                    .find(".count")
                    .text()
                    .replace(/#/gi, "") +
                  '"></p>',
                r,
                {
                  __title:
                    "\u041E\u0442\u043A\u0440\u044B\u0442\u044C \u043C\u043D\u043E\u0433\u043E :)",
                }
              );
          }),
          (window.initializePlayerPageEnhancements = function () {
            window.enhancePetItems(),
              window.enhanceEquipmentItems(),
              window.handleInventoryEnhancements();
          }),
          (window.enhancePetItems = function () {
            $('.object-thumb img[data-type="pet"]').each(function () {
              let t = $(this);
              if (
                t
                  .parent()
                  .find(".action")
                  .attr("onclick")
                  .match(/train\/\d+\/'/)
              ) {
                let n = t.attr("data-id"),
                  r = `\u0412\u0430\u0448 \u043F\u0438\u0442\u043E\u043C\u0435\u0446 ${m.items[n].info.title.replace(/"/g, "")} \u0441\u0434\u0435\u043B\u0430\u043D \u0430\u043A\u0442\u0438\u0432\u043D\u044B\u043C!`,
                  s = `
          <div style="position: absolute">
            <span class="agree" onclick="${`petarenaSetActive(${n}, 'battle'); moswar.showPopup('\u041F\u0438\u0442\u043E\u043C\u0435\u0446', '${r}', 5000);`}" style="cursor: pointer">
              <i></i>
            </span>
          </div>`;
                t.parent().prepend(s);
              }
            });
          }),
          (window.enhanceEquipmentItems = function () {
            $('.equipment-cell .object-thumb .action[data-action="use"]').each(
              function () {
                let t = $(this);
                t.prev(".multi-open").length === 0 &&
                  t.parent().prepend(`
          <b class="multi-open" style="cursor: pointer; background-color: #fdf179; color: green; font-size: 11px; position: absolute; margin: 0 1px;" onclick="multOpenItem(this);">
            [#]
          </b>`);
              }
            ),
              $('.equipment-cell .object-thumb img[data-type="gift"]').each(
                function () {
                  let t = $(this);
                  t.prev(".multi-open").length === 0 &&
                    t.next(".count").length === 1 &&
                    t.before(`
          <b class="multi-open" style="cursor: pointer; background-color: #fdf179; color: green; font-size: 11px; position: absolute; margin: 0 1px;" onclick="multOpenGift(this);">
            [#]
          </b>`);
                }
              );
          }),
          (window.handleInventoryEnhancements = function () {
            setTimeout(() => {
              moveInventoryItemsToCategories();
            }, 150);
          }),
          (window.moveInventoryItemsToCategories = function () {
            let t = '.object-thumbs[htab="inventory"]',
              e = '.object-thumbs[htab="clothes"]';
            $(`${t} img[src$="box_perfume.png"],
       ${t} img[src$="gift-wolf.png"],
       ${t} img[src$="gold_phone_cert.png"],
       ${t} img[src$="eye_phone_cert.png"]`)
              .parents(".object-thumb")
              .appendTo(t),
              $(`${e} img[data-type="talisman"],
       ${e} img[data-type="cologne"]`)
                .parents(".object-thumb")
                .prependTo(e),
              $(`${e} img[data-type="phone"]`)
                .parents(".object-thumb")
                .appendTo(e);
          }),
          location.pathname.endsWith("/player/") &&
            (eval(
              "AngryAjax.goToUrl2 = " +
                AngryAjax.goToUrl
                  .toString()
                  .replace("url = url.replace('#', '');", "")
            ),
            initializePlayerPageEnhancements());
      },
      Fn = function () {
        typeof window.GM_deleteValue > "u" &&
          ((window.GM_addStyle = (t) => {
            let e = document.createElement("style");
            (e.textContent = t), document.head.appendChild(e);
          }),
          (window.GM_deleteValue = (t) => {
            localStorage.removeItem(t);
          }),
          (window.GM_getValue = (t, e) => {
            let n = localStorage.getItem(t);
            if (n === null) return e;
            let o = n.charAt(0),
              r = n.slice(1);
            switch (o) {
              case "b":
                return r === "true";
              case "n":
                return Number(r);
              default:
                return r;
            }
          }),
          (window.GM_log = (t) => {
            console.log(t);
          }),
          (window.GM_openInTab = (t) => {
            window.open(t, "_blank");
          }),
          (window.GM_registerMenuCommand = (t, e) => {}),
          (window.GM_setValue = (t, e) => {
            let n;
            if (typeof e == "boolean") n = "b";
            else if (typeof e == "number") n = "n";
            else if (typeof e == "string") n = "s";
            else throw new Error("Unsupported value type");
            let o = `${n}${e}`;
            localStorage.setItem(t, o);
          }));
        function getCurrentLocation() {
          var t = $(".heading:first h2 span"),
            e =
              t.length > 0
                ? t[0].getAttribute("class")
                : $(".heading:first h2").html();
          return e;
        }
        function getRealDoc() {
          var t = top.document.getElementById("game-frame");
          return t ? t.contentWindow.document : top.document;
        }
        function renderEatDopsButton() {
          let t = Adoc.getElementById("dopings-accordion");
          if (
            !Adoc.getElementById("eat-button") &&
            getCurrentLocation() === "pers" &&
            t
          ) {
            let e = document.createElement("div");
            (e.className = "button"),
              (e.id = "eat-button"),
              (e.innerHTML = `
        <span class="f">
          <i class="rl"></i>
          <i class="bl"></i>
          <i class="brc"></i>
          <div id="aicheck" class="c">\u041E\u0431\u043E\u0436\u0440\u0430\u0442\u044C\u0441\u044F</div>
        </span>
      `),
              $('div[htab="dopings"]').before(e),
              e.addEventListener("click", selectDops, !1),
              setTimeout(() => {
                eatDops();
              }, 1e3);
          }
        }
        function selectDops() {
          if (
            getCurrentLocation() == "pers" &&
            Adoc.getElementById("dopings-accordion")
          ) {
            var t = document.createElement("DIV");
            t.setAttribute(
              "style",
              "display: block; top: 300px; width: 468px;"
            ),
              t.setAttribute("class", "alert  alert1"),
              (t.id = "alert-main");
            var e = document.createElement("DIV");
            e.setAttribute("class", "padding"), t.appendChild(e);
            var n = document.createElement("H2");
            (n.innerHTML =
              "\u0412\u044B\u0431\u0440\u0430\u0442\u044C \u0434\u043E\u043F\u044B"),
              e.appendChild(n);
            var o = document.createElement("DIV");
            o.setAttribute("class", "data");
            var r = document.createElement("DIV");
            o.appendChild(r), e.appendChild(o);
            for (
              var a = Adoc.getElementById("dopings-accordion").cloneNode(!0),
                s = a.getElementsByClassName("object-thumb");
              s.length > 0;

            ) {
              var c = document.createElement("DIV");
              c.setAttribute(
                "style",
                "margin: 4px 1px 2px 2px;height: 72px; width: 72px;float:left;"
              ),
                c.setAttribute("name", "backGroundDiv");
              var d = s[0].getElementsByClassName("action")[0],
                l = s[0]
                  .getElementsByClassName("padding")[0]
                  .getElementsByTagName("img")[0];
              if (d) {
                if (d.className == "action disabled")
                  c.style.backgroundColor = "red";
                else {
                  var p =
                    "$.get('/player/json/" +
                    d.getAttribute("data-action") +
                    "/" +
                    l.getAttribute("data-id") +
                    "/', function(){moswar.showPopup('\u0413\u043E\u0442\u043E\u0432\u043E',m.items[" +
                    l.getAttribute("data-id") +
                    "].info.title, 2000);GM_setValue('listDopsN', Number(GM_getValue('listDopsN', ''))-1);if(Number(GM_getValue('listDopsN', ''))<1) {AngryAjax.goToUrl('/player/');}})";
                  c.setAttribute("rel", p),
                    c.addEventListener(
                      "click",
                      function () {
                        onClickBackGroundDiv(this);
                      },
                      !1
                    );
                }
                s[0].getElementsByClassName("padding")[0].removeChild(d);
              }
              s[0].setAttribute(
                "style",
                "margin: 2px 2px 2px 2px;height: 68px;"
              ),
                c.appendChild(s[0]),
                r.appendChild(c);
            }
            var d = document.createElement("DIV");
            d.setAttribute("class", "actions"),
              d.setAttribute("style", "clear: both;");
            var g = document.createElement("DIV");
            g.setAttribute("class", "button"),
              (g.innerHTML =
                '<span class="f"><i class="rl"></i><i class="bl"></i><i class="brc"></i><div class="c">\u041E\u041A</div></span>');
            var u = document.createElement("DIV");
            u.setAttribute("class", "button"),
              (u.innerHTML =
                '<span class="f"><i class="rl"></i><i class="bl"></i><i class="brc"></i><div class="c">\u041E\u0442\u043C\u0435\u043D\u0430</div></span>'),
              d.appendChild(g),
              d.appendChild(u),
              o.appendChild(d),
              Adoc.body.appendChild(t),
              u.addEventListener(
                "click",
                function () {
                  Adoc.body.removeChild(Adoc.getElementById("alert-main"));
                },
                !1
              ),
              g.addEventListener("click", createListDops, !1);
          }
        }
        function createListDops() {
          for (
            var t = Adoc.getElementsByName("backGroundDiv"), e = "", n = 0;
            n < t.length;
            n++
          )
            t[n].style.backgroundColor == "green" &&
              (e += t[n].getAttribute("rel") + "#|#");
          (e = e.substring(0, e.length - 3)),
            GM_setValue("listDops", e),
            GM_setValue("listDopsN", e.split("#|#").length),
            Adoc.body.removeChild(Adoc.getElementById("alert-main")),
            eatDops();
        }
        function onClickBackGroundDiv(t) {
          t.style.backgroundColor =
            t.style.backgroundColor == "green" ? "transparent" : "green";
        }
        function eatDops() {
          var listDops = GM_getValue("listDops", "");
          if (listDops) {
            var codeBlocks = listDops.split("#|#"),
              codeBlock = codeBlocks[0],
              cl = codeBlocks.length;
            eval(codeBlock),
              codeBlocks.shift(),
              codeBlocks[0]
                ? (GM_setValue("listDops", codeBlocks.join("#|#")),
                  setTimeout(function () {
                    eatDops();
                  }, 1e3))
                : GM_setValue("listDops", "");
          }
        }
        var Adoc = getRealDoc();
        renderEatDopsButton();
      };
    function ut() {
      function t(n) {
        let r = /^(\d\d).(\d\d).(\d{4}) (\d\d):(\d\d)$/.exec(n);
        if (r) {
          let [a, s, c, l, p, d] = r;
          return new Date(Date.UTC(l, c - 1, s, p - 3, d, 59));
        }
        return null;
      }
      function e() {
        let n = 0,
          o = 0,
          r = async (a) => {
            let s = $(".help").find(`.brown:contains("${a}")`);
            if (s.length > 0) {
              let c = s.html().split("\u0434\u043E ")[1];
              c && (localStorage.candyExpiration = c.split(" \u2014")[0]);
            }
          };
        if (
          (r(
            "\u041A\u043E\u043D\u0444\u0435\u0442\u0430 \xAB\u0423\u043C\u043D\u0430\u044F\xBB"
          ),
          r(
            "\u041A\u043E\u043D\u0444\u0435\u0442\u0430 \xAB\u0413\u043B\u0443\u043F\u0430\u044F\xBB"
          ),
          localStorage.candyExpiration)
        ) {
          let a = Number($("#servertime").attr("rel")),
            s = t(localStorage.candyExpiration);
          s && ((o = Math.round(s.getTime() / 1e3)), (n = o - a));
        }
        n < 0 && (n = 0),
          !$("#candyTimer")[0] &&
            n > 0 &&
            ($("#personal")
              .prepend(`<span id="candyTimer" style="position:absolute;top: -11px;left: 46px;padding: 2px;background-color:rgb(255, 227, 179);border-radius: 8px;border-bottom-right-radius: 0px;border-bottom-left-radius: 0px;border: 2px solid rgb(240 114 53);">
          <span style="display: flex; gap: 2px;" class="expa"><i></i><b id="countdownTimer" timer="10" endtime="${o}"></b></span>
        </span>`),
            countdown("#countdownTimer", 0, !1, async function () {
              await bt();
            }),
            countdown("#countdownTimer", 0));
      }
      e();
    }
    function Fe() {
      (typeof window.localStorage.OptionsVar > "u" ||
        window.localStorage.OptionsVar == null) &&
        (window.localStorage.OptionsVar = JSON.stringify({ f_pickabil: "u" }));
      var t = JSON.parse(window.localStorage.OptionsVar);
      if (location.pathname.search(/^\/fight/) !== -1) {
        let o = function () {
            let c = JSON.parse(window.sessionStorage.fightLog),
              l = parseInt($(".block-rounded").find(".current").text(), 10);
            t.f_hidedead && $(".list-users").find(".dead").remove();
            for (let p in c) {
              if (
                p ===
                "\u0418\u0437\u0431\u0440\u0430\u043D\u043D\u044B\u0439[??]"
              ) {
                $(".log")
                  .find(".log-panel")
                  .append(`<div class="fight-log">${c[p].Turns}</div>`);
                continue;
              }
              let d = "",
                g = "";
              for (let u in z)
                if (u in c[p]) {
                  let w = c[p][u],
                    b = 0;
                  u === "Hamsters"
                    ? (b = w.Turns)
                    : ((b = w.Turns - (l - w.Step)),
                      (b = b > 0 && b <= w.Turns ? b : 0)),
                    b > 0 &&
                      ((d += z[u].image),
                      b > 1 && (d += `<small>${b}</small>`)),
                    "cnt" in w &&
                      (g += `
                <div style="display: inline-block; margin: 6px 0;">
                  ${z[u].image}
                  <small style="margin-top: -3px; display: block; position: absolute;">
                    #${w.cnt}
                  </small>
                </div>`);
                }
              if (d || g) {
                let u = $("#fightGroupForm")
                  .find(`.user:contains("${p}")`)
                  .first();
                d && u.addClass("fight-log").prepend(`${d}<br>`),
                  g &&
                    u.parent().append(`
                <br>
                <div class="fight-log cnt" style="position: absolute; margin-top: -10px;">
                  ${g}
                </div>
                <div style="height: 20px;"></div>
              `);
              }
            }
          },
          r = function () {
            let c = location.href.split("/")[2],
              l = parseInt($(".block-rounded").find(".current").text(), 10),
              p = window.sessionStorage;
            (c !== p.FightId || !p.fightLog || p.fightLog === "undefined") &&
              ((p.FightId = c), (p.fightLog = JSON.stringify({})));
            var d = JSON.parse(window.sessionStorage.fightLog),
              g = $(".block-rounded").find(".current").text(),
              u = "",
              w = "";
            if (
              $(".group")
                .text()
                .search(/Избранный/) !== -1
            ) {
              var b =
                "\u0418\u0437\u0431\u0440\u0430\u043D\u043D\u044B\u0439\xA0[??]";
              d["\u0418\u0437\u0431\u0440\u0430\u043D\u043D\u044B\u0439[??]"] =
                { Turns: "", Step: g };
            }
            if (
              $(".group")
                .text()
                .includes(
                  "\u0418\u0437\u0431\u0440\u0430\u043D\u043D\u044B\u0439"
                )
            ) {
              let y =
                "\u0418\u0437\u0431\u0440\u0430\u043D\u043D\u044B\u0439\xA0[??]";
              d[y] = { Turns: "", Step: l };
            }
            function M(y, x, T, _, S) {
              y = y.match(/(.{1,20})\s(\[.+?\])/);
              let h = y ? `${y[1]}${y[2]}` : null;
              if (!h) return;
              if (
                h ===
                  "\u0418\u0437\u0431\u0440\u0430\u043D\u043D\u044B\u0439[??]" &&
                _ !== "-1"
              ) {
                d[h].Turns += S === "#" ? S : `<br>${S}`;
                return;
              }
              (d[h] = d[h] || {}), (d[h][x] = d[h][x] || {});
              let F = d[h][x];
              if (S === "#") {
                F.cnt = "#";
                return;
              }
              if (x === "Hamshams") {
                (d[h].Hamsters = d[h].Hamsters || { Turns: "0" }),
                  (d[h].Hamsters.Turns =
                    parseInt(d[h].Hamsters.Turns, 10) + parseInt(_, 10));
                return;
              }
              (F.Step = T),
                (F.Turns = _),
                z[x].cnt &&
                  ((F.cnt = F.cnt ? F.cnt + 1 : 1),
                  (F.Steps = F.Steps || []),
                  F.Steps.includes(T) || F.Steps.push(T));
            }
            function q(y, x, T) {
              let _ = [
                  "Hamsters",
                  "Snake",
                  "superhit6",
                  "MadTrump",
                  "totem",
                  "Knockout",
                ],
                S,
                h = null;
              switch (x) {
                case "f":
                  S = $(y)
                    .find('[class^="name-"]')
                    .first()
                    .text()
                    .match(/(.+?\[.+?\])/);
                  break;
                case "l":
                  S = $(y)
                    .find('[class^="name-"]')
                    .last()
                    .text()
                    .match(/(.+?\[.+?\])/);
                  break;
                case "et":
                  for (h = $(y).next(); !h.is(".easytarget"); ) h = h.next();
                  S = q(h, "f", T);
                  break;
                case "h":
                case "hh":
                  (h = Ue(y)),
                    h
                      .text()
                      .includes(
                        "\u043E\u0442\u043F\u0440\u0443\u0436\u0438\u043D\u0438\u0432\u0430\u0435\u0442 \u0443\u0434\u0430\u0440"
                      )
                      ? (S = q(h, x === "h" ? "f" : "l", T))
                      : (S = q(h, x === "h" ? "l" : "f", T));
                  break;
                default:
                  break;
              }
              return (
                S &&
                  S[1] === b &&
                  _.includes(T) &&
                  (w = `<small>${
                    h
                      .text()
                      .replace(/\s{2,}/g, " ")
                      .match(/^\d?([\s\S]+?\][\s\S]+?\])/)[1]
                  }</small>`),
                S
              );
            }
            function Ue(y) {
              let x = $(y).prev();
              for (;;) {
                let T = x.text();
                if (
                  T.match(/\[.+?\]/g)?.length > 1 &&
                  !T.match(/змея|Тесла|дракон|Ночной страж/)
                )
                  break;
                x = x.prev();
              }
              return x;
            }
            let Wt = $("#fightGroupForm").find(".fight-log");
            for (let y in z) {
              let { fstr: x, cnt: T, pn: _, turns: S } = z[y];
              x &&
                Wt.find(x).each(function () {
                  let h = q(this, _, y);
                  h || (h = q(this, _ === "l" ? "f" : "l", y)),
                    h &&
                      M(
                        h[1],
                        y,
                        l,
                        S ||
                          $(this)
                            .text()
                            .match(/\s(\d)\s/)[1],
                        w || ""
                      );
                });
            }
            Wt.find('.text:contains("\u0411\u0430\u0439\u043A ")').each(
              function () {
                let y = $(this)
                  .text()
                  .match(/Байк\s.+?оглушает.+?\[.+?\]/g);
                y &&
                  y.forEach((x) => {
                    let T = x.match(/оглушает\s(.+?\[.+?\])/)[1],
                      _ = T === b ? `<small>${x}</small>` : "";
                    M(T, "Bike", l, "1", _);
                  });
              }
            ),
              (p.fightLog = JSON.stringify(d));
          },
          a = function (c) {
            document.getElementById("sign_kick") == null &&
              (document.getElementById("useabl-" + c).click(),
              t.f_autokick &&
                ($("#fightAction").find("button").click(),
                $("#useabl-" + c)
                  .parents("label")
                  .find("img")
                  .attr("style", "filter:contrast(2.0)"),
                $("#f_autokick").prop("checked", !1),
                (t.f_autokick = 0),
                (window.localStorage.OptionsVar = JSON.stringify(t))),
              $(".log-panel").attr("id", "sign_kick"));
          },
          s = function () {
            if ($("#sign_ufl").length != 1) {
              if (
                (r(),
                o(),
                $(".fight-log")
                  .find(
                    '[class*="icon"]:not(.icon-bang-poison):not(.icon-antigranata2):not(.question-icon):not(.icon-rocket-1):not(.icon-rocket-2):not(.icon-cheese):not(.icon-helmet):not(.icon-bear):not(.icon-antigranata):not(.icon-forcejoin):not(.icon-heal):not(.antimrr):not(.serial):not(.icon-bang):not(.icon-superhit):not(.icon-reflect):not(.icon-chance):not(.icon-dodge):not(.icon-secondhit):not(.icon-thirdhit):not(.icon-katyusha):not(.icon-weakening-after-madness):not(.icon-foggranade)'
                  )
                  .each(function () {
                    var M = $(this)
                      .next()
                      .text()
                      .match(/(.*).\[/);
                    if (M !== null) {
                      var q = $(".group")
                        .find('li .user:contains("' + M[1] + '")')
                        .first();
                      $(q).is(".fight-log")
                        ? $(q).children("br").first().before($(this).clone())
                        : $(q)
                            .addClass("fight-log")
                            .prepend("<br>")
                            .prepend($(this).clone());
                    }
                  }),
                t.f_topmylog)
              ) {
                var c = $("ul.fight-log").find(".text");
                $('<div style="border:blue 1px solid;"></div>')
                  .prepend(c.find("p.attack_i, p.attack_me").clone())
                  .prependTo(c);
              }
              if (!$(".group2 i").is(".npc")) {
                var l = $(".list-users--right"),
                  p = l.find("li.alive");
                t.f_topmig &&
                  l
                    .prepend(
                      p.filter(
                        ':contains("\u041C\u0438\u0433\u0440\u0430\u043D\u0442 ")'
                      )
                    )
                    .prepend(
                      p.filter(':contains("\u041C\u0435\u0441\u044C\u0435 ")')
                    ),
                  t.f_topmadness && l.prepend(p.has(".deaf")),
                  t.f_bottomomon &&
                    (l.find("li.dead").length == 0
                      ? l.append(
                          p.filter(
                            ':contains("\u041E\u043C\u043E\u043D\u043E\u0432\u0435\u0446 ")'
                          )
                        )
                      : l
                          .find("li.dead")
                          .first()
                          .before(
                            p.filter(
                              ':contains("\u041E\u043C\u043E\u043D\u043E\u0432\u0435\u0446 ")'
                            )
                          ));
              }
              // ==== Кнопки ускорения боя и фильтрация логов в боях ======

var d = $("#fightGroupForm"),
                g = $("#fightAction"),
                u = d.find(".pagescroll").clone();
              if (!$(".block-rounded .cleanup-logs-btn").length) {
	// ==== Кусок для фильтрации логов в боях =====
                  
					  let isCleanupActive = true; // Фильтрация включена по умолчанию
					let originalLogs = null; // Храним копию исходных логов

		var w = k({
			text: "\u{1F9F9} \u{1F9FD}", // Эмодзи метлы и губки
			onClick: function() {
			isCleanupActive = !isCleanupActive;
			if (isCleanupActive) {
				originalLogs = $(".log > ul.fight-log .text").clone(true);
				try {
					Ae(); // Фильтруем логи
					$(w).addClass("active");
				} catch (e) {
					console.error("Error in Ae():", e);
				}
			} else {
				if (originalLogs) {
					let e = $(".log > ul.fight-log .text");
					e.empty();
					e.append(originalLogs.clone(true));
					$(".me-logs, .ability-log-container").remove();
				}
				$(w).removeClass("active");
			}
		},
		title: "\u041F\u043E\u0447\u0438\u0441\u0442\u044C \u043B\u043E\u0433\u0438 \u043E\u0442 \u041D\u041F\u0421",
	});
	$(w).addClass("cleanup-logs-btn").css({ margin: "2px 6px" });
	if (isCleanupActive) {
		originalLogs = $(".log > ul.fight-log .text").clone(true);
		try {
			Ae(); // Инициализируем фильтрацию
			$(w).addClass("active");
		} catch (e) {
			console.error("Error in Ae() on init:", e);
		}
	}

	// Наблюдатель за обновлением логов
	const target = document.querySelector(".log > ul.fight-log .text");
	if (target) {
		const observer = new MutationObserver(() => {
			if (isCleanupActive) {
				originalLogs = $(".log > ul.fight-log .text").clone(true);
				try {
					Ae();
				} catch (e) {
					console.error("Error in Ae() during logs update:", e);
				}
			}
		});
		observer.observe(target, { childList: true, subtree: true });
	} else {
		console.warn("Logs container (.log > ul.fight-log .text) not found!");
	}
             //  ===== Кусок для автобоя наверное =====
					var b = k({
					  text: "\u23E9",
					  onClick: async () => await G(),
					  title:
						"\u041F\u0440\u043E\u043F\u0443\u0441\u0442\u0438\u0442\u044C \u041D\u041F\u0421 \u0431\u043E\u0439",
					});
					$(b).addClass("skip-npc-fight-btn").css({ margin: "2px 6px" }),
					  u.children().first().append(w),
					  u.children().first().append(b);
				  }
				  
		// ==== Конец кнопок автобой и фильтр логов ======
              d.prepend(u),
                $(".superhit-wrapper").length !== 0 &&
                  $(".superhit-wrapper").css("zoom", "0.8"),
                g.append(
                  '<i id="fight-action-reload" class="icon reload-icon" title="\u0418\u0437\u043C\u0435\u043D\u0438\u0442\u044C \u0445\u043E\u0434"></i>'
                ),
                $("#fight-action-reload").on("click", function () {
                  g
                    .show()
                    .find("button")
                    .show()
                    .removeClass("disabled")
                    .prop("disabled", !1),
                    g.find(".waiting").hide();
                }),
                $("#main")
                  .find("span.boj")
                  .on("click", function () {
                    AngryAjax.goToUrl(
                      location.pathname.replace(/(\/fight\/\d+?\/)\d+?\//, "$1")
                    );
                  }),
                d.find("table").attr("id", "sign_ufl");
            }
          };
        var e = ["148", "-1", "-65", "59", "155", "146"];
        if (
          !$(".group2 i").is(".npc") &&
          ($(".group1 i").is(".arrived") ||
            $(".group1 img").is('[class^="team-"]')) &&
          !$("h3").is(".welcome-groupfight-flag") &&
          $("#fightGroupForm").find("ul.fight-log > li > h4").text() ==
            "\u041D\u0430\u0447\u0430\u043B\u043E" &&
          $("#fightAction").find("button").is(":visible")
        ) {
          switch (t.f_pickabil) {
            case "u":
              document.getElementById("useabl--1") !== null && a("-1"),
                document.getElementById("useabl--65") !== null && a("-65"),
                document.getElementById("useabl-148") !== null && a("148");
              break;
            case "o":
              document.getElementById("useabl-59") !== null && a("59"),
                document.getElementById("useabl-146") !== null && a("146");
              break;
            case "a":
              document.getElementById("useabl-155") !== null && a("155");
              break;
          }
          if (document.getElementById("sign_kick") == null) {
            for (var n = 0; n < e.length; n++)
              if (document.getElementById("useabl-" + e[n]) !== null) {
                a(e[n]);
                break;
              }
          }
        }
        s(), $(".log-panel").prepend($(".fight-slots-actions"));
      }
    }
    async function Ct() {
      return new Promise((t) => {
        AngryAjax.goToUrl("/alley/"),
          $(document).one("ajaxStop", () => {
            let e = location.pathname;
            t(/\/fight\/(?!.*\/alley\/)/.test(e));
          });
      });
    }
    function Dt() {
      CasinoKubovich.rotate = function () {
        if (((CasinoKubovich.rotateInterval = null), !CasinoKubovich.mayRotate))
          return !1;
        CasinoKubovich.mayRotate = !1;
        var t = parseInt($("#fishki-balance-num").html().replace(",", "")),
          e = parseInt($("#push .fishki").text());
        if (!isNaN(e) && e > t) {
          CasinoKubovich.errorChip();
          return;
        }
        (CasinoKubovich.endPosition = null), (CasinoKubovich.result = null);
        var n = "";
        $("div.reel-yellow").length ? (n = "yellow") : (n = "black"),
          $.post(
            "/casino/kubovich/",
            { action: n },
            function (o) {
              if (((CasinoKubovich.result = o), CasinoKubovich.result))
                if (CasinoKubovich.result.success)
                  CasinoKubovich.showMessage(CasinoKubovich.result.text);
                else if (!CasinoKubovich.result.ready)
                  clearInterval(CasinoKubovich.rotateInterval),
                    (CasinoKubovich.rotateInterval = null),
                    (CasinoKubovich.mayRotate = !0),
                    $("#prizes").empty(),
                    $("#reel-turning").attr("class", ""),
                    $("#push .cost").html(" - \u0441\u043A\u043E\u0440\u043E"),
                    $("#push").addClass("disabled"),
                    $("#push-ellow").addClass("disabled"),
                    $("#steps tr.my").removeClass("my"),
                    $("#kubovich-smile").show(),
                    CasinoKubovich.showError(
                      "\u041A \u0441\u043E\u0436\u0430\u043B\u0435\u043D\u0438\u044E \u0432 \u0434\u0430\u043D\u043D\u044B\u0439 \u043C\u043E\u043C\u0435\u043D\u0442 \u041A\u0443\u0431\u043E\u0432\u0438\u0447 \u043E\u0442\u0434\u044B\u0445\u0430\u0435\u0442, \u043F\u0440\u0438\u0445\u043E\u0434\u0438\u0442\u0435 \u043F\u043E\u0437\u0436\u0435."
                    );
                else if (CasinoKubovich.result.reload) {
                  var r = !1;
                  $("div.reel-yellow").length && (r = !0),
                    CasinoKubovich.loadData(r);
                } else CasinoKubovich.errorChip();
              if (CasinoKubovich.result.wallet) {
                var a = {};
                (a.money = CasinoKubovich.result.wallet.money),
                  (a.ore = CasinoKubovich.result.wallet.ore),
                  (a.honey = CasinoKubovich.result.wallet.honey),
                  updateWallet(a);
              }
              (CasinoKubovich.rotateInterval = null),
                (CasinoKubovich.mayRotate = !0);
              var s = 0,
                c = 0;
              $("#kubovich-message button").unbind("click"),
                $("#kubovich-message button").bind("click", function () {
                  $("#kubovich-message").hide(),
                    $("#kubovich-message .data .text").html("");
                }),
                CasinoKubovich.nextStep();
            },
            "json"
          );
      };
    }
    function Gt() {
      (NeftLenin.attack = function () {
        $.post(
          "/neftlenin/",
          { ajax: 1, action: "startAction" },
          function (t) {
            t.result
              ? AngryAjax.reload()
              : (t.return_url && AngryAjax.goToUrl(t.return_url),
                t.error &&
                  showAlert(m.lang.LANG_MAIN_105, t.error, !0, "", ".welcome"));
          },
          "json"
        );
      }),
        (NeftLenin.viewPreMission = NeftLenin.viewPreMission2);
    }
    function zt() {
      (DungeonViewer.tryToGoToRoom = function (t) {
        if ($("#preview-map").hasClass("data-prevent-click")) {
          $("#preview-map").removeClass("data-prevent-click");
          return;
        }
        DungeonViewer.activePlayerMoving ||
          (Dungeon.isCanGoToRoom(t) &&
            Dungeon.goToRoom(t, function (e) {
              DungeonViewer.movePlayerToRoom(0, t, e);
            }));
      }),
        (Dungeon.goToRoom = function (t, e) {
          Dungeon.activeRequest ||
            ((Dungeon.activeRequest = !0),
            typeof t != "number" && (t = t.replace("room-", "")),
            postUrl(
              "/dungeon/gotoroom/",
              { action: "gotoroom", room: t },
              "post",
              function (n) {
                (Dungeon.activeRequest = !1),
                  DungeonViewer.initCooldown(n.cooldown),
                  (n.result || n.return_url) &&
                    AngryAjax.goToUrl(AngryAjax.getCurrentUrl());
              }
            ));
        });
    }
    function qn() {
      if (!$("#modify-many-container").length)
        try {
          $(".tattoo").css("height", "1000px"),
            $(".tattoo-slider").css("height", "700px"),
            $(".tattoo-slider-slides").css("height", "100%"),
            $(".tattoo-slider-slide__container").css("height", "100%");
          let t = A(
            '<div id="modify-many-container" style="display: flex; gap: 10px;"></div>'
          );
          [3, 20, 30].forEach((e) => {
            let n = k({
              text: `\u262F\uFE0F x${e}`,
              onClick: async () => await Rt(e),
              title: `\u041F\u043E\u043F\u0440\u043E\u0431\u043E\u0432\u0430\u0442\u044C \u0441\u0430\u043C\u043E\u043C\u0443 \u0445${e} \u0440\u0430\u0437`,
            });
            t.appendChild(n);
          }),
            $(".tattoo-draft-color-actions").append(t);
        } catch {
          console.log("could not redraw tattoo");
        }
    }
    function Pn() {
      let t = [
        "\u043F\u0435\u043B\u044C\u043C\u0435\u043D\u044C",
        "\u041A\u0443\u0431\u0438\u043A\u0438 \u041C\u043E\u0441\u043A\u043E\u0432\u043E\u043F\u043E\u043B\u0438\u0438",
        "\u042D\u043B\u0435\u043C\u0435\u043D\u0442 \u0441\u043B\u0443\u0447\u0430\u0439\u043D\u043E\u0439 \u043A\u043E\u043B\u043B\u0435\u043A\u0446\u0438\u0438",
        "\u0425\u0440\u0443\u0441\u0442\u044F\u0449\u0438\u0435 \u0432\u0430\u0444\u043B\u0438",
        "\u043F\u043E\u0434\u0437\u0435\u043C\u043A\u0443",
        "\u041D\u0430\u0431\u043E\u0440 \u043A\u043B\u044E\u0447\u0435\u0439",
        "\u0420\u0430\u0441\u043F\u044B\u043B\u0438\u0442\u0435\u043B\u044C \u0434\u043B\u044F \u0434\u0443\u0445\u043E\u0432",
      ];
      $(".tv-tower-news-tab-content").each(function () {
        let e = $(this),
          n = e.find(".tv-tower-news-article").toArray();
        n.sort((o, r) => {
          let a = $(o).find(".tv-tower-award").text().trim(),
            s = $(r).find(".tv-tower-award").text().trim(),
            c = t.some((p) => a.includes(p));
          return t.some((p) => s.includes(p)) - c;
        }),
          e.append(n);
      });
    }
    function Ce() {
      function t() {
        $("#welcome-rat button:nth-child(3)").replaceWith(
          $("#search_other_rat > div > div > div:nth-child(4)")
            .clone()
            .on("click", function () {
              $(document).one("ajaxStop", function () {
                t(), e();
              });
            })
        );
      }
      function e() {
        async function n() {
          await fetch("https://www.moswar.ru/metro/fight-rat/", {
            headers: {
              accept: "*/*",
              "content-type":
                "application/x-www-form-urlencoded; charset=UTF-8",
              "sec-fetch-dest": "empty",
              "sec-fetch-mode": "cors",
              "sec-fetch-site": "same-origin",
              "x-requested-with": "XMLHttpRequest",
            },
            referrer: "https://www.moswar.ru/metro/",
            referrerPolicy: "strict-origin-when-cross-origin",
            body: "__referrer=%2Fmetro%2F&return_url=%2Fmetro%2F",
            method: "POST",
            mode: "cors",
          });
        }
        $('button[onclick="metroFightRat();"]')
          .removeAttr("onclick")
          .off("click")
          .on("click", async function () {
            await n(),
              $(document).one("ajaxStop", async function () {
                Mn() && (await G());
              }),
              AngryAjax.goToUrl("/metro/");
          });
      }
      t(), e();
    }

      // ============= Петарена исправлена

async function In() {
    if ($("#pets-table").length) return;

    // Скрываем оригинальный блок с питомцами
    $("#equipment-accordion").css({ display: "none" });

    let t = $(".inventary");

    // Очищаем ячейку перед добавлением нового контента
    let targetCell = t.find("tr:first td:nth-child(2)");
    targetCell.empty();

    // Загрузка и добавление контента из cage-relic (боевые питомцы)
    let e = await f("table", "https://www.moswar.ru/petarena/cage-relic/");
    console.log("Загрузка cage-relic:", e);

    if (e) {
        let $e = $(e);
        // Настраиваем боевых питомцев - расширяем вправо
        $e.find(".object-thumbs")
            .css({
                width: "150%", // Расширяем вправо
                maxWidth: "none",
                height: "400px",
                scrollbarWidth: "none",
                overflowY: "scroll",
                backgroundColor: "#f7b142" // Темно-оранжевый фон
            })
            .attr("id", "pets-table");

        // Добавляем кнопку "в бой" к новым элементам
        $e.find(".object-thumb").each((o, r) => {
            let a = $(r);
            a.css({ height: "auto" });
            let s = a.find(".action span:contains('\u043E\u0431\u0443\u0447\u0438\u0442\u044C')").parent();
            let c = s.attr("onclick")?.match(/\/(\d+)\//)?.[1];
            if (!c) return;
            $("<div>", {
                class: "take-pet action",
                html: "<span>\u0432 \u0431\u043E\u0439</span>",
                click: function () {
                    petarenaSetActive(c, "battle");
                },
            }).insertAfter(s);
        });

        targetCell.append($e);
    } else {
        console.log("Ошибка: cage-relic не загружен");
    }

    // Загрузка и добавление контента из cage (беговые питомцы)
    let n = await f("table", "https://www.moswar.ru/petarena/cage/");
    console.log("Загрузка cage:", n);

    if (n) {
        let $n = $(n);
        $n = $n.filter("table.inventary");
        // Настраиваем боевых - расширяем вправо
        $n.find(".object-thumbs")
            .css({
                width: "340px", // Расширяем вправо
                maxWidth: "none",
                height: "550px",
                scrollbarWidth: "none",
                overflowY: "scroll",
                backgroundColor: "#f7b142" // Темно-оранжевый фон
            });

        // Добавляем кнопку "в бой" к новым элементам
        $n.find(".object-thumb").each((o, r) => {
            let a = $(r);
            a.css({ height: "auto" });
            let s = a.find(".action span:contains('\u043E\u0431\u0443\u0447\u0438\u0442\u044C')").parent();
            let c = s.attr("onclick")?.match(/\/(\d+)\//)?.[1];
            if (!c) return;
            $("<div>", {
                class: "take-pet action",
                html: "<span>\u0432 \u0431\u043E\u0439</span>",
                click: function () {
                    petarenaSetActive(c, "battle");
                },
            }).insertAfter(s);
        });

        targetCell.append($n);
    } else {
        console.log("Ошибка: cage не загружен");
    }

    // Оптимизация таблицы .inventary
    t.find("tr").each(function () {
        let o = $(this).find("td"),
            r = o.eq(0).children().first(),
            a = o.eq(1).children().first();
        if (r.length) {
            // Настраиваем доступные питомцы и питомцев [1/2] - расширяем вправо
            if (r.find(".object-thumbs").length) {
                r.find(".object-thumbs").css({
                    width: "313.1px", // Расширяем вправо
                    maxWidth: "none",
                    height: "150px",
                    overflowY: "scroll",
                    backgroundColor: "#f7b142" // Темно-оранжевый фон
                });
            }
            // Если это блок "Питомцев [1/2]", тоже расширяем
            if (r.find("table").length || r.text().includes("Питомцев")) {
                r.css({
                    width: "317px", // Расширяем вправо
                    maxWidth: "none",
                    height: "150px",
                    overflow: "hidden",
                    backgroundColor: "#f7b142" // Темно-оранжевый фон
                });
            }
            t.find("tr:first td:first").append(r);
        }
        if (a.length) t.find("tr:first td:last").append(a);
        if (o.eq(0).is(":empty") && o.eq(1).is(":empty")) $(this).remove();
    });

    // Дополнительная настройка для блоков в левой колонке
    setTimeout(() => {
        // Сужаем "Доступные питомцы"
        t.find("tr:first td:first .object-thumbs").css({
            height: "120px",
            overflowY: "scroll"
        });

        // Сужаем любые другие высокие блоки в левой колонке
        t.find("tr:first td:first > div, tr:first td:first > table").each(function() {
            if ($(this).height() > 200) {
                $(this).css({
                    height: "150px",
                    overflow: "hidden"
                });
            }
        });
    }, 100);
}
      // =============== Конец петарены по идее ===========

    function Ln() {
      let t = ["/metro/", "/travel2/", "/neftlenin/from_battle/"],
        e = $(".result a.f").attr("href");
      e &&
        t.includes(e) &&
        (console.log("redirecting to", e), j(), AngryAjax.goToUrl(e));
    }
    function Mn() {
      if (location.pathname.match(/^(?!.*\/alley\/).*\/fight\//)) return !0;
    }
    function Un() {
      $(".object-thumbs").css({
        height: "auto",
        overflowY: "scroll",
        scrollbarWidth: "none",
      });
    }
    function Bn() {
      $("#home-collections").css({
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr 1fr",
      }),
        $(".object-thumb").each(function () {
          $(this).css({ height: "auto" });
          let t = $(this).find("img").attr("title");
          /коллекция/i.test(t) && (t = t.replace(/коллекция/i, ""));
          let e = $("<span>")
            .text(t)
            .css({ "word-break": "break-all", "font-size": "smaller" });
          $(this).find("a").append(e);
        });
    }
    function mt() {
      let t = location.pathname;
      if ((ut(), Un(), t.match(/\/alley\/fight\//)))
        console.log("Alley fight"), fightForward();
      else if (t.match(/^(?!.*\/alley\/).*\/fight\//))
        console.log("Group fight"), Fe(), Ln();
      else if (t.includes("/player/")) dt();
      else if (t === "/automobile/ride/") Ut();
      else if (t === "/tattoo/") qn();
      else if (t === "/square/tvtower/") Pn();
      else if (t === "/metrowar/clan/") {
        let e = $(".clan-members > ul");
        $(".clan-members > ul li")
          .sort((n, o) => {
            let r = parseInt($(n).find(".cool-1").text().trim(), 10);
            return parseInt($(o).find(".cool-1").text().trim(), 10) - r;
          })
          .appendTo(e);
      } else if (t === "/home/relic/")
        $("#relic-reinforced-list").css({
          marginBottom: "0px",
          scrollbarWidth: "none",
        }),
          $(".relic-reinforced-wnd").css({ height: "auto" }),
          $(".relic-reinforced-wnd-list").css({ height: "100%" });
      else if (t === "/travel2/") _e();
      else if (t === "/metro/")
        Ce(),
          $(
            "#action-rat-fight > div.button-big.button, #timer-rat-fight > div:contains('\u041F\u0440\u043E\u043A\u0430\u0442\u0438\u0442\u044C\u0441\u044F')"
          ).on("click", function () {
            $(document).one("ajaxStop", Ce);
          });
      else if (t === "/petarena/") In();
      else if (t === "/home/") Bn();
      else if (t === "/camp/gypsy/") {
        let e = $(".game-types td:first");
        if (
          ($(".multi-play-gypsy").length ||
            e.append(
              at({
                label:
                  "\u041C\u043D\u0435 \u043F\u043E\u0432\u0435\u0437\u0435\u0442",
                action: async () => await rt(),
                className: "multi-play-gypsy",
              })
            ),
          $(".multi-play-gypsy-flowers").length)
        )
          return;
        let n = $(".game-types-col").first();
        console.log(n),
          n.append(
            at({
              label:
                "\u041C\u043D\u0435 \u043F\u043E\u0432\u0435\u0437\u0435\u0442",
              action: async () => await rt(),
              className: "multi-play-gypsy-flowers",
            })
          );
      } else if (t === "/casino/blackjack/") {
        if ($(".blackjack-multi").length) return;
        let e = at({
          label: "\u0418\u0433\u0440\u0430\u0442\u044C \u0437\u0430 10",
          action: async () => await ae(),
          className: "blackjack-multi",
        });
        $(".actions.bets").append(e);
      } else
        t === "/arbat/" &&
          (function () {
            if ($(".bringup-mode-btn").length) return;
            $(".progress .num").html(function (r, a) {
              return a.replace(/Баллов набрано:\s*/, "");
            });
            let n = k({
                text: "\u{1F695}",
                title:
                  "\u0411\u043E\u043C\u0431\u0438\u0442\u044C \u0431\u0435\u0441\u043F\u043B\u0430\u0442\u043D\u043E (\u043F\u043E\u043A\u0430 \u0432\u043A\u043B\u0430\u0434\u043A\u0430 \u043D\u0435 \u0437\u0430\u043A\u0440\u044B\u0442\u0430 \u0438\u043B\u0438 \u043E\u0431\u043D\u043E\u0432\u043B\u0435\u043D\u0430)",
                className: "bringup-mode",
                onClick: async () => {
                  if (window.BRINGUP_MODE) {
                    showAlert(
                      "\u0411\u043E\u043C\u0431\u0438\u043B\u0430 \u{1F695}",
                      "\u0420\u0435\u0436\u0438\u043C \u0431\u043E\u043C\u0431\u0438\u0442\u044C \u0443\u0436\u0435 \u0430\u043A\u0442\u0438\u0432\u0435\u043D."
                    );
                    return;
                  }
                  let r = $(
                    'form[action="/automobile/bringup/"] input[name="car"]'
                  ).val();
                  if (!r) {
                    showAlert(
                      "\u0411\u043E\u043C\u0431\u0438\u043B\u0430 \u{1F695}",
                      "\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u043D\u0430\u0439\u0442\u0438 ID \u0430\u0432\u0442\u043E\u043C\u043E\u0431\u0438\u043B\u044F."
                    );
                    return;
                  }
                  await B(r),
                    (window.BRINGUP_MODE = !0),
                    AngryAjax.reload(),
                    showAlert(
                      "\u0411\u043E\u043C\u0431\u0438\u043B\u0430 \u{1F695}",
                      `<div id="alert-text" style="display: flex;justify-items: center;align-items: flex-end;gap: 8px;
"><img src="/@/images/link/taxi.jpg" style="width: 48px;"> <span>\u0420\u0435\u0436\u0438\u043C \u0431\u043E\u043C\u0431\u0438\u0442\u044C \u0431\u0435\u0441\u043F\u043B\u0430\u0442\u043D\u043E.<br> \u0427\u0442\u043E\u0431\u044B \u043E\u0442\u043A\u043B\u044E\u0447\u0438\u0442\u044C, \u043E\u0431\u043D\u043E\u0432\u0438\u0442\u0435 \u0441\u0442\u0440\u0430\u043D\u0438\u0446\u0443.<br> <i>(id \u0442\u0430\u0447\u043A\u0438: ${r})</i>.</span></div>`
                    );
                },
              }),
              o = $(".auto-bombila .actions");
            o.find("form").css({ display: "inline-block" }), o.append(n);
          })();
    }
    var z = {
      Madness: {
        turns: "2",
        cnt: "",
        pn: "l",
        fstr: 'p:contains("\u0431\u0435\u0448\u0435\u043D\u0441\u0442\u0432\u043E \u043D\u0430 2 \u0445\u043E\u0434\u0430")',
        image:
          '<i class="icon-madness deaf" style="margin:1px; filter:contrast(2.0);"></i>',
      },
      MadTrump: {
        turns: "1",
        cnt: "",
        pn: "l",
        fstr: 'p:contains("\u043E\u0442\u043F\u0440\u0430\u0432\u043B\u044F\u0435\u0442 \u0432 \u0431\u0435\u0437\u0443\u043C\u0438\u0435")',
        image:
          '<i class="icon-madness deaf" style="margin:1px; filter:contrast(2.0);"></i>',
      },
      superhit6: {
        turns: "1",
        cnt: "",
        pn: "mf",
        fstr: 'p:contains("\u0432\u043F\u0430\u0434\u0430\u0435\u0442 \u0432 \u0431\u0435\u0437\u0443\u043C\u0438\u0435 \u043D\u0430 1 \u0445\u043E\u0434!"):not(:contains("\u0437\u043C\u0435\u044F"))',
        image: '<i class="icon-madness deaf"></i>',
      },
      Snake: {
        turns: "1",
        cnt: "",
        pn: "mf",
        fstr: 'p:contains("\u0432\u043F\u0430\u0434\u0430\u0435\u0442 \u0432 \u0431\u0435\u0437\u0443\u043C\u0438\u0435 \u043D\u0430 1 \u0445\u043E\u0434!"):contains("\u0437\u043C\u0435\u044F")',
        image:
          '<img class="icon deaf" src="/@/images/obj/pets/28-8.png" style="margin:1px;">',
      },
      Stun: {
        turns: "1",
        cnt: "",
        pn: "l",
        fstr: 'p:contains(" \u0443\u043C\u0438\u043B\u044C\u043D\u043E \u0441\u043C\u043E\u0442\u0440\u0438\u0442 \u043D\u0430")',
        image: '<span class="stun deaf"><i style="margin:1px;"></i></span>',
      },
      totem: {
        turns: "1",
        cnt: "",
        pn: "l",
        fstr: 'p:contains("\u0442\u043E\u0442\u0435\u043C\u0430 \u043E\u0433\u043B\u0443\u0448\u0430\u0435\u0442")',
        image: '<span class="stun deaf"><i style="margin:1px;"></i></span>',
      },
      Bear: {
        turns: "1",
        cnt: "",
        pn: "l",
        fstr: 'p:contains("\u0441\u043B\u0443\u0447\u0430\u0439\u043D\u043E \u043E\u0433\u043B\u0443\u0448\u0430\u0435\u0442"):not(:contains("\u041F\u0443\u0433\u0430\u043B\u043E"))',
        image:
          '<i class="icon icon-bear deaf" style="filter: contrast(10.0); margin:1px; zoom:0.8;"></i>',
      },
      Snowman: {
        turns: "1",
        cnt: "",
        pn: "l",
        fstr: 'p:contains("\u0441\u043B\u0443\u0447\u0430\u0439\u043D\u043E \u043E\u0433\u043B\u0443\u0448\u0430\u0435\u0442"):contains("\u041F\u0443\u0433\u0430\u043B\u043E")',
        image:
          '<img  class="icon deaf" src="/@/images/obj/beast_ability/ability11.png" style="filter:contrast(2.0);">',
      },
      Knockout: {
        turns: "1",
        cnt: "",
        pn: "l",
        fstr: 'p:contains("\u0432\u044B\u0437\u044B\u0432\u0430\u0435\u0442 \u043B\u0430\u0432\u0438\u043D\u0443")',
        image:
          '<i class="icon icon-set-perk-knockout deaf" style="margin:1px;"></i>',
      },
      Bike: {
        turns: "1",
        cnt: "",
        pn: "",
        fstr: "",
        image: '<i class="icon icon-bike deaf" style="margin:1px;"></i>',
      },
      Hamsters: {
        turns: "",
        cnt: "",
        pn: "h",
        fstr: 'p:contains("\u0436\u0435\u0432\u0430\u0442\u044C \u043F\u0440\u043E\u0432\u043E\u0434\u0430")',
        image:
          '<img  class="icon" src="/@/images/obj/pets/25-1.png" style="margin:1px; filter:contrast(2.0);">',
      },
      Hamshams: {
        turns: "-1",
        cnt: "",
        pn: "hh",
        fstr: 'p.hamster:contains("\u043F\u0440\u0438\u0446\u0435\u043B\u0438\u0432\u0430\u0435\u0442\u0441\u044F \u0438 \u043D\u0430\u043F\u0430\u0434\u0430\u0435\u0442")',
        image: "",
      },
      Robots_b: {
        turns: "4",
        cnt: "",
        pn: "l",
        fstr: 'p:contains("\u0441\u0438\u043B\u043E\u0432\u043E\u0439 \u0431\u0440\u043E\u043D\u0435\u0439")',
        image:
          '<img class="icon" src="/@/images/obj/pets/29-4.png" style="margin:1px; filter:contrast(10.0);">',
      },
      Robots_o: {
        turns: "4",
        cnt: "",
        pn: "l",
        fstr: 'p:contains("\u0430\u043A\u0442\u0438\u0432\u0438\u0440\u0443\u0435\u0442 \u043E\u0442\u0440\u0430\u0436\u0435\u043D\u0438\u0435")',
        image:
          '<img class="icon" src="/@/images/obj/pets/29-4.png" style="margin:1px; position:inherit; filter:hue-rotate(-90deg) opacity(60%);">',
      },
      Zimtime: {
        turns: "",
        cnt: "",
        pn: "f",
        fstr: 'p:contains("\u0437\u0438\u043C\u043D\u0435\u0435 \u0432\u0440\u0435\u043C\u044F")',
        image:
          '<span class="sovetabil3"><i class="icon" style="margin:1px;"></i></span>',
      },
      Tornados: {
        turns: "4",
        cnt: "",
        pn: "f",
        fstr: 'p:contains("\u0437\u0430\u0449\u0438\u0442\u0443 \u043E\u0442 \u0443\u0440\u043E\u043D\u0430 \u0438 \u0433\u0440\u0430\u043D\u0430\u0442 \u043D\u0430 70%")',
        image:
          '<img class="icon" src="/@/images/obj/superhits/superhit-10-3.png" style="margin:1px;">',
      },
      antigrnt: {
        turns: "4",
        cnt: "1",
        pn: "f",
        fstr: 'p:contains("\u0429\u0438\u0442"):not(:contains("\u0421\u0442\u0430\u043B\u044C\u043D\u043E\u0439"))',
        image:
          '<span class="icon icon-antigranata" style="margin:1px; zoom:0.9;"></span>',
      },
      antigrnt2: {
        turns: "2",
        cnt: "1",
        pn: "f",
        fstr: 'p:contains("\u0421\u0442\u0430\u043B\u044C\u043D\u043E\u0439 \u0449\u0438\u0442")',
        image:
          '<span class="icon icon-antigranata2" style="margin: 1px; zoom:0.9;"></span>',
      },
      helmet: {
        turns: "2",
        cnt: "1",
        pn: "f",
        fstr: 'p:contains("\u041F\u0440\u043E\u0431\u043A\u043E\u0432\u0430\u044F \u043A\u0430\u0441\u043A\u0430")',
        image: '<span class="icon icon-helmet" style="margin: 1px;"></span>',
      },
      helmet3: {
        turns: "3",
        cnt: "1",
        pn: "f",
        fstr: 'p:contains("\u041D\u043E\u0432\u043E\u0433\u043E\u0434\u043D\u0438\u0439 \u043D\u0430\u043F\u0438\u0442\u043E\u043A")',
        image:
          '<img class="icon" src="/@/images/obj/fight_item/weapon73.png" style="margin:1px;">',
      },
      reflect: {
        turns: "1",
        cnt: "1",
        pn: "f",
        fstr: 'p:contains("\u041A\u043E\u0432\u0430\u0440\u043D\u0430\u044F \u043F\u0440\u0443\u0436\u0438\u043D\u0430")',
        image: '<span class="icon icon-reflect" style="margin: 1px;"></span>',
      },
      durian: {
        turns: "1",
        cnt: "1",
        pn: "f",
        fstr: 'p:contains("\u0414\u0443\u0440\u0438\u0430\u043D \xAB\u0417\u0430\u043C\u043E\u0440\u0441\u043A\u0438\u0439\xBB"):not(:contains("\u043A\u0443\u0448\u0430\u0435\u0442"))',
        image:
          '<img class="icon" src="/@/images/obj/fight_item/weapon76.png" style="margin:1px;">',
      },
      kokos: {
        turns: "1",
        cnt: "1",
        pn: "f",
        fstr: 'p:contains("\u041E\u0440\u0435\u0445 \xAB\u041A\u043E\u043A\u043E\u0441\u043E\u0432\u044B\u0439\xBB"):not(:contains("\u043A\u0443\u0448\u0430\u0435\u0442"))',
        image:
          '<img class="icon" src="/@/images/obj/fight_item/weapon74.png" style="margin:1px;">',
      },
      tikva: {
        turns: "1",
        cnt: "1",
        pn: "f",
        fstr: 'p:contains("\u0422\u044B\u043A\u0432\u0430 \xAB\u041A\u043E\u043B\u0445\u043E\u0437\u043D\u0430\u044F\xBB"):not(:contains("\u043A\u0443\u0448\u0430\u0435\u0442"))',
        image:
          '<img class="icon" src="/@/images/obj/fight_item/weapon75.png" style="margin:1px;">',
      },
      granat: {
        turns: "1",
        cnt: "1",
        pn: "f",
        fstr: 'p:contains("\u0413\u0440\u0430\u043D\u0430\u0442 \xAB\u041E\u0441\u043A\u043E\u043B\u043E\u0447\u043D\u044B\u0439\xBB"):not(:contains("\u043A\u0443\u0448\u0430\u0435\u0442"))',
        image:
          '<img class="icon" src="/@/images/obj/fight_item/weapon77.png" style="margin:1px;">',
      },
      rolls: {
        turns: "1",
        cnt: "1",
        pn: "f",
        fstr: 'p:contains("\u0420\u043E\u043B\u043B\u044B")',
        image:
          '<img class="icon" src="/@/images/obj/drugs148.png" style="margin:1px;">',
      },
      vokker: {
        turns: "1",
        cnt: "1",
        pn: "f",
        fstr: 'p:contains("\u0412\u043A\u0443\u0441\u043D\u044B\u0439 \u0432\u043E\u043A\u043A\u0435\u0440")',
        image:
          '<img class="icon" src="/@/images/obj/drugs179.png" style="margin:1px;">',
      },
      food87: {
        turns: "1",
        cnt: "1",
        pn: "f",
        fstr: 'p:contains("\u0410\u043F\u0442\u0435\u0447\u043D\u044B\u0439 \u043D\u0430\u0431\u043E\u0440 \xAB\u041A\u0440\u0430\u0441\u043D\u044B\u0439\xBB")',
        image:
          '<img class="icon" src="/@/images/obj/fight_item/weapon87.png" style="margin:1px;">',
      },
      food86: {
        turns: "1",
        cnt: "1",
        pn: "f",
        fstr: 'p:contains("\u0410\u043F\u0442\u0435\u0447\u043D\u044B\u0439 \u043D\u0430\u0431\u043E\u0440 \xAB\u041E\u0440\u0430\u043D\u0436\u0435\u0432\u044B\u0439\xBB")',
        image:
          '<img class="icon" src="/@/images/obj/fight_item/weapon86.png" style="margin:1px;">',
      },
      food79: {
        turns: "1",
        cnt: "1",
        pn: "f",
        fstr: 'p:contains("\u041B\u0435\u0434\u0435\u043D\u0446\u044B \u0441 \u0438\u0433\u043E\u043B\u043A\u0430\u043C\u0438")',
        image:
          '<img class="icon" src="/@/images/obj/fight_item/weapon79.png" style="margin:1px;">',
      },
      food80: {
        turns: "1",
        cnt: "1",
        pn: "f",
        fstr: 'p:contains("\u041D\u043E\u0432\u043E\u0433\u043E\u0434\u043D\u044F\u044F \u043A\u0430\u0440\u0430\u043C\u0435\u043B\u044C")',
        image:
          '<img class="icon" src="/@/images/obj/fight_item/weapon80.png" style="margin:1px;">',
      },
      cheese: {
        turns: "1",
        cnt: "1",
        pn: "f",
        fstr: 'p:contains("\u0410\u0440\u043E\u043C\u0430\u0442\u043D\u044B\u043C \u0441\u044B\u0440\u043E\u043C")',
        image:
          '<span class="icon icon-cheese" style="margin: 1px; zoom:0.9;"></span>',
      },
      migrant: {
        turns: "1",
        cnt: "1",
        pn: "f",
        fstr: 'p:contains("\u0422\u0440\u0443\u0434\u043E\u0432\u043E\u0439 \u043A\u043D\u0438\u0436\u043A\u043E\u0439")',
        image:
          '<img class="icon" src="/@/images/obj/fight_item/migrant.png" style="margin:1px;">',
      },
      lenin: {
        turns: "1",
        cnt: "1",
        pn: "f",
        fstr: 'p:contains("\u043F\u0440\u0438\u0437\u044B\u0432\u0430\u0435\u0442 \u0412\u043E\u0436\u0434\u044F")',
        image:
          '<img class="icon" src="/@/images/obj/neftlenin_head.png" style="margin:1px;">',
      },
      grena82: {
        turns: "1",
        cnt: "1",
        pn: "f",
        fstr: 'p:contains("\u0413\u0440\u0430\u043D\u0430\u0442\u0430 \xAB\u041F\u043E\u0440\u0430\u0437\u0438\u0442\u0435\u043B\u044C\u043D\u0430\u044F\xBB")',
        image:
          '<img class="icon" src="/@/images/obj/fight_item/weapon82.png" style="margin:1px;">',
      },
      grena83: {
        turns: "1",
        cnt: "1",
        pn: "f",
        fstr: 'p:contains("\u0413\u0440\u0430\u043D\u0430\u0442\u0430 \xAB\u0414\u0443\u0445\xBB")',
        image:
          '<img class="icon" src="/@/images/obj/fight_item/weapon83.png" style="margin:1px;">',
      },
      grena84: {
        turns: "1",
        cnt: "1",
        pn: "f",
        fstr: 'p:contains("\u0413\u0440\u0430\u043D\u0430\u0442\u0430 \xAB\u041A\u0438\u0441\u043B\u043E\u0442\u043D\u0430\u044F\xBB")',
        image:
          '<img class="icon" src="/@/images/obj/fight_item/weapon84.png" style="margin:1px;">',
      },
      grena85: {
        turns: "1",
        cnt: "1",
        pn: "f",
        fstr: 'p:contains("\u0413\u0440\u0430\u043D\u0430\u0442\u0430 \xAB\u0421\u0432\u0435\u0442\u043B\u044F\u0447\u043E\u043A\xBB")',
        image:
          '<img class="icon" src="/@/images/obj/fight_item/weapon85.png" style="margin:1px;">',
      },
      grena66m1: {
        turns: "1",
        cnt: "1",
        pn: "f",
        fstr: 'p:contains("\u041A\u043E\u043A\u0442\u0435\u0439\u043B\u044C \u041C\u043E\u043B\u043E\u0442\u043E\u0432\u0430 [\u0423\u043B\u044C\u0442\u0440\u0430]")',
        image:
          '<img class="icon" src="/@/images/obj/weapon66_mf1.png" style="margin:1px;">',
      },
      grena66: {
        turns: "1",
        cnt: "1",
        pn: "f",
        fstr: 'p:contains("\u041A\u043E\u043A\u0442\u0435\u0439\u043B\u044C \u041C\u043E\u043B\u043E\u0442\u043E\u0432\u0430"):not(:contains("[\u0423\u043B\u044C\u0442\u0440\u0430]"))',
        image:
          '<img class="icon" src="/@/images/obj/weapon66.png" style="margin:1px;">',
      },
      grena63m2: {
        turns: "1",
        cnt: "1",
        pn: "f",
        fstr: 'p:contains("\u041A\u043B\u0430\u0441\u0442\u0435\u0440\u043D\u0430\u044F \u0433\u0440\u0430\u043D\u0430\u0442\u0430 [\u041C\u0435\u0433\u0430]")',
        image:
          '<img class="icon" src="/@/images/obj/weapon63_mf2.png" style="margin:1px;">',
      },
      grena63m1: {
        turns: "1",
        cnt: "1",
        pn: "f",
        fstr: 'p:contains("\u041A\u043B\u0430\u0441\u0442\u0435\u0440\u043D\u0430\u044F \u0433\u0440\u0430\u043D\u0430\u0442\u0430 [\u0423\u043B\u044C\u0442\u0440\u0430]")',
        image:
          '<img class="icon" src="/@/images/obj/weapon63_mf1.png" style="margin:1px;">',
      },
      grena63: {
        turns: "1",
        cnt: "1",
        pn: "f",
        fstr: 'p:contains("\u041A\u043B\u0430\u0441\u0442\u0435\u0440\u043D\u0430\u044F \u0433\u0440\u0430\u043D\u0430\u0442\u0430"):not(:contains("[\u0423\u043B\u044C\u0442\u0440\u0430]")):not(:contains("[\u041C\u0435\u0433\u0430]"))',
        image:
          '<img class="icon" src="/@/images/obj/weapon63.png" style="margin:1px;">',
      },
      c4: {
        turns: "1",
        cnt: "1",
        pn: "f",
        fstr: 'p:contains("\u0412\u0437\u0440\u044B\u0432\u0447\u0430\u0442\u043A\u0430 \u04214")',
        image:
          '<img class="icon" src="/@/images/obj/fight_item/weapon88.png" style="margin:1px;">',
      },
      grena37: {
        turns: "1",
        cnt: "1",
        pn: "f",
        fstr: 'p:contains("\u0431\u043E\u043C\u0431\u0430-\u0432\u043E\u043D\u044E\u0447\u043A\u0430")',
        image:
          '<img class="icon" src="/@/images/obj/weapon37.png" style="margin:1px;">',
      },
      grena38: {
        turns: "1",
        cnt: "1",
        pn: "f",
        fstr: 'p:contains("\u0425\u043B\u043E\u043F\u0443\u0448\u043A\u0430\u2014\u0440\u0430\u0437\u043B\u0443\u0447\u043D\u0438\u0446\u0430")',
        image:
          '<img class="icon" src="/@/images/obj/weapon38.png" style="margin:1px;">',
      },
      grena46: {
        turns: "1",
        cnt: "1",
        pn: "f",
        fstr: 'p:contains("\u041C\u043E\u0449\u043D\u044B\u0439 \u0441\u043D\u0435\u0436\u043E\u043A")',
        image:
          '<img class="icon" src="/@/images/obj/weapon46.png" style="margin:1px;">',
      },
      grena79: {
        turns: "1",
        cnt: "1",
        pn: "f",
        fstr: 'p:contains("\u0412\u0437\u0440\u044B\u0432\u043D\u043E\u0439 \u043C\u0430\u043D\u0434\u0430\u0440\u0438\u043D")',
        image:
          '<img class="icon" src="/@/images/obj/fight_item/weapon79.png" style="margin:1px;">',
      },
      grduck: {
        turns: "1",
        cnt: "1",
        pn: "f",
        fstr: 'p:contains("\u0413\u0440\u0430\u043D\u0430\u0442\u0430 \xAB\u0423\u0442\u043E\u0447\u043A\u0430\xBB")',
        image:
          '<img class="icon" src="/@/images/obj/dung_prize/duck.png" style="margin:1px;">',
      },
      easydo: {
        turns: "1",
        cnt: "1",
        pn: "f",
        fstr: 'p:contains("\u0421\u0432\u0435\u0442\u043E\u0448\u0443\u043C\u043E\u0432\u0430\u044F \u0433\u0440\u0430\u043D\u0430\u0442\u0430")',
        image:
          '<img class="icon" src="/@/images/obj/weapon62.png" style="margin:1px;">',
      },
      svistok: {
        turns: "1",
        cnt: "1",
        pn: "f",
        fstr: 'p:contains("\u0432 \u0431\u043E\u0439 \u043E\u0442\u0440\u044F\u0434 \u041E\u041C\u041E\u041D\u0430")',
        image:
          '<img class="icon" src="/@/images/obj/item28.png" style="margin:1px;">',
      },
      easytarg: {
        turns: "5",
        cnt: "",
        pn: "et",
        fstr: 'p:contains("\u0421\u0432\u0435\u0442\u043E\u0448\u0443\u043C\u043E\u0432\u0430\u044F \u0433\u0440\u0430\u043D\u0430\u0442\u0430")',
        image: '<i class="icon icon-easytarget" style="margin:1px;"></i>',
      },
      dim: {
        turns: "2",
        cnt: "1",
        pn: "f",
        fstr: 'p:contains("\u0414\u044B\u043C\u043E\u0432\u0430\u044F \u0448\u0430\u0448\u043A\u0430")',
        image: '<i class="icon icon-foggranade" style="margin:1px;"></i>',
      },
      sovetabil7: {
        turns: "1",
        cnt: "5",
        pn: "f",
        fstr: 'p:contains("\u043A\u043E\u043C\u0430\u043D\u0434\u0443\u0435\u0442 \u041E\u041C\u041E\u041D\u0443")',
        image:
          '<span class="sovetabil7"><i class="icon" style="margin:1px;"></i></span>',
      },
      sovetabil1: {
        turns: "1",
        cnt: "",
        pn: "f",
        fstr: 'p:contains("\u0432\u043E\u043E\u0434\u0443\u0448\u0435\u0432\u043B\u044F\u0435\u0442 \u0438\u0437\u0431\u0438\u0440\u0430\u0442\u0435\u043B\u0435\u0439")',
        image:
          '<span class="sovetabil1"><i class="icon" style="margin:1px;"></i></span>',
      },
      periscope: {
        turns: "1",
        cnt: "",
        pn: "f",
        fstr: 'p:contains("\u0432\u044B\u0437\u044B\u0432\u0430\u0435\u0442 \u043F\u043E\u0434\u043B\u043E\u0434\u043A\u0443")',
        image: '<span class="sub-periscope"><i></i></span>',
      },
      "rage-1": {
        turns: "",
        cnt: "",
        pn: "f",
        fstr: 'p:contains("\u0432\u0441\u043F\u043B\u044B\u0432\u0430\u0435\u0442 \u0441\u043E \u0434\u043D\u0430")',
        image:
          '<span class="rage-1"><i style="zoom:0.9; margin:1px;"></i></span>',
      },
      car_sw2: {
        turns: "3",
        cnt: "5",
        pn: "f",
        fstr: 'p:contains("\u0410\u0431\u0441\u043E\u043B\u044E\u0442\u043D\u0443\u044E \u0437\u0430\u0449\u0438\u0442\u0443")',
        image:
          '<img class="icon" src="/css/images/obj/beast_ability/ability_sw_hide.png" style="margin:1px;">',
      },
      ruslan: {
        turns: "1",
        cnt: "9",
        pn: "f",
        fstr: 'p:contains("\u043F\u043E\u043F\u043E\u043B\u043D\u044F\u0435\u0442 \u0437\u0430\u043F\u0430\u0441\u044B \u0431\u043E\u0435\u043F\u0440\u0438\u043F\u0430\u0441\u043E\u0432")',
        image:
          '<img class="icon" src="/@/images/obj/cars/70.png" style="margin:1px; filter: contrast(2.0);">',
      },
      tramp: {
        turns: "1",
        cnt: "5",
        pn: "f",
        fstr: 'p:contains("\u0432\u0435\u043B\u0438\u043A\u0438\u043C, \u043A\u0430\u043A")',
        image:
          '<img class="icon" src="/@/images/loc/trump/talant_3.png" style="margin:1px; filter: contrast(2.0);">',
      },
      mgs: {
        turns: "1",
        cnt: "5",
        pn: "l",
        fstr: 'p:contains("\u041C\u043E\u0441\u0413\u043E\u0441\u0421\u0442\u0440\u0430\u0445")',
        image:
          '<img class="icon" src="/@/images/obj/8march2/items/128/6.png" style="margin:1px; filter: contrast(2.0);">',
      },
      rabbit: {
        turns: "1",
        cnt: "5",
        pn: "l",
        fstr: 'p:contains("\u041F\u0430\u0441\u0445\u0430\u043B\u044C\u043D\u044B\u0439 \u043A\u0440\u043E\u043B\u0438\u043A")',
        image:
          '<img class="icon" src="/@/images/obj/rabbit.png" style="margin:1px;">',
      },
      rocketab1: {
        turns: "1",
        cnt: "",
        pn: "f",
        fstr: 'p:contains("\u0420\u0430\u043A\u0435\u0442\u0430 \u0438\u0433\u0440\u043E\u043A\u0430")',
        image: '<i class="icon icon-rocket-1" style="margin:1px;"></i>',
      },
      sany: {
        turns: "1",
        cnt: "2",
        pn: "f",
        fstr: 'p:contains("\u043A\u0430\u0442\u0430\u0435\u0442\u0441\u044F \u043D\u0430 \u0441\u0430\u043D\u044F\u0445")',
        image:
          '<img class="icon" src="/@/images/obj/cars/56.png" style="margin:1px;">',
      },
      roketxsany: {
        turns: "1",
        cnt: "",
        pn: "l",
        fstr: 'p:contains("\u0441\u043F\u043E\u0441\u043E\u0431\u043D\u043E\u0441\u0442\u044C \u041D\u043E\u0432\u043E\u0433\u043E\u0434\u043D\u0435\u0435 \u0432\u044B\u0437\u0434\u043E\u0440\u043E\u0432\u043B\u0435\u043D\u0438\u0435")',
        image:
          '<img class="icon" src="/@/images/obj/cars/56.png" style="margin:1px;"><span style="color:#001dff; margin-left:-10px; font-size:14px;">&otimes;</span>',
      },
      gazi: {
        turns: "1",
        cnt: "2",
        pn: "f",
        fstr: 'p:contains("\u0416\u0435\u0440\u0442\u0432\u0430 \u043E\u0442\u0440\u0430\u0432\u043B\u044F\u0435\u0442\u0441\u044F")',
        image:
          '<img class="icon" src="/@/images/obj/cars/51.png" style="margin:1px;">',
      },
      roketxgazi: {
        turns: "1",
        cnt: "",
        pn: "l",
        fstr: 'p:contains("\u0441\u043F\u043E\u0441\u043E\u0431\u043D\u043E\u0441\u0442\u044C \u0412\u044B\u0445\u043B\u043E\u043F\u043D\u044B\u0435 \u0433\u0430\u0437\u044B")',
        image:
          '<img class="icon" src="/@/images/obj/cars/51.png" style="margin:1px;"><span style="color:#ff0000; margin-left:-10px; font-size:14px;">&otimes;</span>',
      },
      rocketab2: {
        turns: "1",
        cnt: "9",
        pn: "f",
        fstr: 'p:contains("\u043E\u0431\u043B\u0435\u0442\u0435\u0432 \u0432\u043E\u043A\u0440\u0443\u0433 \u0417\u0435\u043C\u043B\u0438")',
        image: '<i class="icon icon-rocket-2" style="margin:1px;"></i>',
      },
      noheal: {
        turns: "",
        cnt: "",
        pn: "l",
        fstr: 'p:contains("\u043D\u0435 \u043C\u043E\u0436\u0435\u0442 \u0432\u043E\u0441\u0441\u0442\u0430\u043D\u043E\u0432\u0438\u0442\u044C \u0437\u0434\u043E\u0440\u043E\u0432\u044C\u0435 \u043D\u0438\u0447\u0435\u043C")',
        image:
          '<span class="icon icon-heal" style="margin:1px;position:relative;"><span style="color:#ff0000; position:absolute; font-size:14px; left:4px; top:-4px;">&otimes; </span></span>',
      },
      car_sw: {
        turns: "1",
        cnt: "5",
        pn: "f",
        fstr: 'p:contains("\u0417\u0432\u0435\u0437\u0434\u0430 \u0441\u043C\u0435\u0440\u0442\u0438")',
        image:
          '<img class="icon" src="/css/images/obj/beast_ability/ability_sw_deathray_2.png" style="margin:1px;">',
      },
      forcejoin: {
        turns: "1",
        cnt: "",
        pn: "f",
        fstr: 'p:contains("\u0432\u043C\u0435\u0448\u0438\u0432\u0430\u0435\u0442\u0441\u044F \u0432 \u0431\u043E\u0439")',
        image: '<span class="icon icon-forcejoin" style="margin:1px;"></span>',
      },
      kgranat: {
        turns: "4",
        cnt: "",
        pn: "f",
        fstr: 'p:contains("\u041A\u0430\u043B\u044C\u044F\u043D \xAB\u0413\u0440\u0430\u043D\u0430\u0442\u043E\u0432\u044B\u0439\xBB")',
        image:
          '<img class="icon" src="/@/images/obj/shisha/red1.png" style="margin:1px;">',
      },
      kled: {
        turns: "6",
        cnt: "",
        pn: "f",
        fstr: 'p:contains("\u041A\u0430\u043B\u044C\u044F\u043D \xAB\u041B\u0435\u0434\u044F\u043D\u043E\u0439\xBB")',
        image:
          '<img class="icon" src="/@/images/obj/shisha/frost1.png" style="margin:1px;">',
      },
      nokick: {
        turns: "2",
        cnt: "",
        pn: "f",
        fstr: 'p:contains("\u041D\u0435 \u0431\u0435\u0439\u0442\u0435 \u0435\u0433\u043E!")',
        image:
          '<span class="red">\u041D\u0435 \u0431\u0438\u0442\u044C! </span>',
      },
      malina: {
        turns: "1",
        cnt: "",
        pn: "f",
        fstr: 'p:contains("\u0440\u0430\u0437\u0433\u0430\u0434\u044B\u0432\u0430\u0435\u0442 \u041A\u043E\u043C\u0431\u0438\u043D\u0430\u0446\u0438\u044E \u041F\u0430\u0445\u0430\u043D\u0430")',
        image:
          '<img class="icon" src="/@/images/obj/vovan_note.png" style="margin:1px;">',
      },
    };
    var X = window.Moscowpoly,
      qe = window.SteppedEase,
      Z = window.TweenLite;
    function Pe() {
      (X.animateDices = function (t) {
        var e = this,
          n = this.$dice1,
          o = this.$dice2;
        n.unbind("click"),
          o.unbind("click"),
          n.removeAttr("style"),
          n.css({ "background-position": "0 0" }).show(0);
        var r = mt_rand(10, 20),
          a = (mt_rand(1, 2) * r) / 1e3,
          s = Z.to(n, a, {
            backgroundPosition: -1 * 65 * r + "px 0",
            ease: qe.config(r),
            paused: !0,
            onComplete: function () {
              n
                .css("background-position", "")
                .removeClass("i-1 i-2 i-3 i-4 i-5 i-6")
                .addClass("i-" + t[0]),
                a >= l && e.onAnimateDicesComplete();
            },
          });
        o.removeAttr("style"), o.css("background-position", "0 -65px").show(0);
        var c = mt_rand(10, 20),
          l = (mt_rand(1, 2) * c) / 1e3,
          p = Z.to(o, l, {
            backgroundPosition: -1 * 65 * c + "px -65px",
            ease: qe.config(c),
            paused: !0,
            onComplete: function () {
              o
                .css("background-position", "")
                .removeClass("i-1 i-2 i-3 i-4 i-5 i-6")
                .addClass("i-" + t[1]),
                a < l && e.onAnimateDicesComplete();
            },
          }),
          d = X.dicePositions[mt_rand(0, X.dicePositions.length - 1)];
        n.css(d);
        var g = { ease: Power1.easeOut, paused: !0 };
        for (var u in d) g[u] = mt_rand(90, 350);
        var w = Z.to(n, a, g);
        o.css(d);
        var b = { ease: Power1.easeOut, paused: !0 };
        for (var u in d)
          (b[u] = mt_rand(90, 350)),
            Math.abs(g[u] - b[u]) < 35 && (g[u] += g[u] > b[u] ? 50 : -50);
        var M = Z.to(o, l, b);
        s.play(), p.play(), w.play(), M.play();
      }),
        (X.animateFigureRoute = function (t) {
          if (t.length == 0) {
            this.setInAction(!1),
              this.setCellActive(this.data.current),
              this.updateInfoHTML(),
              this.initState();
            return;
          }
          var e = this,
            n = X.getFigurePositionByCell(t[0]);
          Z.to(this.$figure, 0.1, {
            top: n.top,
            left: n.left,
            ease: Linear.easeNone,
            paused: !1,
            onComplete: function () {
              (t = t.splice(1, t.length - 1)), e.animateFigureRoute(t);
            },
          });
        }),
        (X.doActivate = function () {
          if (!this.inAction) {
            this.setInAction(!0);
            var t = this;
            postUrl(
              "/home/moscowpoly_activate/",
              { action: "moscowpoly_activate", ajax: 1 },
              "post",
              function (e) {
                (t.state = e.state),
                  t.setInAction(!1),
                  t.updateInfoHTML(),
                  t.initState();
              }
            );
          }
        });
    }
    var On = [
      {
        selector:
          "#content > div > div.boss-common-block > div.boss-common-bottom-panel > div > div > span.boss-common-active-from-value",
        url: "https://www.moswar.ru/shaman/",
        imgSrc: "/@/images/loc/shaman/abil_6.png",
        targetHref: "/shaman/",
      },
      {
        selector:
          "#content > div > div > div.grumpy2019-bottom-panel > div.grumpy2019-available-block > span.grumpy2019-available-value",
        url: "https://www.moswar.ru/grumpy/",
        imgSrc: "/@/images/loc/grumpy/abils/abil_1.png",
        targetHref: "/grumpy/",
      },
      {
        selector:
          "#content > div > div > div.boss-common-available-block > span.boss-common-available-value",
        url: "https://www.moswar.ru/hacker/",
        imgSrc: "/@/images/obj/gifts2024/may/hacker.png",
        targetHref: "/hacker/",
      },
      {
        selector:
          "#content > div > div.rocket2023-block > div.rocket2023-available-block > span.rocket2023-available-value",
        url: "https://www.moswar.ru/kosmodromx/",
        imgSrc: "/@/images/obj/gifts2023/may/abil_kosm_smoke.png",
        targetHref: "/kosmodromx/",
      },
      {
        selector: "TODO dyi selector",
        url: "https://www.moswar.ru/kosmodromx/",
        imgSrc: "/@/images/loc/rocket/rocket.png",
        targetHref: "/kosmodromx/",
      },
      {
        selector:
          "#hawthorn-popup > div > div.hawthorn-popup__actions > div > span",
        url: "https://www.moswar.ru/trainer/vip/",
        imgSrc: "/@/images/loc/vip/hawthorn_icon.png",
        targetHref: "/trainer/vip/hawthorn/",
      },
      {
        selector:
          "#content > table > tbody > tr > td:nth-child(2) > div.block-bordered-tattoo > p:nth-child(3) > span",
        url: "https://www.moswar.ru/nightclub/",
        imgSrc: "/@/images/obj/8march6/tattoo_mach.png",
        targetHref: "/nightclub/",
      },
      {
        selector:
          "#content > div > div.musk2020-bottom-panel > div > div.musk2020-mars-actions.disabled > div > span",
        url: "https://www.moswar.ru/mars2024/",
        imgSrc: "/@/images/loc/musk/musk2020-mars2024.png",
        targetHref: "/mars2024/",
      },
      {
        selector:
          "#dino-tab-content-2 > div.dinopark-dino-stats > div:last-child > div.dinopark-dino-stat__value > span",
        url: "https://www.moswar.ru/dinopark/",
        imgSrc: "/@/images/loc/dinopark/dinoegg.png",
        targetHref: "/dinopark/",
      },
      {
        selector:
          "#content > div > div.icecream-fabric > div:nth-child(2) > div.icecream-fabric-item__content > div.icecream-fabric-item-actions > div > span.time",
        url: "https://www.moswar.ru/toniks/",
        imgSrc: "/@/images/loc/cocktails/pink_3.png",
        targetHref: "/toniks/",
      },
      {
        selector:
          "#content > div > div.pilaf-actions .pilaf-activate-button-inner2",
        url: "https://www.moswar.ru/teahouse/",
        imgSrc: "/@/images/loc/pilaf/objs/obj_3.png",
        targetHref: "/teahouse/",
      },
      {
        selector:
          "#content > div > div.bender-content > div.bender-use > div > div > button",
        url: "https://www.moswar.ru/badasrobot/",
        imgSrc: "/@/images/obj/gifts2017/futurama/bender/head.png",
        targetHref: "/badasrobot/",
      },
    ];
    async function Nn({
      selector: t,
      url: e,
      imgSrc: n,
      targetHref: o,
      onclick: r,
    }) {
      if (!t || !e || !n) {
        console.log("Could not fetch timer. Data missing.");
        return;
      }
      let a = await f(t, e);
      o === "/dinopark/" &&
        (n = (
          await f(".dinopark-dino-pic__img", "https://www.moswar.ru/dinopark/")
        ).getAttribute("src"));
      let s = A(
        `<img style="width: 56px; height: 56px; cursor: pointer; ${o === "/shaman/" && "transform: scale(1.4);transform-origin: center;"}" src=${n} />`
      );
      if (a === void 0) return !1;
      a === null
        ? (a = A("<span>\u0413\u043E\u0442\u043E\u0432\u043E</span>"))
        : a.innerText ===
            "\u0417\u0430\u0431\u0440\u0430\u0442\u044C \u043F\u043E\u0439\u043B\u043E!"
          ? (a.innerText = "\u0413\u043E\u0442\u043E\u0432\u043E")
          : countdown(a),
        (a.style.cssText = Ie.hawthorn),
        a?.getAttribute("class")?.includes("button") &&
          $(a).css({ lineHeight: "24px", padding: "3px 12px" }),
        o === "/badasrobot/" && a.styles;
      let c = A("<div></div>");
      return (
        (c.style.cssText =
          "display: flex; align-items: center; flex-direction: column;"),
        c.appendChild(s),
        c.appendChild(a),
        o && s.addEventListener("click", () => AngryAjax.goToUrl(o)),
        r && s.addEventListener("click", r),
        c
      );
    }
    async function Kt() {
      let t = async () => {
          let o = (
              await Promise.all(
                On.map(async (s) => {
                  try {
                    return await Nn(s);
                  } catch (c) {
                    return console.log("Error processing timer:", s, c), null;
                  }
                })
              )
            ).filter(Boolean),
            r = A(
              `<div class="timers-container" style="${Ie.timersContainer}"></div>`
            );
          function a() {
            window.innerWidth < 1330
              ? (r.style.display = "none")
              : (r.style.display = "grid");
          }
          window.addEventListener("resize", a),
            a(),
            r.replaceChildren(...o),
            document.querySelector(".main-block").appendChild(r);
        },
        e = A(`
      <div class="button" style="position: fixed; top: 32px; right: 8px;" id="timers-trigger"><span class="f"><i class="rl"></i><i class="bl"></i><i class="brc"></i><div class="c" style="padding: 1px 3px;">
      \u041F\u043E\u043A\u0430\u0437\u0430\u0442\u044C \u0422\u0430\u0439\u043C\u0435\u0440\u044B
      </div></span></div>
      `);
      e.addEventListener("click", () => {
        t(), e.remove();
      }),
        document.querySelector(".main-block").appendChild(e);
    }
    var Ie = {
      hawthorn: `
    text-align: center;
    margin: auto 4px;
    font-family: 'bloccregular';
    font-size: 16px;
    color: #ffffff;
    text-shadow: rgb(73, 73, 73) 2px 0px 0px, rgb(73, 73, 73) 1.75517px 0.958851px 0px, rgb(73, 73, 73) 1.0806px 1.68294px 0px, rgb(73, 73, 73) 0.141474px 1.99499px 0px, rgb(73, 73, 73) -0.832294px 1.81859px 0px, rgb(73, 73, 73) -1.60229px 1.19694px 0px, rgb(73, 73, 73) -1.97998px 0.28224px 0px, rgb(73, 73, 73) -1.87291px -0.701566px 0px, rgb(73, 73, 73) -1.30729px -1.5136px 0px, rgb(73, 73, 73) -0.421592px -1.95506px 0px, rgb(73, 73, 73) 0.567324px -1.91785px 0px, rgb(73, 73, 73) 1.41734px -1.41108px 0px, rgb(73, 73, 73) 1.92034px -0.558831px 0px;
  `,
      timersContainer: `
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
    min-width: 190px;
    position: fixed;
    top: 32px;
    right: 8px;
    font-size: 79%;
    font-family: Tahoma, Arial, sans-serif;
    line-height: 1.3;
    padding: 12px 6px;
    border-radius: 8px;
    background: rgba(0, 0, 0, 0.8);
    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.3);
    border: none;
    min-width: 190px;
    `,
    };
    var Le = window.player,
      Xt = window.showAlert;
    var Vt = {
      accept: "*/*",
      "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
      "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin",
      "x-requested-with": "XMLHttpRequest",
    };
    async function Rn() {
      let t = await fetch("https://www.moswar.ru/casino/", {
          headers: Vt,
          referrer: "https://www.moswar.ru/casino/",
          referrerPolicy: "strict-origin-when-cross-origin",
          body: "action=ore&count=20",
          method: "POST",
          mode: "cors",
          credentials: "include",
        }),
        { success: e } = await t.json();
      return { success: e };
    }
    async function it(t) {
      let e = await E();
      return e
        ? (Xt(
            `${t.name}`,
            `\u{1F6A7} Cooldown in effect. Retrying in ${e} seconds.`
          ),
          setTimeout(t, (e + 5) * 1e3),
          !0)
        : !1;
    }
    async function En(t = "196690061") {
      await fetch(`https://www.moswar.ru/player/json/withdraw/${t}/`, {
        headers: {
          accept: "application/json, text/javascript, */*; q=0.01",
          "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
          "if-modified-since": new Date().toUTCString(),
          "sec-ch-ua": '"Chromium";v="131", "Not_A Brand";v="24"',
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform":
            Le.nickname === "barifan" ? '"macOS"' : '"Linux"',
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-origin",
          "x-requested-with": "XMLHttpRequest",
        },
        referrer: "https://www.moswar.ru/player/",
        referrerPolicy: "strict-origin-when-cross-origin",
        body: null,
        method: "GET",
        mode: "cors",
        credentials: "include",
      });
    }
    async function gt() {
      try {
        let e = (
            await f(
              "#content > div > table > tbody > tr > td:nth-child(1) > div > div > div.change-area > div.exchange > div.get > div > div > img",
              "https://www.moswar.ru/factory/build/bronevik/"
            )
          ).getAttribute("alt"),
          o = +(
            await f(
              "#content > div > table > tbody > tr > td:nth-child(1) > div > div > div.change-area > div.cooldown-wrapper > span.cooldown",
              "https://www.moswar.ru/factory/build/bronevik/"
            )
          ).getAttribute("endtime");
        if (
          e ===
          "\u041A\u0440\u0430\u0441\u043D\u044B\u0439 \u0441\u0442\u044F\u0433"
        )
          return (
            console.log(`[\u{1F6A9}] Found matching piece: ${e}. Buying it...`),
            await fetch("https://www.moswar.ru/factory/exchange/", {
              headers: {
                accept: "*/*",
                "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
                "content-type":
                  "application/x-www-form-urlencoded; charset=UTF-8",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-origin",
                "x-requested-with": "XMLHttpRequest",
              },
              referrer: "https://www.moswar.ru/factory/build/bronevik/",
              referrerPolicy: "strict-origin-when-cross-origin",
              body: "action=exchange&code=bronevik&__referrer=%2Ffactory%2Fbuild%2Fbronevik%2F&return_url=%2Ffactory%2Fbuild%2Fbronevik%2F",
              method: "POST",
              mode: "cors",
              credentials: "include",
            }),
            setTimeout(gt, 2e3)
          );
        console.log(`[\u{1F6A9}] No matching piece. (${e})`);
        let r = o * 1e3 - Date.now() + 3e3;
        r > 0
          ? (console.log(
              `[\u{1F6A9}] Bronevik check in ${v(Math.floor(r / 1e3))}.`
            ),
            setTimeout(gt, r))
          : console.log("[\u{1F6A9}] Bronevik PIECE CHECK!");
      } catch (t) {
        console.log(
          `[\u{1F6A9}] Could not find bronevik piece.
`,
          t
        ),
          setTimeout(() => gt(), 1e3);
      }
    }
    async function Hn() {
      await B("1052323"), await U(), await P(), await C(), await O();
    }
    async function Dn() {
      await Et(),
        await Ht(),
        await dt(),
        await Kt(),
        ut(),
        Pe(),
        Dt(),
        Gt(),
        zt(),
        mt(),
        console.log("\u2139\uFE0F Enhanced client-side functionality."),
        window.SMURF_MODE && (console.log("SMURF MODE"), await Me()),
        $(document).ajaxStop(mt);
    }
    async function Me() {
      await U(1), await P(10), await R(), await C(20);
      async function t() {
        await fetch("https://www.moswar.ru/quest/", {
          headers: {
            accept: "*/*",
            "accept-language": "en-GB,en;q=0.9",
            "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "x-requested-with": "XMLHttpRequest",
          },
          referrer: "https://www.moswar.ru/quest/",
          referrerPolicy: "strict-origin-when-cross-origin",
          body: "action=nextstep&__ajax=1&return_url=%2Fquest%2F",
          method: "POST",
          mode: "cors",
          credentials: "include",
        });
      }
      $(document).ajaxStop(function () {
        location.pathname === "/quest/" && t();
      });
    }
    return He(Gn);
  })();
  utils_.init();
  //# sourceMappingURL=bundle.js.map
    // В Конце СТРОКИ ВСТАВИЛ КОД
    document.addEventListener("DOMContentLoaded", () => {
  const observer = new MutationObserver(() => {
    const target = document.querySelector("#content > div > div.block-bordered");
    if (typeof Ut === "function" && target && !target.querySelector("button")) {
      console.log("[🧪] Вызов Ut() для вставки кнопок");
      Ut();
      observer.disconnect();
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
});
 // В ЭТИХ РАМКАХ (В КОНЦЕ СТРОКИ)


// === Глобальные функции (восстановлены из оригинала) ===
window.updateStatus = function(text) {
    const el = document.getElementById("mw-status");
    if (el) el.textContent = text;
};

window.resetSlot = function(index) {
    const raw = localStorage.getItem("moswar_saved_sets");
    if (!raw) return;
    const sets = JSON.parse(raw);
    if (!Array.isArray(sets)) return;
    sets[index] = null;
    localStorage.setItem("moswar_saved_sets", JSON.stringify(sets));
    drawSetSummary();
    updateSetIndicator();
    updateStatus(`Слот ${index + 1} очищен`);
};

window.sendSet = function(slot) {
    const sets = JSON.parse(localStorage.getItem("moswar_saved_sets") || "{}");
    const set = sets[String(slot)];
    if (!set || !set.length) {
        alert("❌ Комплект не найден или пуст");
        return;
    }
    localStorage.setItem("moswar_active_set", String(slot));
    updateSetIndicator();
};

window.applySavedSet = function(slot) {
    const sets = JSON.parse(localStorage.getItem("moswar_saved_sets") || "{}");
    const selected = sets[slot];
    if (selected && selected.length) {
        document.querySelectorAll('input.dynamic-checkbox:checked').forEach(cb => cb.checked = false);
        selected.forEach(s => {
            const carInput = document.querySelector(`input[name="car"][value="${s.carId}"]`);
            if (carInput) {
                const li = carInput.closest("li");
                const dirInput = li.querySelector(`input[name="direction"][value="${s.rideId}"]`);
                if (dirInput) {
                    const checkbox = li.querySelector('input.dynamic-checkbox');
                    if (checkbox) checkbox.checked = true;
                }
            }
        });
        console.log(`✅ Применен комплект из слота ${slot}`);
    }
};

window.saveSetModal = function() {
    const rides = It();
    console.log("💾 Выбрано:", rides);
    alert("💾 Сохранение комплекта: " + rides.length + " машин");
    if (!rides.length) return;
    const slot = prompt("Введите номер слота (1, 2, 3 или 4):");
    if (!['1', '2', '3', '4'].includes(slot)) return;
    const sets = JSON.parse(localStorage.getItem("moswar_saved_sets") || "{}");
    sets[slot] = rides;
    localStorage.setItem("moswar_saved_sets", JSON.stringify(sets));
    localStorage.setItem("moswar_active_set", slot);
    updateSetIndicator();
    applySavedSet(slot);
    drawSetSummary();
    alert("✅ Сохранено!");
};

window.refuelAllTransport = async function() {
    const cars = Array.from(document.querySelectorAll('input[name="car"]'));
    let refueled = 0;
    await Promise.all(cars.map(async input => {
        const carId = input.value;
        try {
            await fetch(`https://www.moswar.ru/automobile/buypetrol/${carId}/`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: `__ajax=1&return_url=%2Fautomobile%2Fcar%2F${carId}`
            });
            console.log(`⛽ Попытка заправки машины: ${carId}`);
            refueled++;
        } catch (err) {
            console.warn(`❌ Ошибка при заправке ${carId}:`, err);
        }
    }));
    updateStatus(`✅ Попыток заправки: ${refueled}`);
};


})();

