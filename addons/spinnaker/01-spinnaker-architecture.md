# Spinnaker

# 1. Spinnaker 개요
Spinnaker는 오픈소스 기반의 지속적 제공(CD) 플랫폼으로 소프트웨어 변경 사항을 빠르고 확실하게 릴리즈 할 수 있다. Netflix에서 내부 적으로 개발해 사용하던 Asgard를 대채하기 위해 개발되었고 Google에 의해 확장되었다. 

Spinnaker는 Kubernetes, GCP, AWS, Azure, OCI 등 플랫폼을 지원한다.

2015년 11월 Apache License 2.0으로 릴리즈 되었다.

> 참고
> - CI(Continuous Integration: 지속적 통합)
> - CD(Continuous Delivery: 지속적 제공)
> - CD(Continuous Deployment: 지속적 배포)

Code -> Build -> Intergrate -> Test -> Release -> Deploy -> Operate  
<---------------CI---------------->  
<---------------CD(Delivery)----------------->  
<---------------CD(Deployment)------------------------->  
<---------------DevOps-------------------------------------------->  

# 2. 아키텍처

## 1) Spinnaker 마이크로서비스
- Deck
  - 웹기반 UI
- Gate
  - API 게이트웨이
  - Spinnaker의 모든 마이크로서비스는 Gate를 통해 통신함
- Orca
  - 오케스트레이션 엔진
  - 모즌 임시 작업 및 파이프라인을 처리함
- Clouddriver
  - 클라우드 공급자에 대한 모든 변경 호출과 배포 된 모든 리소스의 색인을 생성하고 캐싱함
- Front50
  - 애플리케이션, 파이프라인, 프로젝트 및 알림의 메타데이터를 유지
- Rosco
  - 베이커리(Bakery)
  - 클라우드 공급자에 불변의(immutable) VM 이미지를 생성
  - packer를 이용해 이미지를 생성
  - 예) GCE 이미지, AWS AMI, Azure VM 이미지
- Igor
  - Jenkins, Travis와 같은 CI 작업을 통해 파이프라인을 트리거하는데 사용
- Echo
  - Spinnaker의 이벤트 버스
  - 알림 전송(예: Slack, 이메일, SMS)
  - GitHub 등 웹 후크에 작용
- Fiat
  - Spinnaker의 인증 서비스
- Kayenta
  - Spinnaker에 대해 자동화된 카나리(canary) 분석 제공
- Halyard
  - Spinnaker의 구성 서비스
  - Spinnaker의 배포 구성 작성 및 유효성 검사
  - Spinnaker의 마이크로서비스 배포 및 업데이트

## 2) Spinnaker 시스템 의존성
![시스템 의존성](img/spinnaker-architecture.png)
![시스템 의존성](img/spinnaker-system-dependency.png)

## 3) 포트 매핑
| 서비스        | 포트  |
|-------------|------|
| Clouddriver | 7002 |
| Deck        | 9000 |
| Echo        | 8089 |
| Fiat        | 7003 |
| Front50     | 8080 |
| Gate        | 8084 |
| Halyard     | 8064 |
| Igor        | 8088 |
| Kayenta     | 8090 |
| Orca        | 8083 |
| Rosco       | 8087 |
