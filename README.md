# 👑 校園王 (CampusKing) - 數位學園

![Version](https://img.shields.io/badge/Version-v3.0.1-blue.svg)![Platform](https://img.shields.io/badge/Platform-Web%20%7C%20PWA-success.svg)
![License](https://img.shields.io/badge/License-MIT-green.svg)

**校園王 (CampusKing)** 是一款專為大學生打造的「全方位校園生活儀表板」。
告別散落各處的筆記與試算表，我們將課表、成績、記帳、行事曆與學習計畫完美整合在一個現代化、高質感的雲端 SaaS 介面中。

## 📊 核心管理模組
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

## 🏷️ 版本控制規範 (Semantic Versioning)

本專案開發嚴格遵循 [語意化版本控制 (SemVer)](https://semver.org/lang/zh-TW/) 規範。
標準版本號命名格式為：**`v主版號.次版號.修訂號` (vMajor.Minor.Patch)**，例如 `v3.0.0`。

### 📌 版本號更新規則
* **🔴 主版號 (Major)**：當有重大架構翻新、UI 全面改版，或產生不相容的資料庫結構 (Schema) 變更時增加（例如：`v3.0.0` -> `v4.0.0`，這時次版號與修訂號歸零）。
* **🟢 次版號 (Minor)**：當新增向下相容的新功能（例如：新增「番茄鐘」模組）時增加（例如：`v3.0.0` -> `v3.1.0`，這時修訂號歸零）。
* **🟡 修訂號 (Patch)**：當進行向下相容的 Bug 修復或畫面微調時增加（例如：修復課表跑版問題，`v3.1.0` -> `v3.1.1`）。

### 🚀 先行版 (Pre-release) 與測試標籤
在正式版本釋出前，為了進行階段性測試，我們會在版本號後方加上特定的標籤：
* **`-alpha` (內部測試版)**：新功能剛開發完成，可能還存在較多 Bug，僅供開發者內部測試。*(範例：`v3.1.0-alpha.1`)*
* **`-beta` (公開測試版)**：核心功能已穩定，開放給部分使用者試用並收集回饋、抓取潛在 Bug。*(範例：`v3.1.0-beta.2`)*
* **`-rc` (候選版 Release Candidate)**：幾乎沒有已知的嚴重 Bug，預計成為最終正式版的候選名單，做最後的觀察。*(範例：`v3.1.0-rc.1`)*

> **💡 開發架構提示：**
> 為確保系統穩定性，本專案的「前端介面版本 (UI Version)」與「本地資料庫結構版本 (Data Schema Version)」採分離設計。日常的功能迭代只需推進 UI 版本號；僅在資料結構發生必須轉換的重大變更時，才需升級底層的 Data Version。

### git commit 寫法
本專案建議遵循 [約定式提交 (Conventional Commits)](https://www.conventionalcommits.org/zh-hant/v1.0.0/) 規範，讓版本紀錄更易讀，並能對應版本號的升級。

**提交訊息格式：**
`<類型>(<範圍範圍，可選>): <描述> (<版本號，可選>)`

**常用類型 (Type) 對照表：**
* **`feat`** (Feature)：新增向下相容的新功能（通常對應版本號 `Minor` 更新）。
* **`fix`** (Bug Fix)：修復系統錯誤或跑版問題（通常對應版本號 `Patch` 更新）。
* **`docs`** (Documentation)：僅修改文件（如 `README.md`）。
* **`style`** (Style)：程式碼格式微調（不影響程式碼運行的變動，如空白鍵、縮排、缺少分號等）。
* **`refactor`** (Refactor)：程式碼重構（既不修復 Bug 也不新增功能的程式碼變動）。
* **`chore`** (Chore)：建置程序或輔助工具的變動（如更新依賴套件）。

**範例：**
* `feat: 新增番茄鐘學習模組 (v3.1.0)`
* `fix: 修正週末課表會強制跳轉至星期一的顯示錯誤 (v3.0.1)`
* `docs: 更新 README 中的版本控制與 commit 規範`

## 📂 專案結構 (Project Structure)

```text
CampusKing/
│
├── index.html          # 系統入口 (System Entry)
├── manifest.json       # PWA 設定檔 (PWA Configuration)
├── sw.js               # Service Worker (離線支援)
│
├── css/                # 樣式表 (Stylesheets)
│   ├── base.css        # 全域變數、Reset、字體設定
│   ├── layout.css      # 版面配置、Grid 系統
│   ├── components.css  # [UI元件] 按鈕、卡片、Modal 視窗
│   ├── landing.css     # 登入頁與廣告宣傳頁樣式
│   ├── auth.css        # 登入表單樣式
│   ├── dashboard.css   # 桌面與主要 APP 共用樣式
│   ├── settings.css    # 設定頁面樣式
│   └── calendar.css    # 行事曆專屬樣式
│
└── js/                 # 腳本邏輯 (Scripts)
    ├── [核心系統]
    ├── firebase.js     # Firebase 初始化與連線設定
    ├── auth.js         # 使用者身分驗證邏輯
    ├── state.js        # 全域變數與狀態管理
    ├── main.js         # 系統啟動入口、狀態監聽
    ├── ui.js           # 路由控制、視窗管理、通知元件
    ├── data.js         # 資料庫存取 (CRUD) 封裝
    │
    ├── [功能 APP]
    ├── course.js       # 課表功能 (含連堂處理、色彩標記)
    ├── grade.js        # 成績功能 (GPA計算、圖表)
    ├── gradecalc.js    # 配分筆記本功能
    ├── homework.js     # 作業成績功能
    ├── accounting.js   # 記帳功能 (收支統計)
    ├── calendar.js     # 行事曆功能
    ├── lottery.js      # 幸運籤筒功能
    ├── learning.js     # 學習進度追蹤
    ├── notes.js        # 快述記事本
    ├── anniversary.js  # 紀念日倒數
    └── semester.js     # 學期設定與管理


```

## 👨‍💻 關於作者 (Developer)

- 這是我在校園生活中，為了解決自己與身邊同學的痛點而誕生的心血結晶。

- Produced by **Huang Zhaohong**