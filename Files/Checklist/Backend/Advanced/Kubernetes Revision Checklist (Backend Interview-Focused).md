# Kubernetes Revision Checklist (Backend Interview-Focused)

Tick an item only when you can explain it aloud. ⭐ marks the most commonly asked segments.

---

## 1. Fundamentals ⭐
- [ ] What Kubernetes is and the problems it solves (orchestration, scaling, self-healing, rolling updates)
- [ ] Containers vs VMs, Docker vs Kubernetes
- [ ] Declarative model: desired state vs actual state, reconciliation loop
- [ ] Core objects at a glance: Pod, Deployment, Service, ConfigMap, Secret, Ingress, Namespace
- [ ] `kubectl` basics and YAML manifest structure (`apiVersion`, `kind`, `metadata`, `spec`)
- [ ] Labels, selectors, annotations
- [ ] Namespaces and when to use them

## 2. Architecture ⭐
- [ ] **Control plane**: API server, etcd, scheduler, controller manager, cloud controller manager
- [ ] **Worker node**: kubelet, kube-proxy, container runtime (containerd)
- [ ] What happens when you run `kubectl apply` (request flow end to end)
- [ ] How the scheduler picks a node (filtering and scoring)
- [ ] Role of etcd and why backing it up matters
- [ ] Controllers and the reconciliation concept
- [ ] Managed offerings (EKS, GKE, AKS) at a high level

## 3. Workloads ⭐
- [ ] **Pod**: definition, lifecycle, multi-container pods (sidecar, init container)
- [ ] **ReplicaSet** vs **Deployment** (and why you rarely create Pods directly)
- [ ] **Rolling update** strategy (`maxSurge`, `maxUnavailable`) and rollback
- [ ] **StatefulSet** vs Deployment (stable identity, ordered rollout, persistent volumes)
- [ ] **DaemonSet**: use cases (log collectors, monitoring agents)
- [ ] **Job** and **CronJob**
- [ ] Pod restart policies and common states (`Pending`, `CrashLoopBackOff`, `ImagePullBackOff`, `OOMKilled`)
- [ ] Deployment strategies: rolling, blue-green, canary, recreate

## 4. Networking ⭐
- [ ] Kubernetes networking model (every Pod gets its own IP)
- [ ] **Service types**: ClusterIP, NodePort, LoadBalancer, ExternalName, headless service
- [ ] How Services route traffic (endpoints, kube-proxy)
- [ ] **Ingress** and Ingress controllers (NGINX, Traefik), Gateway API awareness
- [ ] DNS in the cluster (`service.namespace.svc.cluster.local`), CoreDNS
- [ ] **NetworkPolicy**: restricting Pod-to-Pod traffic
- [ ] CNI plugins (Calico, Cilium, Flannel) at a high level
- [ ] Service mesh awareness (Istio, Linkerd): what problems it solves

## 5. Configuration and Secrets ⭐
- [ ] **ConfigMap**: creating and consuming as env vars or mounted files
- [ ] **Secret**: types, base64 is not encryption, ways to improve security
- [ ] Encrypting secrets at rest, external secret managers (Vault, cloud secret stores, External Secrets Operator)
- [ ] Updating config without rebuilding the image
- [ ] Config reload behavior (env vars need a restart, mounted files update eventually)
- [ ] Spring Boot config in K8s (profiles, ConfigMap-based properties, Spring Cloud Kubernetes awareness)

## 6. Storage
- [ ] Volumes vs PersistentVolume (PV) vs PersistentVolumeClaim (PVC)
- [ ] StorageClass and dynamic provisioning
- [ ] Access modes (`ReadWriteOnce`, `ReadOnlyMany`, `ReadWriteMany`)
- [ ] `emptyDir`, `hostPath` and their limits
- [ ] Stateful apps on Kubernetes: databases, why it's harder
- [ ] Reclaim policies (Retain, Delete)

## 7. Health, Resources and Scaling ⭐
- [ ] **Probes**: liveness vs readiness vs startup, and what each one triggers
- [ ] Spring Boot Actuator health groups for K8s probes
- [ ] **Requests vs limits** (CPU and memory), what happens on exceeding each
- [ ] QoS classes (Guaranteed, Burstable, BestEffort)
- [ ] `OOMKilled` and CPU throttling: causes and fixes
- [ ] **HPA** (Horizontal Pod Autoscaler): metrics, how it decides
- [ ] **VPA** and Cluster Autoscaler (awareness), KEDA for event-driven scaling
- [ ] Graceful shutdown: SIGTERM, `terminationGracePeriodSeconds`, `preStop` hook
- [ ] PodDisruptionBudget
- [ ] Resource quotas and LimitRanges

## 8. Scheduling and Placement
- [ ] Node selectors, node affinity, pod affinity/anti-affinity
- [ ] Taints and tolerations
- [ ] Topology spread constraints (spreading across zones)
- [ ] Priority classes and preemption
- [ ] Cordon, drain, and node maintenance

## 9. Security ⭐
- [ ] **RBAC**: Role, ClusterRole, RoleBinding, ClusterRoleBinding, ServiceAccounts
- [ ] Least privilege principles
- [ ] Pod security standards (`restricted`, `baseline`), running as non-root, read-only root filesystem
- [ ] SecurityContext
- [ ] Image security: scanning, trusted registries, image pull secrets
- [ ] NetworkPolicy as a security layer
- [ ] Secrets handling and audit logging
- [ ] Common misconfigurations (privileged containers, exposed dashboards)

## 10. Packaging and Delivery
- [ ] **Helm**: charts, values, releases, templating, rollback
- [ ] Kustomize (overlays for environments)
- [ ] **GitOps** (Argo CD, Flux): pull-based deployments and drift detection
- [ ] CI/CD flow for a Spring Boot service (build, test, image, push, deploy)
- [ ] Image tagging strategy (avoid `latest`, use versions or digests)
- [ ] Multi-environment strategy (dev/stage/prod)

## 11. Observability and Troubleshooting ⭐
- [ ] `kubectl get`, `describe`, `logs`, `exec`, `top`, `events`, `port-forward`, `rollout`
- [ ] **Debugging a crashing pod** (step-by-step approach)
- [ ] Debugging `Pending`, `ImagePullBackOff`, `CrashLoopBackOff`, `OOMKilled`, and Service not reachable
- [ ] Logging (stdout/stderr, Fluent Bit, ELK/Loki)
- [ ] Metrics (Prometheus, Grafana, metrics-server)
- [ ] Tracing (OpenTelemetry) and Spring Boot Micrometer integration
- [ ] Ephemeral debug containers (`kubectl debug`)

## 12. Java/Spring Boot on Kubernetes ⭐
- [ ] JVM in containers: container-aware memory and CPU, heap sizing (`MaxRAMPercentage`)
- [ ] Why JVM apps get `OOMKilled` (heap + metaspace + native memory vs the memory limit)
- [ ] Slow JVM startup and probe tuning, startup probe use
- [ ] Building images: multi-stage Dockerfile, layered JARs, Buildpacks / Jib
- [ ] Graceful shutdown in Spring Boot (`server.shutdown=graceful`)
- [ ] Config via ConfigMaps/Secrets, 12-factor principles
- [ ] Autoscaling a Spring service (CPU, custom metrics, Kafka lag with KEDA)
- [ ] Native images / faster startup options (awareness)
- [ ] Kafka consumers and rebalances during rolling updates

## 13. Advanced Awareness (short answers only)
- [ ] Operators and Custom Resource Definitions (CRDs)
- [ ] Multi-cluster and multi-tenancy concepts
- [ ] Service mesh, sidecars, mTLS
- [ ] Cluster upgrades, backup and disaster recovery (etcd backup, Velero)
- [ ] Cost optimization (right-sizing, spot nodes)

---

## Classic quick-fire questions
- [ ] Pod vs Deployment vs StatefulSet?
- [ ] Liveness vs readiness vs startup probe?
- [ ] ClusterIP vs NodePort vs LoadBalancer vs Ingress?
- [ ] Requests vs limits, and what happens when memory limit is exceeded?
- [ ] What happens when you `kubectl apply` a Deployment?
- [ ] How does a rolling update work, and how do you roll back?
- [ ] ConfigMap vs Secret, and is a Secret really secure?
- [ ] How does a Service find its Pods?
- [ ] A pod is in `CrashLoopBackOff`: what do you do?
- [ ] How do you do zero-downtime deployments?
- [ ] How does HPA work, and what could go wrong?
- [ ] Helm vs Kustomize?

## Priority if time is short
1. Architecture and `kubectl apply` flow
2. Pod / Deployment / StatefulSet / Service / Ingress
3. Probes, requests/limits, HPA
4. ConfigMaps, Secrets, RBAC
5. Troubleshooting flow (very commonly asked)
6. JVM/Spring Boot on K8s
7. Helm and GitOps basics

