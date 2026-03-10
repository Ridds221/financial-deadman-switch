// background.js - Focused Alarm & Message Hub

// 1. CORE SAVE FUNCTION
function saveTrial(name, date) {
  chrome.storage.local.get({ trials: [] }, (result) => {
    const trials = result.trials;
    trials.push({ name, date });

    chrome.storage.local.set({ trials }, () => {
      const alarmTime = new Date(date).getTime();
      chrome.alarms.create(`trial_reminder_${name}`, { when: alarmTime });
      console.log(`Armed: ${name}`);
    });
  });
}

// 2. MESSAGE LISTENER (Popup/Content Script Bridge)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "quickAdd") {
    saveTrial(request.data.name, request.data.date);
    sendResponse({ status: "success" });
  } 
  else if (request.action === "undoLast") {
    chrome.storage.local.get({ trials: [] }, (result) => {
      let trials = result.trials;
      const lastTrial = trials.pop();
      
      if (lastTrial) {
        chrome.storage.local.set({ trials }, () => {
          chrome.alarms.clear(`trial_reminder_${lastTrial.name}`);
          sendResponse({ success: true });
        });
      }
    });
    return true;
  }
});

// 3. ALARM LISTENER
chrome.alarms.onAlarm.addListener((alarm) => {
  const serviceName = alarm.name.replace('trial_reminder_', '');
  
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icons/icon128.png',
    title: "🚨 DEAD-MAN'S SWITCH!",
    message: `Your ${serviceName} trial expires TODAY. Time to cancel!`,
    priority: 2
  });
});