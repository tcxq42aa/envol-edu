#!/usr/bin/env bash
sshpass -p Xuqi.321 scp ./releases/edu.envol.vip.tar.gz root@47.104.91.246:/root/envol-mini/
sshpass -p Xuqi.321 ssh -o StrictHostKeyChecking=no root@47.104.91.246 "source /etc/profile && cd /root/envol-mini && rm -rf edu.envol.vip && tar -xzvf edu.envol.vip.tar.gz && pm2 stop all && cd edu.envol.vip && npm start&"
