from __future__ import annotations

import asyncio
import time
from enum import Enum
from typing import Dict, List, Optional, Callable, Awaitable
from dataclasses import dataclass, field

from app.core.deck import Deck, Card
from app.core.evaluator import evaluate_hand, hand_name

TURN_SECONDS = 30  # seconds per turn


class Phase(str, Enum):
    WAITING = "waiting"
    PREFLOP = "preflop"
    FLOP = "flop"
    TURN = "turn"
    RIVER = "river"
    SHOWDOWN = "showdown"


class Action(str, Enum):
    FOLD = "fold"
    CHECK = "check"
    CALL = "call"
    RAISE = "raise"
    ALL_IN = "all_in"


@dataclass
class Player:
    id: str
    name: str
    chips: int = 1000
    hole_cards: List[Card] = field(default_factory=list)
    current_bet: int = 0
    total_bet: int = 0
    folded: bool = False
    all_in: bool = False
    is_connected: bool = True

    def to_dict(self, reveal_cards: bool = False) -> dict:
        return {
            "id": self.id,
            "name": self.name,
            "chips": self.chips,
            "current_bet": self.current_bet,
            "total_bet": self.total_bet,
            "folded": self.folded,
            "all_in": self.all_in,
            "is_connected": self.is_connected,
            "hole_cards": [{"rank": c[0], "suit": c[1]} for c in self.hole_cards] if reveal_cards else None,
        }


@dataclass
class GameState:
    room_id: str
    players: Dict[str, Player] = field(default_factory=dict)
    player_order: List[str] = field(default_factory=list)
    phase: Phase = Phase.WAITING
    community_cards: List[Card] = field(default_factory=list)
    pot: int = 0
    current_bet: int = 0
    current_player_idx: int = 0
    dealer_idx: int = 0
    small_blind: int = 10
    big_blind: int = 20
    deck: Optional[Deck] = None
    round_action_count: int = 0
    last_raiser_idx: Optional[int] = None
    winners: Optional[List[dict]] = None
    turn_started_at: float = field(default_factory=time.time)
    _timer_task: Optional[asyncio.Task] = field(default=None, repr=False)

    # Callback for broadcasting state
    broadcast: Optional[Callable[[str, dict], Awaitable[None]]] = None

    def add_player(self, player_id: str, name: str) -> Player:
        if player_id in self.players:
            self.players[player_id].is_connected = True
            return self.players[player_id]
        player = Player(id=player_id, name=name)
        self.players[player_id] = player
        self.player_order.append(player_id)
        return player

    def remove_player(self, player_id: str):
        if player_id in self.players:
            self.players[player_id].is_connected = False

    @property
    def active_players(self) -> List[Player]:
        return [self.players[pid] for pid in self.player_order
                if not self.players[pid].folded and self.players[pid].is_connected]

    @property
    def non_folded_players(self) -> List[Player]:
        return [self.players[pid] for pid in self.player_order
                if not self.players[pid].folded]

    @property
    def current_player(self) -> Optional[Player]:
        if not self.player_order:
            return None
        return self.players[self.player_order[self.current_player_idx % len(self.player_order)]]

    @property
    def turn_time_remaining(self) -> int:
        if self.phase in (Phase.WAITING, Phase.SHOWDOWN):
            return TURN_SECONDS
        elapsed = time.time() - self.turn_started_at
        return max(0, TURN_SECONDS - int(elapsed))

    def _next_active_idx(self, from_idx: int) -> int:
        n = len(self.player_order)
        for i in range(1, n + 1):
            idx = (from_idx + i) % n
            p = self.players[self.player_order[idx]]
            if not p.folded and not p.all_in and p.is_connected:
                return idx
        return from_idx

    def _reset_turn_timer(self):
        self.turn_started_at = time.time()
        if self._timer_task and not self._timer_task.done():
            self._timer_task.cancel()
        self._timer_task = asyncio.create_task(self._turn_timeout())

    def _cancel_timer(self):
        if self._timer_task and not self._timer_task.done():
            self._timer_task.cancel()
            self._timer_task = None

    async def _turn_timeout(self):
        """Auto-fold current player after TURN_SECONDS."""
        await asyncio.sleep(TURN_SECONDS)
        cp = self.current_player
        if cp and not cp.folded and self.phase not in (Phase.WAITING, Phase.SHOWDOWN):
            await self.handle_action(cp.id, Action.FOLD)

    async def start_hand(self):
        self._cancel_timer()
        if len([p for p in self.players.values() if p.is_connected]) < 2:
            return

        self.deck = Deck()
        self.community_cards = []
        self.pot = 0
        self.current_bet = 0
        self.winners = None
        self.round_action_count = 0
        self.last_raiser_idx = None

        for p in self.players.values():
            p.hole_cards = []
            p.current_bet = 0
            p.total_bet = 0
            p.folded = False
            p.all_in = False

        # Remove disconnected players
        disconnected = [pid for pid, p in self.players.items() if not p.is_connected]
        for pid in disconnected:
            self.player_order.remove(pid)
            del self.players[pid]

        if len(self.player_order) < 2:
            return

        # Move dealer
        self.dealer_idx = (self.dealer_idx + 1) % len(self.player_order)

        # Deal hole cards
        for pid in self.player_order:
            self.players[pid].hole_cards = self.deck.deal(2)

        # Post blinds
        sb_idx = (self.dealer_idx + 1) % len(self.player_order)
        bb_idx = (self.dealer_idx + 2) % len(self.player_order)

        sb_player = self.players[self.player_order[sb_idx]]
        bb_player = self.players[self.player_order[bb_idx]]

        sb_amount = min(self.small_blind, sb_player.chips)
        sb_player.chips -= sb_amount
        sb_player.current_bet = sb_amount
        sb_player.total_bet = sb_amount
        self.pot += sb_amount

        bb_amount = min(self.big_blind, bb_player.chips)
        bb_player.chips -= bb_amount
        bb_player.current_bet = bb_amount
        bb_player.total_bet = bb_amount
        self.pot += bb_amount

        self.current_bet = bb_amount
        self.phase = Phase.PREFLOP
        self.current_player_idx = self._next_active_idx(bb_idx)
        self.last_raiser_idx = bb_idx

        self._reset_turn_timer()
        await self._broadcast_state()

    async def handle_action(self, player_id: str, action: Action, amount: int = 0):
        player = self.players.get(player_id)
        if not player or player.folded:
            return

        current = self.current_player
        if not current or current.id != player_id:
            return

        self._cancel_timer()

        if action == Action.FOLD:
            player.folded = True

        elif action == Action.CHECK:
            if self.current_bet > player.current_bet:
                return

        elif action == Action.CALL:
            call_amount = min(self.current_bet - player.current_bet, player.chips)
            player.chips -= call_amount
            player.current_bet += call_amount
            player.total_bet += call_amount
            self.pot += call_amount
            if player.chips == 0:
                player.all_in = True

        elif action == Action.RAISE:
            if amount < self.current_bet * 2 and amount < player.chips + player.current_bet:
                amount = self.current_bet * 2
            raise_amount = min(amount - player.current_bet, player.chips)
            player.chips -= raise_amount
            player.current_bet += raise_amount
            player.total_bet += raise_amount
            self.pot += raise_amount
            self.current_bet = player.current_bet
            self.last_raiser_idx = self.current_player_idx
            self.round_action_count = 0
            if player.chips == 0:
                player.all_in = True

        elif action == Action.ALL_IN:
            all_in_amount = player.chips
            player.chips = 0
            player.current_bet += all_in_amount
            player.total_bet += all_in_amount
            self.pot += all_in_amount
            player.all_in = True
            if player.current_bet > self.current_bet:
                self.current_bet = player.current_bet
                self.last_raiser_idx = self.current_player_idx
                self.round_action_count = 0

        self.round_action_count += 1

        # Check if only one player left
        non_folded = self.non_folded_players
        if len(non_folded) == 1:
            winner = non_folded[0]
            winner.chips += self.pot
            self.winners = [{"id": winner.id, "name": winner.name, "hand": "Last Standing", "chips_won": self.pot}]
            self.phase = Phase.SHOWDOWN
            await self._broadcast_state()
            await asyncio.sleep(4)
            await self.start_hand()
            return

        next_idx = self._next_active_idx(self.current_player_idx)

        can_act = [p for p in self.active_players if not p.all_in]
        all_matched = all(p.current_bet == self.current_bet or p.all_in for p in self.non_folded_players)

        if all_matched and (self.round_action_count >= len(can_act) or next_idx == self.last_raiser_idx):
            await self._next_phase()
        else:
            self.current_player_idx = next_idx
            self._reset_turn_timer()
            await self._broadcast_state()

    async def _next_phase(self):
        self._cancel_timer()
        for p in self.players.values():
            p.current_bet = 0
        self.current_bet = 0
        self.round_action_count = 0
        self.last_raiser_idx = None

        if self.phase == Phase.PREFLOP:
            self.community_cards = self.deck.deal(3)
            self.phase = Phase.FLOP
        elif self.phase == Phase.FLOP:
            self.community_cards += self.deck.deal(1)
            self.phase = Phase.TURN
        elif self.phase == Phase.TURN:
            self.community_cards += self.deck.deal(1)
            self.phase = Phase.RIVER
        elif self.phase == Phase.RIVER:
            await self._showdown()
            return

        can_act = [p for p in self.non_folded_players if not p.all_in]
        if len(can_act) <= 1:
            while len(self.community_cards) < 5:
                if self.phase == Phase.FLOP:
                    self.community_cards += self.deck.deal(1)
                    self.phase = Phase.TURN
                elif self.phase == Phase.TURN:
                    self.community_cards += self.deck.deal(1)
                    self.phase = Phase.RIVER
                else:
                    break
                await self._broadcast_state()
                await asyncio.sleep(1.5)
            await self._showdown()
            return

        self.current_player_idx = self._next_active_idx(self.dealer_idx)
        self._reset_turn_timer()
        await self._broadcast_state()

    async def _showdown(self):
        self._cancel_timer()
        self.phase = Phase.SHOWDOWN
        non_folded = self.non_folded_players

        results = []
        for p in non_folded:
            score = evaluate_hand(p.hole_cards, self.community_cards)
            results.append((p, score))

        results.sort(key=lambda x: x[1], reverse=True)

        best_score = results[0][1]
        winners = [r for r in results if r[1] == best_score]

        share = self.pot // len(winners)
        self.winners = []
        for player, score in winners:
            player.chips += share
            self.winners.append({
                "id": player.id,
                "name": player.name,
                "hand": hand_name(score),
                "chips_won": share,
            })

        await self._broadcast_state()
        await asyncio.sleep(5)
        await self.start_hand()

    def get_state_for_player(self, player_id: str) -> dict:
        is_showdown = self.phase == Phase.SHOWDOWN
        players_data = []
        for pid in self.player_order:
            p = self.players[pid]
            reveal = (pid == player_id) or is_showdown
            players_data.append(p.to_dict(reveal_cards=reveal))

        return {
            "room_id": self.room_id,
            "phase": self.phase.value,
            "community_cards": [{"rank": c[0], "suit": c[1]} for c in self.community_cards],
            "pot": self.pot,
            "current_bet": self.current_bet,
            "current_player": self.current_player.id if self.current_player else None,
            "dealer": self.player_order[self.dealer_idx] if self.player_order else None,
            "players": players_data,
            "winners": self.winners,
            "your_id": player_id,
            "turn_time_remaining": self.turn_time_remaining,
            "turn_seconds": TURN_SECONDS,
            "small_blind": self.small_blind,
            "big_blind": self.big_blind,
        }

    async def _broadcast_state(self):
        if self.broadcast:
            for pid in self.player_order:
                state = self.get_state_for_player(pid)
                await self.broadcast(pid, state)
