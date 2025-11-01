// Dateは後々、Python側から取得するようにする予定です

export function renderMembers(members) {
    var container = document.getElementById('members');
    var html = '';
    for (var i = 0; i < members.length; i++) {
        var m = members[i];
        html += '<div class="member" onclick="toggleStatus(' + m.id + ')">';
        html += '<div class="avatar" style="background: ' + m.color + '">';
        html += m.name[0];
        html += '<div class="status-badge status-' + m.status + '"></div>';
        html += '</div>';
        html += '<div class="member-name">' + m.name + '</div>';
        html += '</div>';
    }
    container.innerHTML = html;
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
            if (e.memberId === m.id) {
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
