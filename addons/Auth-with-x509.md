# x.509 기반 사용자 인증

## x.509 인증서 개요
CA 개인키      -->   CA 인증요청서      --> CA 인증서  
Client 개인키  -->   Client 인증요청서

CA 개인키 + CA 인증서 + Client 인증요청서 => Client 인증서

## 클라이언트 개인키 생성 
```bash
openssl genrsa -out testuser.key 2048
```

## 클라이언트 인증서 서명 요청서(CSR: Certificate Signing Request)
```bash
openssl req -new -key testuser.key -out testuser.csr -subj "/O=devops/CN=testuser"
```

> CSR의 CN 및 O 속성을 설정하는 것이 중요
> CN은 사용자의 이름이고 O는 사용자가 속할 그룹

## CSR 리소스 작성
```bash
vi testuser-csr.yaml
```
```yaml
apiVersion: certificates.k8s.io/v1
kind: CertificateSigningRequest
metadata:
  name: testuser
spec:
  groups:
  - system:authenticated
  request: <BASE64 인코딩 값>
  signerName: kubernetes.io/kube-apiserver-client
  usages:
  - client auth
```

> CSR의 BASE64 인코딩 값은 다음 명령어로 확인  
> ```cat testuser.csr | base64 | tr -d "\n"```

### CSR 리소스 생성
```bash
kubectl create -f testuser-csr.yaml
```

### CSR 리소스 확인
```bash
kubectl get csr

NAME        AGE   SIGNERNAME                                    REQUESTOR              CONDITION
...
john        2s    kubernetes.io/kubelet-serving                 minikube-user          Pending
```

### CSR 승인
```bash
kubectl certificate approve testuser
```

### CSR 리소스 확인
```bash
kubectl get csr

NAME        AGE   SIGNERNAME                                    REQUESTOR              CONDITION
...
john        21s   kubernetes.io/kube-apiserver-client           minikube-user          Approved,Issued
```

### 발급된 인증서 확인
```bash
kubectl get csr testuser -o yaml

...
status:
  certificate: LS0tLS1CRUdJTi...
...
```

### 인증서 저장
```bash
kubectl get csr testuser -o jsonpath='{.status.certificate}' | base64 -D > testuser.crt
```

### 인증서 서명 확인
```bash
openssl x509 -in testuser.crt -text

...
        Issuer: CN=minikubeCA
...
```

### 테스트 역할(Role) 생성
```bash
vi role-developer.yaml
```
```yaml
kind: Role
apiVersion: rbac.authorization.k8s.io/v1
metadata:
  namespace: default
  name: developer
rules:
- apiGroups:
  - ""
  resources:
  - pods
  verbs:
  - create
  - get
  - list
  - update
  - delete
```

```bash
kubectl create -f role-developer.yaml
```
또는
```bash
kubectl create role developer --verb=create --verb=get --verb=list --verb=update --verb=delete --resource=pods
```

### 테스트 롤바인딩(RoleBinding) 생성
```bash
vi rolebinding-testuser.yaml
```
```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: developer-binding-testuser
  namespace: default
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: Role
  name: developer
subjects:
- apiGroup: rbac.authorization.k8s.io
  kind: User
  name: testuser
```
```bash
kubectl create -f rolebinding-testuser.yaml
```
또는
```bash
kubectl create rolebinding developer-binding-testuser --role=developer --user=testuser
```

### 인증 테스트/확인
```bash
kubectl get po --client-certificate testuser.crt --client-key testuser.key
```

### KubeConfig 자격증명 생성
```bash
kubectl config set-credentials testuser --client-key=testuser.key --client-certificate=testuser.crt --embed-certs=true
```

### KubeConfig 컨텍스트 생성
```bash
kubectl config set-context testuser --cluster=minikube --user=testuser
```

### KubeConfig 컨텍스트 확인
```bash
kubectl config get-contexts
```

### KubeConfig 컨텍스트 사용
```bash
kubectl config use-context testuser
```

### 테스트/확인
```bash
kubectl get no

Error from server (Forbidden): nodes is forbidden: User "testuser" cannot list resource "nodes" in API group "" at the cluster scope
```

```bash
kubectl get po
No resources found in default namespace.
```



