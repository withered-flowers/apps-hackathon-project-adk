"""Tests for rate limiting functionality."""
import pytest
from datetime import datetime, timedelta

from app.core.rate_limiter import RateLimitManager


class TestRateLimitManager:
    """Tests for RateLimitManager class."""

    def setup_method(self) -> None:
        """Create fresh RateLimitManager for each test."""
        self.manager = RateLimitManager()

    def test_guest_tier_defaults_to_guest(self) -> None:
        """Anonymous users should get guest tier."""
        tier = self.manager.get_tier_for_user("anonymous")
        assert tier == "guest"

    def test_registered_user_baseline_tier(self) -> None:
        """Non-upgraded registered users should get registered tier."""
        tier = self.manager.get_tier_for_user("user123", is_upgraded=False)
        assert tier == "registered"

    def test_upgraded_user_tier(self) -> None:
        """Upgraded users should get upgraded tier."""
        tier = self.manager.get_tier_for_user("user123", is_upgraded=True)
        assert tier == "upgraded"

    def test_guest_allows_30_requests(self) -> None:
        """Guest users should be allowed 30 requests."""
        user_id = "anonymous"

        for i in range(30):
            allowed, remaining, _ = self.manager.check_rate_limit(user_id)
            assert allowed is True, f"Request {i+1} should be allowed"
            assert remaining == 30 - (i + 1)

    def test_guest_blocks_31st_request(self) -> None:
        """Guest users should be blocked on 31st request."""
        user_id = "anonymous"

        for _ in range(30):
            self.manager.check_rate_limit(user_id)

        allowed, remaining, _ = self.manager.check_rate_limit(user_id)
        assert allowed is False
        assert remaining == 0

    def test_registered_allows_3_requests(self) -> None:
        """Registered users should be allowed 3 requests."""
        user_id = "registered_test"

        for i in range(3):
            allowed, remaining, _ = self.manager.check_rate_limit(user_id, is_upgraded=False)
            assert allowed is True, f"Request {i+1} should be allowed"
            assert remaining == 3 - (i + 1)

    def test_registered_blocks_4th_request(self) -> None:
        """Registered users should be blocked on 4th request."""
        user_id = "registered_limit_test"

        for _ in range(3):
            self.manager.check_rate_limit(user_id, is_upgraded=False)

        allowed, remaining, _ = self.manager.check_rate_limit(user_id, is_upgraded=False)
        assert allowed is False
        assert remaining == 0

    def test_upgraded_allows_20_requests(self) -> None:
        """Upgraded users should be allowed 20 requests."""
        user_id = "upgraded_test"

        for i in range(20):
            allowed, remaining, _ = self.manager.check_rate_limit(user_id, is_upgraded=True)
            assert allowed is True, f"Request {i+1} should be allowed"
            assert remaining == 20 - (i + 1)

    def test_upgraded_blocks_21st_request(self) -> None:
        """Upgraded users should be blocked on 21st request."""
        user_id = "upgraded_limit_test"

        for _ in range(20):
            self.manager.check_rate_limit(user_id, is_upgraded=True)

        allowed, remaining, _ = self.manager.check_rate_limit(user_id, is_upgraded=True)
        assert allowed is False
        assert remaining == 0

    def test_different_users_independent_limits(self) -> None:
        """Different users should have independent rate limits."""
        user1 = "user_one"
        user2 = "user_two"

        for _ in range(3):
            self.manager.check_rate_limit(user1, is_upgraded=False)

        allowed, _, _ = self.manager.check_rate_limit(user2, is_upgraded=False)
        assert allowed is True

    def test_get_headers_returns_all_required_headers(self) -> None:
        """get_headers should return X-RateLimit-* headers."""
        headers = self.manager.get_headers("anonymous")
        assert "X-RateLimit-Limit" in headers
        assert "X-RateLimit-Remaining" in headers
        assert "X-RateLimit-Reset" in headers

    def test_reset_clears_user_limit(self) -> None:
        """reset should clear rate limit for a user."""
        user_id = "reset_test"

        for _ in range(3):
            self.manager.check_rate_limit(user_id, is_upgraded=False)

        self.manager.reset(user_id)

        allowed, remaining, _ = self.manager.check_rate_limit(user_id, is_upgraded=False)
        assert allowed is True
        assert remaining == 2