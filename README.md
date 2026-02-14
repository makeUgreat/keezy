# Keezy

[한국어](README.ko.md)

A lightweight, browser-based GUI for managing Kubernetes Secrets. View, create, edit, and delete secrets across multiple clusters and namespaces — all from a simple web interface.

![License](https://img.shields.io/github/license/makeugreat/keezy)
![Node](https://img.shields.io/badge/node-22-green)

## Features

- **Secret CRUD** — List, view, create, edit, and delete Kubernetes Secrets through an intuitive web UI. Base64 encoding/decoding is handled transparently.
- **Multi-Cluster Support** — Switch between multiple Kubernetes contexts on the fly. Keezy reads your kubeconfig and lets you pick any available context from a dropdown.
- **Multi-Namespace Support** — Browse and switch namespaces within a cluster. The selected namespace persists in your session.
- **Optimistic Locking** — Uses Kubernetes `resourceVersion` to detect concurrent edits, preventing accidental overwrites with a clear 409 Conflict error.
- **Security Hardened** — Helmet.js security headers, CSRF double-token protection, session-based auth with secure cookies, input validation for Kubernetes naming rules (RFC 1123).
- **Lightweight Container** — Multi-stage Docker build on Node 22 Alpine. Runs as a non-root user with a read-only filesystem. Default resource limits: 200m CPU / 256Mi memory.
- **Helm Chart Included** — Ships with a production-ready Helm chart that creates all required Kubernetes resources (Deployment, Service, RBAC, Ingress, etc.).
- **CI/CD Pipeline** — GitHub Actions workflow automatically tests, builds the Docker image, and publishes the Helm chart on version tags.

## Quick Start

### Prerequisites

- Node.js 22+
- A valid kubeconfig (`~/.kube/config` or `KUBECONFIG` env var)

### Local Development

```bash
# Install dependencies
npm install

# Copy and configure environment variables
cp .env.example .env

# Start development server (with hot reload)
npm run dev
```

Open `http://localhost:7121` in your browser.

### Run Tests

```bash
npm test
```

## Configuration

| Environment Variable | Default | Description |
|---|---|---|
| `PORT` | `7121` | Web server port |
| `NODE_ENV` | `development` | `development` or `production` |
| `SESSION_SECRET` | `keezy-dev-secret` | Session encryption key (**must change in production**) |
| `KUBECONFIG` | `~/.kube/config` | Path to kubeconfig file |
| `K8S_CONTEXT` | _(auto-detected)_ | Default Kubernetes context |
| `K8S_NAMESPACE` | `default` | Default namespace |

## Deploying to Kubernetes

Keezy is designed to run inside a Kubernetes cluster as a Pod, managed via the included Helm chart.

### 1. Install with Helm

```bash
# From a local chart directory
helm install keezy ./chart

# Or from the OCI registry (after a release is published)
helm install keezy oci://ghcr.io/makeugreat/charts/keezy --version <version>
```

### 2. Helm Values

Key values you can customize in `values.yaml` or via `--set`:

```yaml
replicaCount: 1

image:
  repository: ghcr.io/makeugreat/keezy
  tag: ""          # Defaults to Chart appVersion

service:
  type: ClusterIP
  port: 7121

# Session secret (pick one):
session:
  secret: "my-strong-secret"     # Plain text (auto-creates a K8s Secret)
  existingSecret: ""             # Or reference an existing K8s Secret

# Ingress (disabled by default)
ingress:
  enabled: false
  className: ""
  hosts:
    - host: keezy.example.com
      paths:
        - path: /
          pathType: Prefix
  tls: []

# Resource limits
resources:
  requests:
    cpu: 50m
    memory: 64Mi
  limits:
    cpu: 200m
    memory: 256Mi

# RBAC (creates ClusterRole + ClusterRoleBinding)
rbac:
  create: true

# Additional environment variables
extraEnv: []
```

### 3. What the Chart Creates

| Resource | Purpose |
|---|---|
| **Deployment** | Runs the Keezy container as a non-root user (UID 1000) with a read-only root filesystem, no privilege escalation, and all capabilities dropped |
| **Service** | ClusterIP service on port 7121 |
| **ServiceAccount** | Dedicated service account with auto-mounted token for Kubernetes API access |
| **ClusterRole** | Grants permissions: `get`, `list`, `create`, `update`, `patch`, `delete` on **Secrets**; `get`, `list` on **Namespaces** |
| **ClusterRoleBinding** | Binds the ServiceAccount to the ClusterRole |
| **Secret** | Stores the `SESSION_SECRET` (auto-generated if not provided) |
| **Ingress** _(optional)_ | Exposes Keezy externally when enabled |

### 4. In-Cluster Authentication

When running inside a cluster, Keezy automatically uses the ServiceAccount token mounted by Kubernetes — no kubeconfig file is needed. The ClusterRole grants the necessary API permissions.

### 5. Exposing the UI

**Option A — Port Forward (development/testing):**

```bash
kubectl port-forward svc/keezy 7121:7121
```

**Option B — Ingress (production):**

Enable ingress in your values:

```yaml
ingress:
  enabled: true
  className: nginx  # or your ingress class
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

## Important Notes and Precautions

### Security

- **Keezy has full secret read/write access.** The ClusterRole grants broad secret permissions across all namespaces. Restrict network access to Keezy carefully.
- **No built-in authentication.** Keezy does not have its own user login system. Protect it behind a VPN, network policy, or an authentication proxy (e.g., OAuth2 Proxy) in production environments.
- **Secrets are displayed in plaintext.** Once a user accesses the Keezy UI, they can see decoded secret values. Ensure only authorized personnel can reach the service.

### Operations

- **Session storage is in-memory.** Sessions are lost when the Pod restarts. This means users will need to re-select their context and namespace after a restart. If you run multiple replicas, sessions are not shared between Pods (sticky sessions or an external session store would be needed).
- **ClusterRole scope.** By default, the ClusterRole applies cluster-wide. If you need to restrict access to specific namespaces, replace the ClusterRole/ClusterRoleBinding with namespace-scoped Role/RoleBinding resources.
- **Optimistic locking.** If two users edit the same secret simultaneously, the second save will fail with a 409 Conflict. The user must reload and re-apply their changes.

### Resource Considerations

- Default resource requests: **50m CPU / 64Mi memory**
- Default resource limits: **200m CPU / 256Mi memory**
- Suitable for most clusters. Adjust if you manage a very large number of secrets.

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 22 (Alpine) |
| Language | TypeScript (ES2022) |
| Web Framework | Express.js |
| Template Engine | EJS |
| Styling | Tailwind CSS (CDN) |
| Kubernetes Client | @kubernetes/client-node |
| Testing | Vitest + Supertest |
| Container | Docker (multi-stage build) |
| Orchestration | Helm 3 |
| CI/CD | GitHub Actions |

## Project Structure

```
keezy/
├── src/
│   ├── server.ts              # Entry point
│   ├── app.ts                 # Express app factory
│   ├── config/                # Configuration & K8s client setup
│   ├── routes/                # Route handlers (secrets, namespaces, contexts)
│   ├── services/              # Business logic (K8s API operations)
│   ├── middleware/             # CSRF, validation, error handling, K8s client injection
│   ├── utils/                 # Base64, pagination, custom errors
│   ├── types/                 # TypeScript type definitions
│   └── views/                 # EJS templates (layouts, pages, partials)
├── tests/                     # Unit & integration tests
├── chart/                     # Helm chart
├── Dockerfile                 # Multi-stage Docker build
├── .github/workflows/         # CI/CD pipeline
└── .env.example               # Environment variable template
```

## CI/CD

The GitHub Actions workflow (`.github/workflows/release.yaml`) triggers on version tags (`v*`):

1. **Test** — Runs `npm ci` and `npm test`
2. **Build & Push Docker Image** — Builds and pushes to `ghcr.io/makeugreat/keezy`
3. **Publish Helm Chart** — Packages and pushes to `oci://ghcr.io/makeugreat/charts`

To create a release:

```bash
git tag v1.0.0
git push origin v1.0.0
```

## License

[MIT](LICENSE)