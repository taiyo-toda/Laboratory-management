"""
ダミーデータをデータベースに追加するスクリプト
"""
from app import app, db
from app.models import Account, Schedule
from datetime import datetime, timedelta
import random

def add_dummy_data():
    with app.app_context():
        # 既存データをクリア（オプション - コメントアウトして保持することもできます）
        # db.session.query(Schedule).delete()
        # db.session.query(Account).delete()
        # db.session.commit()
        
        # カラーパレット
        colors = [
            "#2196f3", "#4caf50", "#ff9800", "#9c27b0", "#e91e63",
            "#00bcd4", "#8bc34a", "#ffc107", "#3f51b5", "#795548"
        ]
        
        # ステータス
        statuses = ["inroom", "away", "incollege", "outside"]
        
        # ダミーアカウントの作成
        print("👥 ダミーアカウントを作成中...")
        accounts = []
        usernames = ["田中太郎", "鈴木花子", "佐藤次郎", "高橋美咲", "伊藤健一"]
        
        for i, username in enumerate(usernames):
            # 既に存在するかチェック
            existing = Account.query.filter_by(username=username).first()
            if not existing:
                acc = Account(
                    username=username,
                    email=f"user{i+1}@example.com",
                    status=random.choice(statuses),
                    color=colors[i % len(colors)]
                )
                db.session.add(acc)
                accounts.append(acc)
                print(f"  ✅ {username} (ID: {i+1}) - {acc.color}")
            else:
                print(f"  ⚠️ {username} はすでに存在します")
                accounts.append(existing)
        
        db.session.commit()
        print(f"✅ {len(accounts)}件のアカウントを作成しました\n")
        
        # ダミースケジュールの作成
        print("📅 ダミースケジュールを作成中...")
        now = datetime.now()
        today = now.replace(hour=0, minute=0, second=0, microsecond=0)
        
        schedule_templates = [
            {"name": "ゼミ発表準備", "hour": 10, "duration": 2},
            {"name": "実験", "hour": 14, "duration": 1},
            {"name": "ミーティング", "hour": 16, "duration": 1},
            {"name": "論文執筆", "hour": 13, "duration": 3},
            {"name": "データ分析", "hour": 11, "duration": 2},
            {"name": "プレゼン資料作成", "hour": 15, "duration": 1},
            {"name": "デバッグ作業", "hour": 9, "duration": 2},
            {"name": "レビュー", "hour": 17, "duration": 1},
        ]
        
        schedule_count = 0
        for acc in accounts:
            # 各アカウントに2-3個のスケジュールを作成
            num_schedules = random.randint(2, 3)
            for _ in range(num_schedules):
                template = random.choice(schedule_templates)
                
                start_time = today + timedelta(hours=template["hour"])
                end_time = start_time + timedelta(hours=template["duration"])
                
                # 既存のスケジュールと重複しないかチェック
                existing_schedule = Schedule.query.filter(
                    Schedule.account_id == acc.id,
                    Schedule.start_time == start_time
                ).first()
                
                if not existing_schedule:
                    schedule = Schedule(
                        account_id=acc.id,
                        start_time=start_time,
                        end_time=end_time,
                        description=template["name"]
                    )
                    db.session.add(schedule)
                    schedule_count += 1
                    print(f"  ✅ {acc.username}: {template['name']} ({template['hour']}:00-{template['hour']+template['duration']}:00)")
        
        db.session.commit()
        print(f"✅ {schedule_count}件のスケジュールを作成しました\n")
        
        # 確認表示
        print("=" * 50)
        print("📊 データベースの内容:")
        print("=" * 50)
        
        all_accounts = Account.query.all()
        print(f"\n👥 アカウント数: {len(all_accounts)}")
        for acc in all_accounts:
            print(f"  - {acc.username} (状態: {acc.status}, 色: {acc.color})")
        
        all_schedules = Schedule.query.all()
        print(f"\n📅 スケジュール数: {len(all_schedules)}")
        for sched in all_schedules:
            acc = Account.query.get(sched.account_id)
            print(f"  - {acc.username}: {sched.description} ({sched.start_time.strftime('%H:%M')} - {sched.end_time.strftime('%H:%M')})")
        
        print("\n✅ ダミーデータの追加が完了しました！")

if __name__ == "__main__":
    add_dummy_data()
