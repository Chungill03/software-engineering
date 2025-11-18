from extensions import db

class Post(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    content = db.Column(db.Text, nullable=False)
    likes = db.Column(db.Integer, default=0)

    comments = db.relationship("Comment", backref="post", cascade="all, delete")


class Comment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    post_id = db.Column(db.Integer, db.ForeignKey("post.id"))
    content = db.Column(db.Text, nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "post_id": self.post_id,
            "content": self.content
        }
