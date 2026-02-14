# Keezy

Kubernetes Secret을 관리하기 위한 경량 웹 기반 GUI입니다. 여러 클러스터와 네임스페이스에 걸쳐 시크릿을 조회, 생성, 수정, 삭제할 수 있는 간단한 웹 인터페이스를 제공합니다.

![License](https://img.shields.io/github/license/makeugreat/keezy)
![Node](https://img.shields.io/badge/node-22-green)

## 주요 기능

- **시크릿 CRUD** — 직관적인 웹 UI를 통해 Kubernetes Secret을 조회, 생성, 수정, 삭제할 수 있습니다. Base64 인코딩/디코딩은 자동으로 처리됩니다.
- **멀티 클러스터 지원** — 여러 Kubernetes 컨텍스트 간에 즉시 전환할 수 있습니다. kubeconfig에 등록된 모든 컨텍스트를 드롭다운에서 선택할 수 있습니다.
- **멀티 네임스페이스 지원** — 클러스터 내 네임스페이스를 탐색하고 전환할 수 있습니다. 선택한 네임스페이스는 세션에 유지됩니다.
- **낙관적 잠금(Optimistic Locking)** — Kubernetes의 `resourceVersion`을 사용하여 동시 편집을 감지하고, 409 Conflict 오류로 실수로 인한 덮어쓰기를 방지합니다.
- **보안 강화** — Helmet.js 보안 헤더, CSRF 이중 토큰 보호, 보안 쿠키 기반 세션, Kubernetes 네이밍 규칙(RFC 1123) 입력 검증을 제공합니다.
- **경량 컨테이너** — Node 22 Alpine 기반 멀티 스테이지 Docker 빌드. 비루트 사용자로 실행되며 읽기 전용 파일시스템을 사용합니다. 기본 리소스 제한: 200m CPU / 256Mi 메모리.
- **Helm Chart 포함** — 필요한 모든 Kubernetes 리소스(Deployment, Service, RBAC, Ingress 등)를 생성하는 프로덕션 수준의 Helm 차트가 포함되어 있습니다.
- **CI/CD 파이프라인** — GitHub Actions 워크플로우가 버전 태그 생성 시 자동으로 테스트, Docker 이미지 빌드, Helm 차트 배포를 수행합니다.

## 빠른 시작

### 사전 요구사항

- Node.js 22 이상
- 유효한 kubeconfig (`~/.kube/config` 또는 `KUBECONFIG` 환경변수)

### 로컬 개발

```bash
# 의존성 설치
npm install

# 환경변수 설정
cp .env.example .env

# 개발 서버 시작 (핫 리로드 포함)
npm run dev
```

브라우저에서 `http://localhost:7121`로 접속합니다.

### 테스트 실행

```bash
npm test
```

## 설정

| 환경변수 | 기본값 | 설명 |
|---|---|---|
| `PORT` | `7121` | 웹 서버 포트 |
| `NODE_ENV` | `development` | `development` 또는 `production` |
| `SESSION_SECRET` | `keezy-dev-secret` | 세션 암호화 키 (**운영 환경에서 반드시 변경**) |
| `KUBECONFIG` | `~/.kube/config` | kubeconfig 파일 경로 |
| `K8S_CONTEXT` | _(자동 감지)_ | 기본 Kubernetes 컨텍스트 |
| `K8S_NAMESPACE` | `default` | 기본 네임스페이스 |

## Kubernetes 배포

Keezy는 Kubernetes 클러스터 내에서 Pod로 실행되도록 설계되었으며, 포함된 Helm 차트를 통해 관리됩니다.

### 1. Helm으로 설치

```bash
# 로컬 차트 디렉토리에서 설치
helm install keezy ./chart

# 또는 OCI 레지스트리에서 설치 (릴리스 배포 후)
helm install keezy oci://ghcr.io/makeugreat/charts/keezy --version <version>
```

### 2. Helm Values

`values.yaml` 또는 `--set`을 통해 커스터마이즈할 수 있는 주요 값들:

```yaml
replicaCount: 1

image:
  repository: ghcr.io/makeugreat/keezy
  tag: ""          # 미지정 시 Chart appVersion 사용

service:
  type: ClusterIP
  port: 7121

# 세션 시크릿 (택 1):
session:
  secret: "my-strong-secret"     # 평문 (K8s Secret 자동 생성)
  existingSecret: ""             # 또는 기존 K8s Secret 참조

# Ingress (기본 비활성화)
ingress:
  enabled: false
  className: ""
  hosts:
    - host: keezy.example.com
      paths:
        - path: /
          pathType: Prefix
  tls: []

# 리소스 제한
resources:
  requests:
    cpu: 50m
    memory: 64Mi
  limits:
    cpu: 200m
    memory: 256Mi

# RBAC (ClusterRole + ClusterRoleBinding 생성)
rbac:
  create: true

# 추가 환경변수
extraEnv: []
```

### 3. 차트가 생성하는 리소스

| 리소스 | 용도 |
|---|---|
| **Deployment** | 비루트 사용자(UID 1000)로 Keezy 컨테이너를 실행하며, 읽기 전용 루트 파일시스템, 권한 상승 불가, 모든 capability 제거 |
| **Service** | 포트 7121의 ClusterIP 서비스 |
| **ServiceAccount** | Kubernetes API 접근을 위한 토큰이 자동 마운트되는 전용 서비스 계정 |
| **ClusterRole** | **Secrets**에 대해 `get`, `list`, `create`, `update`, `patch`, `delete` 권한 부여; **Namespaces**에 대해 `get`, `list` 권한 부여 |
| **ClusterRoleBinding** | ServiceAccount를 ClusterRole에 바인딩 |
| **Secret** | `SESSION_SECRET` 저장 (미지정 시 자동 생성) |
| **Ingress** _(선택)_ | 활성화 시 Keezy를 외부에 노출 |

### 4. 클러스터 내 인증

클러스터 내에서 실행될 때 Keezy는 Kubernetes가 마운트한 ServiceAccount 토큰을 자동으로 사용하므로 kubeconfig 파일이 필요 없습니다. ClusterRole이 필요한 API 권한을 부여합니다.

### 5. UI 노출 방법

**방법 A — Port Forward (개발/테스트용):**

```bash
kubectl port-forward svc/keezy 7121:7121
```

**방법 B — Ingress (운영 환경):**

values에서 ingress를 활성화합니다:

```yaml
ingress:
  enabled: true
  className: nginx  # 또는 사용 중인 ingress class
  hosts:
    - host: keezy.example.com
      paths:
        - path: /
          pathType: Prefix
  tls:
    - secretName: keezy-tls
      hosts:
        - keezy.example.com
```

## 주의사항 및 유의점

### 보안

- **Keezy는 시크릿에 대한 전체 읽기/쓰기 권한을 가집니다.** ClusterRole이 모든 네임스페이스에 걸쳐 광범위한 시크릿 권한을 부여합니다. Keezy에 대한 네트워크 접근을 신중하게 제한하세요.
- **자체 인증 기능이 없습니다.** Keezy는 자체 사용자 로그인 시스템이 없습니다. 운영 환경에서는 VPN, 네트워크 정책, 또는 인증 프록시(예: OAuth2 Proxy) 뒤에 배치하세요.
- **시크릿이 평문으로 표시됩니다.** 사용자가 Keezy UI에 접근하면 디코딩된 시크릿 값을 볼 수 있습니다. 권한이 있는 인원만 서비스에 접근할 수 있도록 보장하세요.

### 운영

- **세션 저장소는 인메모리입니다.** Pod가 재시작되면 세션이 유실됩니다. 즉, 재시작 후 사용자는 컨텍스트와 네임스페이스를 다시 선택해야 합니다. 여러 레플리카를 운영하는 경우 Pod 간에 세션이 공유되지 않으므로, 스티키 세션이나 외부 세션 저장소가 필요합니다.
- **ClusterRole 범위.** 기본적으로 ClusterRole은 클러스터 전체에 적용됩니다. 특정 네임스페이스로 접근을 제한해야 하는 경우, ClusterRole/ClusterRoleBinding을 네임스페이스 범위의 Role/RoleBinding으로 교체하세요.
- **낙관적 잠금.** 두 사용자가 동시에 같은 시크릿을 편집하면 두 번째 저장이 409 Conflict로 실패합니다. 사용자는 페이지를 새로고침하고 변경사항을 다시 적용해야 합니다.

### 리소스 고려사항

- 기본 리소스 요청: **50m CPU / 64Mi 메모리**
- 기본 리소스 제한: **200m CPU / 256Mi 메모리**
- 대부분의 클러스터에 적합합니다. 매우 많은 수의 시크릿을 관리하는 경우 조정하세요.

## 기술 스택

| 레이어 | 기술 |
|---|---|
| 런타임 | Node.js 22 (Alpine) |
| 언어 | TypeScript (ES2022) |
| 웹 프레임워크 | Express.js |
| 템플릿 엔진 | EJS |
| 스타일링 | Tailwind CSS (CDN) |
| Kubernetes 클라이언트 | @kubernetes/client-node |
| 테스트 | Vitest + Supertest |
| 컨테이너 | Docker (멀티 스테이지 빌드) |
| 오케스트레이션 | Helm 3 |
| CI/CD | GitHub Actions |

## 프로젝트 구조

```
keezy/
├── src/
│   ├── server.ts              # 진입점
│   ├── app.ts                 # Express 앱 팩토리
│   ├── config/                # 설정 및 K8s 클라이언트 초기화
│   ├── routes/                # 라우트 핸들러 (시크릿, 네임스페이스, 컨텍스트)
│   ├── services/              # 비즈니스 로직 (K8s API 연동)
│   ├── middleware/             # CSRF, 유효성 검증, 에러 처리, K8s 클라이언트 주입
│   ├── utils/                 # Base64, 페이지네이션, 커스텀 에러
│   ├── types/                 # TypeScript 타입 정의
│   └── views/                 # EJS 템플릿 (레이아웃, 페이지, 파셜)
├── tests/                     # 단위 및 통합 테스트
├── chart/                     # Helm 차트
├── Dockerfile                 # 멀티 스테이지 Docker 빌드
├── .github/workflows/         # CI/CD 파이프라인
└── .env.example               # 환경변수 템플릿
```

## CI/CD

GitHub Actions 워크플로우(`.github/workflows/release.yaml`)는 버전 태그(`v*`) 생성 시 트리거됩니다:

1. **테스트** — `npm ci` 및 `npm test` 실행
2. **Docker 이미지 빌드 및 푸시** — `ghcr.io/makeugreat/keezy`로 빌드 및 푸시
3. **Helm Chart 배포** — `oci://ghcr.io/makeugreat/charts`로 패키징 및 푸시

릴리스를 생성하려면:

```bash
git tag v1.0.0
git push origin v1.0.0
```

## 라이선스

[MIT](LICENSE)