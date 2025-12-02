from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, date

app = Flask(__name__)

# SQLite 데이터베이스 설정
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///todo.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# ----------------------------------------------------
# Todo 모델
# ----------------------------------------------------
class Todo(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)     # 제목
    due_date = db.Column(db.Date, nullable=False)         # 날짜
    category = db.Column(db.String(50))                   # 카테고리
    priority = db.Column(db.Integer, default=4)           # 우선순위 1~4
    done = db.Column(db.Boolean, default=False)           # 완료 여부

    # D-day 계산 함수
    def get_d_day(self):
        return (self.due_date - date.today()).days

    # 우선순위 계산 함수
    def update_priority(self):
        dday = self.get_d_day()
        if dday <= 1:
            self.priority = 1
        elif dday <= 3:
            self.priority = 2
        elif dday <= 7:
            self.priority = 3
        else:
            self.priority = 4

    # JSON 변환 함수
    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "due_date": str(self.due_date),
            "category": self.category,
            "priority": self.priority,
            "done": self.done,
            "d_day": self.get_d_day()
        }

# DB 생성
with app.app_context():
    db.create_all()

# ----------------------------------------------------
# 1. 할 일 전체 조회
# ----------------------------------------------------
@app.route("/todos", methods=["GET"])
def get_todos():
    todos = Todo.query.all()
    return jsonify([t.to_dict() for t in todos])

# ----------------------------------------------------
# 2. 할 일 추가
# ----------------------------------------------------
@app.route("/todos", methods=["POST"])
def add_todo():
    data = request.get_json()

    title = data.get("title", "").strip()
    due_date_str = data.get("due_date")
    category = data.get("category", "")

    if not title:
        return jsonify({"error": "title은 필수입니다."}), 400

    if not due_date_str:
        return jsonify({"error": "due_date(YYYY-MM-DD)는 필수입니다."}), 400

    # 문자열 -> 날짜 변환
    try:
        due_date = datetime.strptime(due_date_str, "%Y-%m-%d").date()
    except:
        return jsonify({"error": "날짜 형식이 잘못되었습니다."}), 400

    new_todo = Todo(
        title=title,
        due_date=due_date,
        category=category
    )

    # 우선순위 자동 계산
    new_todo.update_priority()

    db.session.add(new_todo)
    db.session.commit()

    return jsonify({"message": "추가 완료", "todo": new_todo.to_dict()})

# ----------------------------------------------------
# 3. 완료 상태 변경 (true/false)
# ----------------------------------------------------
@app.route("/todos/<int:todo_id>", methods=["PATCH"])
def toggle_todo(todo_id):
    todo = Todo.query.get(todo_id)

    if not todo:
        return jsonify({"error": "Todo 없음"}), 404

    todo.done = not todo.done
    db.session.commit()

    return jsonify({"message": "변경 완료", "done": todo.done})

# ----------------------------------------------------
# 4. 할 일 삭제
# ----------------------------------------------------
@app.route("/todos/<int:todo_id>", methods=["DELETE"])
def delete_todo(todo_id):
    todo = Todo.query.get(todo_id)

    if not todo:
        return jsonify({"error": "삭제할 Todo 없음"}), 404

    db.session.delete(todo)
    db.session.commit()

    return jsonify({"message": "삭제 완료"})

# ----------------------------------------------------
# 5. 날짜별 일정 조회 /todos/date/2025-11-20
# ----------------------------------------------------
@app.route("/todos/date/<day>", methods=["GET"])
def get_by_date(day):
    try:
        target_date = datetime.strptime(day, "%Y-%m-%d").date()
    except:
        return jsonify({"error": "날짜 형식 오류"}), 400

    todos = Todo.query.filter_by(due_date=target_date).all()
    return jsonify([t.to_dict() for t in todos])

# ----------------------------------------------------
# 6. 월별 일정 조회 /todos/month/2025-11
# ----------------------------------------------------
@app.route("/todos/month/<ym>", methods=["GET"])
def get_by_month(ym):
    try:
        year, month = map(int, ym.split('-'))
        start_date = date(year, month, 1)

        # 다음 달 계산
        if month == 12:
            end_date = date(year + 1, 1, 1)
        else:
            end_date = date(year, month + 1, 1)

    except:
        return jsonify({"error": "형식 오류 (예: 2025-11)"}), 400

    todos = Todo.query.filter(
        Todo.due_date >= start_date,
        Todo.due_date < end_date
    ).all()

    return jsonify([t.to_dict() for t in todos])

# ----------------------------------------------------
# 기본 테스트 페이지
# ----------------------------------------------------
@app.route("/")
def home():
    return "Todo + Calendar API 서버 정상 작동 중!"

if __name__ == "__main__":
    app.run(debug=True)
