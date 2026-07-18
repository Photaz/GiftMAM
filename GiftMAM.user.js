// ==UserScript==
// @name         GiftMAM
// @namespace    https://github.com/Photaz/GiftMAM/tree/dev
// @version      0.1
// @description  GiftMAM rebuild
// @author       Photaz
// @match        https://www.myanonamouse.net/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_xmlhttpRequest
// @grant        GM_getResourceURL
// @icon         https://raw.githubusercontent.com/Photaz/GiftMAM/refs/heads/dev/assets/main.svg
// @resource     iconCheese https://raw.githubusercontent.com/Photaz/GiftMAM/refs/heads/dev/assets/cheese-wedge.svg
// @resource     iconGift https://raw.githubusercontent.com/Photaz/GiftMAM/refs/heads/dev/assets/gift.svg
// @resource     iconTrap https://raw.githubusercontent.com/Photaz/GiftMAM/refs/heads/dev/assets/mouse-trap.svg
// @resource     iconMouse https://raw.githubusercontent.com/Photaz/GiftMAM/refs/heads/dev/assets/mouse.svg
// @resource     iconMain https://raw.githubusercontent.com/Photaz/GiftMAM/refs/heads/dev/assets/main.svg
// @resource     iconSettings https://raw.githubusercontent.com/Photaz/GiftMAM/refs/heads/dev/assets/settings.svg
// @resource     iconMinimize https://raw.githubusercontent.com/Photaz/GiftMAM/refs/heads/dev/assets/minimize.svg
// @connect      api.github.com
// ==/UserScript==

(function() {
    'use strict';

    // ==========================================
    // 1. CSS INJECTION (Adaptive Theming & Shadows)
    // ==========================================
    const style = document.createElement('style');
    style.textContent = `
        :root {
            /* Theme Hooks with fallbacks */
            --site-bg: var(--secondary-background, #131313);
            --site-text: var(--main-text-color, #eee);

            /* 98 / 94 / 96 Tier Proportions */
            --mam-bg: color-mix(in srgb, var(--site-bg) 98%, var(--site-text));
            --mam-bg-sec: color-mix(in srgb, var(--site-bg) 94%, var(--site-text));
            --mam-bg-tertiary: color-mix(in srgb, var(--site-bg) 96%, var(--site-text));

            /* Mid-tone gray mix that avoids black/white clipping paths */
            --mam-border: color-mix(in srgb, var(--site-bg) 75%, #777);

            --mam-text: var(--site-text);
            --mam-text-muted: color-mix(in srgb, var(--site-text) 60%, transparent);
            --mam-accent-rgb: 0, 230, 118;
            /* Fallback solid color */
            --mam-accent: rgb(var(--mam-accent-rgb));

            /* Shared universal shadow arrays for legibility */
            --mam-shadow-text: 0 1px 2px rgba(0,0,0,0.5);
            --mam-shadow-emoji: drop-shadow(1px 1px 0px rgba(0,0,0,0.4)) drop-shadow(-1px -1px 0px rgba(0,0,0,0.4)) drop-shadow(1px -1px 0px rgba(0,0,0,0.4)) drop-shadow(-1px 1px 0px rgba(0,0,0,0.4));
            --mam-shadow-box: 0 4px 15px rgba(0,0,0,0.4);
        }

        #mam-gift-panel {
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 300px;
            background: var(--mam-bg);
            color: var(--mam-text);
            border: 1px solid var(--mam-border);
            border-radius: 8px;
            font-family: 'Segoe UI', sans-serif;
            font-size: 13px;
            z-index: 9999;
            box-shadow: var(--mam-shadow-box);
            display: flex;
            flex-direction: column;
            overflow: hidden;
            transition: all 0.3s ease;
        }

        /* --- HEADER & CONTROLS --- */
        .mam-header {
            background: var(--mam-bg-tertiary);
            padding: 8px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid var(--mam-border);
        }
        .mam-title {
            margin: 0; font-size: 15px; font-weight: bold;
            display: flex; align-items: center; gap: 6px;
            color: #5EB9FF;
        }
        .mam-title-icon {
            cursor: pointer;
            filter: var(--mam-shadow-emoji);
            display: inline-block;
            transition: transform 0.2s;
        }
        .mam-header-controls button {
            background: none; border: none; color: var(--mam-text);
            cursor: pointer; font-size: 16px; padding: 0 4px;
            filter: var(--mam-shadow-emoji);
            opacity: 0.7;
            transition: opacity 0.2s;
        }
        .mam-header-controls button:hover { opacity: 1; }

        /* --- VIEWS & LOG --- */
        .mam-view {
            height: 140px; overflow-y: auto;
            background: var(--mam-bg-sec);
            display: none;
        }
        .mam-view.active { display: block; }

        #mam-view-main { position: relative; }
        .mam-log-container {
            padding: 8px; font-family: monospace; font-size: 11px;
            color: var(--mam-text-muted);
        }

        .mam-refresh-btn {
            position: absolute; top: 6px; right: 8px;
            background: none; border: none; cursor: pointer;
            padding: 0 4px;
            opacity: 0.7; display: flex; align-items: center; justify-content: center;
            transition: opacity 0.2s;
            filter: var(--mam-shadow-emoji);
        }
        .mam-refresh-btn:hover { opacity: 1; }
        .mam-refresh-btn img { width: 14px; height: 14px; }

        /* --- SETTINGS ROW STABILITY --- */
        .mam-settings-container, .mam-about-container { padding: 10px; font-size: 12px; }
        .mam-setting-row { display: flex; justify-content: space-between; margin-bottom: 8px; align-items: center; }
        .mam-setting-row label { color: var(--mam-text); }
        .mam-settings-container strong, .mam-about-container h4 { color: var(--mam-text); }

        .mam-setting-row input, .mam-setting-row select, .mam-toolbar select {
            background: var(--mam-bg);
            color: var(--mam-text);
            border: 1px solid var(--mam-border);
            border-radius: 3px; padding: 2px 4px; font-family: inherit;
        }

        /* --- TOOLBAR (BOTTOM) --- */
        .mam-toolbar {
            display: flex; justify-content: space-between; align-items: center;
            padding: 6px 8px; background: var(--mam-bg-tertiary);
            border-top: 1px solid var(--mam-border);
        }
        .mam-stats { display: flex; gap: 12px; font-weight: bold; font-size: 12px; }
        .mam-stats span { display: flex; align-items: center; gap: 4px; }

        .mam-emoji { filter: var(--mam-shadow-emoji); display: inline-block; }

        .mam-btn-run {
            background: rgba(var(--mam-accent-rgb), 0.25); border: none; border-radius: 50%;
            width: 32px; height: 32px; padding: 0; display: inline-flex; align-items: center; justify-content: center; cursor: pointer; font-size: 14px;
            filter: var(--mam-shadow-emoji);
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            transition: background 0.2s;
        }
        .mam-btn-run:hover { background: #45a049; }

        /* Stacked drop-shadows to outline the SVG and separate it from the background */
        #btn-run img {
            filter: drop-shadow(1px 1px 0px rgba(0,0,0,0.4))
                    drop-shadow(-1px -1px 0px rgba(0,0,0,0.4))
                    drop-shadow(1px -1px 0px rgba(0,0,0,0.4))
                    drop-shadow(-1px 1px 0px rgba(0,0,0,0.4));
        }

        /* --- MINIMIZED STATE --- */
        #mam-gift-panel.minimized {
            width: 60px; height: 60px; border-radius: 50%;
            cursor: pointer; display: flex; align-items: center; justify-content: center;
            padding: 0;
            border: none; /* Removed standard border for gradient ring */
            box-shadow: var(--mam-shadow-box);

            /* Progress variable to be updated by JS */
            --mam-progress: 0%;
            background: conic-gradient(var(--mam-accent) var(--mam-progress), var(--mam-border) 0deg);
        }
        #mam-gift-panel.minimized > * { display: none; }
        #mam-min-icon { display: none; }

        #mam-gift-panel.minimized #mam-min-icon {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            height: 100%;
            border-radius: 50%;
        }

        #mam-gift-panel.minimized #mam-min-icon img {
            /* 56px leaves exactly 2px on all sides exposing the conic-gradient behind it */
            width: 56px !important;
            height: 56px !important;
            border-radius: 50%;
            filter: none; /* Removed shadow bleeding */
            background: var(--site-bg); /* Fills transparent gaps if the SVG has any */
        }
    `;
    document.head.appendChild(style);


    // ==========================================
    // 2. HTML TEMPLATE (Local Resource SVGs)
    // ==========================================
    const icons = {
        cheese: GM_getResourceURL('iconCheese'),
        gift:   GM_getResourceURL('iconGift'),
        trap:   GM_getResourceURL('iconTrap'),
        mouse:  GM_getResourceURL('iconMouse'),
        main:   GM_getResourceURL('iconMain'),
        settings: GM_getResourceURL('iconSettings'),
        minimize: GM_getResourceURL('iconMinimize')
    };

    const panelHTML = `
        <div id="mam-min-icon" class="mam-emoji"><img src="${icons.main}" style="width: 24px; height: 24px; vertical-align: middle;"></div>

        <div class="mam-header">
            <h3 class="mam-title">
                <span class="mam-title-icon mam-emoji" id="btn-about-title" title="About" onmouseover="this.querySelector('img').src='${icons.trap}'; this.style.transform='scale(1.15)';" onmouseout="this.querySelector('img').src='${icons.main}'; this.style.transform='scale(1)';"><img src="${icons.main}" style="width: 20px; height: 20px; vertical-align: bottom;"></span>GiftMAM
            </h3>
            <div class="mam-header-controls">
                <button id="btn-settings" class="mam-emoji" title="Settings"><img src="${icons.settings}" style="width: 18px; height: 18px; vertical-align: middle;"></button>
                <button id="btn-minimize" class="mam-emoji" title="Minimize"><img src="${icons.minimize}" style="width: 18px; height: 18px; vertical-align: middle;"></button>
            </div>
        </div>

        <div class="mam-view active" id="mam-view-main">
            <button class="mam-refresh-btn" title="Refresh"><img class="invertBlue" src="/pic/refresh.svg" alt="refresh"></button>
            <div class="mam-log-container">
                <div>[14:30:00] UI Initialized.</div>
                <div>[14:30:01] Awaiting commands...</div>
            </div>
        </div>

        <div class="mam-view" id="mam-view-settings">
            <div class="mam-settings-container">
                <strong style="display:block; margin-bottom:6px; border-bottom: 1px solid var(--mam-border); padding-bottom: 2px;">
                    <span class="mam-emoji"><img src="${icons.gift}" style="width: 16px; height: 16px; vertical-align: middle;"></span> Gifting Settings
                </strong>
                <div class="mam-setting-row">
                    <label>Default Gift Amount:</label>
                    <input type="number" id="mam-cfg-amount" style="width: 60px;">
                </div>
                <div class="mam-setting-row">
                    <label>Minimum BP Reserve:</label>
                    <input type="number" id="mam-cfg-reserve" style="width: 60px;">
                </div>
            </div>
        </div>

        <div class="mam-view" id="mam-view-about">
            <div class="mam-about-container" style="text-align: center;">
                <h4 style="margin: 0 0 5px 0;">GiftMAM v0.2</h4>
                <i style="color: var(--mam-text-muted);">Float some cheese to the new mice!</i>
                <div style="margin-top: 10px;">
                    <a href="#" style="color: #5EB9FF;">Forum Post</a> |
                    <a href="#" style="color: #5EB9FF;">GitHub</a>
                </div>
            </div>
        </div>

        <div class="mam-toolbar">
            <select id="mam-limit-select">
                ${['/', '/index.php'].includes(window.location.pathname)
                    ? '<option value="ALL">Newest</option>'
                    : '<option value="10">10</option><option value="25">25</option><option value="50">50</option><option value="100">100</option><option value="ALL">ALL</option>'}
            </select>
            <div class="mam-stats">
                <span title="Mice Queue"><span class="mam-emoji"><img src="${icons.mouse}" style="width: 18px; height: 18px; vertical-align: middle;"></span> <span style="color:#66BB6A;">34,523</span></span>
                <span title="Bonus Points"><span class="mam-emoji"><img src="${icons.cheese}" style="width: 18px; height: 18px; vertical-align: middle;"></span> <span style="color:#CCAC5B;">57K</span></span>
            </div>
            <button class="mam-btn-run mam-emoji" id="btn-run" title="Start Gifting"><img src="${icons.gift}" style="width: 16px; height: 16px; vertical-align: middle;"></button>
        </div>
    `;

    const panel = document.createElement('div');
    panel.id = 'mam-gift-panel';
    panel.innerHTML = panelHTML;
    document.body.appendChild(panel);


    // ==========================================
    // 3. CORE SYSTEMS, STATE & CONCURRENCY
    // ==========================================

    // Centralized Memory and Sync Layout
    const StateManager = {
        state: {
            isRunning: false,
            progress: 0,
            isLeader: false,
            leaderTabId: null,
            config: {
                giftAmount: 100,
                minReserve: 5000,
                limit: 'ALL'
            }
        },
        tabChannel: new BroadcastChannel('giftmam_concurrency'),
        myTabId: Math.random().toString(36).substring(2, 9),

        init() {
            // Load persistent configs securely
            this.state.config.giftAmount = parseInt(GM_getValue('giftAmount', 100), 10);
            this.state.config.minReserve = parseInt(GM_getValue('minReserve', 5000), 10);

            // Listen for cross-tab events
            this.tabChannel.onmessage = (e) => this.handleTabMessage(e.data);

            // Ping to check if a leader already exists
            this.broadcast('PING_LEADER', { from: this.myTabId });
        },

        updateConfig(key, value) {
            this.state.config[key] = value;
            GM_setValue(key, value);
            window.dispatchEvent(new CustomEvent('mam-config-updated', { detail: { key, value } }));
        },

        broadcast(type, payload = {}) {
            this.tabChannel.postMessage({ type, payload, tabId: this.myTabId });
        },

        handleTabMessage(msg) {
            switch(msg.type) {
                case 'PING_LEADER':
                    if (this.state.isLeader) {
                        this.broadcast('PONG_LEADER', { running: this.state.isRunning, progress: this.state.progress });
                    }
                    break;
                case 'PONG_LEADER':
                case 'LEADER_CLAIM':
                    this.state.isLeader = false;
                    this.state.leaderTabId = msg.tabId;
                    this.setExecutionUI(msg.payload.running ? 'LOCKED' : 'IDLE');
                    break;
                case 'LEADER_RELEASE':
                    if (this.state.leaderTabId === msg.tabId) {
                        this.state.leaderTabId = null;
                        this.setExecutionUI('IDLE');
                    }
                    break;
                case 'PROGRESS_SYNC':
                    if (this.state.leaderTabId === msg.tabId) {
                        this.updateProgressBar(msg.payload.progress);
                    }
                    break;
            }
        },

        setExecutionUI(status) {
            const btn = document.getElementById('btn-run');
            if (!btn) return;
            if (status === 'LOCKED') {
                btn.disabled = true;
                btn.style.opacity = '0.4';
                btn.title = "Running in another tab";
            } else if (status === 'IDLE') {
                btn.disabled = false;
                btn.style.opacity = '1';
                btn.title = "Start Gifting";
            }
        },

        updateProgressBar(percentage) {
            const panel = document.getElementById('mam-gift-panel');
            if (panel && panel.classList.contains('minimized')) {
                panel.style.setProperty('--mam-progress', `${percentage}%`);
            }
        }
    };

    const Logger = {
        history: ['[System] UI Initialized.', '[System] Awaiting commands...'],
        max: 50,
        el: document.querySelector('.mam-log-container'),
        log(msg) {
            const ts = new Date().toTimeString().split(' ')[0];
            this.history.push(`[${ts}] ${msg}`);
            if (this.history.length > this.max) this.history.shift();

            // Map array to DOM once per update
            this.el.innerHTML = this.history.map(entry => `<div>${entry}</div>`).join('');
            this.el.parentElement.scrollTop = this.el.parentElement.scrollHeight;
        }
    };

    const HistoryManager = {
        giftedUserIds: new Set(),

        async auditQueue(candidates) {
            Logger.log("Auditing transaction history parameters...");
            try {
                // Query points and wedge records safely matching the database payload schema
                const response = await fetch('/json/userBonusHistory.php?type[]=giftWedge&type[]=giftPoints');
                if (!response.ok) throw new Error(`HTTP ${response.status}`);

                const history = await response.json();

                // Track parsed user IDs out of transaction logs safely
                this.giftedUserIds.clear();
                history.forEach(tx => {
                    if (tx.other_userid) {
                        this.giftedUserIds.add(tx.other_userid.toString());
                    }
                });

                // Filter out candidates already matched against history logs
                const verified = candidates.filter(c => !this.giftedUserIds.has(c.id.toString()));
                const filteredCount = candidates.length - verified.length;

                if (filteredCount > 0) {
                    Logger.log(`Auditor: Skapped ${filteredCount} previously gifted targets.`);
                }
                return verified;
            } catch (error) {
                Logger.log(`Auditor Warning: History check failed (${error.message}). Proceeding carefully.`);
                return candidates;
            }
        }
    };

    const QueueManager = {
        users: [],
        async refresh() {
            const path = window.location.pathname;
            Logger.log("Refreshing user queue...");

            if (path === '/newUsers.php') {
                try {
                    const response = await fetch('/newUsers.php');
                    if (!response.ok) throw new Error(`HTTP ${response.status}`);

                    const htmlText = await response.text();
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(htmlText, 'text/html');

                    const userLabels = doc.querySelectorAll('input[name="sendGiftTo[]"]');
                    this.users = Array.from(userLabels).map(input => ({
                        id: input.value,
                        name: input.nextElementSibling ? input.nextElementSibling.innerText.trim() : 'Unknown'
                    }));

                    const siteContainer = document.querySelector('.blockBodyCon.left');
                    const newContainer = doc.querySelector('.blockBodyCon.left');
                    if (siteContainer && newContainer) {
                        siteContainer.innerHTML = newContainer.innerHTML;
                    }

                    this.users = await HistoryManager.auditQueue(this.users);
                    Logger.log(`Queue: ${this.users.length} active targets ready.`);
                } catch (error) {
                    Logger.log(`Scrape Error: ${error.message}`);
                }
            } else {
                // Default to API fetch for Index and any other page
                try {
                    const response = await fetch('/json/newestMembers.php');
                    if (!response.ok) throw new Error(`HTTP ${response.status}`);

                    const htmlText = await response.text();
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(htmlText, 'text/html');
                    const links = doc.querySelectorAll('a');

                    this.users = Array.from(links).map(a => {
                        const href = a.getAttribute('href');
                        return {
                            id: href ? href.split('/u/')[1] : null,
                            name: a.innerText.trim()
                        };
                    }).filter(u => u.id);

                    const siteContainer = document.getElementById('newestMembers');
                    if (siteContainer) {
                        siteContainer.innerHTML = htmlText;
                    }

                    this.users = await HistoryManager.auditQueue(this.users);
                    Logger.log(`Queue: ${this.users.length} active targets ready.`);
                } catch (error) {
                    Logger.log(`API Error: ${error.message}`);
                }
            }
        }
    };

    const Engine = {
        lastApiCall: 0,

        // Universal Rate Limiter: Ensures minGapMs passes between any API calls
        async enforceRateLimit(minGapMs = 15000) {
            const now = Date.now();
            const elapsed = now - this.lastApiCall;
            if (elapsed < minGapMs && this.lastApiCall !== 0) {
                const waitTime = minGapMs - elapsed;
                await new Promise(resolve => setTimeout(resolve, waitTime));
            }
            this.lastApiCall = Date.now();
        },

        async apiFetch(url, options = {}) {
            await this.enforceRateLimit(15000);
            return fetch(url, options);
        },

        async start() {
            if (StateManager.state.isRunning) return;

            const limitVal = document.getElementById('mam-limit-select').value;
            let maxGifts = limitVal === 'ALL' ? QueueManager.users.length : parseInt(limitVal, 10);
            if (isNaN(maxGifts)) maxGifts = QueueManager.users.length;

            const targets = QueueManager.users.slice(0, maxGifts);
            if (targets.length === 0) {
                Logger.log("No targets in queue. Refresh first.");
                return;
            }

            StateManager.state.isRunning = true;
            StateManager.state.isLeader = true;
            StateManager.broadcast('LEADER_CLAIM', { running: true });
            Logger.log(`Starting run: ${targets.length} targets.`);

            for (let i = 0; i < targets.length; i++) {
                if (!StateManager.state.isRunning) {
                    Logger.log("Execution aborted by user.");
                    break;
                }

                const user = targets[i];
                Logger.log(`Gifting [${i + 1}/${targets.length}]: ${user.name}`);

                try {
                    const ts = Date.now();
                    const giftAmount = StateManager.state.config.giftAmount;
                    const url = `/json/bonusBuy.php/${ts}?spendtype=gift&amount=${giftAmount}&timestamp=${ts}&giftTo=${user.id}`;

                    const res = await this.apiFetch(url, {
                        headers: { 'Accept': 'application/json, text/javascript, */*; q=0.01' }
                    });

                    if (!res.ok) throw new Error(`HTTP ${res.status}`);

                    const data = await res.json();
                    if (!data.success) throw new Error(data.error || "Unknown API response error.");

                    // Calculate and broadcast progress
                    const pct = Math.round(((i + 1) / targets.length) * 100);
                    StateManager.state.progress = pct;
                    StateManager.updateProgressBar(pct);
                    StateManager.broadcast('PROGRESS_SYNC', { progress: pct });

                } catch (e) {
                    Logger.log(`Error gifting ${user.name}: ${e.message}`);
                }
            }

            Logger.log("Run complete.");
            StateManager.state.isRunning = false;
            StateManager.state.progress = 0;
            StateManager.updateProgressBar(0);
            StateManager.broadcast('LEADER_RELEASE');
        }
    };

    // ==========================================
    // 4. UI LOGIC & EVENT ROUTING
    // ==========================================

    // Initialize Subsystems
    StateManager.init();

    // Bind data elements to configurations on initial boot load
    const amountInput = document.getElementById('mam-cfg-amount');
    const reserveInput = document.getElementById('mam-cfg-reserve');

    if (amountInput) {
        amountInput.value = StateManager.state.config.giftAmount;
        amountInput.addEventListener('change', (e) => StateManager.updateConfig('giftAmount', parseInt(e.target.value, 10) || 100));
    }
    if (reserveInput) {
        reserveInput.value = StateManager.state.config.minReserve;
        reserveInput.addEventListener('change', (e) => StateManager.updateConfig('minReserve', parseInt(e.target.value, 10) || 5000));
    }

    Logger.log("Ready.");

    // View Management
    const views = {
        main: document.getElementById('mam-view-main'),
        settings: document.getElementById('mam-view-settings'),
        about: document.getElementById('mam-view-about')
    };

    function switchView(targetViewKey) {
        // Hide all views
        Object.values(views).forEach(v => v.classList.remove('active'));

        // Show target
        if (views[targetViewKey]) {
            views[targetViewKey].classList.add('active');
        }

        // Reset header button colors
        document.getElementById('btn-settings').style.color = targetViewKey === 'settings' ? 'var(--mam-accent)' : 'var(--mam-text-muted)';
    }

    // Bind Header Buttons
    document.getElementById('btn-settings').addEventListener('click', (e) => {
        e.stopPropagation();
        const isCurrentlySettings = views.settings.classList.contains('active');
        switchView(isCurrentlySettings ? 'main' : 'settings');
    });

    document.getElementById('btn-about-title').addEventListener('click', (e) => {
        e.stopPropagation();
        const isCurrentlyAbout = views.about.classList.contains('active');
        switchView(isCurrentlyAbout ? 'main' : 'about');
    });

    document.querySelector('.mam-refresh-btn').addEventListener('click', (e) => {
        e.preventDefault();
        QueueManager.refresh();
    });

    document.getElementById('btn-run').addEventListener('click', (e) => {
        e.preventDefault();
        if (!StateManager.state.isRunning) {
            Engine.start();
        }
    });

    // Min/Max Logic
    const btnMinimize = document.getElementById('btn-minimize');

    btnMinimize.addEventListener('click', (e) => {
        e.stopPropagation();
        panel.classList.add('minimized');
    });

    panel.addEventListener('click', (e) => {
        if (panel.classList.contains('minimized')) {
            panel.classList.remove('minimized');
        }
    });

})();
