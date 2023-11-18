#!/bin/bash

# Define the path to your repository
REPO_PATH="/home/robert/dev/BlackmagicCameraController"

# Copy the service files to the systemd directory
sudo cp $REPO_PATH/systemd/*.service /etc/systemd/system/

# Reload systemd to recognize new services
sudo systemctl daemon-reload

# Enable and start the services
sudo systemctl enable frontend.service
sudo systemctl start frontend.service

sudo systemctl enable tally_listener.service
sudo systemctl start tally_listener.service

sudo systemctl enable backend.service
sudo systemctl start backend.service

sudo systemctl daemon-reload
echo "Services have been configured and started."
