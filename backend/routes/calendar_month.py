from flask import Blueprint, request, jsonify
from models.todo import Todo
from utils.date_utils import get_month_range, is_between

calendar_bp = Blueprint("calendar", __name__, url_prefix="/api/calendar")

@calendar_bp.route("/month", methods=["GET"])
def get_month_calendar():
    # 1) 입력값
    date_str = request.args.get("date")
    if not date_str:
        return jsonify({"error": "date 파라미터가 필요합니다."}), 400

    # 2) 월간 범위 구하기
    month_range = get_month_range(date_str)
    if month_range is None:
        return jsonify({"error": "날짜 형식이 잘못되었습니다."}), 400

    start = month_range["start"]
    end = month_range["end"]

    # 3) DB 전체 조회 → 월간 범위 필터링
    todos = Todo.query.all()

    filtered = []
    for t in todos:
        if is_between(t.date, start, end):
            filtered.append(t.to_dict())

    # 4) 응답
    return jsonify({
        "start": start,
        "end": end,
        "items": filtered
    })
