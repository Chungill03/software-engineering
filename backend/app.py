from flask import Flask
from extensions import db, cors
from routes import todos_bp, board_bp, calendar_bp
import os

def create_app():
    app = Flask(__name__)

    cors(app)

    BASE_DIR = os.path.abspath(os.path.dirname(__file__))
    app.config["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{os.path.join(BASE_DIR, 'database.db')}"
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    db.init_app(app)

    app.register_blueprint(todos_bp)
    app.register_blueprint(board_bp)
    app.register_blueprint(calendar_bp)

    with app.app_context():
        db.create_all()

    return app


if __name__ == "__main__":
    app = create_app() 
    app.run(debug=True)
