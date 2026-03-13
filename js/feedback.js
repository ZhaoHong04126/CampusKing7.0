// ==========================================
// 1. 學生端：送出回饋
// ==========================================
async function submitFeedback() {
    const type = document.getElementById('feedback-type').value;
    const content = document.getElementById('feedback-content').value;
    const submitBtn = document.querySelector('#feedback-modal .btn-primary');

    if (!content.trim()) {
        alert("請輸入回饋內容！");
        return;
    }

    submitBtn.disabled = true;
    submitBtn.innerText = "送出中...";

    try {
        // 假設 currentUser 已經在 auth.js 中定義
        const uid = firebase.auth().currentUser ? firebase.auth().currentUser.uid : "anonymous";
        
        await db.collection("feedbacks").add({
            uid: uid,
            type: type,
            content: content,
            status: "pending", // 預設狀態：待處理
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });

        alert("感謝您的回饋！我們已經收到囉。");
        document.getElementById('feedback-content').value = "";
        document.getElementById('feedback-modal').style.display = 'none';
    } catch (error) {
        console.error("送出回饋失敗:", error);
        alert("送出失敗，請稍後再試。");
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerText = "送出回饋";
    }
}

// ==========================================
// 2. 管理端：讀取所有回饋 (已美化版)
// ==========================================
async function loadAdminFeedbacks() {
    const listContainer = document.getElementById('admin-feedback-list');

    // 添加二次驗證保護
    const psw = await showPrompt("請輸入管理員密碼以存取使用者回饋：", "", "🔒 權限驗證");
    if (psw === null) {
        if (typeof switchTab === 'function') switchTab('schedule');
        return;
    }

    if (psw !== "zhao20261150304") {
        if (typeof showAlert === 'function') {
            showAlert("密碼錯誤，拒絕存取！", "❌ 拒絕存取");
        } else {
            alert("❌ 密碼錯誤，拒絕存取！");
        }
        listContainer.innerHTML = "<tr><td colspan='6' style='color: red; font-weight: bold; text-align: center;'>驗證失敗，為保護使用者隱私，拒絕顯示資料。</td></tr>";
        if (typeof switchTab === 'function') switchTab('schedule');
        return;
    }

    listContainer.innerHTML = "<tr><td colspan='6'>載入中...</td></tr>";

    try {
        // 依照時間排序，最新的在最上面
        const snapshot = await db.collection("feedbacks").orderBy("timestamp", "desc").get();
        listContainer.innerHTML = "";

        if (snapshot.empty) {
            listContainer.innerHTML = "<tr><td colspan='6' style='color: gray;'>目前沒有任何回饋資料。</td></tr>";
            return;
        }

        snapshot.forEach(doc => {
            const data = doc.data();
            const id = doc.id;
            // const date = data.timestamp ? data.timestamp.toDate().toLocaleString() : "未知時間";
            // --- 安全解析時間 ---
            let date = "未知時間";
            if (data.timestamp) {
                try {
                    if (typeof data.timestamp.toDate === 'function') {
                        // 情況 1：正常的 Firestore Timestamp 物件
                        date = data.timestamp.toDate().toLocaleString('zh-TW', { hour12: false });
                    } else if (data.timestamp.seconds) {
                        // 情況 2：某些快取狀態下只有 seconds 屬性
                        date = new Date(data.timestamp.seconds * 1000).toLocaleString('zh-TW', { hour12: false });
                    } else {
                        // 情況 3：字串或數字 (通常是在 Firebase 後台手動建立測試資料時發生的)
                        const parsedDate = new Date(data.timestamp);
                        if (!isNaN(parsedDate)) {
                            date = parsedDate.toLocaleString('zh-TW', { hour12: false });
                        }
                    }
                } catch (e) {
                    console.warn("時間解析失敗:", e, data.timestamp);
                    date = "時間格式錯誤";
                }
            }
            // --------------------
            // --- 狀態標籤 (使用 CSS Badge Class) ---
            let statusBadgeClass = "badge badge-status-pending";
            let statusText = "待處理";
            if (data.status === "processing") { statusBadgeClass = "badge badge-status-processing"; statusText = "處理中"; }
            if (data.status === "resolved") { statusBadgeClass = "badge badge-status-resolved"; statusText = "已解決"; }

            // --- 類型標籤與圖示 (使用 CSS Badge Class) ---
            let typeBadgeClass = "badge badge-type-other";
            let typeIcon = "💬";
            let typeText = "其他";
            if (data.type === "bug") { typeBadgeClass = "badge badge-type-bug"; typeIcon = "🐞"; typeText = "Bug"; }
            if (data.type === "suggestion") { typeBadgeClass = "badge badge-type-suggestion"; typeIcon = "💡"; typeText = "建議"; }
            
            // --- UID 的完整與短 title ---
            const fullUid = data.uid || "anonymous";
            const shortUid = fullUid.substring(0, 8);

            // --- 渲染 HTML (使用優化後的標籤結構) ---
            listContainer.innerHTML += `
                <tr>
                    <td style="color: black;">${date}</td>
                    
                    <td style="font-size: 0.8em; color: gray;" title="${fullUid}">${shortUid}...</td> 
                    
                    <td><span class="${typeBadgeClass}">${typeIcon} ${typeText}</span></td> 
                    
                    <td style="max-width: 300px; word-wrap: break-word; color: black;">${data.content}</td>
                    
                    <td><span class="${statusBadgeClass}">${statusText}</span></td> 
                    
                    <td>
                        <select class="feedback-status-select" onchange="updateFeedbackStatus('${id}', this.value)"> 
                            <option value="pending" ${data.status === 'pending' ? 'selected' : ''}>設為待處理</option>
                            <option value="processing" ${data.status === 'processing' ? 'selected' : ''}>設為處理中</option>
                            <option value="resolved" ${data.status === 'resolved' ? 'selected' : ''}>設為已解決</option>
                        </select>
                    </td>
                </tr>
            `;
        });
    } catch (error) {
        console.error("載入回饋失敗:", error);
        listContainer.innerHTML = "<tr><td colspan='6'>載入失敗，請檢查權限或網路。</td></tr>";
    }
}

// ==========================================
// 3. 管理端：更新處理狀態
// ==========================================
async function updateFeedbackStatus(docId, newStatus) {
    try {
        await db.collection("feedbacks").doc(docId).update({
            status: newStatus
        });
        // 不強制重新載入整個列表，只需視覺上知道成功即可，或呼叫 loadAdminFeedbacks()
    } catch (error) {
        console.error("更新狀態失敗:", error);
        alert("狀態更新失敗！");
    }
}