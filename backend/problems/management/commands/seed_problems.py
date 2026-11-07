from django.core.management.base import BaseCommand
from problems.models import Problem, Platform
from problems.rating_converter import convert_to_cf_rating

DATA = [
    # --- CODEFORCES ---
    {
        "platform": Platform.CODEFORCES,
        "problem_id": "1850A",
        "title": "To My Critics",
        "url": "https://codeforces.com/problemset/problem/1850/A",
        "original_rating": 800,
        "tags": "math, implementation"
    },
    {
        "platform": Platform.CODEFORCES,
        "problem_id": "1850B",
        "title": "Ten Words of Wisdom",
        "url": "https://codeforces.com/problemset/problem/1850/B",
        "original_rating": 800,
        "tags": "implementation, sorting"
    },
    {
        "platform": Platform.CODEFORCES,
        "problem_id": "1850C",
        "title": "Word on the Paper",
        "url": "https://codeforces.com/problemset/problem/1850/C",
        "original_rating": 800,
        "tags": "strings, implementation"
    },
    {
        "platform": Platform.CODEFORCES,
        "problem_id": "1850D",
        "title": "Balanced Round",
        "url": "https://codeforces.com/problemset/problem/1850/D",
        "original_rating": 900,
        "tags": "greedy, sorting"
    },
    {
        "platform": Platform.CODEFORCES,
        "problem_id": "1850E",
        "title": "Cardboard for Pictures",
        "url": "https://codeforces.com/problemset/problem/1850/E",
        "original_rating": 1100,
        "tags": "binary search, math"
    },
    {
        "platform": Platform.CODEFORCES,
        "problem_id": "1850F",
        "title": "We Were Both Children",
        "url": "https://codeforces.com/problemset/problem/1850/F",
        "original_rating": 1300,
        "tags": "number theory, math"
    },
    {
        "platform": Platform.CODEFORCES,
        "problem_id": "1850G",
        "title": "The Morning Star",
        "url": "https://codeforces.com/problemset/problem/1850/G",
        "original_rating": 1500,
        "tags": "data structures, math"
    },
    {
        "platform": Platform.CODEFORCES,
        "problem_id": "1850H",
        "title": "The Third Letter",
        "url": "https://codeforces.com/problemset/problem/1850/H",
        "original_rating": 1700,
        "tags": "dfs and similar, graphs"
    },
    {
        "platform": Platform.CODEFORCES,
        "problem_id": "1915A",
        "title": "Odd One Out",
        "url": "https://codeforces.com/problemset/problem/1915/A",
        "original_rating": 800,
        "tags": "bitmasks, implementation"
    },
    {
        "platform": Platform.CODEFORCES,
        "problem_id": "1915D",
        "title": "Unnatural Language Processing",
        "url": "https://codeforces.com/problemset/problem/1915/D",
        "original_rating": 900,
        "tags": "greedy, strings"
    },
    {
        "platform": Platform.CODEFORCES,
        "problem_id": "1915E",
        "title": "Romantic Glasses",
        "url": "https://codeforces.com/problemset/problem/1915/E",
        "original_rating": 1300,
        "tags": "data structures, math"
    },
    {
        "platform": Platform.CODEFORCES,
        "problem_id": "1915F",
        "title": "Greetings",
        "url": "https://codeforces.com/problemset/problem/1915/F",
        "original_rating": 1500,
        "tags": "data structures, divide and conquer"
    },
    {
        "platform": Platform.CODEFORCES,
        "problem_id": "1915G",
        "title": "Bicycles",
        "url": "https://codeforces.com/problemset/problem/1915/G",
        "original_rating": 1800,
        "tags": "graphs, shortest paths"
    },
    {
        "platform": Platform.CODEFORCES,
        "problem_id": "1999A",
        "title": "A+B Again?",
        "url": "https://codeforces.com/problemset/problem/1999/A",
        "original_rating": 800,
        "tags": "implementation, math"
    },
    {
        "platform": Platform.CODEFORCES,
        "problem_id": "1999C",
        "title": "Showering",
        "url": "https://codeforces.com/problemset/problem/1999/C",
        "original_rating": 1000,
        "tags": "greedy, implementation"
    },
    {
        "platform": Platform.CODEFORCES,
        "problem_id": "1999E",
        "title": "Triple Operations",
        "url": "https://codeforces.com/problemset/problem/1999/E",
        "original_rating": 1400,
        "tags": "dp, math"
    },
    {
        "platform": Platform.CODEFORCES,
        "problem_id": "1999G1",
        "title": "Ruler (easy version)",
        "url": "https://codeforces.com/problemset/problem/1999/G1",
        "original_rating": 1800,
        "tags": "binary search, interactive"
    },
    {
        "platform": Platform.CODEFORCES,
        "problem_id": "1999G2",
        "title": "Ruler (hard version)",
        "url": "https://codeforces.com/problemset/problem/1999/G2",
        "original_rating": 2000,
        "tags": "ternary search, interactive"
    },

    # --- ATCODER ---
    {
        "platform": Platform.ATCODER,
        "problem_id": "abc300_a",
        "title": "N-choice question",
        "url": "https://atcoder.jp/contests/abc300/tasks/abc300_a",
        "original_rating": 20,
        "tags": "implementation"
    },
    {
        "platform": Platform.ATCODER,
        "problem_id": "abc300_b",
        "title": "Same Map in the RPG World",
        "url": "https://atcoder.jp/contests/abc300/tasks/abc300_b",
        "original_rating": 260,
        "tags": "brute force, 2d-grid"
    },
    {
        "platform": Platform.ATCODER,
        "problem_id": "abc300_c",
        "title": "Cross",
        "url": "https://atcoder.jp/contests/abc300/tasks/abc300_c",
        "original_rating": 480,
        "tags": "grid, simulation"
    },
    {
        "platform": Platform.ATCODER,
        "problem_id": "abc300_d",
        "title": "A-cross-B",
        "url": "https://atcoder.jp/contests/abc300/tasks/abc300_d",
        "original_rating": 880,
        "tags": "number theory, primes"
    },
    {
        "platform": Platform.ATCODER,
        "problem_id": "abc300_e",
        "title": "Dice Product 3",
        "url": "https://atcoder.jp/contests/abc300/tasks/abc300_e",
        "original_rating": 1350,
        "tags": "dp, probability"
    },
    {
        "platform": Platform.ATCODER,
        "problem_id": "abc300_f",
        "title": "More Holidays",
        "url": "https://atcoder.jp/contests/abc300/tasks/abc300_f",
        "original_rating": 1750,
        "tags": "two pointers, binary search"
    },
    {
        "platform": Platform.ATCODER,
        "problem_id": "abc320_a",
        "title": "Leyland Number",
        "url": "https://atcoder.jp/contests/abc320/tasks/abc320_a",
        "original_rating": 15,
        "tags": "math"
    },
    {
        "platform": Platform.ATCODER,
        "problem_id": "abc320_b",
        "title": "Longest Palindrome",
        "url": "https://atcoder.jp/contests/abc320/tasks/abc320_b",
        "original_rating": 120,
        "tags": "strings, brute force"
    },
    {
        "platform": Platform.ATCODER,
        "problem_id": "abc320_c",
        "title": "Slot Strategy",
        "url": "https://atcoder.jp/contests/abc320/tasks/abc320_c",
        "original_rating": 650,
        "tags": "brute force, permutations"
    },
    {
        "platform": Platform.ATCODER,
        "problem_id": "abc320_d",
        "title": "Relative Position",
        "url": "https://atcoder.jp/contests/abc320/tasks/abc320_d",
        "original_rating": 950,
        "tags": "dfs, graphs, geometry"
    },
    {
        "platform": Platform.ATCODER,
        "problem_id": "abc320_e",
        "title": "Somen Nagashi",
        "url": "https://atcoder.jp/contests/abc320/tasks/abc320_e",
        "original_rating": 1280,
        "tags": "priority queue, simulation"
    },
    {
        "platform": Platform.ATCODER,
        "problem_id": "abc320_f",
        "title": "Fuel Round Trip",
        "url": "https://atcoder.jp/contests/abc320/tasks/abc320_f",
        "original_rating": 1820,
        "tags": "dp"
    },
    {
        "platform": Platform.ATCODER,
        "problem_id": "abc340_a",
        "title": "Arithmetic Progression",
        "url": "https://atcoder.jp/contests/abc340/tasks/abc340_a",
        "original_rating": 10,
        "tags": "math"
    },
    {
        "platform": Platform.ATCODER,
        "problem_id": "abc340_c",
        "title": "Divide and Divide",
        "url": "https://atcoder.jp/contests/abc340/tasks/abc340_c",
        "original_rating": 580,
        "tags": "memoization, recursion"
    },
    {
        "platform": Platform.ATCODER,
        "problem_id": "abc340_d",
        "title": "Super Takahashi Bros.",
        "url": "https://atcoder.jp/contests/abc340/tasks/abc340_d",
        "original_rating": 920,
        "tags": "dijkstra, graphs"
    },
    {
        "platform": Platform.ATCODER,
        "problem_id": "abc340_e",
        "title": "Mancala 2",
        "url": "https://atcoder.jp/contests/abc340/tasks/abc340_e",
        "original_rating": 1410,
        "tags": "lazy segment tree"
    },

    # --- CODECHEF ---
    {
        "platform": Platform.CODECHEF,
        "problem_id": "WATERREQ",
        "title": "Water Requirement",
        "url": "https://www.codechef.com/problems/WATERREQ",
        "original_rating": 450,
        "tags": "basic math"
    },
    {
        "platform": Platform.CODECHEF,
        "problem_id": "INSTNOODLE",
        "title": "Chef and Instant Noodles",
        "url": "https://www.codechef.com/problems/INSTNOODLE",
        "original_rating": 520,
        "tags": "basic math"
    },
    {
        "platform": Platform.CODECHEF,
        "problem_id": "BATTERYLOW",
        "title": "Battery Low",
        "url": "https://www.codechef.com/problems/BATTERYLOW",
        "original_rating": 650,
        "tags": "conditions"
    },
    {
        "platform": Platform.CODECHEF,
        "problem_id": "EZSPEAK",
        "title": "Easy Pronunciation",
        "url": "https://www.codechef.com/problems/EZSPEAK",
        "original_rating": 1020,
        "tags": "strings"
    },
    {
        "platform": Platform.CODECHEF,
        "problem_id": "ATM2",
        "title": "ATM Machine",
        "url": "https://www.codechef.com/problems/ATM2",
        "original_rating": 1080,
        "tags": "simulation"
    },
    {
        "platform": Platform.CODECHEF,
        "problem_id": "PROGLANG",
        "title": "Programming Languages",
        "url": "https://www.codechef.com/problems/PROGLANG",
        "original_rating": 1150,
        "tags": "implementation"
    },
    {
        "platform": Platform.CODECHEF,
        "problem_id": "ELECTIONS",
        "title": "Elections in Chefland",
        "url": "https://www.codechef.com/problems/ELECTIONS",
        "original_rating": 1220,
        "tags": "conditions"
    },
    {
        "platform": Platform.CODECHEF,
        "problem_id": "EQUALSTRING",
        "title": "Equal Strings",
        "url": "https://www.codechef.com/problems/EQUALSTRING",
        "original_rating": 1380,
        "tags": "strings, greedy"
    },
    {
        "platform": Platform.CODECHEF,
        "problem_id": "ARRAYRET",
        "title": "Retrieve the Array",
        "url": "https://www.codechef.com/problems/ARRAYRET",
        "original_rating": 1450,
        "tags": "math, prefix sums"
    },
    {
        "platform": Platform.CODECHEF,
        "problem_id": "PETSTORE",
        "title": "Pet Store",
        "url": "https://www.codechef.com/problems/PETSTORE",
        "original_rating": 1520,
        "tags": "counting, hash table"
    },
    {
        "platform": Platform.CODECHEF,
        "problem_id": "DIVIDEMAKEEQ",
        "title": "Make Money",
        "url": "https://www.codechef.com/problems/DIVIDEMAKEEQ",
        "original_rating": 1620,
        "tags": "greedy, number theory"
    },
    {
        "platform": Platform.CODECHEF,
        "problem_id": "PERMCLEAR",
        "title": "Permutation Clear",
        "url": "https://www.codechef.com/problems/PERMCLEAR",
        "original_rating": 1680,
        "tags": "hash sets"
    },
    {
        "platform": Platform.CODECHEF,
        "problem_id": "AVGPERM",
        "title": "Average Permutation",
        "url": "https://www.codechef.com/problems/AVGPERM",
        "original_rating": 1810,
        "tags": "constructive algorithms"
    },
    {
        "platform": Platform.CODECHEF,
        "problem_id": "SUBARRAYREM",
        "title": "Subarray Removal",
        "url": "https://www.codechef.com/problems/SUBARRAYREM",
        "original_rating": 1940,
        "tags": "greedy"
    },
    {
        "platform": Platform.CODECHEF,
        "problem_id": "EQPAIR",
        "title": "Equal Difference",
        "url": "https://www.codechef.com/problems/EQPAIR",
        "original_rating": 2120,
        "tags": "number theory"
    }
]

class Command(BaseCommand):
    help = "Seeds standard problems from Codeforces, CodeChef, and AtCoder with normalized ratings"

    def handle(self, *args, **options):
        created_count = 0
        updated_count = 0

        for item in DATA:
            norm_rating = convert_to_cf_rating(item["platform"], item["original_rating"])
            obj, created = Problem.objects.update_or_create(
                platform=item["platform"],
                problem_id=item["problem_id"],
                defaults={
                    "title": item["title"],
                    "url": item["url"],
                    "original_rating": item["original_rating"],
                    "normalized_cf_rating": norm_rating,
                    "tags": item.get("tags", "")
                }
            )
            if created:
                created_count += 1
            else:
                updated_count += 1

        # Ensure demo user exists for interviewers/testers
        from django.contrib.auth import get_user_model
        User = get_user_model()
        if not User.objects.filter(username='coder').exists():
            User.objects.create_user(
                username='coder',
                password='coder123',
                email='coder@example.com',
                codeforces_handle='tourist',
                codechef_handle='gennady',
                atcoder_handle='tourist'
            )
            self.stdout.write(self.style.SUCCESS("Demo user 'coder' created (password: coder123)."))

        self.stdout.write(
            self.style.SUCCESS(
                f"Successfully seeded problems! Created: {created_count}, Updated: {updated_count}. Total in DB: {Problem.objects.count()}"
            )
        )
