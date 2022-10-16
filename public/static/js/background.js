/*global chrome*/
var currentTab = -1;
(async() => {
    while (true) {
        chrome.tabs.query({}, tabs => currentTab = tabs.filter(item => item.active)[0].id);
        if (currentTab !== -1) {
        //   chrome.tabs.sendMessage(currentTab, {message: "get-status"}, response => {response&& console.log("Response:", response);});
        //   chrome.tabs.sendMessage(currentTab, {message: "click", order: ["0", "36", "25"]}, response => {response&& console.log("Response:", response);});
        }
        await new Promise(r => setTimeout(r, 10000));
    };
})();