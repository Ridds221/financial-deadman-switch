# 🛡️ Financial Dead-Man's Switch
### *Stop "Trial Traps" before they bill you.*

A proactive Chrome extension designed to combat the "trial-to-paid" revenue model. It detects subscription sign-ups and sets a "Dead-Man's Switch"—if you don't cancel by the deadline, the extension intervenes with system-level alerts and visual banners.



## 🚀 Key Features
* **Smart Detection:** Automatically identifies checkout/subscription pages using URL keywords and CSS selectors.
* **Interactive "Quick-Arm" UI:** A sleek, dark-mode floating widget appears on checkout pages to set reminders instantly.
* **Visual Urgency Banners:** Injects a dynamic banner into webpages that shifts colors based on proximity to the deadline:
    * 🟡 **Yellow:** 3 days remaining.
    * 🟠 **Orange:** 1 day remaining.
    * 🔴 **Red:** Expiry is TODAY.
* **Desktop Notifications:** Utilizes the `chrome.alarms` and `chrome.notifications` APIs to alert you even if the browser popup is closed.
* **Undo Safety Net:** Built-in "Undo" logic to immediately disarm a switch if added by mistake.

## 🛠️ Technical Architecture
Built using **Manifest V3**, the project demonstrates clean separation of concerns:

| File | Role | Technical Focus |
| :--- | :--- | :--- |
| `manifest.json` | Configuration | Permission management & service worker routing. |
| `background.js` | Service Worker | State management via `chrome.storage` & alarm scheduling. |
| `content.js` | Content Script | DOM manipulation & real-time page scanning. |
| `popup.js/html`| UI Layer | Dashboard for manual management of active switches. |



## 🔧 Installation for Development
1.  Clone this repository:
    ```bash
    git clone [https://github.com/Ridds221/financial-deadman-switch.git](https://github.com/Ridds221/financial-deadman-switch.git)
    ```
2.  Open Chrome and go to `chrome://extensions/`.
3.  Enable **Developer Mode** (top right toggle).
4.  Click **Load unpacked** and select the project folder.

## 🌟 About the Developer
Developed by **Riddhima Kaushik**, a BTech student based in the Bengaluru tech community, focusing on building tools that solve real-world financial friction.

---
*If this tool saved you from an unwanted subscription fee, feel free to give it a ⭐!*