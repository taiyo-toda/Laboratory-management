import { renderMembers, renderCalendar } from './view.js';

function getRandomColor() {
  const colors = [
    "#2196f3", "#4caf50", "#ff9800", "#9c27b0", "#e91e63",
    "#00bcd4", "#8bc34a", "#ffc107", "#3f51b5", "#795548"
  ];
  return colors[Math.floor(Math.random() * colors.length)];
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
      status: acc.status || "in",
      color: "#2196f3"
    }));

    renderMembers(members);
    renderCalendar(members, hours, events);
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

function toggleStatus(id) {
    for (var i = 0; i < members.length; i++) {
        if (members[i].id === id) {
            var statuses = ['in', 'away', 'out'];
            var currentIndex = statuses.indexOf(members[i].status);
            members[i].status = statuses[(currentIndex + 1) % 3];
            break;
        }
    }
    renderMembers(members);
}

function addEvent(memberId, hour) {
    var text = prompt('予定内容を入力してください:');
    if (text) {
        events.push({
            id: Date.now(),
            memberId: memberId,
            hour: hour,
            duration: 1,
            text: text
        });
        renderCalendar(members, hours, events);
    }
}

function deleteEvent(e, id) {
    e.stopPropagation();
    if (confirm('この予定を削除しますか？')) {
        var newEvents = [];
        for (var i = 0; i < events.length; i++) {
            if (events[i].id !== id) {
                newEvents.push(events[i]);
            }
        }
        events = newEvents;
        renderCalendar(members, hours, events);
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
            } else {
                alert("❌ エラー: " + (data.error || "不明なエラー"));
            }
        } catch (err) {
            alert("⚠ 通信エラー: " + err.message);
        }
    });
});