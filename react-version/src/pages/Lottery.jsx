import { useState, useEffect, useRef } from 'react';

const defaultLotteryData = [
    {
        title: "午餐吃什麼",
        items: ["麥當勞", "學餐", "便利商店", "便當", "不吃"]
    },
    {
        title: "飲料喝什麼",
        items: ["紅茶", "綠茶", "奶茶", "開水", "咖啡"]
    }
];

export default function Lottery() {
  const [lotteryList, setLotteryList] = useState(() => {
    const saved = localStorage.getItem('lotteryList');
    return saved ? JSON.parse(saved) : defaultLotteryData;
  });

  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [isDrawing, setIsDrawing] = useState(false);
  const [resultText, setResultText] = useState("準備好了嗎？");
  const [resultColor, setResultColor] = useState("#aaa");
  const [resultScale, setResultScale] = useState(1);
  const [buttonText, setButtonText] = useState("🎲 開始抽籤");
  const [newItemText, setNewItemText] = useState('');

  const drawIntervalRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('lotteryList', JSON.stringify(lotteryList));
  }, [lotteryList]);

  // Ensure category index is valid
  const currentData = lotteryList[currentCategoryIndex] || { title: '', items: [] };

  const handleSwitchCategory = (e) => {
    setCurrentCategoryIndex(Number(e.target.value));
    setResultText("準備好了嗎？");
    setResultColor("#aaa");
    setButtonText("🎲 開始抽籤");
  };

  const handleAddCategory = () => {
    const title = window.prompt("請輸入新分類名稱 (例如: 晚餐)", "新增籤筒");
    if (title) {
      setLotteryList([...lotteryList, { title, items: [] }]);
      setCurrentCategoryIndex(lotteryList.length);
      setResultText("準備好了嗎？");
      setResultColor("#aaa");
      setButtonText("🎲 開始抽籤");
    }
  };

  const handleDeleteCategory = () => {
    if (lotteryList.length <= 1) {
      alert("至少要保留一個分類！");
      return;
    }
    const currentTitle = currentData.title;
    if (window.confirm(`確定要刪除「${currentTitle}」嗎？`)) {
      const newList = [...lotteryList];
      newList.splice(currentCategoryIndex, 1);
      setLotteryList(newList);
      setCurrentCategoryIndex(0);
      setResultText("準備好了嗎？");
      setResultColor("#aaa");
      setButtonText("🎲 開始抽籤");
    }
  };

  const handleAddItem = () => {
    const val = newItemText.trim();
    if (!val) return;
    const newList = [...lotteryList];
    newList[currentCategoryIndex].items.push(val);
    setLotteryList(newList);
    setNewItemText('');
  };

  const handleDeleteItem = (index) => {
    const newList = [...lotteryList];
    newList[currentCategoryIndex].items.splice(index, 1);
    setLotteryList(newList);
  };

  const startLottery = () => {
    if (isDrawing) return;

    const currentItems = currentData.items;
    
    if (currentItems.length < 2) {
      alert("至少要有兩個選項才能抽喔！");
      return;
    }

    setIsDrawing(true);
    setButtonText("👀 命運轉動中...");
    setResultColor("var(--primary)");
    setResultScale(1);

    let count = 0;
    const totalTime = 30;

    const tick = () => {
      const randIndex = Math.floor(Math.random() * currentItems.length);
      setResultText(currentItems[randIndex]);
      count++;

      if (count > totalTime) {
        finishDraw(currentItems);
      } else {
        drawIntervalRef.current = setTimeout(tick, 50 + (count * 2));
      }
    };
    
    tick();
  };

  const finishDraw = (currentItems) => {
    const finalIndex = Math.floor(Math.random() * currentItems.length);
    const winner = currentItems[finalIndex];

    setResultText(`🎉 ${winner} 🎉`);
    setResultColor("#e74c3c");
    setResultScale(1.2);
    
    setTimeout(() => {
      setResultScale(1);
    }, 200);

    setIsDrawing(false);
    setButtonText("🎲 再抽一次");
  };

  useEffect(() => {
    return () => {
      if (drawIntervalRef.current) clearTimeout(drawIntervalRef.current);
    };
  }, []);

  return (
    <div id="view-lottery" style={{ animation: 'fadeIn 0.3s' }}>
      <div className="card" style={{ textAlign: 'center', padding: '30px 20px' }}>
        <h2 style={{ justifyContent: 'center', border: 'none', marginBottom: '10px' }}>🎰 今天運氣如何？</h2>
        <div id="lottery-result-box" style={{ background: '#f8f9fa', border: '2px dashed #ddd', borderRadius: '12px', padding: '40px 20px', margin: '20px 0', minHeight: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span id="lottery-result-text" style={{ fontSize: '2rem', fontWeight: 'bold', color: resultColor, transform: `scale(${resultScale})`, transition: 'transform 0.2s' }}>
            {resultText}
          </span>
        </div>
        <button id="btn-draw" className="btn" disabled={isDrawing} style={{ width: '100%', padding: '15px', fontSize: '1.2rem', background: 'var(--primary)', boxShadow: '0 4px 12px rgba(74, 144, 226, 0.3)' }} onClick={startLottery}>
          {buttonText}
        </button>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h2 style={{ margin: 0, border: 'none' }}>📝 籤筒清單</h2>
          <select id="lottery-category-select" value={currentCategoryIndex} onChange={handleSwitchCategory} style={{ padding: '5px', borderRadius: '6px', border: '1px solid #ddd' }}>
            {lotteryList.map((cat, index) => (
              <option key={index} value={index}>{cat.title}</option>
            ))}
          </select>
        </div>
        <div className="input-group" style={{ display: 'flex', gap: '10px' }}>
          <input type="text" id="input-lottery-item" value={newItemText} onChange={(e) => setNewItemText(e.target.value)} placeholder="新增選項 (例如: 麥當勞)" style={{ flex: 1 }} />
          <button className="btn" onClick={handleAddItem} style={{ width: 'auto', background: '#666' }}>+</button>
        </div>
        <div id="lottery-list" style={{ marginTop: '10px' }}>
          {currentData.items.length === 0 ? (
            <p style={{ color: '#999', textAlign: 'center', padding: '10px' }}>這裡空空的，加點選項吧！</p>
          ) : (
            currentData.items.map((item, index) => (
              <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', borderBottom: '1px solid #eee' }}>
                <span style={{ fontSize: '1rem' }}>{item}</span>
                <button onClick={() => handleDeleteItem(index)} style={{ background: 'transparent', border: 'none', color: '#ccc', cursor: 'pointer' }}>✖</button>
              </div>
            ))
          )}
        </div>
        <div style={{ marginTop: '20px', textAlign: 'right' }}>
          <button className="btn" onClick={handleAddCategory} style={{ background: 'transparent', color: 'var(--primary)', border: '1px solid var(--primary)', width: 'auto', fontSize: '0.8rem' }}>
            + 新增分類
          </button>
          <button className="btn" onClick={handleDeleteCategory} style={{ background: 'transparent', color: '#e74c3c', border: '1px solid #e74c3c', width: 'auto', fontSize: '0.8rem', marginLeft: '5px' }}>
            🗑️ 刪除此分類
          </button>
        </div>
      </div>
    </div>
  );
}
