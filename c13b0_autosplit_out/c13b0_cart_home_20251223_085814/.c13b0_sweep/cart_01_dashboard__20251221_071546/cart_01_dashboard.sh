#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

LOG="$HOME/infinity_spine/logs/spine.log"

clear
echo -e "\e[36m[DASHBOARD] live spine monitor\e[0m"
echo "-----------------------------------"

while true; do
  if [ ! -f "$LOG" ]; then
    echo -e "\e[31mwaiting for spine.log...\e[0m"
    sleep 1
    continue
  fi

  LAST=$(tail -n 1 "$LOG" | awk -F= '{print $2}')
  BAR=$(printf "%-${LAST}s" "#" | tail -c 30)

  clear
  echo -e "\e[36m[DASHBOARD]\e[0m tick=$LAST"
  echo -e "\e[32m$BAR\e[0m"
  sleep 1
done
