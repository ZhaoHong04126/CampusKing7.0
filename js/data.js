/* ========================================================================== */
/* 📌 資料讀寫與初始化 (Data Initialization & Storage)                            */
/* ========================================================================== */

// 應用程式啟動時載入資料的主函式
function loadData() {
    if (!currentUser) return;
    const uid = currentUser.uid;
    const dbKey = 'CampusKing_v6.0_' + uid;
    const savedData = localStorage.getItem(dbKey);

    if (savedData) {
        parseAndApplyData(JSON.parse(savedData));
    } else {
        initDefaultData();
    }
    if (navigator.onLine) {
        syncFromCloud(uid);
    }
    refreshUI();
}

// 解析從本地或雲端取得的資料物件，並指派給全域變數
function parseAndApplyData(parsed) {
    allData = parsed.allData || {};
    semesterList = parsed.semesterList || ["114-2"];
    userTitle = parsed.userTitle || (currentUser && currentUser.displayName ? currentUser.displayName : "同學");
    currentSemester = parsed.currentSemester || semesterList[0];
    graduationTarget = parsed.graduationTarget || 128;
    periodTimesConfig = parsed.periodTimesConfig || {};

    if (parsed.paymentMethods) {
        paymentMethods = parsed.paymentMethods;
    }
    if (parsed.accCategories) {
        accCategories = parsed.accCategories;
    }
    if (parsed.periodConfig) {
        periodConfig = parsed.periodConfig;
    }
    if (parsed.userSchoolInfo) {
        userSchoolInfo = parsed.userSchoolInfo;
    }
    if (parsed.customPeriods) {
        customPeriods = parsed.customPeriods;
    } else {
        customPeriods = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D'];
    }

    if (parsed.userPreferences) {
        userPreferences = parsed.userPreferences;
    } else {
        // 相容舊用戶：預設為已完成導覽並顯示全部
        userPreferences = {
            onboarded: true,
            primaryGoal: 'all',
            activeApps: allAvailableApps.map(a => a.id)
        };
    }
    
    if (parsed.categoryTargets && Object.keys(parsed.categoryTargets).length > 0) {
        categoryTargets = parsed.categoryTargets;
        if (categoryTargets["自由選修"] === undefined) {
            categoryTargets["自由選修"] = 20;
        }
    } else {
        categoryTargets = { "自由選修": 20 };
    }

    if (allData) {
        Object.keys(allData).forEach(sem => {
            if (allData[sem].grades) {
                allData[sem].grades.forEach(g => {
                    if (g.category === "自由") {
                        g.category = "自由選修";
                    }
                });
            }
        });
    }

    loadSemesterData(currentSemester);
}

// 若完全無資料時，初始化預設的學期與結構
function initDefaultData() {
    semesterList = ["114-1"];
    currentSemester = "114-2";
    allData = {
        "114-2": {
            schedule: JSON.parse(JSON.stringify(defaultSchedule)),
            grades: [],
            regularExams: {},
            midtermExams: {},
            calendarEvents: []
        }
    };
    loadSemesterData(currentSemester);
}

// 根據指定的學期代號，將該學期資料載入到當下操作的全域變數中
function loadSemesterData(sem) {
    if (!allData[sem]) allData[sem] = {
        schedule: JSON.parse(JSON.stringify(defaultSchedule)),
        lottery: JSON.parse(JSON.stringify(defaultLotteryData)),
        grades: [],         
        regularExams: {},   
        midtermExams: {},   
        calendarEvents: [], 
        accounting: [],     
        notes: [],          
        startDate: "",      
        endDate: "",        
        homework: [],       
        gradeCalcNotes: [], 
    };

    weeklySchedule = allData[sem].schedule;             
    gradeList = allData[sem].grades;                    
    regularExams = allData[sem].regularExams || {};     
    midtermExams = allData[sem].midtermExams || {};     
    calendarEvents = allData[sem].calendarEvents || []; 
    accountingList = allData[sem].accounting || [];     
    quickNotes = allData[sem].notes || [];              
    anniversaryList = allData[sem].anniversaries || []; 
    homeworkList = allData[sem].homework || [];         
    gradeCalcNotes = allData[sem].gradeCalcNotes || []; 
    learningList = allData[sem].learning || [];         
    lotteryList = allData[sem].lottery || JSON.parse(JSON.stringify(defaultLotteryData));
    semesterStartDate = allData[sem].startDate || "";
    semesterEndDate = allData[sem].endDate || "";
}

// 將目前的所有全域變數打包，儲存至 LocalStorage 並同步至 Firebase 雲端
function saveData() {
    if (!currentUser) return;
    
    allData[currentSemester] = { 
        schedule: weeklySchedule,                   
        lottery: lotteryList,                       
        grades: gradeList,                          
        regularExams: regularExams,                 
        midtermExams: midtermExams,                 
        calendarEvents: calendarEvents,             
        accounting: accountingList,                 
        notes: quickNotes,                          
        anniversaries: anniversaryList,             
        startDate: semesterStartDate,               
        endDate: semesterEndDate,                   
        learning: learningList,                     
        homework: homeworkList,                     
        gradeCalcNotes: gradeCalcNotes,             
    };

    const storageObj = {
        allData: allData,
        semesterList: semesterList,
        currentSemester: currentSemester,
        graduationTarget: graduationTarget,
        categoryTargets: categoryTargets,
        userSchoolInfo: userSchoolInfo,
        periodConfig: periodConfig,
        periodTimesConfig: periodTimesConfig,
        paymentMethods: paymentMethods,
        accCategories: accCategories,
        userTitle: userTitle,
        customPeriods: customPeriods,
        userPreferences: userPreferences,
        lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
    };

    const dbKey = 'CampusKing_v6.0_' + currentUser.uid;
    const localObj = JSON.parse(JSON.stringify(storageObj)); 
    delete localObj.lastUpdated; 
    localStorage.setItem(dbKey, JSON.stringify(localObj));

    db.collection("users").doc(currentUser.uid).set(storageObj, { merge: true })
    .then(() => {
        console.log("✅ 資料已備份至雲端");
    })
    .catch((error) => {
        console.error("❌ 雲端備份失敗: ", error);
    });

    refreshUI();
}

// 嘗試從 Firebase 雲端下載最新資料並覆蓋本地資料
function syncFromCloud(uid) {
    const statusBtn = document.getElementById('user-badge');
    if(statusBtn) statusBtn.innerText = "同步中...";

    db.collection("users").doc(uid).get().then((doc) => {
        if (doc.exists) {
            const cloudData = doc.data();
            console.log("🔥 雲端資料已下載");
            
            parseAndApplyData(cloudData);
            
            const dbKey = 'CampusKing_v6.0_' + uid;
            localStorage.setItem(dbKey, JSON.stringify(cloudData));

            refreshUI();
            if(statusBtn) statusBtn.innerText = '學生';
        } else {
            console.log("☁️ 此帳號尚無雲端資料，將自動上傳本地資料...");
            saveData();
            if(statusBtn) statusBtn.innerText = '學生';
        }
    }).catch((error) => {
        console.error("同步失敗:", error);
        if(statusBtn) statusBtn.innerText = "離線";
    });
}



/* ========================================================================== */
/* 📌 畫面刷新與狀態更新 (UI Refresh & State Update)                            */
/* ========================================================================== */

// 資料變更後，觸發所有畫面上各模組的重新渲染函式
function refreshUI() {
    renderSemesterOptions(); 

    if (typeof updateExamSubjectOptions === 'function') updateExamSubjectOptions();
    
    switchDay(currentDay);
    loadGrades();

    if (typeof renderExams === 'function') renderExams(); 
    if (typeof renderCalendar === 'function') renderCalendar();         
    if (typeof renderWeeklyTable === 'function') renderWeeklyTable();   
    if (typeof renderAnalysis === 'function') renderAnalysis();         
    
    const targetInput = document.getElementById('setting-grad-target');
    if (targetInput) targetInput.value = graduationTarget;

    if (typeof renderCategorySettingsInputs === 'function') renderCategorySettingsInputs(); 
    if (typeof renderCreditSettings === 'function') renderCreditSettings();                 
    if (typeof renderAccounting === 'function') renderAccounting();                         
    if (typeof renderNotes === 'function') renderNotes();                                   
    if (typeof renderAnniversaries === 'function') renderAnniversaries();                   
    if (typeof renderSemesterSettings === 'function') renderSemesterSettings();             
    if (typeof renderLottery === 'function') renderLottery();                               
    if (typeof renderHomework === 'function') renderHomework();                             
    if (typeof renderGradeCalc === 'function') renderGradeCalc();                           
    if (typeof updateGradeCategoryOptions === 'function') updateGradeCategoryOptions();

    const settingName = document.getElementById('setting-user-title');
    if (settingName) settingName.innerText = userTitle;

    const settingSchool = document.getElementById('setting-school-info');
    if (settingSchool) {
        if (userSchoolInfo.school || userSchoolInfo.department) {
            settingSchool.innerText = `${userSchoolInfo.school} ${userSchoolInfo.department}`;
        } else {
            settingSchool.innerText = '未設定';
        }
    }

    if (typeof renderHomeApps === 'function') renderHomeApps();
}

// 更新單一學分分類目標的數值 (如必修、選修) 並存檔
function updateCategorySettings(category, type, value) {
    const val = parseInt(value) || 0;
    if (typeof categoryTargets[category] === 'object') {
        if (type === '必修') categoryTargets[category]['必修'] = val;
        if (type === '選修') categoryTargets[category]['選修'] = val;
    } else {
        categoryTargets[category] = val;
    }
    saveData();
    if (typeof renderAnalysis === 'function') renderAnalysis();
}



/* ========================================================================== */
/* 📌 本地備份與還原功能 (Local Backup & Restore)                               */
/* ========================================================================== */

// 記錄備份功能區塊是否處於編輯模式的布林值
let isBackupEditMode = false;

// 切換備份/還原區塊的「唯讀/編輯」模式
window.toggleBackupEditMode = function() {
    const btn = document.getElementById('btn-toggle-backup-edit');
    if (isBackupEditMode) {
        isBackupEditMode = false;
        if (btn) {
            btn.innerHTML = "🔒 唯讀模式";
            btn.style.color = "#888";
            btn.style.borderColor = "#ddd";
            btn.style.background = "transparent";
        }
    } else {
        showConfirm("確定要開啟編輯模式嗎？\n\n開啟後您可以匯入或匯出您的資料檔案。", "✏️ 進入編輯模式").then(ok => {
            if (ok) {
                isBackupEditMode = true;
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

// 將使用者目前的全部資料匯出下載為 JSON 備份檔
function exportDataToFile() {
    if (typeof isBackupEditMode !== 'undefined' && !isBackupEditMode) {
        showAlert("目前為「🔒 唯讀模式」\n若要匯出資料，請先切換至編輯狀態。");
        return;
    }
    if (!currentUser) {
        if(window.showAlert) showAlert("請先登入才能匯出資料！", "錯誤");
        return;
    }

    saveData();

    const exportObj = {
        allData: allData,
        semesterList: semesterList,
        currentSemester: currentSemester,
        graduationTarget: graduationTarget,
        categoryTargets: categoryTargets,
        userSchoolInfo: userSchoolInfo,
        periodConfig: periodConfig,
        paymentMethods: paymentMethods,
        accCategories: accCategories,
        userTitle: userTitle,
        customPeriods: customPeriods
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    
    const dateStr = new Date().toISOString().split('T')[0];
    downloadAnchorNode.setAttribute("download", `CampusKing_Backup_${dateStr}.json`);
    
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    
    if(window.showAlert) showAlert("資料已成功匯出為 JSON 檔案！\n請妥善保存此檔案。", "匯出成功");
}

// 點擊匯入按鈕時，先檢查編輯模式再觸發隱藏的檔案上傳器
function triggerImport() {
    if (typeof isBackupEditMode !== 'undefined' && !isBackupEditMode) {
        if(window.showAlert) showAlert("目前為「🔒 唯讀模式」\n若要匯入資料，請先切換至編輯狀態。");
        return;
    }
    document.getElementById('import-file-input').click();
}

// 讀取使用者選取的 JSON 檔案並覆蓋現有資料
function importDataFromFile(event) {
    if (typeof isBackupEditMode !== 'undefined' && !isBackupEditMode) {
        showAlert("目前為「🔒 唯讀模式」\n若要匯入資料，請先切換至編輯狀態。");
        document.getElementById('import-file-input').value = "";
        return;
    }
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedData = JSON.parse(e.target.result);
            
            if (!importedData.allData || !importedData.semesterList) {
                throw new Error("檔案格式不正確");
            }

            showConfirm("確定要匯入此資料嗎？\n\n⚠️ 警告：這將會完全覆蓋您目前的所有資料 (包含雲端)，且無法復原！", "📥 匯入確認").then(isConfirmed => {
                if (isConfirmed) {
                    parseAndApplyData(importedData);
                    saveData(); 
                    refreshUI();
                    if(window.showAlert) showAlert("資料已成功還原！", "匯入成功");
                }
                document.getElementById('import-file-input').value = "";
            });

        } catch (error) {
            console.error("匯入失敗:", error);
            if(window.showAlert) showAlert("檔案格式錯誤或損毀，無法匯入！\n請確認您選擇的是 CampusKing 匯出的 JSON 備份檔。", "匯入失敗");
            document.getElementById('import-file-input').value = "";
        }
    };
    reader.readAsText(file);
}