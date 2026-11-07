"""
Rating Normalization Engine
Converts difficulty ratings from Codeforces, CodeChef, and AtCoder 
into a unified Codeforces-equivalent rating scale.
"""

def round_to_rating_step(val, step=50):
    """Rounds rating to nearest step (e.g. 50 or 100) for clean display"""
    return int(round(val / step) * step)

def convert_to_cf_rating(platform: str, original_rating: int) -> int:
    """
    Given a platform ('CODEFORCES', 'CODECHEF', 'ATCODER') and its native difficulty rating,
    returns the equivalent Codeforces rating.
    """
    platform = platform.upper()
    if original_rating is None or original_rating <= 0:
        return 800

    if platform == 'CODEFORCES':
        # Codeforces rating is the base baseline (clamped at minimum 800)
        return max(800, original_rating)

    elif platform == 'ATCODER':
        # Kenkoooo AtCoder Difficulty Model to Codeforces:
        # AtCoder uses difficulty where:
        #   < 400 is grey (elementary)
        #   400-799 is brown
        #   800-1199 is green
        #   1200-1599 is cyan
        #   1600-1999 is blue
        #   2000-2399 is yellow
        # On CF, the minimum rating is 800.
        diff = original_rating
        if diff <= 400:
            cf = 800 + (diff / 400.0) * 150  # 800 -> 950
        elif diff <= 1200:
            cf = 950 + ((diff - 400.0) / 800.0) * 550  # 950 -> 1500
        elif diff <= 2000:
            cf = 1500 + ((diff - 1200.0) / 800.0) * 500  # 1500 -> 2000
        else:
            cf = 2000 + (diff - 2000.0) * 1.05  # 2000+
        return round_to_rating_step(cf)

    elif platform == 'CODECHEF':
        # CodeChef rating scale:
        # Div 4: rating < 1400 (diffs ~ 500-1300)
        # Div 3: rating 1400-1600 (diffs ~ 1300-1650)
        # Div 2: rating 1600-2000 (diffs ~ 1600-2100)
        # Div 1: rating > 2000
        # CodeChef is generally 200-400 points inflated at lower/mid levels compared to Codeforces.
        diff = original_rating
        if diff <= 1000:
            cf = 800 + (diff / 1000.0) * 200  # 800 -> 1000
        elif diff <= 1600:
            cf = 1000 + ((diff - 1000.0) / 600.0) * 450  # 1000 -> 1450
        elif diff <= 2200:
            cf = 1450 + ((diff - 1600.0) / 600.0) * 500  # 1450 -> 1950
        else:
            cf = 1950 + (diff - 2200.0) * 0.95  # 1950+
        return round_to_rating_step(cf)

    return max(800, original_rating)


def get_difficulty_tier(cf_rating: int) -> str:
    """
    Maps normalized Codeforces rating to contest preset tier:
    EASY   (Div 4): ~800 to 1350
    MEDIUM (Div 3): ~1100 to 1800
    HARD   (Div 2): ~1500 to 2400+
    """
    if cf_rating < 1350:
        return 'EASY'
    elif cf_rating < 1800:
        return 'MEDIUM'
    else:
        return 'HARD'
