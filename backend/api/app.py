from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# DB 설정
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///todolist.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
db = SQLAlchemy(app)

# 모델 정의
class Todo(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    text = db.Column(db.String(200), nullable=False)
    completed = db.Column(db.Boolean, default=False)

    def to_dict(self):
        return {"id": self.id, "text": self.text, "completed": self.completed}

with app.app_context():
    db.create_all()

# -------------------------
# REST API 엔드포인트
# -------------------------

# 1) 전체 목록 조회
@app.route("/api/todos", methods=["GET"])
def get_todos():
    todos = Todo.query.all()
    return jsonify([t.to_dict() for t in todos])

# 2) 항목 추가
@app.route("/api/todos", methods=["POST"])
def add_todo():
    data = request.get_json()
    text= (data.get("text") or "").strip()
    if not text:
        return jsonify({"error": "내용이 비어 있습니다."}), 400

    todo = Todo(text=text)
    db.session.add(todo)
    db.session.commit()
    return jsonify(todo.to_dict()), 201

# 3) 완료 토글
@app.route("/api/todos/<int:id>", methods=["PATCH"])
def toggle_todo(id):
    todo = Todo.query.get_or_404(id)
    todo.completed = not todo.completed
    db.session.commit()
    return jsonify(todo.to_dict())

# 4) 삭제
@app.route("/api/todos/<int:id>", methods=["DELETE"])
def delete_todo(id):
    todo = Todo.query.get_or_404(id)
    db.session.delete(todo)
    db.session.commit()
    return jsonify({"message": "삭제 완료"}), 200 

# -------------------------

if __name__ == "__main__":
    app.run(debug=True)
