/* ========================================================================== */
/* 📌 筆記列表渲染 (Notes Rendering)                                            */
/* ========================================================================== */

// 渲染快速筆記列表，並將換行符號轉換為 HTML 的 <br> 標籤以正常顯示
function renderNotes() {
    const listDiv = document.getElementById('notes-list');
    if (!listDiv) return;

    quickNotes.sort((a, b) => new Date(b.date) - new Date(a.date));

    let html = '';
    if (quickNotes.length === 0) {
        html = '<p style="color:#999; text-align:center; padding: 20px;">📝 這裡還沒有筆記，記點什麼吧！</p>';
    } else {
        quickNotes.forEach((note, index) => {
            const contentHtml = note.content.replace(/\n/g, '<br>');
            html += `
            <div style="background: white; border-bottom: 1px solid #eee; padding: 15px 0;">
                <div style="display:flex; justify-content:space-between; margin-bottom: 8px;">
                    <span style="font-size: 0.85rem; color: #888;">${note.date}</span>
                    <button onclick="deleteNote(${index})" style="background:transparent; border:none; color:#e74c3c; cursor:pointer;">🗑️ 刪除</button>
                </div>
                <div style="font-size: 1rem; line-height: 1.5; color: var(--text-main); white-space: pre-wrap;">${note.content}</div>
            </div>`;
        });
    }
    listDiv.innerHTML = html;
}



/* ========================================================================== */
/* 📌 筆記視窗控制與操作 (Notes Modal & Operations)                             */
/* ========================================================================== */

// 開啟新增筆記的輸入視窗，清空內容並自動對焦在輸入框
function openNoteModal() {
    document.getElementById('note-modal').style.display = 'flex';
    document.getElementById('input-note-content').value = '';
    document.getElementById('input-note-content').focus();
}

// 關閉新增筆記的輸入視窗
function closeNoteModal() {
    document.getElementById('note-modal').style.display = 'none';
}

// 讀取輸入內容並新增一筆帶有當下時間標記的筆記
function addNote() {
    const content = document.getElementById('input-note-content').value;
    
    if (!content.trim()) {
        showAlert("請輸入內容", "無法新增");
        return;
    }

    const now = new Date();
    const timeStr = `${now.getFullYear()}/${now.getMonth()+1}/${now.getDate()} ${now.getHours()}:${(now.getMinutes()<10?'0':'')+now.getMinutes()}`;

    quickNotes.push({
        content: content,
        date: timeStr
    });

    saveData();
    closeNoteModal();
    renderNotes();
    showAlert("筆記已儲存！", "完成");
}

// 刪除指定的筆記項目
function deleteNote(index) {
    showConfirm("確定要刪除這條筆記嗎？", "刪除確認").then(ok => {
        if (ok) {
            quickNotes.splice(index, 1);
            saveData();
            renderNotes();
        }
    });
}