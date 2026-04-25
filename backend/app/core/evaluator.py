from typing import List, Tuple
from collections import Counter

Card = Tuple[str, str]

RANK_ORDER = {r: i for i, r in enumerate(
    ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"]
)}

HAND_RANKS = {
    "royal_flush": 9,
    "straight_flush": 8,
    "four_of_a_kind": 7,
    "full_house": 6,
    "flush": 5,
    "straight": 4,
    "three_of_a_kind": 3,
    "two_pair": 2,
    "one_pair": 1,
    "high_card": 0,
}


def _rank_val(rank: str) -> int:
    return RANK_ORDER[rank]


def _best_five(cards: List[Card]) -> Tuple[int, List[int]]:
    """Evaluate the best 5-card hand from up to 7 cards. Returns (hand_rank, tiebreakers)."""
    if len(cards) < 5:
        return _evaluate_five(cards)

    from itertools import combinations
    best = (-1, [])
    for combo in combinations(cards, 5):
        score = _evaluate_five(list(combo))
        if score > best:
            best = score
    return best


def _evaluate_five(cards: List[Card]) -> Tuple[int, List[int]]:
    ranks = sorted([_rank_val(c[0]) for c in cards], reverse=True)
    suits = [c[1] for c in cards]
    rank_counts = Counter(ranks)

    is_flush = len(set(suits)) == 1
    sorted_unique = sorted(rank_counts.keys(), reverse=True)

    # Check straight
    is_straight = False
    straight_high = 0
    if len(sorted_unique) == 5:
        if sorted_unique[0] - sorted_unique[4] == 4:
            is_straight = True
            straight_high = sorted_unique[0]
        # Ace-low straight (A-2-3-4-5)
        elif sorted_unique == [12, 3, 2, 1, 0]:
            is_straight = True
            straight_high = 3  # 5-high

    if is_flush and is_straight:
        if straight_high == 12:
            return (HAND_RANKS["royal_flush"], [straight_high])
        return (HAND_RANKS["straight_flush"], [straight_high])

    freq = sorted(rank_counts.values(), reverse=True)

    if freq == [4, 1]:
        four = [r for r, c in rank_counts.items() if c == 4][0]
        kicker = [r for r, c in rank_counts.items() if c == 1][0]
        return (HAND_RANKS["four_of_a_kind"], [four, kicker])

    if freq == [3, 2]:
        three = [r for r, c in rank_counts.items() if c == 3][0]
        two = [r for r, c in rank_counts.items() if c == 2][0]
        return (HAND_RANKS["full_house"], [three, two])

    if is_flush:
        return (HAND_RANKS["flush"], ranks)

    if is_straight:
        return (HAND_RANKS["straight"], [straight_high])

    if freq == [3, 1, 1]:
        three = [r for r, c in rank_counts.items() if c == 3][0]
        kickers = sorted([r for r, c in rank_counts.items() if c == 1], reverse=True)
        return (HAND_RANKS["three_of_a_kind"], [three] + kickers)

    if freq == [2, 2, 1]:
        pairs = sorted([r for r, c in rank_counts.items() if c == 2], reverse=True)
        kicker = [r for r, c in rank_counts.items() if c == 1][0]
        return (HAND_RANKS["two_pair"], pairs + [kicker])

    if freq == [2, 1, 1, 1]:
        pair = [r for r, c in rank_counts.items() if c == 2][0]
        kickers = sorted([r for r, c in rank_counts.items() if c == 1], reverse=True)
        return (HAND_RANKS["one_pair"], [pair] + kickers)

    return (HAND_RANKS["high_card"], ranks)


def evaluate_hand(hole_cards: List[Card], community_cards: List[Card]) -> Tuple[int, List[int]]:
    """Evaluate a player's best hand from their hole cards + community cards."""
    return _best_five(hole_cards + community_cards)


HAND_NAMES = {v: k.replace("_", " ").title() for k, v in HAND_RANKS.items()}


def hand_name(score: Tuple[int, List[int]]) -> str:
    return HAND_NAMES.get(score[0], "Unknown")
