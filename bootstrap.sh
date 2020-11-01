#!/bin/bash

echo "
##################################################
Installing NVM
##################################################
"

curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.36.0/install.sh | bash

cat >> ~/.bashrc<<EOF
export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" # This loads nvm
EOF

source ~/.bashrc

nvm install 14
nvm alias default 14
nvm use default

echo "
#################################################
Installing Elasticsearch
#################################################
"

sudo yum update
sudo yum install java-1.8.0-openjdk.x86_64 -y

curl -O https://artifacts.elastic.co/downloads/elasticsearch/elasticsearch-7.9.2-x86_64.rpm
sudo rpm -ivh elasticsearch-7.9.2-x86_64.rpm
sudo systemctl daemon-reload
sudo systemctl enable elasticsearch.service

sudo sed -i "s/#node.name: node-1/node.name: node-1/g" /etc/elasticsearch/elasticsearch.yml
sudo sed -i "s/#network.host: 192.168.0.1/network.host: 192.168.33.10/g" /etc/elasticsearch/elasticsearch.yml 
sudo sed -i "s/#cluster.initial_master_nodes: \[\"node-1\", \"node-2\"\]/cluster.initial_master_nodes: \[\"node-1\"\]/g" /etc/elasticsearch/elasticsearch.yml

sudo cat /etc/elasticsearch/elasticsearch.yml

# Risky operation!! Enabling only for POC
sudo su -c "cat >> /etc/elasticsearch/elasticsearch.yml<<EOF
http.cors.enabled : true
http.cors.allow-origin : \"*\"
EOF"

sudo systemctl start elasticsearch.service
sudo service elasticsearch status

echo "
#################################################
Loading data to Elasticsearch
#################################################
"

pushd /home/vagrant/app
npm run loaddata

echo "
################################################
You may now start the node server
$ cd /home/vagrant/app && npm run start
################################################
"