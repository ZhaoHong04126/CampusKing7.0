/* ========================================================================== */
/* 📌 自訂全域彈窗元件 (Custom Modals: Alert, Confirm, Prompt)                  */
/* ========================================================================== */

// 全域函式：顯示自訂 Alert Modal (取代原生的 window.alert)
window.showAlert = function(message, title = "💡 提示") {
    return new Promise((resolve) => {
        const modal = document.getElementById('custom-modal');
        if(!modal) { alert(message); resolve(); return; }
        
        document.getElementById('custom-modal-title').innerText = title;
        document.getElementById('custom-modal-message').innerText = message;
        document.getElementById('custom-modal-input-container').style.display = 'none';
        
        const actions = document.getElementById('custom-modal-actions');
        actions.innerHTML = `<button class="btn" onclick="closeCustomModal(true)" style="flex:1; max-width:120px;">好，知道了</button>`;
        
        window._customModalResolve = resolve;
        
        modal.style.display = 'flex';
    });
}

// 全域函式：顯示自訂 Confirm Modal (取代原生的 window.confirm)，回傳布林值
window.showConfirm = function(message, title = "❓ 確認") {
    return new Promise((resolve) => {
        const modal = document.getElementById('custom-modal');
        if(!modal) { resolve(confirm(message)); return; }
        
        document.getElementById('custom-modal-title').innerText = title;
        document.getElementById('custom-modal-message').innerText = message;
        document.getElementById('custom-modal-input-container').style.display = 'none';
        
        const actions = document.getElementById('custom-modal-actions');
        actions.innerHTML = `
            <button class="btn" onclick="closeCustomModal(false)" style="flex:1; background:#eee; color:#666;">取消</button>
            <button class="btn" onclick="closeCustomModal(true)" style="flex:1;">確定</button>
        `;
        
        window._customModalResolve = resolve;
        modal.style.display = 'flex';
    });
}

// 全域函式：顯示自訂 Prompt Modal (取代原生的 window.prompt)，回傳輸入字串或 null
window.showPrompt = function(message, defaultValue = "", title = "✏️ 輸入") {
    return new Promise((resolve) => {
        const modal = document.getElementById('custom-modal');
        if(!modal) { resolve(prompt(message, defaultValue)); return; }
        
        document.getElementById('custom-modal-title').innerText = title;
        document.getElementById('custom-modal-message').innerText = message;
        
        const inputContainer = document.getElementById('custom-modal-input-container');
        const input = document.getElementById('custom-modal-input');
        inputContainer.style.display = 'block';
        
        input.value = defaultValue;
        input.focus();
        
        const actions = document.getElementById('custom-modal-actions');
        actions.innerHTML = `
            <button class="btn" onclick="closeCustomModal(null)" style="flex:1; background:#eee; color:#666;">取消</button>
            <button class="btn" onclick="closeCustomModal(document.getElementById('custom-modal-input').value)" style="flex:1;">確定</button>
        `;
        
        window._customModalResolve = resolve;
        modal.style.display = 'flex';
    });
}

// 關閉自訂 Modal 並觸發 Promise 執行回傳結果
window.closeCustomModal = function(result) {
    const modal = document.getElementById('custom-modal');
    modal.style.display = 'none';
    
    if (window._customModalResolve) {
        window._customModalResolve(result);
        window._customModalResolve = null;
    }
}



/* ========================================================================== */
/* 📌 路由與導航控制 (Routing & Navigation)                                     */
/* ========================================================================== */

// 監聽瀏覽器上一頁/下一頁事件，並切換對應的視圖
window.addEventListener('popstate', (event) => {
    const targetView = event.state ? event.state.view : 'home';
    switchTab(targetView, false);
});

// 左上角返回按鈕的功能，若無歷史紀錄則返回首頁
function goBack() {
    if (window.history.state && window.history.state.view !== 'home') {
        window.history.back();
    } else {
        switchTab('home');
    }
}

// 核心頁面切換函式，隱藏其他頁面並更新 URL History 與頁面標題
function switchTab(tabName, addToHistory = true) {
    if (typeof exitAllEditModes === 'function') exitAllEditModes();
    
    const views = [
        'home', 'schedule', 'calendar', 
        'settings', 'chart', 'credits',
        'regular', 'midterm', 'grades',
        'exams-hub', 'grade-manager', 'accounting',
        'notes', 'anniversary', 'learning',
        'lottery', 'homework','grade-calc',
        'notifications'
    ];
    
    views.forEach(view => {
        const el = document.getElementById('view-' + view);
        if (el) el.style.display = 'none';
        
        const btn = document.getElementById('btn-' + view);
        if (btn) btn.classList.remove('active');
    });

    const targetView = document.getElementById('view-' + tabName);
    if (targetView) {
        targetView.style.display = 'block';
        document.body.setAttribute('data-page', tabName);
    }
    
    const targetBtn = document.getElementById('btn-' + tabName);
    if (targetBtn) targetBtn.classList.add('active');

    const backBtn = document.getElementById('nav-back-btn');
    const homeBtn = document.getElementById('nav-home-btn');
    const titleEl = document.getElementById('app-title');
    
    if (tabName === 'home') {
        if (backBtn) backBtn.style.display = 'none';
        if (homeBtn) homeBtn.style.display = 'none';
        if (titleEl) titleEl.innerText = '📅 校園王';
    } else {
        if (backBtn) backBtn.style.display = 'block';
        if (homeBtn) homeBtn.style.display = 'block';
        
        let pageTitle = "校園王";
        switch(tabName) {
            case 'schedule': pageTitle = "我的課表"; break;
            case 'calendar': pageTitle = "學期行事曆"; break;
            case 'grade-manager': pageTitle = "成績管理"; break;
            case 'accounting': pageTitle = "學期記帳"; break;
            case 'notes': pageTitle = "記事本"; break;
            case 'anniversary': pageTitle = "紀念日"; break;
            case 'settings': pageTitle = "個人設定"; break;
            case 'lottery': pageTitle = "幸運籤筒"; break;
            case 'learning': pageTitle = "學習進度"; break;
            case 'homework': pageTitle = "作業管理"; break;
            case 'grade-calc': pageTitle = "配分筆記"; break;
            case 'notifications': pageTitle = "通知中心"; break;
        }
        if (titleEl) titleEl.innerText = pageTitle;
    }

    if (addToHistory) {
        if (tabName !== 'home') {
            history.pushState({ view: tabName }, null, `#${tabName}`);
        } else {
            history.pushState({ view: 'home' }, null, './');
        }
    }

    if (tabName === 'schedule') {
        switchDay(currentDay);
        if (typeof switchScheduleMode === 'function') switchScheduleMode('daily');
    }
    if (tabName === 'calendar') {
        if (typeof renderCalendar === 'function') renderCalendar();
        if (typeof switchCalendarTab === 'function') switchCalendarTab('month');
    }
    if (tabName === 'grade-manager' && typeof switchGradeTab === 'function') switchGradeTab('dashboard');
    if (tabName === 'accounting') {
        if (typeof switchAccTab === 'function') switchAccTab('summary');
        else if (typeof renderAccounting === 'function') renderAccounting();
    }
    if (tabName === 'learning' && typeof renderLearning === 'function') renderLearning();
    if (tabName === 'lottery' && typeof renderLottery === 'function') renderLottery();
    if (tabName === 'homework' && typeof renderHomework === 'function') renderHomework();
    if (tabName === 'grade-calc' && typeof renderGradeCalc === 'function') renderGradeCalc();
    
}



/* ========================================================================== */
/* 📌 介面初始化與主題模式 (Initialization & Theme)                           */
/* ========================================================================== */

// 應用程式登入後的初始化設定，顯示專屬按鈕並載入初始資料
function initUI() {
    loadTheme(); 
    
    const uniElements = document.querySelectorAll('.uni-only');
    uniElements.forEach(el => el.style.display = 'table-cell'); 
    
    switchDay(currentDay);
    loadGrades();
    if (typeof renderWeeklyTable === 'function') renderWeeklyTable();
    if (typeof renderAnalysis === 'function') renderAnalysis();
    if (typeof checkCalendarNotifications === 'function') checkCalendarNotifications();
    if (typeof checkHomeworkNotifications === 'function') checkHomeworkNotifications();
    if (typeof checkAccountingNotifications === 'function') checkAccountingNotifications();
    if (typeof updateNotificationBtnUI === 'function') updateNotificationBtnUI();

    if (typeof renderHomeApps === 'function') renderHomeApps();
    if (!userPreferences.onboarded) {
        openOnboardingModal();
    }
}

// 切換深色與淺色主題，並將設定存入 LocalStorage
function toggleTheme() {
    const root = document.documentElement;
    const currentTheme = root.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeUI(newTheme);
}

// 應用程式啟動時載入已儲存的主題偏好
function loadTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeUI(savedTheme);
}

// 更新主題切換開關的狀態文字
function updateThemeUI(theme) {
    const statusEl = document.getElementById('theme-status');
    if (statusEl) {
        statusEl.innerText = theme === 'dark' ? 'ON' : 'OFF';
        statusEl.style.color = theme === 'dark' ? '#2ecc71' : '#ccc';
    }
}



/* ========================================================================== */
/* 📌 個人化設定與系統操作 (Personalization & Export)                           */
/* ========================================================================== */

// 使用 html2canvas 將週課表表格轉為圖片下載至本地裝置
function exportSchedule() {
    const table = document.querySelector('.weekly-table');
    if (!table) return;
    
    const btn = event.currentTarget;
    const originalText = btn.innerHTML;
    btn.innerHTML = "⏳ 處理中...";
    
    html2canvas(table, {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true
    }).then(canvas => {
        const link = document.createElement('a');
        link.download = `我的課表_${currentSemester || 'export'}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
        
        btn.innerHTML = originalText;
        showAlert("課表圖片已下載至您的裝置！", "匯出成功");
    }).catch(err => {
        console.error(err);
        btn.innerHTML = originalText;
        showAlert("圖片製作失敗，請稍後再試", "錯誤");
    });
}

// 修改目前設定的學校與科系資訊
function editSchoolInfo() {
    if (!isGeneralSettingsEditMode) {
        showAlert("目前為「🔒 唯讀模式」\n若要修改，請先切換至編輯狀態。");
        return;
    }
    showPrompt("請輸入學校名稱 (例如: 台大)", userSchoolInfo.school || "", "🏫 設定學校")
    .then(school => {
        if (school !== null) {
            showPrompt("請輸入科系名稱 (例如: 資工系)", userSchoolInfo.department || "", "🏫 設定科系")
            .then(dept => {
                if (dept !== null) {
                    userSchoolInfo.school = school.trim();
                    userSchoolInfo.department = dept.trim();
                    saveData();
                    refreshUI();
                    showAlert("學校與科系已更新！", "設定成功");
                }
            });
        }
    });
}

// 廣告落地頁點擊登入按鈕時，讓畫面平滑滾動到特色說明區塊
function scrollToFeatures() {
    const section = document.getElementById('features');
    if (section) {
        section.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
        });
    }
}

// 開啟系統登入介面的半透明視窗
function openLoginModal() {
    const modal = document.getElementById('login-overlay');
    if (modal) {
        modal.style.display = 'flex';
        modal.style.opacity = '0';
        setTimeout(() => {
            modal.style.transition = 'opacity 0.3s';
            modal.style.opacity = '1';
        }, 10);
    }
}

// 關閉系統登入介面的視窗
function closeLoginModal() {
    const modal = document.getElementById('login-overlay');
    if (modal) {
        modal.style.display = 'none';
    }
}



/* ========================================================================== */
/* 📌 閒置安全防護機制 (Idle Security & Edit Modes Timeout)                     */
/* ========================================================================== */

// 記錄防護機制的 1 分鐘倒數計時器
let editModeTimer = null;

// 記錄一般設定頁面的編輯狀態布林值
let isGeneralSettingsEditMode = false;

// 檢查目前全系統是否有任何一個模組正處於「編輯模式」
function isAnyEditModeActive() {
    return (typeof isWeeklyEditMode !== 'undefined' && isWeeklyEditMode) ||
           (typeof isCalendarEditMode !== 'undefined' && isCalendarEditMode) ||
           (typeof isGradeCalcEditMode !== 'undefined' && isGradeCalcEditMode) ||
           (typeof isAccAccountsEditMode !== 'undefined' && isAccAccountsEditMode) ||
           (typeof isAccDetailsEditMode !== 'undefined' && isAccDetailsEditMode) ||
           (document.getElementById('credits-edit-mode') && document.getElementById('credits-edit-mode').style.display === 'block') ||
           (typeof isEditingSemester !== 'undefined' && isEditingSemester) ||
           (typeof isGeneralSettingsEditMode !== 'undefined' && isGeneralSettingsEditMode) ||
           (typeof isAccountSettingsEditMode !== 'undefined' && isAccountSettingsEditMode) ||
           (typeof isBackupEditMode !== 'undefined' && isBackupEditMode);
}

// 觸發關閉所有模組的編輯模式，強制切換回唯讀狀態
function exitAllEditModes() {
    if (typeof isWeeklyEditMode !== 'undefined' && isWeeklyEditMode) toggleWeeklyEditMode();
    if (typeof isCalendarEditMode !== 'undefined' && isCalendarEditMode) toggleCalendarEditMode();
    if (typeof isGradeCalcEditMode !== 'undefined' && isGradeCalcEditMode) toggleGradeCalcEditMode();
    if (typeof isAccAccountsEditMode !== 'undefined' && isAccAccountsEditMode) toggleAccAccountsEditMode();
    if (typeof isAccDetailsEditMode !== 'undefined' && isAccDetailsEditMode) toggleAccDetailsEditMode();
    
    const creditEditDiv = document.getElementById('credits-edit-mode');
    if (creditEditDiv && creditEditDiv.style.display === 'block') toggleCreditEdit();
    
    if (typeof isEditingSemester !== 'undefined' && isEditingSemester) toggleSemesterEdit();
    if (typeof isGeneralSettingsEditMode !== 'undefined' && isGeneralSettingsEditMode) toggleGeneralSettingsEditMode();
    if (typeof isAccountSettingsEditMode !== 'undefined' && isAccountSettingsEditMode) toggleAccountSettingsEditMode();
    if (typeof isBackupEditMode !== 'undefined' && isBackupEditMode) toggleBackupEditMode();
}

// 每次使用者互動時重置 1 分鐘防閒置倒數計時
function resetEditTimer() {
    if (editModeTimer) clearTimeout(editModeTimer);
    
    if (isAnyEditModeActive()) {
        editModeTimer = setTimeout(() => {
            exitAllEditModes();
            if (window.showAlert) {
                showAlert("已超過一分鐘無動作，為保護資料安全，已自動切換回「🔒 唯讀模式」。", "⏱️ 編輯逾時");
            }
        }, 60000); 
    }
}

// 監聽使用者的點擊、滑動或輸入，重置逾時保護計時器
['click', 'touchstart', 'mousemove', 'keypress', 'input'].forEach(evt => {
    document.addEventListener(evt, resetEditTimer, { passive: true });
});

// 當使用者切換分頁或縮小視窗時，自動關閉所有編輯模式
document.addEventListener('visibilitychange', () => {
    if (document.hidden && isAnyEditModeActive()) {
        exitAllEditModes(); 
    }
});

// 切換一般設定區塊的「編輯/唯讀」模式
window.toggleGeneralSettingsEditMode = function() {
    const btn = document.getElementById('btn-toggle-general-edit');
    if (isGeneralSettingsEditMode) {
        isGeneralSettingsEditMode = false;
        if (btn) {
            btn.innerHTML = "🔒 唯讀模式";
            btn.style.color = "#888";
            btn.style.borderColor = "#ddd";
            btn.style.background = "transparent";
        }
    } else {
        showConfirm("確定要開啟編輯模式嗎？\n\n開啟後您可以修改顯示名稱與科系資訊等設定。", "✏️ 進入編輯模式").then(ok => {
            if (ok) {
                isGeneralSettingsEditMode = true;
                if (btn) {
                    btn.innerHTML = "✏️ 編輯模式";
                    btn.style.color = "var(--primary)";
                    btn.style.borderColor = "var(--primary)";
                    btn.style.background = "#e6f0ff";
                }
            }
        });
    }
}



/* ========================================================================== */
/* 📌 漸進式探索與模組化自訂 (Progressive Disclosure & Modular UI)              */
/* ========================================================================== */

// 動態渲染首頁：只產生有被打勾啟用的 App (已移除舊版工具箱邏輯)
window.renderHomeApps = function() {
    const mainGrid = document.getElementById('main-app-grid');
    if (!mainGrid) return;

    mainGrid.innerHTML = '';

    allAvailableApps.forEach(app => {
        if (userPreferences.activeApps.includes(app.id)) {
            mainGrid.innerHTML += `
                <div class="app-item" onclick="switchTab('${app.id}')">
                    <div class="app-icon" style="background: ${app.color};">${app.icon}</div>
                    <div class="app-label">${app.label}</div>
                </div>
            `;
        }
    });
}

// 開啟初次登入的導覽視窗，並動態產生所有 App 的勾選清單
window.openOnboardingModal = function() {
    document.getElementById('onboarding-modal').style.display = 'flex';
    const listContainer = document.getElementById('onboarding-app-list');
    if (!listContainer) return;
    listContainer.innerHTML = '';
    
    allAvailableApps.forEach(app => {
        listContainer.innerHTML += `
            <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 10px 8px; background: #f9f9f9; border-radius: 8px; border: 1px solid #eee;">
                <input type="checkbox" value="${app.id}" class="onboarding-app-checkbox" checked style="width: 18px; height: 18px; accent-color: var(--primary);">
                <span style="font-size: 1.2rem;">${app.icon}</span>
                <span style="font-size: 0.9rem; color: #333; font-weight: 500;">${app.label}</span>
            </label>
        `;
    });
}

// 完成導覽並配置專屬首頁
window.completeOnboarding = function() {
    const checkboxes = document.querySelectorAll('.onboarding-app-checkbox');
    const selectedApps = [];
    checkboxes.forEach(cb => { if (cb.checked) selectedApps.push(cb.value); });

    if (selectedApps.length === 0) {
        if (window.showAlert) showAlert("請至少選擇一個功能喔！");
        return;
    }

    userPreferences.onboarded = true;
    userPreferences.primaryGoal = 'custom';
    userPreferences.activeApps = selectedApps;

    saveData();
    document.getElementById('onboarding-modal').style.display = 'none';
    renderHomeApps();
    
    if (window.showAlert) showAlert("🎉 首頁配置完成！\n日後隨時可以到「⚙️ 個人設定」中重新調整。");
}



/* ========================================================================== */
/* 🧰 工具箱與版面管理 (Toolbox & Layout Manager)                               */
/* ========================================================================== */

// 開啟設定中的工具箱管理視窗
window.openAppManager = function() {
    // 檢查一般設定是否為編輯模式
    if (typeof isGeneralSettingsEditMode !== 'undefined' && !isGeneralSettingsEditMode) {
        if (window.showAlert) showAlert("目前為「🔒 唯讀模式」\n若要修改首頁版面，請先點擊上方切換至編輯狀態。");
        return;
    }

    document.getElementById('app-manager-modal').style.display = 'flex';
    const listContainer = document.getElementById('app-manager-list');
    if (!listContainer) return;
    
    listContainer.innerHTML = '';
    
    allAvailableApps.forEach(app => {
        const isChecked = userPreferences.activeApps.includes(app.id) ? 'checked' : '';
        // 渲染清單：包含 Checkbox(控制首頁顯示) 以及 🚀 按鈕(直接開啟)
        listContainer.innerHTML += `
            <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; background: #fdfdfd; border-radius: 8px; border: 1px solid #eee;">
                <label style="display: flex; align-items: center; gap: 10px; cursor: pointer; flex: 1;">
                    <input type="checkbox" value="${app.id}" class="manager-app-checkbox" ${isChecked} style="width: 18px; height: 18px; accent-color: var(--primary);">
                    <span style="font-size: 1.2rem;">${app.icon}</span>
                    <span style="font-size: 0.95rem; color: #333; font-weight: 500;">${app.label}</span>
                </label>
                <button onclick="switchTab('${app.id}'); closeAppManager();" style="background: transparent; border: none; font-size: 1.2rem; cursor: pointer; padding: 0 5px;" title="直接開啟">🚀</button>
            </div>
        `;
    });
}

// 關閉工具箱管理視窗
window.closeAppManager = function() {
    document.getElementById('app-manager-modal').style.display = 'none';
}

// 儲存新的首頁 App 配置
window.saveAppManager = function() {
    const checkboxes = document.querySelectorAll('.manager-app-checkbox');
    const selectedApps = [];
    
    checkboxes.forEach(cb => {
        if (cb.checked) selectedApps.push(cb.value);
    });

    if (selectedApps.length === 0) {
        if (window.showAlert) showAlert("請至少保留一個功能在首頁喔！");
        return;
    }

    userPreferences.activeApps = selectedApps;
    saveData();
    renderHomeApps();
    closeAppManager();
    if (window.showAlert) showAlert("首頁模組已更新！", "儲存成功");
}



/* ========================================================================== */
/* 📌 通知中心邏輯 (Notification Center)                                        */
/* ========================================================================== */

// 新增一則通知 (加入 id 防重複機制)
window.addNotification = function(title, message, id = null) {
    if (id) {
        const exists = systemNotifications.some(n => n.id === id);
        if (exists) return; 
    }

    const now = new Date();
    const timeStr = `${now.getMonth()+1}/${now.getDate()} ${now.getHours()}:${(now.getMinutes()<10?'0':'')+now.getMinutes()}`;

    systemNotifications.unshift({
        id: id || new Date().getTime().toString(), 
        title: title,
        message: message,
        time: timeStr,
        read: false 
    });

    saveData(); 
    renderNotifications();

    if ("Notification" in window && Notification.permission === "granted" && userPreferences.pushEnabled) {
        if (navigator.serviceWorker && navigator.serviceWorker.controller) {
            navigator.serviceWorker.ready.then(function(registration) {
                registration.showNotification(title, {
                    body: message,
                    icon: "icon.png",
                    tag: id,
                    vibrate: [200, 100, 200]
                });
            });
        } else {
            new Notification(title, { body: message, tag: id });
        }
    }
}

// 渲染通知列表與導覽列的小紅點
window.renderNotifications = function() {
    const listDiv = document.getElementById('notifications-list');
    const badge = document.getElementById('notification-badge');
    if (!listDiv) return;

    // 計算未讀數量
    const unreadCount = systemNotifications.filter(n => !n.read).length;

    // 更新導覽列的小紅點顯示狀態
    if (badge) {
        badge.style.display = unreadCount > 0 ? 'block' : 'none';
    }

    if (systemNotifications.length === 0) {
        listDiv.innerHTML = '<p style="color:#999; text-align:center; padding: 20px;">目前沒有新通知 🎉</p>';
        return;
    }

    let html = '';
    systemNotifications.forEach((note) => {
        // 🎨 將未讀背景改為實體的「淺藍色」
        const bg = note.read ? 'transparent' : '#e3f2fd'; 
        
        // 左側的強調線條 (如果覺得加上淺藍色後不需要線條，這行可以刪除，或保留增加層次感)
        const leftBorder = note.read ? '1px solid #eee' : '4px solid #1565c0'; 

        // 標題旁的小紅點
        const dot = note.read ? '' : '<span style="display:inline-block; width:8px; height:8px; background:#e74c3c; border-radius:50%; margin-right:8px;"></span>';
        
        // 點擊事件與游標樣式
        const clickEvent = note.read ? '' : `onclick="markSingleNotificationAsRead('${note.id}')" style="cursor: pointer;"`;

        html += `
        <div ${clickEvent} style="background: ${bg}; border-bottom: 1px solid #eee; border-left: ${leftBorder}; padding: 15px; border-radius: 4px; margin-bottom: 10px; transition: background-color 0.3s, border-left 0.3s;">
            <div style="display:flex; justify-content:space-between; margin-bottom: 5px;">
                <span style="font-weight: bold; font-size: 1rem; color: var(--text-main); display:flex; align-items:center;">${dot}${note.title}</span>
                <span style="font-size: 0.8rem; color: #888;">${note.time}</span>
            </div>
            <div style="font-size: 0.9rem; color: var(--text-main); opacity: 0.8; line-height: 1.4;">${note.message}</div>
        </div>`;
    });
    
    listDiv.innerHTML = html;
}

// 標記單一通知為已讀
window.markSingleNotificationAsRead = function(id) {
    // 找到對應 id 的通知
    const note = systemNotifications.find(n => n.id === id);
    if (note && !note.read) {
        note.read = true; // 改為已讀
        saveData();       // 存檔 (同步到雲端與 localStorage)
        renderNotifications(); // 重新渲染畫面 (卡片背景變透明、消除卡片上的小紅點)
    }
}

// 清除全部通知
window.clearAllNotifications = function() {
    systemNotifications = [];
    saveData();
    renderNotifications();
}

// 標記所有通知為已讀
window.markNotificationsAsRead = function() {
    let changed = false;
    systemNotifications.forEach(n => {
        if (!n.read) {
            n.read = true;
            changed = true;
        }
    });
    if (changed) {
        saveData();
        renderNotifications();
    }
}

// 切換系統通知 (開啟 / 關閉)
window.toggleSystemNotification = function() {
    if (!("Notification" in window)) {
        showAlert("您目前的瀏覽器不支援系統通知喔！");
        return;
    }

    // 1. 如果目前是「開啟」狀態，改為先跳出「詢問確認」視窗
    if (userPreferences.pushEnabled) {
        showConfirm("確定要關閉系統通知嗎？\n\n關閉後，重要提醒將只會在 App 內顯示，不會從系統（手機或電腦）彈出。", "🔕 關閉通知").then(ok => {
            if (ok) {
                userPreferences.pushEnabled = false;
                saveData(); // 存檔
                updateNotificationBtnUI();
                showAlert("🔕 已暫停系統通知。\n若要再次接收，請點擊按鈕開啟。");
            }
        });
        return;
    }

    // 2. 如果目前是「關閉」狀態，且瀏覽器已經授權過，就直接開啟
    if (Notification.permission === "granted") {
        userPreferences.pushEnabled = true;
        saveData();
        updateNotificationBtnUI();
        showAlert("✅ 系統通知已重新開啟！");
        return;
    }

    // 3. 如果連瀏覽器都還沒授權過，就向使用者要求權限
    if (Notification.permission !== "denied") {
        Notification.requestPermission().then(permission => {
            if (permission === "granted") {
                userPreferences.pushEnabled = true;
                saveData();
                updateNotificationBtnUI();
                showAlert("✅ 成功開啟系統通知！");
                
                // 發送一則測試推播
                if (navigator.serviceWorker && navigator.serviceWorker.controller) {
                    navigator.serviceWorker.ready.then(function(registration) {
                        registration.showNotification("設定成功 🎉", {
                            body: "CampusKing 的重要提醒未來會顯示在這裡！",
                            icon: "icon.png",
                            vibrate: [200, 100, 200]
                        });
                    });
                } else {
                    new Notification("設定成功 🎉", { body: "CampusKing 的重要提醒未來會顯示在這裡！" });
                }
            } else {
                showAlert("❌ 通知權限已被拒絕。若要開啟，請至瀏覽器設定中更改。");
            }
        });
    } else {
        showAlert("❌ 通知權限已被瀏覽器封鎖。\n請至瀏覽器的網站設定中，手動允許「通知」權限。");
    }
}

// 更新按鈕的外觀 (依照目前的開啟/關閉狀態)
window.updateNotificationBtnUI = function() {
    const btn = document.getElementById('btn-toggle-push');
    if (!btn) return;
    
    if (userPreferences.pushEnabled) {
        // 開啟時：按鈕變紅色，提示可以「關閉」
        btn.innerText = "關閉系統通知";
        btn.style.background = "#ffebee";
        btn.style.color = "#e74c3c";
        btn.style.borderColor = "#e74c3c";
    } else {
        // 關閉時：按鈕變藍色，提示可以「開啟」
        btn.innerText = "開啟系統通知";
        btn.style.background = "#e3f2fd";
        btn.style.color = "#1565c0";
        btn.style.borderColor = "#1565c0";
    }
}