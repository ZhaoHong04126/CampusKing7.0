# CampusKing 重構計畫：原生 JS 轉 React 進度表

**專案起始日：** 2026 / 04 / 01
**預期完工日：** 2026 / 06 / 09 (共 10 週)
**當前線上版本：** `v3.8.1` (原生 JS)
**預期目標版本：** `v4.0.0` (React + Supabase 架構)

---

## 預備期：React 基礎知識打底 
📅 **時間：2026/04/01 ~ 2026/04/07 (第 1 週)**
*學習階段，不涉及專案程式碼變動。*

- [ ] 暸解 JSX 語法與 Virtual DOM 概念。
- [ ] 學習 Function Component 與 Props 的傳遞。
- [ ] 掌握基礎 Hooks：`useState` 與 `useEffect`。
- [ ] 暸解條件渲染與列表渲染 (`map`)。

---

## 第一階段：專案初始化與基礎架構 
📅 **時間：2026/04/08 ~ 2026/04/14 (第 2 週)**
🎯 **達成里程碑：`v4.0.0-alpha.1`** (環境建置完成)

📂 **牽涉原檔案：**
* `css/base.css` (全域基礎變數與樣式)
* `css/layout.css` (全域排版樣式)

- [ ] 使用 Vite 建立 React 專案。
- [ ] 整理資料夾結構 (`src/components`, `src/pages`, `src/assets`, `src/styles` 等)。
- [ ] 將 `base.css` 與 `layout.css` 引入專案 `main.jsx` 或 `App.jsx` 中。
- [ ] 安裝 `react-router-dom` 並設定基礎路由架構。

---

## 第二階段：佈局 (Layout) 與 UI 元件化 
📅 **時間：2026/04/15 ~ 2026/04/28 (第 3~4 週)**
🎯 **達成里程碑：`v4.0.0-alpha.2`** (靜態畫面重構完成)

📂 **牽涉原檔案：**
* `index.html` (首頁/登入頁 HTML 結構)
* `app.html` (主控台 HTML 結構)
* `js/ui.js` (負責操控畫面的原生 JS 邏輯)
* `js/main.js` (首頁與通用初始化的邏輯)
* `css/landing.css` (首頁專用樣式)
* `css/dashboard.css` (主控台專用樣式)
* `css/components.css` (按鈕、卡片等 UI 樣式)

- [ ] 實作共用版面元件：`Navbar`、`Sidebar`、`Footer`。
- [ ] 建立基礎 UI 元件 (參考 `components.css`)。
- [ ] 參考 `index.html` 與 `landing.css`，轉換為 `LandingPage` 元件。
- [ ] 參考 `app.html` 與 `dashboard.css`，轉換為 `DashboardLayout`，並設定 `<Outlet />`。
- [ ] 將 `ui.js` 中控制 Sidebar 展開/收合、Modal 彈窗的邏輯，改用 React `useState` 實作。

---

## 第三階段：狀態管理與 Supabase 串接
📅 **時間：2026/04/29 ~ 2026/05/12 (第 5~6 週)**
🎯 **達成里程碑：`v4.0.0-beta.1`** (核心資料流與驗證開通)

📂 **牽涉原檔案：**
* `js/state.js` (原有的全域狀態變數)
* `js/auth.js` (登入/註冊邏輯)
* `js/firebase.js` (即將被淘汰的 Firebase 初始化設定)
* `js/data.js` (資料庫 CRUD 存取邏輯)
* `css/auth.css` (驗證相關樣式)

- [ ] 參考 `state.js`，建立 React Context (如 `UserContext`) 管理全域狀態。
- [ ] 參考 `auth.js` 實作 `useAuth` Hook，處理 Supabase 的註冊/登入/登出。
- [ ] **捨棄 `firebase.js`**，安裝並初始化 Supabase Client。
- [ ] 改寫 `data.js` 的邏輯，替換為 Supabase 的 API 呼叫，並與元件 `useEffect` 結合載入資料。

---

## 第四階段：核心功能模組轉換 
📅 **時間：2026/05/13 ~ 2026/05/26 (第 7~8 週)**
🎯 **達成里程碑：`v4.0.0-beta.2`** (全功能 Beta 版)

📂 **牽涉原檔案：** (這是最繁重的一區，依功能拆分檔案)
* **課程與行事曆**：`js/course.js`, `js/calendar.js`, `js/semester.js`, `css/calendar.css`
* **成績管理**：`js/grade.js`, `js/gradecalc.js`
* **作業與自習**：`js/homework.js`, `js/selfstudy.js`
* **其他附屬功能**：`js/accounting.js` (記帳), `js/lottery.js` (抽獎), `js/feedback.js` (回饋), `js/anniversary.js` (週年活動)
* **其他樣式**：`css/settings.css`, `css/feedback-admin.css`

- [ ] 實作 `CoursePage` 與 `CalendarView` 元件。
- [ ] 將 `gradecalc.js` 的純運算邏輯抽離成獨立的 Helper function，並在成績元件中呼叫。
- [ ] 實作新增、刪除、修改作業/自習的表單與列表元件。
- [ ] 完成記帳、抽獎、回饋等附屬功能的元件轉換與 Supabase 資料庫串接。

---

## 第五階段：進階優化與 PWA 支援 
📅 **時間：2026/05/27 ~ 2026/06/02 (第 9 週)**
🎯 **達成里程碑：`v4.0.0-rc.1`** (上線候選版，功能凍結)

📂 **牽涉原檔案：**
* `manifest.json` (PWA 應用程式設定)
* `sw.js` (Service Worker 快取邏輯)

- [ ] 將 `manifest.json` 搬移至 Vite 專案的 `public/` 資料夾，並在 `index.html` 中引入。
- [ ] 利用 Vite PWA 外掛 (如 `vite-plugin-pwa`) 重構 `sw.js`，或手動整合舊的 Service Worker。
- [ ] 進行全站 RWD 檢查與跑版修復。
- [ ] 效能優化：減少不必要的 Re-render，優化 Supabase 查詢次數。

---

## 第六階段：測試與上線 
📅 **時間：2026/06/03 ~ 2026/06/09 (第 10 週)**
🎯 **達成里程碑：`v4.0.0`** (正式版發布！)

📂 **牽涉原檔案：**
* `README.md` (專案說明文件)

- [ ] 執行完整的 CRUD 功能測試與跨裝置測試。
- [ ] 確認路由保護 (Protected Routes) 邏輯嚴密，阻擋未授權存取。
- [ ] 更新 `README.md`，寫上全新的 React 專案架構說明與啟動指令 (`npm run dev`)。
- [ ] 部署至 Vercel 或 Netlify 等雲端主機。
- [ ] 🎉 **2026/06/09 前正式發布 CampusKing `v4.0.0`！**