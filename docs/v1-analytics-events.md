# V1 Analytics Events (Minimum Day-1 Contract)

## Principles
- Capture only events needed for product, learning, and business baseline decisions.
- Every event includes stable typed columns + flexible `payload_json`.
- Event names are immutable; payload can be versioned.

## Required Common Fields
- `event_name`
- `event_ts`
- `org_id`
- `user_id` (nullable for anonymous catalog views)
- `session_id`
- `course_id` (when applicable)
- `runtime_package_id` (when applicable)
- `runtime_lesson_id` (when applicable)
- `runtime_node_id` (when applicable)
- `attempt_id` (when applicable)

## 1) Acquisition / Commerce Events
- `catalog_course_viewed`
- `checkout_started`
- `checkout_completed`
- `entitlement_granted`
- `enrollment_created`

Minimum payload examples:
- checkout: `{ "pricePlanId": "...", "amountCents": 9900, "currency": "usd" }`

## 2) Learning Runtime Events
- `lesson_started`
- `node_viewed`
- `node_completed`
- `lesson_completed`
- `progress_updated`
- `course_completed`
- `certificate_issued`

Payload examples:
- node completed: `{ "nodeType": "quiz", "durationSec": 42, "score": 80 }`

## 3) Assessment Events
- `assessment_started`
- `assessment_question_answered`
- `assessment_submitted`
- `assessment_graded`

Payload examples:
- question answered: `{ "questionKey": "q1", "isCorrect": true, "points": 1 }`

## 4) Scenario / Interaction Events
- `interaction_trigger_fired`
- `scenario_branch_taken`
- `variable_changed`

Payload examples:
- scenario branch: `{ "fromScene": "scene_1", "toScene": "scene_2", "rule": "score>=1" }`

## 5) AI Events (Hook-level in v1)
- `ai_task_requested`
- `ai_task_completed`
- `ai_feedback_shown`
- `ai_practice_turn_logged`

Payload examples:
- ai task: `{ "taskType": "quiz_generate", "contextType": "authoring", "latencyMs": 1820 }`

## 6) Authoring / Review / Publish Events
- `course_version_created`
- `review_requested`
- `review_approved`
- `review_changes_requested`
- `publish_started`
- `publish_succeeded`
- `publish_failed`
- `rollback_executed`

## 7) Derived KPI Baseline (from events)

- Enrollment conversion rate
- Lesson completion rate
- Quiz pass rate
- Average time-to-complete per lesson
- Publish success/failure ratio
- AI feature adoption counts
