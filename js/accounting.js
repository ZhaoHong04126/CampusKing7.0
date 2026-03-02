/* ========================================================================== */
/* 📌 記帳狀態與全域變數 (Accounting State & Variables)                         */
/* ========================================================================== */

// 定義目前選中的記帳分頁，預設為 'summary' (總覽)
let currentAccTab = 'summary';

// 紀錄目前正在編輯的記帳資料索引 (-1 代表新增模式)
let editingAccountingIndex = -1; 

// 紀錄帳戶頁面是否處於編輯模式
let isAccAccountsEditMode = false;

// 紀錄明細頁面是否處於編輯模式
let isAccDetailsEditMode = false;

// 支出分類圓餅圖的 Chart.js 實例暫存
let categoryChartInstance = null; 



/* ========================================================================== */
/* 📌 記帳主畫面與分頁切換 (Main Rendering & Tab Switching)                     */
/* ========================================================================== */

// 渲染記帳頁面的主函式，計算總收支與結餘並更新對應畫面
function renderAccounting() {
    let totalIncome = 0;
    let totalExpense = 0;
    updatePaymentMethodOptions();
    
    accountingList.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    accountingList.forEach(item => {
        const amount = parseInt(item.amount);
        if (item.type === 'income') totalIncome += amount;
        else if (item.type === 'expense') totalExpense += amount;
    });

    const summaryIncome = document.getElementById('acc-summary-income');
    const summaryExpense = document.getElementById('acc-summary-expense');
    const summaryBalance = document.getElementById('acc-summary-balance');
    
    if (summaryIncome) {
        summaryIncome.innerText = `$${totalIncome}`;
        summaryExpense.innerText = `$${totalExpense}`;
        const balance = totalIncome - totalExpense;
        summaryBalance.innerText = `$${balance}`;
        summaryBalance.style.color = balance >= 0 ? '#2ecc71' : '#e74c3c';
    }

    if (currentAccTab === 'details') renderAccDetails();
    else if (currentAccTab === 'stats') {
        renderAccChart();
        renderAccDaily();
        renderCategoryChart();
    }
    else if (currentAccTab === 'accounts') renderAccAccounts();
}

// 切換記帳頁面的各個子分頁 (總覽、明細、統計、帳戶)
function switchAccTab(tabName) {
    currentAccTab = tabName;
    
    const tabs = ['summary', 'details', 'stats', 'accounts'];
    tabs.forEach(t => {
        const btn = document.getElementById(`btn-acc-${t}`);
        const view = document.getElementById(`view-acc-${t}`);
        if (btn) btn.classList.remove('active'); 
        if (view) view.style.display = 'none';
    });

    const activeBtn = document.getElementById(`btn-acc-${tabName}`);
    const activeView = document.getElementById(`view-acc-${tabName}`);
    if (activeBtn) activeBtn.classList.add('active');
    if (activeView) activeView.style.display = 'block';

    renderAccounting();
}



/* ========================================================================== */
/* 📌 收支明細與交易管理 (Transaction Details & Management)                     */
/* ========================================================================== */

// 渲染收支明細的列表畫面
function renderAccDetails() {
    const listBody = document.getElementById('accounting-list-body');
    if (!listBody) return;
    listBody.innerHTML = '';

    const colSpan = isAccDetailsEditMode ? 6 : 5;

    if (accountingList.length === 0) {
        listBody.innerHTML = `<tr><td colspan="${colSpan}" class="no-class">💰 目前無收支紀錄</td></tr>`;
        return;
    }

    accountingList.forEach((item, index) => {
        const amount = parseInt(item.amount) || 0;
        let typeLabel = '';
        let amountColor = '';
        let sign = '';
        let methodHtml = '';

        if (item.type === 'transfer') {
            typeLabel = '<span style="background:#3498db; color:white; padding:2px 6px; border-radius:4px; font-size:0.75rem;">轉帳</span>';
            amountColor = 'color: #3498db;';
            sign = '';
            methodHtml = `
                <span style="font-size:0.85rem; color:#555;">
                    ${item.method} ➝ ${item.to_method}
                </span>`;
        } else {
            typeLabel = '';
            amountColor = item.type === 'income' ? 'color: #2ecc71;' : 'color: #e74c3c;';
            sign = item.type === 'income' ? '+' : '-';
            methodHtml = `<span style="background-color: #f3e5f5; color: #8e24aa; padding: 2px 8px; border-radius: 4px; font-size: 0.85rem;">${item.method || '現金'}</span>`;
        }

        let actionTd = '';
        if (isAccDetailsEditMode) {
            actionTd = `
                <td>
                    <div style="display: flex; justify-content: center; gap: 8px; flex-wrap: nowrap;">
                        <button class="btn-edit" onclick="editTransaction(${index})" style="padding: 6px 12px; margin: 0; font-size: 0.9rem;">✏️</button>
                        <button class="btn-delete" onclick="deleteTransaction(${index})" style="padding: 6px 12px; margin: 0; font-size: 0.9rem;">🗑️</button>
                    </div>
                </td>
            `;
        }

        let categoryBadge = '<span style="color:#aaa;">-</span>'; 
        if (item.category && item.type !== 'transfer') {
            categoryBadge = `<span style="background:#f5f5f5; color:#666; border: 1px solid #ddd; padding:2px 6px; border-radius:4px; font-size:0.75rem;">${item.category}</span>`;
        }

        listBody.innerHTML += `
            <tr>
                <td>${item.date}</td>
                <td>${categoryBadge}</td>
                <td style="text-align: left;">${typeLabel} ${item.title}</td>
                <td>${methodHtml}</td> 
                <td style="font-weight:bold; ${amountColor}">${sign}$${amount}</td>
                ${actionTd}
            </tr>
        `;
    });
}

// 切換明細頁面的「編輯/唯讀」模式，並防呆確認
function toggleAccDetailsEditMode() {
    const btn = document.getElementById('btn-toggle-acc-details-edit');
    const thAction = document.getElementById('th-acc-details-action');
    if (!btn) return;

    if (isAccDetailsEditMode) {
        isAccDetailsEditMode = false;
        btn.innerHTML = "🔒 唯讀模式";
        btn.style.color = "#888";
        btn.style.borderColor = "#ddd";
        btn.style.background = "transparent";
        if (thAction) thAction.style.display = "none";
        renderAccDetails(); 
    } 
    else {
        showConfirm("確定要開啟編輯模式嗎？\n\n開啟後您可以修改或刪除記帳明細。", "✏️ 進入編輯模式")
        .then(ok => {
            if (ok) {
                isAccDetailsEditMode = true;
                btn.innerHTML = "✏️ 編輯模式";
                btn.style.color = "var(--primary)";
                btn.style.borderColor = "var(--primary)";
                btn.style.background = "#e6f0ff";
                if (thAction) thAction.style.display = "table-cell";
                renderAccDetails(); 
            }
        });
    }
}

// 開啟新增記帳/轉帳的彈出視窗，並初始化預設狀態
function openAccountingModal() {
    document.getElementById('accounting-modal').style.display = 'flex';
    document.getElementById('input-acc-date').value = new Date().toISOString().split('T')[0];
    document.getElementById('input-acc-type').value = 'expense';
    document.getElementById('input-acc-method').value = '現金';
    
    if (typeof updatePaymentMethodOptions === 'function') updatePaymentMethodOptions();

    editingAccountingIndex = -1;
    
    const btnAddRow = document.getElementById('btn-add-acc-row');
    if (btnAddRow) btnAddRow.style.display = 'block';

    toggleAccType(); 
    
    const btn = document.getElementById('btn-save-acc');
    if (btn) {
        btn.innerText = "+ 確定新增";
        btn.style.background = "#333";
    }
}

// 關閉新增或編輯記帳的彈出視窗
function closeAccountingModal() {
    document.getElementById('accounting-modal').style.display = 'none';
}

// 根據記帳類型 (收入/支出) 產生對應的分類下拉選項 HTML
function getAccCategoryOptionsHtml(type, selectedCategory) {
    if(type === 'transfer') return '';
    let html = '';
    const options = [...(accCategories[type] || ["其他"])];
    if (selectedCategory && !options.includes(selectedCategory)) {
        options.push(selectedCategory);
    }
    options.forEach(cat => {
        const sel = (cat === selectedCategory) ? 'selected' : '';
        html += `<option value="${cat}" ${sel}>${cat}</option>`;
    });
    return html;
}

// 動態新增一列記帳輸入框 (支援多筆一次新增)
window.appendAccItemRow = function(title = '', category = '', amount = '', isTransfer = false) {
    const container = document.getElementById('acc-items-container');
    if (!container) return;
    
    const type = document.getElementById('input-acc-type').value;
    const _isTransfer = isTransfer || (type === 'transfer');
    const optionsHtml = getAccCategoryOptionsHtml(type, category);
    const catDisplay = _isTransfer ? 'none' : 'block';
    const placeholder = _isTransfer ? '例如：提款、儲值 (選填)' : '例如：早餐、文具';

    const rowHtml = `
        <div class="acc-item-row" style="display: flex; gap: 8px; align-items: center; background: #fdfdfd; padding: 10px; border: 1px solid #eee; border-radius: 8px;">
            <input type="text" class="acc-title-input" placeholder="${placeholder}" value="${title}" style="flex: 2; min-width: 120px; padding: 8px; border: 1px solid #ddd; border-radius: 6px; box-sizing: border-box; font-size: 0.95rem; margin-bottom: 0;">
            
            <select class="acc-category-select" style="display: ${catDisplay}; flex: 1.5; min-width: 90px; padding: 8px; border: 1px solid #ddd; border-radius: 6px; background: white; font-size: 0.95rem; margin-bottom: 0;">
                ${optionsHtml}
            </select>
            
            <input type="number" class="acc-amount-input" placeholder="金額" value="${amount}" style="flex: 1.5; min-width: 80px; padding: 8px; border: 1px solid #ddd; border-radius: 6px; box-sizing: border-box; font-size: 0.95rem; margin-bottom: 0;">
            
            <button class="btn-remove-acc-row" onclick="this.parentElement.remove()" style="background: transparent; color: #ccc; border: none; padding: 4px; cursor: pointer; font-size: 1.2rem; display: flex; align-items: center; justify-content: center; transition: 0.2s; min-width: 30px; margin-bottom: 0;" onmouseover="this.style.color='#e74c3c'" onmouseout="this.style.color='#ccc'">✖</button>
        </div>
    `;
    container.insertAdjacentHTML('beforeend', rowHtml);
}

// 處理記帳或轉帳資料的儲存邏輯 (包含驗證與寫入陣列)
function addTransaction() {
    const dateEl = document.getElementById('input-acc-date');
    const typeEl = document.getElementById('input-acc-type');
    const methodEl = document.getElementById('input-acc-method');
    const toMethodEl = document.getElementById('input-acc-to-method');

    if (!dateEl) return;

    const date = dateEl.value;
    const type = typeEl ? typeEl.value : 'expense';
    const method = methodEl ? methodEl.value : '現金';
    const toMethod = toMethodEl ? toMethodEl.value : ''; 

    if (!date) {
        showAlert("請輸入日期", "資料不全");
        return;
    }

    if (type === 'transfer' && method === toMethod) {
        showAlert("轉出與轉入帳戶不能相同！");
        return;
    }

    const rows = document.querySelectorAll('.acc-item-row');
    if (rows.length === 0) {
        showAlert("請至少保留一筆資料輸入框！");
        return;
    }

    const newItems = [];
    let hasError = false;

    rows.forEach(row => {
        let title = row.querySelector('.acc-title-input').value.trim();
        const amountStr = row.querySelector('.acc-amount-input').value;
        const amount = parseInt(amountStr);
        const categorySelect = row.querySelector('.acc-category-select');
        const category = categorySelect ? categorySelect.value : '其他';

        if (isNaN(amount) || amount <= 0) hasError = true;
        if (type === 'transfer' && !title) title = "轉帳"; 
        if (type !== 'transfer' && !title) hasError = true;

        newItems.push({
            date: date,
            title: title,
            category: type === 'transfer' ? null : category,
            amount: amount,
            type: type,
            method: method,
            to_method: type === 'transfer' ? toMethod : null
        });
    });

    if (hasError) {
        showAlert("請確認每筆資料的「項目名稱」與「金額」皆已填寫，且金額必須大於 0！", "資料不完整");
        return;
    }

    if (editingAccountingIndex > -1) {
        accountingList[editingAccountingIndex] = newItems[0]; 
        showAlert("修改成功！", "完成");
    } else {
        accountingList.push(...newItems); 
        showAlert(type === 'transfer' ? "轉帳成功！" : `成功新增 ${newItems.length} 筆紀錄！`, "完成");
    }

    saveData();
    closeAccountingModal();
    renderAccounting();
}

// 準備編輯指定的交易紀錄，並將資料回填至視窗中
function editTransaction(index) {
    showConfirm("確定要更改這筆紀錄嗎？", "更改確認").then(ok => {
        if (ok) {
            const item = accountingList[index];
            document.getElementById('accounting-modal').style.display = 'flex'; 
            
            document.getElementById('input-acc-date').value = item.date;
            document.getElementById('input-acc-type').value = item.type;
            if (item.type === 'transfer') {
                document.getElementById('input-acc-to-method').value = item.to_method;
            }
            document.getElementById('input-acc-method').value = item.method || '現金';

            editingAccountingIndex = index;

            const btn = document.getElementById('btn-save-acc');
            if (btn) {
                btn.innerText = "💾 保存修改";
                btn.style.background = "#f39c12"; 
            }

            const btnAddRow = document.getElementById('btn-add-acc-row');
            if (btnAddRow) btnAddRow.style.display = 'none';

            const toGroup = document.getElementById('group-acc-to-method');
            const methodLabel = document.getElementById('label-acc-method');
            if (item.type === 'transfer') {
                toGroup.style.display = 'block';
                if (methodLabel) methodLabel.innerText = "轉出帳戶 (扣款)";
            } else {
                toGroup.style.display = 'none';
                if (methodLabel) methodLabel.innerText = "支付方式";
            }

            const container = document.getElementById('acc-items-container');
            if (container) {
                container.innerHTML = '';
                appendAccItemRow(item.title, item.category, item.amount, item.type === 'transfer');
                
                const removeBtn = container.querySelector('.btn-remove-acc-row');
                if(removeBtn) removeBtn.style.display = 'none';
            }
        }
    });
}

// 刪除指定的交易紀錄並存檔
function deleteTransaction(index) {
    showConfirm("確定要刪除這筆紀錄嗎？", "刪除確認").then(ok => {
            if (ok) {
            accountingList.splice(index, 1);
            saveData();
            renderAccounting();
        }
    });
}

// 根據選擇的記帳類型 (如轉帳) 動態切換顯示的輸入欄位
function toggleAccType() {
    const type = document.getElementById('input-acc-type').value;
    const toGroup = document.getElementById('group-acc-to-method');
    const methodLabel = document.getElementById('label-acc-method');
    
    if (type === 'transfer') {
        toGroup.style.display = 'block';
        if (methodLabel) methodLabel.innerText = "轉出帳戶 (扣款)";
    } else {
        toGroup.style.display = 'none';
        if (methodLabel) methodLabel.innerText = "支付方式";
    }
    
    const currentRows = [];
    const existingRows = document.querySelectorAll('.acc-item-row');
    
    existingRows.forEach(row => {
        const titleInput = row.querySelector('.acc-title-input');
        const amountInput = row.querySelector('.acc-amount-input');
        currentRows.push({
            title: titleInput ? titleInput.value : '',
            amount: amountInput ? amountInput.value : ''
        });
    });

    if (currentRows.length === 0) currentRows.push({ title: '', amount: '' });

    const container = document.getElementById('acc-items-container');
    if (container) {
        container.innerHTML = '';
        currentRows.forEach(item => {
            appendAccItemRow(item.title, '', item.amount, type === 'transfer');
        });
        
        if (editingAccountingIndex > -1) {
             const removeBtn = container.querySelector('.btn-remove-acc-row');
             if(removeBtn) removeBtn.style.display = 'none';
        }
    }
}



/* ========================================================================== */
/* 📌 圖表與統計渲染 (Charts & Statistics)                                      */
/* ========================================================================== */

// 渲染每月的收支長條圖與結餘折線圖 (Chart.js)
function renderAccChart() {
    const ctx = document.getElementById('accountingChart');
    if (!ctx) return;

    const monthlyData = {};
    const allMonths = new Set();

    accountingList.forEach(item => {
        const month = item.date.substring(0, 7);
        allMonths.add(month);
        if (!monthlyData[month]) monthlyData[month] = { income: 0, expense: 0 };
        
        const amount = parseInt(item.amount) || 0;

        if (item.type === 'income') monthlyData[month].income += amount;
        else monthlyData[month].expense += amount;
    });

    const sortedMonths = Array.from(allMonths).sort();
    const labels = sortedMonths;
    const dataIncome = sortedMonths.map(m => monthlyData[m].income);
    const dataExpense = sortedMonths.map(m => monthlyData[m].expense);
    const dataBalance = sortedMonths.map(m => monthlyData[m].income - monthlyData[m].expense);

    if (accChartInstance) accChartInstance.destroy();

    accChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    type: 'line',
                    label: '結餘',
                    data: dataBalance,
                    borderColor: '#f1c40f',
                    borderWidth: 2,
                    fill: false,
                    tension: 0.1,
                    order: 0,
                },
                {
                    label: '收入',
                    data: dataIncome,
                    backgroundColor: 'rgba(46, 204, 113, 0.6)',
                    borderColor: '#2ecc71',
                    borderWidth: 1,
                    order: 1
                },
                {
                    label: '支出',
                    data: dataExpense,
                    backgroundColor: 'rgba(231, 76, 60, 0.6)',
                    borderColor: '#e74c3c',
                    borderWidth: 1,
                    order: 2
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: true }
            },
            plugins: {
                tooltip: { mode: 'index', intersect: false }
            }
        }
    });
}

// 渲染各支出分類比例的圓餅圖 (Chart.js)
function renderCategoryChart() {
    const ctx = document.getElementById('categoryChart');
    if (!ctx) return;

    const categoryData = {};
    let totalExpense = 0;

    accountingList.forEach(item => {
        if (item.type === 'expense') {
            const amount = parseInt(item.amount) || 0;
            const cat = item.category || '其他';
            if (!categoryData[cat]) categoryData[cat] = 0;
            categoryData[cat] += amount;
            totalExpense += amount;
        }
    });

    const noExpenseMsg = document.getElementById('no-expense-msg');
    
    if (totalExpense === 0) {
        if (categoryChartInstance) categoryChartInstance.destroy();
        if (noExpenseMsg) noExpenseMsg.style.display = 'block';
        return;
    } else {
        if (noExpenseMsg) noExpenseMsg.style.display = 'none';
    }

    const sortedCategories = Object.keys(categoryData).sort((a, b) => categoryData[b] - categoryData[a]);
    const labels = sortedCategories;
    const data = sortedCategories.map(cat => categoryData[cat]);
    
    const backgroundColors = [
        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
        '#FF9F40', '#8AC926', '#1982C4', '#6A4C93', '#F15BB5',
        '#E74C3C', '#2ECC71', '#3498DB', '#F39C12', '#9B59B6'
    ];

    const dynamicBackgroundColors = labels.map((cat, index) => {
        if (cat === "糊塗帳") {
            return '#7f8c8d';
        }
        return defaultColors[index % defaultColors.length];
    });

    if (categoryChartInstance) categoryChartInstance.destroy();

    categoryChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: dynamicBackgroundColors,
                borderWidth: 2,
                borderColor: '#ffffff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: { boxWidth: 12 }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            const percentage = Math.round((value / totalExpense) * 100);
                            return `${label}: $${value} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

// 渲染每日的收支統計列表
function renderAccDaily() {
    const listBody = document.getElementById('daily-acc-body');
    if (!listBody) return;
    listBody.innerHTML = '';

    const dailyData = {};
    
    accountingList.forEach(item => {
        const date = item.date;
        if (!dailyData[date]) dailyData[date] = { income: 0, expense: 0 };
        
        const amount = parseInt(item.amount) || 0;
        if (item.type === 'income') dailyData[date].income += amount;
        else dailyData[date].expense += amount;
    });

    const sortedDates = Object.keys(dailyData).sort((a, b) => new Date(b) - new Date(a));

    if (sortedDates.length === 0) {
        listBody.innerHTML = '<tr><td colspan="4" class="no-class">📅 無資料</td></tr>';
        return;
    }

    sortedDates.forEach(date => {
        const d = dailyData[date];
        const net = d.income - d.expense;
        const netColor = net >= 0 ? '#2ecc71' : '#e74c3c';
        const netSign = net >= 0 ? '+' : '';

        listBody.innerHTML += `
            <tr>
                <td>${date}</td>
                <td style="color:#2ecc71;">$${d.income}</td>
                <td style="color:#e74c3c;">$${d.expense}</td>
                <td style="font-weight:bold; color:${netColor};">${netSign}$${net}</td>
            </tr>
        `;
    });
}



/* ========================================================================== */
/* 📌 帳戶與分類管理 (Accounts & Categories Management)                         */
/* ========================================================================== */

// 渲染帳戶餘額列表與收支分類清單
function renderAccAccounts() {
    const listDiv = document.getElementById('acc-accounts-list');
    if (!listDiv) return;

    let html = '';
    const balances = {};
    paymentMethods.forEach(method => balances[method] = 0);

    accountingList.forEach(item => {
        const method = item.method || '現金';
        const amount = parseInt(item.amount) || 0;
        
        if (balances[method] === undefined) balances[method] = 0;
        
        if (item.type === 'income') {
            balances[method] += amount;
        } else if (item.type === 'expense') {
            balances[method] -= amount;
        } else if (item.type === 'transfer') {
            balances[method] -= amount; 
            const toMethod = item.to_method;
            if (toMethod) {
                if (balances[toMethod] === undefined) balances[toMethod] = 0;
                balances[toMethod] += amount;
            }
        }
    });

    paymentMethods.forEach((method, index) => {
        const bal = balances[method];
        const color = bal >= 0 ? '#2ecc71' : '#e74c3c';
        
        const btnDisplay = isAccAccountsEditMode ? 'block' : 'none';

        html += `
        <div style="display:flex; justify-content:space-between; align-items:center; padding: 15px 0; border-bottom: 1px solid #eee;">
            <div>
                <div style="font-size: 1rem; font-weight: bold; color: var(--text-main);">${method}</div>
                <div style="font-size: 0.85rem; color: #888;">本學期結餘</div>
            </div>
            <div style="text-align: right;">
                <div style="font-size: 1.1rem; font-weight:bold; color: ${color};">$${bal}</div>
                <div style="margin-top:5px; display: ${btnDisplay};">
                    <button onclick="editPaymentMethodBalance('${method}', ${bal})" style="background:transparent; border:none; color:#f39c12; cursor:pointer; font-size:0.8rem; margin-right:8px;">✏️ 校正餘額</button>
                    <button onclick="deletePaymentMethod(${index})" style="background:transparent; border:none; color:#e74c3c; cursor:pointer; font-size:0.8rem;">🗑️ 刪除</button>
                </div>
            </div>
        </div>`;
    });
    listDiv.innerHTML = html;

    const catDiv = document.getElementById('acc-categories-list');
    if (!catDiv) return;

    let catHtml = '';
    const renderCatList = (type, title, color) => {
        const btnDisplay = isAccAccountsEditMode ? 'block' : 'none'; 
        
        catHtml += `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; margin-top: 15px; border-bottom: 1px dashed #eee; padding-bottom: 5px;">
            <h4 style="color: ${color}; margin: 0; padding: 0; border: none;">${title}</h4>
            <button onclick="addNewAccCategory('${type}')" style="display: ${btnDisplay}; background: ${color}; color: white; border: none; padding: 4px 10px; border-radius: 6px; font-size: 0.8rem; cursor: pointer; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">+ 新增分類</button>
        </div>`;
        
        accCategories[type].forEach((cat, index) => {
            const btnDisplay = isAccAccountsEditMode ? 'block' : 'none';
            const deleteBtnHtml = cat !== '其他' 
                ? `<button onclick="deleteAccCategory('${type}', ${index})" style="background:transparent; border:none; color:#e74c3c; cursor:pointer; font-size:0.8rem;">🗑️ 刪除</button>` 
                : `<span style="font-size:0.75rem; color:#aaa;">(預設不可刪)</span>`;

            catHtml += `
            <div style="display:flex; justify-content:space-between; align-items:center; padding: 10px 0; border-bottom: 1px solid #f9f9f9;">
                <div style="font-size: 0.95rem; color: #555;">${cat}</div>
                <div style="display: ${btnDisplay};">
                    ${deleteBtnHtml}
                </div>
            </div>`;
        });
    };

    renderCatList('expense', '💸 支出分類', '#e74c3c');
    renderCatList('income', '💰 收入分類', '#2ecc71');
    
    catDiv.innerHTML = catHtml;
}

// 切換帳戶管理頁面的「編輯/唯讀」模式，並包含防呆視窗
function toggleAccAccountsEditMode() {
    const btn = document.getElementById('btn-toggle-acc-edit');
    const addBtn = document.getElementById('btn-add-payment-method');
    const catActions = document.getElementById('acc-categories-actions'); 
    if (!btn) return;

    if (isAccAccountsEditMode) {
        isAccAccountsEditMode = false;
        btn.innerHTML = "🔒 唯讀模式";
        btn.style.color = "#888";
        btn.style.borderColor = "#ddd";
        btn.style.background = "transparent";
        if (addBtn) addBtn.style.display = "none";
        if (catActions) catActions.style.display = "none"; 
        renderAccAccounts(); 
    } 
    else {
        showConfirm("確定要開啟編輯模式嗎？\n\n開啟後您可以管理帳戶餘額與收支分類。", "✏️ 進入編輯模式")
        .then(ok => {
            if (ok) {
                isAccAccountsEditMode = true;
                btn.innerHTML = "✏️ 編輯模式";
                btn.style.color = "var(--primary)";
                btn.style.borderColor = "var(--primary)";
                btn.style.background = "#e6f0ff";
                if (addBtn) addBtn.style.display = "block";
                if (catActions) catActions.style.display = "flex"; 
                renderAccAccounts(); 
            }
        });
    }
}

// 更新記帳視窗中的支付方式 (帳戶) 下拉選單
function updatePaymentMethodOptions() {
    const select = document.getElementById('input-acc-method');
    const selectTo = document.getElementById('input-acc-to-method');
    if (!select) return;
    
    const currentVal = select.value;
    const currentValTo = selectTo ? selectTo.value : '';

    let optionsHtml = '';
    paymentMethods.forEach(method => {
        optionsHtml += `<option value="${method}">${method}</option>`;
    });
    
    select.innerHTML = optionsHtml;
    if (selectTo) selectTo.innerHTML = optionsHtml;

    if (paymentMethods.includes(currentVal)) select.value = currentVal;
    if (selectTo && paymentMethods.includes(currentValTo)) selectTo.value = currentValTo;
}

// 新增自訂的支付方式 (帳戶) 及其初始餘額
function addPaymentMethod() {
    if (!isAccAccountsEditMode) {
        if (window.showAlert) showAlert("目前為「🔒 唯讀模式」\n若要新增帳戶，請先點擊右上角的按鈕切換至編輯狀態。");
        return;
    }

    showPrompt("請輸入新支付方式名稱 (例如: LINE Pay, 私房錢)", "", "新增帳戶")
    .then(name => {
        if (!name) return;
        if (name) {
            if (paymentMethods.includes(name)) {
                showAlert("這個名稱已經存在囉！");
                return;
            }
        }
        showPrompt(`請輸入「${name}」的初始金額：`, "0", "設定餘額")
        .then(amountStr => {
            const amount = parseInt(amountStr) || 0;

            paymentMethods.push(name);
            
            if (amount > 0) {
                accountingList.push({
                    date: new Date().toISOString().split('T')[0],
                    title: "初始餘額",
                    amount: amount,
                    type: "income",
                    method: name
                });
            }

            saveData();
            renderAccounting();
            
            const msg = amount > 0 ? `已新增「${name}」\n(初始餘額 $${amount})` : `已新增「${name}」`;
            showAlert(msg);
        });
    });
}

// 刪除指定的支付方式 (帳戶)
function deletePaymentMethod(index) {
    if (!isAccAccountsEditMode) {
        if (window.showAlert) showAlert("目前為「🔒 唯讀模式」\n若要刪除帳戶，請先點擊右上角的按鈕切換至編輯狀態。");
        return;
    }

    const target = paymentMethods[index];
    showConfirm(`確定要刪除「${target}」嗎？\n(注意：這不會刪除該帳戶的歷史記帳紀錄，但無法再選擇此方式)`, "刪除確認")
    .then(ok => {
        if (ok) {
            paymentMethods.splice(index, 1);
            saveData();
            renderAccounting();
            showAlert("已刪除");
        }
    });
}

window.editPaymentMethodBalance = function(methodName, currentBalance) {
    if (!isAccAccountsEditMode) {
        if (window.showAlert) showAlert("目前為「🔒 唯讀模式」\n若要校正金額，請先點擊右上角的按鈕切換至編輯狀態。");
        return;
    }

    showPrompt(`請輸入「${methodName}」目前的真實總餘額：`, currentBalance, "⚖️ 帳戶餘額校正")
    .then(newBalanceStr => {
        if (newBalanceStr === null) return; 
        
        const newBalance = parseInt(newBalanceStr);
        if (isNaN(newBalance)) {
            if (window.showAlert) showAlert("請輸入有效的數字！", "錯誤");
            return;
        }

        const difference = newBalance - currentBalance;
        if (difference === 0) return; 

        if (difference < 0) {
            // 錢變少了：觸發回憶與誠實面對
            const missingAmount = Math.abs(difference);
            showConfirm(`有 ${missingAmount} 塊憑空消失了！😱\n是變成宵夜、忘記記帳，還是手滑的衝動購物？\n\n要誠實面對，將這筆差額記為「糊塗帳」嗎？`, "🤔 誠實面對")
            .then(ok => {
                if (ok) {
                    accountingList.push({
                        date: new Date().toISOString().split('T')[0],
                        title: "憑空消失的錢",
                        category: "糊塗帳", // 強制設定為糊塗帳
                        amount: missingAmount,
                        type: "expense",
                        method: methodName
                    });
                    saveData();
                    renderAccounting();
                    if (window.showAlert) showAlert(`已將 ${missingAmount} 元的財務黑洞記為「糊塗帳」！\n下次記得管好錢包啊～`, "記帳成功");
                }
            });
        } else {
            // 錢變多了：意外之財
            accountingList.push({
                date: new Date().toISOString().split('T')[0],
                title: "意外之財 (餘額校正)",
                category: "其他",
                amount: Math.abs(difference),
                type: "income",
                method: methodName
            });
            saveData();
            renderAccounting();
            if (window.showAlert) showAlert(`已將多出來的 $${difference} 記入收入！`, "修改成功");
        }
    });
};

// 新增自訂的收支分類
function addNewAccCategory(type) {
    if (!isAccAccountsEditMode) return;
    
    const typeName = type === 'income' ? '收入' : '支出';
    
    showPrompt(`請輸入新的「${typeName}」分類名稱：`, "", "➕ 新增分類")
    .then(newCat => {
        if (newCat) {
            newCat = newCat.trim();
            if (accCategories[type].includes(newCat)) {
                showAlert("這個分類已經存在囉！");
                return;
            }
            accCategories[type].push(newCat);
            saveData(); 
            renderAccAccounts(); 
            showAlert(`已新增${typeName}分類：「${newCat}」`, "成功");
        }
    });
}

// 刪除指定的收支分類 (預設的「其他」無法刪除)
function deleteAccCategory(type, index) {
    if (!isAccAccountsEditMode) return;

    const catToDelete = accCategories[type][index];
    if (catToDelete === '其他') {
        showAlert("「其他」為系統預設分類，無法刪除喔！");
        return;
    }

    showConfirm(`確定要刪除「${catToDelete}」分類嗎？\n\n(注意：過去已經記帳的紀錄不受影響，但未來無法再選到此分類)`, "🗑️ 刪除確認")
    .then(ok => {
        if (ok) {
            accCategories[type].splice(index, 1);
            saveData();
            renderAccAccounts(); 
            showAlert(`已刪除分類：「${catToDelete}」`);
        }
    });
}