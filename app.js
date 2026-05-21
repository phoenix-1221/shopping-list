firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// フォームとリスト要素を取得
const form = document.getElementById('itemForm');
const itemNameInput = document.getElementById('itemName');
const storeSelect = document.getElementById('store');
const dueDateInput = document.getElementById('dueDate');
const todoList = document.getElementById('todoList');
const doneList = document.getElementById('doneList');
const storeFilter = document.getElementById('storeFilter');

// Firestoreコレクション
const shoppingRef = db.collection('shoppingItems');

let currentFilter = '';
let latestSnapshot = null;

// フィルタ変更
storeFilter.addEventListener('change', function () {
    currentFilter = this.value;

    if (latestSnapshot) {
        renderItems(latestSnapshot);
    }
});

// リアルタイム監視
shoppingRef.orderBy('createdAt').onSnapshot(snapshot => {
    latestSnapshot = snapshot;
    renderItems(snapshot);
});

// 描画関数
function renderItems(snapshot) {

    todoList.innerHTML = '';
    doneList.innerHTML = '';

    snapshot.forEach(doc => {

        const data = doc.data();

        // フィルタ
        if (currentFilter && data.store !== currentFilter) {
            return;
        }

        const li = document.createElement('li');

        let text = data.name;

        if (data.store) {
            text += ` (${data.store})`;
        }

        if (data.dueDate) {
            text += ` [${data.dueDate}]`;
        }

        li.textContent = text;

        // 締切チェック
        if (data.dueDate) {

            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const due = new Date(data.dueDate);
            due.setHours(0, 0, 0, 0);

            const diff =
                (due - today) / (1000 * 60 * 60 * 24);

            if (diff === 0 || diff === 1) {
                li.style.color = 'red';
            }
        }

        // チェックボックス
        const checkbox = document.createElement('input');

        checkbox.type = 'checkbox';
        checkbox.checked = data.purchased;

        checkbox.addEventListener('change', function () {

            shoppingRef.doc(doc.id).update({
                purchased: this.checked
            });

        });

        li.prepend(checkbox);

// 削除ボタン
	const deleteButton = document.createElement('button');

	deleteButton.textContent = '削除';

	deleteButton.addEventListener('click', function () {

    	const result = confirm('この項目を削除しますか？');

    	if (result) {
        	shoppingRef.doc(doc.id).delete();
  	  }

	});

	li.appendChild(deleteButton);

        // 振り分け
        if (data.purchased) {
            doneList.appendChild(li);
        } else {
            todoList.appendChild(li);
        }

    });
}

// フォーム送信
form.addEventListener('submit', function (event) {

    event.preventDefault();

    const name = itemNameInput.value.trim();
    const store = storeSelect.value;
    const dueDate = dueDateInput.value;

    if (!name) {
        return;
    }

    // Firestoreへ追加
    shoppingRef.add({

        name: name,
        store: store,
        dueDate: dueDate,
        purchased: false,
        createdAt:
            firebase.firestore.FieldValue.serverTimestamp()

    });

    // 入力欄リセット
    itemNameInput.value = '';
    storeSelect.value = '';
    dueDateInput.value = '';

});