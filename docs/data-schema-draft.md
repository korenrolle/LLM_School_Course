# System-Level Data Schema Draft

## 1) Core Entity Groups

### A. Identity, Organization, Access
- `tenant`
- `organization`
- `workspace`
- `user`
- `membership`
- `role`
- `permission`
- `policy`

### B. Academy, Catalog, Commerce
- `academy_site`
- `catalog_item` (course, bundle, track)
- `pricing_plan`
- `offer`
- `coupon`
- `subscription`
- `order`
- `order_line`
- `payment_transaction`
- `affiliate`
- `affiliate_attribution`
- `entitlement`

### C. Content Authoring Model
- `course`
- `course_version` (draft/review/approved/published/archived)
- `module`
- `lesson`
- `lesson_node` (video, reading, quiz, reflection, scenario, ai_practice, resource)
- `block` (UI/interaction block)
- `scene`
- `state`
- `trigger`
- `condition`
- `action`
- `variable_definition`
- `asset`
- `template`
- `localization_variant`

### D. Review and Workflow
- `review_cycle`
- `review_task`
- `annotation`
- `approval_gate`
- `approval_decision`
- `workflow_instance`
- `workflow_event`
- `audit_event`

### E. Publishing and Runtime Artifacts
- `publish_job`
- `runtime_package`
- `runtime_manifest`
- `package_asset_map`
- `release_channel` (staging, production, scheduled)

### F. Learning Runtime, Progress, Assessment
- `enrollment`
- `learning_session`
- `lesson_attempt`
- `interaction_event`
- `progress_record`
- `completion_record`
- `assessment`
- `question_bank`
- `question_item`
- `question_variant`
- `assessment_attempt`
- `assessment_response`
- `grade_record`
- `certificate`

### G. AI Services and Knowledge
- `ai_task`
- `ai_task_input`
- `ai_task_output`
- `ai_feedback_record`
- `ai_tutor_session`
- `transcript`
- `caption_track`
- `translation_job`
- `translation_memory_segment`
- `model_policy`

### H. Analytics and Reporting
- `event_stream_record`
- `metric_fact_learning`
- `metric_fact_business`
- `dimension_user`
- `dimension_content`
- `dimension_time`

## 2) Key Relationship Sketch

- One `course` has many `course_version`.
- One `course_version` has many `module`, `lesson`, `lesson_node`.
- `lesson_node` references interaction graph (`scene` -> `state` -> `trigger`/`action`).
- `course_version` enters many `review_cycle`; approved version links to `publish_job`.
- `publish_job` generates one or more `runtime_package` for release channels.
- `enrollment` + entitlement gates runtime access.
- `lesson_attempt` and `assessment_attempt` generate `interaction_event` records.
- `completion_record` can trigger `certificate` issuance.
- `ai_task` can attach to authoring or learner contexts and is always audit-linked.

## 3) Lifecycle State Models

### Course Version States
- `draft`
- `in_review`
- `changes_requested`
- `approved`
- `published`
- `retired`

### Review Task States
- `open`
- `in_progress`
- `commented`
- `approved`
- `rejected`
- `resolved`

### Publish Job States
- `queued`
- `building`
- `validating`
- `failed`
- `published`
- `rolled_back`

## 4) Event Contract Baseline

Each domain event should include:
- `event_id`
- `event_type`
- `tenant_id`
- `occurred_at`
- `actor_id` (or system)
- `entity_type`
- `entity_id`
- `version_id` (for content-aware events)
- `payload` (schema-versioned)

## 5) Data Governance Notes

- PII segregation with access tiering.
- Immutable audit trail for publish/compliance events.
- Region-aware storage and retention policy support.
- Soft-delete for operational recovery + hard-delete workflows for compliance.
