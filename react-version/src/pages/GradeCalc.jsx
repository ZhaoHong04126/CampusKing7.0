import { useState, useEffect } from 'react';

export default function GradeCalc() {
  const [gradeCalcNotes, setGradeCalcNotes] = useState(() => {
    const saved = localStorage.getItem('gradeCalcNotes');
    return saved ? JSON.parse(saved) : [];
  });

  const [isEditMode, setIsEditMode] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(-1);

  const [formData, setFormData] = useState({
    subject: '',
    customSubject: '',
    useSelect: false,
  });

  const [formulas, setFormulas] = useState([{ item: '', weight: '' }]);
  const [remarks, setRemarks] = useState(['']);

  useEffect(() => {
    localStorage.setItem('gradeCalcNotes', JSON.stringify(gradeCalcNotes));
  }, [gradeCalcNotes]);

  const toggleEditMode = () => {
    if (isEditMode) {
      setIsEditMode(false);
    } else {
      if (window.confirm("確定要開啟編輯模式嗎？\n\n開啟後您可以新增、修改或刪除計算筆記。")) {
        setIsEditMode(true);
      }
    }
  };

  const handleOpenModal = (index = -1) => {
    if (!isEditMode) {
      alert("目前為「🔒 唯讀模式」\n若要新增或編輯，請先點擊右上角的按鈕切換至編輯狀態。");
      return;
    }

    if (index > -1) {
      const item = gradeCalcNotes[index];
      setEditingIndex(index);
      setFormData({
        subject: item.subject,
        customSubject: item.subject,
        useSelect: false,
      });

      const parsedFormulas = item.formula ? item.formula.split('\n').map(f => {
        const parts = f.split('||');
        return { item: parts[0] || '', weight: parts[1] || '' };
      }) : [];
      setFormulas(parsedFormulas.length > 0 ? parsedFormulas : [{ item: '', weight: '' }]);

      const parsedRemarks = item.remark ? item.remark.split('\n') : [];
      setRemarks(parsedRemarks.length > 0 ? parsedRemarks : ['']);
    } else {
      setEditingIndex(-1);
      setFormData({
        subject: '',
        customSubject: '',
        useSelect: false,
      });
      setFormulas([
        { item: '平時作業', weight: '30%' },
        { item: '期中考', weight: '30%' },
        { item: '期末考', weight: '40%' }
      ]);
      setRemarks(['']);
    }
    
    setIsModalOpen(true);
  };

  const handleSave = () => {
    const finalSubject = formData.useSelect ? formData.subject : formData.customSubject;
    const subject = finalSubject ? finalSubject.trim() : "";
    
    const validRemarks = remarks.map(r => r.trim()).filter(r => r !== '');
    const remark = validRemarks.join('\n');
    
    const validFormulas = formulas
      .map(f => ({ item: f.item.trim(), weight: f.weight.trim() }))
      .filter(f => f.item !== '' || f.weight !== '');
      
    const formulaStr = validFormulas.map(f => `${f.item}||${f.weight}`).join('\n');

    if (!subject || validFormulas.length === 0) {
      alert("請填寫「科目」並至少輸入一項「項目或配分」！");
      return;
    }

    const noteData = { subject, formula: formulaStr, remark };

    if (editingIndex > -1) {
      const newList = [...gradeCalcNotes];
      newList[editingIndex] = noteData;
      setGradeCalcNotes(newList);
      alert("計算筆記已更新！");
    } else {
      setGradeCalcNotes([...gradeCalcNotes, noteData]);
      alert("計算筆記已新增！");
    }

    setIsModalOpen(false);
  };

  const handleDelete = (index) => {
    if (!isEditMode) return;
    if (window.confirm("確定要刪除這則計算筆記嗎？")) {
      const newList = [...gradeCalcNotes];
      newList.splice(index, 1);
      setGradeCalcNotes(newList);
    }
  };

  const updateFormula = (index, field, value) => {
    const newFormulas = [...formulas];
    newFormulas[index] = { ...newFormulas[index], [field]: value };
    setFormulas(newFormulas);
  };

  const updateRemark = (index, value) => {
    const newRemarks = [...remarks];
    newRemarks[index] = value;
    setRemarks(newRemarks);
  };

  const addFormula = () => {
    setFormulas([...formulas, { item: '', weight: '' }]);
  };

  const addRemark = () => {
    setRemarks([...remarks, '']);
  };

  return (
    <div id="view-grade-calc" style={{ animation: 'fadeIn 0.3s' }}>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
          <h2 style={{ margin: 0, border: 'none', padding: 0 }}>🧮 配分筆記</h2>
          <button 
            id="btn-toggle-gc-edit" 
            className="btn-icon" 
            onClick={toggleEditMode}
            style={{ 
              fontSize: '0.85rem', 
              transition: 'all 0.3s', 
              padding: '6px 12px',
              border: isEditMode ? '1px solid var(--primary)' : '1px solid #ddd',
              color: isEditMode ? 'var(--primary)' : '#888',
              background: isEditMode ? '#e6f0ff' : 'transparent',
              borderRadius: '6px'
            }}
          >
            {isEditMode ? '✏️ 編輯模式' : '🔒 唯讀模式'}
          </button>
        </div>
        <p style={{ color: '#888', fontSize: '0.85rem', marginTop: '5px', marginBottom: '15px' }}>記錄各科教授的計分方式與目標分數。</p>
        
        <div id="grade-calc-list" style={{ minHeight: '200px' }}>
          {gradeCalcNotes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px', color: '#999' }}>
               <div style={{ fontSize: '3rem', marginBottom: '10px' }}>🧮</div>
               <p>目前沒有成績計算筆記<br />把各科的配分方式記下來吧！</p>
            </div>
          ) : (
            gradeCalcNotes.map((item, index) => {
              const formulaHtml = item.formula.split('\n').map((f, i) => {
                const parts = f.split('||');
                const name = parts[0] || '';
                const weight = parts[1] || '';
                return (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', background: 'white', border: '1px solid #ddd', borderRadius: '4px', padding: '6px 10px', marginBottom: '5px', fontSize: '0.9rem', color: '#555' }}>
                    <span>{name}</span>
                    <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{weight}</span>
                  </div>
                );
              });
              
              const remarkHtml = item.remark ? item.remark.split('\n').map((r, i) => (
                <div key={i} style={{ fontSize: '0.85rem', color: '#888', marginTop: '6px' }}>💡 {r}</div>
              )) : null;

              return (
                <div key={index} className="card" style={{ marginBottom: '12px', padding: '15px', borderLeft: '5px solid #9b59b6', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: 'var(--text-main)', marginBottom: '8px' }}>
                        {item.subject}
                      </div>
                      <div style={{ marginBottom: '5px', background: '#f9f9f9', padding: '10px', borderRadius: '6px', border: '1px solid #eee' }}>
                        {formulaHtml}
                      </div>
                      {remarkHtml}
                    </div>
                    {isEditMode && (
                      <div style={{ display: 'flex', gap: '5px', marginLeft: '10px', flexDirection: 'column' }}>
                        <button onClick={() => handleOpenModal(index)} style={{ background: 'transparent', border: 'none', color: '#f39c12', cursor: 'pointer', fontSize: '1rem', padding: '4px' }}>✏️</button>
                        <button onClick={() => handleDelete(index)} style={{ background: 'transparent', border: 'none', color: '#ccc', cursor: 'pointer', fontSize: '1rem', padding: '4px' }}>🗑️</button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
        
        {isEditMode && (
          <button id="btn-add-gc" className="btn btn-add" onClick={() => handleOpenModal(-1)} style={{ display: 'block' }}>
            + 新增計算筆記
          </button>
        )}
      </div>

      {isModalOpen && (
        <div className="modal" style={{ display: 'flex' }}>
          <div className="modal-content" style={{ textAlign: 'left', width: '90%', maxWidth: '400px' }}>
            <h3 id="grade-calc-modal-title" style={{ textAlign: 'center', marginTop: 0 }}>
              {editingIndex > -1 ? '✏️ 編輯計算筆記' : '➕ 新增計算筆記'}
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ marginBottom: 0 }}>項目 / 配分 (至少要一項)</label>
                <button 
                  className="btn" 
                  onClick={addFormula} 
                  style={{ background: 'transparent', color: 'var(--primary)', border: '1px solid var(--primary)', width: 'auto', padding: '4px 10px', fontSize: '0.8rem', borderRadius: '6px', cursor: 'pointer' }}
                >
                  + 新增項目
                </button>
              </div>
              <div id="gc-formula-container" style={{ display: 'flex', flexDirection: 'column' }}>
                {formulas.map((f, i) => (
                  <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                    <input 
                      type="text" 
                      placeholder="項目名稱" 
                      value={f.item} 
                      onChange={(e) => updateFormula(i, 'item', e.target.value)} 
                      style={{ flex: 2, padding: '8px', border: '1px solid #ddd', borderRadius: '6px', boxSizing: 'border-box', fontSize: '1rem' }} 
                    />
                    <input 
                      type="text" 
                      placeholder="配分" 
                      value={f.weight} 
                      onChange={(e) => updateFormula(i, 'weight', e.target.value)} 
                      style={{ flex: 1, padding: '8px', border: '1px solid #ddd', borderRadius: '6px', boxSizing: 'border-box', fontSize: '1rem' }} 
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="input-group" style={{ marginTop: '10px', marginBottom: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ marginBottom: 0 }}>補充說明 (選填)</label>
                <button 
                  className="btn" 
                  onClick={addRemark} 
                  style={{ background: 'transparent', color: 'var(--primary)', border: '1px solid var(--primary)', width: 'auto', padding: '4px 10px', fontSize: '0.8rem', borderRadius: '6px', cursor: 'pointer' }}
                >
                  + 新增說明
                </button>
              </div>
              <div id="gc-remark-container" style={{ display: 'flex', flexDirection: 'column' }}>
                {remarks.map((r, i) => (
                  <input 
                    key={i} 
                    type="text" 
                    placeholder="補充說明 (選填)..." 
                    value={r} 
                    onChange={(e) => updateRemark(i, e.target.value)} 
                    style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '6px', boxSizing: 'border-box', marginBottom: '8px', fontSize: '1rem' }} 
                  />
                ))}
              </div>
            </div>

            <button 
              id="btn-save-gc" 
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
