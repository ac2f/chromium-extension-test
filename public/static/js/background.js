/*global chrome*/
var currentTab = -1;
(async() => {
    while (true) {
        chrome.tabs.query({}, tabs => currentTab = tabs.filter(item => item.active)[0].id);
        if (currentTab !== -1) {
        //   chrome.tabs.sendMessage(currentTab, {message: "get-status"}, response => {response&& console.log("Response:", response);});
        //   chrome.tabs.sendMessage(currentTab, {action: "set-tab-status"}, response => {response&& console.log("set-tab-status, Response:", response);});
        }
        await new Promise(r => setTimeout(r, 3000));
    };
})();