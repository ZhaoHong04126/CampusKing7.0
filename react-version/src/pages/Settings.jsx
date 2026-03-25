import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Settings() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [isSemesterEdit, setIsSemesterEdit] = useState(false);
  const [semesterStart, setSemesterStart] = useState(() => localStorage.getItem('semesterStart') || '');
  const [semesterEnd, setSemesterEnd] = useState(() => localStorage.getItem('semesterEnd') || '');
  
  const [isGeneralEdit, setIsGeneralEdit] = useState(false);
  const [isBackupEdit, setIsBackupEdit] = useState(false);
  const [isAccountEdit, setIsAccountEdit] = useState(false);

  const [schoolInfo, setSchoolInfo] = useState(() => localStorage.getItem('schoolInfo') || '未設定');
  const [themeMode, setThemeMode] = useState(() => localStorage.getItem('themeMode') || 'OFF');

  const saveSemesterDates = () => {
    localStorage.setItem('semesterStart', semesterStart);
    localStorage.setItem('semesterEnd', semesterEnd);
    setIsSemesterEdit(false);
    alert('學期時間已更新');
  };

  const handleEditSchool = () => {
    if (!isGeneralEdit) {
      alert("目前為「🔒 唯讀模式」，請先點擊右上角解鎖編輯。");
      return;
    }
    const info = window.prompt("請輸入學校與科系名稱：", schoolInfo);
    if (info !== null && info.trim() !== '') {
      setSchoolInfo(info);
      localStorage.setItem('schoolInfo', info);
    }
  };

  const toggleTheme = () => {
    if (!isGeneralEdit) {
      alert("目前為「🔒 唯讀模式」，請先點擊右上角解鎖編輯。");
      return;
    }
    const newMode = themeMode === 'OFF' ? 'ON' : 'OFF';
    setThemeMode(newMode);
    localStorage.setItem('themeMode', newMode);
    // Real implementation would add/remove global dark mode class
    alert(`💡 主題設定即將實裝，暫時切換為: ${newMode}`);
  };

  const exportDataToFile = () => {
    if (!isBackupEdit) {
      alert("目前為「🔒 唯讀模式」，請先點擊右上角解鎖。");
      return;
    }
    const data = JSON.stringify(localStorage);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `campus_king_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const triggerImport = () => {
    if (!isBackupEdit) {
      alert("目前為「🔒 唯讀模式」，請先點擊右上角解鎖。");
      return;
    }
    document.getElementById('import-file-input').click();
  };

  const importDataFromFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (window.confirm("警告：還原將覆蓋目前的全部資料，確定要繼續嗎？")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target.result);
          Object.keys(parsed).forEach(key => {
            localStorage.setItem(key, parsed[key]);
          });
          alert("資料還原成功！將重新載入頁面。");
          window.location.reload();
        } catch (err) {
          alert("檔案格式錯誤");
        }
      };
      reader.readAsText(file);
    }
  };

  const handleLogout = async () => {
    if (!isAccountEdit) {
      alert("目前為「🔒 唯讀模式」，請先點擊右上角解鎖。");
      return;
    }
    if (window.confirm("確定要登出嗎？")) {
      await logout();
      navigate('/login');
    }
  };

  const handleDeleteAccount = () => {
    if (!isAccountEdit) {
      alert("目前為「🔒 唯讀模式」，請先點擊右上角解鎖。");
      return;
    }
    if (window.confirm("這會永久刪除所有資料且無法復原！你要繼續嗎？")) {
      alert("請聯絡管理員執行此操作。");
    }
  };

  return (
    <div id="view-settings" style={{ animation: 'fadeIn 0.3s' }}>
      
      {/* 學期設定 */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', paddingBottom: '10px', borderBottom: '2px solid #f4f7f6' }}>
          <h2 style={{ margin: 0, border: 'none', padding: 0 }}>📅 學期期間設定</h2>
          <button 
            className="btn-icon" 
            onClick={() => setIsSemesterEdit(!isSemesterEdit)} 
            style={{ fontSize: '0.85rem', transition: 'all 0.3s', padding: '6px 12px', background: isSemesterEdit ? '#e6f0ff' : 'transparent', color: isSemesterEdit ? 'var(--primary)' : '#888', border: isSemesterEdit ? '1px solid var(--primary)' : '1px solid #ddd', borderRadius: '4px' }}
          >
            {isSemesterEdit ? '✏️ 編輯模式' : '🔒 唯讀模式'}
          </button>
        </div>

        {!isSemesterEdit ? (
          <div id="semester-date-view-mode">
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ color: 'var(--text-sub)' }}>學期開始</span>
              <span id="text-sem-start" style={{ fontWeight: 'bold', color: 'var(--text-main)' }}>{semesterStart || '未設定'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)', marginBottom: '15px' }}>
              <span style={{ color: 'var(--text-sub)' }}>學期結束</span>
              <span id="text-sem-end" style={{ fontWeight: 'bold', color: 'var(--text-main)' }}>{semesterEnd || '未設定'}</span>
            </div>
          </div>
        ) : (
          <div id="semester-date-edit-mode">
            <div style={{ background: '#f9f9f9', padding: '15px', borderRadius: '8px', marginBottom: '15px' }}>
              <div className="input-group">
                <label>學期開始日 (第 1 週)</label>
                <input type="date" value={semesterStart} onChange={e => setSemesterStart(e.target.value)} style={{ background: 'white', width: '100%', padding: '10px', border: '1px solid #ddd' }} />
              </div>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label>學期結束日</label>
                <input type="date" value={semesterEnd} onChange={e => setSemesterEnd(e.target.value)} style={{ background: 'white', width: '100%', padding: '10px', border: '1px solid #ddd' }} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
              <button className="btn" onClick={saveSemesterDates} style={{ flex: 2, background: 'var(--primary)' }}>💾 儲存</button>
              <button className="btn" onClick={() => setIsSemesterEdit(false)} style={{ flex: 1, background: 'transparent', color: '#888', border: '1px solid #ddd' }}>取消</button>
            </div>
          </div>
        )}
      </div>

      {/* 一般設定 */}
      <div className="card">
        <h2 style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>⚙️ 一般設定</span>
          <button 
            className="btn-icon" 
            onClick={() => setIsGeneralEdit(!isGeneralEdit)} 
            style={{ fontSize: '0.85rem', transition: 'all 0.3s', padding: '6px 12px', background: isGeneralEdit ? '#e6f0ff' : 'transparent', color: isGeneralEdit ? 'var(--primary)' : '#888', border: isGeneralEdit ? '1px solid var(--primary)' : '1px solid #ddd', borderRadius: '4px' }}
          >
            {isGeneralEdit ? '✏️ 編輯模式' : '🔒 唯讀模式'}
          </button>
        </h2>
        <div className="settings-list" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div className="settings-item" onClick={handleEditSchool} style={{ padding: '15px', background: '#f8f9fa', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
            <div><span className="settings-icon" style={{ marginRight: '8px' }}>🏫</span>學校與科系</div>
            <span id="setting-school-info" style={{ color: '#888', fontSize: '0.9rem' }}>{schoolInfo}</span>
          </div>
          <div className="settings-item" onClick={() => { if(!isGeneralEdit) alert("目前為唯讀模式"); else alert("課表時程設定即將實裝..."); }} style={{ padding: '15px', background: '#f8f9fa', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
            <div><span className="settings-icon" style={{ marginRight: '8px' }}>⏰</span>自訂各節次時程</div>
            <span style={{ color: '#888', fontSize: '0.9rem' }}>➤</span>
          </div>
          <div className="settings-item" onClick={toggleTheme} style={{ padding: '15px', background: '#f8f9fa', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
            <div><span className="settings-icon" style={{ marginRight: '8px' }}>🌙</span>深色模式</div>
            <span id="theme-status" style={{ fontSize: '0.8rem', fontWeight: 'bold', color: themeMode === 'ON' ? 'var(--primary)' : '#aaa' }}>{themeMode}</span>
          </div>
        </div>
      </div>

      {/* 帳號管理 */}
      <div className="card">
        <h2 style={{ color: '#e74c3c', borderBottomColor: '#fff0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>🛡️ 帳號管理</span>
          <button 
            className="btn-icon" 
            onClick={() => setIsAccountEdit(!isAccountEdit)} 
            style={{ fontSize: '0.85rem', transition: 'all 0.3s', padding: '6px 12px', background: isAccountEdit ? '#ffebee' : 'transparent', color: isAccountEdit ? '#e74c3c' : '#888', border: isAccountEdit ? '1px solid #e74c3c' : '1px solid #ddd', borderRadius: '4px' }}
          >
            {isAccountEdit ? '✏️ 編輯模式' : '🔒 唯讀模式'}
          </button>
        </h2>
        <div className="settings-list" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div className="settings-item" onClick={handleLogout} style={{ padding: '15px', background: '#f8f9fa', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', color: '#e74c3c', fontWeight: 'bold' }}>
            <div><span className="settings-icon" style={{ marginRight: '8px' }}>🚪</span>登出帳號</div>
          </div>
          <div className="settings-item" onClick={handleDeleteAccount} style={{ padding: '15px', background: '#f8f9fa', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', color: '#c0392b', borderTop: '1px dashed #eee' }}>
            <div><span className="settings-icon" style={{ marginRight: '8px' }}>💀</span>註銷帳號 (永久刪除)</div>
            <span style={{ color: '#888', fontSize: '0.9rem' }}>➤</span>
          </div>
        </div>
      </div>

      {/* 資料備份與還原 */}
      <div className="card">
        <h2 style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>💾 資料備份與還原</span>
          <button 
            className="btn-icon" 
            onClick={() => setIsBackupEdit(!isBackupEdit)} 
            style={{ fontSize: '0.85rem', transition: 'all 0.3s', padding: '6px 12px', background: isBackupEdit ? '#e6f0ff' : 'transparent', color: isBackupEdit ? 'var(--primary)' : '#888', border: isBackupEdit ? '1px solid var(--primary)' : '1px solid #ddd', borderRadius: '4px' }}
          >
            {isBackupEdit ? '✏️ 編輯模式' : '🔒 唯讀模式'}
          </button>
        </h2>
        <p style={{ fontSize: '0.85rem', color: '#888', marginBottom: '12px', marginTop: '5px' }}>將所有學期紀錄打包成「專屬大學回憶包」下載，或從先前的備份還原。</p>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button className="btn" onClick={exportDataToFile} style={{ fontSize: '0.85rem', padding: '6px 14px', width: 'auto', background: '#2ecc71', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>📥 匯出</button>
          <button className="btn" onClick={triggerImport} style={{ fontSize: '0.85rem', padding: '6px 14px', width: 'auto', background: '#3498db', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>📤 匯入</button>
          <input type="file" id="import-file-input" accept=".json" style={{ display: 'none' }} onChange={importDataFromFile} />
        </div>
      </div>

    </div>
  );
}
