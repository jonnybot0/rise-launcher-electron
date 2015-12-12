#!/bin/bash

if [ "$1" == "/s" ] || [ "$1" == "/S" ] || [ "$1" == "--unattended" ]; then
  sudo $(dirname $(readlink -f "$0"))/os-optimizations.sh
  $(dirname $(readlink -f "$0"))/../../installer
  exit 0
fi

echo "The Rise Player is designed to work on a dedicated computer attached to a Display.
The installation will disable screen savers, time outs, and system notifications.
It will show content full screen on startup, by default.
We do not recommend installing Rise Player on a personal, non-dedicated computer.
If you do wish to proceed with the installation please press y to continue."
read -n 1
if [ "$REPLY" != y ]; then
  exit 1
fi

sudo $(dirname $(readlink -f "$0"))/os-optimizations.sh
$(dirname $(readlink -f "$0"))/../../installer
