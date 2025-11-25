from flask import Blueprint, request, jsonify
from extensions import db
from models import Todo

todos_bp = Blueprint("todos", __name__, url_prefix="/api/todos")

# 전체 목록 조회
@todos_bp.route("/", methods=["GET"])
def get_todos():
    todos = Todo.query.all()
    return jsonify([t.to_dict() for t in todos])

# 추가
@todos_bp.route("/", methods=["POST"])
def add_todo():
    data = request.get_json()
    text = (data.get("text") or "").strip()
    date = data.get("date")
    start = data.get("start_time")
    end = data.get("end_time")

    if not text:
        return jsonify({"error": "내용이 비어 있습니다."}), 400

    todo = Todo(text=text, date=date, start_time=start, end_time=end)
    db.session.add(todo)
    db.session.commit()
    return jsonify(todo.to_dict()), 201

# 내용 수정
@todos_bp.route("/<int:id>", methods=["PATCH"])
def update_todo(id):
    todo = Todo.query.get_or_404(id)
    data = request.get_json()

    # text 수정
    if "text" in data:
        new_text = (data.get("text") or "").strip()
        if not new_text:
            return jsonify({"error": "내용을 입력해주세요."}), 400
        todo.text = new_text

    # date 수정
    if "date" in data:
        new_date = (data.get("date") or "").strip()
        todo.date = new_date

    # start_time 수정
    if "start_time" in data:
        todo.start_time = data["start_time"]

    # end_time 수정 
    if "end_time" in data:
        todo.end_time = data["end_time"]


    db.session.commit()
    return jsonify(todo.to_dict()), 200


# 완료 상태 토글
@todos_bp.route("/<int:id>/toggle", methods=["PATCH"])
def toggle_todo(id):
    todo = Todo.query.get_or_404(id)
    todo.completed = not todo.completed
    db.session.commit()
    return jsonify(todo.to_dict()), 200

# 삭제
@todos_bp.route("/<int:id>", methods=["DELETE"])
def delete_todo(id):
    todo = Todo.query.get_or_404(id)
    db.session.delete(todo)
    db.session.commit()
    return jsonify({"message": "삭제 완료"}), 200
