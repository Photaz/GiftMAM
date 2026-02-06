# 🎁 Gift Many A Mouse (GiftMAM)

An automated gifting tool for MyAnonamouse.net. This userscript embeds a sleek control panel directly into the "New Users" page, allowing you to easily welcome new members with bonus points while tracking your history to prevent duplicates.

## Features
* **Smart Gifting:** Automates sending 100 points to new users.
* **Duplicate Protection:** Maintains a local database of everyone you've gifted.
* **Batch Limits:** Set a cap (5, 10, 100, ALL) to gift in small batches or all at once.
* **Visual Tracking:** Automatically marks gifted users with a green checkmark ✅ and fades them out.
* **MAM+ Compatible:** Detects if you've already gifted someone using the MAM+ extension.
* **Integrated UI:** A movable, minimization-friendly panel that stays out of your way.

## Installation

### Option 1: Auto-Updating (Recommended)
This version will automatically check for bug fixes and new features.
[👉 Click Here 👈](https://github.com/Photaz/GiftMAM/raw/main/GiftMAM.user.js) to Install GiftMAM

### Option 2: Manual / Static (No Updates)
If you prefer to review the code and freeze it at the current version:
1. Open the [script file here](https://github.com/Photaz/GiftMAM/blob/main/GiftMAM.user.js).
2. Copy the code.
3. Create a new script in Violentmonkey/Tampermonkey and paste the code.
*(Note: You will not receive updates or fixes with this method).*

---

### 🧩 Requirements
This script requires a userscript manager to run.
* [Violentmonkey](https://violentmonkey.github.io/) (Recommended - Open Source)
* [Tampermonkey](https://www.tampermonkey.net/)

## Usage
1.  Navigate to the [New Users Page](newUsers.php).
2.  The **Gift Many A Mouse** panel will appear in the bottom-right corner.
3.  Select your batch limit (e.g., `100` or `ALL`).
4.  Click **Start Gifting**.
5.  Keep the tab open while it runs. You can minimize the panel using the `—` icon if it's in the way.
