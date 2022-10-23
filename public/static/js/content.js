/*global chrome*/
var wsc;
const fStr = "/*fStr000*/";
const iStr = "/*iStr000*/";
const gameId = [
    "roulette",
    "baccarat",
    "blackjack"
];

var _xpath = {
    iframe: `//*[contains(@src, "https://babylonstk.evo-games.com")]`,
    gameName: `//span[@data-role="table-name"]`,
    lastNumber: `//div[contains(@class,"recent-numbers")]/div/div[${iStr}]//span[contains(@class, "value")]`,
    viewImmersive: `//div[@data-role="current-view-immersivev2"]`,
    viewClassic: `//div[@data-role="current-view-classic"]`,
    viewImmersive__Status: `//div[contains(@class, "timerAndResult")]/div`,
    viewClassic__Status: `//div[@data-role="status-text"][contains(text(), "BETS") or contains(text(), "BLACK") or contains(text(), "GREEN") or contains(text(), "RED")]`
};
var lastStatus = "";
var currentGame = {
    frame: false,
    game: "",
    id: -1
};
const getElementByXpath = xpath => document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
const xpath = (k, i = 1, d = "iframe") => _xpath[k].replace(fStr, _xpath[d] + "//").replace(iStr, i + "");
const parseId = title => gameId.indexOf([(gameId.filter(value => title.toLowerCase().includes(value.toLowerCase()))[0])][0]);
const log = (src, text) => console.log(src.split(",").map(value => `[${value}]`).join(""), text);
var frameExist = false;
(async () => {
    while (true) {
        var x = getElementByXpath(xpath("iframe"));
        !frameExist && log("FRAMECHECK", "Checking..");
        if (!!x) {
            !frameExist && log("FRAMECHECK", "Frame exist!");
            if (!wsc) {
                try {
                    log("FRAMECHECK,WSS", "WSS not set! Connecting port 30105..");
                    wsc = new WebSocket(`ws://localhost:30105`);
                    wsc.onopen = () => {
                        log("FRAMECHECK,WSS", "WSS opened! Waiting for data..");
                    };
                    wsc.onmessage = data => {
                        log("FRAMECHECK,WSS", `WSS sent data: ${data.data}`);
                    };
                    wsc.onclose = () => wsc = null;
                    wsc.onerror = error => console.log(error);
                } catch (error) {
                    log("FRAMECHECK,WSS", "Failed to connect WSS. WSS might not be active or firewall blocks the connection. ");
                }
            }
            currentGame.frame = true;
            if (!frameExist) {
                var tmpText = getElementByXpath(xpath("gameName"));
                if (tmpText && tmpText.textContent.length > 0) {
                    currentGame.game = tmpText.textContent;
                    currentGame.id = parseId(tmpText.textContent);
                }
                console.log(`SET: ${JSON.stringify(currentGame)}`);
            }
            localStorage.setItem("currentGame", JSON.stringify(currentGame));
            frameExist = true;
        } else {
            currentGame.frame = false;
            frameExist = false;
        }
        await new Promise(r => setTimeout(r, 3000));
    }
})();
(async () => {
    while (true) {
        if (!currentGame.frame) { await new Promise(r => setTimeout(r, 1000)); continue; }
        log("FRAMECHECK,GAMETYPE", "Checking if view is classic or immersive..");
        var isClassicView = false;
        if (!!getElementByXpath(xpath("viewClassic"))) {
            log("FRAMECHECK,GAMETYPE", "View is classic.");
            isClassicView = true;
        } else if (!!getElementByXpath(xpath("viewImmersive"))) { } else {
            !isClassicView && log("FRAMECHECK,GAMETYPE", "Couldn't detect view. Retrying..");
            await new Promise(r => setTimeout(r, 10000));
            continue;
        }
        !isClassicView && log("FRAMECHECK,GAMETYPE", "View is immersive.");
        log("FRAMECHECK,GAMETYPE", `View is ${isClassicView ? "Classic" : "Immersive"}.`);
        if (!!getElementByXpath(xpath(isClassicView ? "viewClassic__Status" : "viewImmersive__Status"))) {
            log("FRAMECHECK,GAMETYPE", `Status is accessable for the ${isClassicView ? "Classic" : "Immersive"} view.`);
            var numbers = [];
            for (let index = 1; index < 3; index++) {
                var lastNumberElement;
                while (true) {
                    lastNumberElement = getElementByXpath(xpath("lastNumber", index));
                    if (lastNumberElement && lastNumberElement.textContent.length > 0) break;
                    await new Promise(r => setTimeout(r, 300));
                }
                var value = lastNumberElement.textContent;
                log("FRAMECHECK,GAMETYPE", `Number at index ${index} is ${value}`);
                numbers.push(value);
            }
            log("FRAMECHECK,GAMETYPE", `Fetched last numbers ${numbers.join("")}`);
        }
        await new Promise(r => setTimeout(r, 1500));
    }
})();
const messagesFromReactAppListener = async (message, sender, response) => {
    // console.log('[content.js]. Message received', {
    //     message,
    //     sender,
    // });
    var INDEX = 1;
    var lastNumberXpath = `//div[contains(@class, " recent-number--") and contains(@class, "numbers")]/div[${INDEX}]//span`;
    var currentClickNumber = 36;
    var statusXpath = `//div[contains(@data-role,"status-text")]`;
    if (sender.id === chrome.runtime.id) {
        console.log(message.action);
        if (message.action === "get-tab-status") {
            // TODO: Oyun seçme eklenecek ve eğer frame var ama seçtiği oyunda değil ise "Roulette oyununda devam etmek ister misiniz?" uyarısı yap
            var data = JSON.parse(localStorage.getItem("currentGame"));
            response(data);
            console.log(data);
        }
        if (message.action === "get-status") {
            var status = getElementByXpath(statusXpath);
            status = status ? status.textContent : lastStatus;
            // status !== lastStatus &&
            response(status ?? lastStatus);
            console.log("[SENT]", String(status ?? lastStatus));
            lastStatus = status;
        }
        if (message.action === "click") {
            var order = message.order;
            for (let index = 0; index < order.length; index++) {
                var element = await getElementByXpath(`//*[@class="classicStandard-wrapper"]/*[@data-bet-spot-id="${order[index]}"]`);
                if (!element) continue;
                // element.addEventListener("click", () => {console.log("click event");});
                // var ev = new MouseEvent('click');
                // var el = document.elementFromPoint(x, y);
                // console.log(el); //print element to console
                try {
                    // var x = element.dispatchEvent(ev);
                    await new Promise(r => setTimeout(r, 1000));
                    // element.click();
                    // element.addEventListener('click', () => { });
                    element.dispatchEvent(new Event('click'));
                    // element.click();
                    // element.
                } catch (error) {
                    if (String(error).includes("not a function"))
                        console.log("ERR:", error, getElementByXpath(`//*[@class="classicStandard-wrapper"]/*[@data-bet-spot-id="${order[index]}"]`));
                    else console.log(element ? element[0] : String(element));
                }
            }
            console.log("[SENT] OK");
            response("OK");
        }
        if (message.action === "click-xpath") {
            var element = await getElementByXpath(message.xpath);
            if (element === null || element === undefined) { response("Invalid XPATH!"); }
            else if (element) {
                var ev = new Event("click");
                console.log("[XPATH]", message.xpath);
                element.click();
                response("OK CLICKED XPATH!");
            }
        }
    }
};
/**
 * Fired when a message is sent from either an extension process or a content script.
 */
chrome.runtime.onMessage.addListener(messagesFromReactAppListener);
