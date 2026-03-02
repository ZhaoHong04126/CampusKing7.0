/* ========================================================================== */
/* 📌 行事曆狀態與基礎控制 (Calendar State & Basic Controls)                    */
/* ========================================================================== */

// 用來記錄目前月曆顯示的日期
let calCurrentDate = new Date();

// 記錄目前正在編輯的活動索引 (-1 代表新增模式)
let editingCalendarIndex = -1;

// 記錄行事曆是否處於編輯模式
let isCalendarEditMode = false;

// 記錄月曆左右滑動的起始與結束 X 座標
let calTouchStartX = 0;
let calTouchEndX = 0;

// 切換行事曆的顯示分頁 (月曆視圖 / 列表視圖)
function switchCalendarTab(tabName) {
    const tabs = ['month', 'list'];
    tabs.forEach(t => {
        const btn = document.getElementById(`btn-cal-${t}`);
        const view = document.getElementById(`subview-cal-${t}`);
        if (btn) btn.classList.remove('active');
        if (view) view.style.display = 'none';
    });
    const activeBtn = document.getElementById(`btn-cal-${tabName}`);
    const activeView = document.getElementById(`subview-cal-${tabName}`);
    if (activeBtn) activeBtn.classList.add('active');
    if (activeView) activeView.style.display = 'block';
}

// 初始化月曆區塊的手機左右滑動事件監聽器
function initCalendarSwipe() {
    const swipeZone = document.getElementById('calendar-swipe-container');
    if (!swipeZone || swipeZone.dataset.swipeBound) return;
    swipeZone.dataset.swipeBound = "true";
    
    swipeZone.addEventListener('touchstart', e => {
        calTouchStartX = e.changedTouches[0].screenX;
    }, {passive: true});
    
    swipeZone.addEventListener('touchend', e => {
        calTouchEndX = e.changedTouches[0].screenX;
        if (calTouchEndX < calTouchStartX - 50) changeMonth(1);  
        if (calTouchEndX > calTouchStartX + 50) changeMonth(-1); 
    }, {passive: true});
}

// 切換月份 (offset: 1 為下個月，-1 為上個月)
function changeMonth(offset) {
    calCurrentDate.setMonth(calCurrentDate.getMonth() + offset);
    renderMonthGrid();
}

// 將月曆時間重置為今天所在的月份並重新渲染
function goToToday() {
    calCurrentDate = new Date(); 
    renderMonthGrid();           
}



/* ========================================================================== */
/* 📌 編輯模式切換 (Edit Mode Toggle)                                           */
/* ========================================================================== */

// 切換行事曆的編輯/唯讀模式 (suppressAlert 用於自動觸發時跳過確認視窗)
function toggleCalendarEditMode(suppressAlert = false) {
    const btn = document.getElementById('btn-toggle-cal-edit');
    const addBtns = document.querySelectorAll('#view-calendar .btn-add'); 

    if (isCalendarEditMode) {
        isCalendarEditMode = false;
        if (btn) {
            btn.innerHTML = "🔒 唯讀模式";
            btn.style.color = "#888";
            btn.style.borderColor = "#ddd";
            btn.style.background = "transparent";
        }
        addBtns.forEach(b => b.style.display = 'none');
        renderCalendarList(); 
    } 
    else {
        const enableEdit = () => {
            isCalendarEditMode = true;
            if (btn) {
                btn.innerHTML = "✏️ 編輯模式";
                btn.style.color = "var(--primary)";
                btn.style.borderColor = "var(--primary)";
                btn.style.background = "#e6f0ff";
            }
            addBtns.forEach(b => b.style.display = 'block');
            renderCalendarList();
        };

        if (suppressAlert) {
            enableEdit();
        } 
        else {
            if (window.showConfirm) {
                showConfirm("確定要開啟編輯模式嗎？\n\n開啟後您可以點選「日期格子」或「活動標籤」來新增與修改了。", "✏️ 進入編輯模式").then(ok => {
                    if (ok) enableEdit();
                });
            } else {
                if (confirm("確定要開啟編輯模式嗎？\n\n開啟後您可以點選「日期格子」或「活動標籤」來新增與修改了。")) enableEdit();
            }
        }
    }
}



/* ========================================================================== */
/* 📌 行事曆畫面渲染 (Calendar Rendering)                                       */
/* ========================================================================== */

// 觸發行事曆列表與月曆網格的重新渲染
function renderCalendar() {
    renderCalendarList();
    renderMonthGrid();
}

// 渲染活動列表視圖 (List View)
function renderCalendarList() {
    const listDiv = document.getElementById('calendar-list');
    if (!listDiv) return;

    calendarEvents.sort((a, b) => {
        const dateA = new Date(a.date + (a.startTime ? 'T' + a.startTime : 'T00:00'));
        const dateB = new Date(b.date + (b.startTime ? 'T' + b.startTime : 'T00:00'));
        return dateA - dateB;
    });

    let html = '';
    if (calendarEvents.length === 0) {
        html = '<p style="color:#999; text-align:center;">😴 目前無活動</p>';
    } else {
        const deleteBtnDisplay = isCalendarEditMode ? 'block' : 'none';

        calendarEvents.forEach((event, index) => {
            const endDateCheck = event.endDate ? new Date(event.endDate) : new Date(event.date);
            const isPast = endDateCheck < new Date().setHours(0,0,0,0);
            const style = isPast ? 'opacity: 0.5;' : '';
            
            let timeBadge = '';
            if (!event.isAllDay && event.startTime) {
                timeBadge = `<span style="background:#e3f2fd; color:#1565c0; padding:2px 6px; border-radius:4px; font-size:0.8rem; margin-right:6px;">${event.startTime}${event.endTime ? '~'+event.endTime : ''}</span>`;
            } else {
                timeBadge = `<span style="background:#eee; color:#666; padding:2px 6px; border-radius:4px; font-size:0.8rem; margin-right:6px;">全天</span>`;
            }

            let dateDisplay = event.date;
            if (event.endDate && event.endDate !== event.date) {
                const s = event.date.split('-').slice(1).join('/');
                const e = event.endDate.split('-').slice(1).join('/');
                dateDisplay = `${s} ~ ${e}`;
            }

            html += `
            <div onclick="editCalendarEvent(event, ${index})" style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #eee; padding:10px 0; ${style}; cursor:pointer;">
                <div style="text-align:left;">
                    <div style="font-weight:bold; color:var(--primary); font-size:0.9rem; margin-bottom:2px;">
                        ${dateDisplay}
                    </div>
                    <div style="font-size:1rem; display:flex; align-items:center; flex-wrap:wrap;">
                        ${timeBadge}
                        <span>${event.title}</span>
                    </div>
                </div>
                <button class="btn-delete" onclick="deleteCalendarEvent(${index}); event.stopPropagation();" style="padding:4px 8px; display: ${deleteBtnDisplay};">🗑️</button>
            </div>`;
        });
    }
    listDiv.innerHTML = html;
}

// 渲染月曆網格視圖 (Month Grid View)，包含連續色塊與文字排版計算
function renderMonthGrid() {
    const gridDiv = document.getElementById('calendar-grid');
    const titleDiv = document.getElementById('calendar-month-year');
    if (!gridDiv || !titleDiv) return;

    const year = calCurrentDate.getFullYear();
    const month = calCurrentDate.getMonth(); 

    let weekInfoText = "";
    if (typeof semesterStartDate !== 'undefined' && semesterStartDate) {
        const start = new Date(semesterStartDate);
        const currentMonthEnd = new Date(year, month + 1, 0);
        if (currentMonthEnd >= start) {
            const currentMonthStart = new Date(year, month, 1);
            const diffTime = currentMonthStart - start;
            const startWeek = Math.max(1, Math.ceil(Math.ceil(diffTime / (86400000)) / 7));
            if (startWeek < 30) weekInfoText = `<span style="font-size:0.8rem; color:var(--primary); margin-left:10px;">(約 第${startWeek}週起)</span>`;
        }
    }
    titleDiv.innerHTML = `${year}年 ${month + 1}月 ${weekInfoText}`;

    let html = `
        <div class="cal-day-header" style="color:#e74c3c">日</div>
        <div class="cal-day-header">一</div>
        <div class="cal-day-header">二</div>
        <div class="cal-day-header">三</div>
        <div class="cal-day-header">四</div>
        <div class="cal-day-header">五</div>
        <div class="cal-day-header" style="color:#e74c3c">六</div>
    `;

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let i = 0; i < firstDay; i++) {
        html += `<div class="cal-day cal-other-month"></div>`;
    }

    const today = new Date();
    const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

    const eventsWithIndex = calendarEvents.map((e, i) => ({ ...e, _originalIndex: i }));
    eventsWithIndex.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        if (dateA.getTime() !== dateB.getTime()) return dateA - dateB;
        const endA = a.endDate ? new Date(a.endDate) : dateA;
        const endB = b.endDate ? new Date(b.endDate) : dateB;
        return (endB - endA); 
    });

    for (let d = 1; d <= daysInMonth; d++) {
        const isToday = isCurrentMonth && today.getDate() === d;
        const className = isToday ? 'cal-day cal-today' : 'cal-day';
        
        const mStr = (month + 1).toString().padStart(2, '0');
        const dStr = d.toString().padStart(2, '0');
        const currentDateStr = `${year}-${mStr}-${dStr}`;
        const currentDayOfWeek = new Date(year, month, d).getDay();

        const dayEvents = eventsWithIndex.filter(e => {
            const start = e.date; 
            const end = e.endDate || e.date;
            return currentDateStr >= start && currentDateStr <= end;
        });

        let eventsHtml = '';
        dayEvents.forEach(e => {
            const isStart = (e.date === currentDateStr);
            const isEnd = (!e.endDate || e.endDate === currentDateStr || e.endDate < currentDateStr);
            
            if (e.isAllDay || e.endDate) {
                let classes = "cal-event-bar ";
                let inlineStyle = "";

                if (isStart && isEnd) {
                    classes += "single ";
                    if (!e.isAllDay && e.startTime && e.endTime) {
                        const [sh, sm] = e.startTime.split(':').map(Number);
                        const startPct = Math.min(85, ((sh * 60 + sm) / 1440) * 100);
                        const [eh, em] = e.endTime.split(':').map(Number);
                        const endPct = Math.min(85, 100 - (((eh * 60 + em) / 1440) * 100));
                        inlineStyle += `margin-left: ${startPct}%; width: max(12%, calc(100% - ${startPct}% - ${endPct}%));`;
                    }
                } 
                else if (isStart) {
                    classes += "start connect-right ";
                    if (!e.isAllDay && e.startTime) {
                        const [h, m] = e.startTime.split(':').map(Number);
                        const percent = Math.min(85, ((h * 60 + m) / 1440) * 100);
                        inlineStyle += `margin-left: ${percent}%;`;
                    }
                } 
                else if (isEnd) {
                    classes += "end connect-left ";
                    if (!e.isAllDay && e.endTime) {
                        const [h, m] = e.endTime.split(':').map(Number);
                        const percent = Math.min(85, 100 - (((h * 60 + m) / 1440) * 100));
                        inlineStyle += `margin-right: ${percent}%;`;
                    }
                } 
                else {
                    classes += "middle connect-left connect-right ";
                }

                let displayText = '&nbsp;';
                let showText = false;
                let text = "";
                let align = "left";

                if (isStart && isEnd) {
                    showText = true;
                    let timePrefix = (!e.isAllDay && e.startTime) ? `${e.startTime} ` : '';
                    text = timePrefix + e.title;
                } else {
                    const [sy, sm, sd] = e.date.split('-').map(Number);
                    const [ey, em, ed] = (e.endDate || e.date).split('-').map(Number);
                    const [cy, cm, cd] = currentDateStr.split('-').map(Number);
                    const startMs = Date.UTC(sy, sm - 1, sd);
                    const endMs = Date.UTC(ey, em - 1, ed);
                    const currentMs = Date.UTC(cy, cm - 1, cd);

                    const totalDays = Math.round((endMs - startMs) / 86400000) + 1;
                    const currentDayIndex = Math.round((currentMs - startMs) / 86400000);
                    const middleIndex = Math.floor((totalDays - 1) / 2);

                    if (e.isAllDay) {
                        if (isStart || currentDayOfWeek === 0) {
                            showText = true;
                            text = e.title;
                        }
                    } else {
                        if (currentDayIndex === 0) {
                            showText = true;
                            text = e.startTime ? e.startTime : e.title;
                            
                            if (totalDays === 2 && e.startTime) {
                                text += " " + e.title;
                            }
                        }
                        
                        if (totalDays > 2 && currentDayIndex === middleIndex) {
                            showText = true;
                            text = e.title;
                            align = "center";
                        }

                        if (currentDayIndex === totalDays - 1) {
                            if (e.endTime) {
                                showText = true;
                                text = e.endTime;
                                align = "right";
                            }
                        }

                        if (currentDayOfWeek === 0 && !showText && currentDayIndex !== totalDays - 1) {
                            showText = true;
                            text = e.title;
                        }
                    }
                }

                if (showText && text !== "") {
                    classes += " show-text ";
                    displayText = text;
                    if (align === "center") inlineStyle += " text-align: center;";
                    if (align === "right") inlineStyle += " text-align: right;";
                }
                
                eventsHtml += `<div class="${classes}" style="${inlineStyle}" onclick="editCalendarEvent(event, ${e._originalIndex})" title="${e.title}">${displayText}</div>`;
            } else {
                let timeStr = e.startTime ? e.startTime.replace(':','') : '';
                eventsHtml += `<div class="cal-event-time" onclick="editCalendarEvent(event, ${e._originalIndex})" title="${e.title}">
                    <span class="time-dot"></span><span style="font-weight:bold; margin-right:4px;">${timeStr}</span>${e.title}
                </div>`;
            }
        });

        html += `<div class="${className}" onclick="openCalendarModal('${currentDateStr}')">
                    <div class="cal-date-num">${d}</div>
                    <div class="cal-events-wrapper">${eventsHtml}</div>
                 </div>`;
    }
    gridDiv.innerHTML = html;
}



/* ========================================================================== */
/* 📌 活動編輯與管理 (Event Editing & Management)                               */
/* ========================================================================== */

// 開啟新增活動的 Modal 視窗 (若在唯讀模式下會先要求確認開啟編輯模式)
function openCalendarModal(dateStr = '') {
    if (dateStr && !isCalendarEditMode) {
        if (window.showConfirm) {
            showConfirm("目前為「🔒 唯讀模式」\n確定要開啟「✏️ 編輯模式」並新增活動嗎？", "切換模式確認").then(ok => {
                if (ok) {
                    toggleCalendarEditMode(true); 
                    openCalendarModal(dateStr);   
                }
            });
        }
        return;
    }

    editingCalendarIndex = -1;

    document.getElementById('cal-modal-title').innerText = "📅 新增活動";
    document.getElementById('btn-save-cal').innerText = "+ 加入";
    document.getElementById('btn-save-cal').style.background = "#333";
    document.getElementById('btn-del-cal').style.display = 'none';
    document.getElementById('calendar-modal').style.display = 'flex';
    document.getElementById('input-cal-date').value = dateStr;
    document.getElementById('input-cal-end-date').value = ''; 
    document.getElementById('input-cal-title').value = '';
    document.getElementById('input-cal-allday').checked = true;
    document.getElementById('input-cal-start').value = '';
    document.getElementById('input-cal-end').value = '';
    toggleCalTimeInput();
}

// 點擊特定活動以進入編輯狀態，將資料回填至 Modal
function editCalendarEvent(event, index) {
    if (event) event.stopPropagation();
    
    if (!isCalendarEditMode) {
        if (window.showConfirm) {
            showConfirm("目前為「🔒 唯讀模式」\n確定要開啟「✏️ 編輯模式」並修改此活動嗎？", "切換模式確認").then(ok => {
                if (ok) {
                    toggleCalendarEditMode(true); 
                    editCalendarEvent(null, index); 
                }
            });
        }
        return;
    }

    const item = calendarEvents[index];
    if (!item) return;

    editingCalendarIndex = index;
    
    document.getElementById('cal-modal-title').innerText = "✏️ 編輯活動";
    document.getElementById('btn-save-cal').innerText = "💾 儲存修改";
    document.getElementById('btn-save-cal').style.background = "#f39c12";
    document.getElementById('btn-del-cal').style.display = 'block';
    document.getElementById('calendar-modal').style.display = 'flex';
    document.getElementById('input-cal-date').value = item.date;
    document.getElementById('input-cal-end-date').value = item.endDate || '';
    document.getElementById('input-cal-title').value = item.title;
    document.getElementById('input-cal-allday').checked = item.isAllDay;
    document.getElementById('input-cal-start').value = item.startTime || '';
    document.getElementById('input-cal-end').value = item.endTime || '';
    
    toggleCalTimeInput();
}

// 關閉行事曆的編輯/新增 Modal
function closeCalendarModal() {
    document.getElementById('calendar-modal').style.display = 'none';
}

// 切換時間輸入框的顯示狀態 (依據是否勾選全天活動)
function toggleCalTimeInput() {
    const isAllDay = document.getElementById('input-cal-allday').checked;
    const timeDiv = document.getElementById('cal-time-inputs');
    timeDiv.style.display = isAllDay ? 'none' : 'flex';
}

// 新增或儲存編輯後的活動資料，並重新渲染行事曆
function addCalendarEvent() {
    const date = document.getElementById('input-cal-date').value;
    const endDate = document.getElementById('input-cal-end-date').value; 
    const title = document.getElementById('input-cal-title').value;
    const isAllDay = document.getElementById('input-cal-allday').checked;
    const startTime = document.getElementById('input-cal-start').value;
    const endTime = document.getElementById('input-cal-end').value;

    if (date && title) {
        if (endDate && endDate < date) {
            showAlert("結束日期不能早於起始日期！");
            return;
        }
        if (!isAllDay && !startTime) {
            showAlert("請輸入開始時間");
            return;
        }

        const eventData = { 
            date, 
            endDate: endDate || null,
            title,
            isAllDay,
            startTime: isAllDay ? null : startTime,
            endTime: isAllDay ? null : endTime
        };

        if (editingCalendarIndex > -1) {
            calendarEvents[editingCalendarIndex] = eventData;
            showAlert("活動已更新！", "完成");
        } else {
            calendarEvents.push(eventData);
            showAlert("活動已新增！", "成功");
        }

        saveData();
        closeCalendarModal();
        renderCalendar(); 
    } else {
        showAlert("請至少輸入起始日期與名稱");
    }
}

// 在編輯 Modal 中點擊刪除目前的活動
function deleteCalendarEventFromModal() {
    if (editingCalendarIndex > -1) {
        showConfirm("確定要刪除此活動嗎？").then(ok => {
            if (ok) {
                calendarEvents.splice(editingCalendarIndex, 1);
                saveData();
                closeCalendarModal();
                renderCalendar();
                showAlert("已刪除");
            }
        });
    }
}

// 從列表視圖中直接刪除指定的活動
function deleteCalendarEvent(index) {
    if (!isCalendarEditMode) {
        if (window.showAlert) showAlert("目前為「🔒 唯讀模式」\n若要刪除活動，請先切換至編輯狀態。");
        return;
    }
    
    const doDelete = () => {
        calendarEvents.splice(index, 1);
        saveData();
        renderCalendar();
    };

    if(window.showConfirm) {
        showConfirm("確定刪除此活動？").then(ok => { if(ok) doDelete(); });
    } else {
        if(confirm("確定刪除此活動？")) doDelete();
    }
}