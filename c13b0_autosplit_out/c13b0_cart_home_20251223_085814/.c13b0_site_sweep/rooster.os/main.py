"""Main script to create and display the specific token."""

from datetime import datetime
from rooster_token import Token, TokenColor


def main():
    """Create and display the specified token."""
    # Create the token with the specified properties
    token = Token(
        number=1054,
        value=2593,
        color=TokenColor.RED,
        token_datetime=datetime(2025, 12, 5, 22, 33, 45)
    )
    
    # Display the token
    print(token)
    
    return token


if __name__ == "__main__":
    main()
