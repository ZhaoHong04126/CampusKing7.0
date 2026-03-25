import { useState, useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

export default function Accounting() {
  const [activeTab, setActiveTab] = useState('summary');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // 真實交易紀錄
  const [transactions, setTransactions] = useState([]);

  // Modal 表單狀態
  const [accType, setAccType] = useState('expense');
  const [accDate, setAccDate] = useState(new Date().toISOString().split('T')[0]);
  const [accMethod, setAccMethod] = useState('現金');
  const [accToMethod, setAccToMethod] = useState('');
  
  // 支援多筆明細
  const [accItems, setAccItems] = useState([{ desc: '', category: '飲食', amount: '' }]);

  // 帳戶與分類設定 (Mock)
  const [paymentMethods, setPaymentMethods] = useState([
    { name: '現金', balance: 1500 },
    { name: '銀行轉帳', balance: 50000 },
    { name: 'LINE Pay', balance: 2000 },
    { name: '悠遊卡', balance: 800 }
  ]);
  const [expenseCategories, setExpenseCategories] = useState(['飲食', '交通', '娛樂', '生活費', '學習']);
  const [incomeCategories, setIncomeCategories] = useState(['打工', '零用錢', '獎學金']);

  const [isAccountsEditMode, setIsAccountsEditMode] = useState(false);
  const [isDetailsEditMode, setIsDetailsEditMode] = useState(false);

  const incomeTotal = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0);
  const expenseTotal = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0);
  const balance = incomeTotal - expenseTotal;

  // Chart References
  const trendChartRef = useRef(null);
  const categoryChartRef = useRef(null);
  const trendChartInstance = useRef(null);
  const categoryChartInstance = useRef(null);

  // 初始化或更新圖表
  useEffect(() => {
    if (activeTab === 'stats') {
      setTimeout(() => {
        // 渲染趨勢圖 (Mock Data)
        if (trendChartRef.current) {
          if (trendChartInstance.current) trendChartInstance.current.destroy();
          const currentMonthLabel = (new Date().getMonth() + 1) + '月';
          trendChartInstance.current = new Chart(trendChartRef.current, {
            type: 'bar',
            data: {
              labels: [currentMonthLabel],
              datasets: [
                { type: 'bar', label: '收入', data: [incomeTotal], backgroundColor: '#2ecc71' },
                { type: 'bar', label: '支出', data: [expenseTotal], backgroundColor: '#e74c3c' },
                { type: 'line', label: '結餘', data: [balance], borderColor: '#3498db', fill: false }
              ]
            },
            options: { responsive: true, maintainAspectRatio: false }
          });
        }

        // 渲染分類比例圖 (Mock Data)
        if (categoryChartRef.current) {
          if (categoryChartInstance.current) categoryChartInstance.current.destroy();
          const expenseTrans = transactions.filter(t => t.type === 'expense');
          const catData = {};
          expenseTrans.forEach(t => { catData[t.category] = (catData[t.category] || 0) + Number(t.amount); });
          
          categoryChartInstance.current = new Chart(categoryChartRef.current, {
            type: 'doughnut',
            data: {
              labels: Object.keys(catData),
              datasets: [{ data: Object.values(catData), backgroundColor: ['#ff9f40', '#ffcd56', '#4bc0c0', '#36a2eb', '#9966ff'] }]
            },
            options: { responsive: true, maintainAspectRatio: false }
          });
        }
      }, 100);
    }
  }, [activeTab, transactions, incomeTotal, expenseTotal, balance]);

  // 新增欄位
  const appendAccItemRow = () => {
    setAccItems([...accItems, { desc: '', category: accType === 'income' ? '打工' : '飲食', amount: '' }]);
  };

  const updateItem = (index, field, value) => {
    const newItems = [...accItems];
    newItems[index][field] = value;
    setAccItems(newItems);
  };

  const removeItem = (index) => {
    if (accItems.length === 1) return;
    const newItems = [...accItems];
    newItems.splice(index, 1);
    setAccItems(newItems);
  };

  const handleSaveTransaction = () => {
    const newTrans = [];
    for (const item of accItems) {
      if (!item.amount || isNaN(item.amount)) { alert('請輸入有效金額'); return; }
      newTrans.push({
        id: Date.now() + Math.random(),
        date: accDate,
        type: accType,
        category: item.category,
        desc: item.desc || '無說明',
        method: accMethod,
        amount: Number(item.amount)
      });
    }
    setTransactions([...newTrans, ...transactions].sort((a,b) => new Date(b.date) - new Date(a.date)));
    setIsModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setAccType('expense');
    setAccDate(new Date().toISOString().split('T')[0]);
    setAccMethod('現金');
    setAccToMethod('');
    setAccItems([{ desc: '', category: '飲食', amount: '' }]);
  };

  const deleteTransaction = (id) => {
    if (window.confirm('確定刪除此筆紀錄？')) {
      setTransactions(transactions.filter(t => t.id !== id));
    }
  };

  // 分組每日統計 (供「每日總收支統計」表格使用)
  const dailyStats = transactions.reduce((acc, t) => {
    if (!acc[t.date]) acc[t.date] = { income: 0, expense: 0 };
    if (t.type === 'income') acc[t.date].income += Number(t.amount);
    if (t.type === 'expense') acc[t.date].expense += Number(t.amount);
    return acc;
  }, {});

  return (
    <div id="view-accounting" style={{ animation: 'fadeIn 0.3s', position: 'relative' }}>
      <div className="week-tabs" style={{ marginBottom: '20px' }}>
        <button className={`tab-btn ${activeTab === 'summary' ? 'active' : ''}`} onClick={() => setActiveTab('summary')} id="btn-acc-summary">📊 摘要</button>
        <button className={`tab-btn ${activeTab === 'details' ? 'active' : ''}`} onClick={() => setActiveTab('details')} id="btn-acc-details">📝 明細</button>
        <button className={`tab-btn ${activeTab === 'stats' ? 'active' : ''}`} onClick={() => setActiveTab('stats')} id="btn-acc-stats">📈 統計</button>
        <button className={`tab-btn ${activeTab === 'accounts' ? 'active' : ''}`} onClick={() => setActiveTab('accounts')} id="btn-acc-accounts">⚙️ 設定</button>
      </div>

      {activeTab === 'summary' && (
        <div id="view-acc-summary">
          <div className="card" style={{ textAlign: 'center', padding: '40px 20px' }}>
            <h2 style={{ justifyContent: 'center', border: 'none', marginBottom: '30px' }}>💰 本學期收支總覽</h2>
            <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '30px' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '5px' }}>總收入</div>
                <div id="acc-summary-income" style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#2ecc71' }}>${incomeTotal}</div>
              </div>
              <div style={{ flex: 1, borderLeft: '1px solid #eee', borderRight: '1px solid #eee' }}>
                <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '5px' }}>總支出</div>
                <div id="acc-summary-expense" style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#e74c3c' }}>${expenseTotal}</div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '5px' }}>結餘</div>
                <div id="acc-summary-balance" style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#333' }}>${balance}</div>
              </div>
            </div>
            <button className="btn btn-add" onClick={() => setIsModalOpen(true)} style={{ fontSize: '1.1rem', padding: '15px' }}>+ 記一筆</button>
          </div>
        </div>
      )}

      {activeTab === 'details' && (
        <div id="view-acc-details">
          <div className="card">
            <h2 style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>📝 收支明細列表</span>
              <button 
                className="btn-icon" 
                onClick={() => setIsDetailsEditMode(!isDetailsEditMode)}
                style={{ fontSize: '0.85rem', background: 'transparent', border: '1px solid #ddd', color: isDetailsEditMode ? 'var(--primary)' : '#888', padding: '6px 12px' }}
              >
                {isDetailsEditMode ? '🔓 編輯模式' : '🔒 唯讀模式'}
              </button>
            </h2>
            <div style={{ width: '100%', overflowX: 'auto', paddingBottom: '10px' }}>
              <table id="accounting-table" style={{ minWidth: '700px', width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #eee' }}>
                    <th width="15%" style={{ padding: '10px' }}>日期</th>
                    <th width="12%" style={{ padding: '10px' }}>分類</th>
                    <th width="28%" style={{ padding: '10px' }}>項目</th>
                    <th width="15%" style={{ padding: '10px' }}>支付方式</th>
                    <th width="15%" style={{ padding: '10px' }}>金額</th>
                    {isDetailsEditMode && <th width="15%" style={{ padding: '10px' }}>更改/刪除</th>}
                  </tr>
                </thead>
                <tbody id="accounting-list-body">
                  {transactions.length === 0 ? (
                    <tr><td colSpan={isDetailsEditMode ? "6" : "5"} style={{ textAlign: 'center', padding: '20px', color: '#999' }}>尚無明細紀錄</td></tr>
                  ) : transactions.map(t => (
                    <tr key={t.id} style={{ borderBottom: '1px solid #f9f9f9' }}>
                      <td style={{ padding: '10px' }}>{t.date}</td>
                      <td style={{ padding: '10px' }}><span style={{ background: '#f0f0f0', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem' }}>{t.category}</span></td>
                      <td style={{ padding: '10px', fontWeight: 'bold' }}>{t.desc}</td>
                      <td style={{ padding: '10px', fontSize: '0.85rem', color: '#666' }}>{t.method}</td>
                      <td style={{ padding: '10px', fontWeight: 'bold', color: t.type === 'income' ? '#2ecc71' : '#e74c3c' }}>
                        {t.type === 'income' ? '+' : '-'}${t.amount}
                      </td>
                      {isDetailsEditMode && (
                        <td style={{ padding: '10px' }}>
                          <button style={{ background: '#ff4d4f', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }} onClick={() => deleteTransaction(t.id)}>刪除</button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'stats' && (
        <div id="view-acc-stats">
          <div className="card" style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column' }}>
            <h2>📈 每月收支趨勢</h2>
            <div style={{ flex: 1, position: 'relative', minHeight: '300px' }}>
              <canvas id="accountingChart" ref={trendChartRef}></canvas>
            </div>
            <p style={{ textAlign: 'center', color: '#999', fontSize: '0.8rem', marginTop: '10px' }}>(柱狀圖：收入/支出 | 折線圖：結餘)</p>
          </div>
          <div className="card" style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column' }}>
            <h2>📊 各分類支出比例</h2>
            <div style={{ flex: 1, position: 'relative', minHeight: '250px' }}>
              <canvas id="categoryChart" ref={categoryChartRef}></canvas>
            </div>
            {expenseTotal === 0 && <p id="no-expense-msg" style={{ textAlign: 'center', color: '#999', fontSize: '0.8rem', marginTop: '10px' }}>目前尚無支出紀錄</p>}
          </div>
          <div className="card">
            <h2>📅 每日總收支統計</h2>
            <table className="daily-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', marginTop: '10px' }}>
              <thead>
                <tr style={{ background: '#f8f9fa' }}>
                  <th style={{ padding: '10px', borderBottom: '2px solid #ddd' }}>日期</th>
                  <th style={{ color: '#2ecc71', padding: '10px', borderBottom: '2px solid #ddd' }}>總收入</th>
                  <th style={{ color: '#e74c3c', padding: '10px', borderBottom: '2px solid #ddd' }}>總支出</th>
                  <th style={{ padding: '10px', borderBottom: '2px solid #ddd' }}>淨收支</th>
                </tr>
              </thead>
              <tbody id="daily-acc-body">
                {Object.keys(dailyStats).sort((a,b)=>new Date(b)-new Date(a)).map(date => {
                  const s = dailyStats[date];
                  const net = s.income - s.expense;
                  return (
                    <tr key={date} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '8px 10px' }}>{date}</td>
                      <td style={{ color: '#2ecc71', padding: '8px 10px' }}>${s.income}</td>
                      <td style={{ color: '#e74c3c', padding: '8px 10px' }}>${s.expense}</td>
                      <td style={{ color: net >= 0 ? '#3498db' : '#e74c3c', fontWeight: 'bold', padding: '8px 10px' }}>${net >= 0 ? '+' : ''}{net}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'accounts' && (
        <div id="view-acc-accounts">
          <div className="card">
            <h2 style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>💳 帳戶餘額概況</span>
              <button id="btn-toggle-acc-edit" className="btn-icon" onClick={() => setIsAccountsEditMode(!isAccountsEditMode)} style={{ fontSize: '0.85rem', background: 'transparent', border: '1px solid #ddd', color: isAccountsEditMode ? 'var(--primary)' : '#888', transition: 'all 0.3s', padding: '6px 12px' }}>
                {isAccountsEditMode ? '🔓 編輯模式' : '🔒 唯讀模式'}
              </button>
            </h2>
            <div id="acc-accounts-list" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
               {paymentMethods.map((pm, idx) => (
                 <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: '#f8f9fa', borderRadius: '8px', border: '1px solid #eee' }}>
                   <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{pm.name}</div>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                     <div style={{ fontSize: '1.2rem', color: pm.balance >= 0 ? '#333' : '#e74c3c', fontWeight: 'bold' }}>${pm.balance}</div>
                     {isAccountsEditMode && (
                        <button style={{ background: '#ff4d4f', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}>刪除</button>
                     )}
                   </div>
                 </div>
               ))}
            </div>
            {isAccountsEditMode && (
              <button id="btn-add-payment-method" className="btn btn-add" style={{ marginTop: '10px' }}>+ 新增支付方式</button>
            )}
          </div>
          <div className="card" style={{ marginTop: '20px' }}>
            <h2>📁 收支分類管理</h2>
            <div id="acc-categories-list" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <h4 style={{ color: '#2ecc71', marginBottom: '8px' }}>💰 收入分類</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {incomeCategories.map(c => (
                     <span key={c} style={{ background: '#e8f5e9', color: '#2ecc71', padding: '5px 10px', borderRadius: '20px', fontSize: '0.9rem', border: '1px solid #c8e6c9', display: 'flex', alignItems: 'center', gap: '5px' }}>
                       {c} {isAccountsEditMode && <span style={{cursor:'pointer', color:'#aaa'}} onClick={() => {}}>&times;</span>}
                     </span>
                  ))}
                  {isAccountsEditMode && <button className="btn-icon" style={{ fontSize: '0.8rem', padding: '4px 8px', borderRadius: '20px' }}>+ 新增</button>}
                </div>
              </div>
              <div>
                <h4 style={{ color: '#e74c3c', marginBottom: '8px' }}>💸 支出分類</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {expenseCategories.map(c => (
                     <span key={c} style={{ background: '#fce4e4', color: '#e74c3c', padding: '5px 10px', borderRadius: '20px', fontSize: '0.9rem', border: '1px solid #f8caca', display: 'flex', alignItems: 'center', gap: '5px' }}>
                       {c} {isAccountsEditMode && <span style={{cursor:'pointer', color:'#aaa'}} onClick={() => {}}>&times;</span>}
                     </span>
                  ))}
                  {isAccountsEditMode && <button className="btn-icon" style={{ fontSize: '0.8rem', padding: '4px 8px', borderRadius: '20px' }}>+ 新增</button>}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Accounting Modal */}
      {isModalOpen && (
        <div className="modal" style={{ display: 'flex' }}>
          <div className="modal-content" style={{ textAlign: 'left' }}>
            <h3 style={{ textAlign: 'center', marginTop: 0 }}>💰 新增收支紀錄</h3>
            
            <div className="input-group">
              <label>類型</label>
              <select id="input-acc-type" className="login-input" style={{ background: 'white' }} value={accType} onChange={(e) => {
                setAccType(e.target.value);
                setAccItems([{ desc: '', category: e.target.value === 'income' ? '打工' : '飲食', amount: '' }]);
              }}>
                <option value="expense">💸 支出</option>
                <option value="income">💰 收入</option>
                <option value="transfer">🔁 轉帳</option>
              </select>
            </div>

            <div className="input-group">
              <label>日期</label>
              <input type="date" id="input-acc-date" value={accDate} onChange={(e) => setAccDate(e.target.value)} />
            </div>

            <div className="input-group" id="acc-multi-items-wrapper">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ marginBottom: 0 }}>項目說明 & 分類 & 金額</label>
                <button className="btn" id="btn-add-acc-row" onClick={appendAccItemRow} style={{ background: 'transparent', color: 'var(--primary)', border: '1px solid var(--primary)', width: 'auto', padding: '4px 10px', fontSize: '0.8rem', borderRadius: '6px', cursor: 'pointer' }}>+ 新增另一筆</button>
              </div>
              
              <div style={{ width: '100%', overflowX: 'auto', paddingBottom: '8px' }}>
                <div id="acc-items-container" style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '450px' }}>
                  {accItems.map((item, idx) => (
                    <div key={idx} className="acc-item-row" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <input type="text" className="acc-desc" placeholder="項目說明" title="說明 / 備註" value={item.desc} onChange={(e) => updateItem(idx, 'desc', e.target.value)} style={{ flex: 2, marginBottom: 0 }} />
                      <select className="acc-cat login-input" title="選擇收支分類" value={item.category} onChange={(e) => updateItem(idx, 'category', e.target.value)} style={{ flex: 1.5, background: 'white', marginBottom: 0, padding: '8px', fontSize: '0.95rem', minWidth: '80px' }}>
                        {accType === 'income' ? incomeCategories.map(c => <option key={c} value={c}>{c}</option>) : expenseCategories.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                      <input type="number" className="acc-amt" placeholder="金額" title="變動金額" value={item.amount} onChange={(e) => updateItem(idx, 'amount', e.target.value)} style={{ flex: 1.5, marginBottom: 0, minWidth: '60px' }} />
                      <button onClick={() => removeItem(idx)} style={{ background: 'transparent', border: 'none', color: '#e74c3c', cursor: 'pointer', fontSize: '1.2rem', minWidth: '30px' }} title="刪除此筆">✖</button>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ fontSize: '0.8rem', color: '#999', marginTop: '8px' }}>※ 若需新增或刪除分類，請至「⚙️ 設定」頁面設定</div>
            </div>

            <div className="input-group">
              <label id="label-acc-method">支付方式</label>
              <select id="input-acc-method" className="login-input" style={{ background: 'white' }} value={accMethod} onChange={(e) => setAccMethod(e.target.value)}>
                {paymentMethods.map(m => <option key={m.name} value={m.name}>{m.name}</option>)}
              </select>
            </div>

            {accType === 'transfer' && (
              <div className="input-group" id="group-acc-to-method">
                <label>轉入帳戶 (存入)</label>
                <select id="input-acc-to-method" className="login-input" style={{ background: 'white' }} value={accToMethod} onChange={(e) => setAccToMethod(e.target.value)}>
                  {paymentMethods.map(m => <option key={m.name} value={m.name}>{m.name}</option>)}
                </select>
              </div>
            )}

            <button id="btn-save-acc" className="btn" style={{ width: '100%', background: '#333' }} onClick={handleSaveTransaction}>+ 確定新增</button>
            <button className="btn" style={{ width: '100%', marginTop: '10px', background: 'transparent', color: '#666', border: '1px solid #ddd' }} onClick={() => setIsModalOpen(false)}>關閉</button>
          </div>
        </div>
      )}
    </div>
  );
}
