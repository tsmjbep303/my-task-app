// 【実験】抜いているもの: taskList.appendChild(newItem)
// 観察: 追加ボタンを押しても、リストに1行も増えない（li は作っているが「入れ物」に追加していない）

var taskForm = document.getElementById('taskForm');
var taskInput = document.getElementById('taskInput');
var taskList = document.getElementById('taskList');
var emptyMessage = document.getElementById('emptyMessage');

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
  });
  var deleteBtn = document.createElement('button');
  deleteBtn.type = 'button';
  deleteBtn.className = 'task-list__delete';
  deleteBtn.textContent = '削除';
  deleteBtn.addEventListener('click', function () {
    newItem.remove();
    var items = taskList.querySelectorAll('.task-list__item');
    if (items.length === 0) emptyMessage.style.display = '';
  });
  newItem.appendChild(label);
  newItem.appendChild(deleteBtn);
  // 【実験で抜いている】↓ この行があると一覧に追加される。コメントアウトなので追加されない
  // taskList.appendChild(newItem);
  // ※ この下の2行は「追加が成功した」前提でいつも実行される。
  //    appendChild を抜いているので「一覧には出ない」が、「タスクがありません」は隠れる。
  emptyMessage.style.display = 'none';
  taskInput.value = '';
});
