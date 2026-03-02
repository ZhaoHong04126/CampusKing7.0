/* ========================================================================== */
/* 📌 登入與註冊功能 (Login & Registration)                                     */
/* ========================================================================== */

// 切換登入與註冊模式的表單狀態
function toggleLoginMode() {
    isRegisterMode = !isRegisterMode;
    const btn = document.getElementById('btn-submit');
    const toggleBtn = document.getElementById('toggle-btn');
    const toggleText = document.getElementById('toggle-text');
    
    if (isRegisterMode) { 
        btn.innerText = "註冊並登入"; 
        toggleText.innerText = "已經有帳號？"; 
        toggleBtn.innerText = "直接登入"; 
    }
    else { 
        btn.innerText = "登入"; 
        toggleText.innerText = "還沒有帳號？"; 
        toggleBtn.innerText = "建立新帳號"; 
    }
}

// 處理 Email 密碼登入或註冊的送出邏輯
function handleEmailAuth() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    if (!email || !password) { showAlert("請輸入 Email 和密碼", "資料不全"); return; }
    
    if (isRegisterMode) {
        auth.createUserWithEmailAndPassword(email, password)
            .catch(e => showAlert(e.message, "註冊失敗"));
    } else {
        auth.signInWithEmailAndPassword(email, password)
            .catch(e => showAlert(e.message, "登入失敗"));
    }
}

// 觸發 Google 帳號彈出視窗登入
function loginWithGoogle() {
    auth.signInWithPopup(provider).catch(e => showAlert(e.message, "登入錯誤"));
}

// 觸發免帳號的匿名訪客登入
function loginAnonymously() {
    auth.signInAnonymously().catch(e => showAlert(e.message, "登入錯誤"));
}

// 發送忘記密碼的重設信件至指定 Email
function forgotPassword() {
    const email = document.getElementById('email').value;

    if (!email) {
        showAlert("請先在上方輸入您的 Email，系統才能寄送重設信給您！", "缺少 Email");
        return;
    }

    showConfirm(`確定要寄送重設密碼信件至 ${email} 嗎？`, "重設密碼").then(isConfirmed => {
        if (isConfirmed) {
            auth.sendPasswordResetEmail(email)
            .then(() => {
                showAlert("📧 重設信已寄出！\n\n請檢查您的信箱 (若沒收到請查看垃圾郵件)。", "寄送成功");
            })
            .catch((error) => {
                let msg = "發送失敗：" + error.message;
                if (error.code === 'auth/user-not-found') msg = "找不到此 Email 的使用者。";
                showAlert(msg, "錯誤");
            });
        }
    });
}



/* ========================================================================== */
/* 📌 帳號登出與刪除 (Logout & Account Deletion)                                */
/* ========================================================================== */

// 處理登出邏輯並包含防呆警告 (檢查編輯模式、匿名或 Google 身分)
function logout() {
    if (typeof isAccountSettingsEditMode !== 'undefined' && !isAccountSettingsEditMode) { 
        if(window.showAlert) showAlert("目前為「🔒 唯讀模式」\n若要登出，請先切換至編輯狀態。"); 
        return; 
    }

    if (currentUser) {
        if (currentUser.isAnonymous) {
            showConfirm("⚠️ 匿名帳號登出後資料會消失，確定嗎？", "警告").then(ok => {
                if (ok) performLogout();
            });
        } else {
            const isGoogleUser = currentUser.providerData.some(provider => provider.providerId === 'google.com');
            
            if (isGoogleUser) {
                showConfirm("您目前使用 Google 帳號登入，確定要登出嗎？", "登出確認").then(ok => {
                    if (ok) performLogout();
                });
            } else {
                showConfirm("確定要登出您的帳號嗎？", "登出確認").then(ok => {
                    if (ok) performLogout();
                });
            }
        }
    } else {
        performLogout();
    }
}

// 執行實際的 Firebase 登出動作並重新整理頁面
function performLogout() {
    auth.signOut().then(() => window.location.reload());
}

// 處理永久註銷(刪除)帳號的流程，包含雙重確認與資料庫清除
function deleteAccount() {
    if (!currentUser) return;
    
    if (typeof isAccountSettingsEditMode !== 'undefined' && !isAccountSettingsEditMode) {
        showAlert("目前為「🔒 唯讀模式」\n若要刪除帳號，請先切換至編輯狀態。");
        return;
    }
    showConfirm("⚠️ 警告：此動作將「永久刪除」您的所有資料（包含課表、成績、記帳...等），且無法復原！\n\n確定要註銷帳號嗎？", "危險操作")
    .then(isConfirmed => {
        if (isConfirmed) {
            return showPrompt("為了確認您的意願，請輸入「DELETE」", "", "最終確認");
        }
        return null;
    })
    .then(inputStr => {
        if (inputStr === "DELETE") {
            const uid = currentUser.uid;
            
            if(window.showAlert) showAlert("正在刪除資料，請稍候...", "處理中");

            db.collection("users").doc(uid).delete()
            .then(() => {
                const dbKey = 'CampusKing_v6.0_' + uid;
                localStorage.removeItem(dbKey);

                return currentUser.delete();
            })
            .then(() => {
                alert("帳號已成功註銷，感謝您的使用。"); 
                window.location.reload();
            })
            .catch((error) => {
                console.error("Delete error:", error);
                if (error.code === 'auth/requires-recent-login') {
                    showAlert("🔒 為了確保帳號安全，系統要求您必須「重新登入」後才能執行刪除操作。\n\n請登出後再登入一次試試。", "驗證過期");
                } else {
                    showAlert("註銷失敗：" + error.message, "錯誤");
                }
            });
        } else if (inputStr !== null) {
            showAlert("輸入內容不正確，已取消操作。", "取消");
        }
    });
}



/* ========================================================================== */
/* 📌 介面狀態更新與編輯模式控制 (UI State & Edit Mode)                         */
/* ========================================================================== */

// 根據登入狀態更新畫面上各個區塊的顯示與隱藏
function updateLoginUI(isLoggedIn) {
    const loginOverlay = document.getElementById('login-overlay');
    const landingPage = document.getElementById('landing-page');
    const dashboard = document.querySelector('.dashboard-container');
    const topBar = document.getElementById('top-bar'); 

    console.log("Login Status:", isLoggedIn);

    if (isLoggedIn) {
        if (loginOverlay) loginOverlay.style.display = 'none';
        if (landingPage) landingPage.style.display = 'none';
        if (dashboard) dashboard.style.display = 'grid';
        if (topBar) topBar.style.display = 'flex'; 
    } else {
        if (loginOverlay) loginOverlay.style.display = 'none';
        if (landingPage) landingPage.style.display = 'flex';
        if (dashboard) dashboard.style.display = 'none';
        if (topBar) topBar.style.display = 'none';
    }
}

// 記錄帳號設定區塊是否處於編輯模式的布林值
let isAccountSettingsEditMode = false;

// 切換帳號設定區塊的「唯讀/編輯」模式，並更新按鈕外觀
window.toggleAccountSettingsEditMode = function() {
    const btn = document.getElementById('btn-toggle-account-edit');
    if (isAccountSettingsEditMode) {
        isAccountSettingsEditMode = false;
        if (btn) {
            btn.innerHTML = "🔒 唯讀模式";
            btn.style.color = "#888";
            btn.style.borderColor = "#ddd";
            btn.style.background = "transparent";
        }
    } else {
        showConfirm("確定要開啟編輯模式嗎？\n\n開啟後您可以執行登出與永久刪除帳號。", "✏️ 進入編輯模式").then(ok => {
            if (ok) {
                isAccountSettingsEditMode = true;
                if (btn) {
                    btn.innerHTML = "✏️ 編輯模式";
                    btn.style.color = "var(--danger)";
                    btn.style.borderColor = "var(--danger)";
                    btn.style.background = "#fff0f0";
                }
            }
        });
    }
}