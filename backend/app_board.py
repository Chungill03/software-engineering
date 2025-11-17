"""
게시판 백엔드 Flask 코드
레포 주소: https://github.com/Chungill03/software-engineering.git
"""

from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///board.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# -----------------------------
# 모델 정의
# -----------------------------
class Post(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    content = db.Column(db.Text, nullable=False)
    likes = db.Column(db.Integer, default=0)

class Comment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    post_id = db.Column(db.Integer, db.ForeignKey('post.id'))
    content = db.Column(db.Text, nullable=False)

with app.app_context():
    db.create_all()

# -----------------------------
# 게시글 CRUD
# -----------------------------
@app.route('/posts', methods=['GET'])
def get_posts():
    posts = Post.query.all()
    result = [{'id': p.id, 'title': p.title, 'content': p.content, 'likes': p.likes} for p in posts]
    return jsonify(result)

@app.route('/posts', methods=['POST'])
def add_post():
    data = request.get_json()
    title = data.get('title', '').strip()
    content = data.get('content', '').strip()
    if not title or not content:
        return jsonify({'error': '제목과 내용을 입력하세요.'}), 400
    post = Post(title=title, content=content)
    db.session.add(post)
    db.session.commit()
    return jsonify({'message': '게시글 작성 완료', 'post_id': post.id})

@app.route('/posts/<int:post_id>', methods=['PATCH'])
def update_post(post_id):
    post = Post.query.get(post_id)
    if not post:
        return jsonify({'error': '게시글이 없습니다.'}), 404
    data = request.get_json()
    post.title = data.get('title', post.title)
    post.content = data.get('content', post.content)
    db.session.commit()
    return jsonify({'message': '게시글 수정 완료'})

@app.route('/posts/<int:post_id>', methods=['DELETE'])
def delete_post(post_id):
    post = Post.query.get(post_id)
    if not post:
        return jsonify({'error': '게시글이 없습니다.'}), 404
    db.session.delete(post)
    db.session.commit()
    return jsonify({'message': '게시글 삭제 완료'})

# -----------------------------
# 댓글 기능
# -----------------------------
@app.route('/posts/<int:post_id>/comments', methods=['GET'])
def get_comments(post_id):
    comments = Comment.query.filter_by(post_id=post_id).all()
    result = [{'id': c.id, 'content': c.content} for c in comments]
    return jsonify(result)

@app.route('/posts/<int:post_id>/comments', methods=['POST'])
def add_comment(post_id):
    data = request.get_json()
    content = data.get('content', '').strip()
    if not content:
        return jsonify({'error': '댓글 내용을 입력하세요.'}), 400
    comment = Comment(post_id=post_id, content=content)
    db.session.add(comment)
    db.session.commit()
    return jsonify({'message': '댓글 작성 완료', 'comment_id': comment.id})

@app.route('/comments/<int:comment_id>', methods=['DELETE'])
def delete_comment(comment_id):
    comment = Comment.query.get(comment_id)
    if not comment:
        return jsonify({'error': '댓글이 없습니다.'}), 404
    db.session.delete(comment)
    db.session.commit()
    return jsonify({'message': '댓글 삭제 완료'})

# -----------------------------
# 좋아요 기능
# -----------------------------
@app.route('/posts/<int:post_id>/like', methods=['POST'])
def like_post(post_id):
    post = Post.query.get(post_id)
    if not post:
        return jsonify({'error': '게시글이 없습니다.'}), 404
    post.likes += 1
    db.session.commit()
    return jsonify({'message': '좋아요 완료', 'total_likes': post.likes})

# -----------------------------
# 기본 테스트 페이지
# -----------------------------
@app.route('/')
def home():
    return "게시판 서버 실행 중"

# -----------------------------
# 앱 실행
# -----------------------------
if __name__ == '__main__':
    app.run(debug=True)