#!/bin/bash

# Setup cron job for crypto rates update
# This script should be run with sudo privileges

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
SERVER_DIR="$PROJECT_ROOT/server"

# Cron job command
CRON_COMMAND="cd $SERVER_DIR && npm run update-crypto-rates >> /var/log/flyvixx-crypto-rates.log 2>&1"

# Check if cron job already exists
if crontab -l | grep -q "update-crypto-rates"; then
    echo "Crypto rates update cron job already exists. Removing old one..."
    crontab -l | grep -v "update-crypto-rates" | crontab -
fi

# Add new cron job to run every minute
(crontab -l ; echo "* * * * * $CRON_COMMAND") | crontab -

echo "✅ Crypto rates update cron job has been set up to run every minute"
echo "📝 Cron command: $CRON_COMMAND"
echo "📄 Logs will be written to: /var/log/flyvixx-crypto-rates.log"

# Create log file if it doesn't exist
sudo touch /var/log/flyvixx-crypto-rates.log
sudo chmod 664 /var/log/flyvixx-crypto-rates.log

echo "🎯 Setup complete! Crypto rates will now update automatically every minute."