/*global chrome*/
var wsc;
const fStr = "/*fStr000*/";
const gameId = [
    "roulette",
    "baccarat",
    "blackjack"
];

var _xpath = {
    iframe: `//*[contains(@src, "https://babylonstk.evo-games.com")]`,
    gameName: `//span[@data-role="table-name"]`
};
var lastStatus = "";
var currentGame = {
    frame: false,
    game: "",
    id: -1
};
const getElementByXpath = path => document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
const xpath = (k, d = "iframe") => _xpath[k].replace(fStr, _xpath[d] + "//");
const parseId = title => gameId.indexOf([(gameId.filter(value => title.toLowerCase().includes(value.toLowerCase()))[0])][0]);
const log = (src, text) => null//console.log(src.split(",").map(value => `[${value}]`).join(""), text);
var frameExist = false;
(async () => {
    while (true) {
        var x = getElementByXpath(xpath("iframe"));
        !frameExist && log("FRAMECHECK", "Checking..");
        if (!!x) {
            !frameExist && log("FRAMECHECK", "Frame exist!");
            if (!wsc) {
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
            }
            currentGame.frame = true;
            if (!frameExist) {
                var tmpText = getElementByXpath(xpath("gameName"));
                if (tmpText) {
                    currentGame.game = tmpText.textContent;
                    currentGame.id = parseId(tmpText.textContent);
                }
                console.log(`SET: ${currentGame}`);
            }
            localStorage.setItem("currentGame", JSON.stringify(currentGame));
            frameExist = true;
        } else {
            frameExist = false;
        }
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
