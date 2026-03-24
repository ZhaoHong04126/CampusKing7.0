# 轉移至 React 專案遷移計畫

因為原本的專案使用了大量的原生 HTML (如 `app.html`, `index.html`)、許多原生的 DOM 操作與 JavaScript 模組，以及 Firebase 的原生 CDN 版本，我們需要分步驟將系統重構為現代化的 React 專案模式。

我已經為您建立了一個基礎的 React 專案框架（存放於 `react-version/` 資料夾內），並且設定了 `react-router-dom` 來處理頁面的導航與主要結構。

## a. 已完成的架構初始化

1. **建立 Vite + React 應用**：位於 `react-version/` 目錄。
2. **安裝必要的套件**：包含了 `react-router-dom` (處理路由) 與 `firebase` (處理模組化開發)。
3. **目錄結構調整**：
   - `src/assets/css/`：負責存放您原有的樣式檔 (`base.css`, `layout.css`, `landing.css` 等)。
   - `src/components/layout/MainLayout.jsx`：對應原本 `app.html` 中的全域導覽列、Sidebar 側邊欄。
   - `src/pages/LandingPage.jsx`：對應原本 `index.html` 的登入頁。
   - `src/pages/Dashboard.jsx`：作為登入後歡迎頁，並作為未來渲染其他功能組件的路由容器。
   - `src/App.jsx`：全域路由配置中心。

## b. 下一步建議轉移順序

針對您的 CampusKing，我們建議採取**由外而內、元件抽離**的重構模式：

### 階段 1：靜態 UI 與全域樣式轉移
- 將 `css/` 下的所有檔案全部複製到 `src/assets/css/` 中，並檢查裡面是否有不相容的路徑或設定。
- 使用 JSX 語法重建 `components/layout/MainLayout.jsx` 的導覽列與選單結構。
- 將 `index.html` 的視覺元素逐步以 React 方式貼上 `LandingPage.jsx` 中（注意把 `class` 改為 `className`、HTML 屬性如 `onclick` 改為 `onClick`）。

### 階段 2：Firebase 模組化改寫
- 原本在 `index.html` 引入的是 Firebase `compat` CDN 版 (`9.22.0`)。
- 在新的目錄下 `src/firebase/config.js` 需改用 NPM 的模組化 `import { initializeApp } from 'firebase/app'` 寫法。
- 把原本 `js/firebase.js` 和 `js/auth.js` 內的功能改寫為獨立的服務函數，甚至製作成自訂 Hook (如 `useAuth`, `useFirestore`)。

### 階段 3：各大功能版塊 (Views) 轉化為 React Components
將原本在 `app.html` 裡面由 `<div id="view-xxx">` 包裹的內容切分為各自獨立的頁面或組件，並配合 React Router 導航，例如：
1. `src/pages/SchedulePage.jsx` (對應 `#view-schedule`)
2. `src/pages/LotteryPage.jsx` (對應 `#view-lottery`)
3. `src/pages/CalendarPage.jsx` (對應 `#view-calendar`)
4. ...以及成績計算 (`GradeCalc`)、記帳功能 (`Accounting`) 等等。

原本由 `document.getElementById` 去抓取元素或控制 `display: none / block` 的邏輯，要全面改為由 React 的 **State (useState)** 或者 **Router 路徑** 來動態渲染。

### 階段 4：DOM 操作改為資料驅動 (Data-Driven)
原本許多如 `scheduleBody.innerHTML += ...` 的操作，需要把抓到的資料轉成 State (例如 `const [scheduleData, setScheduleData] = useState([])`)，再透過 `map()` 函數去 render `<tr>...</tr>`。

---

如果需要在這裡「逐步改寫個別模組」（例如：先幫您把登入頁 LandingPage 的 UI 完整寫成 React），或者「把全部的 CSS 和 JS 原封不動複製進去」，請隨時告訴我！
