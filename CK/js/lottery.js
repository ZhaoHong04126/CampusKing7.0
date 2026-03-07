/* ========================================================================== */
/* 📌 籤筒狀態與預設資料 (Lottery State & Default Data)                         */
/* ========================================================================== */

// 記錄目前選擇的籤筒分類索引
let currentCategoryIndex = 0;

// 記錄目前是否正在進行抽籤動畫中
let isDrawing = false;

// 記錄抽籤動畫的計時器 ID
let drawInterval = null;

// 預設的籤筒資料 (當使用者完全沒有資料時使用)
const defaultLotteryData = [
    {
        title: "午餐吃什麼",
        items: ["麥當勞", "學餐", "便利商店", "便當", "不吃"]
    },
    {
        title: "飲料喝什麼",
        items: ["紅茶", "綠茶", "奶茶", "開水", "咖啡"]
    }
];



/* ========================================================================== */
/* 📌 籤筒介面渲染與分類切換 (Rendering & Category Management)                  */
/* ========================================================================== */

// 渲染目前的籤筒下拉選單與對應的選項列表
function renderLottery() {
    const listDiv = document.getElementById('lottery-list');
    const select = document.getElementById('lottery-category-select');
    
    if (!listDiv || !select) return;

    select.innerHTML = '';
    lotteryList.forEach((cat, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.text = cat.title;
        if (index === currentCategoryIndex) option.selected = true;
        select.appendChild(option);
    });

    const currentData = lotteryList[currentCategoryIndex];
    let html = '';
    
    if (currentData && currentData.items.length > 0) {
        currentData.items.forEach((item, index) => {
            html += `
            <div style="display:flex; justify-content:space-between; align-items:center; padding: 10px; border-bottom: 1px solid #eee;">
                <span style="font-size: 1rem;">${item}</span>
                <button onclick="deleteLotteryItem(${index})" style="background:transparent; border:none; color:#ccc; cursor:pointer;">✖</button>
            </div>`;
        });
    } else {
        html = '<p style="color:#999; text-align:center; padding:10px;">這裡空空的，加點選項吧！</p>';
    }
    listDiv.innerHTML = html;
}

// 切換籤筒的分類，並重新渲染列表
function switchLotteryCategory() {
    const select = document.getElementById('lottery-category-select');
    currentCategoryIndex = parseInt(select.value);
    renderLottery();
}

// 透過彈窗提示使用者輸入名稱，以新增一個籤筒分類 (例如：晚餐、消夜)
function addNewLotteryCategory() {
    showPrompt("請輸入新分類名稱 (例如: 晚餐)", "", "新增籤筒")
    .then(title => {
        if (title) {
            lotteryList.push({
                title: title,
                items: []
            });
            currentCategoryIndex = lotteryList.length - 1;
            saveData();
            renderLottery();
        }
    });
}

// 刪除目前的籤筒分類 (至少需保留一個分類防呆)
function deleteLotteryCategory() {
    if (lotteryList.length <= 1) {
        showAlert("至少要保留一個分類！");
        return;
    }
    const currentTitle = lotteryList[currentCategoryIndex].title;
    
    showConfirm(`確定要刪除「${currentTitle}」嗎？`, "刪除確認").then(ok => {
        if (ok) {
            lotteryList.splice(currentCategoryIndex, 1);
            currentCategoryIndex = 0;
            saveData();
            renderLottery();
        }
    });
}



/* ========================================================================== */
/* 📌 選項操作 (Item Operations)                                                */
/* ========================================================================== */

// 讀取輸入框的文字並新增為目前籤筒的一個選項
function addLotteryItem() {
    const input = document.getElementById('input-lottery-item');
    const val = input.value.trim();
    
    if (!val) return;

    lotteryList[currentCategoryIndex].items.push(val);
    input.value = '';
    
    saveData();
    renderLottery();
}

// 刪除目前籤筒中的指定選項
function deleteLotteryItem(index) {
    lotteryList[currentCategoryIndex].items.splice(index, 1);
    saveData();
    renderLottery();
}



/* ========================================================================== */
/* 📌 抽籤核心邏輯與動畫 (Core Lottery Logic & Animation)                       */
/* ========================================================================== */

// 啟動抽籤動畫，快速切換顯示選項以產生隨機滾動效果
function startLottery() {
    if (isDrawing) return;

    const currentItems = lotteryList[currentCategoryIndex].items;
    
    if (currentItems.length < 2) {
        showAlert("至少要有兩個選項才能抽喔！");
        return;
    }

    const resultBox = document.getElementById('lottery-result-text');
    const btn = document.getElementById('btn-draw');
    
    isDrawing = true;
    btn.disabled = true;
    btn.innerText = "👀 命運轉動中...";
    resultBox.style.color = "var(--primary)";

    let count = 0;
    const totalTime = 30;
    
    drawInterval = setInterval(() => {
        const randIndex = Math.floor(Math.random() * currentItems.length);
        resultBox.innerText = currentItems[randIndex];
        
        count++;
        if (count > totalTime) {
            clearInterval(drawInterval);
            finishDraw(resultBox, btn);
        }
    }, 50 + (count * 2));
}

// 停止動畫並決定最終的隨機抽籤結果，同時加上放大強調特效
function finishDraw(resultBox, btn) {
    const currentItems = lotteryList[currentCategoryIndex].items;
    const finalIndex = Math.floor(Math.random() * currentItems.length);
    const winner = currentItems[finalIndex];

    resultBox.innerText = `🎉 ${winner} 🎉`;
    resultBox.style.color = "#e74c3c";
    resultBox.style.transform = "scale(1.2)";
    resultBox.style.transition = "transform 0.2s";
    
    setTimeout(() => {
        resultBox.style.transform = "scale(1)";
    }, 200);

    isDrawing = false;
    btn.disabled = false;
    btn.innerText = "🎲 再抽一次";
}