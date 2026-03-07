/* ========================================================================== */
/* 📌 應用程式進入點與狀態監聽 (App Entry Point & Auth Listener)             */
/* ========================================================================== */

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
        updateLoginUI(false);   
    }
});