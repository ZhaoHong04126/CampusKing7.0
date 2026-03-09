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

// 監聽瀏覽器上一頁/下一頁事件 (保留此功能以支援手機實體返回鍵)
window.addEventListener('popstate', (event) => {
    const targetView = event.state ? event.state.view : 'schedule';
    switchTab(targetView, false);
});

// 核心頁面切換函式，隱藏其他頁面並更新 URL History 與頁面標題
function switchTab(tabName, addToHistory = true) {
    if (typeof exitAllEditModes === 'function') exitAllEditModes();
    
    const views = [
        'schedule', 'calendar', 
        'settings', 'chart', 'credits',
        'regular', 'midterm', 'grades',
        'exams-hub', 'grade-manager', 'accounting',
        'anniversary', 'lottery', 'homework',
        'grade-calc','notifications', 'admin'
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

    const titleEl = document.getElementById('app-title');
    
    if (tabName === 'schedule') {
        if (titleEl) titleEl.innerText = '📅 校園王';
    } else {
        let pageTitle = "校園王";
        switch(tabName) {
            case 'calendar': pageTitle = "行事曆"; break;
            case 'grade-manager': pageTitle = "成績管理"; break;
            case 'accounting': pageTitle = "學期記帳"; break;
            case 'anniversary': pageTitle = "紀念日"; break;
            case 'settings': pageTitle = "個人設定"; break;
            case 'lottery': pageTitle = "幸運籤筒"; break;
            case 'homework': pageTitle = "作業管理"; break;
            case 'grade-calc': pageTitle = "配分筆記"; break;
            case 'notifications': pageTitle = "通知中心"; break;
            case 'admin': pageTitle = "系統管理台"; break;
        }
        if (titleEl) titleEl.innerText = pageTitle;
    }

    if (addToHistory) {
        if (tabName !== 'schedule') {
            history.pushState({ view: tabName }, null, `#${tabName}`);
        } else {
            history.pushState({ view: 'schedule' }, null, './');
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
    if (tabName === 'lottery' && typeof renderLottery === 'function') renderLottery();
    if (tabName === 'homework' && typeof renderHomework === 'function') renderHomework();
    if (tabName === 'grade-calc' && typeof renderGradeCalc === 'function') renderGradeCalc();
    if (tabName === 'admin') {
        if (typeof renderAdminNewsDisplay === 'function') renderAdminNewsDisplay();
        if (typeof renderAdminBroadcastDisplay === 'function') renderAdminBroadcastDisplay();
    }
    
    // 切換頁面後，若是手機版則自動收起側邊欄
    const sidebar = document.getElementById('sidebar');
    if (sidebar && sidebar.classList.contains('show')) {
        if (typeof toggleMobileMenu === 'function') toggleMobileMenu();
    }
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
    if (typeof checkSystemBroadcasts === 'function') checkSystemBroadcasts();
    if (typeof updateNotificationBtnUI === 'function') updateNotificationBtnUI();
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
        showConfirm("確定要開啟編輯模式嗎？\n\n開啟後您可以修改學校與科系資訊。", "✏️ 進入編輯模式").then(ok => {
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
/* 📌 通知中心邏輯 (Notification Center)                                        */
/* ========================================================================== */

// 新增一則通知 (加入 id 防重複機制與 type 顏色分類)
window.addNotification = function(title, message, id = null, type = 'info') {
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
        type: type,
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
        let typeColor = '#1565c0';
        let typeBg = '#e3f2fd';
        if (note.type === 'success') { typeColor = '#2ecc71'; typeBg = '#e8f5e9'; }
        else if (note.type === 'warning') { typeColor = '#f39c12'; typeBg = '#fff8e1'; }
        else if (note.type === 'danger') { typeColor = '#e74c3c'; typeBg = '#ffebee'; }

        const bg = note.read ? 'transparent' : typeBg; 
        const leftBorder = note.read ? '1px solid #eee' : `4px solid ${typeColor}`; 
        const dot = note.read ? '' : `<span style="display:inline-block; width:8px; height:8px; background:${typeColor}; border-radius:50%; margin-right:8px;"></span>`;
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



/* ========================================================================== */
/* 📌 手機版側邊欄抽屜控制 (Mobile Sidebar Toggle)                            */
/* ========================================================================== */
window.toggleMobileMenu = function() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    
    if (sidebar.classList.contains('show')) {
        sidebar.classList.remove('show');
        overlay.classList.remove('show');
    } else {
        sidebar.classList.add('show');
        overlay.classList.add('show');
    }
}



/* ========================================================================== */
/* 📌 首頁動態管理員 (Landing Page News CMS)                                  */
/* ========================================================================== */

let publicNewsList = [];

window.openNewsManagerModal = function() {
    showPrompt("請輸入管理員密碼：", "", "🔒 權限驗證").then(password => {
        if (password === null) return; 
        
        if (password !== "zhao20261150304") { 
            showAlert("密碼錯誤，您沒有權限存取！", "❌ 拒絕存取");
            return;
        }

        document.getElementById('news-manager-modal').style.display = 'flex';
        document.getElementById('news-manager-list').innerHTML = '<p style="text-align:center; color:#999;">載入中...</p>';
        
        db.collection("public").doc("landing_news").get().then(doc => {
            if (doc.exists && doc.data().items) {
                publicNewsList = doc.data().items;
            } else {
                publicNewsList = [];
            }
            renderNewsManagerList();
        });
    });
}

window.closeNewsManagerModal = function() {
    document.getElementById('news-manager-modal').style.display = 'none';
}

function renderNewsManagerList() {
    const listDiv = document.getElementById('news-manager-list');
    if (publicNewsList.length === 0) {
        listDiv.innerHTML = '<p style="color:#999; text-align:center;">目前無動態，趕快新增一則吧！</p>';
        return;
    }
    let html = '';
    publicNewsList.forEach((item, index) => {
        let timeString = '';
        if (item.time) {
            const d = new Date(item.time);
            timeString = `${d.getMonth()+1}/${d.getDate()} ${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`;
        }

        html += `
        <div style="display:flex; justify-content:space-between; align-items:center; padding: 10px 0; border-bottom: 1px solid #eee;">
            <div style="flex: 1; padding-right: 10px;">
                <div style="display: flex; align-items: center; margin-bottom: 4px;">
                    <span style="background: ${item.bgColor}; color: ${item.color}; padding: 2px 6px; border-radius: 4px; font-size: 0.75rem; margin-right: 8px; font-weight: bold;">${item.tag}</span>
                    <span style="font-size: 0.75rem; color: #aaa;">${timeString}</span>
                </div>
                <div style="font-size: 0.9rem; color: var(--text-main);">${item.content}</div>
            </div>
            <button onclick="deletePublicNews(${index})" style="background:transparent; border:none; color:#e74c3c; cursor:pointer; font-size: 1.1rem; padding: 5px;">🗑️</button>
        </div>`;
    });
    listDiv.innerHTML = html;
}

window.addPublicNews = function() {
    const tag = document.getElementById('input-news-tag').value.trim();
    const colorType = document.getElementById('input-news-color').value;
    const content = document.getElementById('input-news-content').value.trim();

    if (!tag || !content) {
        showAlert("請輸入標籤名稱與內容！");
        return;
    }

    let bgColor, color;
    if (colorType === 'update') { bgColor = 'rgba(241, 196, 15, 0.3)'; color = '#f39c12'; }
    else if (colorType === 'feature') { bgColor = 'rgba(46, 204, 113, 0.3)'; color = '#27ae60'; }
    else if (colorType === 'security') { bgColor = 'rgba(231, 76, 60, 0.3)'; color = '#e74c3c'; }
    else { bgColor = 'rgba(52, 152, 219, 0.3)'; color = '#2980b9'; }

    // 加入 ISO 格式的時間紀錄
publicNewsList.unshift({ tag, bgColor, color, content, time: new Date().toISOString() });

    db.collection("public").doc("landing_news").set({
        items: publicNewsList,
        lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
    }).then(() => {
        document.getElementById('input-news-tag').value = '';
        document.getElementById('input-news-content').value = '';
        renderNewsManagerList();
        if (typeof renderAdminNewsDisplay === 'function') renderAdminNewsDisplay();
        showAlert("✨ 動態已成功發佈！登出回首頁即可看到。");
    }).catch((error) => {
        console.error("發佈動態失敗：", error);
        showAlert("❌ 發佈失敗！這通常是 Firebase 資料庫權限不足的問題。\n請檢查 Firestore Security Rules。\n\n錯誤細節: " + error.message, "系統錯誤");
    });

}

window.deletePublicNews = function(index) {
    showConfirm("確定要刪除這則首頁動態嗎？").then(ok => {
        if(ok) {
            publicNewsList.splice(index, 1);
            db.collection("public").doc("landing_news").set({
                items: publicNewsList,
                lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
            }).then(() => {
                renderNewsManagerList();
            });
        }
    });
}

/* ---- 📌 全域推播廣播系統 (System Broadcast)---- */

// 【管理員專用】開啟廣播視窗
window.openBroadcastModal = function() {
    showPrompt("請輸入管理員密碼：", "", "🔒 權限驗證").then(password => {
        if (password === null) return; 
        if (password !== "zhao20261150304") { 
            showAlert("密碼錯誤，您沒有權限存取！", "❌ 拒絕存取");
            return;
        }
        document.getElementById('broadcast-manager-modal').style.display = 'flex';
        document.getElementById('input-broadcast-title').value = '';
        document.getElementById('input-broadcast-content').value = '';
    });
}

// 【管理員專用】關閉廣播視窗
window.closeBroadcastModal = function() {
    document.getElementById('broadcast-manager-modal').style.display = 'none';
}

// 【管理員專用】發送廣播至 Firebase
window.sendBroadcast = function() {
    const type = document.getElementById('input-broadcast-color').value;
    const title = document.getElementById('input-broadcast-title').value.trim();
    const content = document.getElementById('input-broadcast-content').value.trim();

    if (!title || !content) {
        showAlert("請輸入標題與內容！");
        return;
    }

    showConfirm(`確定要發送這則推播給「所有使用者」嗎？\n\n標題：${title}`, "📡 發送確認").then(ok => {
        if (ok) {
            const broadcastId = "broadcast_" + new Date().getTime();

            db.collection("public").doc("broadcasts").get().then(doc => {
                let items = [];
                if (doc.exists && doc.data().items) {
                    items = doc.data().items;
                }
                
                items.unshift({ id: broadcastId, title: title, message: content,type: type, time: new Date().toISOString() });
                if (items.length > 20) items = items.slice(0, 20);

                db.collection("public").doc("broadcasts").set({
                    items: items,
                    lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
                }).then(() => {
                    closeBroadcastModal();
                    if (typeof renderAdminBroadcastDisplay === 'function') renderAdminBroadcastDisplay();
                    showAlert("🚀 廣播已成功寫入資料庫！\n使用者下次登入或重整時將會收到通知。");
                }).catch(error => {
                    console.error("廣播發送失敗：", error);
                    showAlert("❌ 發送失敗，請檢查權限：" + error.message, "系統錯誤");
                });
            });
        }
    });
}

// 【全體使用者】讀取雲端的廣播紀錄並推入通知中心
window.checkSystemBroadcasts = function() {
    db.collection("public").doc("broadcasts").get().then(doc => {
        if (doc.exists && doc.data().items) {
            const broadcasts = doc.data().items;
            for (let i = broadcasts.length - 1; i >= 0; i--) {
                const b = broadcasts[i];
                addNotification("📢 " + b.title, b.message, b.id, b.type || 'info');
            }
        }
    }).catch(e => console.log("讀取系統廣播失敗 (可忽略):", e));
}

/* ---- 📌 管理台：渲染 首頁動態 與 系統推播 展示區 ---- */

window.renderAdminNewsDisplay = function() {
    const displayDiv = document.getElementById('admin-display-news');
    if (!displayDiv) return;

    db.collection("public").doc("landing_news").get().then(doc => {
        if (doc.exists && doc.data().items && doc.data().items.length > 0) {
            const newsItems = doc.data().items;
            let html = '';
            newsItems.forEach((item) => {
                let timeHtml = '';
                if (item.time) {
                    const timeString = new Date(item.time).toLocaleString('zh-TW', { 
                        month:'numeric', day:'numeric', hour:'2-digit', minute:'2-digit' 
                    });
                    timeHtml = `<span style="font-size: 0.75rem; color: #999; margin-left: auto;">${timeString}</span>`;
                }

                html += `
                <div style="padding: 12px 10px; border-bottom: 1px solid #eaeaea; display: flex; flex-direction: column; gap: 5px;">
                    <div style="display: flex; align-items: center;">
                        <span style="background: ${item.bgColor}; color: ${item.color}; padding: 2px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: bold;">${item.tag}</span>
                        ${timeHtml}
                    </div>
                    <div style="font-size: 0.9rem; color: var(--text-main); line-height: 1.4; margin-top: 4px;">${item.content}</div>
                </div>`;
            });
            displayDiv.innerHTML = html;
        } else {
            displayDiv.innerHTML = '<p style="color:#999; text-align:center; padding:20px;">目前無動態資料</p>';
        }
    }).catch(e => {
        displayDiv.innerHTML = '<p style="color:#e74c3c; text-align:center;">讀取失敗，請檢查網路狀態。</p>';
    });
}

window.renderAdminBroadcastDisplay = function() {
    const displayDiv = document.getElementById('admin-display-broadcasts');
    if (!displayDiv) return;

    db.collection("public").doc("broadcasts").get().then(doc => {
        if (doc.exists && doc.data().items && doc.data().items.length > 0) {
            const broadcasts = doc.data().items;
            let html = '';
            broadcasts.forEach((b) => {
                let borderColor = '#1565c0'; // 預設藍色
                if (b.type === 'success') borderColor = '#2ecc71';
                else if (b.type === 'warning') borderColor = '#f39c12';
                else if (b.type === 'danger') borderColor = '#e74c3c';

                const timeString = new Date(b.time).toLocaleString('zh-TW', { month:'numeric', day:'numeric', hour:'2-digit', minute:'2-digit' });

                html += `
                <div style="padding: 10px 12px; margin-bottom: 10px; background: white; border-radius: 8px; border-left: 4px solid ${borderColor}; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
                    <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom: 4px;">
                        <div style="font-weight: bold; font-size: 0.95rem; color: var(--text-main);">${b.title}</div>
                        <div style="font-size: 0.75rem; color: #999; white-space: nowrap; margin-left: 10px;">${timeString}</div>
                    </div>
                    <div style="font-size: 0.85rem; color: #666; line-height: 1.4;">${b.message}</div>
                </div>`;
            });
            displayDiv.innerHTML = html;
        } else {
            displayDiv.innerHTML = '<p style="color:#999; text-align:center; padding:20px;">目前無推播紀錄</p>';
        }
    }).catch(e => {
        displayDiv.innerHTML = '<p style="color:#e74c3c; text-align:center;">讀取失敗，請檢查網路狀態。</p>';
    });
}