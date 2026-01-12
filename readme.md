## :clipboard: **TrackJob-Hackathon プロジェクト全体解説**

---

## **:dart: プロジェクト概要**

このプロジェクトは、**研究室のメンバー管理・予定共有アプリケーション**です。Flaskを使ったバックエンド（Python）と、フロントエンド（HTML/JS/CSS）で構成されています。

---

## **:package: 1. バックエンド構造（Python + Flask）**

### **__init__.py** - Flaskアプリケーション初期化
```
- Flask アプリケーションインスタンスを作成
- SQLAlchemy（データベースORM）を初期化
- SQLiteデータベース "trackjob.db" に接続
- ルーティング定義をインポート
```

### **models.py** - データベース定義
2つのモデルが定義されています：

| モデル | 役割 | 主要フィールド |
|--------|------|----------------|
| **Account** | ユーザー・メンバー | username, email, status, avatar, color |
| **Schedule** | 予定・スケジュール | account_id(外部キー), start_time, end_time, description |

**リレーション**: Account ← 1:多 → Schedule（1人のユーザーは複数の予定を持つ）

### **routes.py** - APIエンドポイント
| エンドポイント | メソッド | 機能 |
|---|---|---|
| `/` | GET | メインページ（index.html）を表示 |
| `/create_account` | POST | 新規ユーザーを作成（重複チェック付き） |
| `/add_schedule` | POST | ユーザーの予定を追加 |
| `/get_all_accounts` | GET | 全ユーザー情報を JSON で返す |
| `/get_all_schedules` | GET | 全予定情報を JSON で返す |
| `/update_status` | POST | ユーザーのステータス（in/away/out）を更新 |
| `/test` | GET | テストページを表示 |

**ステータス**: `"in"` (在室) / `"away"` (外出) / `"out"` (研究室に不在)

### **run.py** - アプリケーション起動
```python
- Flask サーバーを起動（debug=True）
- db.create_all() でデータベーステーブルを自動生成
```

---

## **:art: 2. フロントエンド構造（HTML/CSS/JavaScript）**

### **index.html** - メインUIレイアウト

構成要素：
| 要素 | 機能 |
|------|------|
| **header** | メンバー一覧表示、"+"ボタンで新規メンバー追加 |
| **calendar-container** | 時間カレンダー表示（9時〜23時） |
| **lockBtn** | 部屋のロック切り替え（赤=ロック中、緑=解除） |
| **airconBtn** | エアコン制御（青=ON、灰色=OFF） |
| **lightBtn** | 照明制御（黄=ON、灰色=OFF） |

---

### **style.css** - UIデザイン

**主要なレイアウト:**

1. **ヘッダー部分（56px固定）**
   - 横スクロール可能なメンバー一覧
   - 各メンバーは円形アバター＋名前＋ステータスバッジ

2. **カレンダー部分**
   - 左側：時間軸（9:00 ～ 23:00）
   - 右側：メンバー毎の列
   - 各セルは縦60px = 1時間

3. **制御ボタン**
   - 位置固定（右下：lock）
   - 位置固定（左下：aircon, light）

**レスポンシブ対応**:
- モバイル（1024px未満）：ヘッダーが横スクロール
- デスクトップ（1024px以上）：サイドバーに変更

---

### **view.js** - UI レンダリング機能

**エクスポート関数**:

1. **`renderMembers(members)`**
   - メンバー一覧をHTMLで動的生成
   - 各メンバーをクリックするとステータスが変わる
   - フォーマット: `<アバター> <名前> <ステータスバッジ>`

2. **`renderCalendar(members, hours, events)`**
   - カレンダー表示を動的生成
   - **時間列**：左側に9:00-23:00の時刻表示
   - **メンバー列**：各メンバーの予定を色付けで表示
   - **イベント**：予定を矩形で表示（クリックで削除可能）
   - **現在時刻マーカー**：赤い線で現在時刻を示す

---

### **main.js** - アプリケーションロジック

**初期化処理**:
```
1. loadMembers()   → サーバーから全ユーザー取得
2. loadSchedules() → サーバーから全予定取得
3. renderMembers/Calendar → UIを更新
```

**主要な関数**:

| 関数 | 役割 |
|------|------|
| `loadMembers()` | 非同期でDB から Account データ取得 |
| `loadSchedules()` | 非同期で DB から Schedule データ取得 |
| `toggleStatus(id)` | クリックでメンバーの状態を変更（in→away→out→in） |
| `addEvent(memberId, hour)` | カレンダーをクリックして予定を追加 |
| `deleteEvent(e, id)` | 予定を削除 |

**制御ボタンの挙動**:
- **ロックボタン**: `locked` フラグを切り替え
- **エアコン**: `airconOn` フラグを切り替え
- **照明**: `lightOn` フラグを切り替え

---

## **:arrows_counterclockwise: 3. データフロー**

```
ブラウザ
  ↓
main.js の fetch() で API 呼び出し
  ↓
routes.py で処理（GET/POST）
  ↓
models.py でデータベース操作
  ↓
SQLite DB（trackjob.db）
  ↓
JSON として UI に返す
  ↓
view.js で HTML 生成
  ↓
CSS で スタイリング
```

---

## **:warning: 4. 現在の状況・注意点**

### **実装済み**:
:white_check_mark: ユーザー作成・管理
:white_check_mark: 予定の表示
:white_check_mark: ステータス更新
:white_check_mark: UI の動的レンダリング

### **未実装・課題**:
:x: エアコン・照明制御・ロック機能はUI のみ（実際に制御していない）
:warning: コメント機能が routes.py で定義されているが、使用されていない
:warning: `account/` フォルダ内の Python ファイルが使用されていない 
:warning: カレンダーに表示される予定データの同期がやや曖昧

---

このアプリケーション全体は、**研究室やオフィス等の入退出状況や業務スケジュールをリアルタイムで共有するための可視化ツール**として設計されています。

---

## Cloudflare Pages（静的モック公開）

Cloudflare Pages は静的ホスティングのため、Flask（Python）を動かさずにモックデータで画面を表示します。

### 公開しているファイル（リポジトリ直下）

- `index.html`
- `test.html`
- `static/`（CSS/JS）
- `mock/`（モックJSON）

### データ差し替え

- `static/js/main.js` は `mock/accounts.json` と `mock/schedules.json` を読み込みます
- 追加・削除・ステータス変更は通信せず、ページ内の状態だけ更新します（リロードで元に戻ります）

### ローカル確認

`file://` 直開きだと `fetch()` が失敗することがあるため、簡易サーバで確認してください。

```powershell
cd .
python -m http.server 8000
```

ブラウザで `http://localhost:8000/` を開きます。
