// ========================================
// タスクアプリ - メインのJavaScript
// ========================================
//
// 【用語】HTMLのタグの意味（コードを読む前に知っておくとよい）
//
//   ul  … 「リストの入れ物」のタグ。中に項目を並べるときに使う。
//   li  … 「リストの1項目」のタグ。ul のなかに li を並べる。
//
//   例：<ul> が「買い物リスト」なら、<li> は「牛乳」「卵」などの1つ1つ。
//   このアプリでは「タスク一覧」が ul、「タスク1件」が li に対応している。
//

// ----------------------------------------
// ① 要素の取得（DOM操作）
// 「この id の部品を、あとで使うために変数に入れておく」という意味です。
// ----------------------------------------
var taskForm = document.getElementById('taskForm');       // フォーム（入力欄＋追加ボタンがセットになったもの）
var taskInput = document.getElementById('taskInput');     // 文字を入力する欄
var taskList = document.getElementById('taskList');      // タスク一覧の「入れ物」（HTMLでは ul）
var emptyMessage = document.getElementById('emptyMessage'); // 「タスクがありません」のメッセージ

var STORAGE_KEY = 'taskAppTasks';

// 完了時のお祝いトーストを表示（数秒で消える）
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

// 完了時の短い効果音（Web Audio API でピロンと鳴らす、外部ファイル不要）
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
    playTone(523.25, 0, 0.12);      // ド
    playTone(659.25, 0.1, 0.2);     // ミ（少し重なって和音っぽく）
  } catch (e) {}
}

// 完了時だけ: 紙吹雪（各ピースを position:fixed で画面に直接出す）
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

// 完了時だけ: その行のまわりにキラキラ
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
// LocalStorage: 保存と読み込み（JSON.stringify で保存・JSON.parse で読み込み）
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
  if (raw == null) return [];
  try {
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
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

var loadedTasks = loadTasksFromStorage();
for (var i = 0; i < loadedTasks.length; i++) {
  taskList.appendChild(createTaskElementForLoad(loadedTasks[i]));
}
if (loadedTasks.length > 0) emptyMessage.style.display = 'none';

// ----------------------------------------
// ② フォーム送信の監視（イベントリスナー）
// 「追加ボタンが押されたら、下の function のなかを実行する」と登録しています。
// ----------------------------------------
taskForm.addEventListener('submit', function (event) {

  // ページが再読み込みされないようにする（送信のデフォルトの動きを止める）
  event.preventDefault();

  // 入力欄に書かれた文字を取る。trim() で前後の空白だけ削る
  var text = taskInput.value.trim();

  // 何も入力されていなかったら、ここで終わり。下には進まない
  if (text === '') {
    return;
  }

  // ----------------------------------------
  // ③ 新しいタスク1件（li）を「部品」として作る（DOM操作）
  // createElement は「新しいタグを1つ作る」という意味です。
  // ----------------------------------------

  // 「リストの1項目」用の li タグを1つ作る
  var newItem = document.createElement('li');
  newItem.className = 'task-list__item';  // デザイン用のクラス名を付ける

  // チェックボックスとタスクの文字を入れる「ラベル」を作る（ラベルをクリックしてもチェックできる）
  var label = document.createElement('label');
  label.className = 'task-list__complete';
  var checkbox = document.createElement('input');
  checkbox.type = 'checkbox';            // チェックボックスにする
  checkbox.className = 'task-list__checkbox';
  var textSpan = document.createElement('span');  // タスクの文字を入れる箱
  textSpan.className = 'task-list__text';
  textSpan.textContent = text;            // 入力された文字を span に入れる
  label.appendChild(checkbox);           // ラベルの中にチェックボックスを入れる
  label.appendChild(textSpan);           // ラベルの中に文字を入れる

  // チェックが付いたり外れたりしたときに、見た目を切り替え＋完了時にお祝い
  checkbox.addEventListener('change', function () {
    newItem.classList.toggle('is-completed', checkbox.checked);
    if (checkbox.checked) {
      playCompleteSound();
      try {
        playConfetti();
      } catch (e) {}
      try {
        playSparkles(newItem);
      } catch (e) {}
      showToast('おつかれさま！');
      newItem.classList.add('is-just-completed');
      setTimeout(function () {
        newItem.classList.remove('is-just-completed');
      }, 450);
    }
    saveTasksToStorage();
  });

  // 「削除」ボタンを作る（×アイコン、ホバーで赤くする）
  var deleteBtn = document.createElement('button');
  deleteBtn.type = 'button';
  deleteBtn.className = 'task-list__delete';
  deleteBtn.setAttribute('aria-label', '削除');
  deleteBtn.textContent = '×';            // 小さな×でゴミ箱の代わりに表示

  // 削除ボタンが押されたら、このタスク（li）を画面から消す（要素の削除 remove）
  deleteBtn.addEventListener('click', function () {
    newItem.remove();                     // この li を DOM から取り除く ＝ 画面上から消える
    // 残っているタスクが0件なら、「タスクがありません」をまた表示する
    var items = taskList.querySelectorAll('.task-list__item');
    if (items.length === 0) {
      emptyMessage.style.display = '';
    }
    saveTasksToStorage();
  });

  // 作った部品を組み立てる：li のなかに「ラベル」と「削除ボタン」を入れる
  newItem.appendChild(label);
  newItem.appendChild(deleteBtn);
  // タスク一覧の入れ物（ul）のなかに、この li を追加する → 画面に1行増える
  taskList.appendChild(newItem);

  // タスクが1件以上あるので「タスクがありません」を隠す
  emptyMessage.style.display = 'none';
  // 入力欄を空にする（次のタスクを書きやすくする）
  taskInput.value = '';

  saveTasksToStorage();
});
