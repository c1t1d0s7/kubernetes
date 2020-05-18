# Rook을 이용한 Kubernetes 클러스터에 Ceph 클라우드 네이티브 스토리지 배포
[Rook 공식 사이트](https://rook.io)

작성날짜: 2020년 03월 13일  
수정날짜: 2020년 03월 15일

## 1. Git 저장소 클론
```
cd ~
```
```
git clone --single-branch --branch release-1.2 https://github.com/rook/rook.git
```

## 2. Rook 일반 리소스 배포
```
cd ~/rook/cluster/examples/kubernetes/ceph
```

```
kubectl create -f common.yaml
```

## 3. Rook Operator 배포
- operator.yaml: 일반적인 프로덕션 환경에서 배포
- operator-openshift.yaml: OpenShift 환경에서 Rook 클러스터 배포
```
kubectl create -f operator.yaml
```

```
kubectl -n rook-ceph get pod
```
rook-ceph-operator 파드가 running 상태가 될 때 까지 기다림

## 3. Rook Ceph 클러스터 CRD(Custom Resource Definitions) 배포
- cluster.yaml: 일반적인 프로덕션 환경의 스토리지 클러스터(최소 3개 노드 필요)
- cluster-test.yaml: 중복이 필요하지 않은 환경의 테스트 클러스터(단일 노드만 필요)
- cluster-minimal.yaml: 하나의 ceph-mon 및 ceph-mgr로 구성된 최소 한의 클러스터
```
kubectl create -f cluster-test.yaml
```

## 4. Rook Ceph 클러스터 확인
```
kubectl -n rook-ceph get pod

NAME                                   READY   STATUS      RESTARTS   AGE
rook-ceph-agent-4zkg8                  1/1     Running     0          140s
rook-ceph-mgr-a-d9dcf5748-5s9ft        1/1     Running     0          77s
rook-ceph-mon-a-7d8f675889-nw5pl       1/1     Running     0          105s
rook-ceph-mon-b-856fdd5cb9-5h2qk       1/1     Running     0          94s
rook-ceph-mon-c-57545897fc-j576h       1/1     Running     0          85s
rook-ceph-operator-6c49994c4f-9csfz    1/1     Running     0          141s
rook-ceph-osd-0-7cbbbf749f-j8fsd       1/1     Running     0          23s
rook-ceph-osd-1-7f67f9646d-44p7v       1/1     Running     0          24s
rook-ceph-osd-2-6cd4b776ff-v4d68       1/1     Running     0          25s
rook-ceph-osd-prepare-node1-vx2rz      0/2     Completed   0          60s
rook-ceph-osd-prepare-node2-ab3fd      0/2     Completed   0          60s
rook-ceph-osd-prepare-node3-w4xyz      0/2     Completed   0          60s
rook-discover-dhkb8                    1/1     Running     0          140s
```

## (옵션) 5. Rook Toolbox 
- Rook Toolbox: Ceph 클러스터 명령 도구 모음
- Ceph 클러스터 상태 등을 확인 할 수 있음

### Rook Toolbox 배포
```
kubectl create -f toolbox.yaml
```

### 확인
```
kubectl -n rook-ceph get pod -l "app=rook-ceph-tools"
```

### 접속
```
kubectl -n rook-ceph exec -it $(kubectl -n rook-ceph get pod -l "app=rook-ceph-tools" -o jsonpath='{.items[0].metadata.name}') bash
```

### Rook Toolbox 삭제
```
kubectl -n rook-ceph delete deployment rook-ceph-tools
```

## 6. RBD 스토리지 노출
- storageclass.yaml: 프로덕션 환경에서 3개의 복제본 구성 (3개의 노드 필요)
- storageclass-ec.yaml: 2+1의 EC(Erasure Coding) 구성 (3개의 노드 필요)
- storageclass-test.yaml: 테스트 환경으로 1개의 복제본으로 구성 (단일 노드만 필요)

### RBD 스토리지 클래스 생성
```
kubectl create -f csi/rbd/storageclass-test.yaml
```

### RBD 스토리지 클래스 확인
```
kubectl get storageclasses.storage.k8s.io
```

### RBD 볼륨 테스트 리소스 생성
```
kubectl create -f csi/rbd/pod.yaml -f csi/rbd/pvc.yaml
```

### RBD 볼륨 확인
```
kubectl get po,pv,pvc
```

### RBD 볼륨 테스트 리소스 삭제
```
kubectl delete -f csi/rbd/pod.yaml -f csi/rbd/pvc.yaml
```

## 7. CephFS 파일시스템 노출
- filesystem.yaml: 프로덕션 환경에서 3개의 복제본 구성 (3개의 노드 필요)
- filesystem-ec.yaml: 2+1의 EC(Erasure Coding) 구성 (3개의 노드 필요)
- filesystem-test.yaml: 테스트 환경으로 1개의 복제본으로 구성 (단일 노드만 필요)

### CephFS 파일시스템 생성
- Metadata Pool
- Data Pool 생성
```
kubectl create -f filesystem-test.yaml
```

### CephFS 파일시스템 확인
```
kubectl -n rook-ceph get pod -l app=rook-ceph-mds
```

### CephFS 스토리지 클래스 생성
```
kubectl create -f csi/cephfs/storageclass.yaml
```

### CephFS 스토리지 클래스 확인
```
kubectl get storageclasses.storage.k8s.io
```

### CephFS 파일시스템 테스트 리소스 생성
```
kubectl create -f csi/cephfs/pod.yaml -f csi/cephfs/pvc.yaml
```

### CephFS 파일시스템 확인
```
kubectl get po,pv,pvc
```

### CephFS 파일시스템 테스트 리소스 삭제
```
kubectl delete -f csi/cephfs/pod.yaml -f csi/cephfs/pvc.yaml
```
