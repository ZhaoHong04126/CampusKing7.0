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

// 修改左上角顯示的稱號或名稱
function editUserTitle() {
    if (!isGeneralSettingsEditMode) { 
        showAlert("目前為「🔒 唯讀模式」\n若要修改，請先切換至編輯狀態。");
        return;
    }
    showPrompt("請輸入要在 APP 中顯示的名稱或稱號", userTitle, "設定顯示名稱")
    .then(newName => {
        if (newName && newName.trim() !== "") {
            userTitle = newName.trim();
            saveData();
            refreshUI();
            showAlert("名稱已更新！");
        }
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

// 動態渲染首頁：將主要 App 放在上方，次要收納至工具箱
window.renderHomeApps = function() {
    const mainGrid = document.getElementById('main-app-grid');
    const toolboxGrid = document.getElementById('toolbox-app-grid');
    if (!mainGrid || !toolboxGrid) return;

    mainGrid.innerHTML = '';
    toolboxGrid.innerHTML = '';

    let hasToolboxApps = false;

    allAvailableApps.forEach(app => {
        const appHtml = `
            <div class="app-item" onclick="switchTab('${app.id}')">
                <div class="app-icon" style="background: ${app.color};">${app.icon}</div>
                <div class="app-label">${app.label}</div>
            </div>
        `;

        if (userPreferences.activeApps.includes(app.id)) {
            mainGrid.innerHTML += appHtml;
        } else {
            toolboxGrid.innerHTML += appHtml;
            hasToolboxApps = true;
        }
    });

    document.getElementById('toolbox-container').style.display = hasToolboxApps ? 'block' : 'none';
}

// 開啟初次登入的導覽視窗
window.openOnboardingModal = function() {
    document.getElementById('onboarding-modal').style.display = 'flex';
}

// 完成導覽並配置專屬首頁
window.completeOnboarding = function(goal) {
    userPreferences.onboarded = true;
    userPreferences.primaryGoal = goal;

    // 根據使用者的目標情境，配置最相關的首頁模組
    if (goal === 'grades') {
        userPreferences.activeApps = ['schedule', 'grade-manager', 'homework', 'learning', 'grade-calc'];
    } else if (goal === 'finance') {
        userPreferences.activeApps = ['accounting', 'schedule', 'lottery', 'notes', 'settings'];
    } else if (goal === 'life') {
        userPreferences.activeApps = ['calendar', 'schedule', 'anniversary', 'lottery', 'notes', 'settings'];
    } else {
        userPreferences.activeApps = allAvailableApps.map(a => a.id);
    }

    saveData();
    document.getElementById('onboarding-modal').style.display = 'none';
    renderHomeApps();
    
    showAlert("🎉 設定完成！\n我們已為你配置了專屬首頁。\n不常用的功能已幫你收納在下方的「🧰 更多工具箱」中，隨時都能探索！");
}

// 收合/展開次級工具箱
window.toggleToolbox = function() {
    const grid = document.getElementById('toolbox-app-grid');
    const icon = document.getElementById('toolbox-toggle-icon');
    if (grid.style.display === 'none') {
        grid.style.display = 'grid';
        icon.innerText = '▲';
    } else {
        grid.style.display = 'none';
        icon.innerText = '▼';
    }
}