const STORAGE_KEY = 'daily-list.tasks.v1';
const categories = ['生活', '工作', '學習', '其他'];
const today = new Date();
const todayISO = [today.getFullYear(), String(today.getMonth() + 1).padStart(2, '0'), String(today.getDate()).padStart(2, '0')].join('-');
const $ = (selector) => document.querySelector(selector);
let tasks = loadTasks();
let activeFilter = 'all';
let activeCategory = '全部';
let toastTimer;

function loadTasks() {
  try { const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); return Array.isArray(value) ? value : []; }
  catch { return []; }
}
function saveTasks() { localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks)); }
function dateLabel(value) {
  if (!value) return '未設定期限';
  const [y, m, d] = value.split('-').map(Number);
  return `${y}年${m}月${d}日`;
}
function dateStatus(task) {
  if (!task.due || task.completed) return '';
  if (task.due < todayISO) return 'overdue';
  if (task.due === todayISO) return 'today';
  return '';
}
function renderCategories() {
  const row = $('#categoryRow');
  row.innerHTML = '';
  ['全部', ...categories].forEach(category => {
    const button = document.createElement('button');
    button.className = `category-chip${activeCategory === category ? ' active' : ''}`;
    button.textContent = category;
    button.addEventListener('click', () => { activeCategory = category; render(); });
    row.append(button);
  });
}
function visibleTasks() {
  return tasks.filter(task => {
    const filterMatch = activeFilter === 'done' ? task.completed
      : activeFilter === 'today' ? !task.completed && task.due === todayISO
      : activeFilter === 'upcoming' ? !task.completed && (!task.due || task.due > todayISO)
      : activeFilter === 'all' ? !task.completed : false;
    return filterMatch && (activeCategory === '全部' || task.category === activeCategory);
  }).sort((a, b) => {
    if (a.completed !== b.completed) return Number(a.completed) - Number(b.completed);
    return (a.due || '9999-99-99').localeCompare(b.due || '9999-99-99') || b.createdAt - a.createdAt;
  });
}
function render() {
  const unfinished = tasks.filter(task => !task.completed);
  const completed = tasks.filter(task => task.completed).length;
  $('#progressText').textContent = unfinished.length ? `已完成 ${completed} / ${tasks.length} 件` : (tasks.length ? '太好了，全部完成！' : '還沒有待辦事項');
  $('#progressBar').style.width = tasks.length ? `${Math.round(completed / tasks.length * 100)}%` : '0%';
  $('#taskCount').textContent = `${visibleTasks().length} 件`;
  $('#listTitle').textContent = ({all:'所有待辦',today:'今天要做',upcoming:'未來安排',done:'已完成'})[activeFilter];
  document.querySelectorAll('.filter').forEach(button => {
    const selected = button.dataset.filter === activeFilter;
    button.classList.toggle('active', selected);
    button.setAttribute('aria-selected', String(selected));
  });
  renderCategories();
  const list = $('#taskList');
  list.innerHTML = '';
  const shown = visibleTasks();
  if (!shown.length) {
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.innerHTML = '<div class="empty-icon" aria-hidden="true">✳</div><p>目前沒有待辦事項</p><small>按下「新增待辦」，記下接下來要做的事。</small>';
    list.append(empty);
    return;
  }
  shown.forEach(task => {
    const card = document.createElement('article');
    card.className = `task-card${task.completed ? ' completed' : ''}`;
    const check = document.createElement('button');
    check.className = 'check-button'; check.setAttribute('aria-label', task.completed ? '標記為未完成' : '標記為已完成');
    check.textContent = task.completed ? '✓' : '';
    check.addEventListener('click', () => toggleTask(task.id));
    const main = document.createElement('div'); main.className = 'task-main';
    const name = document.createElement('p'); name.className = 'task-name'; name.textContent = task.name;
    const meta = document.createElement('div'); meta.className = 'task-meta';
    const category = document.createElement('span'); category.className = 'category-tag'; category.textContent = task.category;
    const due = document.createElement('span'); due.className = `due ${dateStatus(task)}`;
    due.textContent = `${task.due && task.due < todayISO && !task.completed ? '已逾期 · ' : ''}${dateLabel(task.due)}`;
    meta.append(category, due); main.append(name, meta);
    const more = document.createElement('button'); more.className = 'more-button'; more.textContent = '···'; more.setAttribute('aria-label', '編輯待辦');
    more.addEventListener('click', () => openEditor(task));
    card.append(check, main, more); list.append(card);
  });
}
function openEditor(task = null) {
  $('#taskForm').reset();
  $('#taskId').value = task?.id || '';
  $('#taskName').value = task?.name || '';
  $('#taskDue').value = task?.due || '';
  $('#taskCategory').value = task?.category || '生活';
  $('#dialogTitle').textContent = task ? '編輯待辦' : '新增待辦';
  $('#dialogEyebrow').textContent = task ? 'EDIT TASK' : 'NEW TASK';
  $('#saveButton').textContent = task ? '儲存變更' : '儲存待辦';
  $('#deleteButton').hidden = !task;
  $('#taskDialog').showModal();
  $('#taskName').focus();
}
function showToast(message) {
  const toast = $('#toast'); toast.textContent = message; toast.classList.add('show');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove('show'), 1900);
}
function toggleTask(id) {
  const task = tasks.find(item => item.id === id); if (!task) return;
  task.completed = !task.completed; task.updatedAt = Date.now(); saveTasks(); render();
  showToast(task.completed ? '已完成，做得好！' : '已移回待辦');
}
$('#taskForm').addEventListener('submit', event => {
  event.preventDefault();
  const id = $('#taskId').value;
  const existing = tasks.find(item => item.id === id);
  const task = { id: id || (crypto.randomUUID?.() || String(Date.now())), name: $('#taskName').value.trim(), due: $('#taskDue').value, category: $('#taskCategory').value, completed: existing?.completed || false, createdAt: existing?.createdAt || Date.now(), updatedAt: Date.now() };
  if (!task.name) return;
  if (existing) tasks = tasks.map(item => item.id === id ? task : item); else tasks.push(task);
  saveTasks(); $('#taskDialog').close(); render(); showToast(existing ? '已儲存變更' : '已新增待辦');
});
$('#deleteButton').addEventListener('click', () => {
  const id = $('#taskId').value;
  tasks = tasks.filter(item => item.id !== id); saveTasks(); $('#taskDialog').close(); render(); showToast('已刪除待辦');
});
$('#addButton').addEventListener('click', () => openEditor());
$('#closeDialog').addEventListener('click', () => $('#taskDialog').close());
$('#taskDialog').addEventListener('click', event => { if (event.target === $('#taskDialog')) $('#taskDialog').close(); });
document.querySelectorAll('.filter').forEach(button => button.addEventListener('click', () => { activeFilter = button.dataset.filter; render(); }));
$('#todayButton').addEventListener('click', () => { activeFilter = 'all'; activeCategory = '全部'; render(); window.scrollTo({top:0,behavior:'smooth'}); });
const todayDate = new Date();
$('#todayLabel').textContent = `${todayDate.getFullYear()}年${todayDate.getMonth()+1}月${todayDate.getDate()}日 · ${['星期日','星期一','星期二','星期三','星期四','星期五','星期六'][todayDate.getDay()]}`;
render();
