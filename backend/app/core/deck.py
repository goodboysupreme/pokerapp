import random
from typing import List, Tuple

SUITS = ["hearts", "diamonds", "clubs", "spades"]
RANKS = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"]

Card = Tuple[str, str]  # (rank, suit)


class Deck:
    def __init__(self):
        self.cards: List[Card] = [(r, s) for s in SUITS for r in RANKS]
        random.shuffle(self.cards)

    def deal(self, n: int = 1) -> List[Card]:
        dealt = self.cards[:n]
        self.cards = self.cards[n:]
        return dealt
