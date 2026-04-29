"""Rate limiting module for Decidely.ai API.

Implements tier-based rate limiting with rolling window algorithm:
- Guest (anonymous): 30 requests per 5 hours
- Registered (baseline): 3 requests per 2 hours
- Registered (upgraded): 20 requests per 1 hour
"""
from __future__ import annotations

import threading
import time
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    pass


@dataclass
class RateLimitRecord:
    """Tracks rate limit usage for a single user."""

    user_id: str
    count: int = 0
    window_start: datetime = field(default_factory=datetime.utcnow)
    tier: str = "guest"


class RateLimitManager:
    """Thread-safe rate limit manager with rolling window algorithm.

    Rate limits by tier:
    - guest: 30 requests / 5 hours
    - registered: 3 requests / 2 hours
    - upgraded: 20 requests / 1 hour
    """

    # Rate limit configurations per tier
    TIER_LIMITS: dict[str, tuple[int, timedelta]] = {
        "guest": (30, timedelta(hours=5)),
        "registered": (3, timedelta(hours=2)),
        "upgraded": (20, timedelta(hours=1)),
    }

    def __init__(self) -> None:
        """Initialize the rate limit manager with thread-safe storage."""
        self._records: dict[str, RateLimitRecord] = {}
        self._lock = threading.Lock()

    def get_tier_for_user(self, user_id: str, is_upgraded: bool = False) -> str:
        """Determine the rate limit tier for a user.

        Args:
            user_id: The user's Firebase UID or "anonymous" for guests
            is_upgraded: Whether the user has redeemed the DEMO voucher

        Returns:
            Tier name: "guest", "registered", or "upgraded"
        """
        if user_id == "anonymous":
            return "guest"
        if is_upgraded:
            return "upgraded"
        return "registered"

    def check_rate_limit(
        self, user_id: str, is_upgraded: bool = False
    ) -> tuple[bool, int, int]:
        """Check if a request is within rate limit.

        Args:
            user_id: The user's Firebase UID or "anonymous" for guests
            is_upgraded: Whether the user has redeemed the DEMO voucher

        Returns:
            Tuple of (is_allowed, remaining_requests, reset_timestamp)
        """
        tier = self.get_tier_for_user(user_id, is_upgraded)
        max_requests, window_duration = self.TIER_LIMITS[tier]

        with self._lock:
            record = self._records.get(user_id)

            if record is None:
                record = RateLimitRecord(user_id=user_id, tier=tier)
                self._records[user_id] = record

            now = datetime.utcnow()
            elapsed = now - record.window_start

            if elapsed >= window_duration:
                record.count = 0
                record.window_start = now
                record.tier = tier

            if record.count >= max_requests:
                window_secs = int(window_duration.total_seconds())
                reset_ts = int(record.window_start.timestamp()) + window_secs
                return False, 0, reset_ts

            record.count += 1
            remaining = max_requests - record.count
            window_secs = int(window_duration.total_seconds())
            reset_ts = int(record.window_start.timestamp()) + window_secs

            return True, remaining, reset_ts

    def get_headers(self, user_id: str, is_upgraded: bool = False) -> dict[str, str]:
        """Get rate limit headers for a response.

        Args:
            user_id: The user's Firebase UID or "anonymous" for guests
            is_upgraded: Whether the user has redeemed the DEMO voucher

        Returns:
            Dictionary with X-RateLimit-* headers
        """
        tier = self.get_tier_for_user(user_id, is_upgraded)
        max_requests, window_duration = self.TIER_LIMITS[tier]

        with self._lock:
            record = self._records.get(user_id)
            window_secs = int(window_duration.total_seconds())
            reset_ts = int(time.time()) + window_secs

            if record is None:
                return {
                    "X-RateLimit-Limit": str(max_requests),
                    "X-RateLimit-Remaining": str(max_requests),
                    "X-RateLimit-Reset": str(reset_ts),
                }

            remaining = max(0, max_requests - record.count)
            record_reset_ts = int(record.window_start.timestamp()) + window_secs

            return {
                "X-RateLimit-Limit": str(max_requests),
                "X-RateLimit-Remaining": str(remaining),
                "X-RateLimit-Reset": str(record_reset_ts),
            }

    def reset(self, user_id: str) -> None:
        """Reset rate limit for a user (for testing purposes).

        Args:
            user_id: The user's Firebase UID
        """
        with self._lock:
            if user_id in self._records:
                del self._records[user_id]


rate_limit_manager = RateLimitManager()