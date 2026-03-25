import { useState, useEffect } from 'react';

export default function SelfStudy() {
  const [activities, setActivities] = useState(() => {
    const saved = localStorage.getItem('selfStudyActivities');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [conversionRate, setConversionRate] = useState(() => {
    const saved = localStorage.getItem('selfStudyConversionRate');
    return saved ? Number(saved) : 18;
  });

  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [isRateModalOpen, setIsRateModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    location: '',
    date: new Date().toISOString().split('T')[0],
    hours: ''
  });

  const [rateInput, setRateInput] = useState(conversionRate);

  // Save to localStorage when state changes (like old app)
  useEffect(() => {
    localStorage.setItem('selfStudyActivities', JSON.stringify(activities));
  }, [activities]);

  useEffect(() => {
    localStorage.setItem('selfStudyConversionRate', conversionRate.toString());
  }, [conversionRate]);

  const totalHours = activities.reduce((sum, item) => sum + (parseFloat(item.hours) || 0), 0);
  const credits = Math.floor(totalHours / conversionRate);
  const hoursLeft = conversionRate - (totalHours % conversionRate);

  const sortedActivities = [...activities].sort((a, b) => new Date(b.date) - new Date(a.date));

  const handleOpenActivityModal = (activity = null) => {
    if (activity) {
      setEditingId(activity.id);
      setFormData({
        name: activity.name,
        location: activity.location || '',
        date: activity.date,
        hours: activity.hours
      });
    } else {
      setEditingId(null);
      setFormData({
        name: '',
        location: '',
        date: new Date().toISOString().split('T')[0],
        hours: ''
      });
    }
    setIsActivityModalOpen(true);
  };

  const handleSaveActivity = () => {
    const { name, location, date, hours } = formData;
    const numHours = parseFloat(hours);
    
    if (!name || !date || isNaN(numHours) || numHours <= 0) {
      alert("請輸入活動名稱、日期與有效的獲得時數");
      return;
    }

    if (editingId) {
      setActivities(activities.map(a => a.id === editingId ? { ...a, name, location, date, hours: numHours } : a));
      alert("活動修改成功！");
    } else {
      setActivities([...activities, { id: Date.now(), name, location, date, hours: numHours }]);
      alert("活動已新增！");
    }
    setIsActivityModalOpen(false);
  };

  const handleDeleteActivity = (id) => {
    if (window.confirm("確定要刪除這筆活動紀錄嗎？")) {
      setActivities(activities.filter(a => a.id !== id));
    }
  };

  const handleSaveRate = () => {
    const rate = parseFloat(rateInput);
    if (!isNaN(rate) && rate > 0) {
      setConversionRate(rate);
      setIsRateModalOpen(false);
      alert("已成功更新自主學習學分兌換率！");
    } else {
      alert("請輸入大於 0 的有效數字！");
    }
  };

  const handleSyncGrades = () => {
    if (credits === 0) {
      alert(`目前累計時數不足以兌換學分（需滿 ${conversionRate} 小時）。\n繼續加油去參加活動吧！`);
      return;
    }
    
    alert(`此功能尚未串連後端，目前累計可換得 ${credits} 學分！\n(將來會自動匯入至成績單「自主學習」欄位)`);
  };

  return (
    <div id="view-self-study" style={{ animation: 'fadeIn 0.3s' }}>
      <div className="card" style={{ textAlign: 'center', padding: '30px 20px' }}>
        <h2 style={{ justifyContent: 'center', border: 'none', marginBottom: '20px' }}>🏃 自主學習進度</h2>
        <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '20px' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '5px' }}>累計時數</div>
            <div id="self-study-total-hours" style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary)' }}>
              {totalHours}
            </div>
          </div>
          <div style={{ flex: 1, borderLeft: '1px solid #eee', borderRight: '1px solid #eee' }}>
            <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '5px' }}>可得學分</div>
            <div id="self-study-credits" style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2ecc71' }}>
              {credits}
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '5px' }}>距離下學分還需</div>
            <div id="self-study-hours-left" style={{ fontSize: '2rem', fontWeight: 'bold', color: '#e74c3c' }}>
              {hoursLeft}
            </div>
          </div>
        </div>
        <button className="btn" onClick={handleSyncGrades} style={{ background: '#e8f5e9', color: '#2e7d32', fontWeight: 'bold' }}>
          🔄 結算並同步至成績單
        </button>
        <div style={{ fontSize: '0.8rem', color: '#999', marginTop: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
          (每滿 <span id="text-self-study-rate">{conversionRate}</span> 小時可兌換 1 學分)
          <button 
            onClick={() => { setRateInput(conversionRate); setIsRateModalOpen(true); }} 
            style={{ background: '#f0f0f0', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', padding: '4px 8px', transition: 'all 0.2s' }} 
            title="編輯兌換率"
          >
            ✏️ 編輯
          </button>
        </div>
      </div>

      <div className="card">
        <h2>📝 活動紀錄</h2>
        <div id="self-study-list" style={{ minHeight: '150px' }}>
          {sortedActivities.length === 0 ? (
            <p style={{ color: '#999', textAlign: 'center', padding: '20px' }}>目前沒有活動紀錄，趕快去參加活動吧！</p>
          ) : (
            sortedActivities.map(item => (
              <div key={item.id} className="card" style={{ marginBottom: '12px', padding: '15px', borderLeft: '5px solid var(--primary)', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1, cursor: 'pointer' }} onClick={() => handleOpenActivityModal(item)}>
                    <div style={{ fontSize: '0.85rem', color: '#888', marginBottom: '4px' }}>
                      {item.date} • {item.location || '無地點'}
                    </div>
                    <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: 'var(--text-main)', marginBottom: '5px' }}>
                      {item.name}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', alignItems: 'flex-end' }}>
                    <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--primary)' }}>{item.hours} 小時</span>
                    <div style={{ display: 'flex', gap: '5px' }}>
                      <button onClick={() => handleOpenActivityModal(item)} style={{ background: 'transparent', border: 'none', color: '#f39c12', cursor: 'pointer', fontSize: '0.9rem' }}>✏️</button>
                      <button onClick={() => handleDeleteActivity(item.id)} style={{ background: 'transparent', border: 'none', color: '#ccc', cursor: 'pointer', fontSize: '0.9rem' }}>🗑️</button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        <button className="btn btn-add" onClick={() => handleOpenActivityModal()}>+ 新增活動紀錄</button>
      </div>

      {/* Activity Modal */}
      {isActivityModalOpen && (
        <div className="modal" style={{ display: 'flex' }}>
          <div className="modal-content" style={{ textAlign: 'left', width: '90%', maxWidth: '400px' }}>
            <h3 style={{ textAlign: 'center', marginTop: 0 }}>
              {editingId ? '✏️ 編輯活動紀錄' : '🏃 新增活動紀錄'}
            </h3>
            
            <div className="input-group">
              <label>活動名稱</label>
              <input type="text" className="login-input" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="例如：校園講座、志工服務" style={{ background: 'white', border: '1px solid #ddd', padding: '10px', marginBottom: 0, width: '100%' }} />
            </div>
            <div className="input-group" style={{ marginTop: '15px' }}>
              <label>活動地點</label>
              <input type="text" className="login-input" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} placeholder="例如：大禮堂" style={{ background: 'white', border: '1px solid #ddd', padding: '10px', marginBottom: 0, width: '100%' }} />
            </div>
            <div className="input-group" style={{ marginTop: '15px' }}>
              <label>日期</label>
              <input type="date" className="login-input" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} style={{ background: 'white', border: '1px solid #ddd', padding: '10px', marginBottom: 0, width: '100%' }} />
            </div>
            <div className="input-group" style={{ marginTop: '15px', marginBottom: '15px' }}>
              <label>獲得時數</label>
              <input type="number" className="login-input" value={formData.hours} onChange={(e) => setFormData({...formData, hours: e.target.value})} placeholder="例如：2" style={{ background: 'white', border: '1px solid #ddd', padding: '10px', marginBottom: 0, width: '100%' }} />
            </div>
            
            <button className="btn" onClick={handleSaveActivity} style={{ width: '100%', background: editingId ? '#f39c12' : 'var(--primary)' }}>
              {editingId ? '💾 儲存修改' : '+ 儲存'}
            </button>
            <button className="btn" onClick={() => setIsActivityModalOpen(false)} style={{ width: '100%', marginTop: '10px', background: 'transparent', color: '#666', border: '1px solid #ddd' }}>
              取消
            </button>
          </div>
        </div>
      )}

      {/* Conversion Rate Modal */}
      {isRateModalOpen && (
        <div className="modal" style={{ display: 'flex' }}>
          <div className="modal-content" style={{ textAlign: 'left', width: '90%', maxWidth: '400px' }}>
            <h3 style={{ textAlign: 'center', marginTop: 0 }}>⚙️ 自訂學分兌換率</h3>
            <p style={{ textAlign: 'center', color: '#888', fontSize: '0.85rem', marginBottom: '15px' }}>
              設定每獲得多少小時，可以兌換 1 學分。
            </p>
            <div className="input-group" style={{ marginBottom: '15px' }}>
              <label>兌換 1 學分所需時數</label>
              <input type="number" className="login-input" value={rateInput} onChange={(e) => setRateInput(e.target.value)} placeholder="例如：18" min="1" step="1" style={{ background: 'white', border: '1px solid #ddd', padding: '10px', width: '100%', marginBottom: 0 }} />
            </div>
            <button className="btn" onClick={handleSaveRate} style={{ width: '100%', background: 'var(--primary)' }}>
              💾 儲存設定
            </button>
            <button className="btn" onClick={() => setIsRateModalOpen(false)} style={{ width: '100%', marginTop: '10px', background: 'transparent', color: '#666', border: '1px solid #ddd' }}>
              取消
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
