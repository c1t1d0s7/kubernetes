# Spinnaker

# 3. CI/CD 구성

GitHub --> Docker Hub --> Spinnaker --> Kubernetes Deployment
- GitHub Repository: 컨테이너 이미지를 빌드하기 위한 Dockerfile 및 소스
- Docker Hub Registry: Automated Build 기능을 이용하여 GitHub의 소스를 이미지로 빌드
- Spinnaker: Docker Hub Registry에 빌드된 새 이미지가 빌드되면 Kubenetes Deployment 리소스로 배포

## 1) GitHub 저장소 준비

## 2) Docker Hub 레지스트리 준비

## 3) Docker Hub 자동화 빌드 설정

BUILD RULES
TAG /^v([0-9.]+)$/ version-{\1} Dockerfile /

## 4) Spinnaker의 Docker 저장소 설정
hal config provider docker-registry enable
hal config provider docker-registry account add my-docker-registry \
--address index.docker.io \
--repositories c1t1d0s7/container-build-test

hal deploy apply

참고)
--username $USERNAME
--password

## 5) Spinnaker의 Pipeline 생성

```
apiVersion: apps/v1
kind: Deployment
metadata:
  name: build-test
  labels:
    app: build-test
spec:
  replicas: 3
  selector:
    matchLabels:
      app: build-test
  template:
    metadata:
      labels:
        app: build-test
    spec:
      containers:
      - image: "c1t1d0s7/container-build-test:${trigger['tag']}"
        name: build-test
        ports:
        - containerPort: 8080
```

## 6) Spinnaker의 LoadBalancer 생성
```
apiVersion: v1
kind: Service
metadata:
  name: build-test-lb
spec:
  type: LoadBalancer
  ports:
  - port: 80
    targetPort: 8080
  selector:
    app: build-test
```

## 7) Dockerfile 및 소스 푸시
```
FROM node:slim
WORKDIR /usr/src/app
COPY index.js .
RUN npm install ip
ENTRYPOINT ["node", "index.js"]
CMD ["Hello World!"]
EXPOSE 8080/tcp
```

```
const http = require('http');
const os = require('os');
const ip = require('ip');
const dns = require("dns");

console.log(Date());
console.log("...Start My Node.js Application...");

var handler = function(request, response) {
    console.log(Date());
    console.log("Received Request From " + request.connection.remoteAddress);
    response.writeHead(200);
    response.write("VERSION 0.1\n");
    response.write("Message: " + process.argv[2] + "\n");
    response.write("Hostname: " + os.hostname() + "\n");
    response.write("Platform: " + os.platform() + "\n");
    response.write("Uptime: " + os.uptime() + "\n");
    response.write("IP: " + ip.address() + "\n");
    response.write("DNS: " + dns.getServers() + "\n");
    response.end();
};

var www = http.createServer(handler);
www.listen(8080);
```

git add .
git commit -m 'Modify version to 0.1'
git push

git tag -a 'v0.1' -m 'Modify version to 0.1'
git push origin v0.1

## 8) CI/CD 확인
