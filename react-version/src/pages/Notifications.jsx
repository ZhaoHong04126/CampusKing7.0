import { useState, useEffect } from 'react';

export default function Notifications() {
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('system_notifications');
    return saved ? JSON.parse(saved) : [];
  });

  const markAllRead = () => {
    alert("已將所有通知標示為已讀");
  };

  const clearAll = () => {
    if (window.confirm("確定要清除所有通知嗎？")) {
      setNotifications([]);
      localStorage.removeItem('system_notifications');
    }
  };

  const togglePush = () => {
    alert("系統推播通知設定功能尚未連接伺服器！");
  };

  return (
    <div id="view-notifications" style={{ animation: 'fadeIn 0.3s' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid var(--bg)', paddingBottom: '10px', marginBottom: '15px' }}>
        <h2 style={{ margin: 0, border: 'none', padding: 0 }}>🔔 通知中心</h2>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            id="btn-toggle-push" 
            className="btn-icon" 
            onClick={togglePush} 
            style={{ fontSize: '0.85rem', background: '#e3f2fd', border: '1px solid #1565c0', color: '#1565c0', transition: 'all 0.3s', padding: '6px 12px', borderRadius: '4px' }}
          >
            開啟系統通知
          </button>
          <button 
            className="btn-icon" 
            onClick={markAllRead} 
            style={{ fontSize: '0.85rem', background: 'transparent', border: '1px solid #1565c0', color: '#1565c0', transition: 'all 0.3s', padding: '6px 12px', borderRadius: '4px' }}
          >
            全部已讀
          </button>
          <button 
            className="btn-icon" 
            onClick={clearAll} 
            style={{ fontSize: '0.85rem', background: 'transparent', border: '1px solid #ddd', color: '#888', transition: 'all 0.3s', padding: '6px 12px', borderRadius: '4px' }}
          >
            清除全部
          </button>
        </div>
      </div>
      
      <div id="notification-list">
        {notifications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
            <div style={{ fontSize: '3rem', marginBottom: '10px' }}>📦</div>
            目前沒有任何新通知
          </div>
        ) : (
          notifications.map((n, i) => (
             <div key={i} className="card" style={{ padding: '15px', marginBottom: '10px', borderLeft: '4px solid var(--primary)' }}>
                <div style={{ fontWeight: 'bold' }}>{n.title}</div>
                <div style={{ color: '#555', fontSize: '0.9rem', marginTop: '5px' }}>{n.message}</div>
             </div>
          ))
        )}
      </div>
    </div>
  );
}
