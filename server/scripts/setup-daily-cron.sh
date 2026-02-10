#!/bin/bash

# Setup daily cron job for gift reset
# This script should be run with sudo privileges

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
SERVER_DIR="$PROJECT_ROOT/server"

# Cron job command
CRON_COMMAND="cd $SERVER_DIR && npm run daily-gift-reset >> /var/log/flyvixx-daily-gift-reset.log 2>&1"

# Check if cron job already exists
if crontab -l | grep -q "daily-gift-reset"; then
    echo "Daily gift reset cron job already exists. Removing old one..."
    crontab -l | grep -v "daily-gift-reset" | crontab -
fi

# Add new cron job to run at midnight daily
(crontab -l ; echo "0 0 * * * $CRON_COMMAND") | crontab -

echo "✅ Daily gift reset cron job has been set up to run at midnight (00:00) daily"
echo "📝 Cron command: $CRON_COMMAND"
echo "📄 Logs will be written to: /var/log/flyvixx-daily-gift-reset.log"

# Create log file if it doesn't exist
sudo touch /var/log/flyvixx-daily-gift-reset.log
sudo chmod 664 /var/log/flyvixx-daily-gift-reset.log

echo "🎯 Setup complete! The daily gift reset will now run automatically every day at midnight."