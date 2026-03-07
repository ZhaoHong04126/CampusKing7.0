/* ========================================================================== */
/* 📌 成績單全域變數與載入 (Grade State & Loading)                              */
/* ========================================================================== */

// 紀錄目前正在編輯的成績在 gradeList 陣列中的索引位置 (-1 代表新增模式)
let editingGradeIndex = -1;

// 載入並渲染學期成績列表，同時計算 GPA、總學分與實得學分
function loadGrades() {
    const tb = document.getElementById('grade-body');
    if (!tb) return;
    tb.innerHTML = '';
    
    let ts = 0, tc = 0, ec = 0;
    
    gradeList.forEach(g => {
        const cr = parseFloat(g.credit) || 1;
              sc = parseFloat(g.score);
        const isSelfStudy = (sc === -1 && g.subject === '自主學習');
        
        let displayScore = sc;
        let scoreColor = '';

        if (isSelfStudy){
            ec += cr;
            displayScore = '<span style="background:#e8f5e9; color:#2e7d32; padding:2px 6px; border-radius:4px; font-size:0.85rem;">P (通過)</span>';
            scoreColor = '';
        }else{
            sc = sc || 0;
            const pass = sc >= 60;
            if (pass) ec += cr;
            ts += sc * cr;
            tc += cr;
            
            displayScore = sc;
            scoreColor = pass ? '#2ecc71' : '#e74c3c';
        }

        tb.innerHTML += `<tr>
            <td>${g.subject}</td>
            <td>${cr}</td>
            <td>${isSelfStudy ? cr : (sc >= 60 ? cr : 0)}</td>
            <td style="font-weight:bold; color:${scoreColor}">${displayScore}</td>
        </tr>`;
    }); 
    
    let avg = 0;
    if (tc > 0) avg = ts / tc;
    document.getElementById('average-score').innerHTML = `加權平均: ${avg.toFixed(2)} <span style="font-size:0.8rem; color:#666;">(實得${ec}學分)</span>`;
}



/* ========================================================================== */
/* 📌 成績新增與編輯管理 (Grade Editing & Management)                           */
/* ========================================================================== */

// 渲染編輯 Modal (彈出視窗) 中的成績列表，讓使用者預覽現有成績
function renderGradeEditList() {
    const listDiv = document.getElementById('current-grade-list');
    let html = ''; 
    gradeList.forEach((item, i) => {
        const info = `${item.credit}學分 | ${item.score}分`;
        html += `
        <div class="course-list-item">
            <div class="course-info">
                <div class="course-name">${item.subject}</div>
                <div class="course-time">${info}</div>
            </div>
            <div>
                <button class="btn-edit" onclick="editGrade(${i})">修改</button>
                <button class="btn-delete" onclick="deleteGrade(${i})">刪除</button>
            </div>
        </div>`;
    });
    listDiv.innerHTML = html || '<p style="color:#999; text-align:center">無成績</p>';
}

// 準備編輯某筆成績，並將資料回填至輸入表單
function editGrade(index) {
    const item = gradeList[index];
    if (!item) return;

    updateExamSubjectOptions(); 

    const isSelfStudy = (item.score === -1 && item.subject === '自主學習');
    
    const chk = document.getElementById('input-grade-self-study');
    chk.checked = isSelfStudy;
    toggleSelfStudyMode();

    if (!isSelfStudy) {
        const sel = document.getElementById('input-grade-subject-select');
        const txt = document.getElementById('input-grade-subject-text');
        const btn = document.getElementById('btn-toggle-input');
        
        const optionExists = sel.querySelector(`option[value="${item.subject}"]`);
        if (optionExists) {
            sel.style.display = 'block';
            txt.style.display = 'none';
            btn.innerText = "✏️";
            sel.value = item.subject;
        } else {
            sel.style.display = 'none';
            txt.style.display = 'block';
            btn.innerText = "📜";
            txt.value = item.subject;
        }
        document.getElementById('input-grade-score').value = item.score;
        document.getElementById('input-grade-category').value = item.category || '通識';
        document.getElementById('input-grade-nature').value = item.nature || '必修';
    }

    document.getElementById('input-grade-credit').value = item.credit || '';

    editingGradeIndex = index;
    const saveBtn = document.getElementById('btn-add-grade');
    if (saveBtn) {
        saveBtn.innerText = "💾 保存修改";
        saveBtn.style.background = "#f39c12";
    }
}

// 取得輸入資料並新增或儲存成績到陣列中
function addGrade() {
    const isSelfStudy = document.getElementById('input-grade-self-study').checked;
    let s, category, nature, sc;

    if (isSelfStudy) {
        s = "自主學習";
        category = "自由選修"; 
        nature = "選修";
        sc = -1;
    } else {
        const sel = document.getElementById('input-grade-subject-select');
        const txt = document.getElementById('input-grade-subject-text');
        s = (sel.style.display !== 'none') ? sel.value : txt.value;
        category = document.getElementById('input-grade-category').value;
        nature = document.getElementById('input-grade-nature').value;
        sc = document.getElementById('input-grade-score').value;
    }

    const c = document.getElementById('input-grade-credit').value;
    if ( (isSelfStudy) || (s && sc) ) {
        const gradeData = {
            subject: s, 
            category: category, 
            nature: nature,
            credit: parseInt(c) || 0,
            score: isSelfStudy ? -1 : (parseInt(sc) || 0)
        };

        if (editingGradeIndex > -1) {
            gradeList[editingGradeIndex] = gradeData;
            showAlert("成績修改成功！");
        } else {
            gradeList.push(gradeData);
        }

        resetGradeInput();
        saveData();
        renderGradeEditList();
        if(document.getElementById('grade-body')) loadGrades();
    } else {
        showAlert('資料不完整，請檢查科目與分數', '錯誤');
    }
}

// 重置成績輸入框與狀態，恢復為新增模式
function resetGradeInput() {
    const chk = document.getElementById('input-grade-self-study');
    if(chk) {
        chk.checked = false;
        toggleSelfStudyMode();
    }

    document.getElementById('input-grade-subject-select').style.display = 'block';
    document.getElementById('input-grade-subject-text').style.display = 'none';
    document.getElementById('btn-toggle-input').innerText = "✏️";
    document.getElementById('input-grade-subject-select').value = '';
    document.getElementById('input-grade-subject-text').value = '';
    document.getElementById('input-grade-category').value = '通識'; 
    document.getElementById('input-grade-nature').value = '必修';
    document.getElementById('input-grade-credit').value = '1';
    document.getElementById('input-grade-score').value = '';
    
    editingGradeIndex = -1;
    
    const btn = document.getElementById('btn-add-grade');
    if (btn) {
        btn.innerText = "+ 加入成績單";
        btn.style.background = "#333";
    }
}

// 刪除指定的成績紀錄
function deleteGrade(i) {
    showConfirm('確定刪除此成績？', '刪除確認').then(ok => {
        if (ok) {
            if (editingGradeIndex === i) resetGradeInput();
            gradeList.splice(i, 1);
            saveData();
            renderGradeEditList();
        }
    });
}

// 開啟成績管理 Modal 視窗
function openGradeModal() {
    updateExamSubjectOptions();
    updateGradeCategoryOptions(); 
    document.getElementById('grade-modal').style.display = 'flex';
    const g = document.getElementById('input-credit-group');
    if (g) g.style.display = 'block'; 
    resetGradeInput(); 
    renderGradeEditList();
}

// 關閉成績管理 Modal 視窗
function closeGradeModal() {
    document.getElementById('grade-modal').style.display = 'none';
    resetGradeInput();
}



/* ========================================================================== */
/* 📌 表單選項與介面切換控制 (Form Options & Toggles)                           */
/* ========================================================================== */

// 更新成績 Modal 中的「課程歸類」下拉選單，與設定頁面同步
function updateGradeCategoryOptions() {
    const select = document.getElementById('input-grade-category');
    if (!select) return;

    const currentVal = select.value;
    select.innerHTML = '';

    const categories = Object.keys(categoryTargets);
    
    if (categories.length === 0) {
        select.innerHTML = '<option value="" disabled selected>請先至設定頁新增類別</option>';
    } else {
        categories.forEach(cat => {
            const opt = document.createElement('option');
            opt.value = cat;
            opt.innerText = cat;
            select.appendChild(opt);
        });
        if (!categoryTargets['其他']) {
             const opt = document.createElement('option');
             opt.value = '其他';
             opt.innerText = '其他';
             select.appendChild(opt);
        }
    }
    
    if (currentVal && (categories.includes(currentVal) || currentVal === '其他')) {
        select.value = currentVal;
    }
}

// 更新所有成績相關 Modal 中的「科目」下拉選單 (從課表自動抓取)
function updateExamSubjectOptions() {
    const examSelect = document.getElementById('exam-subject-select');
    const gradeSelect = document.getElementById('input-grade-subject-select'); 
    
    if (!examSelect || !gradeSelect) return;

    const examVal = examSelect.value;
    const gradeVal = gradeSelect.value;

    const placeholder = '<option value="" disabled selected>選擇科目</option>';
    examSelect.innerHTML = placeholder;
    gradeSelect.innerHTML = placeholder;

    let allSubjects = new Set(); 
    Object.values(weeklySchedule).forEach(dayCourses => {
        dayCourses.forEach(course => {
            if (course.subject) allSubjects.add(course.subject);
        });
    });

    Array.from(allSubjects).sort().forEach(sub => {
        const opt = document.createElement('option');
        opt.value = sub;
        opt.innerText = sub;
        examSelect.appendChild(opt.cloneNode(true));
        gradeSelect.appendChild(opt.cloneNode(true));
    });

    if (examVal) examSelect.value = examVal;
    if (gradeVal) gradeSelect.value = gradeVal;
}

// 切換「下拉選單選擇」與「手動輸入」科目的模式
function toggleGradeInputMode() {
    const sel = document.getElementById('input-grade-subject-select');
    const txt = document.getElementById('input-grade-subject-text');
    const btn = document.getElementById('btn-toggle-input');
    
    if (sel.style.display !== 'none') {
        sel.style.display = 'none';
        txt.style.display = 'block';
        btn.innerText = "📜";
        txt.focus();
    } else {
        sel.style.display = 'block';
        txt.style.display = 'none';
        btn.innerText = "✏️";
    }
}

// 切換自主學習模式 (隱藏不必要的輸入欄位)
function toggleSelfStudyMode() {
    const isSelfStudy = document.getElementById('input-grade-self-study').checked;
    const groupSubject = document.getElementById('group-grade-subject');
    const groupCatNature = document.getElementById('group-grade-cat-nature');
    const groupScore = document.getElementById('group-grade-score');
    
    if (isSelfStudy) {
        groupSubject.style.display = 'none';
        groupCatNature.style.display = 'none';
        groupScore.style.display = 'none';
    } else {
        groupSubject.style.display = 'block';
        groupCatNature.style.display = 'block';
        groupScore.style.display = 'block';
    }
}



/* ========================================================================== */
/* 📌 考試成績管理 (Exam Management - Regular & Midterm)                        */
/* ========================================================================== */

// 監聽下拉選單變更事件，當使用者切換科目時自動載入該科目的考試成績
document.addEventListener('change', (e) => {
    if (e.target.id === 'exam-subject-select') renderExams();
});

// 渲染指定科目的考試成績列表 (合併顯示平常考與段考)
function renderExams() {
    const subject = document.getElementById('exam-subject-select').value;
    const tbody = document.getElementById('exam-body');
    if (!tbody) return;

    if (!subject) {
        tbody.innerHTML = '<tr><td colspan="3" class="no-class">👈 請先選擇科目</td></tr>';
        return;
    }

    const regScores = regularExams[subject] || [];
    const midScores = midtermExams[subject] || [];
    
    if (regScores.length === 0 && midScores.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" class="no-class">📭 目前無紀錄</td></tr>';
        return;
    }

    let html = '';
    
    regScores.forEach((item, index) => {
        html += `
            <tr>
                <td><span style="background:#e3f2fd; color:#1565c0; padding:2px 6px; border-radius:4px; font-size:0.8rem;">平常考</span></td>
                <td style="text-align:left; padding-left:10px;">
                    ${item.title}
                    <span onclick="deleteRegularExam(${index})" style="cursor:pointer; color:#e74c3c; margin-left:5px; font-size:0.8rem;">🗑️</span>
                </td>
                <td style="font-weight:bold; color: var(--primary);">${item.score}</td>
            </tr>
        `;
    });
    
    midScores.forEach((item, index) => {
        html += `
            <tr>
                <td><span style="background:#fff8e1; color:#f57f17; padding:2px 6px; border-radius:4px; font-size:0.8rem;">段考</span></td>
                <td style="text-align:left; padding-left:10px;">
                    ${item.title}
                    <span onclick="deleteMidtermExam(${index})" style="cursor:pointer; color:#e74c3c; margin-left:5px; font-size:0.8rem;">🗑️</span>
                </td>
                <td style="font-weight:bold; color: var(--primary);">${item.score}</td>
            </tr>
        `;
    });
    tbody.innerHTML = html;
}

// 開啟平常考新增視窗
function openRegularModal() {
    const subject = document.getElementById('exam-subject-select').value;
    if (!subject) { showAlert("請先在上方選單選擇一個科目！"); return; }
    document.getElementById('modal-regular-subject-name').innerText = subject;
    document.getElementById('input-regular-name').value = '';
    document.getElementById('input-regular-score').value = '';
    document.getElementById('regular-exam-modal').style.display = 'flex';
}

// 關閉平常考 Modal
function closeRegularModal() {
    document.getElementById('regular-exam-modal').style.display = 'none';
}

// 新增平常考成績至資料結構中
function addRegularExam() {
    const subject = document.getElementById('exam-subject-select').value;
    const name = document.getElementById('input-regular-name').value;
    const score = document.getElementById('input-regular-score').value;

    if (!name || !score) { showAlert("請輸入名稱和分數"); return; }

    if (!regularExams[subject]) regularExams[subject] = [];
    regularExams[subject].push({ title: name, score: parseInt(score) || 0 });

    saveData(); 
    closeRegularModal();
    renderExams(); 
}

// 刪除指定的平常考成績
function deleteRegularExam(index) {
    const subject = document.getElementById('exam-subject-select').value;
    showConfirm("確定要刪除這筆成績嗎？").then(ok => {
        if(ok) {
            regularExams[subject].splice(index, 1);
            saveData();
            renderExams();
        }
    });
}

// 開啟段考新增視窗
function openMidtermModal() {
    const subject = document.getElementById('exam-subject-select').value;
    if (!subject) { showAlert("請先在上方選單選擇一個科目！"); return; }
    document.getElementById('modal-midterm-subject-name').innerText = subject;
    document.getElementById('input-midterm-name').value = '';
    document.getElementById('input-midterm-score').value = '';
    document.getElementById('midterm-exam-modal').style.display = 'flex';
}

// 關閉段考 Modal
function closeMidtermModal() {
    document.getElementById('midterm-exam-modal').style.display = 'none';
}

// 新增段考成績至資料結構中
function addMidtermExam() {
    const subject = document.getElementById('exam-subject-select').value;
    const name = document.getElementById('input-midterm-name').value;
    const score = document.getElementById('input-midterm-score').value;

    if (!name || !score) { showAlert("請輸入名稱和分數"); return; }
    if (!midtermExams[subject]) midtermExams[subject] = [];
    midtermExams[subject].push({ title: name, score: parseInt(score) || 0 });

    saveData();
    closeMidtermModal();
    renderExams();
}

// 刪除指定的段考成績
function deleteMidtermExam(index) {
    const subject = document.getElementById('exam-subject-select').value;
    showConfirm("確定要刪除這筆成績嗎？").then(ok => {
        if(ok) {
            midtermExams[subject].splice(index, 1);
            saveData();
            renderExams();
        }
    });
}



/* ========================================================================== */
/* 📌 成績分析與圖表 (Grade Analysis & Charts)                                  */
/* ========================================================================== */

// Chart.js 圖表實例變數，用來銷毀舊圖表以重繪
let gradeChartInstance = null;

// 計算某學期所有成績的加權平均分數
function calculateSemesterAverage(grades) {
    let ts = 0, tc = 0;
    if (!grades || grades.length === 0) return 0;
    grades.forEach(g => {
        const cr = parseFloat(g.credit) || 1;
        const sc = parseFloat(g.score);
        
        if (sc !== -1) {
            ts += (sc || 0) * cr;
            tc += cr;
        }
    });
    return tc > 0 ? (ts / tc).toFixed(1) : 0;
}

// 渲染圖表分析畫面 (包含 GPA 趨勢圖、學分進度條、各模組細節)
function renderAnalysis() {
    const labels = [];
    const dataPoints = [];
    let totalCreditsEarned = 0;
    
    let categoryEarned = {};
    const categories = Object.keys(categoryTargets);
    if(!categories.includes('其他')) categories.push('其他');
    
    categories.forEach(cat => {
        categoryEarned[cat] = { total: 0, "必修": 0, "選修": 0, "必選修": 0 };
    });

    const sortedSemesters = semesterList.slice().sort(); 

    sortedSemesters.forEach(sem => {
        let semData = allData[sem];
        let grades = (sem === currentSemester) ? gradeList : (semData ? semData.grades : []);

        if (grades) {
            let semTs = 0, semTc = 0;
            grades.forEach(g => {
                const s = parseFloat(g.score);
                const c = parseFloat(g.credit) || 0;
                if (s !== -1) {
                    semTs += (s || 0) * c;
                    semTc += c;
                }
            });
            const avg = semTc > 0 ? (semTs / semTc).toFixed(1) : 0;

            if (grades.length > 0) {
                labels.push(sem);
                dataPoints.push(avg);
            }
            
            grades.forEach(g => {
                const sc = parseFloat(g.score);
                const cr = parseFloat(g.credit) || 0;
                let cat = g.category || '其他';
                
                if (sc === -1 || g.subject === '自主學習') {
                    cat = '自由選修';
                }

                const nature = g.nature || '必修';
                const isPassed = (sc >= 60) || (sc === -1);

                if (isPassed) {
                    totalCreditsEarned += cr;
                    if (!categoryEarned[cat]) {
                        categoryEarned[cat] = { total: 0, "必修": 0, "選修": 0, "必選修": 0 };
                    }
                    categoryEarned[cat].total += cr;
                    
                    if (categoryEarned[cat][nature] !== undefined) {
                        categoryEarned[cat][nature] += cr;
                    } else {
                         categoryEarned[cat]["選修"] += cr;
                    }
                }
            });
        }
    });

    updateTotalProgressBar(totalCreditsEarned);
    renderCategoryBreakdown(categoryEarned);

    try {
        const ctx = document.getElementById('gradeChart');
        if (ctx) {
            if (gradeChartInstance) gradeChartInstance.destroy();
            
            const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
            const textColor = isDark ? '#e0e0e0' : '#666666'; 
            const gridColor = isDark ? '#444444' : '#dddddd';

            const thresholdLinesPlugin = {
                id: 'thresholdLines',
                beforeDatasetsDraw(chart) {
                    const { ctx, scales: { y }, chartArea: { left, right } } = chart;
                    ctx.save();
                    ctx.lineWidth = 3; 
                    ctx.strokeStyle = '#f1c40f';
                    ctx.setLineDash([5, 5]);

                    const y60 = y.getPixelForValue(60);
                    if (y60 >= chart.chartArea.top && y60 <= chart.chartArea.bottom) {
                        ctx.beginPath(); ctx.moveTo(left, y60); ctx.lineTo(right, y60); ctx.stroke();
                    }
                    const y80 = y.getPixelForValue(80);
                    if (y80 >= chart.chartArea.top && y80 <= chart.chartArea.bottom) {
                        ctx.beginPath(); ctx.moveTo(left, y80); ctx.lineTo(right, y80); ctx.stroke();
                    }
                    ctx.restore();
                }
            };

            gradeChartInstance = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: '學期平均',
                        data: dataPoints,
                        borderColor: '#4a90e2',
                        backgroundColor: 'rgba(74, 144, 226, 0.1)',
                        fill: true,
                        tension: 0.3
                    }]
                },
                plugins: [thresholdLinesPlugin],
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        x: {
                            ticks: { color: textColor },
                            grid: { color: gridColor },
                            title: { display: true, text: '學期', color: textColor }
                        },
                        y: {
                            beginAtZero: false,
                            suggestedMin: 40,
                            suggestedMax: 100,
                            ticks: { color: textColor },
                            grid: { color: gridColor },
                            title: { display: true, text: '平均', color: textColor }
                        }
                    },
                    plugins: { legend: { display: false } }
                }
            });
        }
    } catch (e) {
        console.warn("圖表載入略過：", e);
    }
}

// 更新畢業總學分進度條的 UI 顯示
function updateTotalProgressBar(earned) {
    const progressEl = document.getElementById('credit-progress-bar');
    const totalEl = document.getElementById('total-credits');
    const container = document.getElementById('credit-progress-container');
    if(container) container.style.display = 'block';

    if (progressEl && totalEl) {
        const percentage = Math.min((earned / graduationTarget) * 100, 100);
        progressEl.style.width = percentage + '%';
        
        if(percentage < 30) progressEl.style.background = '#e74c3c';
        else if(percentage < 70) progressEl.style.background = '#f39c12';
        else progressEl.style.background = '#2ecc71';

        totalEl.innerText = earned;
    }
}

// 渲染各學分模組 (通識、專業等) 的進度條與詳細數據
function renderCategoryBreakdown(earnedMap) {
    const panelUni = document.getElementById('panel-credits-uni');
    const listUni = document.getElementById('list-credits-uni');

    if (!panelUni) return;
    panelUni.style.display = 'block';

    let html = '';
    const order = Object.keys(categoryTargets);
    if (order.length === 0) {
        listUni.innerHTML = '<p style="text-align:center; color:#999;">尚未設定學分模組，請至上方「設定標準」新增。</p>';
        return;
    }
    
    order.forEach(cat => {
        const data = earnedMap[cat] || { total: 0, "必修": 0, "選修": 0 };
        const targetConfig = categoryTargets[cat];
        const isComplex = (typeof targetConfig === 'object');

        if (!isComplex) {
            const target = targetConfig || 0;
            const earned = data.total;
            if (target === 0 && earned === 0 && cat !== "其他") return;
            let percent = 0; if (target > 0) percent = Math.min(Math.round((earned / target) * 100), 100);
            let barColor = percent >= 100 ? "#2ecc71" : "#4a90e2";
                
            html += `
            <div style="margin-bottom: 12px;">
                <div style="display:flex; justify-content:space-between; font-size:0.9rem; margin-bottom:4px;">
                    <span style="font-weight:bold; color:#555;">${cat}</span>
                    <span><span style="font-weight:bold; color:${barColor}">${earned > 0 ? earned + ' / ' + target : earned}</span></span>
                </div>
                <div style="background: #eee; border-radius: 6px; height: 10px; width: 100%; overflow: hidden;">
                    <div style="background: ${barColor}; width: ${percent}%; height: 100%;"></div>
                </div>
            </div>`;
        } 
        else {
            const reqTarget = targetConfig["必修"] || 0;
            const eleTarget = targetConfig["選修"] || 0;
            const reqEarned = data["必修"] || 0;
            const eleEarned = (data["選修"] || 0) + (data["必選修"] || 0);

            const reqPercent = reqTarget > 0 ? Math.min(Math.round((reqEarned / reqTarget) * 100), 100) : (reqEarned > 0 ? 100 : 0);
            const elePercent = eleTarget > 0 ? Math.min(Math.round((eleEarned / eleTarget) * 100), 100) : (eleEarned > 0 ? 100 : 0);
            const reqColor = reqPercent >= 100 ? "#2ecc71" : "#e74c3c";
            const eleColor = elePercent >= 100 ? "#2ecc71" : "#f39c12";

            html += `
            <div style="margin-bottom: 15px; background: #fafafa; padding: 10px; border-radius: 8px; border: 1px solid #eee;">
                <div style="font-weight:bold; color:#333; margin-bottom: 8px; font-size: 0.95rem;">${cat}模組</div>
                <div style="margin-bottom: 6px;">
                    <div style="display:flex; justify-content:space-between; font-size:0.8rem; color:#666;">
                        <span>必修</span><span>${reqEarned} / ${reqTarget}</span>
                    </div>
                    <div style="background: #e0e0e0; border-radius: 4px; height: 8px; width: 100%; overflow: hidden;">
                        <div style="background: ${reqColor}; width: ${reqPercent}%; height: 100%;"></div>
                    </div>
                </div>
                <div>
                    <div style="display:flex; justify-content:space-between; font-size:0.8rem; color:#666;">
                        <span>選修</span><span>${eleEarned} / ${eleTarget}</span>
                    </div>
                    <div style="background: #e0e0e0; border-radius: 4px; height: 8px; width: 100%; overflow: hidden;">
                        <div style="background: ${eleColor}; width: ${elePercent}%; height: 100%;"></div>
                    </div>
                </div>
            </div>`;
        }
    });
    listUni.innerHTML = html;
}



/* ========================================================================== */
/* 📌 學分標準與設定 (Credit Settings & UI Toggles)                             */
/* ========================================================================== */

// 更新畢業學分目標數值並存檔 (綁定於設定頁的輸入框)
function updateGraduationTarget(val) {
    const newVal = parseInt(val);
    if (newVal && newVal > 0) {
        graduationTarget = newVal;
        saveData();
    } else {
        showAlert("請輸入有效的正整數");
        document.getElementById('setting-grad-target').value = graduationTarget;
    }
}

// 切換成績管理頁面中的各個子分頁 (總覽、平常考、學期成績、統計、學分設定)
function switchGradeTab(tabName) {
    const tabs = ['dashboard', 'exams', 'list', 'chart', 'credits'];

    tabs.forEach(t => {
        const btn = document.getElementById(`tab-grade-${t}`);
        const view = document.getElementById(`subview-grade-${t}`);
        if (btn) btn.classList.remove('active');
        if (view) view.style.display = 'none';
    });

    const activeBtn = document.getElementById(`tab-grade-${tabName}`);
    const activeView = document.getElementById(`subview-grade-${tabName}`);
    if (activeBtn) activeBtn.classList.add('active');
    if (activeView) activeView.style.display = 'block';

    if (tabName === 'dashboard') {
        renderGradeDashboard();
    } else if (tabName === 'exams') {
        updateExamSubjectOptions();
        renderExams();
    } else if (tabName === 'list') {
        loadGrades();
    }

    if (tabName === 'credits'){
        renderAnalysis();
        renderCreditSettings();
    } else if (tabName === 'chart'){
        setTimeout(() => {
            if (typeof renderAnalysis === 'function') renderAnalysis(); 
        }, 50 );
    }

}

// 渲染「總覽」分頁的統計儀表板 (GPA、學分、被當科數)
function renderGradeDashboard() {
    let totalScore = 0;      
    let totalCreditsForGpa = 0;
    let earnedCredits = 0;
    let failedCount = 0;

    gradeList.forEach(g => {
        const score = parseFloat(g.score);
        const credit = parseFloat(g.credit) || 0;
        
        const isSelfStudy = (score === -1);

        if (isSelfStudy) {
            earnedCredits += credit;
        } else {
            const valScore = score || 0;
            const isPass = valScore >= 60;

            totalScore += valScore * credit;
            totalCreditsForGpa += credit;
            
            if (isPass) earnedCredits += credit;
            else failedCount++;
        }
    });

    const avg = totalCreditsForGpa > 0 ? (totalScore / totalCreditsForGpa).toFixed(1) : "0.0";
    const elGpa = document.getElementById('dash-gpa');
    const elCredits = document.getElementById('dash-credits');
    const elFailed = document.getElementById('dash-failed');

    if (elGpa) elGpa.innerText = avg;
    if (elCredits) elCredits.innerText = earnedCredits;
    if (elFailed) elFailed.innerText = failedCount;
}

// 渲染學分設定介面 (包含學校資訊與可編輯的模組列表)
function renderCreditSettings() {
    const displayEl = document.getElementById('school-info-display');
    if (displayEl) {
        if (userSchoolInfo.school || userSchoolInfo.department) {
            displayEl.innerHTML = `🏫 ${userSchoolInfo.school} ${userSchoolInfo.department}`;
        } else {
            displayEl.innerHTML = `(尚未設定學校科系)`;
        }
    }
    
    const gradInput = document.getElementById('edit-grad-target');
    const textGradTarget = document.getElementById('text-grad-target');

    if (gradInput) gradInput.value = graduationTarget;
    if (textGradTarget) textGradTarget.innerText = graduationTarget;

    const editUni = document.getElementById('edit-settings-uni');
    if (!editUni) return;

    let editHtml = '';
    const categories = Object.keys(categoryTargets);

    if (categories.length === 0) {
        editHtml = '<div style="color:#999; text-align:center; padding:10px;">目前沒有任何模組，請由下方新增。</div>';
    } else {
        categories.forEach(cat => {
            const target = categoryTargets[cat];
            editHtml += `
            <div style="margin-top: 10px; background:#fafafa; padding:12px; border-radius:6px; border:1px solid #eee;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                    <span style="font-weight:bold; color:#333;">${cat}</span>
                    <button onclick="deleteCategory('${cat}')" style="background:#ffebee; color:#c62828; border:none; border-radius:4px; cursor:pointer; font-size:0.8rem; padding:4px 10px;">🗑️ 刪除</button>
                </div>
                <div style="display: flex; gap: 10px;">`;
            
            if (typeof target === 'object') {
                editHtml += `
                    <div style="flex: 1;"><span style="font-size: 0.8rem; color:#666;">必修</span><input type="number" id="edit-cat-${cat}-req" value="${target['必修']||0}" style="width: 100%; padding: 6px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box;"></div>
                    <div style="flex: 1;"><span style="font-size: 0.8rem; color:#666;">選修</span><input type="number" id="edit-cat-${cat}-ele" value="${target['選修']||0}" style="width: 100%; padding: 6px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box;"></div>`;
            } else {
                editHtml += `<div style="flex: 1;"><span style="font-size: 0.8rem; color:#666;">目標學分</span><input type="number" id="edit-cat-${cat}-total" value="${target||0}" style="width: 100%; padding: 6px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box;"></div>`;
            }
            editHtml += `</div></div>`;
        });
    }
    editUni.innerHTML = editHtml;
}

// 切換學分標準的「檢視/編輯」模式，並加入防呆確認視窗
function toggleCreditEdit() {
    const viewDiv = document.getElementById('credits-view-mode');
    const editDiv = document.getElementById('credits-edit-mode');
    const btn = document.getElementById('btn-edit-credits');
    
    if (editDiv.style.display === 'block') {
        viewDiv.style.display = 'block';
        editDiv.style.display = 'none';
        btn.style.display = 'block';
        renderAnalysis();
    } 
    else {
        showConfirm("您確定要進入「學分標準設定」模式嗎？\n\n在此模式下，您可以修改畢業門檻、新增或刪除學分模組。", "⚙️ 進入設定")
        .then(ok => {
            if (ok) {
                viewDiv.style.display = 'none';
                editDiv.style.display = 'block';
                btn.style.display = 'none';
                renderCreditSettings();
            }
        });
    }
}

// 新增自訂學分分類邏輯 (並選擇是否細分必選修)
window.addNewCategory = function() {
    showPrompt("請輸入新模組名稱\n(例如: 共同必修、通識、專業選修)", "", "➕ 新增學分模組")
    .then(name => {
        if (name === null) return;
        
        name = name.trim();
        if (!name) { 
            showAlert("請輸入分類名稱！", "錯誤"); 
            return; 
        }
        if (categoryTargets[name]) { 
            showAlert("這個分類已經存在囉！", "錯誤"); 
            return; 
        }

        showConfirm(`模組「${name}」是否需要細分「必修」與「選修」？\n\n・點【確定】：分為必修/選修兩個目標\n・點【取消】：只設定單一總學分`, "⚙️ 設定計算方式")
        .then(isComplex => {
            if (isComplex) {
                categoryTargets[name] = { "必修": 0, "選修": 0 };
            } else {
                categoryTargets[name] = 0;
            }
            saveData();
            renderCreditSettings();
            showAlert(`已成功新增「${name}」模組！`, "新增成功");
        });
    });
}

// 刪除指定的學分分類邏輯
window.deleteCategory = function(name) {
    showConfirm(`您確定要刪除「${name}」這個模組嗎？\n\n⚠️ 注意：\n刪除後，原本屬於此分類的成績將會被自動歸類到「其他」，且此操作無法復原。`, "🗑️ 刪除確認")
    .then(ok => {
        if (ok) {
            delete categoryTargets[name];
            saveData(); 
            renderCreditSettings(); 
            showAlert(`模組「${name}」已刪除`, "已刪除");
        }
    });
}

// 將編輯後的學分標準設定寫入資料並存檔
function saveCreditSettings() {
    const gradInput = document.getElementById('edit-grad-target');
    if (gradInput) graduationTarget = parseInt(gradInput.value) || 128;

    const categories = Object.keys(categoryTargets);
    categories.forEach(cat => {
        const target = categoryTargets[cat];
        if (typeof target === 'object') {
            const req = document.getElementById(`edit-cat-${cat}-req`);
            const ele = document.getElementById(`edit-cat-${cat}-ele`);
            if (req && ele) {
                categoryTargets[cat]['必修'] = parseInt(req.value) || 0;
                categoryTargets[cat]['選修'] = parseInt(ele.value) || 0;
            }
        } else {
            const total = document.getElementById(`edit-cat-${cat}-total`);
            if (total) categoryTargets[cat] = parseInt(total.value) || 0;
        }
    });
    
    saveData();
    toggleCreditEdit();
    showAlert("設定已更新！", "成功");
    
    if (typeof updateGradeCategoryOptions === 'function') updateGradeCategoryOptions();
}