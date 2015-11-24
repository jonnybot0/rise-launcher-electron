echo "Disabling screensaver"
gsettings set org.gnome.desktop.session idle-delay 0
gsettings set org.gnome.settings-daemon.plugins.power idle-dim false

echo "Disabling inactive timeout"
gsettings set org.gnome.settings-daemon.plugins.power sleep-inactive-ac-timeout 0

echo "Disabling system update notifications"
sudo cp /usr/bin/update-notifier /usr/bin/update-notifier.real
echo '#!/bin/sh' |sudo tee /usr/bin/update-notifier
echo 'exit 0' |sudo tee -a /usr/bin/update-notifier

echo "Disabling apport"
echo ' # ' |sudo tee -a /etc/default/apport
echo 'enabled=0' |sudo tee -a /etc/default/apport

echo "Removing legacy Rise Vision cron setting"
sudo sed -i.bak '/rvplayer/d' /etc/crontab
