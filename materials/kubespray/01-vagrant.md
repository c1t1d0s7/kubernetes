# Vagrant 설치 및 사용법
[Vagrant 공식 사이트](https://www.vagrantup.com/)

작성날짜: 2018년 11월 30일  
업데이트: 2020년 05월 18일

## 1. 패키지 관리자 설치
- Windows
https://chocolatey.org/install
  * Windows 7+ / Windows Server 2003+
  * PowerShell v2+
  * .NET Framework 4+ 
```
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))
```

- macOS
https://brew.sh/index_ko
```
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install.sh)"
```

## 2. Vagrant 다운로드 및 설치
- 설치 파일 및 패키지  
https://www.vagrantup.com/downloads.html  

- Windows
```
choco install vagrant
```

- macOS
```
brew cask install vagrant
```

## 3. VirtualBox 다운로드 및 설치
- 설치 파일 및 패키지
https://www.virtualbox.org/wiki/Downloads  

- Windows
```
choco install virtualbox virtualbox.extensionpack
```

- macOS
```
brew cask install virtualbox virtualbox-extension-pack
```

## 4. Vagrant

### 플러그인 설치  
```
vagrant plugin install vagrant-hostmanager  
vagrant plugin install vagrant-disksize
```

```
vagrant plugin list
```

### Box 이미지 다운로드
```
vagrant box add ubuntu/bionic64
```

### Vagrant 파일
```
cd ~ 
mkdir kube
cd kube  
```

> 참고: 호스트 시스템의 사양에 따라 Master 및 Node 개수 및 리소스를 적절하게 할당  
> Master 최소 RAM 요구사항: 1536MB  
> Node 최소 RAM 요구사항: 1024MB  

Vagrantfile 파일 작성

> Vagrantfile
```Vagrant
# -*- mode: ruby -*-
# vi: set ft=ruby :

Vagrant.configure("2") do |config|
  config.vm.define "kube-master1" do |config|
    config.vm.box = "ubuntu/bionic64"
    config.vm.provider "virtualbox" do |vb|
      vb.name = "kube-master1"
      vb.cpus = 2
      vb.memory = 3072
    end
    config.vm.hostname = "kube-master1"
    config.vm.network "private_network", ip: "192.168.56.11"
    config.disksize.size = "30GB"
  end
  config.vm.define "kube-node1" do |config|
    config.vm.box = "ubuntu/bionic64"
    config.vm.provider "virtualbox" do |vb|
      vb.name = "kube-node1"
      vb.cpus = 2
      vb.memory = 3072
    end
    config.vm.hostname = "kube-node1"
    config.vm.network "private_network", ip: "192.168.56.21"
    config.disksize.size = "30GB"
  end
  config.vm.define "kube-node2" do |config|
    config.vm.box = "ubuntu/bionic64"
    config.vm.provider "virtualbox" do |vb|
      vb.name = "kube-node2"
      vb.cpus = 2
      vb.memory = 3072
    end
    config.vm.hostname = "kube-node2"
    config.vm.network "private_network", ip: "192.168.56.22"
    config.disksize.size = "30GB"
  end
  config.vm.define "kube-node3" do |config|
    config.vm.box = "ubuntu/bionic64"
    config.vm.provider "virtualbox" do |vb|
     vb.name = "kube-node3"
      vb.cpus = 2
      vb.memory = 3072
    end
    config.vm.hostname = "kube-node3"
    config.vm.network "private_network", ip: "192.168.56.23"
    config.disksize.size = "30GB"
  end

  # Hostmanager plugin
  config.hostmanager.enabled = true
  config.hostmanager.manage_guest = true

  # Enable SSH Password Authentication
  config.vm.provision "shell", inline: <<-SHELL
    sed -i 's/ChallengeResponseAuthentication no/ChallengeResponseAuthentication yes/g' /etc/ssh/sshd_config
    sed -i 's/archive.ubuntu.com/ftp.daum.net/g' /etc/apt/sources.list
    sed -i 's/security.ubuntu.com/ftp.daum.net/g' /etc/apt/sources.list
    systemctl restart ssh
  SHELL
end
```

| Master       | IP               | CPU | Memory | Disk |
|--------------|------------------|-----|--------|------|
| kube-master1 | 192.168.56.11/24 | 2   | 3072MB | 30G  |

| Node         | IP               | CPU | Memory | Disk |
|--------------|------------------|-----|--------|------|
| kube-node1   | 192.168.56.21/24 | 2   | 3072MB | 30G  |
| kube-node2   | 192.168.56.22/24 | 2   | 3072MB | 30G  |
| kube-node3   | 192.168.56.23/24 | 2   | 3072MB | 30G  |


### VM 배포
```
vagrant up
```

### VM 상태확인
```
vagrant status
```

### VM 접속
```
vagrant ssh kube-master1
```

### VM 종료
```
vagrant halt
```

## 5. Vagrant 사용법

상태확인  
```
vagrant status [VM]
```

시작  
```
vagrant up [VM]
```

일시중지  
```
vagrant suspend [VM]
```

재개
```
vagrant resume [VM]
```

중지  
```
vagrant halt [VM]
```

삭제  
```
vagrant destroy [VM]
```

SSH 연결
```
vagrant ssh [VM]
```
