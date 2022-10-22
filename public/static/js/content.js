/*global chrome*/
const WebSocket = require("ws");
var wss;
const fStr = "/*fStr000*/";
const gameId = [
    "roulette",
    "baccarat",
    "blackjack"
];

var _xpath = {
    iframe: `//iframe[contains(@src, "https://babylonstk.evo-games.com")]`
}
var lastStatus = "";
var currentGame = {
    frame: false,
    game: "",
    id: -1
};
const getElementByXpath = path => document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
const xpath = (k, d = "iframe") => _xpath[k].replace(fStr, _xpath[d]+"//");
const parseId = title => gameId.indexOf([(gameId.filter(value => title.toLowerCase().includes(value.toLowerCase()))[0])][0]);

(async () => {
    while (true) {
        if (!!getElementByXpath(xpath.iframe)) {
            if (!wss) {
                wss = new WebSocket.WebSocketServer({port: 30105});
                wss.on("listening", wsc => {
                    wsc.on("message", data => {
                        console.log(data);
                    })
                });
                wss.on("close", () => wss = null);
                wss.on("error", error => console.log(error));
            }
            currentGame.frame = true;
            currentGame.game = getElementByXpath(xpath()).textContent;
            currentGame.id = parseId(currentGame.game);
        }
        await new Promise(r => setTimeout(r, 1000));
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
        if (message.action === "tab-status") {
            // TODO: Oyun seçme eklenecek ve eğer frame var ama seçtiği oyunda değil ise "Roulette oyununda devam etmek ister misiniz?" uyarısı yap
            response(currentGame);
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
