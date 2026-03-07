/* ========================================================================== */
/* 📌 全域變數與模式切換 (Global Variables & Mode Toggle)                       */
/* ========================================================================== */

// 記錄目前正在編輯的成績計算筆記索引 (-1 代表新增模式)
let editingGcIndex = -1;

// 記錄計算筆記頁面是否為編輯模式
let isGradeCalcEditMode = false; 

// 切換筆記列表的「唯讀 / 編輯」模式
window.toggleGradeCalcEditMode = function() {
    const btn = document.getElementById('btn-toggle-gc-edit');
    const addBtn = document.getElementById('btn-add-gc');

    if (isGradeCalcEditMode) {
        isGradeCalcEditMode = false;
        if (btn) {
            btn.innerHTML = "🔒 唯讀模式";
            btn.style.color = "#888";
            btn.style.borderColor = "#ddd";
            btn.style.background = "transparent";
        }
        if (addBtn) addBtn.style.display = "none";
        renderGradeCalc(); 
    } else {
        if (window.showConfirm) {
            showConfirm("確定要開啟編輯模式嗎？\n\n開啟後您可以新增、修改或刪除計算筆記。", "✏️ 進入編輯模式")
            .then(ok => {
                if (ok) {
                    isGradeCalcEditMode = true;
                    if (btn) {
                        btn.innerHTML = "✏️ 編輯模式";
                        btn.style.color = "var(--primary)";
                        btn.style.borderColor = "var(--primary)";
                        btn.style.background = "#e6f0ff";
                    }
                    if (addBtn) addBtn.style.display = "block";
                    renderGradeCalc(); 
                }
            });
        } else {
            if (confirm("確定要開啟編輯模式嗎？\n\n開啟後您可以新增、修改或刪除計算筆記。")) {
                isGradeCalcEditMode = true;
                if (btn) {
                    btn.innerHTML = "✏️ 編輯模式";
                    btn.style.color = "var(--primary)";
                    btn.style.borderColor = "var(--primary)";
                    btn.style.background = "#e6f0ff";
                }
                if (addBtn) addBtn.style.display = "block";
                renderGradeCalc();
            }
        }
    }
}



/* ========================================================================== */
/* 📌 筆記列表渲染與顯示 (Note Rendering)                                       */
/* ========================================================================== */

// 渲染所有的成績計算筆記列表
function renderGradeCalc() {
    const listDiv = document.getElementById('grade-calc-list');
    if (!listDiv) return;

    let html = '';
    if (gradeCalcNotes.length === 0) {
        html = `
        <div style="text-align:center; padding:30px; color:#999;">
            <div style="font-size:3rem; margin-bottom:10px;">🧮</div>
            <p>目前沒有成績計算筆記<br>把各科的配分方式記下來吧！</p>
        </div>`;
    } else {
        const actionDisplay = isGradeCalcEditMode ? 'flex' : 'none';

        gradeCalcNotes.forEach((item, index) => {
            const formulaHtml = item.formula.split('\n').map(f => {
                const parts = f.split('||');
                const name = parts[0] || '';
                const weight = parts[1] ? `<span style="color:var(--primary); font-weight:bold;">${parts[1]}</span>` : '';
                
                return `
                <div style="display:flex; justify-content:space-between; background: white; border: 1px solid #ddd; border-radius: 4px; padding: 6px 10px; margin-bottom: 5px; font-size: 0.9rem; color: #555;">
                    <span>${name}</span>
                    <span>${weight}</span>
                </div>`;
            }).join('');
            
            const remarkHtml = item.remark ? item.remark.split('\n').map(r => `<div style="font-size:0.85rem; color:#888; margin-top: 6px;">💡 ${r}</div>`).join('') : '';
            
            html += `
            <div class="card" style="margin-bottom: 12px; padding: 15px; border-left: 5px solid #9b59b6;">
                <div style="display:flex; justify-content:space-between; align-items:start;">
                    <div style="flex: 1;">
                        <div style="font-weight:bold; font-size:1.1rem; color:var(--text-main); margin-bottom: 8px;">
                            ${item.subject}
                        </div>
                        <div style="margin-bottom: 5px; background: #f9f9f9; padding: 10px; border-radius: 6px; border: 1px solid #eee;">
                            ${formulaHtml}
                        </div>
                        ${remarkHtml}
                    </div>
                    <div style="display:${actionDisplay}; gap: 5px; margin-left: 10px; flex-direction: column;">
                        <button onclick="editGradeCalcNote(${index})" style="background:transparent; border:none; color:#f39c12; cursor:pointer; font-size:1rem; padding: 4px;">✏️</button>
                        <button onclick="deleteGradeCalcNote(${index})" style="background:transparent; border:none; color:#ccc; cursor:pointer; font-size:1rem; padding: 4px;">🗑️</button>
                    </div>
                </div>
            </div>`;
        });
    }
    listDiv.innerHTML = html;
}



/* ========================================================================== */
/* 📌 動態輸入框產生與控制 (Dynamic Input Fields)                               */
/* ========================================================================== */

// 在新增/編輯視窗中，動態產生左右兩格的配分輸入框
function renderGradeCalcFormulaInputs(formulas = []) {
    const container = document.getElementById('gc-formula-container');
    if (!container) return;
    container.innerHTML = '';
    
    const count = Math.max(3, formulas.length);
    
    for (let i = 0; i < count; i++) {
        let itemName = '';
        let itemWeight = '';
        if (formulas[i]) {
            const parts = formulas[i].split('||');
            if (parts.length === 1 && parts[0]) {
                itemName = parts[0]; 
            } else {
                itemName = parts[0] || '';
                itemWeight = parts[1] || '';
            }
        }
        
        container.innerHTML += `
        <div style="display: flex; gap: 8px; margin-bottom: 8px;">
            <input type="text" class="gc-formula-item" placeholder="項目名稱" value="${itemName}" style="flex: 2; padding: 8px; border: 1px solid #ddd; border-radius: 6px; box-sizing: border-box; font-size: 1rem;">
            <input type="text" class="gc-formula-weight" placeholder="配分" value="${itemWeight}" style="flex: 1; padding: 8px; border: 1px solid #ddd; border-radius: 6px; box-sizing: border-box; font-size: 1rem;">
        </div>`;
    }
}

// 點擊新增配分按鈕時，動態多加一列公式輸入框
window.addGradeCalcFormulaInput = function() {
    const container = document.getElementById('gc-formula-container');
    if (!container) return;
    container.insertAdjacentHTML('beforeend', `
    <div style="display: flex; gap: 8px; margin-bottom: 8px;">
        <input type="text" class="gc-formula-item" placeholder="項目名稱" style="flex: 2; padding: 8px; border: 1px solid #ddd; border-radius: 6px; box-sizing: border-box; font-size: 1rem;">
        <input type="text" class="gc-formula-weight" placeholder="配分" style="flex: 1; padding: 8px; border: 1px solid #ddd; border-radius: 6px; box-sizing: border-box; font-size: 1rem;">
    </div>`);
}

// 動態產生底部的補充說明輸入框
function renderGradeCalcRemarkInputs(remarks = []) {
    const container = document.getElementById('gc-remark-container');
    if (!container) return;
    container.innerHTML = '';
    
    const count = Math.max(1, remarks.length);
    
    for (let i = 0; i < count; i++) {
        const val = remarks[i] || '';
        container.innerHTML += `<input type="text" class="gc-remark-input" placeholder="補充說明 (選填)..." value="${val}" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 6px; box-sizing: border-box; margin-bottom: 8px; font-size: 1rem;">`;
    }
}

// 點擊新增備註按鈕時，動態多加一列補充說明輸入框
window.addGradeCalcRemarkInput = function() {
    const container = document.getElementById('gc-remark-container');
    if (!container) return;
    container.insertAdjacentHTML('beforeend', `<input type="text" class="gc-remark-input" placeholder="補充說明 (選填)..." style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 6px; box-sizing: border-box; margin-bottom: 8px; font-size: 1rem;">`);
}

// 從課表中自動抓取科目名稱，並更新視窗的下拉選單
function updateGradeCalcSubjectOptions() {
    const select = document.getElementById('input-gc-subject-select');
    if (!select) return;

    select.innerHTML = '<option value="" disabled selected>請選擇科目</option>';
    
    let subjects = new Set();
    if (typeof weeklySchedule !== 'undefined') {
        Object.values(weeklySchedule).forEach(day => {
            day.forEach(c => {
                if(c.subject) subjects.add(c.subject);
            });
        });
    }

    subjects.forEach(s => {
        const opt = document.createElement('option');
        opt.value = s;
        opt.innerText = s;
        select.appendChild(opt);
    });
}

// 切換科目輸入欄位 (下拉選單 自動 / 文字 手寫 模式)
window.toggleGradeCalcSubjectMode = function() {
    const selectEl = document.getElementById('input-gc-subject-select');
    const textEl = document.getElementById('input-gc-subject-text');
    const btn = document.getElementById('btn-toggle-gc-input');

    if (selectEl.style.display !== 'none') {
        selectEl.style.display = 'none';
        textEl.style.display = 'block';
        textEl.focus();
        btn.innerText = "📜";
    } else {
        selectEl.style.display = 'block';
        textEl.style.display = 'none';
        btn.innerText = "✏️";
    }
}



/* ========================================================================== */
/* 📌 筆記新增修改與刪除 (Note CRUD Operations)                                 */
/* ========================================================================== */

// 開啟新增筆記視窗，並預先填入預設的配分項目
function openGradeCalcModal() {
    if (!isGradeCalcEditMode) {
        if (window.showAlert) showAlert("目前為「🔒 唯讀模式」\n若要新增，請先點擊右上角的按鈕切換至編輯狀態。");
        return;
    }

    editingGcIndex = -1;
    document.getElementById('grade-calc-modal-title').innerText = "➕ 新增計算筆記";
    
    const btnSave = document.getElementById('btn-save-gc');
    if (btnSave) {
        btnSave.innerText = "+ 儲存";
        btnSave.style.background = "var(--primary)";
    }
    
    updateGradeCalcSubjectOptions();
    const selectEl = document.getElementById('input-gc-subject-select');
    const textEl = document.getElementById('input-gc-subject-text');
    const toggleBtn = document.getElementById('btn-toggle-gc-input');
    
    selectEl.style.display = 'block';
    selectEl.value = '';
    textEl.style.display = 'none';
    textEl.value = '';
    toggleBtn.innerText = "✏️";
    
    const defaultFormulas = ["平時作業||30%", "期中考||30%", "期末考||40%"];
    renderGradeCalcFormulaInputs(defaultFormulas); 
    
    renderGradeCalcRemarkInputs([]);
    
    document.getElementById('grade-calc-modal').style.display = 'flex';
}

// 關閉新增/編輯筆記視窗
function closeGradeCalcModal() {
    document.getElementById('grade-calc-modal').style.display = 'none';
}

// 將編輯後的筆記資料打包寫入陣列並存檔
function saveGradeCalcNote() {
    const selectEl = document.getElementById('input-gc-subject-select');
    const textEl = document.getElementById('input-gc-subject-text');
    let subject = (selectEl.style.display !== 'none') ? selectEl.value : textEl.value;
    subject = subject ? subject.trim() : "";
    
    const remarkInputs = document.querySelectorAll('.gc-remark-input');
    const remarkArr = [];
    remarkInputs.forEach(input => {
        if (input.value.trim() !== '') {
            remarkArr.push(input.value.trim());
        }
    });
    const remark = remarkArr.join('\n');
    
    const itemInputs = document.querySelectorAll('.gc-formula-item');
    const weightInputs = document.querySelectorAll('.gc-formula-weight');
    const formulaArr = [];
    
    for (let i = 0; i < itemInputs.length; i++) {
        const itemVal = itemInputs[i].value.trim();
        const weightVal = weightInputs[i].value.trim();
        if (itemVal !== '' || weightVal !== '') {
            formulaArr.push(`${itemVal}||${weightVal}`);
        }
    }
    
    const formula = formulaArr.join('\n');

    if (!subject || formulaArr.length === 0) {
        if (window.showAlert) showAlert("請填寫「科目」並至少輸入一項「項目或配分」！");
        return;
    }

    const noteData = { subject, formula, remark };

    if (editingGcIndex > -1) {
        gradeCalcNotes[editingGcIndex] = noteData;
        if (window.showAlert) showAlert("計算筆記已更新！", "完成");
    } else {
        gradeCalcNotes.push(noteData);
        if (window.showAlert) showAlert("計算筆記已新增！", "成功");
    }

    saveData();
    closeGradeCalcModal();
    renderGradeCalc();
}

// 進入指定筆記的編輯模式，並回填舊資料至輸入框中
function editGradeCalcNote(index) {
    if (!isGradeCalcEditMode) return; 
    
    editingGcIndex = index;
    const item = gradeCalcNotes[index];
    
    document.getElementById('grade-calc-modal-title').innerText = "✏️ 編輯計算筆記";
    const btnSave = document.getElementById('btn-save-gc');
    if (btnSave) {
        btnSave.innerText = "💾 儲存修改";
        btnSave.style.background = "#f39c12";
    }
    
    updateGradeCalcSubjectOptions();
    const selectEl = document.getElementById('input-gc-subject-select');
    const textEl = document.getElementById('input-gc-subject-text');
    const toggleBtn = document.getElementById('btn-toggle-gc-input');
    
    let optionExists = false;
    for (let i = 0; i < selectEl.options.length; i++) {
        if (selectEl.options[i].value === item.subject) {
            optionExists = true;
            break;
        }
    }

    if (optionExists) {
        selectEl.style.display = 'block';
        textEl.style.display = 'none';
        selectEl.value = item.subject;
        toggleBtn.innerText = "✏️";
    } else {
        selectEl.style.display = 'none';
        textEl.style.display = 'block';
        textEl.value = item.subject || '';
        toggleBtn.innerText = "📜";
    }
    
    const formulas = item.formula ? item.formula.split('\n') : [];
    renderGradeCalcFormulaInputs(formulas);
    
    const remarks = item.remark ? item.remark.split('\n') : [];
    renderGradeCalcRemarkInputs(remarks);
    
    document.getElementById('grade-calc-modal').style.display = 'flex';
}

// 刪除指定的成績計算筆記
function deleteGradeCalcNote(index) {
    if (!isGradeCalcEditMode) return; 
    
    if (window.showConfirm) {
        showConfirm("確定要刪除這則計算筆記嗎？").then(ok => {
            if (ok) {
                gradeCalcNotes.splice(index, 1);
                saveData();
                renderGradeCalc();
            }
        });
    } else {
        if(confirm("確定要刪除這則計算筆記嗎？")) {
            gradeCalcNotes.splice(index, 1);
            saveData();
            renderGradeCalc();
        }
    }
}