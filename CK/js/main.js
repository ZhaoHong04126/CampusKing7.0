/* ========================================================================== */
/* 📌 應用程式進入點與狀態監聽 (App Entry Point & Auth Listener)             */
/* ========================================================================== */

<<<<<<< HEAD
auth.onAuthStateChanged((user) => {
    if (user) {
        currentUser = user;
        updateLoginUI(true);    
        loadData();             
        initUI();               

        const hash = window.location.hash.replace('#', '');
        
        if (hash && document.getElementById('view-' + hash)) {
            switchTab(hash, false); 
        } else {
            // 原本是 'home'，現在預設首頁改為 'schedule'
            switchTab('schedule', false); 
        }
    } else {
        currentUser = null;     
=======
// 程式啟動核心：監聽 Firebase Auth 的登入狀態變更
auth.onAuthStateChanged((user) => {
    if (user) {
        // 紀錄目前登入的使用者物件
        currentUser = user;
        
        // 更新 UI 介面為登入狀態 (例如隱藏登入頁、顯示主選單)
        updateLoginUI(true);    
        
        // 載入該使用者的本地與雲端資料
        loadData();             
        
        // 初始化應用程式的共用介面設定 (如深色模式與預設顯示)
        initUI();               

        // 讀取網址的 Hash 值，以便在重新整理時停留在原本的頁面
        const hash = window.location.hash.replace('#', '');
        
        // 檢查 hash 是否存在，且畫面上確實有對應的視圖容器
        if (hash && document.getElementById('view-' + hash)) {
            // 恢復對應頁面 (傳入 false 代表不重複推入歷史紀錄)
            switchTab(hash, false); 
        } else {
            // 無 hash 或找不到對應頁面時，預設顯示首頁
            switchTab('home', false); 
        }
    } else {
        // 若尚未登入或已登出，清空使用者物件
        currentUser = null;     
        
        // 更新 UI 介面為登出狀態 (顯示登入頁或廣告落地頁)
>>>>>>> 806d1aba001b89e81acc6ae4ed35451b34c23966
        updateLoginUI(false);   
    }
});