import { useState, useEffect } from 'react';

// 初始化空課表資料
const customPeriods = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D'];
const initialMockSchedule = {
  1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 0: []
};

// 色彩預設值
const SWATCH_COLORS = ['#ffffff', '#ffcdd2', '#ffe0b2', '#fff9c4', '#c8e6c9', '#bbdefb', '#e1bee7'];

export default function Schedule() {
  const [scheduleMode, setScheduleMode] = useState('daily');
  const [activeDay, setActiveDay] = useState(1);
  const [weeklySchedule, setWeeklySchedule] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // Modal 狀態與表單欄位
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    room: '',
    teacher: '',
    startPeriod: '',
    endPeriod: '',
    color: '#ffffff'
  });
  
  // 記錄是否在編輯模式下 (暫存功能)
  const [editingIndices, setEditingIndices] = useState([]);

  useEffect(() => {
    setTimeout(() => {
      setWeeklySchedule(initialMockSchedule);
      setIsLoading(false);
    }, 500);
  }, []);

  const todayData = weeklySchedule[activeDay] || [];

  // 表單資料變更
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // 選取顏色
  const selectColor = (color) => {
    setFormData(prev => ({ ...prev, color }));
  };

  // 儲存/加入課程
  const handleAddCourse = () => {
    const pStartRaw = formData.startPeriod.trim();
    const pEndRaw = formData.endPeriod.trim();
    const sub = formData.subject;
    const room = formData.room;
    const teacher = formData.teacher;
    const color = formData.color;

    if (!sub || !pStartRaw) {
      alert('請至少輸入「科目」與「起始節次」');
      return;
    }

    const idxStart = customPeriods.indexOf(pStartRaw);
    let idxEnd = pEndRaw ? customPeriods.indexOf(pEndRaw) : idxStart;

    if (idxStart === -1) { alert(`起始節次 "${pStartRaw}" 無效，請確認名稱是否正確`); return; }
    if (idxEnd === -1) { alert(`結束節次 "${pEndRaw}" 無效，請確認名稱是否正確`); return; }
    if (idxEnd < idxStart) { alert('結束節次不能早於起始節次！'); return; }

    const newSchedule = { ...weeklySchedule };
    const dayData = [...(newSchedule[activeDay] || [])];

    // 如果是修改狀態，先移除舊的資料
    if (editingIndices.length > 0) {
      editingIndices.sort((a, b) => b - a).forEach(delIndex => {
        if (delIndex < dayData.length) dayData.splice(delIndex, 1);
      });
    }

    // 將新區間拆分單節存入
    for (let i = idxStart; i <= idxEnd; i++) {
        const p = customPeriods[i];
        dayData.push({
            period: p,
            time: '--:--', // 自動時間邏輯暫略
            subject: sub,
            room: room,
            teacher: teacher,
            color: color
        });
    }

    // 重新排序
    dayData.sort((a, b) => {
      let idxA = customPeriods.indexOf(a.period);
      let idxB = customPeriods.indexOf(b.period);
      if (idxA === -1) idxA = 999; 
      if (idxB === -1) idxB = 999;
      return idxA - idxB;
    });

    newSchedule[activeDay] = dayData;
    setWeeklySchedule(newSchedule);
    
    // 重置表單
    resetCourseInput();
  };

  // 原有邏輯：點擊「修改」會帶入資料
  const editCourse = (startIndex) => {
    const startItem = todayData[startIndex];
    if (!startItem) return;

    let currentPIndex = customPeriods.indexOf(startItem.period);
    let endPeriod = startItem.period; 
    let indicesToEdit = [startIndex];

    // 偵測連堂
    for (let i = startIndex + 1; i < todayData.length; i++) {
        const nextItem = todayData[i];
        const nextPIndex = customPeriods.indexOf(nextItem.period);
        if (nextPIndex === currentPIndex + 1 && nextItem.subject === startItem.subject && nextItem.room === startItem.room) {
            indicesToEdit.push(i); 
            endPeriod = nextItem.period;  
            currentPIndex = nextPIndex;   
        } else {
            break; 
        }
    }

    setEditingIndices(indicesToEdit);
    setFormData({
        startPeriod: startItem.period || '',
        endPeriod: endPeriod,
        subject: startItem.subject || '',
        room: startItem.room || '',
        teacher: startItem.teacher || '',
        color: startItem.color || '#ffffff'
    });
  };

  // 刪除課程邏輯包含檢查連堂
  const deleteCourse = (startIndex) => {
    const startItem = todayData[startIndex];
    let indicesToDelete = [startIndex];
    let currentPIndex = customPeriods.indexOf(startItem.period);

    for (let i = startIndex + 1; i < todayData.length; i++) {
        const nextItem = todayData[i];
        const nextPIndex = customPeriods.indexOf(nextItem.period);
        if (nextPIndex === currentPIndex + 1 && nextItem.subject === startItem.subject && nextItem.room === startItem.room) {
            indicesToDelete.push(i);
            currentPIndex = nextPIndex;
        } else { break; }
    }

    const confirmMsg = indicesToDelete.length > 1 
        ? `確定刪除這 ${indicesToDelete.length} 堂連堂課程嗎？` 
        : '確定刪除這堂課嗎？';

    if (window.confirm(confirmMsg)) {
        if (editingIndices.length > 0) resetCourseInput();

        const newSchedule = { ...weeklySchedule };
        const dayData = [...todayData];
        indicesToDelete.sort((a, b) => b - a).forEach(idx => {
            dayData.splice(idx, 1);
        });
        
        newSchedule[activeDay] = dayData;
        setWeeklySchedule(newSchedule);
    }
  };

  const resetCourseInput = () => {
      setFormData({ subject: '', room: '', teacher: '', startPeriod: '', endPeriod: '', color: '#ffffff' });
      setEditingIndices([]);
  };

  const openEditModal = () => {
    setIsModalOpen(true);
    resetCourseInput();
  };

  const closeEditModal = () => {
    setIsModalOpen(false);
    resetCourseInput();
  };

  return (
    <div id="view-schedule" style={{ animation: 'fadeIn 0.3s', position: 'relative' }}>
      <div className="week-tabs" style={{ marginBottom: '20px' }}>
        <button className={`tab-btn ${scheduleMode === 'daily' ? 'active' : ''}`} onClick={() => setScheduleMode('daily')}>📅 本日課程</button>
        <button className={`tab-btn ${scheduleMode === 'weekly' ? 'active' : ''}`} onClick={() => setScheduleMode('weekly')}>🗓️ 週課表</button>
      </div>

      {scheduleMode === 'daily' && (
        <div id="subview-sch-daily">
          <div className="card">
            <div className="week-tabs">
              {[1, 2, 3, 4, 5, 6, 0].map((day) => {
                const dayLabels = { 1: '一', 2: '二', 3: '三', 4: '四', 5: '五', 6: '六', 0: '日' };
                return (
                  <button key={day} className={`tab-btn ${activeDay === day ? 'active' : ''}`} onClick={() => setActiveDay(day)}>
                    {dayLabels[day]}
                  </button>
                );
              })}
            </div>
            <h2>本日課程</h2>
            <table id="schedule-table">
              <thead>
                <tr>
                  <th width="15%">節次</th>
                  <th width="20%">時間</th>
                  <th width="25%">科目</th>
                  <th width="20%">地點</th>
                  <th width="20%">老師</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan="5" style={{ textAlign: 'center', color: '#999', padding: '20px' }}>⏳ 載入中...</td></tr>
                ) : todayData.length === 0 ? (
                  <tr><td colSpan="5" className="no-class" style={{ textAlign: 'center', padding: '20px' }}>😴 無課程</td></tr>
                ) : (
                  todayData.map((item) => {
                    const customColor = item.color !== '#ffffff' ? item.color : 'transparent';
                    const rowStyle = customColor !== 'transparent' ? { borderLeft: `5px solid ${customColor}` } : {};
                    return (
                      <tr key={item.period} style={rowStyle}>
                        <td style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{item.period}</td>
                        <td style={{ color: 'var(--text-sub)' }}>{item.time}</td>
                        <td style={{ fontWeight: 'bold' }}>{item.subject}</td>
                        <td><span style={{ background: 'var(--border)', color: 'var(--text-main)', padding: '2px 4px', borderRadius: '4px', fontSize: '0.8rem' }}>{item.room || ''}</span></td>
                        <td style={{ fontSize: '0.85rem' }}>{item.teacher || ''}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
            <button className="btn btn-add" onClick={openEditModal}>+ 編輯本日課程</button>
          </div>
        </div>
      )}

      {scheduleMode === 'weekly' && (
        <div id="subview-sch-weekly">
          <div className="card">
            <h2>📅 週課表</h2>
            <div style={{ width: '100%', overflowX: 'auto', paddingBottom: '10px' }}>
              <table className="weekly-table">
                <thead>
                  <tr>
                    <th style={{ width: '20px', background: '#f8f9fa' }}>節</th>
                    <th style={{ minWidth: '45px' }}>一</th>
                    <th style={{ minWidth: '45px' }}>二</th>
                    <th style={{ minWidth: '45px' }}>三</th>
                    <th style={{ minWidth: '45px' }}>四</th>
                    <th style={{ minWidth: '45px' }}>五</th>
                    <th style={{ minWidth: '45px', color: '#e74c3c' }}>六</th>
                    <th style={{ minWidth: '45px', color: '#e74c3c' }}>日</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr><td colSpan="8" style={{ textAlign: 'center', padding: '20px' }}>⏳ 載入中...</td></tr>
                  ) : (
                    customPeriods.map((p) => (
                      <tr key={p}>
                        <td style={{ fontWeight: 'bold', background: '#f4f7f6', textAlign: 'center' }}>{p}</td>
                        {[1, 2, 3, 4, 5, 6, 0].map(day => {
                          const course = (weeklySchedule[day] || []).find(c => c.period === p);
                          if (course) {
                            return (
                              <td key={`${day}-${p}`} style={{ background: course.color !== '#ffffff' ? course.color : '#fff3e0', padding: '4px', textAlign: 'center', border: '1px solid #eee' }}>
                                <div style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>{course.subject}</div>
                                <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '2px' }}>{course.room || ''}</div>
                              </td>
                            );
                          } else {
                            return <td key={`${day}-${p}`} style={{ border: '1px solid #f9f9f9' }}></td>;
                          }
                        })}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 原封不動的編輯課程 Modal UI */}
      {isModalOpen && (
        <div className="modal" style={{ display: 'flex' }}>
          <div className="modal-content" style={{ textAlign: 'left', width: '90%', maxWidth: '500px' }}>
            <h3 style={{ textAlign: 'center', marginTop: 0 }}>✏️ 編輯課程</h3>
            
            <div id="current-course-list" style={{ marginBottom: '20px', maxHeight: '150px', overflowY: 'auto' }}>
                {todayData.length === 0 ? <p style={{ color: '#999', textAlign: 'center' }}>無課程</p> : 
                    todayData.map((item, idx) => (
                        <div key={idx} className="course-list-item" style={{display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px dashed #eee'}}>
                            <div className="course-info">
                                <div className="course-name">[{item.period}] {item.subject}</div>
                                <div className="course-time">{item.time} {item.room ? '@' + item.room : ''}</div>
                            </div>
                            <div>
                                <button className="btn-edit" onClick={() => editCourse(idx)} style={{background:'var(--primary)', color:'white', border:'none', padding:'4px 8px', borderRadius:'4px', marginRight:'5px'}}>修改</button>
                                <button className="btn-delete" onClick={() => deleteCourse(idx)} style={{background:'#e74c3c', color:'white', border:'none', padding:'4px 8px', borderRadius:'4px'}}>刪除</button>
                            </div>
                        </div>
                    ))
                }
            </div>
            
            <hr style={{ border: 0, borderTop: '1px dashed #ddd', margin: '15px 0' }} />
            <h4 style={{ margin: '0 0 10px 0', color: 'var(--primary)' }}>新增一堂課(至少輸入科目與時間)</h4>
            
            <div className="input-group">
              <label>節次區間 (起始 - 結束)</label>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <input type="text" name="startPeriod" value={formData.startPeriod} onChange={handleInputChange} className="login-input" placeholder="起始 (如: 1)" style={{ flex: 1, marginBottom: 0, textAlign: 'center' }} />
                <span style={{ color: '#999', fontWeight: 'bold' }}>至</span>
                <input type="text" name="endPeriod" value={formData.endPeriod} onChange={handleInputChange} className="login-input" placeholder="結束 (如: 3)" style={{ flex: 1, marginBottom: 0, textAlign: 'center' }} />
              </div>
              <div style={{ fontSize: '0.8rem', color: '#999', marginTop: '4px' }}>※ 若只有一節課，右邊免填</div>
            </div>

            <div className="input-group">
              <label>科目</label>
              <input type="text" name="subject" value={formData.subject} onChange={handleInputChange} placeholder="輸入科目..." />
            </div>

            <div className="input-group">
              <label>地點</label>
              <input type="text" name="room" value={formData.room} onChange={handleInputChange} placeholder="輸入地點..." />
            </div>

            <div className="input-group">
              <label>老師</label>
              <input type="text" name="teacher" value={formData.teacher} onChange={handleInputChange} placeholder="輸入老師..." />
            </div>

            <div className="input-group">
              <label>標記顏色 (選填)</label>
              <div id="color-swatches" style={{ display: 'flex', gap: '10px', marginTop: '5px', flexWrap: 'wrap' }}>
                {SWATCH_COLORS.map(c => (
                  <div 
                    key={c}
                    className={`color-swatch ${formData.color === c ? 'selected' : ''}`} 
                    style={{ background: c, border: c === '#ffffff' ? '1px solid #ddd' : 'none', width:'30px', height:'30px', borderRadius:'50%', cursor:'pointer' }}
                    onClick={() => selectColor(c)}
                    title={c === '#ffffff' ? '預設' : ''}
                  ></div>
                ))}
              </div>
            </div>

            <button id="btn-add-course" className="btn" style={{ width: '100%', background: editingIndices.length > 0 ? '#f39c12' : '#333', color: 'white', marginTop: '10px' }} onClick={handleAddCourse}>
              {editingIndices.length > 0 ? "💾 保存修改 (整段)" : "+ 加入清單"}
            </button>
            <button className="btn" style={{ width: '100%', marginTop: '10px', background: 'transparent', color: '#666', border: '1px solid #ddd' }} onClick={closeEditModal}>關閉</button>
          </div>
        </div>
      )}
    </div>
  );
}
