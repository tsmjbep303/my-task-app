// 【実験】抜いているもの: checkbox の addEventListener('change', ...) と classList.toggle
// 観察: チェックボックスを付けても外しても、文字の打ち消し線・薄くする見た目が変わらない

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
  // 【実験で抜いている】↓ このブロックがあるとチェックで打ち消し線・薄くなる。コメントアウトなので変化しない
  // checkbox.addEventListener('change', function () {
  //   newItem.classList.toggle('is-completed', checkbox.checked);
  // });
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
  taskInput.value = '';
});
