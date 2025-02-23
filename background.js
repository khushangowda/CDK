chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "openNewTab") {
        chrome.tabs.create({ url: "https://www.google.com" }, (tab) => {
            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                files: ["content.js"]
            });
        });
    } else if (request.action === "closeTab") {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]) chrome.tabs.remove(tabs[0].id);
        });
    }
});

chrome.commands.onCommand.addListener((command) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (!tabs[0]) return;
        if (command === "activate_extension") {
            chrome.tabs.sendMessage(tabs[0].id, { action: "startRecognition" });
        } else if (command === "deactivate_extension") {
            chrome.tabs.sendMessage(tabs[0].id, { action: "stopRecognition" });
        } else if (command === "open_new_tab") {
            chrome.tabs.create({ url: "https://www.google.com" });
        }
    });
});