// ========================================
// 🐞 デバッグ体験用：わざとエラーを出す版
// ========================================
//
// 【ステップ2】このファイルには「わざとバグ」が入っています。
// 読み込む部分で存在しない変数 notExistData を使っているので、
// ページを開いたり更新すると ReferenceError でスクリプトが止まります。
//
// 【ステップ3】エラーが出たら…
// 1. ブラウザの「検証」→「Console」タブを開く
// 2. 赤い文字で「ReferenceError: notExistData is not defined」を確認する
// 3. 怪しい場所に console.log("ここまで動いてるよ！", raw); を書いて、
//    どこまで実行されてどこで止まったかを絞り込む（これをデバッグという）
//

// ----------------------------------------
// ① 要素の取得（DOM操作）
// ----------------------------------------
var taskForm = document.getElementById('taskForm');
var taskInput = document.getElementById('taskInput');
var taskList = document.getElementById('taskList');
var emptyMessage = document.getElementById('emptyMessage');

var STORAGE_KEY = 'taskAppTasks';

function showToast(message) {
  var toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  document.body.appendChild(toast);
  requestAnimationFrame(function () {
    toast.classList.add('is-visible');
  });
  setTimeout(function () {
    toast.classList.remove('is-visible');
    setTimeout(function () {
      toast.remove();
    }, 300);
  }, 2500);
}

function playCompleteSound() {
  try {
    var audioContext = new (window.AudioContext || window.webkitAudioContext)();
    var playTone = function (freq, startTime, duration) {
      var osc = audioContext.createOscillator();
      var gain = audioContext.createGain();
      osc.connect(gain);
      gain.connect(audioContext.destination);
      osc.frequency.value = freq;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.15, startTime);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
      osc.start(startTime);
      osc.stop(startTime + duration);
    };
    playTone(523.25, 0, 0.12);
    playTone(659.25, 0.1, 0.2);
  } catch (e) {}
}

function playConfetti() {
  var colors = ['#22c55e', '#fbbf24', '#fff', '#86efac', '#fde047'];
  var container = document.createElement('div');
  container.className = 'confetti-container';
  container.setAttribute('aria-hidden', 'true');
  for (var i = 0; i < 28; i++) {
    var piece = document.createElement('div');
    piece.className = 'confetti-piece';
    piece.style.left = Math.random() * 100 + 'vw';
    piece.style.top = '-16px';
    piece.style.animationDelay = Math.random() * 0.8 + 's';
    piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    piece.style.transform = 'rotate(' + (Math.random() * 360) + 'deg)';
    container.appendChild(piece);
  }
  document.body.appendChild(container);
  setTimeout(function () {
    container.remove();
  }, 3200);
}

function playSparkles(element) {
  var rect = element.getBoundingClientRect();
  var centerX = rect.left + rect.width / 2;
  var centerY = rect.top + rect.height / 2;
  var positions = [
    { x: -35, y: -8 }, { x: 35, y: -8 }, { x: -25, y: 5 }, { x: 25, y: 5 },
    { x: -40, y: 2 }, { x: 40, y: 2 }, { x: 0, y: -15 }
  ];
  for (var i = 0; i < positions.length; i++) {
    var sp = document.createElement('span');
    sp.className = 'sparkle';
    sp.style.left = (centerX + positions[i].x) + 'px';
    sp.style.top = (centerY + positions[i].y) + 'px';
    sp.style.animationDelay = (i * 0.04) + 's';
    sp.textContent = '★';
    document.body.appendChild(sp);
    setTimeout(function (el) {
      return function () { el.remove(); };
    }(sp), 700);
  }
}

// ----------------------------------------
// LocalStorage: 保存と読み込み
// ----------------------------------------
function saveTasksToStorage() {
  var items = taskList.querySelectorAll('.task-list__item');
  var tasks = [];
  for (var i = 0; i < items.length; i++) {
    var textEl = items[i].querySelector('.task-list__text');
    tasks.push({
      text: textEl ? textEl.textContent : '',
      completed: items[i].classList.contains('is-completed')
    });
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function loadTasksFromStorage() {
  var raw = localStorage.getItem(STORAGE_KEY);
  // ステップ3: 必ず「ここまで動いてるよ！」が出るように、早期 return の前にログを置いている
  console.log("ここまで動いてるよ！", raw);
  if (raw == null) return [];
  // 【わざとバグ】存在しない変数 notExistData を使っている → ReferenceError が出る
  // （データが1件以上あるときだけここを通る。何もないときは上で return するのでエラーは出ない）
  return JSON.parse(notExistData);
}

function createTaskElementForLoad(taskData) {
  var text = taskData.text;
  var completed = !!taskData.completed;
  var newItem = document.createElement('li');
  newItem.className = 'task-list__item';
  if (completed) newItem.classList.add('is-completed');
  var label = document.createElement('label');
  label.className = 'task-list__complete';
  var checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.className = 'task-list__checkbox';
  checkbox.checked = completed;
  var textSpan = document.createElement('span');
  textSpan.className = 'task-list__text';
  textSpan.textContent = text;
  label.appendChild(checkbox);
  label.appendChild(textSpan);
  checkbox.addEventListener('change', function () {
    newItem.classList.toggle('is-completed', checkbox.checked);
    if (checkbox.checked) {
      playCompleteSound();
      try { playConfetti(); } catch (e) {}
      try { playSparkles(newItem); } catch (e) {}
      showToast('おつかれさま！');
      newItem.classList.add('is-just-completed');
      setTimeout(function () {
        newItem.classList.remove('is-just-completed');
      }, 450);
    }
    saveTasksToStorage();
  });
  var deleteBtn = document.createElement('button');
  deleteBtn.type = 'button';
  deleteBtn.className = 'task-list__delete';
  deleteBtn.setAttribute('aria-label', '削除');
  deleteBtn.textContent = '×';
  deleteBtn.addEventListener('click', function () {
    newItem.remove();
    var items = taskList.querySelectorAll('.task-list__item');
    if (items.length === 0) emptyMessage.style.display = '';
    saveTasksToStorage();
  });
  newItem.appendChild(label);
  newItem.appendChild(deleteBtn);
  return newItem;
}

// ここで loadTasksFromStorage() が呼ばれ、中で notExistData を参照してエラーになる
var loadedTasks = loadTasksFromStorage();
for (var i = 0; i < loadedTasks.length; i++) {
  taskList.appendChild(createTaskElementForLoad(loadedTasks[i]));
}
if (loadedTasks.length > 0) emptyMessage.style.display = 'none';

taskForm.addEventListener('submit', function (event) {
  event.preventDefault();
  var text = taskInput.value.trim();
  if (text === '') return;

  var newItem = document.createElement('li');
  newItem.className = 'task-list__item';
  var label = document.createElement('label');
  label.className = 'task-list__complete';
  var checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.className = 'task-list__checkbox';
  var textSpan = document.createElement('span');
  textSpan.className = 'task-list__text';
  textSpan.textContent = text;
  label.appendChild(checkbox);
  label.appendChild(textSpan);

  checkbox.addEventListener('change', function () {
    newItem.classList.toggle('is-completed', checkbox.checked);
    if (checkbox.checked) {
      playCompleteSound();
      try { playConfetti(); } catch (e) {}
      try { playSparkles(newItem); } catch (e) {}
      showToast('おつかれさま！');
      newItem.classList.add('is-just-completed');
      setTimeout(function () {
        newItem.classList.remove('is-just-completed');
      }, 450);
    }
    saveTasksToStorage();
  });

  var deleteBtn = document.createElement('button');
  deleteBtn.type = 'button';
  deleteBtn.className = 'task-list__delete';
  deleteBtn.setAttribute('aria-label', '削除');
  deleteBtn.textContent = '×';
  deleteBtn.addEventListener('click', function () {
    newItem.remove();
    var items = taskList.querySelectorAll('.task-list__item');
    if (items.length === 0) emptyMessage.style.display = '';
    saveTasksToStorage();
  });

  newItem.appendChild(label);
  newItem.appendChild(deleteBtn);
  taskList.appendChild(newItem);
  emptyMessage.style.display = 'none';
  taskInput.value = '';
  saveTasksToStorage();
});
