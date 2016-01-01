#!/bin/bash

if [ "$1" == "/s" ] || [ "$1" == "/S" ] || [ "$1" == "--unattended" ]; then
  $(dirname $(readlink -f "$0"))/os-unprivileged-optimizations.sh
  $(dirname $(readlink -f "$0"))/../../../installer --unattended
  exit 0
fi

echo "The Rise Player is designed to work on a dedicated computer attached to a Display.
The installation will disable screen savers, time outs, and system notifications.
It will show content full screen on startup, by default.
We do not recommend installing Rise Player on a personal, non-dedicated computer."
echo
if [ $(lsb_release -sr) != "14.04" ]; then
  echo "Note that  release 14.04 LTS is the only supported Ubuntu version."
fi

echo "If you wish to proceed with the installation please press y to continue."
read -t 300 -n 1
if [ $? != 0 ]; then
  echo "timeout"
  $(dirname $(readlink -f "$0"))/os-unprivileged-optimizations.sh
  $(dirname $(readlink -f "$0"))/../../../installer --unattended
  exit 0
fi

if [ $REPLY != y ]; then
  exit 1
fi

sudo $(dirname $(readlink -f "$0"))/os-privileged-optimizations.sh
$(dirname $(readlink -f "$0"))/os-unprivileged-optimizations.sh
$(dirname $(readlink -f "$0"))/../../../installer
