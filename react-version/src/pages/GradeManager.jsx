import { useState, useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

export default function GradeManager() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isGradeModalOpen, setIsGradeModalOpen] = useState(false);
  const [isExamModalOpen, setIsExamModalOpen] = useState(false);
  const [examModalType, setExamModalType] = useState('regular'); // 'regular' | 'midterm'

  // Mock 資料
  const [subjects, setSubjects] = useState([
    { id: 1, name: '微積分', credit: 3, score: 85, nature: '必修', category: '專業必修', isSelfStudy: false },
    { id: 2, name: '程式設計', credit: 3, score: 92, nature: '必修', category: '專業必修', isSelfStudy: false },
    { id: 3, name: '體育', credit: 0, score: 88, nature: '必修', category: '共同必修', isSelfStudy: false },
    { id: 4, name: '歷史', credit: 2, score: 55, nature: '選修', category: '通識', isSelfStudy: false } // Failed
  ]);

  const [exams, setExams] = useState([
    { id: 1, subjectId: 1, type: 'regular', name: '小考一', score: 90 },
    { id: 2, subjectId: 1, type: 'midterm', name: '期中考', score: 82 }
  ]);

  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  
  // 學分與 GPA 計算
  let totalCredits = 0;
  let earnedCredits = 0;
  let totalScorePoints = 0;
  let failedCount = 0;

  subjects.forEach(sub => {
    if (!sub.isSelfStudy) {
      const c = Number(sub.credit);
      totalCredits += c;
      if (sub.score >= 60) {
        earnedCredits += c;
        totalScorePoints += (sub.score * c);
      } else {
        failedCount += 1;
      }
    }
  });

  const gpa = totalCredits > 0 ? (totalScorePoints / totalCredits).toFixed(2) : '0.00';

  // Chart Refs
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (activeTab === 'chart' && chartRef.current) {
        setTimeout(() => {
            if (chartInstance.current) chartInstance.current.destroy();
            chartInstance.current = new Chart(chartRef.current, {
                type: 'line',
                data: {
                    labels: ['大一上', '大一下', '大二上', '大二下', '本學期'],
                    datasets: [{
                        label: '歷屆加權平均 GPA',
                        data: [82.5, 84.1, 80.2, 85.5, Number(gpa)],
                        borderColor: '#2ecc71',
                        backgroundColor: 'rgba(46, 204, 113, 0.2)',
                        fill: true,
                        tension: 0.3
                    }]
                },
                options: { responsive: true, maintainAspectRatio: false }
            });
        }, 100);
    }
  }, [activeTab, gpa]);

  // 考試與成績表單狀態
  const [gradeFormData, setGradeFormData] = useState({
      name: '', credit: 3, score: '', nature: '必修', category: '專業必修', isSelfStudy: false
  });
  const [examFormData, setExamFormData] = useState({ name: '', score: '' });

  const handleGradeFormChange = (e) => {
      const { name, value, type, checked } = e.target;
      setGradeFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSaveGrade = () => {
      if (!gradeFormData.name) { alert('請填寫科目名稱'); return; }
      setSubjects([...subjects, { ...gradeFormData, id: Date.now() }]);
      setIsGradeModalOpen(false);
  };

  const handleSaveExam = () => {
      if (!selectedSubjectId || !examFormData.name || !examFormData.score) {
          alert('請確保已選擇科目並填寫測驗名稱與分數'); return;
      }
      setExams([...exams, { id: Date.now(), subjectId: Number(selectedSubjectId), type: examModalType, name: examFormData.name, score: Number(examFormData.score) }]);
      setIsExamModalOpen(false);
      setExamFormData({ name: '', score: '' });
  };

  const deleteGrade = (id) => {
      if (window.confirm('確定刪除此科目？')) setSubjects(subjects.filter(s => s.id !== id));
  };

  const gradTarget = 128;
  const gradPercentage = Math.min((earnedCredits / gradTarget) * 100, 100).toFixed(1);

  return (
    <div id="view-grade-manager" style={{ animation: 'fadeIn 0.3s' }}>
      <div className="week-tabs" style={{ marginBottom: '20px' }}>
        <button className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>📊 總覽</button>
        <button className={`tab-btn ${activeTab === 'exams' ? 'active' : ''}`} onClick={() => setActiveTab('exams')}>📝 考試成績</button>
        <button className={`tab-btn ${activeTab === 'list' ? 'active' : ''}`} onClick={() => setActiveTab('list')}>📄 成績單</button>
        <button className={`tab-btn ${activeTab === 'chart' ? 'active' : ''}`} onClick={() => setActiveTab('chart')}>📈 趨勢</button>
        <button className={`tab-btn ${activeTab === 'credits' ? 'active' : ''}`} onClick={() => setActiveTab('credits')}>🎓 學分</button>
      </div>

      {activeTab === 'dashboard' && (
        <div id="subview-grade-dashboard">
          <div className="card" style={{ textAlign: 'center', padding: '30px 20px' }}>
            <h2 style={{ justifyContent: 'center', border: 'none', marginBottom: '20px' }}>🎓 本學期學業摘要</h2>
            <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '20px' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '5px' }}>加權平均</div>
                <div id="dash-gpa" style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary)' }}>{gpa}</div>
              </div>
              <div style={{ flex: 1, borderLeft: '1px solid #eee', borderRight: '1px solid #eee' }}>
                <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '5px' }}>實得學分</div>
                <div id="dash-credits" style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2ecc71' }}>{earnedCredits}</div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '5px' }}>不及格科目</div>
                <div id="dash-failed" style={{ fontSize: '2rem', fontWeight: 'bold', color: '#e74c3c' }}>{failedCount}</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button className="btn" onClick={() => setActiveTab('exams')} style={{ flex: 2, background: '#e3f2fd', color: '#1565c0' }}>📝 記考試</button>
              <button className="btn" onClick={() => setActiveTab('list')} style={{ flex: 1, background: '#e8f5e9', color: '#2e7d32' }}>📊 查看分析</button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'exams' && (
        <div id="subview-grade-exams">
          <div className="card">
            <h2 style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>📝 考試成績</span>
              <select 
                value={selectedSubjectId} 
                onChange={e => setSelectedSubjectId(e.target.value)}
                style={{ fontSize: '0.9rem', padding: '4px 8px', border: '1px solid #ddd', borderRadius: '6px', maxWidth: '150px' }}
              >
                <option value="" disabled>選擇科目</option>
                {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </h2>
            <table id="exam-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #eee' }}>
                  <th width="20%" style={{ padding: '10px' }}>類型</th>
                  <th width="50%" style={{ padding: '10px' }}>測驗名稱</th>
                  <th width="30%" style={{ padding: '10px' }}>分數</th>
                </tr>
              </thead>
              <tbody>
                {!selectedSubjectId ? (
                  <tr><td colSpan="3" style={{ textAlign: 'center', padding: '20px', color: '#888' }}>👈 請先於上方選擇科目</td></tr>
                ) : exams.filter(e => e.subjectId === Number(selectedSubjectId)).length === 0 ? (
                  <tr><td colSpan="3" style={{ textAlign: 'center', padding: '20px', color: '#888' }}>該科目尚無考試紀錄</td></tr>
                ) : exams.filter(e => e.subjectId === Number(selectedSubjectId)).map(ex => (
                  <tr key={ex.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '10px' }}><span style={{ background: ex.type === 'midterm' ? '#fff8e1' : '#e3f2fd', color: ex.type === 'midterm' ? '#f57f17' : '#1565c0', fontSize: '0.8rem', padding: '4px 8px', borderRadius: '4px' }}>{ex.type === 'midterm' ? '🏆 段考' : '📝 小考'}</span></td>
                    <td style={{ padding: '10px', fontWeight: 'bold' }}>{ex.name}</td>
                    <td style={{ padding: '10px', color: ex.score < 60 ? '#e74c3c' : '#333', fontWeight: 'bold' }}>{ex.score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
              <button className="btn" style={{ flex: 1, background: '#333', color: 'white' }} onClick={() => { setExamModalType('regular'); setIsExamModalOpen(true); }}>+ 記平常考</button>
              <button className="btn" style={{ flex: 1, background: '#fff8e1', color: '#f57f17', border: '1px solid #f57f17' }} onClick={() => { setExamModalType('midterm'); setIsExamModalOpen(true); }}>+ 記段考</button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'list' && (
        <div id="subview-grade-list">
          <div className="card">
            <h2>📊 學期成績單</h2>
            <div style={{ overflowX: 'auto' }}>
                <table id="grade-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                    <tr style={{ borderBottom: '2px solid #eee' }}>
                    <th style={{ padding: '10px' }}>科目</th>
                    <th style={{ padding: '10px' }}>學分</th>
                    <th style={{ padding: '10px' }}>實得</th>
                    <th style={{ padding: '10px' }}>分數</th>
                    <th style={{ padding: '10px' }}>操作</th>
                    </tr>
                </thead>
                <tbody>
                    {subjects.map(s => (
                    <tr key={s.id} style={{ borderBottom: '1px solid #f9f9f9', background: s.score < 60 ? '#fce4e4' : 'transparent' }}>
                        <td style={{ padding: '10px', fontWeight: 'bold' }}>{s.name} <span style={{ fontSize: '0.7rem', color: '#888', background: '#eee', padding: '2px 4px', borderRadius: '4px', marginLeft: '5px' }}>{s.nature}</span></td>
                        <td style={{ padding: '10px' }}>{s.credit}</td>
                        <td style={{ padding: '10px', color: s.score >= 60 ? '#2ecc71' : '#e74c3c', fontWeight: 'bold' }}>{s.score >= 60 ? s.credit : 0}</td>
                        <td style={{ padding: '10px', color: s.score < 60 ? '#e74c3c' : '#333', fontWeight: 'bold' }}>{s.score}</td>
                        <td style={{ padding: '10px' }}><button onClick={() => deleteGrade(s.id)} style={{ background: '#e74c3c', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}>刪除</button></td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>
            <div style={{ marginTop: '15px', textAlign: 'right', fontWeight: 'bold', color: 'var(--primary)' }}>
              <span style={{ fontSize: '1.2rem' }}>加權平均：{gpa}</span>
            </div>
            <button className="btn btn-add" onClick={() => setIsGradeModalOpen(true)}>+ 新增成績</button>
          </div>
        </div>
      )}

      {activeTab === 'chart' && (
        <div id="subview-grade-chart">
          <div className="card" style={{ height: '70vh', display: 'flex', flexDirection: 'column' }}>
            <h2>📈 歷年成績趨勢</h2>
            <div style={{ flex: 1, position: 'relative', minHeight: '300px' }}>
              <canvas ref={chartRef}></canvas>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'credits' && (
        <div id="subview-grade-credits">
          <div className="card">
            <h2 style={{ marginBottom: '15px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>🎓 畢業進度</h2>
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between', fontSize: '1rem', color: '#555' }}>
                <span>畢業門檻達成率 ({gradPercentage}%)</span>
                <span>
                  <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{earnedCredits}</span> / {gradTarget}
                </span>
              </h4>
              <div style={{ background: '#eee', borderRadius: '10px', height: '16px', width: '100%', overflow: 'hidden' }}>
                <div style={{ background: 'var(--primary)', width: `${gradPercentage}%`, height: '100%', transition: 'width 0.8s ease-in-out' }}></div>
              </div>
            </div>
            <hr style={{ border: 0, borderTop: '1px dashed #ddd', marginBottom: '20px' }} />
            <h4 style={{ color: '#666', fontSize: '1rem', marginBottom: '15px' }}>📊 各模組狀態</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '15px' }}>
                <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px', border: '1px solid #eee', textAlign: 'center' }}>
                   <div style={{ fontSize: '0.9rem', color: '#555', marginBottom: '5px' }}>專業必修</div>
                   <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>6 / 40</div>
                </div>
                <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px', border: '1px solid #eee', textAlign: 'center' }}>
                   <div style={{ fontSize: '0.9rem', color: '#555', marginBottom: '5px' }}>通識</div>
                   <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#e74c3c' }}>0 / 28</div>
                </div>
                <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px', border: '1px solid #eee', textAlign: 'center' }}>
                   <div style={{ fontSize: '0.9rem', color: '#555', marginBottom: '5px' }}>共同必修</div>
                   <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2ecc71' }}>0 / 10</div>
                </div>
            </div>
          </div>
        </div>
      )}

      {/* Grade Editor Modal */}
      {isGradeModalOpen && (
        <div className="modal" style={{ display: 'flex' }}>
          <div className="modal-content" style={{ textAlign: 'left', width: '90%', maxWidth: '400px' }}>
            <h3 style={{ textAlign: 'center', marginTop: 0 }}>📊 新增成績</h3>
            
            <div className="input-group">
              <label>科目名稱</label>
              <input type="text" className="login-input" name="name" value={gradeFormData.name} onChange={handleGradeFormChange} placeholder="輸入科目名稱..." />
            </div>

            <div className="input-group" style={{ marginBottom: '12px', paddingLeft: '2px' }}>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', marginBottom: 0, color: '#555', fontSize: '0.95rem' }}>
                <input type="checkbox" name="isSelfStudy" checked={gradeFormData.isSelfStudy} onChange={handleGradeFormChange} style={{ width: 'auto', marginRight: '8px', cursor: 'pointer' }} /> 
                自主學習 <span style={{ color: '#888', fontSize: '0.85rem', marginLeft: '5px' }}>(僅計學分，不計成績)</span>
              </label>
            </div>

            <div className="input-group">
              <label>修別 & 分類</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <select className="login-input" name="nature" value={gradeFormData.nature} onChange={handleGradeFormChange} style={{ flex: 1, padding: '10px' }}>
                  <option value="必修">必修</option>
                  <option value="選修">選修</option>
                  <option value="必選修">必選修</option>
                </select>
                <select className="login-input" name="category" value={gradeFormData.category} onChange={handleGradeFormChange} style={{ flex: 2, padding: '10px' }}>
                  <option value="專業必修">專業必修</option>
                  <option value="通識">通識</option>
                  <option value="共同必修">共同必修</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
                <div className="input-group" style={{ flex: 1 }}>
                  <label>學分</label>
                  <input type="number" className="login-input" name="credit" value={gradeFormData.credit} onChange={handleGradeFormChange} placeholder="例如：3" />
                </div>
                {!gradeFormData.isSelfStudy && (
                    <div className="input-group" style={{ flex: 1 }}>
                    <label>分數</label>
                    <input type="number" className="login-input" name="score" value={gradeFormData.score} onChange={handleGradeFormChange} placeholder="例如：85" />
                    </div>
                )}
            </div>

            <button className="btn" style={{ width: '100%', background: '#333' }} onClick={handleSaveGrade}>+ 加入成績單</button>
            <button className="btn" style={{ width: '100%', marginTop: '10px', background: 'transparent', color: '#666', border: '1px solid #ddd' }} onClick={() => setIsGradeModalOpen(false)}>關閉</button>
          </div>
        </div>
      )}

      {/* Exam Modal */}
      {isExamModalOpen && (
        <div className="modal" style={{ display: 'flex' }}>
          <div className="modal-content" style={{ textAlign: 'left', width: '90%', maxWidth: '350px' }}>
            <h3 style={{ textAlign: 'center', marginTop: 0 }}>{examModalType === 'midterm' ? '🏆 新增段考' : '📝 新增平常考'}</h3>
            <p style={{ textAlign: 'center', color: '#666' }}>科目：<span style={{ fontWeight: 'bold', color: 'var(--primary)' }}>{subjects.find(s => s.id === Number(selectedSubjectId))?.name || '無'}</span></p>

            <div className="input-group">
              <label>測驗名稱</label>
              <input type="text" className="login-input" name="name" value={examFormData.name} onChange={e => setExamFormData({...examFormData, name: e.target.value})} placeholder={examModalType === 'midterm' ? "例如：期中考" : "例如：第一次小考"} />
            </div>

            <div className="input-group">
              <label>分數</label>
              <input type="number" className="login-input" name="score" value={examFormData.score} onChange={e => setExamFormData({...examFormData, score: e.target.value})} placeholder="例如：85" />
            </div>

            <button className="btn" style={{ width: '100%', background: '#333' }} onClick={handleSaveExam}>+ 確定新增</button>
            <button className="btn" style={{ width: '100%', marginTop: '10px', background: 'transparent', color: '#666', border: '1px solid #ddd' }} onClick={() => setIsExamModalOpen(false)}>關閉</button>
          </div>
        </div>
      )}
    </div>
  );
}
