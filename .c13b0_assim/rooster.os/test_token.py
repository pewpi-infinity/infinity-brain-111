"""Unit tests for the Token module."""

import unittest
from datetime import datetime
from rooster_token import Token, TokenColor


class TestToken(unittest.TestCase):
    """Test cases for the Token class."""
    
    def setUp(self):
        """Set up test fixtures."""
        self.token = Token(
            number=1054,
            value=2593,
            color=TokenColor.RED,
            token_datetime=datetime(2025, 12, 5, 22, 33, 45)
        )
    
    def test_token_creation(self):
        """Test that a token can be created with correct attributes."""
        self.assertEqual(self.token.number, 1054)
        self.assertEqual(self.token.value, 2593)
        self.assertEqual(self.token.color, TokenColor.RED)
        self.assertEqual(self.token.token_datetime, datetime(2025, 12, 5, 22, 33, 45))
    
    def test_token_str_representation(self):
        """Test the string representation of a token."""
        expected = (
            "Token Number: 1054\n"
            "Token Value: 2593\n"
            "Token Color: RED\n"
            "Token DateTime: 2025-12-05 22:33:45"
        )
        self.assertEqual(str(self.token), expected)
    
    def test_token_repr(self):
        """Test the repr representation of a token."""
        repr_str = repr(self.token)
        self.assertIn("Token(", repr_str)
        self.assertIn("number=1054", repr_str)
        self.assertIn("value=2593", repr_str)
        self.assertIn("color=TokenColor.RED", repr_str)
    
    def test_token_to_dict(self):
        """Test conversion of token to dictionary."""
        token_dict = self.token.to_dict()
        self.assertEqual(token_dict["number"], 1054)
        self.assertEqual(token_dict["value"], 2593)
        self.assertEqual(token_dict["color"], "RED")
        self.assertEqual(token_dict["token_datetime"], "2025-12-05T22:33:45")
    
    def test_token_color_enum(self):
        """Test that token colors are properly enumerated."""
        self.assertEqual(TokenColor.RED.value, "RED")
        self.assertEqual(TokenColor.BLUE.value, "BLUE")
        self.assertEqual(TokenColor.GREEN.value, "GREEN")
        self.assertEqual(TokenColor.YELLOW.value, "YELLOW")
    
    def test_different_token_colors(self):
        """Test creating tokens with different colors."""
        blue_token = Token(100, 200, TokenColor.BLUE, datetime.now())
        self.assertEqual(blue_token.color, TokenColor.BLUE)
        
        green_token = Token(101, 201, TokenColor.GREEN, datetime.now())
        self.assertEqual(green_token.color, TokenColor.GREEN)


if __name__ == "__main__":
    unittest.main()
