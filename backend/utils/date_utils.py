from datetime import datetime, timedelta

def is_valid_date(date_str):
    if len(date_str) != 10:
        return False

    if date_str[4] !='-' or date_str[7] != '-':
        return False

    year, month, day = date_str.split("-")

    if not(year.isdigit() and month.isdigit() and day.isdigit()):
        return False
    
    year = int(year)
    month = int(month)
    day = int(day)
    
    if month < 1 or month > 12:
        return False
    if day < 1 or day > 31:
        return False
    
    return True

def normalize_date(date_str):
    if not is_valid_date(date_str):
        return None
    
    year, month, day = date_str.split("-")

    year = year.zfill(4)
    month = month.zfill(2)
    day = day.zfill(2)

    return f"{year}-{month}-{day}"

def compare_date(date1, date2):

    date1 = normalize_date(date1)
    date2 = normalize_date(date2)
    
    if date1 is None or date2 is None:
        return None
    
    y1, m1, d1 = date1.split("-")
    y2, m2, d2 = date2.split("-")
    
    y1 = int(y1); m1 = int(m1); d1 = int(d1)
    y2 = int(y2); m2 = int(m2); d2 = int(d2)
 
    if y1 < y2: return -1
    if y1 > y2: return 1
    
    if m1 < m2: return -1
    if m1 > m2: return 1
    
    if d1 < d2: return -1
    if d1 > d2: return 1
    
    return 0

def get_month_range(date_str):
    date = normalize_date(date_str)
    if date is None:
        return None

    year, month, day = date.split("-")

    year = int(year)
    month = int(month)

    start_dt = datetime(year, month, 1)

    if month == 12:
        next_month_dt = datetime(year + 1, 1, 1)
    else:
        next_month_dt = datetime(year, month + 1, 1)

    end_dt = next_month_dt - timedelta(days=1)

    return {
        "start": start_dt.strftime("%Y-%m-%d"),
        "end": end_dt.strftime("%Y-%m-%d")
    }

def is_between(date, start, end):
    date = normalize_date(date)
    start = normalize_date(start)
    end = normalize_date(end)

    if date is None or start is None or end is None:
        return False
    
    result1 = compare_date(start, date)
    result2 = compare_date(date, end)
    
    if result1 in (-1, 0) and result2 in (-1, 0):
        return True

    return False