from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy

# Flask 앱 생성
app = Flask(__name__)

# 데이터베이스 설정 (SQLite 사용)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///todo.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# -----------------------------
# Todo 모델 (테이블 구조)
# -----------------------------
class Todo(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.String(200), nullable=False)
    done = db.Column(db.Boolean, default=False)

    def __repr__(self):
        return f'<Todo {self.id}: {self.content}>'

# 앱 실행 시 DB 생성 (없으면 새로 생성)
with app.app_context():
    db.create_all()

# -----------------------------
# CRUD 기능 구현
# -----------------------------

# 전체 목록 조회 (Read)
@app.route('/todos', methods=['GET'])
def get_todos():
    todos = Todo.query.all()
    result = []
    for t in todos:
        result.append({'id': t.id, 'content': t.content, 'done': t.done})
    return jsonify(result)

# 새로운 할 일 추가 (Create)
@app.route('/todos', methods=['POST'])
def add_todo():
    data = request.get_json()
    content = data.get('content', '').strip()

    if not content:
        return jsonify({'error': '내용이 비어 있습니다.'}), 400

    new_todo = Todo(content=content)
    db.session.add(new_todo)
    db.session.commit()

    print("새로운 투두 추가됨:", content)  # 디버깅용 출력

    return jsonify({
        'message': '추가 완료',
        'todo': {'id': new_todo.id, 'content': new_todo.content, 'done': new_todo.done}
    })

# 완료 상태 변경 (Update)
@app.route('/todos/<int:todo_id>', methods=['PATCH'])
def toggle_todo(todo_id):
    todo = Todo.query.get(todo_id)
    if not todo:
        return jsonify({'error': '해당 항목이 없습니다.'}), 404

    todo.done = not todo.done
    db.session.commit()
    return jsonify({'message': '상태 변경 완료', 'done': todo.done})

# 삭제 기능 (Delete)
@app.route('/todos/<int:todo_id>', methods=['DELETE'])
def delete_todo(todo_id):
    todo = Todo.query.get(todo_id)
    if not todo:
        return jsonify({'error': '삭제할 항목이 없습니다.'}), 404

    db.session.delete(todo)
    db.session.commit()
    return jsonify({'message': '삭제 완료'})

# -----------------------------
# 기본 페이지 (서버 테스트용)
# -----------------------------
@app.route("/")
def home():
    return "서버가 잘 작동 중입니다!"

# -----------------------------
# 메인 실행
# -----------------------------
if __name__ == '__main__':
    app.run(debug=True)
