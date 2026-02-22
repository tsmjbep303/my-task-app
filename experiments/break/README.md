# 1要素だけ抜く実験

本番の `app.js` から**重要な処理を1つだけコメントアウトした**バージョンです。  
どのHTMLを開くとどんな動きになるか試して、その処理の役割を確認できます。

| 開くファイル | 抜いているもの | 観察できること |
|-------------|----------------|----------------|
| **no-append.html** | `taskList.appendChild(newItem)` | 追加ボタンを押してもリストに1行も増えない |
| **no-remove.html** | `newItem.remove()` | 削除ボタンを押してもタスクが消えない |
| **no-toggle.html** | チェックの `classList.toggle` | 完了チェックを付けても打ち消し線・薄くならない |
| **no-preventDefault.html** | `event.preventDefault()` | 追加ボタンでページが再読み込みされ、タスクが残らない |
| **no-clear-input.html** | `taskInput.value = ''` | 追加しても入力欄が空にならない |
| **no-hide-empty.html** | `emptyMessage.style.display = 'none'` | タスクを追加しても「タスクがありません」が隠れない |
| **no-show-empty.html** | 0件になったときの再表示処理 | 最後の1件を削除しても「タスクがありません」が戻らない |
| **no-empty-check.html** | `if (text === '') return` | 何も入力せずに追加すると空の行が追加される |
| **no-localstorage.html** | LocalStorage の保存・読み込み | 再読み込みするとタスクが全部消える（保存も復元もしない） |
| **debug-error.html** | わざとバグ（存在しない変数 `notExistData`） | ページを開くと ReferenceError で止まる。Console でエラーを確認し、`console.log` でデバッグを体験する用 |

対応するJSは `js/app-no-○○.js` または `js/app-debug-error.js`。抜いている処理はコメントアウトで残してあるので、コード上で「どの行が効いていたか」がわかります。
