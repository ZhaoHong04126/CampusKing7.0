/* ========================================================================== */
/* 📌 紀念日列表渲染與狀態顯示 (Anniversary Rendering & Status)                 */
/* ========================================================================== */

// 渲染紀念日列表的主函式，計算剩餘天數並根據狀態給予不同顏色與文字
function renderAnniversaries() {
    const listDiv = document.getElementById('anniversary-list');
    
    if (!listDiv) return;

    anniversaryList.sort((a, b) => new Date(a.date) - new Date(b.date));

    let html = '';
    const now = new Date();
    now.setHours(0,0,0,0);

    if (anniversaryList.length === 0) {
        html = '<p style="color:#999; text-align:center; padding: 20px;">💝 新增第一個到數日吧！<br>(例如：交往紀念、生日倒數)</p>';
    } else {
        anniversaryList.forEach((item, index) => {
            const targetDate = new Date(item.date);
            targetDate.setHours(0,0,0,0);
            
            const diffTime = now - targetDate;
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            
            let statusText = "";
            let daysText = "";
            let colorClass = "";

            if (diffDays === 0) {
                statusText = "就是今天！";
                daysText = "TODAY";
                colorClass = "color: #e74c3c; font-weight:bold;"; // 紅色
            } else if (diffDays > 0) {
                statusText = "已過去";
                daysText = `${diffDays} 天`;
                colorClass = "color: #7f8c8d;"; // 灰色
            } else {
                statusText = "還有";
                daysText = `${Math.abs(diffDays)} 天`; // 取絕對值
                colorClass = "color: #27ae60; font-weight:bold;"; // 綠色
            }

            html += `
            <div style="background: white; border-bottom: 1px solid #eee; padding: 15px 0; display:flex; align-items:center; justify-content:space-between;">
                <div>
                    <div style="font-size: 1.1rem; font-weight: bold; color: var(--text-main); margin-bottom: 4px;">${item.title}</div>
                    <div style="font-size: 0.85rem; color: #888;">${item.date} (${statusText})</div>
                </div>
                <div style="text-align:right;">
                    <div style="font-size: 1.4rem; ${colorClass}">${daysText}</div>
                    <button onclick="deleteAnniversary(${index})" style="background:transparent; border:none; color:#e74c3c; font-size:0.8rem; cursor:pointer; margin-top:5px; opacity: 0.7;">🗑️ 刪除</button>
                </div>
            </div>`;
        });
    }
    
    listDiv.innerHTML = html;
}



/* ========================================================================== */
/* 📌 紀念日新增與刪除操作 (Anniversary CRUD Operations)                        */
/* ========================================================================== */

// 開啟新增紀念日的輸入視窗，並清空先前的輸入內容
function openAnniversaryModal() {
    document.getElementById('anniversary-modal').style.display = 'flex';
    document.getElementById('input-anniv-title').value = '';
    document.getElementById('input-anniv-date').value = '';
}

// 關閉新增紀念日的輸入視窗
function closeAnniversaryModal() {
    document.getElementById('anniversary-modal').style.display = 'none';
}

// 讀取輸入資料並新增紀念日至陣列中，隨後存檔並重新渲染
function addAnniversary() {
    const title = document.getElementById('input-anniv-title').value;
    const date = document.getElementById('input-anniv-date').value;

    if (!title || !date) {
        showAlert("請輸入標題與日期", "資料不全");
        return;
    }

    anniversaryList.push({ title, date });
    saveData();
    closeAnniversaryModal();
    renderAnniversaries();
    showAlert("紀念日已新增！", "成功");
}

// 刪除指定的紀念日紀錄
function deleteAnniversary(index) {
    showConfirm("確定要刪除這個紀念日嗎？", "刪除確認").then(ok => {
        if (ok) {
            anniversaryList.splice(index, 1);
            saveData();
            renderAnniversaries();
        }
    });
}