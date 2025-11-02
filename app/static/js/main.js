import { renderMembers, renderCalendar } from './view.js';

function getRandomColor() {
  const colors = [
    "#2196f3", "#4caf50", "#ff9800", "#9c27b0", "#e91e63",
    "#00bcd4", "#8bc34a", "#ffc107", "#3f51b5", "#795548"
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

function getColorByStatus(status) {
  switch (status) {
    case "inroom": return "#4caf50";   // 緑：在室
    case "away": return "#ff9800";     // オレンジ：離席
    case "incollege": return "#ff3b3bff"; // 赤：学内
    case "outside": return "#9e9e9e";  // グレー：不在
    default: return "#2196f3";         // 青：未設定など
  }
}

var hours = [];
for (var i = 0; i < 15; i++) {
    hours.push(9 + i);
}

let members = [];

var events = [
    { id: 1, memberId: 1, hour: 10, duration: 2, text: 'ゼミ発表準備' },
    { id: 2, memberId: 2, hour: 14, duration: 1, text: '実験' },
    { id: 3, memberId: 4, hour: 16, duration: 1, text: 'ミーティング' },
    { id: 4, memberId: 3, hour: 13, duration: 3, text: '論文執筆' }
];

async function loadMembers() {
  try {
    const res = await fetch("/get_all_accounts");
    const data = await res.json();
    console.log("DBから取得:", data);

    members = data.map(acc => ({
      id: acc.id,
      name: acc.username,
      status: acc.status,
      color: acc.color
    }));

    renderMembers(members);
  } catch (err) {
    console.error("メンバー読み込みエラー:", err);
  }
}

async function loadSchedules() {
  try {
    const res = await fetch("/get_all_schedules");
    const data = await res.json();
    console.log("DBからスケジュール取得:", data);

    events = data.map(e => ({
      id: e.id,
      memberId: e.account_id,
      hour: new Date(e.start_time).getHours(),
      duration: (new Date(e.end_time) - new Date(e.start_time)) / 3600000,
      text: e.description
    }));

    renderCalendar(members, hours, events);
  } catch (err) {
    console.error("スケジュール読み込みエラー:", err);
  }
}

// ページ読み込み時に実行
(async () => {
  await loadMembers();
  await loadSchedules();
})();

var locked = false;
var airconOn = false;
var lightOn = true;

async function toggleStatus(id) {
  const member = members.find(m => m.id === id);
  if (!member) return;

  const statuses = ['inroom', 'away', 'incollege', 'outside'];
  const currentIndex = statuses.indexOf(member.status);
  member.status = statuses[(currentIndex + 1) % 4];

  renderMembers(members);

  // サーバー更新
  try {
    await fetch("/update_status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: member.name, status: member.status })
    });
  } catch (err) {
    console.error("ステータス更新失敗:", err);
  }
}

async function addEvent(memberId, hour) {
    var text = prompt('予定内容を入力してください:');
    if (!text) return;

    const member = members.find(m => m.id === memberId);
    if (!member) return;

    // 予定の時間帯を作成
    const start = new Date();
    start.setHours(hour, 0, 0);
    const end = new Date();
    end.setHours(hour + 1, 0, 0);

    try {
        const res = await fetch("/add_schedule", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                username: member.name,
                start_time: start.toISOString(),
                end_time: end.toISOString(),
                description: text
            })
        });

        const data = await res.json();
        if (res.ok) {
            console.log("✅ サーバに登録:", data);
            events.push({
                id: data.id,
                memberId,
                hour,
                duration: 1,
                text
            });
            renderCalendar(members, hours, events);
        } else {
            alert("❌ エラー: " + data.error);
        }
    } catch (err) {
        alert("⚠ 通信エラー: " + err.message);
    }
}

async function deleteEvent(e, id) {
    e.stopPropagation();

    if (!confirm('この予定を削除しますか？')) return;

    try {
        events = events.filter(ev => ev.id !== id);
        renderCalendar(members, hours, events);

        const res = await fetch(`/delete_schedule/${id}`, { method: "DELETE" });
        const data = await res.json();

        if (res.ok) {
            console.log("✅ サーバーから削除:", data);
        } else {
            console.error("❌ サーバー削除エラー:", data.error);
        }
    } catch (err) {
        console.error("⚠ 通信エラー:", err);
        alert("通信エラーが発生しました");
    }
}

document.getElementById('lockBtn').addEventListener('click', function() {
    locked = !locked;
    this.className = 'control-btn lock-btn ' + (locked ? 'locked' : 'unlocked');
});

document.getElementById('airconBtn').addEventListener('click', function() {
    airconOn = !airconOn;
    this.className = 'control-btn aircon-btn ' + (airconOn ? 'on' : 'off');
});

document.getElementById('lightBtn').addEventListener('click', function() {
    lightOn = !lightOn;
    this.className = 'control-btn light-btn ' + (lightOn ? 'on' : 'off');
});

/* ============================================
   モーダル制御
   ============================================ */

const modal = document.getElementById('iotModal');
const modalTriggerBtn = document.getElementById('modalTriggerBtn');
const modalCloseBtn = document.getElementById('modalCloseBtn');

// モーダルを開く
modalTriggerBtn.addEventListener('click', () => {
    modal.classList.add('active');
});

// モーダルを閉じる
modalCloseBtn.addEventListener('click', () => {
    modal.classList.remove('active');
});

// モーダルの背景をクリックして閉じる
modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.classList.remove('active');
    }
});

// モーダル内のボタンのイベントリスナー
document.getElementById('lockBtnModal').addEventListener('click', function() {
    locked = !locked;
    this.className = 'control-btn lock-btn ' + (locked ? 'locked' : 'unlocked') + ' modal-btn';
    document.getElementById('lockBtn').className = 'control-btn lock-btn ' + (locked ? 'locked' : 'unlocked') + ' hidden';
});

document.getElementById('lightBtnModal').addEventListener('click', function() {
    lightOn = !lightOn;
    this.className = 'control-btn light-btn ' + (lightOn ? 'on' : 'off') + ' modal-btn';
    document.getElementById('lightBtn').className = 'control-btn light-btn ' + (lightOn ? 'on' : 'off') + ' hidden';
});

document.getElementById('airconBtnModal').addEventListener('click', function() {
    airconOn = !airconOn;
    this.className = 'control-btn aircon-btn ' + (airconOn ? 'on' : 'off') + ' modal-btn';
    document.getElementById('airconBtn').className = 'control-btn aircon-btn ' + (airconOn ? 'on' : 'off') + ' hidden';
});

/* ============================================
   メンバー・カレンダー列の同期（ホバーハイライト）
   ============================================ */

function attachMemberHoverListeners() {
    document.querySelectorAll('.member').forEach(member => {
        const memberId = member.dataset.memberId;
        
        member.addEventListener('mouseenter', () => {
            const column = document.querySelector(`.member-column[data-member-id="${memberId}"]`);
            if (column) column.classList.add('highlight');
        });
        
        member.addEventListener('mouseleave', () => {
            const column = document.querySelector(`.member-column[data-member-id="${memberId}"]`);
            if (column) column.classList.remove('highlight');
        });
    });
}

// 既存のメンバーホバーイベント（後方互換性のため残す）
// 以下のコードは attachMemberHoverListeners() に統合されます
/*
document.querySelectorAll('.member').forEach(member => {
    const memberId = member.dataset.memberId;
    
    member.addEventListener('mouseenter', () => {
        const column = document.querySelector(`.member-column[data-member-id="${memberId}"]`);
        if (column) column.classList.add('highlight');
    });
    
    member.addEventListener('mouseleave', () => {
        const column = document.querySelector(`.member-column[data-member-id="${memberId}"]`);
        if (column) column.classList.remove('highlight');
    });
});
*/

// windowオブジェクトは全ての要素の親要素です
window.toggleStatus = toggleStatus;
window.addEvent = addEvent;
window.deleteEvent = deleteEvent;

// Dateは後々、Python側から取得するようにする予定
var now = new Date();
var currentHour = now.getHours();
if (currentHour >= 9) {
    var scrollPosition = ((currentHour - 9) * 60) - 100;
    document.getElementById('calendarContainer').scrollTop = Math.max(0, scrollPosition);
}

window.addEventListener("DOMContentLoaded", () => {
    document.getElementById('createAccountBtn').addEventListener('click', async () => {
        const username = prompt("新しいユーザー名を入力してください:");
        const email = prompt("メールアドレスを入力してください:");

        if (!username || !email) {
            alert("ユーザー名とメールアドレスは必須です。");
            return;
        }

        const color = getRandomColor();

        try {
            const res = await fetch("/create_account", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, email })
            });

            const data = await res.json();

            if (res.ok) {
                alert("✅ アカウントを作成しました: " + username);
                members.push({ id: Date.now(), name: username, status: "in", color: color });
                renderMembers(members);
                attachMemberHoverListeners();  // ← 追加：新規メンバー追加時にリスナーを再接続
            } else {
                alert("❌ エラー: " + (data.error || "不明なエラー"));
            }
        } catch (err) {
            alert("⚠ 通信エラー: " + err.message);
        }
    });
});