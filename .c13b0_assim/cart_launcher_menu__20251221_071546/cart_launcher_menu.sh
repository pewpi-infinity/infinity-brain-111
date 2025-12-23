#!/data/data/com.termux/files/usr/bin/bash
set -e

clear
echo "=============================="
echo " Infinity Launcher"
echo "=============================="
echo
echo "1) Start Writer"
echo "2) Start Miner"
echo "3) Start Token Generator"
echo "4) Start Dashboard"
echo "5) Start Everything"
echo "0) Exit"
echo
read -p "Select option: " CHOICE

case "$CHOICE" in
  1)
    echo "[launcher] starting writer"
    ./cart_writer.sh
    ;;
  2)
    echo "[launcher] starting miner"
    ./cart_miner.sh
    ;;
  3)
    echo "[launcher] starting token generator"
    ./cart_token_generator.sh
    ;;
  4)
    echo "[launcher] starting dashboard"
    ./cart_dashboard.sh
    ;;
  5)
    echo "[launcher] starting all"
    ./cart_writer.sh &
    ./cart_miner.sh &
    ./cart_token_generator.sh &
    ./cart_dashboard.sh &
    wait
    ;;
  0)
    echo "exit"
    exit 0
    ;;
  *)
    echo "invalid option"
    ;;
esac
