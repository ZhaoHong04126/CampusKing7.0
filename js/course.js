/* ========================================================================== */
/* 📌 課表狀態變數與顯示切換 (Schedule State & View Toggles)                    */
/* ========================================================================== */

// 用來記錄「目前正在編輯的一整組連堂課程」在該日陣列中的索引位置
let editingCourseIndices = [];

// 紀錄週課表目前是否處於可點擊的「編輯模式」(預設防誤觸)
let isWeeklyEditMode = false;

// 記錄週課表中，第一次點選的格子位置 (用於連選邏輯的起點)
let selectionAnchor = null;

// 切換週課表的「編輯/唯讀」模式
function toggleWeeklyEditMode() {
    isWeeklyEditMode = !isWeeklyEditMode;
    const btn = document.getElementById('btn-toggle-sch-edit');
    if (!btn) return;

    if (isWeeklyEditMode) {
        btn.innerHTML = "✏️ 編輯模式";
        btn.style.color = "var(--primary)";
        btn.style.borderColor = "var(--primary)";
        btn.style.background = "#e6f0ff";
        showAlert("已開啟編輯模式！\n現在可以點選格子來新增或修改課程了。");
    } else {
        btn.innerHTML = "🔒 唯讀模式";
        btn.style.color = "#888";
        btn.style.borderColor = "#ddd";
        btn.style.background = "transparent";
        
        clearSelectionHighlight();
        selectionAnchor = null;
        hideSelectionHint();
    }
}

// 切換單日課表的顯示 (例如從星期一切換到星期二)
function switchDay(day) {
    currentDay = day; 
    
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    const activeBtn = document.getElementById(`tab-${day}`);
    if (activeBtn) activeBtn.classList.add('active');

    const todayData = weeklySchedule[day] || [];
    
    todayData.sort((a, b) => {
        let idxA = customPeriods.indexOf(a.period);
        let idxB = customPeriods.indexOf(b.period);
        if (idxA === -1) idxA = 999; 
        if (idxB === -1) idxB = 999;
        return idxA - idxB;
    });

    const tbody = document.getElementById('schedule-body');
    if (tbody) {
        tbody.innerHTML = '';
        if (todayData.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="no-class">😴 無課程</td></tr>';
        } else {
            todayData.forEach(item => {
                const period = item.period || "-";
                const teacher = item.teacher || "";
                const room = item.room || "";
                const nature = item.nature || item.type || '必修';
                const category = item.category || '';

                let typeColor = "#999";
                if (nature === '必修') typeColor = "#e74c3c";
                else if (nature === '選修') typeColor = "#27ae60";
                else if (nature === '必選修') typeColor = "#f39c12";

                const customColor = item.color && item.color !== '#ffffff' ? item.color : 'transparent';
                const rowStyle = customColor !== 'transparent' ? `border-left: 5px solid ${customColor};` : '';

                const row = `
                    <tr style="${rowStyle}">
                        <td style="color:var(--primary); font-weight:bold;">${period}</td>
                        <td style="color:var(--text-sub);">${item.time}</td>
                        <td style="font-weight:bold;">${item.subject}</td>
                        <td><span style="background:var(--border); color:var(--text-main); padding:2px 4px; border-radius:4px; font-size:0.8rem;">${room}</span></td>
                        <td style="font-size:0.85rem;">${teacher}</td>
                    </tr>
                `;
                tbody.innerHTML += row;
            });
        }
    }
}

// 切換課表總體的顯示模式 (單日 daily 或是 週表 weekly)
function switchScheduleMode(mode) {
    const tabs = ['daily', 'weekly'];
    tabs.forEach(tab => {
        const view = document.getElementById(`subview-sch-${tab}`);
        const btn = document.getElementById(`btn-sch-${tab}`);
        if (view) view.style.display = 'none';
        if (btn) btn.classList.remove('active');
    });

    const targetView = document.getElementById(`subview-sch-${mode}`);
    const targetBtn = document.getElementById(`btn-sch-${mode}`);
    if (targetView) targetView.style.display = 'block';
    if (targetBtn) targetBtn.classList.add('active');

    if (mode === 'weekly') {
        renderWeeklyTable();
    }
}



/* ========================================================================== */
/* 📌 課程編輯與管理 (Course Editing & Management)                              */
/* ========================================================================== */

// 渲染編輯彈窗下方的「今日已有課程列表」，方便直接修改或刪除
function renderEditList() {
    const listDiv = document.getElementById('current-course-list');
    const todayData = weeklySchedule[currentDay] || [];
    let html = '';
    
    todayData.forEach((item, index) => {
        const info = `${item.time} ${item.room ? '@' + item.room : ''}`;
        html += `
        <div class="course-list-item">
            <div class="course-info">
                <div class="course-name">[${item.period}] ${item.subject}</div>
                <div class="course-time">${info}</div>
            </div>
            <div>
                <button class="btn-edit" onclick="editCourse(${index})">修改</button>
                <button class="btn-delete" onclick="deleteCourse(${index})">刪除</button>
            </div>
        </div>`;
    });
    listDiv.innerHTML = html || '<p style="color:#999; text-align:center;">無課程</p>';
}

// 準備編輯特定課程，並自動偵測是否為連堂課以一併選取
function editCourse(startIndex) {
    const todayData = weeklySchedule[currentDay] || [];
    const startItem = todayData[startIndex];
    if (!startItem) return;

    editingCourseIndices = [startIndex];

    let currentPIndex = customPeriods.indexOf(startItem.period);
    let endPeriod = startItem.period; 

    for (let i = startIndex + 1; i < todayData.length; i++) {
        const nextItem = todayData[i];
        const nextPIndex = customPeriods.indexOf(nextItem.period);

        if (nextPIndex === currentPIndex + 1 &&
            nextItem.subject === startItem.subject &&
            nextItem.room === startItem.room) {
            
            editingCourseIndices.push(i); 
            endPeriod = nextItem.period;  
            currentPIndex = nextPIndex;   
        } else {
            break; 
        }
    }

    document.getElementById('input-period-start').value = startItem.period || '';
    document.getElementById('input-period-end').value = endPeriod; 
    document.getElementById('input-subject').value = startItem.subject || '';
    document.getElementById('input-room').value = startItem.room || '';
    document.getElementById('input-teacher').value = startItem.teacher || '';

    const color = startItem.color || '#ffffff';
    document.getElementById('input-color').value = color;
    updateColorSwatchUI(color);

    const btn = document.getElementById('btn-add-course');
    if (btn) {
        btn.innerText = "💾 保存修改 (整段)";
        btn.style.background = "#f39c12";
    }
}

// 讀取表單資料後新增課程，若起訖節次不同會自動展開成多堂課寫入
function addCourse() {
    const pStartRaw = document.getElementById('input-period-start').value.trim();
    const pEndRaw = document.getElementById('input-period-end').value.trim();
    const sub = document.getElementById('input-subject').value;
    const room = document.getElementById('input-room').value;
    const teacher = document.getElementById('input-teacher').value;
    const color = document.getElementById('input-color').value;

    if (!sub || !pStartRaw) {
        showAlert('請至少輸入「科目」與「起始節次」', '資料不全');
        return;
    }

    const idxStart = customPeriods.indexOf(pStartRaw);
    let idxEnd = pEndRaw ? customPeriods.indexOf(pEndRaw) : idxStart;

    if (idxStart === -1) { showAlert(`起始節次 "${pStartRaw}" 無效，請確認名稱是否正確`, '格式錯誤'); return; }
    if (idxEnd === -1) { showAlert(`結束節次 "${pEndRaw}" 無效，請確認名稱是否正確`, '格式錯誤'); return; }
    if (idxEnd < idxStart) { showAlert('結束節次不能早於起始節次！', '邏輯錯誤'); return; }

    if (!weeklySchedule[currentDay]) weeklySchedule[currentDay] = [];

    if (editingCourseIndices.length > 0) {
        editingCourseIndices.sort((a, b) => b - a);
        editingCourseIndices.forEach(delIndex => {
            if (delIndex < weeklySchedule[currentDay].length) {
                weeklySchedule[currentDay].splice(delIndex, 1);
            }
        });
    }

    let count = 0;
    for (let i = idxStart; i <= idxEnd; i++) {
        const timeObj = getPeriodTimes()[p];
        const autoTime = timeObj ? timeObj.start : "";

        weeklySchedule[currentDay].push({
            period: p,
            time: autoTime,
            subject: sub, room, teacher,
            color: color 
        });
        count++;
    }

    weeklySchedule[currentDay].sort((a, b) => {
        let idxA = customPeriods.indexOf(a.period);
        let idxB = customPeriods.indexOf(b.period);
        if (idxA === -1) idxA = 999; 
        if (idxB === -1) idxB = 999;
        return idxA - idxB;
    });

    const msg = editingCourseIndices.length > 0 ? "修改成功！(已更新整段區間)" : `成功加入 ${count} 堂課！`;
    showAlert(msg, "完成");

    resetCourseInput();
    saveData();
    renderEditList();
    updateExamSubjectOptions(); 
    if (typeof renderWeeklyTable === 'function') renderWeeklyTable();
}

// 刪除指定的課程，同樣會自動偵測連堂課並一併刪除
function deleteCourse(startIndex) {
    const todayData = weeklySchedule[currentDay] || [];
    const startItem = todayData[startIndex];

    let indicesToDelete = [startIndex];
    let currentPIndex = customPeriods.indexOf(startItem.period);

    for (let i = startIndex + 1; i < todayData.length; i++) {
        const nextItem = todayData[i];
        const nextPIndex = customPeriods.indexOf(nextItem.period);
        if (nextPIndex === currentPIndex + 1 &&
            nextItem.subject === startItem.subject &&
            nextItem.room === startItem.room) {
            indicesToDelete.push(i);
            currentPIndex = nextPIndex;
        } else {
            break;
        }
    }

    const confirmMsg = indicesToDelete.length > 1 
        ? `確定刪除這 ${indicesToDelete.length} 堂連堂課程嗎？` 
        : '確定刪除這堂課嗎？';

    showConfirm(confirmMsg, '刪除確認').then(isConfirmed => {
        if (isConfirmed) {
            if (editingCourseIndices.length > 0) resetCourseInput();

            indicesToDelete.sort((a, b) => b - a);
            indicesToDelete.forEach(idx => {
                weeklySchedule[currentDay].splice(idx, 1);
            });

            saveData();
            renderEditList();
            updateExamSubjectOptions();
            if (typeof renderWeeklyTable === 'function') renderWeeklyTable();
        }
    });
}

// 重置課程輸入表單的內容，並將狀態切回「新增模式」
function resetCourseInput() {
    document.getElementById('input-period-start').value = '';
    document.getElementById('input-period-end').value = '';
    document.getElementById('input-subject').value = '';
    document.getElementById('input-room').value = '';
    document.getElementById('input-teacher').value = '';
    document.getElementById('input-color').value = '#ffffff';
    updateColorSwatchUI('#ffffff');

    editingCourseIndices = []; 
    const btn = document.getElementById('btn-add-course');
    if (btn) {
        btn.innerText = "+ 加入清單";
        btn.style.background = "#333";
    }
}

// 開啟課程編輯與新增的彈出視窗
function openEditModal() {
    document.getElementById('course-modal').style.display = 'flex';
    resetCourseInput();
    renderEditList();
}

// 關閉課程編輯與新增的彈出視窗
function closeEditModal() {
    document.getElementById('course-modal').style.display = 'none';
    resetCourseInput();
}

// 更新顏色選取器的 UI 狀態 (加上選取外框)
function updateColorSwatchUI(selectedColor) {
    const swatches = document.querySelectorAll('.color-swatch');
    swatches.forEach(sw => {
        sw.classList.remove('selected');
        const onclickAttr = sw.getAttribute('onclick');
        if (onclickAttr && onclickAttr.includes(`'${selectedColor}'`)) {
            sw.classList.add('selected');
        }
    });
}



/* ========================================================================== */
/* 📌 節次與時間計算 (Period & Time Calculation)                                */
/* ========================================================================== */

// 根據首節時間與上下課長度推算預設時間，若有自訂則優先使用自訂時間
function getPeriodTimes() {
    const times = {};
    const { classDur, breakDur, startHash } = periodConfig; 

    let [h, m] = startHash.split(':').map(Number);
    let currentMin = h * 60 + m; 

    let zeroStart = currentMin - (classDur + breakDur);
    
    if (customPeriods.includes('0')) {
        times['0'] = {
            start: periodTimesConfig['0']?.start || formatTime(zeroStart),
            end: periodTimesConfig['0']?.end || formatTime(zeroStart + classDur)
        };
    }

    customPeriods.forEach(p => {
        if (p === '0') return; 
        
        let pStart = formatTime(currentMin);
        let pEnd = formatTime(currentMin + classDur);
        
        times[p] = {
            start: periodTimesConfig[p]?.start || pStart,
            end: periodTimesConfig[p]?.end || pEnd
        };
        currentMin += classDur + breakDur; 
    });
    return times;
}

// 將累積的分鐘數轉換為 HH:MM 格式的字串
function formatTime(totalMinutes) {
    let h = Math.floor(totalMinutes / 60);
    let m = totalMinutes % 60;
    if (h >= 24) h -= 24; 
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

// 開啟獨立時程設定的 Modal
function editTimeSettings() {
    if (typeof isGeneralSettingsEditMode !== 'undefined' && !isGeneralSettingsEditMode) {
        showAlert("目前為「🔒 唯讀模式」\n若要修改，請先切換至編輯狀態。"); return;
    }
    
    const modal = document.getElementById('period-time-modal');
    if (!modal) return; 
    
    modal.style.display = 'flex';
    const container = document.getElementById('period-time-container');
    container.innerHTML = '';
    
    const currentTimes = getPeriodTimes(); 

    // 渲染目前的節次
    customPeriods.forEach(p => {
        const timeData = currentTimes[p] || { start: "", end: "" };
        container.innerHTML += createPeriodRowHTML(p, timeData.start, timeData.end);
    });
}

// 產生單一節次設定的 HTML
function createPeriodRowHTML(name, start, end) {
    return `
        <tr class="period-time-row" data-old-name="${name}">
            <td style="padding: 8px 4px;">
                <input type="text" class="period-name-input" value="${name}" placeholder="名稱" title="節次名稱">
            </td>
            <td style="padding: 8px 4px;">
                <input type="text" class="period-time-input start-time" value="${start}" 
                       onfocus="this.type='time'" 
                       onblur="this.type='text'">
            </td>
            <td style="padding: 8px 0; text-align: center; color: #888; font-weight: bold;">~</td>
            <td style="padding: 8px 4px;">
                <input type="text" class="period-time-input end-time" value="${end}" 
                       onfocus="this.type='time'" 
                       onblur="this.type='text'">
            </td>
            <td style="padding: 8px 4px; text-align: center;">
                <button onclick="this.closest('tr').remove()" style="background: transparent; border: none; color: #e74c3c; cursor: pointer; font-size: 1.2rem; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.2)'" onmouseout="this.style.transform='scale(1)'">✖</button>
            </td>
        </tr>
    `;
}

// 動態新增一列節次
window.addCustomPeriodRow = function() {
    const container = document.getElementById('period-time-container');
    if (container) {
        container.insertAdjacentHTML('beforeend', createPeriodRowHTML('', '', ''));
        container.scrollTop = container.scrollHeight; // 自動捲動到最下面
    }
}

// 關閉時程設定 Modal
function closePeriodTimeModal() {
    document.getElementById('period-time-modal').style.display = 'none';
}

// 儲存自訂時間、節次名稱，並更新課表資料
window.savePeriodTimeSettings = function() {
    const rows = document.querySelectorAll('.period-time-row');
    let newCustomPeriods = [];
    let newPeriodTimesConfig = {};
    let renameMap = {}; 

    let hasDuplicate = false;
    let namesSet = new Set();

    // 驗證是否有重複的節次名稱
    rows.forEach(row => {
        const newName = row.querySelector('.period-name-input').value.trim();
        if(newName) {
            if(namesSet.has(newName)) hasDuplicate = true;
            namesSet.add(newName);
        }
    });

    if(hasDuplicate) {
        showAlert("節次名稱不能重複，請檢查後再儲存！", "設定錯誤");
        return;
    }

    rows.forEach(row => {
        const oldName = row.getAttribute('data-old-name');
        const newName = row.querySelector('.period-name-input').value.trim();
        const startVal = row.querySelector('.start-time').value;
        const endVal = row.querySelector('.end-time').value;
        
        if (newName) {
            newCustomPeriods.push(newName);
            newPeriodTimesConfig[newName] = { start: startVal, end: endVal };
            
            // 紀錄名稱變更 (用來轉移舊課表)
            if (oldName && oldName !== newName && oldName !== 'null') {
                renameMap[oldName] = newName;
            }
        }
    });

    if (newCustomPeriods.length === 0) {
        showAlert("至少需要保留一節課！", "設定錯誤");
        return;
    }

    // 替換所有學期與週次的課表紀錄 (將舊名字改成新名字，並刪除被移除的節次課程)
    Object.keys(allData).forEach(sem => {
        const semSchedule = allData[sem].schedule;
        if (semSchedule) {
            Object.keys(semSchedule).forEach(day => {
                // 更名
                semSchedule[day].forEach(course => {
                    if (renameMap[course.period]) {
                        course.period = renameMap[course.period];
                    }
                });
                // 過濾掉已經被刪除的節次課程
                semSchedule[day] = semSchedule[day].filter(course => newCustomPeriods.includes(course.period));
            });
        }
    });

    // 寫入全域變數
    customPeriods = newCustomPeriods;
    periodTimesConfig = newPeriodTimesConfig;
    
    saveData();
    refreshUI();
    closePeriodTimeModal();
    showAlert("節次與時程設定已成功更新！", "儲存成功");
}



/* ========================================================================== */
/* 📌 週課表網格操作與渲染 (Weekly Grid Operations)                             */
/* ========================================================================== */

// 處理週課表「點擊空白格子」的操作 (支援兩段式連選起點與終點)
function handleWeeklyAdd(day, period) {
    if (!isWeeklyEditMode) {
        showAlert("目前為「🔒 唯讀模式」\n若要新增課程，請先點擊右上角的按鈕切換至編輯狀態。");
        return;
    }

    if (!selectionAnchor || selectionAnchor.day !== day) {
        clearSelectionHighlight();
        selectionAnchor = { day: day, period: period };
        
        const cell = getCellByDayPeriod(day, period);
        if (cell) cell.classList.add('cell-selected');
        
        showSelectionHint(`已選取週${getDayName(day)}第 ${period} 節，請點選「結束節次」`);
        return; 
    }

    const idxStart = customPeriods.indexOf(selectionAnchor.period);
    const idxCurrent = customPeriods.indexOf(period);

    let finalStart, finalEnd;
    if (idxStart <= idxCurrent) {
        finalStart = selectionAnchor.period;
        finalEnd = period;
    } else {
        finalStart = period;
        finalEnd = selectionAnchor.period;
    }

    switchDay(day);
    openEditModal();

    document.getElementById('input-period-start').value = finalStart;
    document.getElementById('input-period-end').value = finalEnd;

    clearSelectionHighlight();
    selectionAnchor = null;
    hideSelectionHint();
}

// 處理週課表「點擊已有課程」進入修改模式的操作
function handleWeeklyEdit(day, index) {
    if (!isWeeklyEditMode) {
        showAlert("目前為「🔒 唯讀模式」\n若要修改或刪除課程，請先點擊右上角的按鈕切換至編輯狀態。");
        return;
    }
    
    clearSelectionHighlight();
    selectionAnchor = null;
    hideSelectionHint();

    switchDay(day); 
    openEditModal(); 
    editCourse(index); 
}

// 渲染包含連堂合併 (rowspan) 的一到日完整週課表網格
function renderWeeklyTable() {
    const tbody = document.getElementById('weekly-schedule-body');
    if (!tbody) return;

    const periods = customPeriods; 
    const dayKeys = [1, 2, 3, 4, 5, 6, 0]; 
    let skipMap = new Set(); 
    let html = '';
    const times = getPeriodTimes();

    periods.forEach((p, pIndex) => {
        html += `<tr>`;
        
        html += `<td style="font-weight:bold; background:#f4f7f6; color:#555; text-align:center; vertical-align: middle;">${p}</td>`;

        const timeObj = times[p] || { start: "", end: "" };
        const startTimeStr = timeObj.start;
        const endTimeStr = timeObj.end;
        html += `<td style="font-size:0.75rem; color:#888; background:#f4f7f6; text-align:center; vertical-align: middle; line-height: 1.2;">
                    ${startTimeStr}<br>~<br>${endTimeStr}
                 </td>`;

        dayKeys.forEach(day => {
            if (skipMap.has(`${day}-${p}`)) return;

            const dayCourses = weeklySchedule[day] || [];
            const courseIndex = dayCourses.findIndex(c => c.period == p);
            const course = dayCourses[courseIndex];

            if (course) {
                let spanCount = 1;
                for (let nextI = pIndex + 1; nextI < periods.length; nextI++) {
                    const nextP = periods[nextI];
                    const nextCourse = dayCourses.find(c => c.period == nextP);
                    
                    if (nextCourse &&
                        nextCourse.subject === course.subject &&
                        nextCourse.room === course.room) {
                        spanCount++;
                        skipMap.add(`${day}-${nextP}`); 
                    } else {
                        break;
                    }
                }

                let bgColor = course.color && course.color !== '#ffffff' ? course.color : null;
                if (!bgColor) {
                    bgColor = '#fff3e0'; 
                    if (course.nature === '必修') bgColor = '#ffebee'; 
                    else if (course.nature === '選修') bgColor = '#e8f5e9'; 
                }

                html += `
                <td rowspan="${spanCount}" onclick="handleWeeklyEdit(${day}, ${courseIndex})" style="cursor:pointer; background:${bgColor}; padding:4px; text-align:center; vertical-align:middle; border:1px solid #eee;">
                    <div style="font-weight:bold; font-size:0.85rem; color:#333; line-height:1.2;">${course.subject}</div>
                    <div style="font-size:0.75rem; color:#666; margin-top:2px;">${course.room || ''}</div>
                </td>`;
            } else {
                html += `<td id="cell-${day}-${p}" onclick="handleWeeklyAdd(${day}, '${p}')" style="cursor:pointer; border:1px solid #f9f9f9; transition: background 0.2s;"></td>`;
            }
        });
        html += `</tr>`;
    });
    tbody.innerHTML = html;
}

// 輔助函式：清除畫面上所有格子的連選狀態高亮 (CSS Class)
function clearSelectionHighlight() {
    document.querySelectorAll('.cell-selected').forEach(el => {
        el.classList.remove('cell-selected');
    });
}

// 輔助函式：取得特定星期與節次的週課表 DOM 元素
function getCellByDayPeriod(day, period) {
    return document.getElementById(`cell-${day}-${period}`);
}

// 輔助函式：將數字轉換為中文星期字元
function getDayName(day) {
    const days = ['日', '一', '二', '三', '四', '五', '六'];
    return days[day] || '';
}

// 在畫面下方動態產生並顯示「連選模式」的浮動提示文字
function showSelectionHint(msg) {
    let hint = document.getElementById('selection-hint-toast');
    if (!hint) {
        hint = document.createElement('div');
        hint.id = 'selection-hint-toast';
        Object.assign(hint.style, {
            position: 'fixed', bottom: '80px', left: '50%', transform: 'translateX(-50%)',
            background: 'rgba(0,0,0,0.8)', color: 'white', padding: '10px 20px',
            borderRadius: '20px', fontSize: '14px', zIndex: '9999', pointerEvents: 'none',
            transition: 'opacity 0.3s'
        });
        document.body.appendChild(hint);
    }
    hint.innerText = msg;
    hint.style.opacity = '1';
    
    if(window.selectionHintTimer) clearTimeout(window.selectionHintTimer);
    window.selectionHintTimer = setTimeout(hideSelectionHint, 4000);
}

// 將浮動提示文字隱藏
function hideSelectionHint() {
    const hint = document.getElementById('selection-hint-toast');
    if (hint) hint.style.opacity = '0';
}