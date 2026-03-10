// content.js - Financial Dead-Man's Switch

// 1. CONFIGURATION: Specific rules for high-traffic sites
const CUSTOM_DETECTION_RULES = {
    "netflix.com": { selector: ".plan-selection-container", name: "Netflix" },
    "adobe.com": { selector: ".checkout-form", name: "Adobe Creative Cloud" },
    "spotify.com": { selector: ".premium-plans", name: "Spotify Premium" },
    "swiggy.com": { selector: ".swiggy-one-membership", name: "Swiggy One" }
};

// content.js

function checkAndInjectBanner() {
  const today = new Date();
  chrome.storage.local.get({ trials: [] }, (result) => {
    result.trials.forEach(trial => {
      const expiry = new Date(trial.date);
      const diffTime = expiry - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays <= 3 && diffDays >= 0) {
        injectBanner(trial.name, diffDays);
      }
    });
  });
}

function injectBanner(name, days) {
  if (document.getElementById('deadman-reminder-bar')) return;
  const bar = document.createElement('div');
  bar.id = 'deadman-reminder-bar';
  
  // Visual Urgency Colors
  let color = "#ff4d4d"; // Red (Today)
  let text = "expires TODAY!";
  if (days === 1) { color = "#ffa500"; text = "expires TOMORROW"; }
  if (days > 1) { color = "#ffcc00"; text = `expires in ${days} days`; }

  bar.style.backgroundColor = color;
  bar.style.color = (days > 1) ? "black" : "white"; // Black text for yellow background
  bar.innerHTML = `⚠️ <strong>DEAD-MAN'S SWITCH:</strong> ${name} ${text}`;
  document.body.prepend(bar);
  document.body.style.marginTop = '40px';
}

function createQuickArmUI() {
  const container = document.createElement('div');
  container.id = 'quick-arm-container';
  Object.assign(container.style, {
    position: 'fixed', bottom: '20px', right: '20px', zIndex: '999999',
    padding: '12px', backgroundColor: '#1e1e1e', border: '2px solid #ff4d4d',
    borderRadius: '12px', color: 'white', fontFamily: 'sans-serif'
  });

  const serviceName = window.location.hostname.replace('www.', '').split('.')[0];
  container.innerHTML = `
    <div style="margin-bottom:8px">Arm ${serviceName}?</div>
    <input type="date" id="qDate" style="margin-bottom:8px">
    <button id="qConfirm" style="background:#ff4d4d; color:white; border:none; padding:5px; width:100%; border-radius:4px; cursor:pointer">Arm</button>
  `;
  document.body.appendChild(container);

  document.getElementById('qConfirm').onclick = () => {
    const chosenDate = document.getElementById('qDate').value;
    if (!chosenDate) return alert("Select a date!");

    chrome.runtime.sendMessage({
      action: "quickAdd",
      data: { name: serviceName, date: chosenDate }
    }, () => {
      container.innerHTML = `
        <span style="color:#4bb543">Armed!</span>
        <button id="undoBtn" style="background:none; border:none; color:#888; text-decoration:underline; cursor:pointer; font-size:10px; margin-left:10px">Undo</button>
      `;
      document.getElementById('undoBtn').onclick = () => {
        chrome.runtime.sendMessage({ action: "undoLast" }, () => container.remove());
      };
      setTimeout(() => { if(container) container.remove(); }, 5000);
    });
  };
}

// Logic to run on page load
const subKeywords = ["subscribe", "checkout", "billing", "trial"];
if (subKeywords.some(k => window.location.href.toLowerCase().includes(k))) {
  createQuickArmUI();
}
checkAndInjectBanner();



// 3. DETECTION LOGIC: One clean function to check both Rules and Keywords
function detectSubscriptionPage() {
    const hostname = window.location.hostname.replace('www.', '');
    const url = window.location.href.toLowerCase();
    
    // Check if site matches our specific CSS selectors
    const isCustomMatch = CUSTOM_DETECTION_RULES[hostname] && 
                         document.querySelector(CUSTOM_DETECTION_RULES[hostname].selector);

    // Fallback to keyword scanning
    const subKeywords = ["subscribe", "checkout", "billing", "trial", "plan-select"];
    const isKeywordMatch = subKeywords.some(keyword => url.includes(keyword));

    if ((isCustomMatch || isKeywordMatch) && !document.getElementById('quick-arm-container')) {
        createQuickArmUI();
    }
}

// 4. UI LOGIC: Creating the interactive date-picker widget
function createQuickArmUI() {
    const container = document.createElement('div');
    container.id = 'quick-arm-container';
    
    // Applying CSS via JS
    Object.assign(container.style, {
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: '999999',
        padding: '12px',
        backgroundColor: '#1e1e1e',
        border: '2px solid #ff4d4d',
        borderRadius: '12px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        fontFamily: 'Segoe UI, sans-serif'
    });

    const serviceName = window.location.hostname.replace('www.', '').split('.')[0];
    
    // Smart Date Suggestion: Default to 7 days from now
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 7);

    container.innerHTML = `
        <span style="color:white; font-size:12px; font-weight:bold;">🛡️ Arm Switch for ${serviceName}?</span>
        <input type="date" id="quickDateInput" value="${defaultDate.toISOString().split('T')[0]}" 
               style="padding:5px; border-radius:4px; border:none; background:#333; color:white;">
        <button id="quickConfirmBtn" style="background:#ff4d4d; color:white; border:none; padding:8px; border-radius:5px; cursor:pointer; font-weight:bold;">Arm Switch</button>
    `;

    document.body.appendChild(container);

    document.getElementById('quickConfirmBtn').onclick = () => {
        const chosenDate = document.getElementById('quickDateInput').value;
        
        if (chrome.runtime && chrome.runtime.id) {
            chrome.runtime.sendMessage({
                action: "quickAdd",
                data: { name: serviceName, date: chosenDate }
            }, () => {
                container.innerHTML = "<span style='color:#4bb543; font-size:12px;'>✅ Armed Successfully!</span>";
                setTimeout(() => container.remove(), 2000);
            });
        } else {
            alert("Please refresh the page to arm this switch.");
        }
    };
}

// 5. INITIALIZATION: Run everything once the page loads
window.addEventListener('load', () => {
    checkAndInjectBanner();
    // Delaying detection by 2 seconds to allow dynamic site content to finish rendering
    setTimeout(detectSubscriptionPage, 2000);
});