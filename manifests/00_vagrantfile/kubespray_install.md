# Kubespray를 이용한 Production Ready Kubernetes 클러스터 배포
[Kubespray GitHub 저장소](https://github.com/kubernetes-sigs/kubespray)

작성날짜: 2018년 11월 30일  
업데이트: 2021년 08월 23일

> kubespray는 Kubernetes를 프로덕션 온프레미스에 설치할 수 있는 배포방법 (kubeadm 사용)  

## 0. On-Premise 노드 구성
OS: Ubuntu 20.04 LTS(Focal)

```markdown
| Node               | IP               | CPU | Memory | Additional Disk |
|--------------------|------------------|-----|--------|-----------------|
| kube-node1         | 192.168.56.21/24 | 2   | 4000MB | 10G             |
| kube-node2         | 192.168.56.22/24 | 2   | 4000MB | 10G             |
| kube-node3         | 192.168.56.23/24 | 2   | 4000MB | 10G             |
```

## 1. Requirements
* Ansible 2.9+, python-netaddr
* Jinja 2.11+
* 인터넷 연결(도커 이미지 가져오기)
* IPv4 포워딩
* SSH 키 복사
* 배포 중 문제가 발생하지 않도록 방화벽 비활성
* 적절한 권한 상승(non-root 사용자인 경우, passwordless sudo 설정)

* Control Plane
	* Memory: 1500MB
* Node
	* Memory: 1024MB

### 1-1. kube-node1(Control Plane)
* SSH 키 복사
```
ssh-keygen -f ~/.ssh/id_rsa -N ''
ssh-copy-id kube-node1  
ssh-copy-id kube-node2  
ssh-copy-id kube-node3  
```

> vagrant 이미지의 기본 사용자 vagrant, 기본 패스워드 vagrant   

* python3, pip, git 설치
```
sudo apt update  
sudo apt upgrade
sudo apt install -y python3 python3-pip git
```

## 2. Kubespray 배포

* 홈 디렉토리 이동
```
cd ~
```

* kubespray Git 저장소 클론
```
git clone --single-branch --branch release-2.15 https://github.com/kubernetes-sigs/kubespray.git  
```

* 디렉토리 변경
```
cd kubespray
```

* requirements.txt 파일에서 의존성 확인 및 설치
```
sudo pip3 install -r requirements.txt  
```

* 인벤토리 준비
```
cp -rfp inventory/sample inventory/mycluster  
```

* 인벤토리 수정
```
vi inventory/mycluster/inventory.ini
```

```
[all]  
kube-node1				ansible_host=192.168.56.21 ip=192.168.56.21 ansible_connection=local
kube-node2				ansible_host=192.168.56.22 ip=192.168.56.22
kube-node3				ansible_host=192.168.56.23 ip=192.168.56.23

[kube-master]  
kube-node1  

[etcd]  
kube-node1  

[kube-node]  
kube-node1  
kube-node2
kube-node3  

[calico-rr]  

[k8s-cluster:children]  
kube-master  
kube-node  
calico-rr
```

* 파라미터 확인 및 변경
```
vi inventory/mycluster/group_vars/k8s-cluster/addons.yml
```

```
metrics_server_enabled: true
ingress_nginx_enabled: true
metallb_enabled: true
metallb_ip_range:
  - "192.168.56.200-192.168.56.209"
metallb_protocol: "layer2"
```

```
vi inventory/mycluster/group_vars/k8s-cluster/k8s-cluster.yml
```

```
kube_proxy_strict_arp: true
```

* Ansible 통신 가능 확인
```
ansible all -i inventory/mycluster/inventory.ini -m ping

kube-node1 | SUCCESS => {
    "changed": false,
    "ping": "pong"
}
kube-node3 | SUCCESS => {
    "changed": false,
    "ping": "pong"
}
kube-node2 | SUCCESS => {
    "changed": false,
    "ping": "pong"
}
```

* Apt 캐시 업데이트 (모든 노드)
```
ansible all -i inventory/mycluster/inventory.ini -m apt -a 'update_cache=yes' --become

kube-node1 | CHANGED => {
    "cache_update_time": 1584068827,
    "cache_updated": true,
    "changed": true
}
kube-node3 | CHANGED => {
    "cache_update_time": 1584068826,
    "cache_updated": true,
    "changed": true
}
kube-node2 | CHANGED => {
    "cache_update_time": 1584068826,
    "cache_updated": true,
    "changed": true
}
```

* 플레이북 실행
```
ansible-playbook -i inventory/mycluster/inventory.ini cluster.yml --become
```

> 호스트 시스템 사양, VM 개수, VM 리소스 및 네트워크 성능에 따라 8~15분 소요  

* 자격증명 가져오기
```
mkdir ~/.kube
sudo cp /etc/kubernetes/admin.conf ~/.kube/config
sudo chown $USER:$USER ~/.kube/config
```

* kubectl 명령 자동완성
```
kubectl completion bash | sudo tee /etc/bash_completion.d/kubectl
exec bash
```

* Kubernetes 클러스터 확인
```
kubectl get nodes
kubectl cluster-info
```
