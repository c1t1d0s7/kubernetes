# Argo Project

https://argoproj.github.io/

CNCF 인큐베이터 프로젝트(20.05.15 현재)

Argo 프로젝트는 쿠버네티스로 작업을 수행하기 위한 도구 모움

## Argo Workflows
컨테이너 네이티브 워크플로우 엔진  
병렬 작업을 조정하기위한 오픈 소스 컨테이너 네이티브 워크플로우 엔진 

## Argo CD
선언적 GitOps 지속적 제공(CD)

> GitOps?  
> Weaveworks 회사에서 처음 사용하기 시작  
> Git에서 시작하여 Git에서 끝나는 접근 방식  
>  
> Single source of truth(SSOT)  
> 신뢰 가능한 단일 소스 = Git  
>  
> - Git은 신뢰 가능한 단일 소스  
> - Git은 모든 환경이 운영되는 단일 소스  
> - 모든 변경 사항은 관찰 및 검증 가능  

## Argo Rollouts
향상된 쿠버네티스 배포 컨트롤러
- Rolling Update
- Recreate
- Blue Green (Red Black)
- Canary

## Argo Events
이벤트 기반 종속성 관리자  
Git, Webhook, S3, Schedule, K8s 리소스, Streams, SNS, PubSub, Slack 등 다양한 이벤트 소스에서 여러 종속성을 정의하고 쿠버네티스 객체를 트리거 할 수 있다.



