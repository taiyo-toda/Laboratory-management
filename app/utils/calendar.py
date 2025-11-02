import calendar
from datetime import datetime

def get_month_calendar():
    # 今月のカレンダー情報を返す
    now = datetime.now()
    year, month = now.year, now.month
    
    cal = calendar.Calender(firstweekday = 6) #日曜から始まる
    month_days = cal.monthdaycalendar(year, month)
    
    return {
        "year" : year,
        "month" : month,
        "month_days" : month_days
    }

