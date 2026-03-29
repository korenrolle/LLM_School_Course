# UX Flow Draft — Admin, Author, Reviewer, Learner

## 1) Admin Flow (Business + Governance)

1. Create tenant/org and configure academy branding.
2. Configure roles, permissions, review policies, and publishing gates.
3. Set catalog strategy (courses/bundles/subscriptions).
4. Configure payment providers, coupons, affiliate policies.
5. Monitor operational dashboards (content throughput, revenue, engagement, risk alerts).
6. Manage release channels and rollback strategy.

## 2) Course Creator / Author Flow

1. Create course shell and define learning outcomes.
2. Build module/lesson map.
3. Author nodes by type: video, reading, quiz, reflection, scenario, AI-practice, resources.
4. Add interactions using block/scene/state model.
5. Use AI assistance for draft copy, question generation, transcript/caption setup.
6. Validate lesson logic (branching/completion rules/accessibility checks).
7. Submit version to review cycle.

## 3) Reviewer Flow

1. Receive assigned review task and open version snapshot.
2. Review pedagogy, factual quality, brand alignment, compliance, accessibility.
3. Annotate specific nodes/scenes/states.
4. Approve or request changes per gate criteria.
5. Final gate approval triggers publishing eligibility.

## 4) Student Flow

1. Discover content via catalog/search/recommendations.
2. Enroll/purchase/subscription entitlement resolution.
3. Start course and progress through lesson nodes.
4. Complete interactions, quizzes, reflections, scenarios, AI-practice.
5. Receive adaptive guidance and feedback signals.
6. Reach completion criteria and obtain certificate/next-path recommendations.

## 5) Publishing Flow (Authoring -> Review -> Publish -> Runtime -> Analytics)

```mermaid
flowchart LR
  A[Authoring Draft] --> B[Validation Checks]
  B --> C[Review Cycle]
  C -->|Changes Requested| A
  C -->|Approved| D[Publish Build Job]
  D --> E[Runtime Package + Manifest]
  E --> F[Release Channel Deploy]
  F --> G[Learner Runtime Consumption]
  G --> H[Event Ingestion]
  H --> I[Analytics + Insights]
  I --> J[Author/Admin Optimization Loop]
```

## 6) Authoring Workflow Diagram

```mermaid
flowchart TB
  P[Plan Outcomes] --> S[Structure Modules/Lessons]
  S --> N[Create Lesson Nodes]
  N --> I[Add Interactions]
  I --> AI[AI Assist Pass]
  AI --> QA[Quality & Accessibility Check]
  QA --> RV[Submit for Review]
```

## 7) Learner Workflow Diagram

```mermaid
flowchart TB
  D[Discover] --> E[Enroll or Purchase]
  E --> L[Launch Lesson Runtime]
  L --> V[Consume Video/Reading]
  V --> X[Complete Interactions + Quiz]
  X --> R[Reflection/Scenario/AI Practice]
  R --> P[Progress Update]
  P --> C{Completion Met?}
  C -->|No| L
  C -->|Yes| T[Certificate + Next Learning Path]
```

## 8) Review/Approval Workflow Diagram

```mermaid
flowchart TB
  SR[Submission Received] --> AR[Auto Rule Checks]
  AR --> RV1[Reviewer Pass 1]
  RV1 --> C1{Issues Found?}
  C1 -->|Yes| CR[Change Request]
  CR --> RS[Author Re-submit]
  RS --> RV1
  C1 -->|No| RV2[Final Approver Gate]
  RV2 --> C2{Approved?}
  C2 -->|No| CR
  C2 -->|Yes| PB[Publish Eligible]
```
