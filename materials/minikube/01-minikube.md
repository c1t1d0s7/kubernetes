# minikube

## 1. 지원되는 Hypervisor

#### Linux
KVM(권장), VirtualBox 

#### macOS
HyperKit(권장), VirtualBox, VMware Fusion,

#### Windows
VirtualBox(권장), Hyper-V

## 2. (옵션/추천) 패키지 관리자 설치
### Windows
https://chocolatey.org/install
  * Windows 7+ / Windows Server 2003+
  * PowerShell v2+
  * .NET Framework 4+ 
```
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))
```

### macOS
https://brew.sh/index_ko
```
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install.sh)"
```

## 3. VirtualBox 설치
### 설치 파일 및 패키지 (Linux, macOS, Windows)
https://www.virtualbox.org/wiki/Downloads  


### Windows
```
choco install virtualbox virtualbox.extensionpack
```

### macOS
```
brew cask install virtualbox virtualbox-extension-pack
```

## 3. minikube 설치
설치 방법 참조  
https://kubernetes.io/docs/tasks/tools/install-minikube/

### 바이너리(Windows, macOS, Linux)
https://github.com/kubernetes/minikube/releases

### macOS 패키지 관리자
```
brew cask install minikube kubernetes-cli 
```

### Windows 패키지
```
choco install minikube kubernetes-cli
```

## 4. minikube 사용법
### minikube 최초 실행
```
minikube start --cpus 2 --memory 3072 --disk-size 30g --nodes 4 --vm-driver virtualbox 
```

- --cpus: CPU 개수 (기본 2)  
- --memory: 메모리 크기 (기본 2200MB)  
- --disk-size: 디스크 크기 (기본 20GB)  
- --nodes: 노드 개수 (기본 1)
- --driver: 하이퍼바이저 (virtualbox parallels vmwarefusion kvm hyperkit vmware none)

### minikube 상태확인
```
minikube status
```

### minikube 중지
```
minikube stop
```

### minikube 실행
```
minikube start
```

### minikube SSH 접속
```
minikube ssh
```

### minikube 삭제
```
minikube delete
```

## 5. minikube Addon 설치
Addon 관련 작업은 ```minikube start``` 상태에서만 가능

### Addon 목록 확인
```
minikube addons list
```

### 스토리지 관련 Addon 비활성화
```
minikube addons disable default-storageclass
```
```
minikube addons disable storage-provisioner
```

### Ingress, Metrics-Server 활성화
```
minikube addons enable ingress
```
```
minikube addons enable metrics-server
```

### MetalLB 활성화
```
minikube addons enable metallb
```
