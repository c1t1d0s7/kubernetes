# Kubernetes 로드밸런서 서비스를 위한 MetalLB 설치 with Minikube
[MetalLB 공식 사이트](https://metallb.universe.tf)

작성날짜: 2020년 05월 18일  

> 참고: 현재 최신버전인 0.9.x 버전은 minikube에 제대로 동작하지 않음

## 1. MetalLB Git 클론 (v0.8.3)
```
git clone --single-branch --branch v0.8.3 https://github.com/metallb/metallb.git
```

## 2. MetalLB 배포
```
kubectl create -f metallb/manifests/metallb.yaml
```

## 3. MetalLB 리소스 확인
```
kubectl -n metallb-system get all

NAME                              READY   STATUS    RESTARTS   AGE
pod/controller-5f98465b6b-sv4qf   1/1     Running   0          11m
pod/speaker-9bjb2                 1/1     Running   0          11m

NAME                     DESIRED   CURRENT   READY   UP-TO-DATE   AVAILABLE   NODE SELECTOR                 AGE
daemonset.apps/speaker   1         1         1       1            1           beta.kubernetes.io/os=linux   11m

NAME                         READY   UP-TO-DATE   AVAILABLE   AGE
deployment.apps/controller   1/1     1            1           11m

NAME                                    DESIRED   CURRENT   READY   AGE
replicaset.apps/controller-5f98465b6b   1         1         1       11m
```

## 4. MetalLB 컨피그맵 설정

### 로드밸런서에 부여할 IP 대역 설정

```
vi metallb/manifests/example-layer2-config.yaml
```
> example-layer2-config.yaml
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  namespace: metallb-system
  name: config
data:
  config: |
    address-pools:
    - name: my-ip-space
      protocol: layer2
      addresses:
      - 192.168.X.X/X
      - 192.168.X.X-192.168.X.X
```

> 참고: IP 대역은 Hypervisor에 따라 다르므로 ```minikube ip``` 명령으로 확인

```
kubectl create -f metallb/manifests/example-layer2-config.yaml
```