import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../assets/css/landing.css';

export default function LandingPage() {
  const navigate = useNavigate();
  const { currentUser, login, register, loginWithGoogle, loginAnon, resetPassword } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [isMobileModalOpen, setIsMobileModalOpen] = useState(false); // 控制手機版彈窗

  useEffect(() => {
    // 若早已登入，則由 PublicRoute 守衛阻擋，這裡也可以做防呆
    if (currentUser) {
      navigate('/app', { replace: true });
    }
  }, [currentUser, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      alert("請輸入 Email 和密碼");
      return;
    }
    try {
      if (isRegisterMode) {
        await register(email, password);
        alert("🎉 註冊成功！系統將自動登入。");
      } else {
        await login(email, password, remember);
      }
      navigate('/app');
    } catch (error) {
      alert(`${isRegisterMode ? '註冊' : '登入'}失敗：${error.message}`);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      navigate('/app');
    } catch (error) {
      alert("Google 登入錯誤：" + error.message);
    }
  };

  const handleAnonLogin = async () => {
    try {
      await loginAnon();
      navigate('/app');
    } catch (error) {
      alert("匿名登入錯誤：" + error.message);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      alert("請先在上方輸入您的 Email 信箱，系統才能寄送重設信給您！");
      return;
    }
    if (window.confirm(`確定要寄送重設密碼信件至 ${email} 嗎？`)) {
      try {
        await resetPassword(email);
        alert("📧 重設信已寄出！請檢查信箱。");
      } catch (error) {
        alert("發送失敗：" + error.message);
      }
    }
  };

  return (
    <div className="split-layout" id="landing-page" style={{ opacity: 1 }}>
      <div className="mobile-header">
        <div className="brand-logo">
          <img src="https://cdn-icons-png.flaticon.com/512/2921/2921222.png" width="28" height="28" alt="Logo" />
          大學神隊友
        </div>
        <button className="btn-login-trigger" onClick={() => setIsMobileModalOpen(true)}>登 入</button>
      </div>

      <div className="left-panel">
        <div className="brand-logo desktop-logo">
          <img src="https://cdn-icons-png.flaticon.com/512/2921/2921222.png" width="32" height="32" alt="Logo" />
          大學神隊友
        </div>
        <div className="hero-text">
          <h1>你的專屬校園導航系統</h1>
          <p className="hero-subtitle" style={{ fontSize: '1.15rem', marginTop: '15px', fontWeight: 500 }}>
            你的課表、社團、校園生活，一站搞定
          </p>
        </div>
        
        <div className="feature-highlights">
          <div className="feature-item">
            <span className="feature-icon">🛡️</span>
            <div className="feature-text">
              <strong>選課避雷指南</strong>
              <small>學長姐真實評價，輕鬆避開雷課拿高分</small>
            </div>
          </div>
          <div className="feature-item">
            <span className="feature-icon">📅</span>
            <div className="feature-text">
              <strong>學生活動行事曆</strong>
              <small>校園大小事與社團活動，一手掌握不錯過</small>
            </div>
          </div>
          <div className="feature-item">
            <span className="feature-icon">💰</span>
            <div className="feature-text">
              <strong>學生專屬記帳</strong>
              <small>輕鬆管理生活費與各項開銷，月底不再吃土</small>
            </div>
          </div>
        </div>

        <div style={{ position: 'absolute', bottom: '20px', left: 0, width: '100%', textAlign: 'center', fontSize: '0.85rem', opacity: 0.6, pointerEvents: 'none' }}>
          &copy; 2026 大學神隊友 All rights reserved.
        </div>
      </div>

      <div className={`right-panel ${isMobileModalOpen ? 'show-modal' : ''}`}>
        <div className="login-wrapper">
          <button className="btn-close-modal" onClick={() => setIsMobileModalOpen(false)}>✖</button>
          <h2>你的神隊友已上線</h2>
          <p className="subtitle">一鍵登入，全面掌握你的校園生活</p>
          
          <div className="primary-actions">
            <button className="btn-massive btn-google-massive" onClick={handleGoogleLogin}>
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" width="24" alt="Google" />
              使用 Google 一鍵登入
            </button>
            <button className="btn-massive btn-guest-massive" onClick={handleAnonLogin}>
              👻 免裝備新手試用體驗
            </button>
          </div>
          
          <div className="divider">或使用 Email {isRegisterMode ? '註冊' : '登入'}</div>
          
          <form className="secondary-login" onSubmit={handleSubmit}>
            <div className="input-group">
              <input 
                type="email" 
                placeholder="電子信箱" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
              />
            </div>
            <div className="input-group" style={{ marginBottom: '10px' }}>
              <input 
                type="password" 
                placeholder="密碼 (至少6位數)" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
              />
            </div>
            {!isRegisterMode && (
              <div className="login-options">
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    style={{ marginRight: '8px', width: '16px', height: '16px', accentColor: 'var(--primary)' }} 
                    checked={remember} 
                    onChange={(e) => setRemember(e.target.checked)} 
                  /> 保持登入
                </label>
                <a onClick={handleForgotPassword} style={{ cursor: 'pointer' }}>忘記密碼？</a>
              </div>
            )}
            <button type="submit" className="btn-main-outline">信箱{isRegisterMode ? '註冊' : '登入'}</button>
          </form>

          <div className="toggle-mode">
            <span style={{ color: 'var(--text-muted)', fontWeight: 'normal' }}>
              {isRegisterMode ? '已經有帳號了？' : '還不是校園王？'}
            </span>
            <span onClick={() => setIsRegisterMode(!isRegisterMode)} id="toggle-btn" style={{ cursor: 'pointer', marginLeft: '8px', color: 'var(--primary)', fontWeight: 'bold' }}>
              {isRegisterMode ? '立即登入' : '立即加入行列'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
