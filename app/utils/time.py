from flask import Flask, jsonify
from datetime import datetime

app = Flask(_name_)

def get_current_time():
    now = datetime.now()
    return {
        "hour" : now.hour,
        "minute" : now.minute,
        "time_str":now.strftime("%H:%M:%S")
    }

def line_position():
    # 現在時刻から合計分数を返し、ラインの位置を描 
    now = datetime.now()
    return now.hour * 60 + now.minute

@app.route("/api/time")
def api_time():
    # --- 現在時刻とライン位置をJSONで返すエンドポイント ---
    now = get_current_time()
    position = line_position()
    
    return jsonify({
        "current_time":now["time_str"],
        "hour": now["hour"],
        "minute": now["minute"],
        "line_position": position
    })


if __name__ == "__main__":
    app.run(debug=True)    