import { useState, useEffect } from 'react';

export default function Calendar() {
  const [activeTab, setActiveTab] = useState('month'); // 'month' | 'list'
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isEditMode, setIsEditMode] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 真實事件資料
  const [events, setEvents] = useState([]);

  // 表單資料
  const [editingEventId, setEditingEventId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    isAllDay: true,
    startTime: '',
    endTime: ''
  });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // 月曆生成邏輯
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0(Sun) ~ 6(Sat)
  
  // 為了排成 7 行，建立 padding
  const calendarCells = [];
  for (let i = 0; i < firstDayIndex; i++) {
    calendarCells.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    calendarCells.push(d);
  }

  const changeMonth = (delta) => {
    setCurrentDate(new Date(year, month + delta, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // 取得某一天的事件
  const getEventsForDate = (day) => {
    if (!day) return [];
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(e => {
      if (e.endDate) {
        return dateStr >= e.startDate && dateStr <= e.endDate;
      }
      return dateStr === e.startDate;
    });
  };

  // 打開 Modal
  const openModal = (dateStr = '', eventObj = null) => {
    if (eventObj) {
      setEditingEventId(eventObj.id);
      setFormData({
        title: eventObj.title,
        startDate: eventObj.startDate,
        endDate: eventObj.endDate || '',
        isAllDay: eventObj.isAllDay,
        startTime: eventObj.startTime || '',
        endTime: eventObj.endTime || ''
      });
    } else {
      setEditingEventId(null);
      setFormData({
        title: '',
        startDate: dateStr || new Date().toISOString().split('T')[0],
        endDate: '',
        isAllDay: true,
        startTime: '',
        endTime: ''
      });
    }
    setIsModalOpen(true);
  };

  const saveEvent = () => {
    if (!formData.title || !formData.startDate) {
      alert('請填寫完整資訊');
      return;
    }
    if (editingEventId) {
      setEvents(events.map(e => e.id === editingEventId ? { ...formData, id: e.id } : e));
    } else {
      setEvents([...events, { ...formData, id: Date.now() }]);
    }
    setIsModalOpen(false);
  };

  const deleteEvent = () => {
    if (window.confirm('確定要刪除此活動嗎？')) {
      setEvents(events.filter(e => e.id !== editingEventId));
      setIsModalOpen(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <div id="view-calendar" style={{ animation: 'fadeIn 0.3s', position: 'relative' }}>
      <div className="week-tabs" style={{ marginBottom: '20px' }}>
        <button className={`tab-btn ${activeTab === 'month' ? 'active' : ''}`} onClick={() => setActiveTab('month')}>🗓️ 月曆視圖</button>
        <button className={`tab-btn ${activeTab === 'list' ? 'active' : ''}`} onClick={() => setActiveTab('list')}>📝 活動清單</button>
      </div>

      {activeTab === 'month' && (
        <div id="subview-cal-month">
          <div className="card">
            <div className="calendar-header" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button className="btn-icon" onClick={() => changeMonth(-1)}>◀</button>
                <h3 id="calendar-month-year" style={{ margin: 0, border: 'none', minWidth: '100px', textAlign: 'center' }}>
                  {year} 年 {month + 1} 月
                </h3>
                <button className="btn-icon" onClick={() => changeMonth(1)}>▶</button>
                <button className="btn" onClick={goToToday} style={{ background: 'transparent', color: 'var(--primary)', border: '1px solid var(--primary)', padding: '6px 12px', fontSize: '0.85rem', borderRadius: '6px', marginLeft: '5px' }}>今天</button>
              </div>
              <button 
                id="btn-toggle-cal-edit" 
                className="btn-icon" 
                onClick={() => setIsEditMode(!isEditMode)} 
                style={{ fontSize: '0.85rem', background: 'transparent', border: '1px solid #ddd', color: isEditMode ? 'var(--primary)' : '#888', transition: 'all 0.3s', padding: '6px 12px' }}
              >
                {isEditMode ? '🔓 編輯模式' : '🔒 唯讀模式'}
              </button>
            </div>

            <div style={{ width: '100%', overflowX: 'auto', paddingBottom: '10px', marginTop: '15px' }}>
              <div className="calendar-grid" id="calendar-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px', background: '#eee', border: '1px solid #eee', borderRadius: '8px', overflow: 'hidden' }}>
                {['日', '一', '二', '三', '四', '五', '六'].map(day => (
                  <div key={day} style={{ background: '#f8f9fa', padding: '10px', textAlign: 'center', fontWeight: 'bold' }}>{day}</div>
                ))}
                {calendarCells.map((day, idx) => {
                  const todayStr = new Date().toISOString().split('T')[0];
                  const currentStr = day ? `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}` : '';
                  const isToday = currentStr === todayStr;
                  const dayEvents = getEventsForDate(day);

                  return (
                    <div 
                      key={idx} 
                      style={{ background: isToday ? '#fffbea' : '#fff', padding: '5px', minHeight: '80px', display: 'flex', flexDirection: 'column' }}
                      onClick={() => {
                        if (day && isEditMode) openModal(currentStr);
                      }}
                    >
                      {day && (
                        <>
                          <div style={{ textAlign: 'right', fontWeight: 'bold', color: isToday ? 'var(--primary)' : '#555', fontSize: '0.9rem' }}>{day}</div>
                          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '3px', marginTop: '5px' }}>
                            {dayEvents.map(ev => (
                              <div 
                                key={ev.id} 
                                onClick={(e) => { e.stopPropagation(); if (isEditMode) openModal('', ev); }}
                                style={{ background: ev.isAllDay ? 'var(--primary)' : '#e3f2fd', color: ev.isAllDay ? '#fff' : '#1565c0', fontSize: '0.75rem', padding: '2px 5px', borderRadius: '4px', cursor: isEditMode ? 'pointer' : 'default', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}
                              >
                                {!ev.isAllDay && <span style={{ marginRight: '4px' }}>{ev.startTime}</span>}
                                {ev.title}
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            {isEditMode && <button className="btn btn-add" onClick={() => openModal()} style={{ marginTop: '15px' }}>+ 新增活動</button>}
          </div>
        </div>
      )}

      {activeTab === 'list' && (
        <div id="subview-cal-list">
          <div className="card">
            <h2 style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>📅 活動清單</span>
                <button className="btn-icon" onClick={() => setIsEditMode(!isEditMode)} style={{ fontSize: '0.85rem', background: 'transparent', border: '1px solid #ddd', color: isEditMode ? 'var(--primary)' : '#888', transition: 'all 0.3s', padding: '6px 12px' }}>
                  {isEditMode ? '🔓 編輯模式' : '🔒 唯讀模式'}
                </button>
            </h2>
            <div id="calendar-list" style={{ marginBottom: '15px' }}>
              {events.length === 0 ? <p style={{ color: '#999', textAlign: 'center' }}>目前沒有即將到來的活動</p> : 
                events.sort((a,b) => new Date(a.startDate) - new Date(b.startDate)).map(ev => (
                  <div key={ev.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #eee' }}>
                     <div>
                       <div style={{ fontWeight: 'bold' }}>{ev.title} <span style={{ background: ev.isAllDay ? '#e8f5e9' : '#fff3e0', color: ev.isAllDay ? '#2e7d32' : '#e65100', fontSize: '0.7rem', padding: '2px 5px', borderRadius: '4px', marginLeft: '5px' }}>{ev.isAllDay ? '全天' : '有時段'}</span></div>
                       <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '4px' }}>
                         {ev.startDate} {ev.endDate && `~ ${ev.endDate}`} {(!ev.isAllDay && ev.startTime) && `( ${ev.startTime} - ${ev.endTime} )`}
                       </div>
                     </div>
                     {isEditMode && <button className="btn-edit" onClick={() => openModal('', ev)} style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>編輯</button>}
                  </div>
                ))
              }
            </div>
            {isEditMode && <button className="btn btn-add" onClick={() => openModal()}>+ 新增活動</button>}
          </div>
        </div>
      )}

      {/* Calendar Modal */}
      {isModalOpen && (
        <div id="calendar-modal" className="modal" style={{ display: 'flex' }}>
          <div className="modal-content" style={{ textAlign: 'left', width: '90%', maxWidth: '400px' }}>
            <h3 id="cal-modal-title" style={{ textAlign: 'center', marginTop: 0 }}>{editingEventId ? '✏️ 編輯活動' : '📅 新增活動'}</h3>
            
            <div className="input-group">
              <label>活動名稱</label>
              <input type="text" name="title" id="input-cal-title" placeholder="例如：期末考週、畢業旅行..." value={formData.title} onChange={handleInputChange} />
            </div>

            <div className="input-group">
              <label>日期區間</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '0.8rem', color: '#888', marginBottom: '2px' }}>起始日</label>
                  <input type="date" name="startDate" id="input-cal-date" style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '6px', marginBottom: 0 }} value={formData.startDate} onChange={handleInputChange} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '0.8rem', color: '#888', marginBottom: '2px' }}>結束日 (選填)</label>
                  <input type="date" name="endDate" id="input-cal-end-date" style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '6px', marginBottom: 0 }} value={formData.endDate} onChange={handleInputChange} />
                </div>
              </div>
            </div>

            <div className="input-group" style={{ marginTop: '15px' }}>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', marginBottom: '8px' }}>
                <input type="checkbox" name="isAllDay" id="input-cal-allday" style={{ width: 'auto', marginRight: '8px', transform: 'scale(1.2)' }} checked={formData.isAllDay} onChange={handleInputChange} />
                全天活動
              </label>
              {!formData.isAllDay && (
                <div id="cal-time-inputs" style={{ display: 'flex', gap: '10px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '0.8rem', marginBottom: '2px' }}>開始時間</label>
                    <input type="time" name="startTime" id="input-cal-start" className="login-input" style={{ background: 'white', marginBottom: 0 }} value={formData.startTime} onChange={handleInputChange} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '0.8rem', marginBottom: '2px' }}>結束時間</label>
                    <input type="time" name="endTime" id="input-cal-end" className="login-input" style={{ background: 'white', marginBottom: 0 }} value={formData.endTime} onChange={handleInputChange} />
                  </div>
                </div>
              )}
            </div>

            <button id="btn-save-cal" className="btn" style={{ width: '100%', background: '#333' }} onClick={saveEvent}>+ {editingEventId ? '儲存修改' : '加入'}</button>
            {editingEventId && <button id="btn-del-cal" className="btn" style={{ width: '100%', marginTop: '10px', background: '#ffebee', color: '#e74c3c', border: '1px solid #e74c3c' }} onClick={deleteEvent}>🗑️ 刪除此活動</button>}
            <button className="btn" style={{ width: '100%', marginTop: '10px', background: 'transparent', color: '#666', border: '1px solid #ddd' }} onClick={() => setIsModalOpen(false)}>關閉</button>
          </div>
        </div>
      )}
    </div>
  );
}
