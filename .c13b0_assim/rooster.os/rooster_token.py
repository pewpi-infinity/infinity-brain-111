"""Token module for rooster.os

This module defines a Token class to represent tokens with various properties.
"""

from datetime import datetime
from enum import Enum


class TokenColor(Enum):
    """Enumeration for token colors."""
    RED = "RED"
    BLUE = "BLUE"
    GREEN = "GREEN"
    YELLOW = "YELLOW"


class Token:
    """Represents a token with number, value, color, and datetime properties."""
    
    def __init__(self, number: int, value: int, color: TokenColor, token_datetime: datetime):
        """
        Initialize a Token instance.
        
        Args:
            number: The token number identifier
            value: The token value
            color: The token color (TokenColor enum)
            token_datetime: The datetime associated with the token
        """
        self.number = number
        self.value = value
        self.color = color
        self.token_datetime = token_datetime
    
    def __str__(self):
        """Return a string representation of the token."""
        return (
            f"Token Number: {self.number}\n"
            f"Token Value: {self.value}\n"
            f"Token Color: {self.color.value}\n"
            f"Token DateTime: {self.token_datetime.strftime('%Y-%m-%d %H:%M:%S')}"
        )
    
    def __repr__(self):
        """Return a detailed representation of the token."""
        return (
            f"Token(number={self.number}, value={self.value}, "
            f"color={self.color}, token_datetime={self.token_datetime})"
        )
    
    def to_dict(self):
        """Convert token to dictionary representation."""
        return {
            "number": self.number,
            "value": self.value,
            "color": self.color.value,
            "token_datetime": self.token_datetime.isoformat()
        }
