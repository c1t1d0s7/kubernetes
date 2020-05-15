# Spinnaker

# 4. Helm을 이용한 Spinnaker 설치

> 경고  
> 20.05.15일 현재 오류 발생
> 테스트 환경 OCI 1.15.7

```
kubectl create ns spinnaker
```

```
kubectl create secret generic --from-file=$HOME/.kube/config my-kubeconfig -n spinnaker
```

```
kubectl config get-contexts
```

```
helm show values stable/spinnaker
```

> spinnaker-value.yaml
```
kubeConfig:
  enabled: true
  secretName: my-kubeconfig
  secretKey: config
  contexts:
  - context-c3gkzjyhezt
  deploymentContext: context-c3gkzjyhezt

dockerRegistries:
- name: dockerhub
  address: index.docker.io
  repositories:
    - c1t1d0s7/build-test
```

```
helm install spinnaker --namespace spinnaker --timeout 20m -f spinnaker-value.yaml stable/spinnaker
```
