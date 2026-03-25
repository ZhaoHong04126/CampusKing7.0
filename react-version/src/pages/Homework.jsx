import { useState, useEffect } from 'react';

export default function Homework() {
  const [homeworkList, setHomeworkList] = useState(() => {
    const saved = localStorage.getItem('homeworkList');
    return saved ? JSON.parse(saved) : [];
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(-1);

  const [formData, setFormData] = useState({
    subject: '',
    customSubject: '',
    useSelect: true,
    title: '',
    date: new Date().toISOString().split('T')[0],
    score: '',
    total: 100,
    completed: false
  });

  useEffect(() => {
    localStorage.setItem('homeworkList', JSON.stringify(homeworkList));
  }, [homeworkList]);

  const sortedList = [...homeworkList].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    return new Date(a.date) - new Date(b.date);
  });

  const totalCount = homeworkList.length;
  const completedCount = homeworkList.filter(h => h.completed).length;

  const handleOpenModal = (index = -1) => {
    if (index > -1) {
      const item = homeworkList[index];
      setEditingIndex(index);
      setFormData({
        subject: item.subject,
        customSubject: item.subject,
        useSelect: false, // Default to custom input mode for edits unless we implement robust pre-filling
        title: item.title,
        date: item.date,
        score: item.score || '',
        total: item.total || 100,
        completed: item.completed
      });
    } else {
      setEditingIndex(-1);
      setFormData({
        subject: '',
        customSubject: '',
        useSelect: false, // Since we don't have weeklySchedule context, manual input is safest
        title: '',
        date: new Date().toISOString().split('T')[0],
        score: '',
        total: 100,
        completed: false
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    const finalSubject = formData.useSelect ? formData.subject : formData.customSubject;
    const { title, date, score, total, completed } = formData;

    if (!finalSubject || !title || !date) {
      alert("請輸入科目、作業名稱與日期");
      return;
    }

    const homeworkData = {
      subject: finalSubject,
      title,
      date,
      score,
      total: total || 100,
      completed
    };

    if (editingIndex > -1) {
      const newList = [...homeworkList];
      newList[editingIndex] = homeworkData;
      setHomeworkList(newList);
      alert("作業修改成功！");
    } else {
      setHomeworkList([...homeworkList, homeworkData]);
      alert("作業已新增！");
    }

    setIsModalOpen(false);
  };

  const handleDelete = (index) => {
    if (window.confirm("確定要刪除這項作業嗎？")) {
      const newList = [...homeworkList];
      newList.splice(index, 1);
      setHomeworkList(newList);
    }
  };

  const toggleStatus = (index) => {
    const newList = [...homeworkList];
    newList[index].completed = !newList[index].completed;
    setHomeworkList(newList);
  };

  return (
    <div id="view-homework" style={{ animation: 'fadeIn 0.3s' }}>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <h2 style={{ margin: 0, border: 'none' }}>🎒 作業成績</h2>
          <div id="homework-summary" style={{ fontSize: '0.85rem', color: '#666' }}>
            <span style={{ marginRight: '15px' }}>總計: <b>{totalCount}</b></span>
            <span style={{ color: '#2ecc71' }}>完成: <b>{completedCount}</b></span> / 
            <span style={{ color: '#e74c3c' }}> 未完: <b>{totalCount - completedCount}</b></span>
          </div>
        </div>

        <div id="homework-list" style={{ minHeight: '200px' }}>
          {totalCount === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px', color: '#999' }}>
              <div style={{ fontSize: '3rem', marginBottom: '10px' }}>🎒</div>
              <p>目前沒有作業<br />享受自由的時光吧！</p>
            </div>
          ) : (
            sortedList.map((item, sortedIdx) => {
              // Find original index for editing/deleting
              const index = homeworkList.findIndex(h => h === item);
              const statusColor = item.completed ? '#2ecc71' : '#e74c3c';
              const cardOpacity = item.completed ? 0.7 : 1;
              const decoration = item.completed ? 'line-through' : 'none';
              const icon = item.completed ? '✅' : '⬜';

              return (
                <div key={index} className="card" style={{ marginBottom: '12px', padding: '15px', borderLeft: `5px solid ${statusColor}`, opacity: cardOpacity }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1, cursor: 'pointer' }} onClick={() => handleOpenModal(index)}>
                      <div style={{ fontSize: '0.85rem', color: '#888', marginBottom: '4px' }}>
                        {item.date} • <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{item.subject}</span>
                      </div>
                      <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: 'var(--text-main)', textDecoration: decoration, marginBottom: '5px' }}>
                        {item.title}
                      </div>
                      <div style={{ fontSize: '0.9rem', color: '#666' }}>
                        分數: <span style={{ fontWeight: 'bold', color: '#333' }}>{item.score || '-'}</span> / {item.total || 100}
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'flex-end' }}>
                      <button onClick={() => toggleStatus(index)} style={{ background: 'transparent', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }} title="切換狀態">
                        {icon}
                      </button>
                      <div style={{ display: 'flex', gap: '5px' }}>
                        <button onClick={() => handleOpenModal(index)} style={{ background: 'transparent', border: 'none', color: '#f39c12', cursor: 'pointer', fontSize: '0.9rem' }}>✏️</button>
                        <button onClick={() => handleDelete(index)} style={{ background: 'transparent', border: 'none', color: '#ccc', cursor: 'pointer', fontSize: '0.9rem' }}>🗑️</button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
        <button className="btn btn-add" onClick={() => handleOpenModal(-1)}>+ 新增作業</button>
      </div>

      {isModalOpen && (
        <div className="modal" style={{ display: 'flex' }}>
          <div className="modal-content" style={{ textAlign: 'left', width: '90%', maxWidth: '400px' }}>
            <h3 id="modal-hw-title" style={{ textAlign: 'center', marginTop: 0 }}>
              {editingIndex > -1 ? '✏️ 編輯作業' : '🎒 新增作業'}
            </h3>
            
            <div className="input-group" style={{ marginBottom: '15px' }}>
              <label>科目</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input 
                  type="text" 
                  className="login-input" 
                  value={formData.customSubject} 
                  onChange={(e) => setFormData({...formData, customSubject: e.target.value})} 
                  placeholder="輸入科目名稱..." 
                  style={{ flex: 1, padding: '10px', background: 'white', border: '1px solid #ddd', marginBottom: 0 }} 
                />
              </div>
            </div>

            <div className="input-group" style={{ marginBottom: '15px' }}>
              <label>作業名稱</label>
              <input 
                type="text" 
                className="login-input" 
                value={formData.title} 
                onChange={(e) => setFormData({...formData, title: e.target.value})} 
                placeholder="例如：習題 1-1" 
                style={{ padding: '10px', background: 'white', border: '1px solid #ddd', marginBottom: 0, width: '100%' }} 
              />
            </div>

            <div className="input-group" style={{ marginBottom: '15px' }}>
              <label>繳交日期</label>
              <input 
                type="date" 
                className="login-input" 
                value={formData.date} 
                onChange={(e) => setFormData({...formData, date: e.target.value})} 
                style={{ padding: '10px', background: 'white', border: '1px solid #ddd', width: '100%', marginBottom: 0 }} 
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
              <div className="input-group" style={{ flex: 1 }}>
                <label>得分 (選填)</label>
                <input 
                  type="number" 
                  className="login-input" 
                  value={formData.score} 
                  onChange={(e) => setFormData({...formData, score: e.target.value})} 
                  placeholder="尚未批改" 
                  style={{ padding: '10px', background: 'white', border: '1px solid #ddd', width: '100%', marginBottom: 0 }} 
                />
              </div>
              <div className="input-group" style={{ flex: 1 }}>
                <label>滿分</label>
                <input 
                  type="number" 
                  className="login-input" 
                  value={formData.total} 
                  onChange={(e) => setFormData({...formData, total: e.target.value})} 
                  style={{ padding: '10px', background: 'white', border: '1px solid #ddd', width: '100%', marginBottom: 0 }} 
                />
              </div>
            </div>

            <button 
              className="btn" 
              onClick={handleSave} 
              style={{ width: '100%', background: editingIndex > -1 ? '#f39c12' : 'var(--primary)' }}
            >
              {editingIndex > -1 ? '💾 儲存修改' : '+ 儲存'}
            </button>
            <button 
              className="btn" 
              onClick={() => setIsModalOpen(false)} 
              style={{ width: '100%', marginTop: '10px', background: 'transparent', color: '#666', border: '1px solid #ddd' }}
            >
              取消
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
