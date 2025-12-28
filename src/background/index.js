chrome.runtime.onInstalled.addListener(() => {
    console.log("IRCTC Tatkal Extension installed");
    chrome.alarms.create("tatkal", {
      when: Date.now() + 10000 // demo
    });
  });
  
  chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === "tatkal") {
      console.log("Tatkal time reached");
      // Notify all IRCTC tabs
      chrome.tabs.query({ url: "https://www.irctc.co.in/*" }, (tabs) => {
        tabs.forEach(tab => {
          chrome.tabs.sendMessage(tab.id, { type: "TATKAL_TIME" });
        });
      });
    }
  });
  
  // Listen for messages from content script
  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.type === "CONTENT_SCRIPT_READY") {
      console.log("Content script ready on:", msg.url);
      sendResponse({ success: true });
    }
    return true;
  });
    