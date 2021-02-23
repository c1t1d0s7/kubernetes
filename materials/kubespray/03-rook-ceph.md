# Rook을 이용한 Kubernetes 클러스터에 Ceph 클라우드 네이티브 스토리지 배포
[Rook 공식 사이트](https://rook.io)

작성날짜: 2020년 03월 13일  
수정날짜: 2021년 01월 27일

## 0. 스토리지 준비
Rook-Ceph 스토리지 클러스터는, 파티션 또는 파일시스템이 없는 원시 디스크가 하나 이상 있어야 함
```
lsblk -f

NAME   FSTYPE  LABEL           UUID                                 MOUNTPOINT
sda
`-sda1 ext4    cloudimg-rootfs 5cb7859d-99c9-43b9-b314-48b4f32d6741 /
sdb    iso9660 cidata          2021-02-22-16-10-05-00
sdc
```

## 1. Git 저장소 클론
```
cd ~
```
```
git clone --single-branch --branch release-1.5 https://github.com/rook/rook.git
```

## 2. Rook Operator 배포
```
cd ~/rook/cluster/examples/kubernetes/ceph
```

- operator.yaml: 일반적인 프로덕션 환경에서 배포
- operator-openshift.yaml: OpenShift 환경에서 Rook 클러스터 배포

```
kubectl create -f crds.yaml -f common.yaml -f operator.yaml
```

```
kubectl -n rook-ceph get pod
```
> rook-ceph-operator 파드가 running 상태가 될 때 까지 확인


## 3. Rook Ceph 클러스터 배포
- cluster.yaml: 베어메탈 프로덕션 환경의 스토리지 클러스터
- cluster-on-pvc.yaml: 클라우드 프로덕션 환경의 스토리지 클러스터
- cluster-test.yaml: 중복이 필요하지 않은 환경의 테스트 클러스터(단일 노드만 필요)

```
kubectl create -f cluster.yaml
```

## 4. Rook Ceph 클러스터 파드 확인
```
kubectl -n rook-ceph get pod

NAME                                                   READY   STATUS      RESTARTS   AGE
csi-cephfsplugin-8n5bl                                 3/3     Running     0          10m
csi-cephfsplugin-l4rj2                                 3/3     Running     0          10m
csi-cephfsplugin-provisioner-5c5df9d8b5-gz8xg          6/6     Running     0          10m
csi-cephfsplugin-provisioner-5c5df9d8b5-r25cm          6/6     Running     0          10m
csi-cephfsplugin-r69bb                                 3/3     Running     0          10m
csi-rbdplugin-8qdkl                                    3/3     Running     0          10m
csi-rbdplugin-9hmlc                                    3/3     Running     0          10m
csi-rbdplugin-provisioner-7db86459f7-75c4t             6/6     Running     0          10m
csi-rbdplugin-provisioner-7db86459f7-dl8tx             6/6     Running     0          10m
csi-rbdplugin-rvsmf                                    3/3     Running     0          10m
rook-ceph-crashcollector-kube-node1-6dd5d96b78-m9kgs   1/1     Running     0          62s
rook-ceph-crashcollector-kube-node2-7b6b849965-qbgm7   1/1     Running     0          2m27s
rook-ceph-crashcollector-kube-node3-86844d89b4-wdp5s   1/1     Running     0          8m33s
rook-ceph-mgr-a-5bf5d898b-c722t                        1/1     Running     0          72s
rook-ceph-mon-a-6c975d9f56-g65s9                       1/1     Running     0          8m33s
rook-ceph-mon-b-8546cfbb54-w82hp                       1/1     Running     0          2m39s
rook-ceph-mon-c-b4bf6865c-47nvc                        1/1     Running     0          2m27s
rook-ceph-operator-6b78f9c58c-tf5vv                    1/1     Running     0          17m
rook-ceph-osd-0-76b5fd995d-4pjgq                       1/1     Running     0          64s
rook-ceph-osd-1-b585498f-lxn2c                         1/1     Running     0          62s
rook-ceph-osd-2-69b6998f66-td49t                       1/1     Running     0          62s
rook-ceph-osd-prepare-kube-node1-gqp6w                 0/1     Completed   0          72s
rook-ceph-osd-prepare-kube-node2-8mpff                 0/1     Completed   0          72s
rook-ceph-osd-prepare-kube-node3-tl8cc                 0/1     Completed   0          72s
rook-discover-jcv5m                                    1/1     Running     0          16m
rook-discover-ldsdp                                    1/1     Running     0          16m
rook-discover-r8bqg                                    1/1     Running     0          16m
```

핵심 리소스 확인:
- rook-ceph-mgr-a-*
- rook-ceph-mon-a-*
- rook-ceph-mon-b-*
- rook-ceph-mon-c-*
- rook-ceph-osd-0-*
- rook-ceph-osd-1-*
- rook-ceph-osd-2-*

## (옵션) 5. Rook Toolbox
- Rook Toolbox: Ceph 클러스터 명령 도구 모음
- Ceph 클러스터 상태 등을 확인 할 수 있음

### Rook Toolbox 배포
```
kubectl create -f toolbox.yaml
```

### 확인
```
kubectl -n rook-ceph rollout status deploy/rook-ceph-tools
```

### 클러스터 상태 확인
```
kubectl -n rook-ceph exec -it deploy/rook-ceph-tools -- ceph status
```
> HEALTH_OK 확인
> 간혹 clock skew에 의해 HEALTH_WARN 보고됨 -> NTP 시간 동기화

### (옵션) Rook Toolbox 삭제
```
kubectl -n rook-ceph delete deploy/rook-ceph-tools
```

## 6. RBD 스토리지 노출
- storageclass.yaml: 프로덕션 환경에서 3개의 복제본 구성 (3개의 노드 필요)
- storageclass-ec.yaml: 2+1의 EC(Erasure Coding) 구성 (3개의 노드 필요)
- storageclass-test.yaml: 테스트 환경으로 1개의 복제본으로 구성 (단일 노드만 필요)

### RBD 스토리지 클래스 생성
```
kubectl create -f csi/rbd/storageclass.yaml
```

### RBD 스토리지 클래스 확인
```
kubectl get storageclasses.storage.k8s.io
```

### (옵션) RBD 볼륨 테스트 리소스 생성
```
kubectl create -f csi/rbd/pod.yaml -f csi/rbd/pvc.yaml
```

### (옵션) RBD 볼륨 확인
```
kubectl get po,pv,pvc
```

### (옵션) RBD 볼륨 테스트 리소스 삭제
```
kubectl delete -f csi/rbd/pod.yaml -f csi/rbd/pvc.yaml
```

## 7. CephFS 파일시스템
- filesystem.yaml: 프로덕션 환경에서 3개의 복제본 구성 (3개의 노드 필요)
- filesystem-ec.yaml: 2+1의 EC(Erasure Coding) 구성 (3개의 노드 필요)
- filesystem-test.yaml: 테스트 환경으로 1개의 복제본으로 구성 (단일 노드만 필요)

### CephFS 파일시스템 생성
* Metadata Pool
* Data Pool 생성
```
kubectl create -f filesystem.yaml
```

### CephFS 파일시스템 확인
```
kubectl -n rook-ceph get pod -l app=rook-ceph-mds
```
리소스 확인:
- rook-ceph-mds-myfs-a-*
- rook-ceph-mds-myfs-b-*

### CephFS 스토리지 클래스 생성
```
kubectl create -f csi/cephfs/storageclass.yaml
```

### CephFS 스토리지 클래스 확인
```
kubectl get storageclasses.storage.k8s.io
```

### (옵션) CephFS 파일시스템 테스트 리소스 생성
```
kubectl create -f csi/cephfs/pod.yaml -f csi/cephfs/pvc.yaml
```

### (옵션)CephFS 파일시스템 확인
```
kubectl get po,pv,pvc
```

### (옵션)CephFS 파일시스템 테스트 리소스 삭제
```
kubectl delete -f csi/cephfs/pod.yaml -f csi/cephfs/pvc.yaml
```

## 8. 기본 스토리지 클래스 설정

### 스토리지 클래스 확인
```
kubectl get storageclasses.storage.k8s.io

NAME              PROVISIONER                     RECLAIMPOLICY   VOLUMEBINDINGMODE   ALLOWVOLUMEEXPANSION   AGE
rook-ceph-block   rook-ceph.rbd.csi.ceph.com      Delete          Immediate           true                   4m1s
rook-cephfs       rook-ceph.cephfs.csi.ceph.com   Delete          Immediate           true                   91s
```

- rook-ceph-block: RBD 블록 스토리지
- rook-cephfs: CephFS 파일 스토리지

### 기본 스토리지 클래스 설정
```
kubectl patch storageclasses.storage.k8s.io rook-ceph-block \
-p '{"metadata": {"annotations":{"storageclass.kubernetes.io/is-default-class":"true"}}}'
```

```
kubectl get storageclasses.storage.k8s.io

NAME                        PROVISIONER                     RECLAIMPOLICY   VOLUMEBINDINGMODE   ALLOWVOLUMEEXPANSION   AGE
rook-ceph-block (default)   rook-ceph.rbd.csi.ceph.com      Delete          Immediate           true                   8m16s
rook-cephfs                 rook-ceph.cephfs.csi.ceph.com   Delete          Immediate           true                   5m46s
```
