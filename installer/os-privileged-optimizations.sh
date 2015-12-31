echo "Disabling system update notifications"
sudo cp /usr/bin/update-notifier /usr/bin/update-notifier.real
echo '#!/bin/sh' |sudo tee /usr/bin/update-notifier
echo 'exit 0' |sudo tee -a /usr/bin/update-notifier

echo "Disabling apport"
echo ' # ' |sudo tee -a /etc/default/apport
echo 'enabled=0' |sudo tee -a /etc/default/apport

echo "Removing legacy Rise Vision cron setting"
sudo sed -i.bak '/rvplayer/d' /etc/crontab
