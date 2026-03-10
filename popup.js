// popup.js

// Function to display the list of trials
// updated renderTrials in popup.js
function renderTrials() {
  chrome.storage.local.get({ trials: [] }, (result) => {
    const list = document.getElementById('trialList');
    list.innerHTML = '';

    if (result.trials.length === 0) {
      list.innerHTML = '<p style="color: #666; font-size: 12px;">No active trials tracked.</p>';
      return;
    }

    result.trials.forEach((trial, index) => {
      const item = document.createElement('div');
      item.className = 'trial-item';
      item.innerHTML = `
        <div class="trial-info">
          <span class="trial-name">${trial.name}</span>
          <span class="trial-date">Expires: ${trial.date}</span>
        </div>
        <button class="delete-btn" data-index="${index}" style="width: 30px; height: 30px; padding: 0; background: #333; font-size: 12px;">✕</button>
      `;
      list.appendChild(item);
    });

    // Add event listeners to all delete buttons
    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const index = e.target.getAttribute('data-index');
        deleteTrial(index);
      });
    });
  });
}

function deleteTrial(index) {
  chrome.storage.local.get({ trials: [] }, (result) => {
    const trials = result.trials;
    const removedTrial = trials.splice(index, 1)[0]; // Remove from array

    chrome.storage.local.set({ trials }, () => {
      // Also cancel the alarm associated with this trial
      chrome.alarms.clear(`trial_reminder_${removedTrial.name}`);
      renderTrials(); // Refresh the list
    });
  });
}

// Add a new trial
document.getElementById('addBtn').addEventListener('click', () => {
  const name = document.getElementById('serviceName').value;
  const date = document.getElementById('expiryDate').value;

  if (!name || !date) {
    alert("Please enter both a name and an expiry date.");
    return;
  }

  chrome.storage.local.get({ trials: [] }, (result) => {
    const trials = result.trials;
    trials.push({ name, date });

    chrome.storage.local.set({ trials }, () => {
      // Set the alarm (for testing, we can set it for 1 minute from now)
      // Change to the actual date logic when ready for production!
      const alarmTime = Date.now() + (60 * 1000); 
      
      chrome.alarms.create(`trial_reminder_${name}`, { when: alarmTime });

      // Clear inputs and refresh list
      document.getElementById('serviceName').value = '';
      document.getElementById('expiryDate').value = '';
      renderTrials();
    });
  });
});


function getDaysRemaining(expiryDate) {
  const today = new Date();
  const expiry = new Date(expiryDate);
  const diffTime = expiry - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? `${diffDays} days left` : "Expires today!";
}

function renderTrials() {
  chrome.storage.local.get({ trials: [] }, (result) => {
    const list = document.getElementById('trialList');
    list.innerHTML = '';

    if (result.trials.length === 0) {
      list.innerHTML = '<p style="color: #666; font-size: 12px;">No active trials.</p>';
      return;
    }

    result.trials.forEach((trial, index) => {
      const daysText = getDaysRemaining(trial.date);
      const item = document.createElement('div');
      item.className = 'trial-item';
      item.innerHTML = `
        <div class="trial-info">
          <span class="trial-name">${trial.name}</span>
          <span class="days-left">${daysText}</span>
        </div>
        <button class="delete-btn" data-index="${index}">✕</button>
      `;
      list.appendChild(item);
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const index = e.target.getAttribute('data-index');
        deleteTrial(index);
      });
    });
  });
}

// ... keep your existing addBtn and deleteTrial functions ...

// Initial render
renderTrials();