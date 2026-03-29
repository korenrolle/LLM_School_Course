# V1 Service Contracts (API/Boundary Draft)

## Stack Assumption
- Next.js app router + server actions/route handlers
- Supabase Postgres + RLS
- Stripe checkout + webhooks

## 1) Service Boundaries (V1)

### Identity Service
Responsibilities:
- map authenticated Supabase user to org membership
- resolve effective role

Core APIs:
- `GET /api/v1/me`
- `GET /api/v1/orgs/:orgId/members`
- `POST /api/v1/orgs/:orgId/members` (invite/add)

### Academy Service
Responsibilities:
- academy shell config, catalog listing, enroll access checks

Core APIs:
- `GET /api/v1/orgs/:orgId/academy`
- `PATCH /api/v1/orgs/:orgId/academy`
- `GET /api/v1/orgs/:orgId/catalog/courses`
- `POST /api/v1/orgs/:orgId/courses/:courseId/enroll`

### Commerce Service
Responsibilities:
- Stripe checkout session create, webhook reconciliation

Core APIs:
- `POST /api/v1/orgs/:orgId/checkout/session`
- `POST /api/v1/webhooks/stripe`
- `GET /api/v1/orgs/:orgId/users/:userId/entitlements`

### Authoring Service
Responsibilities:
- draft course/version/module/lesson/node CRUD
- interaction graph validation

Core APIs:
- `POST /api/v1/orgs/:orgId/courses`
- `POST /api/v1/courses/:courseId/versions`
- `GET /api/v1/course-versions/:versionId`
- `PATCH /api/v1/lessons/:lessonId/nodes/:nodeId`
- `POST /api/v1/interactions/:interactionId/validate`

### Review Service
Responsibilities:
- submit for review, comments, approve/changes requested

Core APIs:
- `POST /api/v1/course-versions/:versionId/review`
- `POST /api/v1/review-cycles/:reviewCycleId/comments`
- `POST /api/v1/review-cycles/:reviewCycleId/approve`
- `POST /api/v1/review-cycles/:reviewCycleId/request-changes`

### Publishing Service
Responsibilities:
- publish job orchestration and runtime package creation

Core APIs:
- `POST /api/v1/course-versions/:versionId/publish`
- `GET /api/v1/publish-jobs/:publishJobId`
- `POST /api/v1/runtime-packages/:packageId/rollback`

### Learning Runtime Service
Responsibilities:
- fetch published package/lesson nodes
- record attempts/progress/completion

Core APIs:
- `GET /api/v1/courses/:courseId/runtime`
- `GET /api/v1/runtime-lessons/:runtimeLessonId`
- `POST /api/v1/lesson-attempts`
- `POST /api/v1/node-attempts`
- `POST /api/v1/assessment-attempts/:id/submit`
- `POST /api/v1/progress/sync`

### Certificates Service
Responsibilities:
- issue certificate on completion

Core APIs:
- `POST /api/v1/completions/:completionId/certificate`
- `GET /api/v1/certificates/:certificateNo`

### Analytics Service
Responsibilities:
- ingest event stream and expose baseline aggregates

Core APIs:
- `POST /api/v1/events/batch`
- `GET /api/v1/orgs/:orgId/analytics/overview`

### AI Orchestration Service (hooks/placeholders)
Responsibilities:
- async task dispatch and result retrieval

Core APIs:
- `POST /api/v1/ai/tasks`
- `GET /api/v1/ai/tasks/:taskId`

## 2) Authorization Matrix (minimum)

- `owner/admin`: all org endpoints
- `author`: authoring + own course review submit
- `reviewer`: review cycle actions
- `learner`: runtime/progress/enrollment read/write

Enforce via Supabase RLS + server-side role assertions.

## 3) Request/Response Contract Conventions

- Idempotency key required for:
  - checkout session creation
  - publish requests
  - event batch ingest
- Include headers:
  - `x-org-id`
  - `x-request-id`
- Response envelope:
```json
{
  "data": {},
  "error": null,
  "meta": {"requestId": "..."}
}
```

## 4) V1 Simplifications

- synchronous publish build trigger with async job status polling
- single reviewer assignment (no multi-gate orchestration yet)
- single currency per org
- basic assessment grading (rule-based, no weighted banks)
- AI tasks stored and polled; no streaming tokens in v1
