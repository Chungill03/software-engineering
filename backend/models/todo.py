from extensions import db

class Todo(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    text = db.Column(db.String(200), nullable=False)
    completed = db.Column(db.Boolean, default=False)
    date = db.Column(db.String(10), nullable=True)
    start_time = db.Column(db.String(5), nullable=True)
    end_time = db.Column(db.String(5), nullable=True)



    def to_dict(self):
        return {
            "id": self.id,
            "text": self.text,
            "completed": self.completed,
            "date": self.date,
            "start_time": self.start_time,
            "end_time": self.end_time
        }
