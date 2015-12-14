echo "Disabling screensaver"
gsettings set org.gnome.desktop.session idle-delay 0
gsettings set org.gnome.settings-daemon.plugins.power idle-dim false
gsettings set org.gnome.desktop.screensaver lock-enabled false

echo "Disabling inactive timeout"
gsettings set org.gnome.settings-daemon.plugins.power sleep-inactive-ac-timeout 0
