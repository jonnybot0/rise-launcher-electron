#!/bin/bash
echo "Would you like to set up the os optimizations (eg: disable screensavers)? [Y/n]"
read yn
if test "$yn" != n; then
  sudo $(dirname $(readlink -f "$0"))/os-optimizations.sh
fi
$(dirname $(readlink -f "$0"))/../../installer
