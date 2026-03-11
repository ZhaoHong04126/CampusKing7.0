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
// 2. 管理端：讀取所有回饋
// ==========================================
async function loadAdminFeedbacks() {
    const listContainer = document.getElementById('admin-feedback-list');
    listContainer.innerHTML = "<tr><td colspan='6'>載入中...</td></tr>";

    try {
        // 依照時間排序，最新的在最上面
        const snapshot = await db.collection("feedbacks").orderBy("timestamp", "desc").get();
        listContainer.innerHTML = "";

        if (snapshot.empty) {
            listContainer.innerHTML = "<tr><td colspan='6'>目前沒有任何回饋資料。</td></tr>";
            return;
        }

        snapshot.forEach(doc => {
            const data = doc.data();
            const id = doc.id;
            const date = data.timestamp ? data.timestamp.toDate().toLocaleString() : "未知時間";
            
            // 狀態標籤轉換
            let statusText = "待處理";
            let statusColor = "red";
            if (data.status === "processing") { statusText = "處理中"; statusColor = "orange"; }
            if (data.status === "resolved") { statusText = "已解決"; statusColor = "green"; }

            // 類型圖示轉換
            const typeIcon = data.type === "bug" ? "🐞 Bug" : (data.type === "suggestion" ? "💡 建議" : "💬 其他");

            listContainer.innerHTML += `
                <tr>
                    <td>${date}</td>
                    <td style="font-size: 0.8em; color: gray;">${data.uid.substring(0,8)}...</td>
                    <td>${typeIcon}</td>
                    <td style="max-width: 300px; word-wrap: break-word;">${data.content}</td>
                    <td style="color: ${statusColor}; font-weight: bold;">${statusText}</td>
                    <td>
                        <select onchange="updateFeedbackStatus('${id}', this.value)">
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