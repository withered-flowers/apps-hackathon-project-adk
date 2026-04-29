"""Voucher redemption service for Decidely.ai rate limit upgrades."""
from __future__ import annotations

from datetime import datetime

from google.cloud import firestore

from app.core.logging import get_logger

logger = get_logger("services.voucher")


class VoucherService:
    """Service for handling voucher code redemptions."""

    DEMO_CODE = "DEMO"

    def __init__(self) -> None:
        """Initialize the voucher service with Firestore client."""
        self._db = firestore.Client()

    def redeem_voucher(self, user_id: str, code: str) -> tuple[bool, str]:
        """Attempt to redeem a voucher code for a user.

        Args:
            user_id: The user's Firebase UID
            code: The voucher code to redeem

        Returns:
            Tuple of (success, message)
        """
        if code != self.DEMO_CODE:
            return False, f"Invalid voucher code: {code}"

        voucher_ref = self._db.collection("voucher_redemptions").document(f"{user_id}_{code}")

        if voucher_ref.get().exists:
            return False, "Voucher code has already been redeemed"

        voucher_ref.set({
            "user_id": user_id,
            "code": code,
            "redeemed_at": datetime.utcnow(),
        })

        user_ref = self._db.collection("users").document(user_id)
        user_ref.set({"rate_limit_tier": "upgraded"}, merge=True)

        logger.info("Voucher %s redeemed by user %s", code, user_id)

        return True, "upgraded"

    def is_user_upgraded(self, user_id: str) -> bool:
        """Check if a user has an upgraded rate limit tier.

        Args:
            user_id: The user's Firebase UID

        Returns:
            True if the user has upgraded rate limits
        """
        if user_id == "anonymous":
            return False

        user_ref = self._db.collection("users").document(user_id)
        user_doc = user_ref.get()

        if not user_doc.exists:
            return False

        user_data = user_doc.to_dict()
        return user_data.get("rate_limit_tier") == "upgraded"

    def get_user_tier(self, user_id: str) -> str:
        """Get the actual rate limit tier for a user.

        Args:
            user_id: The user's Firebase UID or "anonymous" for guests

        Returns:
            Tier name: "guest", "registered", or "upgraded"
        """
        if user_id == "anonymous":
            return "guest"
        if self.is_user_upgraded(user_id):
            return "upgraded"
        return "registered"


voucher_service = VoucherService()