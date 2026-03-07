# 👑 校園王 (CampusKing) - 數位學園

![Version](https://img.shields.io/badge/Version-9.2%20Dashboard-blue.svg)
![Platform](https://img.shields.io/badge/Platform-Web%20%7C%20PWA-success.svg)
![License](https://img.shields.io/badge/License-MIT-green.svg)

**校園王 (CampusKing)** 是一款專為大學生打造的「全方位校園生活儀表板」。
告別散落各處的筆記與試算表，我們將課表、成績、記帳、行事曆與學習計畫完美整合在一個現代化、高質感的雲端 SaaS 介面中。

## ✨ 系統亮點 (v9.2 全新架構)

在最新的 v9.2 版本中，我們迎來了史詩級的介面革新！捨棄了傳統的 App 網格設計，全面升級為**專業級雙欄儀表板 (Dashboard)**，提供更直覺、更流暢的操作體驗。

### 📊 核心管理模組
* **🏠 資訊儀表板 (Dashboard)：** 總覽當前學期狀態與今日任務速覽。
* **📅 智慧課表 (Schedule)：** 支援單日/週課表切換、自訂節次時間、課程色彩標記，更支援「一鍵匯出課表圖片」。
* **💯 成績與學分 (Grade Manager)：** 自動計算 GPA、追蹤畢業學分達成率、視覺化歷年成績趨勢圖。
* **🎒 作業與小考 (Homework)：** 集中管理各科作業繳交期限與得分。
* **💰 學期記帳 (Accounting)：** 專為學生設計的收支追蹤，包含圓餅圖與折線圖收支分析。
* **🗓️ 專屬行事曆 (Calendar)：** 整合校園活動與個人行程，支援月曆與清單雙視圖。

### 🧰 實用小工具
* **🧮 配分筆記：** 記錄各科教授的計分方式與目標分數。
* **📝 快速記事：** 靈感與待辦事項隨手記。
* **🎰 幸運籤筒：** 解決「午餐吃什麼」的千古難題。
* **💝 紀念日：** 倒數重要日子，不再忘記。
* **📚 學習目標：** 量化你的讀書計畫進度。

### ⚙️ 系統特性
* **雙頁面架構：** 獨立的入口落地頁 (`index.html`) 與主系統 (`app.html`)，載入更輕快。
* **響應式設計 (RWD)：** 電腦版顯示專業側邊欄，手機版自動轉換為滑出式抽屜選單。
* **雲端同步：** 整合 Firebase Auth 與 Firestore，資料即時備份不遺失。
* **本地備份還原：** 支援將大學回憶打包匯出為 JSON 檔，隨時無縫還原。

## 🛠️ 技術架構

* **前端核心：** HTML5, CSS3, Vanilla JavaScript (無框架，極致輕量)
* **後端與資料庫：** Google Firebase (Authentication, Cloud Firestore)
* **圖表與視覺化：** Chart.js
* **畫面截圖工具：** html2canvas

## 🚀 快速開始

1. 將本專案複製到本地端。
2. 確保你在 `js/firebase.js` 中填入了你專屬的 Firebase 設定金鑰。
3. 透過 VS Code 的 Live Server 或部署至任何靜態網頁伺服器（如 GitHub Pages, Vercel）。
4. 開啟 `index.html` 即可看到專屬的數位學園入口！