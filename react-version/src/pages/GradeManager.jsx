import { useState, useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

export default function GradeManager() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isGradeModalOpen, setIsGradeModalOpen] = useState(false);
  const [isExamModalOpen, setIsExamModalOpen] = useState(false);
  const [examModalType, setExamModalType] = useState('regular'); // 'regular' | 'midterm'

  // 真實資料狀態
  const [subjects, setSubjects] = useState([]);
  const [exams, setExams] = useState([]);

  // 學分模組狀態
  const [gradTotalTarget, setGradTotalTarget] = useState(128);
  const [creditModules, setCreditModules] = useState([
    { id: 1, name: '自由選修', target: 20, compulsory: 0, elective: 0 },
    { id: 2, name: '通識', target: 28, compulsory: 0, elective: 0 },
    { id: 3, name: '專業必修', target: 40, compulsory: 0, elective: 0 }
  ]);
  const [isModuleEditMode, setIsModuleEditMode] = useState(false);

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
                    labels: ['本學期'],
                    datasets: [{
                        label: '歷屆加權平均 GPA',
                        data: [Number(gpa)],
                        borderColor: '#2ecc71',
                        backgroundColor: 'rgba(46, 204, 113, 0.2)',
                        fill: true,
                        tension: 0.3
                    }]
                },
                options: { 
                    responsive: true, 
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            min: 0,
                            suggestedMax: 100
                        }
                    }
                }
            });
        }, 100);
    }
  }, [activeTab, gpa]);

  // 考試與成績表單狀態
  const [gradeFormData, setGradeFormData] = useState({
      name: '', credit: 1, score: '', nature: '必修', category: '專業必修', isSelfStudy: false
  });
  const [examFormData, setExamFormData] = useState({ name: '', score: '' });
  const [useCustomSubjectInput, setUseCustomSubjectInput] = useState(false);

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

  const handleAddModule = () => {
    const name = window.prompt("請輸入模組名稱 (例如：系定選修):", "自定義模組");
    if (!name) return;
    setCreditModules([...creditModules, { id: Date.now(), name, target: 0, compulsory: 0, elective: 0 }]);
  };

  const handleDeleteModule = (id) => {
    if (window.confirm("確定刪除此學分模組嗎？")) {
      setCreditModules(creditModules.filter(m => m.id !== id));
    }
  };

  const gradTarget = gradTotalTarget;
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
          {!isModuleEditMode ? (
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h2 style={{ marginBottom: '15px', borderBottom: '1px solid #eee', paddingBottom: '10px', flex: 1 }}>🎓 畢業進度</h2>
                <button 
                  className="btn-icon" 
                  onClick={() => setIsModuleEditMode(true)}
                  style={{ fontSize: '0.85rem', background: 'transparent', border: '1px solid #ddd', color: '#888', padding: '6px 12px', marginTop: '5px' }}
                >
                  ⚙️ 參數設定
                </button>
              </div>
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
                {creditModules.map(m => {
                  const earnedTotal = subjects.filter(s => s.category === m.name && s.score >= 60).reduce((sum, s) => sum + Number(s.credit), 0);
                  const earnedCompulsory = subjects.filter(s => s.category === m.name && s.nature === '必修' && s.score >= 60).reduce((sum, s) => sum + Number(s.credit), 0);
                  const earnedElective = subjects.filter(s => s.category === m.name && s.nature === '選修' && s.score >= 60).reduce((sum, s) => sum + Number(s.credit), 0);
                  const hasSubTargets = (m.compulsory > 0 || m.elective > 0);
                  
                  return (
                    <div key={m.id} style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px', border: '1px solid #eee', textAlign: 'center' }}>
                       <div style={{ fontSize: '0.9rem', color: '#555', marginBottom: '8px', fontWeight: 'bold' }}>{m.name}</div>
                       
                       <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: earnedTotal >= m.target && m.target > 0 ? '#2ecc71' : (earnedTotal > 0 ? 'var(--primary)' : '#e74c3c') }}>
                         {earnedTotal} / {m.target}
                       </div>

                       {hasSubTargets && (
                           <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '8px', paddingTop: '8px', borderTop: '1px dashed #ddd' }}>
                             {m.compulsory > 0 && (
                               <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                                 <span style={{ color: '#777' }}>必修</span>
                                 <span style={{ fontWeight: 'bold', color: earnedCompulsory >= m.compulsory ? '#2ecc71' : (earnedCompulsory > 0 ? 'var(--primary)' : '#e74c3c') }}>{earnedCompulsory} / {m.compulsory}</span>
                               </div>
                             )}
                             {m.elective > 0 && (
                               <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                                 <span style={{ color: '#777' }}>選修</span>
                                 <span style={{ fontWeight: 'bold', color: earnedElective >= m.elective ? '#2ecc71' : (earnedElective > 0 ? 'var(--primary)' : '#e74c3c') }}>{earnedElective} / {m.elective}</span>
                               </div>
                             )}
                           </div>
                       )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="card" style={{ background: '#454545', color: '#fff', border: 'none', padding: '25px', borderRadius: '12px', animation: 'fadeIn 0.3s' }}>
              <h2 style={{ borderBottom: '1px solid #666', paddingBottom: '15px', marginBottom: '20px', color: '#fff', display: 'flex', flexDirection: 'column', gap: '5px', marginTop: 0 }}>
                <span style={{ fontSize: '1.4rem' }}>🎓 畢業進度</span>
                <span style={{ fontSize: '0.9rem', color: '#90caf9', fontWeight: 'normal' }}>(尚未設定學校科系)</span>
              </h2>

              <div style={{ background: '#f0f8ff', color: '#333', padding: '20px', borderRadius: '8px', marginBottom: '25px' }}>
                <h4 style={{ color: '#1565c0', margin: '0 0 12px 0', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  🎯 畢業標準設定
                </h4>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: '#555', marginBottom: '8px' }}>畢業總學分目標</label>
                  <input 
                    type="number" 
                    className="login-input" 
                    value={gradTotalTarget} 
                    onChange={(e) => setGradTotalTarget(Number(e.target.value))}
                    style={{ background: '#fff', border: '1px solid #ddd', color: '#333', marginBottom: 0, padding: '10px' }} 
                  />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px' }}>
                 <span style={{ background: '#64b5f6', width: '4px', height: '16px', borderRadius: '2px' }}></span>
                 <h4 style={{ margin: 0, color: '#aaa', fontSize: '0.95rem' }}>📊 學分模組管理</h4>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {creditModules.map(m => (
                  <div key={m.id} style={{ background: '#fff', color: '#333', padding: '20px', borderRadius: '8px', border: '1px solid #ddd' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                      <h3 style={{ margin: 0, fontSize: '1.15rem' }}>{m.name}</h3>
                      <button style={{ background: '#ffebee', color: '#e74c3c', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 'bold' }} onClick={() => handleDeleteModule(m.id)}>
                        🗑️ 刪除
                      </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '15px' }}>
                      <div style={{ background: '#f9f9f9', padding: '10px', borderRadius: '8px' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: '#777', marginBottom: '8px' }}>目標學分</label>
                        <input 
                          type="number" className="login-input" value={m.target || 0} 
                          onChange={(e) => setCreditModules(creditModules.map(cm => cm.id === m.id ? { ...cm, target: Number(e.target.value) } : cm))}
                          style={{ background: '#fff', border: '1px solid #eee', color: '#333', marginBottom: 0, padding: '8px' }} 
                        />
                      </div>
                      <div style={{ background: '#f9f9f9', padding: '10px', borderRadius: '8px' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: '#777', marginBottom: '8px' }}>必修</label>
                        <input 
                          type="number" className="login-input" value={m.compulsory || 0} 
                          onChange={(e) => setCreditModules(creditModules.map(cm => cm.id === m.id ? { ...cm, compulsory: Number(e.target.value) } : cm))}
                          style={{ background: '#fff', border: '1px solid #eee', color: '#333', marginBottom: 0, padding: '8px' }} 
                        />
                      </div>
                      <div style={{ background: '#f9f9f9', padding: '10px', borderRadius: '8px' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: '#777', marginBottom: '8px' }}>選修</label>
                        <input 
                          type="number" className="login-input" value={m.elective || 0} 
                          onChange={(e) => setCreditModules(creditModules.map(cm => cm.id === m.id ? { ...cm, elective: Number(e.target.value) } : cm))}
                          style={{ background: '#fff', border: '1px solid #eee', color: '#333', marginBottom: 0, padding: '8px' }} 
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ textAlign: 'center', margin: '25px 0' }}>
                <button className="btn" style={{ background: '#689f38', color: '#fff', padding: '10px 24px', borderRadius: '24px', fontSize: '0.95rem', fontWeight: 'bold', border: 'none' }} onClick={handleAddModule}>+ 新增學分模組</button>
              </div>

              <hr style={{ border: 0, borderTop: '1px solid #555', margin: '20px 0' }} />

              <div style={{ display: 'flex', gap: '15px' }}>
                <button className="btn" style={{ flex: 2, background: '#90caf9', color: '#1565c0', fontWeight: 'bold', padding: '12px' }} onClick={() => setIsModuleEditMode(false)}>💾 儲存設定</button>
                <button className="btn" style={{ flex: 1, background: '#333', color: '#aaa', border: '1px solid #555', padding: '12px' }} onClick={() => setIsModuleEditMode(false)}>取消</button>
              </div>

            </div>
          )}
        </div>
      )}

      {/* Grade Editor Modal */}
      {isGradeModalOpen && (
        <div className="modal" style={{ display: 'flex' }}>
          <div className="modal-content" style={{ textAlign: 'left', width: '90%', maxWidth: '420px', borderRadius: '12px', padding: '30px' }}>
            <h3 style={{ textAlign: 'center', marginTop: 0, color: '#000', fontSize: '1.4rem' }}>📊 編輯成績</h3>
            
            {subjects.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#aaa', margin: '25px 0', fontSize: '1.1rem' }}>無成績</p>
            ) : (
              <div style={{ maxHeight: '100px', overflowY: 'auto' }}>
                {/* 預留顯示已存在成績 */}
              </div>
            )}
            
            <hr style={{ border: 0, borderTop: '1px dashed #ddd', margin: '20px 0' }} />
            
            <h4 style={{ color: '#64b5f6', margin: '0 0 15px 0', fontSize: '1.1rem' }}>新增一科</h4>
            
            <div className="input-group" style={{ marginBottom: '15px' }}>
              <label style={{ color: '#666', fontSize: '0.95rem', marginBottom: '8px', display: 'block' }}>科目名稱</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                {!useCustomSubjectInput ? (
                  <select className="login-input" name="name" value={gradeFormData.name} onChange={handleGradeFormChange} style={{ flex: 1, padding: '12px', color: '#000', marginBottom: 0, border: '1px solid #ddd', borderRadius: '6px', fontSize: '1.05rem' }}>
                    <option value="" disabled>選擇科目</option>
                    <option value="微積分">微積分</option>
                    <option value="程式設計">程式設計</option>
                    <option value="計算機概論">計算機概論</option>
                  </select>
                ) : (
                  <input type="text" className="login-input" name="name" value={gradeFormData.name} onChange={handleGradeFormChange} placeholder="輸入科目名稱..." style={{ flex: 1, padding: '12px', color: '#000', marginBottom: 0, border: '1px solid #ddd', borderRadius: '6px', fontSize: '1.05rem' }} />
                )}
                <button type="button" onClick={() => setUseCustomSubjectInput(!useCustomSubjectInput)} style={{ background: '#666', color: '#fff', border: 'none', borderRadius: '6px', padding: '0 16px', cursor: 'pointer', fontSize: '1.2rem' }}>✏️</button>
              </div>
            </div>

            <div className="input-group" style={{ marginBottom: '15px', paddingLeft: '2px' }}>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', marginBottom: 0, color: '#555', fontSize: '1rem' }}>
                <input type="checkbox" name="isSelfStudy" checked={gradeFormData.isSelfStudy} onChange={handleGradeFormChange} style={{ width: '18px', height: '18px', marginRight: '10px', cursor: 'pointer' }} /> 
                自主學習 <span style={{ color: '#888', fontSize: '0.85rem', marginLeft: '6px' }}>(僅計學分，不計成績)</span>
              </label>
            </div>

            <div className="input-group" style={{ marginBottom: '15px' }}>
              <label style={{ color: '#666', fontSize: '0.95rem', marginBottom: '8px', display: 'block' }}>課程歸類 & 修別</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <select className="login-input" name="category" value={gradeFormData.category} onChange={handleGradeFormChange} style={{ flex: 2, padding: '12px', color: '#000', borderRadius: '6px', border: '1px solid #ddd', marginBottom: 0, fontSize: '1.05rem' }}>
                  {creditModules.length > 0 ? creditModules.map(m => <option key={m.id} value={m.name}>{m.name}</option>) : <option value="未分類">未分類</option>}
                </select>
                <select className="login-input" name="nature" value={gradeFormData.nature} onChange={handleGradeFormChange} style={{ flex: 1, padding: '12px', color: '#000', borderRadius: '6px', border: '1px solid #ddd', marginBottom: 0, fontSize: '1.05rem' }}>
                  <option value="必修">必修</option>
                  <option value="選修">選修</option>
                </select>
              </div>
            </div>

            <div className="input-group" style={{ marginBottom: '15px' }}>
              <label style={{ color: '#666', fontSize: '0.95rem', marginBottom: '8px', display: 'block' }}>學分</label>
              <input type="number" className="login-input" name="credit" value={gradeFormData.credit} onChange={handleGradeFormChange} placeholder="例如：3" style={{ width: '100%', padding: '12px', color: '#000', borderRadius: '6px', border: '1px solid #ddd', marginBottom: 0, fontSize: '1.05rem' }} />
            </div>

            {!gradeFormData.isSelfStudy && (
              <div className="input-group" style={{ marginBottom: '25px' }}>
                <label style={{ color: '#666', fontSize: '0.95rem', marginBottom: '8px', display: 'block' }}>分數</label>
                <input type="number" className="login-input" name="score" value={gradeFormData.score} onChange={handleGradeFormChange} placeholder="例如：85" style={{ width: '100%', padding: '12px', color: '#000', borderRadius: '6px', border: '1px solid #ddd', marginBottom: 0, fontSize: '1.05rem' }} />
              </div>
            )}

            <button className="btn" style={{ width: '100%', background: '#333', color: '#fff', padding: '14px', borderRadius: '6px', fontSize: '1.05rem', fontWeight: 'bold', marginBottom: '12px', border: 'none' }} onClick={handleSaveGrade}>+ 加入成績單</button>
            <button className="btn" style={{ width: '100%', background: '#fff', color: '#666', padding: '14px', borderRadius: '6px', fontSize: '1.05rem', border: '1px solid #ddd', fontWeight: 'bold' }} onClick={() => setIsGradeModalOpen(false)}>關閉</button>
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
