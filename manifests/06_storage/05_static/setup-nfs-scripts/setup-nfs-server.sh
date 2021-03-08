#!/bin/bash
sudo apt install -y nfs-kernel-server
sudo mkdir /nfs-volume
echo "/nfs-volume *(rw,sync,no_subtree_check)" | sudo tee /etc/exports
echo "hello NFS volume" | sudo tee /nfs-volume/index.html
sudo chown -R nobody:nogroup /nfs-volume
sudo chmod 777 /nfs-volume
sudo systemctl restart nfs-kernel-server
sudo systemctl is-active nfs-kernel-server
sudo iptables -A INPUT -p tcp --dport 2049 -j ACCEPT
sudo iptables -A INPUT -p udp --dport 2049 -j ACCEPT
echo "===DONE===
