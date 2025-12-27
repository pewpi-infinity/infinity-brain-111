#!/usr/bin/env python3

import requests
import json

def dig_up_token_info(token_address):
    """
    Dig up information about a Solana token using DexScreener API.
    This script fetches basic token details like name, symbol, price, market cap, etc.
    """
    url = f"https://api.dexscreener.com/latest/dex/tokens/{token_address}"

    try:
        response = requests.get(url, timeout=15)
        response.raise_for_status()
        data = response.json()

        if 'pairs' in data and len(data['pairs']) > 0:
            pair = data['pairs'][0]
            token_info = pair.get('baseToken', {})

            print("Token Investigation Report:")
            print("=" * 40)
            print(f"Address: {token_address}")
            print(f"Name: {token_info.get('name', 'N/A')}")
            print(f"Symbol: {token_info.get('symbol', 'N/A')}")
            print(f"Description: {token_info.get('description', 'No description available')}")
            print(f"Price (USD): ${pair.get('priceUsd', 'N/A')}")
            print(f"Market Cap: ${pair.get('marketCap', 'N/A')}")
            print(f"FDV (Fully Diluted Value): ${pair.get('fdv', 'N/A')}")
            print(f"Liquidity (USD): ${pair.get('liquidity', {}).get('usd', 'N/A')}")
            print(f"24h Volume (USD): ${pair.get('volume', {}).get('h24', 'N/A')}")
            print(f"24h Price Change: {pair.get('priceChange', {}).get('h24', 'N/A')}%")

            socials = token_info.get('socials', [])
            if socials:
                print("\nSocial Links:")
                for social in socials:
                    print(f"- {social.get('type', 'unknown').title()}: {social.get('url', 'N/A')}")
            else:
                print("\nSocial Links: None available")

            print("\nNote: Data fetched from DexScreener.")
        else:
            print("No trading pairs found for this token.")

    except requests.exceptions.RequestException as e:
        print(f"Error fetching data: {e}")
    except json.JSONDecodeError:
        print("Error parsing JSON response.")
    except Exception as e:
        print(f"Unexpected error: {e}")

if __name__ == "__main__":
    address = "AumaQ5bXzpd5xjsR6snS34FbRGVNNtCF2z2QgVEmpump"
    dig_up_token_info(address)
