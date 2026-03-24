import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import '../../assets/css/layout.css';
import '../../assets/css/components.css';

function MainLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

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
            <button className="nav-item" onClick={() => alert('開啟回報視窗')}>回應問題</button>
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
    </>
  );
}

export default MainLayout;
