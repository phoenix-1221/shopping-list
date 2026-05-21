// Firebase 初期化（firebase-config.js に書いてある前提）
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
let currentFilter = '';

storeFilter.addEventListener('change', function() {
    currentFilter = this.value;
    // フィルタ反映のため再描画
    renderItems(latestSnapshot);
});

let latestSnapshot = null; // Firestoreの最新データを保持

shoppingRef.orderBy('createdAt').onSnapshot(snapshot => {
    latestSnapshot = snapshot;
    renderItems(snapshot);
});

function renderItems(snapshot) {
    todoList.innerHTML = '';
    doneList.innerHTML = '';

    snapshot.forEach(doc => {
        const data = doc.data();

        // フィルタチェック
        if (currentFilter && data.store !== currentFilter) return;

        const li = document.createElement('li');
        li.textContent = `${data.name} ${data.store ? '(' + data.store + ')' : ''} ${data.dueDate ? '[' + data.dueDate + ']' : ''}`;

        // 締め切りが今日・明日なら赤
        if (data.dueDate) {
            const today = new Date();
            const due = new Date(data.dueDate);
            const diff = Math.floor((due - today) / (1000*60*60*24));
            if (diff === 0 || diff === 1) li.style.color = 'red';
        }

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = data.purchased;
        checkbox.addEventListener('change', function() {
            shoppingRef.doc(doc.id).update({ purchased: this.checked });
        });

        li.prepend(checkbox);

        if (data.purchased) {
            doneList.appendChild(li);
        } else {
            todoList.appendChild(li);
        }
    });
}


// Firestoreのコレクション参照
const shoppingRef = db.collection('shoppingItems');

// Firestoreのリアルタイム更新
shoppingRef.orderBy('createdAt').onSnapshot(snapshot => {
    // リストを一度クリア
    todoList.innerHTML = '';
    doneList.innerHTML = '';

    snapshot.forEach(doc => {
       snapshot.forEach(doc => {
    const data = doc.data();
    const li = document.createElement('li');
    li.textContent = `${data.name} ${data.store ? '(' + data.store + ')' : ''} ${data.dueDate ? '[' + data.dueDate + ']' : ''}`;

if (data.dueDate) {
        const today = new Date();
        const due = new Date(data.dueDate);
        const diff = Math.floor((due - today) / (1000*60*60*24)); // 日数差

        if (diff === 0 || diff === 1) {
            li.style.color = 'red';
        }
    }

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = data.purchased;

        // チェック変更時にFirestore更新
        checkbox.addEventListener('change', function() {
            shoppingRef.doc(doc.id).update({ purchased: this.checked });
        });

        li.prepend(checkbox);

        if (data.purchased) {
            doneList.appendChild(li);
        } else {
            todoList.appendChild(li);
        }
    });
});

// フォーム送信イベント
form.addEventListener('submit', function(event) {
    event.preventDefault();

    const name = itemNameInput.value.trim();
    const store = storeSelect.value;
    const dueDate = dueDateInput.value;

    if (!name) return;

    // Firestoreに保存
    shoppingRef.add({
        name: name,
        store: store,
        dueDate: dueDate,
        purchased: false,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    // 入力欄リセット
    itemNameInput.value = '';
    storeSelect.value = '';
    dueDateInput.value = '';
});