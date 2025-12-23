#!/usr/bin/env python3
import os, subprocess, sys

# import from the proper package path
from forge_engine.forge_reactor import mint_token

REPO="/data/data/com.termux/files/home/mongoose.os"

def push():
    subprocess.run(["git","add","infinity_tokens/"], cwd=REPO)
    subprocess.run(["git","commit","-m","∞ Forge Reactor token"], cwd=REPO)
    subprocess.run(["git","push","origin","main"], cwd=REPO)

if __name__ == "__main__":

    ebay_url = None
    if len(sys.argv) > 1:
        ebay_url = sys.argv[1]

    token_id = mint_token(ebay_url=ebay_url)
    print("Minted:", token_id)

    push()
