// 【実験】抜いているもの: taskInput.value = ''
// 観察: タスクを追加したあと、入力欄が空にならない（前の文字が残ったまま）

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
  taskList.appendChild(newItem);
  emptyMessage.style.display = 'none';
  // 【実験で抜いている】↓ この行があると入力欄が空になる。コメントアウトなので前の文字が残る
  // taskInput.value = '';
});
