Vagrant.configure("2") do |config|

  config.vm.box = "centos/7"

  config.vm.provider "virtualbox" do |vb|
    vb.memory = 2048
    vb.cpus = 4
  end

  config.vm.network "private_network", ip: "192.168.33.10"

  config.vm.synced_folder "./src", "/home/vagrant/app", :mount_options => ["dmode=777", "fmode=666"]

  config.vm.provision "shell", privileged: false, path: "bootstrap.sh"

end

