import { renderMembers, renderCalendar } from './view.js';

var members = [
            { id: 1, name: '田中', status: 'in', color: '#2196f3' },
            { id: 2, name: '佐藤', status: 'away', color: '#4caf50' },
            { id: 3, name: '鈴木', status: 'out', color: '#9c27b0' },
            { id: 4, name: '山田', status: 'in', color: '#ff9800' },
            { id: 5, name: '中村', status: 'out', color: '#e91e63' }
        ];

var events = [
    { id: 1, memberId: 1, hour: 10, duration: 2, text: 'ゼミ発表準備' },
    { id: 2, memberId: 2, hour: 14, duration: 1, text: '実験' },
    { id: 3, memberId: 4, hour: 16, duration: 1, text: 'ミーティング' },
    { id: 4, memberId: 3, hour: 13, duration: 3, text: '論文執筆' }
];

var locked = false;
var airconOn = false;
var lightOn = true;

var hours = [];
for (var i = 0; i < 15; i++) {
    hours.push(9 + i);
}

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
        renderCalendar();
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

// windowオブジェクトは全ての要素の親要素です
window.toggleStatus = toggleStatus;
window.addEvent = addEvent;
window.deleteEvent = deleteEvent;

renderMembers(members);
renderCalendar(members, hours, events);


// Dateは後々、Python側から取得するようにする予定
var now = new Date();
var currentHour = now.getHours();
if (currentHour >= 9) {
    var scrollPosition = ((currentHour - 9) * 60) - 100;
    document.getElementById('calendarContainer').scrollTop = Math.max(0, scrollPosition);
}