eksctl로 Amazon EKS 클러스터 배포 및 사용
------------------------------------

작성일자: 2020-07-31
수정일자: YYYY-MM-DD

# 0. eksctl 이란?
AWS CloudFormation을 이용하여 Amazon EKS를 배포 및 관리하는 도구

# 1. IAM 사용자 및 정책 구성
## 1) EKS용 IAM 사용자 생성
IAM --> 사용자 --> 사용자 추가
- 사용자 이름: eks-admin
- 액세스 유형: 프로그래밍 방식 액세스
그룹 생성
- 그룹 이름: eks-administrators
- 정책: 없음
사용자 만들기
- 액세스 키: XXX
- 비밀 액세스 키: XXX

## 2) EKS용 최소 IAM 정책 생성
> 참고: https://eksctl.io/usage/minimum-iam-policies/

### AmazonEC2FullAccess (이미 존재함)
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Action": "ec2:*",
            "Effect": "Allow",
            "Resource": "*"
        },
        {
            "Effect": "Allow",
            "Action": "elasticloadbalancing:*",
            "Resource": "*"
        },
        {
            "Effect": "Allow",
            "Action": "cloudwatch:*",
            "Resource": "*"
        },
        {
            "Effect": "Allow",
            "Action": "autoscaling:*",
            "Resource": "*"
        },
        {
            "Effect": "Allow",
            "Action": "iam:CreateServiceLinkedRole",
            "Resource": "*",
            "Condition": {
                "StringEquals": {
                    "iam:AWSServiceName": [
                        "autoscaling.amazonaws.com",
                        "ec2scheduled.amazonaws.com",
                        "elasticloadbalancing.amazonaws.com",
                        "eks.amazonaws.com",
                        "spot.amazonaws.com",
                        "spotfleet.amazonaws.com",
                        "transitgateway.amazonaws.com"
                    ]
                }
            }
        }
    ]
}
```

### AWSCloudFormationFullAccess (이미 존재함)
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "cloudformation:*"
            ],
            "Resource": "*"
        }
    ]
}
```

### EksAllAccess (생성)
[ACCOUNT-ID]에 eks-admin 사용자 지정
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": "eks:*",
            "Resource": "*"
        },
        {
            "Action": [
                "ssm:GetParameter",
                "ssm:GetParameters"
            ],
            "Resource": [
                "arn:aws:ssm:*:[ACCOUNT-ID]:parameter/aws/*",
                "arn:aws:ssm:*::parameter/aws/*"
            ],
            "Effect": "Allow"
        },
        {
             "Action": [
               "kms:CreateGrant",
               "kms:DescribeKey"
             ],
             "Resource": "*",
             "Effect": "Allow"
        }
    ]
}
```

### IamLimitedAccess (생성)
[ACCOUNT-ID]에 eks-admin 사용자 지정
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "iam:CreateInstanceProfile",
                "iam:DeleteInstanceProfile",
                "iam:GetInstanceProfile",
                "iam:RemoveRoleFromInstanceProfile",
                "iam:GetRole",
                "iam:CreateRole",
                "iam:DeleteRole",
                "iam:AttachRolePolicy",
                "iam:PutRolePolicy",
                "iam:ListInstanceProfiles",
                "iam:AddRoleToInstanceProfile",
                "iam:ListInstanceProfilesForRole",
                "iam:PassRole",
                "iam:DetachRolePolicy",
                "iam:DeleteRolePolicy",
                "iam:GetRolePolicy",
                "iam:GetOpenIDConnectProvider",
                "iam:CreateOpenIDConnectProvider",
                "iam:DeleteOpenIDConnectProvider",
                "iam:ListAttachedRolePolicies",
                "iam:TagRole"
            ],
            "Resource": [
                "arn:aws:iam::[ACCOUNT-ID]:instance-profile/eksctl-*",
                "arn:aws:iam::[ACCOUNT-ID]:role/eksctl-*",
                "arn:aws:iam::[ACCOUNT-ID]:oidc-provider/*",
                "arn:aws:iam::[ACCOUNT-ID]:role/aws-service-role/eks-nodegroup.amazonaws.com/AWSServiceRoleForAmazonEKSNodegroup",
                "arn:aws:iam::[ACCOUNT-ID]:role/eksctl-managed-*"
            ]
        },
        {
            "Effect": "Allow",
            "Action": [
                "iam:GetRole"
            ],
            "Resource": [
                "arn:aws:iam::[ACCOUNT-ID]:role/*"
            ]
        }
    ]
}

### 정책생성
IAM --> 정책 --> 정책 생성 --> JSON

### 사용자 ID 확인
사용자 ID는 IAM --> 사용자 --> 사용자 이름
- 사용자 ARN: arn:aws:iam::123456789012:user/eks-admin
- 사용자 ID: 123456789012

또는 AWS 자격증명이 설정이 완료된 상태에서 다음 명령을 실행
```shell
aws sts get-caller-identity
```

## 3) eks-administrators 그룹에 정책 연결
연결할 정책
- AmazonEC2FullAccess
- AWSCloudFormationFullAccess
- EksAllAccess
- IamLimitedAccess

IAM --> 그룹 --> eks-administrators --> 권한 --> 정책 연결

# 2. 명령줄 유틸리티 설치

## 1) aws
### (1) macOS
#### 패키지
```shell
curl "https://awscli.amazonaws.com/AWSCLIV2.pkg" -o "AWSCLIV2.pkg"
sudo installer -pkg AWSCLIV2.pkg -target /
```

#### Homebrew
```shell
brew install awscli
```

### (2) Linux
```shell
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
```
```shell
sudo ./aws/install
```

### (3) Windows

#### 설치파일
https://awscli.amazonaws.com/AWSCLIV2.msi 파일 설치
C:\Program Files\Amazon\AWSCLIV2에 설치됨

#### Chocolatey
```powershell
choco install awscli
```

### (4) 확인
```shell
aws --version
```

## 2) eksctl

### (1) macOS
```shell
brew install eksctl
```

### (2) Linux
```shell
curl --silent --location "https://github.com/weaveworks/eksctl/releases/latest/download/eksctl_$(uname -s)_amd64.tar.gz" | tar xz -C /tmp
```
```shell
sudo mv /tmp/eksctl /usr/local/bin
```

### (3) Windows
```powershell
choco install eksctl
```

### (4) 확인
```shell
eksctl version
```

## 3) kubectl

### (1) macOS
```shell
brew install kubernetes-cli
```

### (2) Linux
```shell
curl -o kubectl https://amazon-eks.s3.us-west-2.amazonaws.com/1.17.7/2020-07-08/bin/linux/amd64/kubectl
```
```shell
chmod +x ./kubectl
```
```shell
sudo mv ./kubectl /usr/local/bin
```


### (3) Windows
```powershell
choco install kubernetes-cli
```

### (4) 확인
```shell
kubectl version --short --client
```

# 3. Kubernetes 클러스터 생성

## 1) AWS 자격증명
```shell
aws configure
AWS Access Key ID [None]: XXX
AWS Secret Access Key [None]: XXX
Default region name [None]: ap-northeast-2
Default output format [None]: json
```

## 2) SSH 키 쌍 생성
```shell
ssh-keygen -f aws-eks -N ''
```

## 3) eksctl로 Kubernetes 클러스터 생성

### (1) 생성
```shell
eksctl create cluster \
--name eks-test \
--version 1.16 \
--nodegroup-name standard-workers \
--node-type t3.medium \
--nodes 3 \
--nodes-min 1 \
--nodes-max 3 \
--ssh-access \
--ssh-public-key aws-eks.pub \
--managed
```
- --name: 클러스터 이름
- --version: Kubernetes 버전
- --node-type: 인스턴스 타입
- --nodes: 워커 노드 개수
- --ssh-public-key: SSH 퍼블릭 키 파일

### (2) 출력(성공)
Kubernetes 클러스터 생성에 약 15분 소요
```shell
...
[✔]  saved kubeconfig as "/home/aws/.kube/config"
...
[✔]  all EKS cluster resources for "eks-test" have been created
...
[✔]  EKS cluster "eks-test" in "ap-northeast-2" region is ready

```

### (3) 확인
```shell
kubectl get nodes

NAME                                                STATUS   ROLES    AGE    VERSION
ip-192-168-30-190.ap-northeast-2.compute.internal   Ready    <none>   99s    v1.16.13-eks-2ba888
ip-192-168-33-91.ap-northeast-2.compute.internal    Ready    <none>   101s   v1.16.13-eks-2ba888
ip-192-168-66-241.ap-northeast-2.compute.internal   Ready    <none>   101s   v1.16.13-eks-2ba888
```

# 4. 추가 구성

## 1) Metrics Server 구성
```shell
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/download/v0.3.6/components.yaml
```
```shell
kubectl get deployment metrics-server -n kube-system

NAME             READY   UP-TO-DATE   AVAILABLE   AGE
metrics-server   1/1     1            1           53s
```

## 2) ALB 기반의 Ingress Controller 구성

### (1) VPC 태그 구성
ALB가 사용할 VPC를 구별하기 위해 태그를 설정
> 참고: eksctl로 배포한 경우 이미 설정되어 있음

- Kubernetes에서 사용하는 VPC의 모든 서브넷
  - 키: kubernetes.io/cluster/<cluster-name>
  - 값: shared
- 외부 로드밸런서가 사용할 VPC의 퍼블릭 서브넷
  - 키: kubernetes.io/role/elb
  - 값: 1
- 내부 로드밸런서가 사용할 VPC의 프라이빗 서브넷
  - 키: kubernetes.io/role/internal-elb
  - 값: 1

### (2) OIDC(OpenID Connect)를 Kubernetes 클러스터에 허용
사용자 대신 ALB Ingress Controller가 AWS API를 호출하기 위함
```shell
eksctl utils associate-iam-oidc-provider \
    --cluster eks-test \ 
    --approve

[✔]  created IAM Open ID Connect provider for cluster "eks-test" in "ap-northeast-2"
```

### (3) ALB가 AWS API를 호출하기 위한 정책 문서 다운로드
```shell
curl -o iam-policy.json https://raw.githubusercontent.com/kubernetes-sigs/aws-alb-ingress-controller/v1.1.8/docs/examples/iam-policy.json
```

### (4) ALBIngressControllerIAMPolicy 정책 생성

#### 정책 생성
```shell
aws iam create-policy \
    --policy-name ALBIngressControllerIAMPolicy \
    --policy-document file://iam-policy.json
```

#### 출력(오류)
eksctl 최소 정책만 부여한 경우 정책 생성(CreatePolicy) 권한이 없어 오류 발생
```
An error occurred (AccessDenied) when calling the CreatePolicy operation: User: arn:aws:iam::123456789012:user/eks-admin is not authorized to perform: iam:CreatePolicy on resource: policy ALBIngressControllerIAMPolicy
```

#### 대안
권한이 있는 사용자로  
AWS 관리 콘솔 --> IAM --> 정책 --> 정책 생성

#### ARN 확인
정책의 ARN을 확인 및 기록

### (5) Ingress를 위한 RBAC 구성
```shell
kubectl apply -f https://raw.githubusercontent.com/kubernetes-sigs/aws-alb-ingress-controller/v1.1.8/docs/examples/rbac-role.yaml
```
alb-ingress-controller 서비스 게정, 클러스터 롤, 클러스터 롤 바인딩을 생성

### (6) IAM 역할 생성 및 서비스 계정 연결
ALB Ingress Controller를 위한 IAM 역할 생성 및 alb-ingress-controller 서비스 계정 연결

```shell
eksctl create iamserviceaccount \
    --name alb-ingress-controller \
    --namespace kube-system \
    --cluster eks-test \
    --attach-policy-arn <POLICY-ARN> \
    --override-existing-serviceaccounts \
    --approve
```
- <POLICY-ARN>에 ALBIngressControllerIAMPolicy 정책의 ARN을 입력

### (7) ALB Ingress Controller 배포

#### Ingress Controller 배포
```shell
kubectl apply -f https://raw.githubusercontent.com/kubernetes-sigs/aws-alb-ingress-controller/v1.1.8/docs/examples/alb-ingress-controller.yaml
```

#### Ingress Controller 디플로이먼트 리소스 수정
```shell
kubectl edit deployment.apps/alb-ingress-controller -n kube-system
```
```yaml
    spec:
      containers:
      - args:
        - --ingress-class=alb
        - --cluster-name=eks-test
        - --aws-vpc-id=vpc-052586dc67242d4ec
        - --aws-region=ap-northeast-2

```
ingress-class 속성 다음에 다음을 추가
- --cluster-name: 클러스터이름
- --aws-vpc-id: Kubernetes용 VPC ID
- --aws-region: Kubernetes가 배포된 리전 코드

#### Ingress Controller 리소스 확인
```shell
kubectl get deployments.apps alb-ingress-controller -n kube-system

NAME                     READY   UP-TO-DATE   AVAILABLE   AGE
alb-ingress-controller   1/1     1            1           9m49s
```

# 5. Amazon EKS에서 리소스 별 특징

## 1) 클러스터 네트워크
eksctl로 EKS를 배포한경우 퍼블릭 서브넷과 프라이빗 서브넷이 생성됨
- 워커 노드: 프라이빗 서브넷
- Ingress, LoadBalancer Service의 로드밸런서: 퍼블릭 서브넷

## 2) Service: NodePort
워커 노드는 프라이빗 네트워크에 배치되기 때문에 외부(인터넷)에 노출되지 않음

## 3) Service: LoadBalancer

기본적으로 Classic LoadBalancer로 생성됨

### (1) Network LoadBalancer 생성
서비스 리소스에 어노테이션 적용
```yaml
metadata:
  annotations:
    service.beta.kubernetes.io/aws-load-balancer-type: nlb
```

### (2) 내부용 LoadBalancer 생성
프라이빗 서브넷에 생성
```yaml
metadata:
  annotations:
    service.beta.kubernetes.io/aws-load-balancer-internal: "true"
```

## 4) Ingress 
Hosts 속성은 사용하지 X
Ingress 리소스에 연결할 서비스는 반드시 NodePort로 연결

### (1) Ingress 생성
Ingress 리소스 생성시 어노테이션 적용
```yaml
metadata:
  annotations:
    kubernetes.io/ingress.class: alb
```

### (2) 외부용 Ingress 생성
```yaml
metadata:
  annotations:
    alb.ingress.kubernetes.io/scheme: internet-facing
```

# 참조 사이트
https://eksctl.io
https://docs.aws.amazon.com/ko_kr/eks/latest/userguide/getting-started-eksctl.html
https://docs.aws.amazon.com/ko_kr/eks/latest/userguide/metrics-server.html
https://docs.aws.amazon.com/ko_kr/eks/latest/userguide/alb-ingress.html