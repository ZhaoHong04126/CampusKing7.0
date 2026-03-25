import { useState, useEffect } from 'react';

export default function Anniversary() {
  const [anniversaryList, setAnniversaryList] = useState(() => {
    const saved = localStorage.getItem('anniversaryList');
    return saved ? JSON.parse(saved) : [];
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ title: '', date: '' });

  useEffect(() => {
    localStorage.setItem('anniversaryList', JSON.stringify(anniversaryList));
  }, [anniversaryList]);

  const sortedList = [...anniversaryList].sort((a, b) => new Date(a.date) - new Date(b.date));

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const handleOpenModal = () => {
    setFormData({ title: '', date: '' });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.title || !formData.date) {
      alert("請輸入標題與日期");
      return;
    }
    setAnniversaryList([...anniversaryList, formData]);
    setIsModalOpen(false);
    alert("紀念日已新增！");
  };

  const handleDelete = (index) => {
    if (window.confirm("確定要刪除這個紀念日嗎？")) {
      const newList = [...sortedList];
      newList.splice(index, 1);
      setAnniversaryList(newList);
    }
  };

  return (
    <div id="view-anniversary" style={{ animation: 'fadeIn 0.3s' }}>
      <div className="card">
        <h2>💝 紀念日 & 倒數</h2>
        <div id="anniversary-list" style={{ minHeight: '200px' }}>
          {sortedList.length === 0 ? (
            <p style={{ color: '#999', textAlign: 'center', padding: '20px' }}>
              💝 新增第一個到數日吧！<br />(例如：交往紀念、生日倒數)
            </p>
          ) : (
            sortedList.map((item, index) => {
              const targetDate = new Date(item.date);
              targetDate.setHours(0, 0, 0, 0);
              
              const diffTime = now - targetDate;
              const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
              
              let statusText = "";
              let daysText = "";
              let colorClass = {};

              if (diffDays === 0) {
                statusText = "就是今天！";
                daysText = "TODAY";
                colorClass = { color: '#e74c3c', fontWeight: 'bold' };
              } else if (diffDays > 0) {
                statusText = "已過去";
                daysText = `${diffDays} 天`;
                colorClass = { color: '#7f8c8d' };
              } else {
                statusText = "還有";
                daysText = `${Math.abs(diffDays)} 天`;
                colorClass = { color: '#27ae60', fontWeight: 'bold' };
              }

              return (
                <div key={index} style={{ background: 'white', borderBottom: '1px solid #eee', padding: '15px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--text-main)', marginBottom: '4px' }}>
                      {item.title}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#888' }}>
                      {item.date} ({statusText})
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.4rem', ...colorClass }}>{daysText}</div>
                    <button onClick={() => handleDelete(index)} style={{ background: 'transparent', border: 'none', color: '#e74c3c', fontSize: '0.8rem', cursor: 'pointer', marginTop: '5px', opacity: 0.7 }}>
                      🗑️ 刪除
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
        <button className="btn btn-add" onClick={handleOpenModal}>+ 新增紀念日</button>
      </div>

      {isModalOpen && (
        <div className="modal" style={{ display: 'flex' }}>
          <div className="modal-content" style={{ width: '90%', maxWidth: '400px', textAlign: 'left' }}>
            <h3 style={{ textAlign: 'center', marginTop: 0 }}>📅 新增紀念日</h3>
            <div className="input-group" style={{ marginBottom: '15px' }}>
              <label>標題 (例如：交往、生日)</label>
              <input type="text" className="login-input" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} placeholder="輸入標題..." style={{ background: 'white', border: '1px solid #ddd', padding: '10px', width: '100%', marginBottom: 0 }} />
            </div>
            <div className="input-group" style={{ marginBottom: '15px' }}>
              <label>日期</label>
              <input type="date" className="login-input" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} style={{ background: 'white', border: '1px solid #ddd', padding: '10px', width: '100%', marginBottom: 0 }} />
            </div>
            <button className="btn" onClick={handleSave} style={{ width: '100%', background: 'var(--primary)' }}>+ 確定新增</button>
            <button className="btn" onClick={() => setIsModalOpen(false)} style={{ width: '100%', marginTop: '10px', background: 'transparent', color: '#666', border: '1px solid #ddd' }}>取消</button>
          </div>
        </div>
      )}
    </div>
  );
}
