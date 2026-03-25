import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import '../../assets/css/layout.css';
import '../../assets/css/components.css';

function MainLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [feedbackType, setFeedbackType] = useState('bug');
  const [feedbackContent, setFeedbackContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitFeedback = async () => {
    if (!feedbackContent.trim()) {
      alert("請輸入回饋內容！");
      return;
    }
    setIsSubmitting(true);
    try {
      const uid = user ? user.uid : "anonymous";
      await addDoc(collection(db, "feedbacks"), {
        uid: uid,
        type: feedbackType,
        content: feedbackContent,
        status: "pending",
        timestamp: serverTimestamp()
      });
      alert("感謝您的回饋！我們已經收到囉。");
      setFeedbackContent("");
      setIsFeedbackModalOpen(false);
    } catch (error) {
      console.error("送出回饋失敗:", error);
      alert("送出失敗，請稍後再試。");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // The className logic for NavLink: automatically applies "active" class
  const navLinkClass = ({ isActive }) =>
    isActive ? 'nav-item active' : 'nav-item';

  return (
    <>
      <nav id="top-bar" style={{ display: 'flex' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <button
            id="mobile-menu-btn"
            onClick={toggleMobileMenu}
            style={{ background: 'transparent', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer', padding: '5px' }}
          >
            ☰
          </button>
          <h1 id="app-title" style={{ margin: 0, fontSize: '1.3rem', fontWeight: 'bold', letterSpacing: '1px' }}>
            大學神隊友
          </h1>
        </div>

        <div style={{ display: 'flex', alignItems: 'center' }}>
          <NavLink to="/app/notifications" style={{ background: 'transparent', border: 'none', color: 'white', fontSize: '1.3rem', cursor: 'pointer', padding: '10px', position: 'relative', textDecoration: 'none' }} title="通知中心">
            🔔 <span id="notification-badge" style={{ display: 'none', position: 'absolute', top: '8px', right: '8px', width: '8px', height: '8px', backgroundColor: '#e74c3c', borderRadius: '50%' }}></span>
          </NavLink>
        </div>
      </nav>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div id="sidebar-overlay" onClick={toggleMobileMenu} style={{ display: 'block' }}></div>
      )}

      <div className="dashboard-container" style={{ display: 'flex' }}>
        <aside className={`desktop-sidebar ${isMobileMenuOpen ? 'open' : ''}`} id="sidebar">
          {/* 學期選擇器區域 (假資料示範) */}
          <div style={{ textAlign: 'left', background: '#f8f9fa', padding: '12px', borderRadius: '12px', border: '1px solid #eee', marginTop: '5px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.8rem', color: '#888', fontWeight: 'bold' }}>📅 目前學期</span>
              <div style={{ display: 'flex', gap: '2px' }}>
                <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '2px', fontSize: '0.9rem' }} title="重新命名">✏️</button>
                <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '2px', fontSize: '0.9rem' }} title="新增學期">➕</button>
              </div>
            </div>
            <select className="semester-select" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ddd', fontWeight: 'bold', color: 'var(--primary)', fontSize: '1rem', background: 'white', outline: 'none', cursor: 'pointer' }}>
              <option>112-2 學期</option>
            </select>
          </div>

          {/* 導航選單 */}
          <nav className="sidebar-nav">
            <div style={{ fontSize: '0.75rem', color: '#999', margin: '10px 0 5px 10px', fontWeight: 'bold' }}>主選單</div>
            <NavLink to="/app/schedule" className={navLinkClass}>📅 智慧課表</NavLink>
            <NavLink to="/app/accounting" className={navLinkClass}>💰 學期記帳</NavLink>
            <NavLink to="/app/calendar" className={navLinkClass}>🗓️ 行事曆</NavLink>

            <div style={{ fontSize: '0.75rem', color: '#999', margin: '15px 0 5px 10px', fontWeight: 'bold' }}>小工具</div>
            <NavLink to="/app/lottery" className={navLinkClass}>🎰 幸運籤筒</NavLink>
            <NavLink to="/app/self-study" className={navLinkClass}>🏃 自主學習活動</NavLink>
            <NavLink to="/app/grade-calc" className={navLinkClass}>🧮 配分筆記</NavLink>
            <NavLink to="/app/grade-manager" className={navLinkClass}>💯 成績與學分</NavLink>
            <NavLink to="/app/homework" className={navLinkClass}>🎒 作業與小考</NavLink>
            <NavLink to="/app/anniversary" className={navLinkClass}>💝 紀念日倒數</NavLink>

            <div style={{ fontSize: '0.75rem', color: '#999', margin: '15px 0 5px 10px', fontWeight: 'bold' }}>系統</div>
            <button className="nav-item" onClick={() => setIsFeedbackModalOpen(true)}>回應問題</button>
            <NavLink to="/app/settings" className={navLinkClass}>⚙️ 個人設定</NavLink>
            <button className="nav-item" onClick={async () => {
              await logout();
            }} style={{ color: '#e74c3c' }}>🚪 登出系統</button>
            
            {/* 視管理員權限顯示 */}
            {/* 
            <div style={{ fontSize: '0.75rem', color: '#e74c3c', margin: '15px 0 5px 10px', fontWeight: 'bold' }}>管理者</div>
            <NavLink to="/app/admin" className={navLinkClass}>👑 系統管理台</NavLink>
            <NavLink to="/app/admin-feedback" className={navLinkClass}>💬 回饋管理</NavLink> 
            */}
          </nav>
        </aside>

        <main className="main-content" id="main-content-area">
          <Outlet />
        </main>
      </div>

      {/* 意見回饋 / 問題回報 Modal */}
      {isFeedbackModalOpen && (
        <div className="modal" style={{ display: 'flex' }}>
          <div className="modal-content" style={{ width: '90%', maxWidth: '500px', textAlign: 'left' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h2 style={{ margin: 0, padding: 0, border: 'none' }}>💡 意見回饋 / 🐞 問題回報</h2>
              <span 
                onClick={() => setIsFeedbackModalOpen(false)} 
                style={{ cursor: 'pointer', fontSize: '1.5rem', color: '#888' }}
              >
                &times;
              </span>
            </div>
            
            <div className="input-group" style={{ marginBottom: '15px' }}>
              <label>類型：</label>
              <select 
                value={feedbackType} 
                onChange={(e) => setFeedbackType(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd', background: 'white' }}
              >
                <option value="bug">🐞 系統 Bug 回報</option>
                <option value="suggestion">💡 新功能建議</option>
                <option value="other">💬 其他想說的話</option>
              </select>
            </div>
            
            <div className="input-group" style={{ marginBottom: '15px' }}>
              <label>詳細內容：</label>
              <textarea 
                rows="4" 
                placeholder="請詳細描述您遇到的問題或建議..."
                value={feedbackContent}
                onChange={(e) => setFeedbackContent(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd', resize: 'vertical' }}
              />
            </div>
            
            <button 
              className="btn" 
              onClick={submitFeedback} 
              disabled={isSubmitting}
              style={{ width: '100%', background: 'var(--primary)' }}
            >
              {isSubmitting ? '送出中...' : '送出回饋'}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default MainLayout;
