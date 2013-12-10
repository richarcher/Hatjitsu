Vagrant::configure('2') do |config|
  # use a pretty standard ubuntu 64 bit VM, downloadable from anywhere
  config.vm.box = 'precise64'
  config.vm.box_url = 'http://files.vagrantup.com/precise64.box'

  # use puppet to provision packages, clone the repository, and start the service
  config.vm.provision :puppet do |puppet|
    puppet.manifests_path = 'puppet/manifests'
    puppet.manifest_file = 'site.pp'
  end

  # there's only one node in this Vagrantfile, call it master
  config.vm.define :master, {:primary => true} do |master|
    # configure network
    master.vm.hostname = 'hatjitsu.local'
    # forward local port 8081 to the running service
    master.vm.network "forwarded_port", guest: 5000, host: 8081

    # a nicety, set the VirtualBox vm name, then limit memory consumption
    config.vm.provider 'virtualbox' do |v|
      v.name = 'Vagrant Hatjitsu'
      v.customize ['modifyvm', :id, '--memory', 512]
    end
  end
end
