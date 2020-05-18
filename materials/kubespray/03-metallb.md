# Kubernetes 로드밸런서 서비스를 위한 MetalLB 설치
[MetalLB 공식 사이트](https://metallb.universe.tf)

작성날짜: 2020년 03월 13일  

## 1. 디렉토리 변경
```
cd ~/kubespray
```

## 2. Kubernetes 클러스터 설정 변경 - 
```
vi inventory/mycluster/group_vars/k8s-cluster/k8s-cluster.yml

kube_proxy_strict_arp: true
```

## 3. 로드밸런서에 할당할 IP 범위 설정
```
vi contrib/metallb/roles/provision/defaults/main.yml

  ip_range: "192.168.56.200-192.168.56.220"
```

## 4. MetalLB 설치
```
ansible-playbook -i inventory/mycluster/inventory.ini contrib/metallb/metallb.yml -b
```

## 5. MetalLB 네임스페이스 확인
```
kubectl get ns
```

## 6. MetalLB 네임스페이스의 리소스 확인
```
kubectl get all -n metallb-system

NAME                             READY   STATUS    RESTARTS   AGE
pod/controller-c89789d9d-twqww   1/1     Running   0          5m15s
pod/speaker-4bmx9                1/1     Running   0          12m
pod/speaker-qgpf9                1/1     Running   0          12m
pod/speaker-xdk4t                1/1     Running   0          12m

NAME                     DESIRED   CURRENT   READY   UP-TO-DATE   AVAILABLE   NODE SELECTOR   AGE
daemonset.apps/speaker   3         3         3       3            3           <none>          12m

NAME                         READY   UP-TO-DATE   AVAILABLE   AGE
deployment.apps/controller   1/1     1            1           12m

NAME                                   DESIRED   CURRENT   READY   AGE
replicaset.apps/controller-c89789d9d   1         1         1       12m
```
