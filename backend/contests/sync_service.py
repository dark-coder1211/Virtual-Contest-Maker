import random
import string
import requests
from bs4 import BeautifulSoup
from django.utils import timezone
from problems.models import Problem, Platform, DifficultyTier
from .models import Contest, ContestProblem, ContestParticipation, ProblemSubmissionStatus

LETTER_LABELS = list(string.ascii_uppercase)

def generate_virtual_contest(user, difficulty=DifficultyTier.EASY, duration_minutes=120, problem_count=6, title=None):
    """
    Creates a new virtual contest with problems from Codeforces, CodeChef, and AtCoder,
    arranged in strictly increasing order of normalized Codeforces rating.
    """
    if not title:
        tier_label = dict(DifficultyTier.choices).get(difficulty, difficulty)
        timestamp = timezone.now().strftime("%b %d, %H:%M")
        title = f"Virtual Contest #{random.randint(100, 999)} [{tier_label}] - {timestamp}"

    # Define rating targets based on preset
    # Easy = Div. 4 (~800 to 1350)
    # Medium = Div. 3 (~800 to 1800)
    # Hard = Div. 2 (~1100 to 2200+)
    if difficulty == DifficultyTier.EASY:
        target_ranges = [
            (800, 850),
            (850, 950),
            (950, 1050),
            (1050, 1150),
            (1150, 1250),
            (1250, 1400),
        ]
    elif difficulty == DifficultyTier.MEDIUM:
        target_ranges = [
            (800, 950),
            (950, 1150),
            (1150, 1350),
            (1350, 1550),
            (1550, 1700),
            (1700, 1900),
        ]
    else: # HARD (Div 2)
        target_ranges = [
            (1000, 1300),
            (1300, 1500),
            (1500, 1750),
            (1750, 1950),
            (1950, 2150),
            (2150, 2450),
        ]

    # Adjust target ranges to match requested problem_count
    if problem_count != len(target_ranges):
        min_r = target_ranges[0][0]
        max_r = target_ranges[-1][1]
        step = (max_r - min_r) / problem_count
        target_ranges = [(int(min_r + i * step), int(min_r + (i + 1) * step)) for i in range(problem_count)]

    # Collect available problems
    selected_problems = []
    used_problem_ids = set()
    preferred_platforms = [Platform.CODEFORCES, Platform.ATCODER, Platform.CODECHEF]

    for idx, (low, high) in enumerate(target_ranges):
        # Rotate preferred platform to ensure diverse representation across Codeforces, CodeChef, and AtCoder
        primary_platform = preferred_platforms[idx % len(preferred_platforms)]
        
        # Try finding a problem from the preferred platform in the target rating range
        candidates = list(Problem.objects.filter(
            platform=primary_platform,
            normalized_cf_rating__gte=low,
            normalized_cf_rating__lte=high
        ).exclude(id__in=used_problem_ids))

        # If not enough, expand to any platform in that rating range
        if not candidates:
            candidates = list(Problem.objects.filter(
                normalized_cf_rating__gte=low,
                normalized_cf_rating__lte=high
            ).exclude(id__in=used_problem_ids))

        # If still none, broaden range slightly
        if not candidates:
            candidates = list(Problem.objects.exclude(id__in=used_problem_ids).order_by('normalized_cf_rating'))
            if candidates:
                # Find closest problem
                candidates.sort(key=lambda p: abs(p.normalized_cf_rating - ((low + high) // 2)))

        if candidates:
            chosen = random.choice(candidates[:3]) if len(candidates) >= 3 else candidates[0]
            selected_problems.append(chosen)
            used_problem_ids.add(chosen.id)

    # Strictly sort selected problems by normalized Codeforces rating
    selected_problems.sort(key=lambda p: p.normalized_cf_rating)

    # Create Contest
    contest = Contest.objects.create(
        title=title,
        difficulty=difficulty,
        duration_minutes=duration_minutes,
        created_by=user if user and user.is_authenticated else None
    )

    # Create ContestProblems
    for i, prob in enumerate(selected_problems):
        letter = LETTER_LABELS[i] if i < len(LETTER_LABELS) else f"P{i+1}"
        points = (i + 1) * 500
        ContestProblem.objects.create(
            contest=contest,
            problem=prob,
            letter_index=letter,
            order=i,
            points=points
        )

    return contest


def sync_contest_submissions(participation: ContestParticipation) -> dict:
    """
    Synchronizes submission status for all unsolved problems in a contest participation session
    by querying Codeforces, AtCoder, and CodeChef for the user's handles.
    """
    user = participation.user
    cf_handle = (user.codeforces_handle or '').strip()
    cc_handle = (user.codechef_handle or '').strip()
    ac_handle = (user.atcoder_handle or '').strip()

    statuses = list(participation.problem_statuses.select_related('contest_problem__problem').all())
    newly_solved = []

    # 1. Fetch Codeforces submissions if CF handle is configured
    cf_solved_problems = set()
    cf_sub_urls = {}
    if cf_handle:
        try:
            url = f"https://codeforces.com/api/user.status?handle={cf_handle}&from=1&count=60"
            resp = requests.get(url, timeout=6)
            if resp.status_code == 200:
                data = resp.json()
                if data.get('status') == 'OK':
                    for sub in data.get('result', []):
                        if sub.get('verdict') == 'OK':
                            p = sub.get('problem', {})
                            contest_id = str(p.get('contestId', ''))
                            index = str(p.get('index', '')).upper()
                            full_id = f"{contest_id}{index}"
                            cf_solved_problems.add(full_id)
                            cf_solved_problems.add(f"{contest_id}_{index}")
                            sub_id = sub.get('id')
                            if contest_id and sub_id:
                                cf_sub_urls[full_id] = f"https://codeforces.com/contest/{contest_id}/submission/{sub_id}"
        except Exception as e:
            print(f"Error checking Codeforces submissions: {e}")

    # 2. Fetch AtCoder submissions if AC handle is configured
    ac_solved_problems = set()
    ac_sub_urls = {}
    if ac_handle:
        try:
            # Kenkoooo AtCoder API
            url = f"https://kenkoooo.com/atcoder/atcoder-api/v3/user/submissions?user={ac_handle}&from_second=0"
            resp = requests.get(url, timeout=6)
            if resp.status_code == 200:
                submissions = resp.json()
                for sub in submissions:
                    if sub.get('result') == 'AC':
                        pid = str(sub.get('problem_id', '')).lower()
                        ac_solved_problems.add(pid)
                        cid = sub.get('contest_id')
                        sid = sub.get('id')
                        if cid and sid:
                            ac_sub_urls[pid] = f"https://atcoder.jp/contests/{cid}/submissions/{sid}"
        except Exception as e:
            print(f"Error checking AtCoder submissions: {e}")

    # 3. Fetch CodeChef solved problems if CC handle is configured
    cc_solved_problems = set()
    if cc_handle:
        try:
            # CodeChef user profile page contains list of solved problems
            url = f"https://www.codechef.com/users/{cc_handle}"
            headers = {'User-Agent': 'Mozilla/5.0'}
            resp = requests.get(url, headers=headers, timeout=6)
            if resp.status_code == 200:
                soup = BeautifulSoup(resp.text, 'html.parser')
                # Find all links pointing to /status/PROBLEM_CODE
                for a in soup.find_all('a', href=True):
                    href = a['href']
                    if '/status/' in href:
                        # Format is /status/PROBLEM_CODE,user_handle
                        parts = href.split('/status/')[-1].split(',')
                        if parts:
                            cc_solved_problems.add(parts[0].strip().upper())
        except Exception as e:
            print(f"Error checking CodeChef submissions: {e}")

    # Now verify each problem in this contest
    for status_obj in statuses:
        if status_obj.is_solved:
            continue

        prob = status_obj.contest_problem.problem
        prob_id = prob.problem_id
        is_solved = False
        sub_url = ''

        if prob.platform == Platform.CODEFORCES:
            cleaned_id = prob_id.replace('-', '').replace('_', '').replace(' ', '').upper()
            if cleaned_id in cf_solved_problems or prob_id in cf_solved_problems:
                is_solved = True
                sub_url = cf_sub_urls.get(cleaned_id, f"https://codeforces.com/submissions/{cf_handle}")

        elif prob.platform == Platform.ATCODER:
            cleaned_id = prob_id.lower()
            if cleaned_id in ac_solved_problems:
                is_solved = True
                sub_url = ac_sub_urls.get(cleaned_id, f"https://atcoder.jp/users/{ac_handle}/history")

        elif prob.platform == Platform.CODECHEF:
            cleaned_id = prob_id.strip().upper()
            if cleaned_id in cc_solved_problems:
                is_solved = True
                sub_url = f"https://www.codechef.com/status/{cleaned_id},{cc_handle}"

        if is_solved:
            status_obj.is_solved = True
            status_obj.solved_at = timezone.now()
            status_obj.platform_submission_url = sub_url
            status_obj.save()
            newly_solved.append(status_obj.contest_problem.letter_index)

    # Recalculate score and solved count
    solved_count = participation.problem_statuses.filter(is_solved=True).count()
    total_score = sum(
        s.contest_problem.points for s in participation.problem_statuses.filter(is_solved=True)
    )
    participation.solved_count = solved_count
    participation.total_score = total_score
    participation.save()

    return {
        'newly_solved': newly_solved,
        'solved_count': solved_count,
        'total_score': total_score,
        'synced_at': timezone.now().isoformat()
    }
