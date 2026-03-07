/* ========================================================================== */
/* 📌 應用程式進入點與狀態監聽 (App Entry Point & Auth Listener)             */
/* ========================================================================== */

auth.onAuthStateChanged((user) => {
    if (user) {
        currentUser = user;
        updateLoginUI(true);
        loadData();
        initUI();

        if (user.uid === '8OeziUfXrKXot4l60U2keePhOwS2') {
            const adminBtn = document.getElementById('admin-news-btn');
            if (adminBtn) adminBtn.style.display = 'flex';
        }

        const hash = window.location.hash.replace('#', '');
        
        if (hash && document.getElementById('view-' + hash)) {
            switchTab(hash, false);
        } else {
            switchTab('schedule', false); 
        }
    } else {
        currentUser = null;
        updateLoginUI(false);
    }
});