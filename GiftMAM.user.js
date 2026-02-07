// ==UserScript==
// @name         Gift Many A Mouse
// @namespace    https://github.com/Photaz/GiftMAM
// @version      1.02
// @description  Scrapes, checks history, and gifts new users directly from the browser.
// @author       Photaz
// @license      MIT
// @match        https://www.myanonamouse.net/newUsers.php
// @updateURL    https://github.com/Photaz/GiftMAM/raw/main/GiftMAM.user.js
// @downloadURL  https://github.com/Photaz/GiftMAM/raw/main/GiftMAM.user.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // === CONFIGURATION ===
    const GIFT_AMOUNT = 100;
    const DELAY_MS = 6000; // 6 seconds (Safe buffer)
    const DB_KEY = 'mam_gift_history_v1';
    const PRUNE_DAYS = 30; // Forget users after 30 days

    let stopRequested = false;
    let isMinimized = false;

    // === UI STYLES ===
    const style = document.createElement('style');
    style.textContent = `
        /* --- MAIN PANEL (Fixed Bottom Right) --- */
        #mam-gift-panel {
            position: fixed;               /* Pins to the viewport */
            bottom: 20px; right: 20px;     /* Bottom Right Anchor */
            width: 300px;

            background: #1a1a1a; color: #eee;
            border: 1px solid #444; border-radius: 8px;
            padding: 15px;
            z-index: 9999;                 /* Floats ABOVE everything */
            box-shadow: 0 4px 15px rgba(0,0,0,0.6);
            font-family: 'Segoe UI', sans-serif; font-size: 13px;
            text-align: left;
            transition: all 0.3s ease;     /* Smooth minimize animation */
        }

        /* --- MINIMIZED STATE --- */
        #mam-gift-panel.mam-minimized {
            width: 60px; height: 60px;
            padding: 0;
            border-radius: 50%;            /* Circle shape */
            cursor: pointer;
            overflow: hidden;
            display: flex; align-items: center; justify-content: center;
            background: #2E7D32;
            border: 2px solid #4CAF50;
            box-shadow: 0 4px 8px rgba(0,0,0,0.4);
        }
        #mam-gift-panel.mam-minimized:hover { transform: scale(1.1); }
        #mam-gift-panel.mam-minimized > .panel-content { display: none; }
        #mam-gift-panel.mam-minimized > .minimized-icon { display: block; }

        .minimized-icon { display: none; font-size: 30px; }

        /* --- HEADER & CONTROLS --- */
        .panel-header {
            display: flex; justify-content: space-between; align-items: center;
            margin-bottom: 10px;
        }
        .header-left { display: flex; align-items: center; gap: 10px; }

        .panel-header h3 {
            margin: 0; color: #4CAF50; font-size: 15px; font-weight: bold;
        }

        .limit-select {
            background: #333; color: #eee;
            border: 1px solid #555; border-radius: 4px;
            padding: 2px 5px; font-size: 11px;
            cursor: pointer; outline: none;
        }
        .limit-select:hover { border-color: #777; }

        .btn-minimize {
            background: none; border: none; color: #aaa;
            font-size: 20px; line-height: 1; cursor: pointer; padding: 0 5px;
        }
        .btn-minimize:hover { color: #fff; }

        .stat-row { display: flex; justify-content: space-between; margin-bottom: 5px; }

        #mam-log {
            margin-top: 10px; height: 100px; overflow-y: auto;
            background: #000; border: 1px solid #333; padding: 5px;
            font-family: monospace; font-size: 11px;
            display: flex; flex-direction: column;
        }

        .control-row { display: flex; gap: 10px; margin-top: 10px; }

        button {
            border: none; border-radius: 4px; cursor: pointer;
            font-weight: bold; transition: background 0.2s;
            padding: 8px; color: white;
        }

        .btn-start { background: #2E7D32; flex-grow: 1; }
        .btn-start:hover { background: #388E3C; }
        .btn-start:disabled { background: #2E7D32; cursor: default; opacity: 0.8; }

        .btn-stop {
            background: #d32f2f; width: 40px;
            display: none; font-size: 14px;
        }
        .btn-stop:hover { background: #b71c1c; }

        /* --- VISUAL UPDATE ON PAGE --- */
        .mam-gifted-user { opacity: 0.4; transition: opacity 0.5s; }
        .mam-gifted-mark {
            color: #4CAF50; font-weight: bold;
            margin-left: 5px; font-size: 1.1em;
        }

        .log-success { color: #66bb6a; }
        .log-error { color: #ef5350; }
        .log-info { color: #bbb; }
        .log-warn { color: #ffa726; }
    `;
    document.head.appendChild(style);

    // === DATABASE MANAGER ===
    const db = {
        load: () => {
            const raw = localStorage.getItem(DB_KEY);
            return raw ? JSON.parse(raw) : {};
        },
        save: (data) => {
            localStorage.setItem(DB_KEY, JSON.stringify(data));
        },
        add: (username) => {
            const data = db.load();
            data[username] = Date.now();
            db.save(data);
        },
        has: (username) => {
            const data = db.load();
            return !!data[username];
        },
        prune: () => {
            const data = db.load();
            const now = Date.now();
            const cutoff = PRUNE_DAYS * 24 * 60 * 60 * 1000;
            let removed = 0;
            for (const [user, timestamp] of Object.entries(data)) {
                if (now - timestamp > cutoff) {
                    delete data[user];
                    removed++;
                }
            }
            db.save(data);
            return removed;
        },
        count: () => Object.keys(db.load()).length
    };

    // === VISUAL HELPERS ===
    function visualizeStatus() {
        const links = document.querySelectorAll('.blockBodyCon label a');
        links.forEach(link => {
            let name = link.textContent.trim().split(' ')[0];
            if (db.has(name)) {
                // Compatibility: Check for our mark OR MAM+ mark
                if (!link.innerHTML.includes('✅')) {
                    link.innerHTML += ` <span class="mam-gifted-mark">✅</span>`;
                }
                const label = link.closest('label');
                if (label) label.classList.add('mam-gifted-user');
            }
        });
    }

    // === CORE LOGIC ===
    async function sendGift(username) {
        const url = `https://www.myanonamouse.net/json/bonusBuy.php?spendtype=gift&amount=${GIFT_AMOUNT}&giftTo=${encodeURIComponent(username)}`;
        try {
            const resp = await fetch(url);
            const data = await resp.json();
            return data.success ? { success: true } : { success: false, error: data.error };
        } catch (e) {
            return { success: false, error: e.message };
        }
    }

    function getTargets() {
        const links = document.querySelectorAll('.blockBodyCon label a');
        const targets = [];
        links.forEach(link => {
            let name = link.textContent.trim().split(' ')[0];
            // Check if MAM Plus has already gifted this user
            const isMamPlusGifted = link.classList.contains('mp_gifted') || link.innerHTML.includes('✅');

            if (name) {
                targets.push({
                    name: name,
                    element: link,
                    isMamPlusGifted: isMamPlusGifted
                });
            }
        });
        // Filter duplicates
        const seen = new Set();
        return targets.filter(item => {
            const duplicate = seen.has(item.name);
            seen.add(item.name);
            return !duplicate;
        });
    }

    // === UI MANAGER ===
    function createPanel() {
        // --- INJECTION ---
        // We inject into body to ensure it floats over everything
        const div = document.createElement('div');
        div.id = 'mam-gift-panel';

        const pruned = db.prune();
        const dbCount = db.count();

        div.innerHTML = `
            <div class="minimized-icon">🎁</div>
            <div class="panel-content">
                <div class="panel-header">
                    <div class="header-left">
                        <h3>🎁 Gift Many A Mouse</h3>
                        <select id="gift-limit" class="limit-select" title="Batch Limit">
                            <option value="5">5</option>
                            <option value="10">10</option>
                            <option value="15">15</option>
                            <option value="25">25</option>
                            <option value="50">50</option>
                            <option value="75">75</option>
                            <option value="100">100</option>
                            <option value="250">250</option>
                            <option value="500">500</option>
                            <option value="ALL" selected>ALL</option>
                        </select>
                    </div>
                    <button class="btn-minimize" id="btn-min" title="Minimize">—</button>
                </div>
                <div class="stat-row"><span>Database Size:</span> <span id="ui-db-count">${dbCount}</span></div>
                <div class="stat-row"><span>Targets Found:</span> <span id="ui-targets">0</span></div>
                <div class="stat-row"><span>New to Gift:</span> <span id="ui-new">0</span></div>

                <div id="mam-log"></div>

                <div class="control-row">
                    <button id="btn-run" class="btn-start">Start Gifting</button>
                    <button id="btn-stop" class="btn-stop" title="Stop">⏹</button>
                </div>
            </div>
        `;

        document.body.appendChild(div);

        // --- Logic Hooks ---
        const logBox = div.querySelector('#mam-log');
        const log = (msg, type='info') => {
            const p = document.createElement('div');
            p.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`;
            p.className = `log-${type}`;
            logBox.appendChild(p);
            logBox.scrollTop = logBox.scrollHeight;
        };

        if (pruned > 0) log(`Pruned ${pruned} old records.`, 'info');

        visualizeStatus();

        // Initial Count
        const targets = getTargets();
        const validTargets = targets.filter(t => !db.has(t.name) && !t.isMamPlusGifted);

        div.querySelector('#ui-targets').textContent = targets.length;
        div.querySelector('#ui-new').textContent = validTargets.length;

        // --- Event Handlers ---
        div.querySelector('#btn-min').onclick = (e) => {
            e.stopPropagation();
            div.classList.add('mam-minimized');
            isMinimized = true;
        };

        div.onclick = () => {
            if (div.classList.contains('mam-minimized')) {
                div.classList.remove('mam-minimized');
                isMinimized = false;
            }
        };

        div.querySelector('#btn-stop').onclick = () => {
            stopRequested = true;
            log("🛑 Stopping after current gift...", "warn");
        };

        div.querySelector('#btn-run').onclick = async function() {
            const btnRun = this;
            const btnStop = div.querySelector('#btn-stop');
            const limitSelect = div.querySelector('#gift-limit');
            const limitVal = limitSelect.value;
            const maxGifts = limitVal === 'ALL' ? Infinity : parseInt(limitVal, 10);

            // UI State: Running
            btnRun.disabled = true;
            limitSelect.disabled = true;
            btnRun.textContent = `Running (Limit: ${limitVal})...`;
            btnStop.style.display = "block";
            stopRequested = false;

            // Re-evaluate to catch any manual changes
            const currentTargets = getTargets();
            const runnableTargets = currentTargets.filter(t => !db.has(t.name) && !t.isMamPlusGifted);

            let successCount = 0;

            for (const target of runnableTargets) {
                if (stopRequested) {
                    log("🛑 Operation stopped by user.", "warn");
                    break;
                }

                if (successCount >= maxGifts) {
                    log(`✅ Limit of ${maxGifts} reached. Stopping.`, "success");
                    break;
                }

                log(`Gifting ${target.name}...`, 'info');

                const waitTime = DELAY_MS + Math.random() * 2000;
                const result = await sendGift(target.name);

                if (result.success) {
                    db.add(target.name);

                    // Visual Sync
                    target.element.classList.add('mp_gifted');
                    if (!target.element.innerHTML.includes('✅')) {
                        target.element.innerHTML += ` <span class="mam-gifted-mark">✅</span>`;
                    }
                    visualizeStatus(); // Refresh fades

                    log(`✅ Sent ${GIFT_AMOUNT} to ${target.name}`, 'success');
                    successCount++;
                    document.getElementById('ui-db-count').textContent = db.count();
                } else {
                    log(`❌ Failed ${target.name}: ${result.error}`, 'error');
                    if (result.error && result.error.includes("Amount more than current points")) {
                        log("🛑 Stopped due to insufficient bonus points.", "warn");
                        break;
                    }
                }

                if (stopRequested || successCount >= maxGifts) break;

                await new Promise(r => setTimeout(r, waitTime));
            }

            log(`🎉 Finished. Gifted ${successCount} users.`, 'success');
            btnRun.disabled = false;
            limitSelect.disabled = false;
            btnRun.textContent = "Start Gifting";
            btnStop.style.display = "none";
        };
    }

    createPanel();

})();
