// ==UserScript==
// @name         GiftMAM
// @namespace    https://github.com/Photaz/GiftMAM
// @version      3.0.0
// @description  Gift Many A Mouse Reforged
// @author       Photaz
// @match        https://www.myanonamouse.net/*
// @exclude      https://www.myanonamouse.net/login.php*
// @updateURL    https://github.com/Photaz/GiftMAM/raw/main/GiftMAM.user.js
// @downloadURL  https://github.com/Photaz/GiftMAM/raw/main/GiftMAM.user.js
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_xmlhttpRequest
// @grant        GM_getResourceURL
// @icon         https://raw.githubusercontent.com/Photaz/GiftMAM/refs/heads/main/assets/main.svg
// @resource     iconCheese https://raw.githubusercontent.com/Photaz/GiftMAM/refs/heads/main/assets/cheese-wedge.svg
// @resource     iconGift https://raw.githubusercontent.com/Photaz/GiftMAM/refs/heads/main/assets/gift.svg
// @resource     iconTrap https://raw.githubusercontent.com/Photaz/GiftMAM/refs/heads/main/assets/mouse-trap.svg
// @resource     iconMouse https://raw.githubusercontent.com/Photaz/GiftMAM/refs/heads/main/assets/mouse.svg
// @resource     iconMain https://raw.githubusercontent.com/Photaz/GiftMAM/refs/heads/main/assets/main.svg
// @resource     iconSettings https://raw.githubusercontent.com/Photaz/GiftMAM/refs/heads/main/assets/settings.svg
// @resource     iconMinimize https://raw.githubusercontent.com/Photaz/GiftMAM/refs/heads/main/assets/minimize.svg
// @resource     iconApi https://raw.githubusercontent.com/Photaz/GiftMAM/refs/heads/main/assets/api.svg
// @resource     iconUi https://raw.githubusercontent.com/Photaz/GiftMAM/refs/heads/main/assets/ui.svg
// @resource     iconData https://raw.githubusercontent.com/Photaz/GiftMAM/refs/heads/main/assets/data.svg
// @resource     iconPosTL https://raw.githubusercontent.com/Photaz/GiftMAM/refs/heads/main/assets/topleft.svg
// @resource     iconPosTR https://raw.githubusercontent.com/Photaz/GiftMAM/refs/heads/main/assets/topright.svg
// @resource     iconPosBL https://raw.githubusercontent.com/Photaz/GiftMAM/refs/heads/main/assets/botleft.svg
// @resource     iconPosBR https://raw.githubusercontent.com/Photaz/GiftMAM/refs/heads/main/assets/botright.svg
// @resource     iconAudit https://raw.githubusercontent.com/Photaz/GiftMAM/refs/heads/main/assets/audit.svg
// @resource     iconReset https://raw.githubusercontent.com/Photaz/GiftMAM/refs/heads/main/assets/reset.svg
// @resource     iconVault https://raw.githubusercontent.com/Photaz/GiftMAM/refs/heads/main/assets/vault.svg
// @resource     iconLotto https://raw.githubusercontent.com/Photaz/GiftMAM/refs/heads/main/assets/lotto.svg
// @resource     iconStop https://raw.githubusercontent.com/Photaz/GiftMAM/refs/heads/main/assets/stop.svg
// @resource     iconBuy https://raw.githubusercontent.com/Photaz/GiftMAM/refs/heads/main/assets/buy.svg
// @resource     iconCrown https://raw.githubusercontent.com/Photaz/GiftMAM/refs/heads/main/assets/crown.svg
// @resource     iconSlow https://raw.githubusercontent.com/Photaz/GiftMAM/refs/heads/main/assets/slow.svg
// @resource     iconError https://raw.githubusercontent.com/Photaz/GiftMAM/refs/heads/main/assets/error.svg
// @resource     iconCheck https://raw.githubusercontent.com/Photaz/GiftMAM/refs/heads/main/assets/check.svg
// @connect      api.github.com
// ==/UserScript==

(function() {
    'use strict';

    // Shadow fetch to ensure Firefox-based extension contexts resolve relative URLs against the site origin
    const originalFetch = window.fetch;
    const fetch = (resource, options) => {
        if (typeof resource === 'string' && resource.startsWith('/')) {
            resource = window.location.origin + resource;
        }
        return originalFetch(resource, options);
    };

    // Prevent Tampermonkey from double-executing the script inside hidden iframes
    if (window.top !== window.self) return;

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

        a.mam-gifted-user,
        a.mam-gifted-user span {
            color: #bbaa77 !important;
            font-weight: bold !important;
        }

        #mam-gift-panel {
            position: fixed;
            bottom: 5px;
            right: 35px;
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
            height: 140px; overflow: hidden;
            background: var(--mam-bg-sec);
            display: none;
        }
        .mam-view.active { display: block; }
        #mam-view-settings { overflow-y: auto; }

        #mam-view-main { position: relative; }
        .mam-log-container {
            padding: 8px; font-family: monospace; font-size: 11px;
            color: var(--mam-text-muted);
            height: 100%; overflow-y: auto; box-sizing: border-box;
        }
        .mam-log-container > div { margin-bottom: 2px; }

        .mam-refresh-btn, .mam-exit-btn {
            position: absolute; top: 6px; right: 8px;
            background: none; border: none; cursor: pointer;
            padding: 0 4px; color: var(--mam-text);
            opacity: 0.7; display: flex; align-items: center; justify-content: center;
            transition: opacity 0.2s;
            filter: var(--mam-shadow-emoji);
        }
        .mam-refresh-btn:hover, .mam-exit-btn:hover { opacity: 1; }
        .mam-refresh-btn img { width: 14px; height: 14px; }

        /* --- SETTINGS ROW STABILITY --- */
        .mam-settings-container, .mam-about-container { padding: 10px; font-size: 12px; }
        .mam-setting-row { display: flex; justify-content: space-between; margin-bottom: 8px; align-items: center; }
        .mam-setting-row label { color: var(--mam-text); }
        .mam-settings-container strong, .mam-about-container h4 { color: var(--mam-text); }

        /* Standardized Setting Controls */
        input[type="number"]::-webkit-inner-spin-button,
        input[type="number"]::-webkit-outer-spin-button {
            -webkit-appearance: none; margin: 0;
        }
        input[type="number"] { -moz-appearance: textfield; }

        .mam-setting-row input[type="text"], .mam-setting-row input[type="number"], .mam-setting-row select, .mam-toolbar select {
            background: var(--mam-bg); color: var(--mam-text);
            border: 1px solid var(--mam-border); border-radius: 3px;
            padding: 4px 6px; font-family: inherit; font-size: 11px;
            width: 60px; box-sizing: border-box; text-align: right;
        }
        .mam-setting-row select { text-align: right; text-align-last: right; direction: ltr; }
        .mam-setting-row select option { text-align: right; direction: ltr; }

        /* Segmented Controls (Replaces Dropdowns) */
        .mam-segment-grid {
            display: flex; justify-content: space-between; width: 110px; gap: 2px;
            background: var(--mam-bg-sec); border: 1px solid var(--mam-border);
            border-radius: 3px; overflow: hidden; padding: 1px; box-sizing: border-box;
        }
        .mam-segment {
            flex: 1; text-align: center; padding: 4px 0; font-size: 10px; cursor: pointer;
            color: var(--mam-text-muted); transition: 0.2s; user-select: none;
        }
        .mam-segment.active {
            background: rgba(94, 185, 255, 0.15); color: #5EB9FF; font-weight: bold;
        }

        /* Compact 40px Toggles */
        .mam-toggle {
            position: relative; display: inline-block; width: 40px; height: 20px;
        }
        .mam-toggle input { opacity: 0; width: 0; height: 0; }
        .mam-slider {
            position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0;
            background-color: var(--mam-bg); border: 1px solid var(--mam-border);
            transition: .2s; border-radius: 10px;
        }
        .mam-slider:before {
            position: absolute; content: ""; height: 14px; width: 14px;
            left: 2px; bottom: 2px; background-color: var(--mam-text-muted);
            transition: .2s; border-radius: 50%; z-index: 2;
        }

        input:checked + .mam-slider { border-color: #5EB9FF; background: rgba(94, 185, 255, 0.1); }
        input:checked + .mam-slider:before { transform: translateX(20px); background-color: #5EB9FF; }

        /* Settings Headers & Buttons */
        .mam-section-header {
            display: flex; justify-content: space-between; align-items: center;
            margin: 12px 0 6px 0; border-bottom: 1px solid var(--mam-border);
            padding-bottom: 2px; color: var(--mam-text); font-weight: bold; font-size: 11px; text-transform: uppercase;
        }
        .mam-section-header-left { display: flex; align-items: center; gap: 4px; }

        .mam-audit-btn {
            background: none; border: none; cursor: pointer; padding: 0; margin: 0;
            display: flex; align-items: center; justify-content: center; opacity: 0.7;
            transition: opacity 0.2s; filter: var(--mam-shadow-emoji);
        }
        .mam-audit-btn:hover { opacity: 1; }

        .mam-audit-log-container {
            padding: 8px; font-family: monospace; font-size: 11px;
            color: var(--mam-text-muted); height: 100%; overflow-y: auto; box-sizing: border-box;
        }
        .mam-audit-day { color: #5EB9FF; font-weight: bold; margin-top: 8px; margin-bottom: 2px; }
        .mam-audit-day:first-child { margin-top: 0; }
        .mam-audit-entry { display: flex; gap: 8px; margin-left: 4px; }
        .mam-audit-time { color: var(--mam-text-muted); opacity: 0.8; }
        .mam-audit-desc { color: var(--mam-text); }

        #mam-view-audit, #mam-view-changelog { position: relative; }
        #mam-view-audit.active, #mam-view-changelog.active { display: flex; flex-direction: column; }
        .mam-section-header:first-child { margin-top: 0; }
        .mam-btn {
            background: var(--mam-bg-tertiary); color: var(--mam-text); border: 1px solid var(--mam-border);
            border-radius: 3px; padding: 4px 8px; cursor: pointer; font-size: 11px;
            box-sizing: border-box; height: 24px; line-height: 1;
        }
        .mam-btn:hover { background: var(--mam-bg-sec); }
        .mam-btn-danger { background: #d32f2f; color: #fff; border-color: #b71c1c; }
        .mam-btn-danger:hover { background: #b71c1c; }

        /* UI Position Overrides */
        #mam-gift-panel.pos-top-left { top: 15px; left: calc(1% + 15px); bottom: auto; right: auto; }
        #mam-gift-panel.pos-top-right { top: 15px; right: calc(1% + 15px); bottom: auto; left: auto; }
        #mam-gift-panel.pos-bottom-left { bottom: 15px; left: calc(1% + 15px); top: auto; right: auto; }
        #mam-gift-panel.pos-bottom-right { bottom: 15px; right: calc(1% + 15px); top: auto; left: auto; }

        /* Position Flex Row Widget */
        .mam-pos-grid {
            display: flex; justify-content: space-between; width: 84px; gap: 2px;
            border: none !important; background: none !important; padding: 0 !important;
        }
        .mam-pos-box {
            width: 24px; height: 24px; border: 1px solid var(--mam-border); background: var(--mam-bg);
            cursor: pointer; border-radius: 2px; display: flex; align-items: center; justify-content: center;
            opacity: 0.5; transition: 0.2s; box-sizing: border-box;
        }
        .mam-pos-box img { width: 18px; height: 18px; pointer-events: none; filter: invert(0.8); }
        .mam-pos-box.active { border-color: #5EB9FF; background: rgba(94, 185, 255, 0.2); opacity: 1; }
        .mam-pos-box.active img { filter: invert(0.6) sepia(1) saturate(5) hue-rotate(180deg); }

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
        .mam-btn-run.stopping { background: #EF5350; }
        .mam-btn-run.stopping:hover { background: #E57373; }

        /* Log Container & Item Spacing */
        .mam-log-container { padding-right: 20px; }

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
        cheese:   GM_getResourceURL('iconCheese'),
        gift:     GM_getResourceURL('iconGift'),
        trap:     GM_getResourceURL('iconTrap'),
        mouse:    GM_getResourceURL('iconMouse'),
        main:     GM_getResourceURL('iconMain'),
        settings: GM_getResourceURL('iconSettings'),
        minimize: GM_getResourceURL('iconMinimize'),
        api:      GM_getResourceURL('iconApi'),
        ui:       GM_getResourceURL('iconUi'),
        data:     GM_getResourceURL('iconData'),
        posTL:    GM_getResourceURL('iconPosTL'),
        posTR:    GM_getResourceURL('iconPosTR'),
        posBL:    GM_getResourceURL('iconPosBL'),
        posBR:    GM_getResourceURL('iconPosBR'),
        audit:    GM_getResourceURL('iconAudit'),
        reset:    GM_getResourceURL('iconReset'),
        vault:    GM_getResourceURL('iconVault'),
        lotto:    GM_getResourceURL('iconLotto'),
        stop:     GM_getResourceURL('iconStop'),
        buy:      GM_getResourceURL('iconBuy'),
        crown:    GM_getResourceURL('iconCrown'),
        slow:     GM_getResourceURL('iconSlow'),
        error:    GM_getResourceURL('iconError'),
        check:    GM_getResourceURL('iconCheck')
    };

    const logIcon = (name, size = 11) => `<img src="${icons[name]}" style="width: ${size}px; height: ${size}px; vertical-align: text-bottom; margin-right: 4px; filter: drop-shadow(1px 1px 0px rgba(0,0,0,0.5));">`;

    const panelHTML = `
        <div id="mam-min-icon" class="mam-emoji"><img src="${icons.main}" style="width: 24px; height: 24px; vertical-align: middle;"></div>

        <div class="mam-header">
            <h3 class="mam-title">
                <span class="mam-title-icon mam-emoji" id="btn-about-title" title="About" onmouseover="this.querySelector('img').src='${icons.trap}'; this.style.transform='scale(1.15)';" onmouseout="this.querySelector('img').src='${icons.main}'; this.style.transform='scale(1)';"><img src="${icons.main}" style="width: 20px; height: 20px; vertical-align: bottom;"></span>GiftMAM
                <a href="/millionaires/donate.php" target="_blank" id="btn-vault-alert" class="mam-emoji" title="Vault Reminder (Click to donate)" style="display: none; margin-left: 8px; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.15)'" onmouseout="this.style.transform='scale(1)'"><img src="${icons.vault}" style="width: 16px; height: 16px; vertical-align: middle;"></a>
                <a href="/play_lotto.php" target="_blank" id="btn-lotto-alert" class="mam-emoji" title="Lotto Reminder (Click to enter)" style="display: none; margin-left: 4px; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.15)'" onmouseout="this.style.transform='scale(1)'"><img src="${icons.lotto}" style="width: 16px; height: 16px; vertical-align: middle;"></a>
            </h3>
            <div class="mam-header-controls" style="display: flex; align-items: center;">
                <button id="btn-settings" class="mam-emoji" title="Settings"><img src="${icons.settings}" style="width: 18px; height: 18px; vertical-align: middle;"></button>
                <button id="btn-minimize" class="mam-emoji" title="Minimize"><img src="${icons.minimize}" style="width: 18px; height: 18px; vertical-align: middle;"></button>
            </div>
        </div>

        <div class="mam-view active" id="mam-view-main">
            <button class="mam-refresh-btn" title="Refresh"><img class="invertBlue" src="/pic/refresh.svg" alt="refresh"></button>
            <div class="mam-log-container"></div>
        </div>

        <div class="mam-view" id="mam-view-settings">
            <div class="mam-settings-container">

                <div class="mam-section-header"><div class="mam-section-header-left"><span class="mam-emoji"><img src="${icons.gift}" style="width: 14px; height: 14px; vertical-align: middle;"></span> Gifting</div></div>
                <div class="mam-setting-row">
                    <label title="Accepts 5-1000 or 'Max'">Default Gift Amount:</label>
                    <input type="text" id="mam-cfg-amount" placeholder="100" maxlength="6">
                </div>
                <div class="mam-setting-row">
                    <label>Minimum BP Reserve:</label>
                    <input type="number" id="mam-cfg-reserve" min="1000" max="999999">
                </div>
                <div class="mam-setting-row">
                    <label>Shoutbox Gifting:</label>
                    <label class="mam-toggle"><input type="checkbox" id="mam-cfg-shoutbox"><span class="mam-slider"></span></label>
                </div>
                <div class="mam-setting-row">
                    <label>Forum Gifting:</label>
                    <label class="mam-toggle"><input type="checkbox" id="mam-cfg-forum"><span class="mam-slider"></span></label>
                </div>

                <div class="mam-section-header">
                    <div class="mam-section-header-left"><span class="mam-emoji"><img src="${icons.api}" style="width: 16px; height: 16px; vertical-align: middle;"></span> API</div>
                    <button class="mam-audit-btn" id="btn-open-audit" title="View Audit Log"><img src="${icons.audit}" style="width: 14px; height: 14px;"></button>
                </div>
                <div class="mam-setting-row">
                    <label>Buy Amount:</label>
                    <div class="mam-segment-grid" id="mam-cfg-buy-amount">
                        <div class="mam-segment" data-val="Off">Off</div>
                        <div class="mam-segment" data-val="50GB">50</div>
                        <div class="mam-segment" data-val="100GB">100</div>
                        <div class="mam-segment" data-val="Max">Max</div>
                    </div>
                </div>
                <div class="mam-setting-row" id="row-buy-when">
                    <label>Buy When ≥:</label>
                    <input type="number" id="mam-cfg-buy-when" min="1000" max="999999">
                </div>
                <div class="mam-setting-row">
                    <label>Renew VIP:</label>
                    <label class="mam-toggle"><input type="checkbox" id="mam-cfg-renew-vip"><span class="mam-slider"></span></label>
                </div>
                <div class="mam-setting-row">
                    <label>Vault Reminder:</label>
                    <label class="mam-toggle"><input type="checkbox" id="mam-cfg-vault-remind"><span class="mam-slider"></span></label>
                </div>
                <div class="mam-setting-row">
                    <label>Lotto Reminder:</label>
                    <label class="mam-toggle"><input type="checkbox" id="mam-cfg-lotto-remind"><span class="mam-slider"></span></label>
                </div>

                <div class="mam-section-header"><div class="mam-section-header-left"><span class="mam-emoji"><img src="${icons.ui}" style="width: 14px; height: 14px; vertical-align: middle;"></span> UI</div></div>
                <div class="mam-setting-row">
                    <label>Position:</label>
                    <div class="mam-pos-grid" id="mam-cfg-position">
                        <div class="mam-pos-box" data-val="top-left"><img src="${icons.posTL}"></div>
                        <div class="mam-pos-box" data-val="top-right"><img src="${icons.posTR}"></div>
                        <div class="mam-pos-box" data-val="bottom-left"><img src="${icons.posBL}"></div>
                        <div class="mam-pos-box active" data-val="bottom-right"><img src="${icons.posBR}"></div>
                    </div>
                </div>
                <div class="mam-setting-row">
                    <label>Minimize:</label>
                    <div class="mam-segment-grid" id="mam-cfg-auto-minimize" style="width: 120px;">
                        <div class="mam-segment" data-val="Index">Index</div>
                        <div class="mam-segment" data-val="New">New</div>
                        <div class="mam-segment" data-val="Other">Other</div>
                    </div>
                </div>
                <div class="mam-setting-row">
                    <label>Hide News:</label>
                    <div style="display: flex; gap: 6px; align-items: center;">
                        <button id="btn-reset-news" class="mam-emoji" title="Reset Dismissed News" style="background: none; border: none; cursor: pointer; padding: 0; display: flex; align-items: center; opacity: 0.5; transition: opacity 0.2s;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.5'"><img src="${icons.reset}" style="width: 18px; height: 18px;"></button>
                        <div class="mam-segment-grid" id="mam-cfg-hide-news" style="width: 90px;">
                            <div class="mam-segment" data-val="Off">Off</div>
                            <div class="mam-segment" data-val="Click">Click</div>
                            <div class="mam-segment" data-val="Hide">Hide</div>
                        </div>
                    </div>
                </div>
                <div class="mam-setting-row">
                    <label>Compact Layout:</label>
                    <label class="mam-toggle"><input type="checkbox" id="mam-cfg-compact"><span class="mam-slider"></span></label>
                </div>

                <div class="mam-section-header"><div class="mam-section-header-left"><span class="mam-emoji"><img src="${icons.data}" style="width: 16px; height: 16px; vertical-align: middle;"></span> Data</div></div>
                <div style="display: flex; gap: 6px; justify-content: space-between;">
                    <button class="mam-btn" id="btn-export" style="flex: 1;">Export</button>
                    <button class="mam-btn" id="btn-import" style="flex: 1;">Import</button>
                    <button class="mam-btn mam-btn-danger" id="btn-wipe" style="flex: 1;">Wipe</button>
                </div>
            </div>
        </div>

        <div class="mam-view" id="mam-view-audit">
            <button class="mam-exit-btn" id="btn-close-audit" title="Back to Settings">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5EB9FF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            </button>
            <div class="mam-audit-log-container" id="mam-audit-log">
                <!-- Mock log population -->
                <div class="mam-audit-day">[Monday]</div>
                <div class="mam-audit-entry"><span class="mam-audit-time">14:22:10</span><span class="mam-audit-desc">Bought 50GB</span></div>
                <div class="mam-audit-entry"><span class="mam-audit-time">09:15:00</span><span class="mam-audit-desc">Bought 100GB</span></div>

                <div class="mam-audit-day">[Sunday]</div>
                <div class="mam-audit-entry"><span class="mam-audit-time">22:40:05</span><span class="mam-audit-desc">Bought Max</span></div>
                <div class="mam-audit-entry"><span class="mam-audit-time">18:05:12</span><span class="mam-audit-desc">Bought 50GB</span></div>

                <div class="mam-audit-day">[Saturday]</div>
                <div class="mam-audit-entry"><span class="mam-audit-time">11:30:00</span><span class="mam-audit-desc">Bought 50GB</span></div>
                <div class="mam-audit-entry"><span class="mam-audit-time">08:20:45</span><span class="mam-audit-desc">Bought 100GB</span></div>
                <div class="mam-audit-entry"><span class="mam-audit-time">02:14:10</span><span class="mam-audit-desc">Bought 50GB</span></div>
            </div>
        </div>

        <div class="mam-view" id="mam-view-about">
            <div class="mam-about-container" style="text-align: center; position: relative; height: 100%; box-sizing: border-box; display: flex; flex-direction: column; justify-content: space-between;">
                <button class="mam-audit-btn" id="btn-open-changelog" title="View Release Notes" style="position: absolute; top: 0; right: 0; padding: 4px;"><img src="${icons.audit}" style="width: 14px; height: 14px;"></button>
                <div>
                    <h4 style="color: #5EB9FF; margin: 0 0 2px 0; font-size: 13px;">Gift Many A Mouse v${typeof GM_info !== 'undefined' ? GM_info.script.version : 'Beta'}</h4>
                    <i style="color: #bbaa77; font-size: 11px;">Spread the cheese!</i>
                </div>

                <div style="display: flex; flex-direction: column; gap: 8px; margin: 8px 0;">
                    <div style="display: flex; justify-content: center; gap: 12px;">
                        <a href="/newUsers.php" style="color: #5EB9FF; text-decoration: none; font-weight: bold;" onmouseover="this.style.textDecoration='underline'" onmouseout="this.style.textDecoration='none'">New Users</a>
                        <span style="color: var(--mam-border);">|</span>
                        <a href="/millionaires/donate.php" style="color: #5EB9FF; text-decoration: none; font-weight: bold;" onmouseover="this.style.textDecoration='underline'" onmouseout="this.style.textDecoration='none'">Vault</a>
                        <span style="color: var(--mam-border);">|</span>
                        <a href="/play_lotto.php" style="color: #5EB9FF; text-decoration: none; font-weight: bold;" onmouseover="this.style.textDecoration='underline'" onmouseout="this.style.textDecoration='none'">Lotto</a>
                    </div>
                    <div style="display: flex; justify-content: center; gap: 12px;">
                        <a href="https://www.myanonamouse.net/f/t/92053/p/p1106541" target="_blank" style="color: #5EB9FF; text-decoration: none;" onmouseover="this.style.textDecoration='underline'" onmouseout="this.style.textDecoration='none'">Forum Post</a>
                        <span style="color: var(--mam-border);">|</span>
                        <a href="https://github.com/Photaz/GiftMAM" target="_blank" style="color: #5EB9FF; text-decoration: none;" onmouseover="this.style.textDecoration='underline'" onmouseout="this.style.textDecoration='none'">GitHub</a>
                    </div>
                </div>

                <div style="font-style: italic; color: #bbaa77; opacity: 0.8;">friendliness, warmth and sharing</div>
            </div>
        </div>

        <div class="mam-view" id="mam-view-changelog">
            <button class="mam-exit-btn" id="btn-close-changelog" title="Back to About">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5EB9FF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            </button>
            <div class="mam-audit-log-container" id="mam-changelog-content" style="user-select: text;">
                <div style="color: var(--mam-text-muted); text-align: center; margin-top: 20px;">Loading release notes...</div>
            </div>
        </div>

        <div class="mam-toolbar">
            <select id="mam-limit-select" style="width: auto; min-width: 50px;">
                ${window.location.pathname !== '/newUsers.php'
                    ? '<option value="ALL">New</option>'
                    : '<option value="10">10</option><option value="25">25</option><option value="50">50</option><option value="100">100</option>'}
            </select>
            <div class="mam-stats">
                <span id="mam-ui-queue-wrap" title="Total Gifted"><span class="mam-emoji"><img src="${icons.mouse}" style="width: 18px; height: 18px; vertical-align: middle;"></span> <span id="mam-ui-queue" style="color:#66BB6A;">...</span></span>
                <span id="mam-ui-bp-wrap" title="Bonus Points"><span class="mam-emoji"><img src="${icons.cheese}" style="width: 18px; height: 18px; vertical-align: middle;"></span> <span id="mam-ui-bp" style="color:#CCAC5B;">...</span></span>
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
            currentBP: null,
            config: {
                giftAmount: '100',
                minReserve: 15000,
                limit: 'ALL',
                buyAmount: 'Off',
                buyWhen: 65000,
                renewVip: false,
                vaultReminder: true,
                lottoReminder: true,
                uiPosition: 'bottom-right',
                autoMinimize: [],
                hideNews: 'Off',
                compactLayout: false,
                shoutboxGifting: true,
                forumGifting: true
            }
        },
        tabChannel: new BroadcastChannel('giftmam_concurrency'),
        myTabId: Math.random().toString(36).substring(2, 9),

        updateBP(bp) {
            this.state.currentBP = bp;
            GM_setValue('mam_current_bp', bp);

            // Update Panel UI (##K Format)
            const uiBp = document.getElementById('mam-ui-bp');
            const uiBpWrap = document.getElementById('mam-ui-bp-wrap');
            if (uiBp && uiBpWrap) {
                if (bp === null) {
                    uiBp.textContent = '...';
                } else {
                    uiBp.textContent = (bp >= 1000) ? Math.floor(bp / 1000) + 'K' : bp.toString();
                    uiBpWrap.title = 'Bonus Points: ' + bp.toLocaleString('en-US');
                }
            }

            // Update Native Site UI (##### Format)
            const siteBP = document.getElementById('tmBP');
            if (siteBP && bp !== null) {
                siteBP.textContent = 'Bonus: ' + bp;
                siteBP.setAttribute('data-exact-b-p', bp.toString());
            }
        },

        init() {
            // Hydrate ALL persistent configurations securely before any module reads them
            this.state.config.giftAmount = GM_getValue('giftAmount', '100');
            this.state.config.minReserve = parseInt(GM_getValue('minReserve', 15000), 10);
            this.state.config.shoutboxGifting = GM_getValue('shoutboxGifting', true);
            this.state.config.forumGifting = GM_getValue('forumGifting', true);
            this.state.config.buyAmount = GM_getValue('buyAmount', 'Off');
            this.state.config.buyWhen = parseInt(GM_getValue('buyWhen', 65000), 10);
            this.state.config.renewVip = GM_getValue('renewVip', false);
            this.state.config.vaultReminder = GM_getValue('vaultReminder', true);
            this.state.config.lottoReminder = GM_getValue('lottoReminder', true);
            this.state.config.uiPosition = GM_getValue('uiPosition', 'bottom-right');
            try {
                const rawMin = GM_getValue('autoMinimize', '[]');
                this.state.config.autoMinimize = typeof rawMin === 'string' ? JSON.parse(rawMin) : rawMin;
            } catch (e) {
                this.state.config.autoMinimize = [];
            }
            this.state.config.hideNews = GM_getValue('hideNews', 'Off');
            this.state.config.compactLayout = GM_getValue('compactLayout', false);

            // Scrape and initialize BP from native data attribute
            const domBP = document.getElementById('tmBP');
            let scrapedBP = null;
            if (domBP) {
                const attrVal = domBP.getAttribute('data-exact-b-p');
                if (attrVal) {
                    scrapedBP = parseInt(attrVal, 10);
                } else {
                    const match = domBP.textContent.match(/Bonus:\s*([\d,]+)/);
                    if (match) scrapedBP = parseInt(match[1].replace(/,/g, ''), 10);
                }
            }

            const cachedBP = parseInt(GM_getValue('mam_current_bp', '-1'), 10);

            if (scrapedBP !== null && !isNaN(scrapedBP)) {
                this.updateBP(scrapedBP);
            } else if (cachedBP !== -1) {
                this.updateBP(cachedBP);
            }

            // Listen for cross-tab events
            this.tabChannel.onmessage = (e) => this.handleTabMessage(e.data);

            // Ping to check if a leader already exists
            this.broadcast('PING_LEADER', { from: this.myTabId });
        },

        updateConfig(key, value) {
            this.state.config[key] = value;
            GM_setValue(key, typeof value === 'object' ? JSON.stringify(value) : value);
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
                        if (msg.payload.bp !== undefined) this.updateBP(msg.payload.bp);
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
        history: [],
        max: 50,
        el: document.querySelector('.mam-log-container'),
        log(msg) {
            const ts = new Date().toTimeString().split(' ')[0];
            this.history.push(`[${ts}] ${msg}`);
            if (this.history.length > this.max) this.history.shift();

            // Map array to DOM once per update
            this.el.innerHTML = this.history.map(entry => `<div>${entry}</div>`).join('');
            this.el.scrollTop = this.el.scrollHeight;
        }
    };

    const AuditLogger = {
        key: 'mam_audit_log',
        maxAge: 14 * 24 * 60 * 60 * 1000, // 14 Days
        add(msg) {
            const logs = this.get();
            logs.unshift({ t: Date.now(), m: msg });
            const validLogs = logs.filter(x => Date.now() - x.t <= this.maxAge).slice(0, 200);
            GM_setValue(this.key, JSON.stringify(validLogs));
            this.render();
        },
        get() {
            try { return JSON.parse(GM_getValue(this.key, '[]')); } catch(e) { return []; }
        },
        render() {
            const container = document.getElementById('mam-audit-log');
            if (!container) return;
            const logs = this.get();
            if (logs.length === 0) {
                container.innerHTML = '<div style="text-align:center; margin-top:20px;">No recent store activity.</div>';
                return;
            }

            let html = '';
            let lastDate = '';
            logs.forEach(l => {
                const d = new Date(l.t);
                const dStr = d.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
                if (dStr !== lastDate) {
                    html += `<div class="mam-audit-day">[${dStr}]</div>`;
                    lastDate = dStr;
                }
                const tStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                html += `<div class="mam-audit-entry"><span class="mam-audit-time">${tStr}</span><span class="mam-audit-desc">${l.m}</span></div>`;
            });
            container.innerHTML = html;
        }
    };

    const Database = {
        key: 'mam_gift_history',
        cache: null,
        ttl: 15 * 24 * 60 * 60 * 1000, // 15 Days
        load() {
            if (this.cache === null) {
                const raw = GM_getValue(this.key);
                try {
                    let parsed = raw ? JSON.parse(raw) : {};
                    // Auto-migrate flat beta data to structured schema
                    if (!parsed.uids && !parsed.legacy && parsed.archived === undefined) {
                        parsed = { uids: { ...parsed }, legacy: {}, archived: 0 };
                    }
                    this.cache = parsed;
                    // Ensure all keys exist
                    if (!this.cache.uids) this.cache.uids = {};
                    if (!this.cache.legacy) this.cache.legacy = {};
                    if (typeof this.cache.archived !== 'number') this.cache.archived = 0;
                } catch(e) {
                    this.cache = { uids: {}, legacy: {}, archived: 0 };
                }
            }
            return this.cache;
        },
        save() {
            GM_setValue(this.key, JSON.stringify(this.cache));
            window.dispatchEvent(new CustomEvent('mam-db-updated'));
        },
        add(userId, username = null) {
            this.load();
            if (userId) this.cache.uids[userId] = Date.now();
            if (username) this.cache.legacy[username.toLowerCase()] = Date.now();
            this.save();
        },
        has(userId, username = null) {
            this.load();
            if (userId && this.cache.uids[userId]) return true;
            if (username && this.cache.legacy[username.toLowerCase()]) return true;
            return false;
        },
        count() {
            this.load();
            return Object.keys(this.cache.uids).length + Object.keys(this.cache.legacy).length + this.cache.archived;
        },
        prune() {
            this.load();
            const now = Date.now();
            let changed = false;
            let prunedCount = 0;

            const checkPrune = (targetObj) => {
                for (const [id, timestamp] of Object.entries(targetObj)) {
                    if (now - timestamp > this.ttl) {
                        delete targetObj[id];
                        prunedCount++;
                        changed = true;
                    }
                }
            };

            checkPrune(this.cache.uids);
            checkPrune(this.cache.legacy);

            if (changed) {
                this.cache.archived += prunedCount;
                this.save();
            }
        },
        exportData() {
            this.load();
            return JSON.stringify({ version: 'beta-v2', data: this.cache });
        },
        importData(rawString) {
            try {
                const parsed = JSON.parse(rawString);
                this.load();

                // Legacy GiftMAM format detection: {"db": {...}, "archived": 123}
                if (parsed && parsed.db) {
                    let migrationCount = 0;
                    for (const [key, val] of Object.entries(parsed.db)) {
                        this.cache.legacy[key.toLowerCase()] = typeof val === 'number' ? val : Date.now();
                        migrationCount++;
                    }
                    const parsedArchived = parseInt(parsed.archived, 10);
                    if (!isNaN(parsedArchived)) {
                        this.cache.archived += parsedArchived;
                    }
                    this.save();
                    return { success: true, count: migrationCount + (isNaN(parsedArchived) ? 0 : parsedArchived), type: 'Legacy' };
                }

                // Native beta format
                if (parsed && parsed.version && parsed.data) {
                    this.cache.uids = { ...this.cache.uids, ...parsed.data.uids };
                    this.cache.legacy = { ...this.cache.legacy, ...parsed.data.legacy };
                    const parsedArchived = parseInt(parsed.data.archived, 10);
                    if (!isNaN(parsedArchived)) {
                        this.cache.archived += parsedArchived;
                    }
                    this.save();
                    return { success: true, count: this.count(), type: 'Native' };
                }

                throw new Error("Unrecognized payload structure.");
            } catch(err) {
                return { success: false, error: err.message };
            }
        }
    };

    // Prune stale records on initialization
    Database.prune();

    const DailyTracker = {
        getKey() { return 'mam_daily_gifts_tracker'; },
        get() {
            let data = { date: 0, count: 0 };
            try { data = JSON.parse(GM_getValue(this.getKey(), '{"date":0,"count":0}')); } catch(e) {}
            const d = new Date();
            d.setUTCHours(0, 0, 0, 0);
            const midnight = d.getTime();
            if (data.date !== midnight) {
                return { date: midnight, count: 0 };
            }
            return data;
        },
        increment() {
            const data = this.get();
            data.count += 1;
            GM_setValue(this.getKey(), JSON.stringify(data));
        },
        setMax() {
            const data = this.get();
            data.count = 100;
            GM_setValue(this.getKey(), JSON.stringify(data));
        },
        canGift() {
            return this.get().count < 100;
        }
    };

    const QueueManager = {
        users: [],

        getStorageKey() {
            return window.location.pathname === '/newUsers.php' ? 'mam_queue_full' : 'mam_queue_widget';
        },

        async loadAndMerge(newTargets, isRefresh = false) {
            const key = this.getStorageKey();
            let cached = [];
            try { cached = JSON.parse(GM_getValue(key, '[]')); } catch(e) {}

            let combined = [...cached, ...newTargets];

            const uniqueMap = new Map();
            combined.forEach(u => {
                if (u && u.id) uniqueMap.set(u.id.toString(), u);
            });

            let uniqueUsers = Array.from(uniqueMap.values());
            this.users = uniqueUsers.filter(u => !Database.has(u.id, u.name));

            GM_setValue(key, JSON.stringify(this.users));
            updateStatsCount();

            if (isRefresh) {
                const added = this.users.length - cached.length;
                if (added <= 0) {
                    Logger.log("No new mice found.");
                } else if (added === 1) {
                    Logger.log("1 new mouse found.");
                } else {
                    Logger.log(`${added} new mice found.`);
                }
            }
        },

        async initQueue() {
            const path = window.location.pathname;
            let foundUsers = [];

            if (path === '/newUsers.php') {
                const inputs = document.querySelectorAll('input[name="sendGiftTo[]"]');
                foundUsers = Array.from(inputs).map(input => {
                    const link = input.parentElement.querySelector('a');
                    return { id: input.value, name: link ? link.innerText.trim().split(' ')[0] : 'Unknown' };
                }).filter(u => u.id);
            } else if (path === '/' || path === '/index.php') {
                const links = document.querySelectorAll('#newestMembers a[href^="/u/"]');
                foundUsers = Array.from(links).map(a => {
                    const href = a.getAttribute('href');
                    return { id: href ? href.split('/u/')[1] : null, name: a.innerText.trim().split(' ')[0] };
                }).filter(u => u.id);
            } else {
                // On secondary pages, hydrate the widget queue from memory so the UI isn't blank
                const cached = GM_getValue('mam_queue_widget');
                if (cached) {
                    try {
                        this.users = JSON.parse(cached).filter(u => !Database.has(u.id, u.name));
                        updateStatsCount();
                    } catch(e) {}
                }
                return;
            }

            this.markGiftedUI();
            await this.loadAndMerge(foundUsers);
        },

        initObserver() {
            const observer = new MutationObserver((mutations) => {
                // Only trigger the paint sweep if new elements were actively injected by the site
                if (mutations.some(m => m.addedNodes.length > 0)) {
                    this.markGiftedUI();
                    // On index page, the newest members list is loaded via AJAX shortly after page load.
                    if (window.location.pathname === '/' || window.location.pathname === '/index.php') {
                        this.initQueue();
                    }
                }
            });

            const indexTarget = document.getElementById('newestMembers');
            const newUsersTarget = document.querySelector('.blockBodyCon.left');

            if (indexTarget) observer.observe(indexTarget, { childList: true, subtree: true });

            // Limit secondary observation to the specific page to prevent crossover
            if (window.location.pathname === '/newUsers.php' && newUsersTarget) {
                observer.observe(newUsersTarget, { childList: true, subtree: true });
            }
        },
        markGiftedUI() {
            const links = document.querySelectorAll('.blockBodyCon.left a[href^="/u/"], #newestMembers a[href^="/u/"]');
            links.forEach(link => {
                const id = link.getAttribute('href').split('/u/')[1];
                const name = link.innerText.trim().split(' ')[0];
                if (id && Database.has(id, name)) {
                    link.classList.add('mam-gifted-user');
                }
            });
        },
        async refresh() {
            const path = window.location.pathname;

            if (path === '/newUsers.php') {
                try {
                    const response = await fetch('/newUsers.php');
                    if (!response.ok) throw new Error(`HTTP ${response.status}`);

                    const htmlText = await response.text();
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(htmlText, 'text/html');

                    const userLabels = doc.querySelectorAll('input[name="sendGiftTo[]"]');
                    let foundUsers = Array.from(userLabels).map(input => ({
                        id: input.value,
                        name: input.nextElementSibling ? input.nextElementSibling.innerText.trim() : 'Unknown'
                    })).filter(u => u.id);

                    const siteContainer = document.querySelector('.blockBodyCon.left');
                    const newContainer = doc.querySelector('.blockBodyCon.left');
                    if (siteContainer && newContainer) {
                        siteContainer.innerHTML = newContainer.innerHTML;
                    }

                    this.markGiftedUI();
                    await this.loadAndMerge(foundUsers, true);
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

                    let foundUsers = Array.from(links).map(a => {
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

                    this.markGiftedUI();
                    await this.loadAndMerge(foundUsers, true);
                } catch (error) {
                    Logger.log(`API Error: ${error.message}`);
                }
            }
        }
    };

    const Engine = {
        lastApiCall: 0,
        heartbeatTimer: null,

        // Universal Rate Limiter: Ensures minGapMs passes between any API calls
        async enforceRateLimit(minGapMs = 15000) {
            const now = Date.now();
            const elapsed = now - this.lastApiCall;
            if (elapsed < minGapMs && this.lastApiCall !== 0) {
                const waitTime = minGapMs - elapsed;
                let slept = 0;
                while (slept < waitTime) {
                    if (!StateManager.state.isRunning) return false;
                    await new Promise(resolve => setTimeout(resolve, 200));
                    slept += 200;
                }
            }
            this.lastApiCall = Date.now();
            return true;
        },

        async apiFetch(url, options = {}) {
            await this.enforceRateLimit(15000);
            return fetch(url, options);
        },

        resetUI() {
            StateManager.state.isRunning = false;
            StateManager.state.progress = 0;
            StateManager.updateProgressBar(0);
            const btn = document.getElementById('btn-run');
            if (btn) {
                btn.classList.remove('stopping');
            }
            StateManager.broadcast('LEADER_RELEASE');
        },

        stop() {
            if (!StateManager.state.isRunning) return;
            StateManager.state.isRunning = false;
            Logger.log(`Stopping...`);
        },

        initHeartbeat() {
            if (this.heartbeatTimer) clearTimeout(this.heartbeatTimer);

            // Treat initial script load as an API interaction to push the first ping back 15m
            this.lastApiCall = Date.now();
            const targetInterval = 15 * 60 * 1000;

            const checkHeartbeat = () => {
                const buyAmt = StateManager.state.config.buyAmount;
                const renewVip = StateManager.state.config.renewVip;
                const timeSinceLastCall = Date.now() - this.lastApiCall;

                if (timeSinceLastCall >= targetInterval) {
                    if ((buyAmt !== 'Off' || renewVip) && !StateManager.state.isRunning) {
                        this.triggerHeartbeat().finally(() => {
                            this.heartbeatTimer = setTimeout(checkHeartbeat, targetInterval);
                        });
                        return;
                    }
                }

                // If skipped (due to recent API activity or active running), delay until next valid window
                const delay = Math.max(5000, targetInterval - timeSinceLastCall);
                this.heartbeatTimer = setTimeout(checkHeartbeat, delay);
            };

            this.heartbeatTimer = setTimeout(checkHeartbeat, targetInterval);
        },

        async triggerHeartbeat() {
            try {
                await this.enforceRateLimit(15000);
                const response = await fetch(`https://www.myanonamouse.net/jsonLoad.php?_t=${Date.now()}`, { cache: 'no-store' });
                this.lastApiCall = Date.now();
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                const data = await response.json();

                if (data.seedbonus !== undefined) {
                    StateManager.updateBP(parseInt(data.seedbonus, 10));
                }

                const currentBP = StateManager.state.currentBP || 0;

                // Concurrency Mutex: Prevents double purchasing across tabs
                const attemptPurchaseLock = async () => {
                    const lockId = Math.random().toString();
                    GM_setValue('mam_purchase_mutex', lockId);
                    await new Promise(r => setTimeout(r, 50 + Math.random() * 100)); // Jitter
                    if (GM_getValue('mam_purchase_mutex') !== lockId) return false;
                    const lastBuy = parseInt(GM_getValue('mam_last_buy_time', '0'), 10);
                    if (Date.now() - lastBuy < 30000) return false; // 30s global cooldown
                    GM_setValue('mam_last_buy_time', Date.now().toString());
                    return true;
                };

                // VIP Renewal Block
                if (StateManager.state.config.renewVip && data.vip_until) {
                    const vipExpiration = new Date(data.vip_until.replace(/-/g, '/')).getTime();
                    const remainingTimeMs = vipExpiration - Date.now();
                    const maxVipMs = 90 * 24 * 60 * 60 * 1000;
                    const minAllowedPurchaseMs = 7 * 24 * 60 * 60 * 1000;

                    if (remainingTimeMs <= (maxVipMs - minAllowedPurchaseMs)) {
                        const reserve = StateManager.state.config.minReserve;
                        if (currentBP >= reserve + 1250) {
                            if (await attemptPurchaseLock()) {
                                Logger.log("Renewing VIP...");
                                await this.enforceRateLimit(15000);
                                const res = await fetch('/json/bonusBuy.php?spendtype=VIP&duration=max');
                                this.lastApiCall = Date.now();

                                if (res.ok) {
                                    const vipData = await res.json();
                                    if (vipData.success) {
                                        Logger.log(`${logIcon('crown')} VIP renewed...`);
                                        AuditLogger.add("Renewed VIP status.");
                                        if (vipData.seedbonus !== undefined) StateManager.updateBP(parseInt(vipData.seedbonus, 10));
                                    } else {
                                        Logger.log(`VIP Renewal Rejected: ${vipData.error || 'Unknown error'}`);
                                    }
                                }
                            }
                        }
                    }
                }

                // Upload Amount Block
                const buyAmount = StateManager.state.config.buyAmount;
                const buyWhen = StateManager.state.config.buyWhen;

                if (buyAmount !== 'Off' && currentBP >= buyWhen) {
                    const parsedAmount = buyAmount === 'Max' ? 'Max Affordable ' : parseInt(buyAmount, 10);
                    const logLabel = buyAmount === 'Max' ? 'Max' : `${parsedAmount}GB`;

                    if (await attemptPurchaseLock()) {
                        Logger.log(`Buying ${logLabel} upload...`);
                        await this.enforceRateLimit(15000);
                        const res = await fetch(`/json/bonusBuy.php?spendtype=upload&amount=${encodeURIComponent(parsedAmount)}`);
                        this.lastApiCall = Date.now();

                        if (res.ok) {
                            const uData = await res.json();
                            if (uData.success) {
                                Logger.log(`${logIcon('buy')} (${logLabel}) bought.`);
                                AuditLogger.add(`${logLabel} bought.`);
                                if (uData.seedbonus !== undefined) StateManager.updateBP(parseInt(uData.seedbonus, 10));
                            } else {
                                Logger.log(`Upload buy failed: ${uData.error}`);
                            }
                        }
                    }
                }

            } catch (err) {
                Logger.log(`Heartbeat Error: ${err.message}`);
            }
        },

        async start() {
            if (StateManager.state.isRunning) return;
            if (StateManager.state.leaderTabId && StateManager.state.leaderTabId !== StateManager.myTabId) {
                Logger.log("Blocked: Another tab is controlling the queue.");
                return;
            }

            if (!DailyTracker.canGift()) {
                Logger.log(`${logIcon('stop', 13)} Daily limit (100) reached.`);
                return;
            }

            const limitVal = document.getElementById('mam-limit-select').value;
            let maxGifts = limitVal === 'ALL' ? QueueManager.users.length : parseInt(limitVal, 10);
            if (isNaN(maxGifts)) maxGifts = QueueManager.users.length;

            const targets = QueueManager.users.slice(0, maxGifts);
            if (targets.length === 0) {
                Logger.log("No targets in queue. Refresh first.");
                return;
            }

            const btn = document.getElementById('btn-run');
            if (btn) {
                btn.classList.add('stopping');
                btn.innerHTML = `<img src="${icons.gift}" style="width: 16px; height: 16px; vertical-align: middle;">`;
            }

            StateManager.state.isRunning = true;
            StateManager.state.isLeader = true;
            StateManager.broadcast('LEADER_CLAIM', { running: true });

            // Ensure no duplicate IDs exist in the active queue array before running
            const uniqueTargets = Array.from(new Map(targets.map(u => [u.id, u])).values());
            const safeTargets = uniqueTargets.filter(u => !Database.has(u.id, u.name));

            if (safeTargets.length === 0) {
                Logger.log("All targets already gifted. Aborting.");
                this.resetUI();
                return;
            }

            if (window.location.pathname === '/newUsers.php') {
                if (limitVal === 'ALL') {
                    Logger.log(`Gifting ALL (${safeTargets.length}) Mice`);
                } else {
                    const noun = safeTargets.length === 1 ? 'mouse' : 'mice';
                    Logger.log(`Gifting ${safeTargets.length} ${noun}`);
                }
            } else {
                Logger.log(`Gifting Newest Mice (${safeTargets.length})`);
            }

            const minReserve = StateManager.state.config.minReserve;
            let abortReason = null;

            for (let i = 0; i < safeTargets.length; i++) {
                if (!StateManager.state.isRunning) {
                    abortReason = "stopped";
                    break;
                }

                if (StateManager.state.currentBP !== null && StateManager.state.currentBP < minReserve) {
                    abortReason = `${logIcon('stop')} BP below minimum (${minReserve}).`;
                    break;
                }

                const user = safeTargets[i];

                try {
                    // Pre-emptively await the rate limit (15 seconds) with interruptibility
                    const limitPassed = await this.enforceRateLimit(15000);
                    if (!limitPassed || !StateManager.state.isRunning) {
                        abortReason = "stopped";
                        break;
                    }

                    let giftAmount = StateManager.state.config.giftAmount;
                    if (giftAmount === 'Max') giftAmount = '1000'; // Default max fallback for direct calls

                    const url = `/json/bonusBuy.php?spendtype=gift&amount=${giftAmount}&giftTo=${user.id}`;

                    const res = await fetch(url, {
                        headers: { 'Accept': 'application/json, text/javascript, */*; q=0.01' }
                    });

                    // Failsafe: if Stop is clicked mid-fetch, break instantly before processing.
                    if (!StateManager.state.isRunning) {
                        abortReason = "stopped";
                        break;
                    }

                    this.lastApiCall = Date.now();

                    if (!res.ok) throw new Error(`HTTP ${res.status}`);

                    const data = await res.json();

                    if (!data.success) {
                        const errStr = (data.error || "").toLowerCase();
                        if (errStr.includes("rate limit")) {
                            Logger.log(`${logIcon('slow')} Pausing 15 seconds...`);
                            let slept = 0;
                            while (slept < 15000) {
                                if (!StateManager.state.isRunning) {
                                    abortReason = "stopped";
                                    break;
                                }
                                await new Promise(r => setTimeout(r, 200));
                                slept += 200;
                            }
                            if (abortReason === "stopped") break;
                            throw new Error(data.error);
                        } else if (errStr.includes("insufficient points")) {
                            abortReason = `${logIcon('stop')} Insufficient BP. Stopping.`;
                            break;
                        } else if (errStr.includes("100 gifts today") || errStr.includes("max gifts today") || errStr.includes("resume tomorrow")) {
                            DailyTracker.setMax();
                            abortReason = `${logIcon('stop', 13)} Daily gift limit reached.`;
                            break;
                        } else if (errStr.includes("daily cap") || errStr.includes("invalid") || errStr.includes("disabled") || errStr.includes("not found")) {
                            // Quiet Adoption (Skip)
                            Logger.log(`${logIcon('error', 13)} ${user.name}: ${data.error} (Adopted)`);
                            Database.add(user.id, user.name);
                            QueueManager.markGiftedUI();
                            QueueManager.users = QueueManager.users.filter(u => u.id !== user.id);
                            updateStatsCount();

                            const pct = Math.round(((i + 1) / safeTargets.length) * 100);
                            StateManager.state.progress = pct;
                            StateManager.updateProgressBar(pct);
                            continue;
                        }
                        throw new Error(data.error || "Unknown error");
                    }

                    // Success handling
                    Logger.log(`${logIcon('check', 13)} ${user.name} (${giftAmount})`);
                    DailyTracker.increment();

                    if (data.seedbonus !== undefined) {
                        StateManager.updateBP(parseInt(data.seedbonus, 10));
                    } else if (StateManager.state.currentBP !== null) {
                        const amt = parseInt(giftAmount, 10) || 100;
                        StateManager.updateBP(StateManager.state.currentBP - amt);
                    }

                    Database.add(user.id, user.name);
                    QueueManager.markGiftedUI();
                    QueueManager.users = QueueManager.users.filter(u => u.id !== user.id);
                    updateStatsCount();

                    const pct = Math.round(((i + 1) / safeTargets.length) * 100);
                    StateManager.state.progress = pct;
                    StateManager.updateProgressBar(pct);
                    StateManager.broadcast('PROGRESS_SYNC', { progress: pct, bp: StateManager.state.currentBP });

                } catch (e) {
                    Logger.log(`${logIcon('error', 13)} ${user.name}: ${e.message}`);
                }
            }

            if (abortReason && abortReason !== "stopped") {
                Logger.log(abortReason);
            } else if (abortReason === "stopped") {
                Logger.log(`${logIcon('stop')} Stopped.`);
            } else {
                Logger.log(`${logIcon('gift')} Gifting complete.`);
            }

            this.resetUI();
        }
    };

    const PageTweaks = {
        styleEl: null,
        tooltipBound: false,

        init() {
            this.applyCompactLayout(StateManager.state.config.compactLayout);
            this.applyHideNews(StateManager.state.config.hideNews);
            this.applyPosition(StateManager.state.config.uiPosition);
            this.applyAutoMinimize(StateManager.state.config.autoMinimize);

            window.addEventListener('mam-config-updated', (e) => {
                if (e.detail.key === 'compactLayout') this.applyCompactLayout(e.detail.value);
                if (e.detail.key === 'hideNews') this.applyHideNews(e.detail.value);
                if (e.detail.key === 'uiPosition') this.applyPosition(e.detail.value);
            });
        },

        applyAutoMinimize(configArr = []) {
            const path = window.location.pathname;
            const isIndex = path === '/' || path === '/index.php';
            const isNew = path === '/newUsers.php';
            const isOther = !isIndex && !isNew;

            const panel = document.getElementById('mam-gift-panel');
            if (!panel) return;

            if ((isIndex && configArr.includes('Index')) ||
                (isNew && configArr.includes('New')) ||
                (isOther && configArr.includes('Other'))) {
                panel.classList.add('minimized');
            }
        },

        applyPosition(mode) {
            const panel = document.getElementById('mam-gift-panel');
            if (!panel) return;
            panel.classList.remove('pos-top-left', 'pos-top-right', 'pos-bottom-left', 'pos-bottom-right');
            panel.classList.add(`pos-${mode}`);
        },

        applyCompactLayout(isActive) {
            if (isActive) {
                if (!this.styleEl) {
                    this.styleEl = document.createElement('style');
                    this.styleEl.textContent = `
                        #fp_lt table thead, table:has(td.tabletitle) thead { display: none !important; }
                        #fpNM h3, #newestMembers h3 { display: none !important; }
                        #newestMembers { margin-top: 2px !important; }
                        #newestMembers a {
                            display: inline-block; max-width: 100%; overflow: hidden;
                            text-overflow: ellipsis; white-space: nowrap; vertical-align: bottom;
                        }
                        #fp_lt table td { padding: 4px 6px !important; }
                        #fp_lt .torRowDesc, #fp_lt .torRowMediaInfo { display: none !important; }
                        #fp_lt { overflow: hidden !important; padding-bottom: 5px !important; }
                    `;
                    document.head.appendChild(this.styleEl);
                }
                const nmContainer = document.getElementById('newestMembers');
                if (nmContainer && !this.tooltipBound) {
                    this.tooltipBound = true;
                    nmContainer.addEventListener('mouseover', (e) => {
                        const link = e.target.closest('a');
                        if (!link) return;
                        if (link.scrollWidth > link.clientWidth) link.title = link.textContent.trim();
                        else link.removeAttribute('title');
                    });
                }
            } else if (this.styleEl) {
                this.styleEl.remove();
                this.styleEl = null;
            }
        },

        applyHideNews(mode) {
            if (window.location.pathname !== '/' && window.location.pathname !== '/index.php') return;

            const fpTime = document.querySelector('.fpTime');
            const newsItems = document.querySelectorAll('.mainPageNews, .mainPageNewsSub');
            const newsHeader = document.querySelector('.mainPageNewsHead');

            // Reset visibility to baseline
            if (fpTime) fpTime.style.display = '';
            if (newsHeader) newsHeader.style.display = '';
            newsItems.forEach(item => item.style.display = '');

            if (mode === 'Off') return;

            if (fpTime) fpTime.style.display = 'none';

            if (mode === 'Hide') {
                if (newsHeader) newsHeader.style.display = 'none';
                newsItems.forEach(item => item.style.display = 'none');
                return;
            }

            if (mode === 'Click') {
                const dismissedNewsKey = 'mam_dismissed_news';
                let dismissedNews = [];
                try { dismissedNews = JSON.parse(GM_getValue(dismissedNewsKey, '[]')); } catch (e) {}

                let visibleCount = 0;

                newsItems.forEach(item => {
                    const itemHash = item.textContent.replace(/Click to dismiss this news/g, '').trim();

                    if (dismissedNews.includes(itemHash)) {
                        item.style.display = 'none';
                    } else {
                        visibleCount++;

                        if (!item.querySelector('.mam-news-date-dismiss') && item.innerHTML.match(/^\[\d{4}-\d{2}-\d{2}\]/)) {
                            item.innerHTML = item.innerHTML.replace(/^(\[\d{4}-\d{2}-\d{2}\])/, '<span class="mam-news-date-dismiss" title="Click to dismiss this news" style="cursor: pointer; transition: color 0.2s;">$1</span>');
                        }

                        const dateSpan = item.querySelector('.mam-news-date-dismiss');
                        if (dateSpan) {
                            dateSpan.onmouseover = () => dateSpan.style.color = '#ff4444';
                            dateSpan.onmouseout = () => dateSpan.style.color = '';
                            dateSpan.onclick = (e) => {
                                e.preventDefault();
                                dismissedNews.push(itemHash);
                                GM_setValue(dismissedNewsKey, JSON.stringify(dismissedNews));
                                item.style.display = 'none';
                                visibleCount--;
                                if (visibleCount <= 0 && newsHeader) newsHeader.style.display = 'none';
                            };
                        }
                    }
                });

                if (visibleCount <= 0 && newsHeader) newsHeader.style.display = 'none';
            }
        }
    };

    const DailiesManager = {
        init() {
            this.checkPageStates();
            this.updateUI();

            // Re-evaluate visibility once a minute to catch midnight rollovers dynamically
            setInterval(() => this.updateUI(), 60000);

            // Listen for configuration toggles
            window.addEventListener('mam-config-updated', (e) => {
                if (e.detail.key === 'vaultReminder' || e.detail.key === 'lottoReminder') {
                    this.updateUI();
                }
                if (e.detail.key === 'renewVip' && e.detail.value === true) {
                    Engine.triggerHeartbeat();
                }
            });

            // Optimistic UI: Snooze alerts for 5 minutes when clicked to give the user time to complete them
            const vBtn = document.getElementById('btn-vault-alert');
            const lBtn = document.getElementById('btn-lotto-alert');

            if (vBtn) vBtn.addEventListener('click', () => {
                GM_setValue('mam_vault_next_reset', (Date.now() + 300000).toString());
                this.updateUI();
            });
            if (lBtn) lBtn.addEventListener('click', () => {
                GM_setValue('mam_lotto_next_check', (Date.now() + 300000).toString());
                this.updateUI();
            });
        },
        getMidnightUTC() {
            const d = new Date();
            d.setUTCHours(0, 0, 0, 0);
            return d.getTime();
        },
        getNextLottoUTC() {
            const d = new Date();
            const day = d.getUTCDay();
            let daysUntilMonday = (1 + 7 - day) % 7;
            if (daysUntilMonday === 0) daysUntilMonday = 7;
            d.setUTCDate(d.getUTCDate() + daysUntilMonday);
            d.setUTCHours(0, 0, 0, 0);
            return d.getTime();
        },
        checkPageStates() {
            const path = window.location.pathname;
            const mainBody = document.getElementById('mainBody');

            if (path === '/millionaires/donate.php') {
                if (mainBody && mainBody.textContent.includes('You have already donated your max amount')) {
                    GM_setValue('mam_vault_next_reset', (this.getMidnightUTC() + 86400000).toString());
                }
            } else if (path === '/play_lotto.php') {
                if (mainBody && mainBody.textContent.includes('You have already played this week')) {
                    GM_setValue('mam_lotto_next_check', this.getNextLottoUTC().toString());
                }
            }
        },
        updateUI() {
            const now = Date.now();
            const vaultBtn = document.getElementById('btn-vault-alert');
            const lottoBtn = document.getElementById('btn-lotto-alert');

            if (vaultBtn) {
                const isEnabled = StateManager.state.config.vaultReminder;
                const nextVault = parseInt(GM_getValue('mam_vault_next_reset', '0'), 10);
                vaultBtn.style.display = (isEnabled && now > nextVault) ? 'inline-block' : 'none';
            }

            if (lottoBtn) {
                const isEnabled = StateManager.state.config.lottoReminder;
                const nextLotto = parseInt(GM_getValue('mam_lotto_next_check', '0'), 10);
                lottoBtn.style.display = (isEnabled && now > nextLotto) ? 'inline-block' : 'none';
            }
        }
    };

    const ShoutboxManager = {
        observer: null,
        init() {
            this.evaluateState();
            window.addEventListener('mam-config-updated', (e) => {
                if (e.detail.key === 'shoutboxGifting') this.evaluateState();
            });
        },
        evaluateState() {
            const isEnabled = StateManager.state.config.shoutboxGifting;
            const sbMenuMain = document.getElementById('sbMenuMain');
            if (!sbMenuMain) return;

            if (isEnabled) {
                if (!this.observer) {
                    this.observer = new MutationObserver((mutations) => {
                        if (mutations.some(m => m.addedNodes.length > 0)) this.modifyMenu(sbMenuMain);
                    });
                    this.observer.observe(sbMenuMain, { childList: true });
                }
                this.modifyMenu(sbMenuMain);
            } else {
                if (this.observer) {
                    this.observer.disconnect();
                    this.observer = null;
                }
                this.removeModifications(sbMenuMain);
            }
        },
        removeModifications(sbMenuMain) {
            const ul = sbMenuMain.querySelector('ul[data-uid]');
            if (ul && ul.dataset.mpModified) {
                delete ul.dataset.mpModified;
                const customRow = ul.querySelector('.mam-sb-actions');
                if (customRow) customRow.remove();
                const closeBtn = ul.querySelector('.mam-close-menu');
                if (closeBtn) closeBtn.remove();
            }
        },
        modifyMenu(sbMenuMain) {
            const ul = sbMenuMain.querySelector('ul[data-uid]');
            if (!ul || ul.dataset.mpModified) return;
            ul.dataset.mpModified = "true";
            ul.style.position = 'relative';

            const uid = ul.dataset.uid;
            const sbunLi = ul.querySelector('#sbun');

            if (sbunLi) {
                sbunLi.style.setProperty('padding-top', '4px', 'important');
                sbunLi.style.setProperty('padding-bottom', '4px', 'important');

                const usernameSpan = sbunLi.querySelector('span[data-uc]');
                const username = usernameSpan ? usernameSpan.textContent.trim() : "User";
                if (usernameSpan && !usernameSpan.parentElement.matches('a')) {
                    const userLink = document.createElement('a');
                    userLink.href = `/u/${uid}`;
                    userLink.target = "_blank";
                    userLink.style.textDecoration = "none";
                    usernameSpan.replaceWith(userLink);
                    userLink.appendChild(usernameSpan);
                }

                const pmIcon = sbunLi.querySelector('a[href^="/sendmessage.php"]');
                if (pmIcon) {
                    const actionRow = document.createElement('li');
                    actionRow.className = 'mam-sb-actions';
                    actionRow.style.cssText = 'display: flex; gap: 12px; align-items: center; margin-top: 4px; padding-left: 0px; list-style: none;';

                    pmIcon.style.display = 'flex';
                    pmIcon.style.alignItems = 'center';
                    actionRow.appendChild(pmIcon);

                    // --- GIFT POINTS ---
                    const giftPointsBtn = document.createElement('span');
                    giftPointsBtn.className = 'mam-emoji';
                    giftPointsBtn.innerHTML = `<img src="${icons.gift}" style="width: 14px; height: 14px; display: block;">`;
                    giftPointsBtn.style.cssText = 'cursor: pointer; display: flex; align-items: center; transition: transform 0.2s;';
                    giftPointsBtn.title = "Gift Points";
                    giftPointsBtn.onmouseover = () => giftPointsBtn.style.transform = 'scale(1.2)';
                    giftPointsBtn.onmouseout = () => giftPointsBtn.style.transform = 'scale(1)';
                    giftPointsBtn.onclick = async (e) => {
                        e.stopPropagation();
                        let defaultPoints = StateManager.state.config.giftAmount;
                        if (defaultPoints === 'Max') defaultPoints = '1000';

                        const amount = window.prompt(`Enter points to gift ${username} (5-1000):`, defaultPoints);
                        if (amount !== null) {
                            const numAmount = parseInt(amount, 10);
                            if (numAmount >= 5 && numAmount <= 1000) {
                                if (typeof hideSBmenu === 'function') hideSBmenu();
                                try {
                                    await Engine.enforceRateLimit(2000);
                                    const resp = await fetch(`/json/bonusBuy.php?spendtype=gift&amount=${numAmount}&giftTo=${uid}`);
                                    const data = await resp.json();
                                    Engine.lastApiCall = Date.now();

                                    if (data.success) {
                                        Logger.log(`${logIcon('check', 13)} ${numAmount} BP to ${username}`);
                                        if (data.seedbonus !== undefined) StateManager.updateBP(parseInt(data.seedbonus, 10));
                                    } else {
                                        Logger.log(`${logIcon('error', 13)} ${username}: ${data.error}`);
                                    }
                                } catch (err) {
                                    Logger.log(`${logIcon('error', 13)} Network error sending gift.`);
                                }
                            } else {
                                alert("Invalid amount. Must be between 5 and 1000.");
                            }
                        }
                    };
                    actionRow.appendChild(giftPointsBtn);

                    // --- GIFT WEDGE ---
                    const giftWedgeBtn = document.createElement('span');
                    giftWedgeBtn.className = 'mam-emoji';
                    giftWedgeBtn.innerHTML = `<img src="${icons.cheese}" style="width: 14px; height: 14px; display: block;">`;
                    giftWedgeBtn.style.cssText = 'cursor: pointer; display: flex; align-items: center; transition: transform 0.2s;';
                    giftWedgeBtn.title = "Gift Freeleech Wedge";
                    giftWedgeBtn.onmouseover = () => giftWedgeBtn.style.transform = 'scale(1.2)';
                    giftWedgeBtn.onmouseout = () => giftWedgeBtn.style.transform = 'scale(1)';
                    giftWedgeBtn.onclick = async (e) => {
                        e.stopPropagation();
                        if (window.confirm(`Send 1 Freeleech Wedge to ${username}?`)) {
                            if (typeof hideSBmenu === 'function') hideSBmenu();
                            try {
                                await Engine.enforceRateLimit(2000);
                                const resp = await fetch(`/json/bonusBuy.php?spendtype=sendWedge&giftTo=${uid}`);
                                const data = await resp.json();
                                Engine.lastApiCall = Date.now();

                                if (data.success) {
                                    Logger.log(`${logIcon('check', 13)} Wedge to ${username}`);
                                    if (data.seedbonus !== undefined) StateManager.updateBP(parseInt(data.seedbonus, 10));
                                } else {
                                    Logger.log(`${logIcon('error', 13)} ${username}: ${data.error}`);
                                }
                            } catch (err) {
                                Logger.log(`${logIcon('error', 13)} Network error sending wedge.`);
                            }
                        }
                    };
                    actionRow.appendChild(giftWedgeBtn);
                    sbunLi.insertAdjacentElement('afterend', actionRow);
                }
            }

            const sbQuote = ul.querySelector('#sbQuote');
            if (sbQuote) {
                sbQuote.style.cssText = 'display: block !important; width: fit-content !important; padding-right: 10px !important; margin-bottom: 2px !important; border-bottom: none !important;';
            }

            ul.querySelectorAll('li').forEach(li => {
                if (li.innerHTML.trim() === '') li.remove();
            });

            if (!ul.querySelector('.mam-close-menu')) {
                const closeBtn = document.createElement('div');
                closeBtn.className = 'mam-close-menu';
                closeBtn.innerHTML = '✖';
                closeBtn.style.cssText = 'position: absolute !important; top: 4px !important; right: 2px !important; cursor: pointer !important; color: #ff4c4c !important; font-weight: bold !important; font-size: 14px !important; z-index: 1000 !important; line-height: 1 !important; padding: 2px 6px !important; margin: 0 !important; border: none !important; background: transparent !important; display: block !important;';
                closeBtn.title = "Close Menu";
                closeBtn.onclick = (e) => {
                    e.stopPropagation();
                    if (typeof hideSBmenu === 'function') {
                        hideSBmenu();
                    } else {
                        sbMenuMain.classList.add('hideMe');
                        const clickedRow = document.querySelector('.sb_clicked_row');
                        if (clickedRow) clickedRow.classList.remove('sb_clicked_row');
                    }
                };
                ul.appendChild(closeBtn);
            }
        }
    };

    // ==========================================
    // 4. UI LOGIC & EVENT ROUTING
    // ==========================================

    const ForumManager = {
        init() {
            if (window.location.pathname.startsWith('/f/t/')) {
                this.evaluateState();
                window.addEventListener('mam-config-updated', (e) => {
                    if (e.detail.key === 'forumGifting') this.evaluateState();
                });
            }
        },
        evaluateState() {
            if (StateManager.state.config.forumGifting) {
                this.injectButtons();
            } else {
                this.removeButtons();
            }
        },
        removeButtons() {
            document.querySelectorAll('.mam-forum-gifting-container').forEach(el => el.remove());
        },
        injectButtons() {
            const pmLinks = document.querySelectorAll('td.row2 a[href*="/sendmessage.php?receiver="]');
            pmLinks.forEach(pmLink => {
                if (pmLink.nextElementSibling && pmLink.nextElementSibling.classList.contains('mam-forum-gifting-container')) return;

                const match = pmLink.href.match(/receiver=(\d+)/);
                if (!match) return;
                const uid = match[1];

                const img = pmLink.querySelector('img');
                let username = "User";
                if (img && img.alt && img.alt.startsWith("PM ")) {
                    username = img.alt.substring(3);
                }

                pmLink.style.display = 'inline-flex';
                pmLink.style.alignItems = 'center';
                pmLink.style.verticalAlign = 'middle';

                const container = document.createElement('span');
                container.className = 'mam-forum-gifting-container';
                container.style.cssText = 'display: inline-flex; gap: 6px; align-items: center; margin-left: 6px; vertical-align: middle;';

                // Gift Points Button
                const giftBtn = document.createElement('span');
                giftBtn.className = 'mam-emoji';
                giftBtn.innerHTML = `<img src="${icons.gift}" style="width: 14px; height: 14px; display: block;">`;
                giftBtn.style.cssText = 'cursor: pointer; transition: transform 0.2s; display: flex; align-items: center;';
                giftBtn.title = "Gift Points";
                giftBtn.onmouseover = () => giftBtn.style.transform = 'scale(1.2)';
                giftBtn.onmouseout = () => giftBtn.style.transform = 'scale(1)';
                giftBtn.onclick = async (e) => {
                    e.preventDefault();
                    if (!DailyTracker.canGift()) {
                        Logger.log(`${logIcon('stop', 13)} Daily gift limit reached.`);
                        return;
                    }
                    let defaultPoints = StateManager.state.config.giftAmount;
                    if (defaultPoints === 'Max') defaultPoints = '1000';
                    const amount = window.prompt(`Enter points to gift ${username} (5-1000):`, defaultPoints);
                    if (amount !== null) {
                        const numAmount = parseInt(amount, 10);
                        if (numAmount >= 5 && numAmount <= 1000) {
                            try {
                                await Engine.enforceRateLimit(2000);
                                const resp = await fetch(`/json/bonusBuy.php?spendtype=gift&amount=${numAmount}&giftTo=${uid}`);
                                const data = await resp.json();
                                Engine.lastApiCall = Date.now();
                                if (data.success) {
                                    Logger.log(`${logIcon('check', 13)} ${numAmount} BP to ${username}`);
                                    DailyTracker.increment();
                                    if (data.seedbonus !== undefined) StateManager.updateBP(parseInt(data.seedbonus, 10));
                                } else {
                                    let errStr = data.error || "";
                                    if (errStr.toLowerCase().includes("100 gifts today")) DailyTracker.setMax();
                                    Logger.log(`${logIcon('error', 13)} ${username}: ${errStr}`);
                                }
                            } catch (err) {
                                Logger.log(`${logIcon('error', 13)} Network error sending gift.`);
                            }
                        } else {
                            alert("Invalid amount. Must be between 5 and 1000.");
                        }
                    }
                };
                container.appendChild(giftBtn);

                // Gift Wedge Button
                const wedgeBtn = document.createElement('span');
                wedgeBtn.className = 'mam-emoji';
                wedgeBtn.innerHTML = `<img src="${icons.cheese}" style="width: 14px; height: 14px; display: block;">`;
                wedgeBtn.style.cssText = 'cursor: pointer; transition: transform 0.2s; display: flex; align-items: center;';
                wedgeBtn.title = "Gift Freeleech Wedge";
                wedgeBtn.onmouseover = () => wedgeBtn.style.transform = 'scale(1.2)';
                wedgeBtn.onmouseout = () => wedgeBtn.style.transform = 'scale(1)';
                wedgeBtn.onclick = async (e) => {
                    e.preventDefault();
                    if (!DailyTracker.canGift()) {
                        Logger.log(`${logIcon('stop', 13)} Daily gift limit reached.`);
                        return;
                    }
                    if (window.confirm(`Send 1 Freeleech Wedge to ${username}?`)) {
                        try {
                            await Engine.enforceRateLimit(2000);
                            const resp = await fetch(`/json/bonusBuy.php?spendtype=sendWedge&giftTo=${uid}`);
                            const data = await resp.json();
                            Engine.lastApiCall = Date.now();
                            if (data.success) {
                                Logger.log(`${logIcon('check', 13)} Wedge to ${username}`);
                                DailyTracker.increment();
                                if (data.seedbonus !== undefined) StateManager.updateBP(parseInt(data.seedbonus, 10));
                            } else {
                                let errStr = data.error || "";
                                if (errStr.toLowerCase().includes("100 gifts today")) DailyTracker.setMax();
                                Logger.log(`${logIcon('error', 13)} ${username}: ${errStr}`);
                            }
                        } catch (err) {
                            Logger.log(`${logIcon('error', 13)} Network error sending wedge.`);
                        }
                    }
                };
                container.appendChild(wedgeBtn);

                pmLink.parentNode.insertBefore(container, pmLink.nextSibling);
            });
        }
    };

    // Initialize Subsystems (State MUST load before Tweaks)
    StateManager.init();
    PageTweaks.init();
    DailiesManager.init();
    ShoutboxManager.init();
    ForumManager.init();
    Engine.initHeartbeat();
    AuditLogger.render();

    // Dynamically maintain queue metrics on database adjustment events
    const updateStatsCount = () => {
        const countEl = document.getElementById('mam-ui-queue');
        if (countEl) {
            const total = Database.count().toLocaleString('en-US');
            const queueCount = QueueManager.users.length;
            const queueHtml = queueCount > 0 ? ` <span style="color:#00bcd4; font-weight:bold;">(${queueCount})</span>` : '';

            countEl.innerHTML = `${total}${queueHtml}`;
            countEl.parentElement.title = `Mice Gifted: ${total} | In Queue: ${queueCount}`;
        }
    };
    window.addEventListener('mam-db-updated', updateStatsCount);

    // Apply persistent visual states on page load and watch for native site AJAX updates
    QueueManager.markGiftedUI();
    QueueManager.initObserver();
    QueueManager.initQueue();
    updateStatsCount();

    // -----------------------------------------------------
    // Configuration Data Binding & Listeners
    // -----------------------------------------------------

    const bindSegment = (id, key) => {
        const container = document.getElementById(id);
        if (!container) return null;

        const updateActive = (val) => {
            container.querySelectorAll('[data-val]').forEach(seg => {
                seg.classList.toggle('active', seg.dataset.val === val);
            });
        };

        updateActive(StateManager.state.config[key]);

        container.addEventListener('click', (e) => {
            const seg = e.target.closest('[data-val]');
            if (!seg) return;
            const val = seg.dataset.val;
            updateActive(val);
            StateManager.updateConfig(key, val);
            if (key === 'buyAmount') toggleBuyWhen();
        });
        return container;
    };

    const bindInput = (id, key, type = 'string', min = null, max = null) => {
        const el = document.getElementById(id);
        if (!el) return;

        if (type === 'checkbox') {
            el.checked = StateManager.state.config[key];
            el.addEventListener('change', (e) => StateManager.updateConfig(key, e.target.checked));
        } else {
            el.value = StateManager.state.config[key];
            el.addEventListener('change', (e) => {
                let val = e.target.value;
                if (type === 'number') {
                    val = parseInt(val, 10) || (min || 0);
                    if (min !== null && val < min) val = min;
                    if (max !== null && val > max) val = max;
                    e.target.value = val;
                } else if (key === 'giftAmount') {
                    if (val.toLowerCase() === 'max') val = 'Max';
                    else {
                        val = parseInt(val, 10) || 100;
                        if (val < 5) val = 5;
                        if (val > 1000) val = 1000;
                    }
                    e.target.value = val;
                }
                StateManager.updateConfig(key, val);
            });
        }
        return el;
    };

    bindInput('mam-cfg-amount', 'giftAmount', 'string');
    bindInput('mam-cfg-reserve', 'minReserve', 'number', 1000, 99999);
    bindInput('mam-cfg-shoutbox', 'shoutboxGifting', 'checkbox');
    bindInput('mam-cfg-forum', 'forumGifting', 'checkbox');
    bindSegment('mam-cfg-buy-amount', 'buyAmount');
    const elBuyWhen = bindInput('mam-cfg-buy-when', 'buyWhen', 'number', 1000, 99999);
    bindInput('mam-cfg-renew-vip', 'renewVip', 'checkbox');
    bindInput('mam-cfg-vault-remind', 'vaultReminder', 'checkbox');
    bindInput('mam-cfg-lotto-remind', 'lottoReminder', 'checkbox');
    bindSegment('mam-cfg-hide-news', 'hideNews');
    bindInput('mam-cfg-compact', 'compactLayout', 'checkbox');
    bindSegment('mam-cfg-position', 'uiPosition');

    const bindMultiSegment = (id, key) => {
        const container = document.getElementById(id);
        if (!container) return null;

        const updateActive = () => {
            const currentArr = StateManager.state.config[key] || [];
            container.querySelectorAll('[data-val]').forEach(seg => {
                seg.classList.toggle('active', currentArr.includes(seg.dataset.val));
            });
        };

        updateActive();

        container.addEventListener('click', (e) => {
            const seg = e.target.closest('[data-val]');
            if (!seg) return;
            const val = seg.dataset.val;
            let currentArr = [...(StateManager.state.config[key] || [])];
            if (currentArr.includes(val)) {
                currentArr = currentArr.filter(v => v !== val);
            } else {
                currentArr.push(val);
            }
            StateManager.updateConfig(key, currentArr);
            updateActive();
        });
        return container;
    };

    bindMultiSegment('mam-cfg-auto-minimize', 'autoMinimize');

    // UI Logic: Disable 'Buy When' if 'Buy Amount' is 'Off'
    const toggleBuyWhen = () => {
        const row = document.getElementById('row-buy-when');
        if (StateManager.state.config.buyAmount === 'Off') {
            row.style.opacity = '0.4';
            elBuyWhen.disabled = true;
        } else {
            row.style.opacity = '1';
            elBuyWhen.disabled = false;
        }
    };
    toggleBuyWhen();

    // News Reset Stub
    const btnResetNews = document.getElementById('btn-reset-news');
    if (btnResetNews) {
        btnResetNews.addEventListener('click', (e) => {
            e.stopPropagation();
            GM_setValue('mam_dismissed_news', '[]');
            PageTweaks.applyHideNews(StateManager.state.config.hideNews);
            Logger.log("Dismissed news cache cleared.");
        });
    }

    // Data Management Systems
    const btnExport = document.getElementById('btn-export');
    if (btnExport) {
        btnExport.addEventListener('click', (e) => {
            e.stopPropagation();
            try {
                const exportStr = Database.exportData();
                navigator.clipboard.writeText(exportStr).then(() => {
                    btnExport.textContent = 'Copied!';
                    Logger.log("Database export payload copied to clipboard.");
                    setTimeout(() => { btnExport.textContent = 'Export'; }, 2000);
                });
            } catch (err) {
                Logger.log(`Export failed: ${err.message}`);
            }
        });
    }

    const btnImport = document.getElementById('btn-import');
    if (btnImport) {
        btnImport.addEventListener('click', (e) => {
            e.stopPropagation();
            const input = window.prompt("Paste your exported GiftMAM (Legacy or Beta) backup payload string string here:");
            if (!input) return;

            const res = Database.importData(input);
            if (res.success) {
                Logger.log(`Import successful! Parsed ${res.count} records via [${res.type}] structure.`);
                QueueManager.markGiftedUI();
            } else {
                window.alert(`Import rejection error: ${res.error}`);
                Logger.log(`Import rejection error: ${res.error}`);
            }
        });
    }

    const btnWipe = document.getElementById('btn-wipe');
    if (btnWipe) {
        btnWipe.addEventListener('click', (e) => {
            e.stopPropagation();
            if (btnWipe.textContent === 'Wipe') {
                btnWipe.textContent = 'Sure?';
                btnWipe.style.backgroundColor = '#990000';
                setTimeout(() => {
                    if (btnWipe.textContent === 'Sure?') {
                        btnWipe.textContent = 'Wipe';
                        btnWipe.style.backgroundColor = '';
                    }
                }, 4000);
            } else if (btnWipe.textContent === 'Sure?') {
                GM_setValue(Database.key, JSON.stringify({ uids: {}, legacy: {}, archived: 0 }));
                Database.cache = { uids: {}, legacy: {}, archived: 0 };
                window.dispatchEvent(new CustomEvent('mam-db-updated'));
                QueueManager.markGiftedUI();

                btnWipe.textContent = 'Wiped!';
                btnWipe.style.backgroundColor = '';
                Logger.log("Database cleared entirely.");
                setTimeout(() => { btnWipe.textContent = 'Wipe'; }, 2000);
            }
        });
    }

    // View Management
    const views = {
        main: document.getElementById('mam-view-main'),
        settings: document.getElementById('mam-view-settings'),
        about: document.getElementById('mam-view-about'),
        audit: document.getElementById('mam-view-audit'),
        changelog: document.getElementById('mam-view-changelog')
    };

    function switchView(targetViewKey) {
        // Hide all views
        Object.values(views).forEach(v => {
            if (v) v.classList.remove('active');
        });

        // Show target
        if (views[targetViewKey]) {
            views[targetViewKey].classList.add('active');
        }

        // Reset header button colors
        document.getElementById('btn-settings').style.color = (targetViewKey === 'settings' || targetViewKey === 'audit') ? 'var(--mam-accent)' : 'var(--mam-text-muted)';
    }

    // Bind Header Buttons
    document.getElementById('btn-settings').addEventListener('click', (e) => {
        e.stopPropagation();
        // Return to main if currently in settings or audit
        const isActive = views.settings.classList.contains('active') || views.audit.classList.contains('active');
        switchView(isActive ? 'main' : 'settings');
    });

    document.getElementById('btn-about-title').addEventListener('click', (e) => {
        e.stopPropagation();
        const isCurrentlyAbout = views.about.classList.contains('active') || views.changelog.classList.contains('active');
        switchView(isCurrentlyAbout ? 'main' : 'about');
    });

    // Bind Audit Buttons
    document.getElementById('btn-open-audit').addEventListener('click', (e) => {
        e.stopPropagation();
        AuditLogger.render();
        switchView('audit');
    });

    document.getElementById('btn-close-audit').addEventListener('click', (e) => {
        e.stopPropagation();
        switchView('settings');
    });

    // Bind Changelog Buttons
    document.getElementById('btn-open-changelog').addEventListener('click', (e) => {
        e.stopPropagation();
        switchView('changelog');

        const content = document.getElementById('mam-changelog-content');
        if (content.dataset.loaded) return;

        GM_xmlhttpRequest({
            method: "GET",
            url: "https://api.github.com/repos/Photaz/GiftMAM/releases",
            onload: function(response) {
                if (response.status !== 200) {
                    content.innerHTML = '<div style="color: #d32f2f; text-align: center; margin-top: 20px;">Failed to load release notes.</div>';
                    return;
                }
                try {
                    const releases = JSON.parse(response.responseText);
                    if (releases && releases.length > 0) {
                        const data = releases[0];
                        const bodyText = data.body || "*No release notes provided.*";
                        // Strip markdown hashes and convert bullet points for clean UI rendering
                        const formatted = bodyText.replace(/\r\n/g, '<br>').replace(/^- /gm, '• ').replace(/#/g, '');
                        content.innerHTML = `<div style="color: #5EB9FF; font-weight: bold; margin-bottom: 6px; font-size: 12px;">${data.name || data.tag_name}</div><div style="color: var(--mam-text);">${formatted}</div>`;
                    } else {
                        content.innerHTML = '<div style="color: var(--mam-text-muted); text-align: center; margin-top: 20px;">No release notes found.</div>';
                    }
                    content.dataset.loaded = 'true';
                } catch (e) {
                    content.innerHTML = '<div style="color: #d32f2f; text-align: center; margin-top: 20px;">Error parsing release notes.</div>';
                }
            },
            onerror: function() {
                content.innerHTML = '<div style="color: #d32f2f; text-align: center; margin-top: 20px;">Failed to connect to GitHub.</div>';
            }
        });
    });

    document.getElementById('btn-close-changelog').addEventListener('click', (e) => {
        e.stopPropagation();
        switchView('about');
    });

    document.querySelector('.mam-refresh-btn').addEventListener('click', (e) => {
        e.preventDefault();
        QueueManager.refresh();
    });

    document.getElementById('btn-run').addEventListener('click', (e) => {
        e.preventDefault();
        const btn = e.currentTarget;

        // Prevent double-clicks from starting a new loop while the engine is safely shutting down
        if (btn.classList.contains('stopping') && !StateManager.state.isRunning) return;

        if (!StateManager.state.isRunning) {
            Engine.start();
        } else {
            Engine.stop();
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