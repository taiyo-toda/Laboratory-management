// Dateは後々、Python側から取得するようにする予定です

export function renderMembers(members) {

  const container = document.getElementById("members");
  container.innerHTML = "";

  members.forEach(member => {
    const memberEl = document.createElement("div");
    memberEl.className = "member";
    memberEl.innerHTML = `
      <div class="avatar" style="background:${member.color}">
        ${member.name[0]}
        <div class="status-badge ${getStatusClass(member.status)}"></div>
      </div>
      <div class="member-name">${member.name}</div>
    `;
    memberEl.onclick = () => toggleStatus(member.id);
    container.appendChild(memberEl);
  });
}

function getStatusClass(status) {
  switch (status) {
    case "inroom": return "status-in";
    case "away": return "status-away";
    case "incollege": return "status-incollege";
    case "outside": return "status-outside";
    default: return "status-out";
  }
}

export function renderCalendar(members, hours, events) {
    var calendar = document.getElementById('calendar');
    
    var timeColumn = '<div class="time-column">';
    for (var i = 0; i < hours.length; i++) {
        var h = hours[i];
        timeColumn += '<div class="time-slot">' + h + ':00</div>';
    }
    timeColumn += '</div>';

    var memberColumns = '';
    for (var i = 0; i < members.length; i++) {
        var m = members[i];
        var column = '<div class="member-column" data-member-id="' + m.id + '">';
        
        for (var j = 0; j < hours.length; j++) {
            var h = hours[j];
            column += '<div class="member-slot" onclick="addEvent(' + m.id + ', ' + h + ')"></div>';
        }
        
        for (var k = 0; k < events.length; k++) {
            var e = events[k];
            if (Number(e.memberId) === Number(m.id)) {
                var top = (e.hour - 9) * 60;
                var height = e.duration * 60;
                column += '<div class="event" style="background: ' + m.color + '; top: ' + top + 'px; height: ' + height + 'px;" ';
                column += 'onclick="deleteEvent(event, ' + e.id + ')">';
                column += '<div class="event-text">' + e.text + '</div>';
                column += '<div class="event-time">' + e.hour + ':00-' + (e.hour + e.duration) + ':00</div>';
                column += '</div>';
            }
        }
        
        column += '</div>';
        memberColumns += column;
    }

    calendar.innerHTML = timeColumn + memberColumns;
    
    updateCurrentTimeMarker();
}



function updateCurrentTimeMarker() {
    var now = new Date();
    var currentHour = now.getHours();
    var currentMinute = now.getMinutes();
    
    if (currentHour >= 9 && currentHour < 24) {
        var position = ((currentHour - 9) * 60) + currentMinute;
        var columns = document.getElementsByClassName('member-column');
        for (var i = 0; i < columns.length; i++) {
            var marker = document.createElement('div');
            marker.className = 'current-time-marker';
            marker.style.top = position + 'px';
            columns[i].appendChild(marker);
        }
    }
}

function truncateName(name, maxLength = 20) { // 長い名前を省略する関数
    return name.length > maxLength ? name.substring(0, maxLength - 1) + '…' : name;
}
