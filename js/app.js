// ========================================
// タスクアプリ - メインのJavaScript
// ========================================
//
// 【用語】HTMLのタグの意味（コードを読む前に知っておくとよい）
//   ul … 「リストの入れ物」。li … 「リストの1項目」。このアプリでは「タスク一覧」が ul、「タスク1件」が li。
//

// --- 定数（マジックナンバーを名前付きにすると変更しやすい）---
const STORAGE_KEY = 'taskAppTasks';
const TOAST_DURATION_MS = 2500;
const CONFETTI_PIECES = 28;
const CONFETTI_REMOVE_MS = 3200;
const SPARKLE_REMOVE_MS = 700;
const JUST_COMPLETED_ANIM_MS = 450;

// タグの選択肢（value → 表示名）
const TAG_OPTIONS = { work: '仕事', private: 'プライベート' };
const DEFAULT_TAG = 'work';

// --- DOM 参照（再代入しないので const）---
const taskForm = document.getElementById('taskForm');
const taskInput = document.getElementById('taskInput');
const taskTag = document.getElementById('taskTag');
const taskFolders = document.getElementById('taskFolders');
const emptyMessage = document.getElementById('emptyMessage');
const taskListWork = document.getElementById('taskListWork');
const taskListPrivate = document.getElementById('taskListPrivate');
const taskListCompleted = document.getElementById('taskListCompleted');
const sidebar = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebarOverlay');
const sidebarToggle = document.getElementById('sidebarToggle');

const TASK_LISTS = { work: taskListWork, private: taskListPrivate };
function getListByTag(tag) {
  return TASK_LISTS[tag] || TASK_LISTS[DEFAULT_TAG];
}
function isCompletedList(list) {
  return list === taskListCompleted;
}

// サイドバー: 表示中のフォルダ（work / private / completed）
let activeTab = 'work';
const TAB_LABELS = { all: '全部', work: '仕事', private: 'プライベート', completed: '完了したタスク' };

function switchTab(tab) {
  if (activeTab === tab) return;
  activeTab = tab;
  document.querySelectorAll('.sidebar__tab').forEach((btn) => {
    const isActive = btn.dataset.tab === tab;
    btn.classList.toggle('is-active', isActive);
    btn.setAttribute('aria-current', isActive ? 'page' : null);
  });
  const showAll = tab === 'all';
  document.querySelectorAll('.task-folder--panel').forEach((folder) => {
    folder.classList.toggle('is-active', showAll || folder.dataset.tag === tab);
  });
  const sectionTitle = document.getElementById('taskListSectionTitle');
  if (sectionTitle) sectionTitle.textContent = TAB_LABELS[tab];
  updateEmptyMessage();
  if (window.matchMedia('(max-width: 768px)').matches) closeSidebar();
}

function openSidebar() {
  if (!sidebar || !sidebarOverlay || !sidebarToggle) return;
  sidebar.classList.add('is-open');
  sidebarOverlay.classList.add('is-visible');
  sidebarOverlay.setAttribute('aria-hidden', 'false');
  sidebarToggle.setAttribute('aria-expanded', 'true');
  sidebarToggle.setAttribute('aria-label', 'メニューを閉じる');
  document.body.classList.add('sidebar-open');
}
function closeSidebar() {
  if (!sidebar || !sidebarOverlay || !sidebarToggle) return;
  sidebar.classList.remove('is-open');
  sidebarOverlay.classList.remove('is-visible');
  sidebarOverlay.setAttribute('aria-hidden', 'true');
  sidebarToggle.setAttribute('aria-expanded', 'false');
  sidebarToggle.setAttribute('aria-label', 'メニューを開く');
  document.body.classList.remove('sidebar-open');
}
function toggleSidebar() {
  if (sidebar && sidebar.classList.contains('is-open')) closeSidebar();
  else openSidebar();
}

// 並び替え用: ドラッグ中の要素を保持（同じフォルダ内でのみドロップ許可）
let draggedTaskItem = null;

// 完了時のお祝いトースト（数秒で消える）
function showToast(message) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  document.body.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('is-visible'));
  setTimeout(() => {
    toast.classList.remove('is-visible');
    setTimeout(() => toast.remove(), 300);
  }, TOAST_DURATION_MS);
}

// 完了時の短い効果音（Web Audio API、外部ファイル不要）
function playCompleteSound() {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioContextClass();
    const playTone = (freq, startTime, duration) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.15, startTime);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
      osc.start(startTime);
      osc.stop(startTime + duration);
    };
    playTone(523.25, 0, 0.12);
    playTone(659.25, 0.1, 0.2);
  } catch (_) {}
}

// 完了時: 紙吹雪
function playConfetti() {
  const colors = ['#22c55e', '#fbbf24', '#fff', '#86efac', '#fde047'];
  const container = document.createElement('div');
  container.className = 'confetti-container';
  container.setAttribute('aria-hidden', 'true');
  for (let i = 0; i < CONFETTI_PIECES; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    piece.style.left = `${Math.random() * 100}vw`;
    piece.style.top = '-16px';
    piece.style.animationDelay = `${Math.random() * 0.8}s`;
    piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    piece.style.transform = `rotate(${Math.random() * 360}deg)`;
    container.appendChild(piece);
  }
  document.body.appendChild(container);
  setTimeout(() => container.remove(), CONFETTI_REMOVE_MS);
}

// 完了時: その行のまわりにキラキラ
function playSparkles(element) {
  const rect = element.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  const positions = [
    { x: -35, y: -8 }, { x: 35, y: -8 }, { x: -25, y: 5 }, { x: 25, y: 5 },
    { x: -40, y: 2 }, { x: 40, y: 2 }, { x: 0, y: -15 }
  ];
  positions.forEach((pos, i) => {
    const sp = document.createElement('span');
    sp.className = 'sparkle';
    sp.style.left = `${centerX + pos.x}px`;
    sp.style.top = `${centerY + pos.y}px`;
    sp.style.animationDelay = `${i * 0.04}s`;
    sp.textContent = '★';
    document.body.appendChild(sp);
    setTimeout(() => sp.remove(), SPARKLE_REMOVE_MS);
  });
}

// 完了時の演出を一括実行（音・紙吹雪・キラキラ・トースト・パルス）
function celebrateCompletion(item) {
  playCompleteSound();
  try { playConfetti(); } catch (_) {}
  try { playSparkles(item); } catch (_) {}
  showToast('おつかれさま！');
  item.classList.add('is-just-completed');
  setTimeout(() => item.classList.remove('is-just-completed'), JUST_COMPLETED_ANIM_MS);
}

// --- LocalStorage: 保存と読み込み ---
function saveTasksToStorage() {
  const tasks = [];
  [taskListWork, taskListPrivate, taskListCompleted].forEach((list) => {
    list.querySelectorAll('.task-list__item').forEach((el) => {
      const textEl = el.querySelector('.task-list__text');
      const tag = el.dataset.tag || DEFAULT_TAG;
      const completed = isCompletedList(list);
      tasks.push({
        text: textEl ? textEl.textContent : '',
        completed,
        tag: TAG_OPTIONS[tag] ? tag : DEFAULT_TAG
      });
    });
  });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function loadTasksFromStorage() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw == null) return [];
  try {
    return JSON.parse(raw);
  } catch (_) {
    return [];
  }
}

// 「タスクがありません」は表示中のフォルダが空のとき。フォルダエリアは常に表示
function updateEmptyMessage() {
  const activeCount = taskListWork.children.length + taskListPrivate.children.length;
  const totalCount = activeCount + taskListCompleted.children.length;
  const isEmpty = activeTab === 'all'
    ? totalCount === 0
    : (activeTab === 'work' ? taskListWork : activeTab === 'private' ? taskListPrivate : taskListCompleted).children.length === 0;
  emptyMessage.style.display = isEmpty ? '' : 'none';
  emptyMessage.textContent = activeTab === 'completed'
    ? '完了したタスクはありません。'
    : 'タスクがありません。上から追加してください。';
  taskFolders.style.display = totalCount === 0 ? 'none' : '';
}

// タスク1件の DOM を作り、チェック・削除・並び替えの挙動を付けて返す
function createTaskElement({ text = '', completed = false, tag = DEFAULT_TAG }) {
  const safeTag = TAG_OPTIONS[tag] ? tag : DEFAULT_TAG;
  const item = document.createElement('li');
  item.className = `task-list__item task-list__item--${safeTag}`;
  item.dataset.tag = safeTag;
  item.draggable = true;
  if (completed) item.classList.add('is-completed');

  const dragHandle = document.createElement('span');
  dragHandle.className = 'task-list__drag-handle';
  dragHandle.setAttribute('aria-label', '並び替え');
  dragHandle.textContent = '⋮⋮';

  const tagLabel = document.createElement('span');
  tagLabel.className = 'task-list__tag-label';
  tagLabel.textContent = TAG_OPTIONS[safeTag];
  tagLabel.setAttribute('aria-hidden', 'true');

  const label = document.createElement('label');
  label.className = 'task-list__complete';

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.className = 'task-list__checkbox';
  checkbox.checked = completed;

  const textSpan = document.createElement('span');
  textSpan.className = 'task-list__text';
  textSpan.textContent = text;

  label.append(checkbox, textSpan);

  checkbox.addEventListener('change', () => {
    item.classList.toggle('is-completed', checkbox.checked);
    if (checkbox.checked) {
      celebrateCompletion(item);
      taskListCompleted.appendChild(item);
    } else {
      getListByTag(item.dataset.tag).appendChild(item);
    }
    updateEmptyMessage();
    saveTasksToStorage();
  });

  const deleteBtn = document.createElement('button');
  deleteBtn.type = 'button';
  deleteBtn.className = 'task-list__delete';
  deleteBtn.setAttribute('aria-label', '削除');
  deleteBtn.textContent = '×';
  deleteBtn.addEventListener('click', () => {
    item.remove();
    updateEmptyMessage();
    saveTasksToStorage();
  });

  // 並び替え: 削除ボタン・チェックボックス以外からドラッグで開始
  item.addEventListener('dragstart', (e) => {
    if (e.target.closest('button') || e.target.closest('input')) {
      e.preventDefault();
      return;
    }
    draggedTaskItem = item;
    item.classList.add('is-dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', ' '); // 空だとドラッグが始まらないブラウザがある
    try {
      e.dataTransfer.setDragImage(item, 0, 0);
    } catch (_) {}
  });
  item.addEventListener('dragend', () => {
    item.classList.remove('is-dragging');
    draggedTaskItem = null;
    document.querySelectorAll('.task-list__item.is-drag-over').forEach((el) => el.classList.remove('is-drag-over'));
  });
  item.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (!draggedTaskItem || draggedTaskItem === item) return;
    if (draggedTaskItem.parentElement !== item.parentElement) return;
    item.classList.add('is-drag-over');
  });
  item.addEventListener('dragleave', (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) item.classList.remove('is-drag-over');
  });
  item.addEventListener('drop', (e) => {
    e.preventDefault();
    e.stopPropagation();
    item.classList.remove('is-drag-over');
    if (!draggedTaskItem || draggedTaskItem === item) return;
    if (draggedTaskItem.parentElement !== item.parentElement) return;
    const list = item.parentElement;
    list.insertBefore(draggedTaskItem, item);
    updateEmptyMessage();
    saveTasksToStorage();
  });

  item.append(dragHandle, tagLabel, label, deleteBtn);
  return item;
}

// 起動時: LocalStorage から復元（未完了はタグ別・完了は完了フォルダへ）
const loadedTasks = loadTasksFromStorage();
loadedTasks.forEach((taskData) => {
  const list = taskData.completed ? taskListCompleted : getListByTag(taskData.tag);
  list.appendChild(createTaskElement(taskData));
});
updateEmptyMessage();

// フォーム送信: 選択したタグのフォルダにタスクを追加
taskForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const text = taskInput.value.trim();
  if (text === '') return;

  const tag = taskTag.value || DEFAULT_TAG;
  const newItem = createTaskElement({ text, completed: false, tag });
  getListByTag(tag).appendChild(newItem);
  taskInput.value = '';
  updateEmptyMessage();
  saveTasksToStorage();
});

// サイドバー: タブクリックで表示フォルダを切り替え
document.querySelectorAll('.sidebar__tab').forEach((btn) => {
  btn.addEventListener('click', () => switchTab(btn.dataset.tab));
});
if (sidebarToggle) sidebarToggle.addEventListener('click', toggleSidebar);
if (sidebarOverlay) sidebarOverlay.addEventListener('click', closeSidebar);
switchTab('work'); // 初期表示の見出し・empty を同期
