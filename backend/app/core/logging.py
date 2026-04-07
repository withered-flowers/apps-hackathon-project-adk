"""Structured logging configuration for Decidely.ai."""
import logging
import sys


def setup_logging() -> logging.Logger:
    """Configure structured console logging for the application."""
    logging.basicConfig(
        stream=sys.stdout,
        level=logging.INFO,
        format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
        datefmt="%Y-%m-%dT%H:%M:%S",
    )
    return logging.getLogger("decidely")


logger = setup_logging()


def get_logger(name: str) -> logging.Logger:
    """Get a named child logger."""
    return logging.getLogger(f"decidely.{name}")
