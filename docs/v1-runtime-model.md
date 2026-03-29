# V1 Runtime Model (Renderable Contract)

## 1) Draft vs Published Separation

### Draft Authoring Model
Stored across:
- `course_version`, `module_draft`, `lesson_draft`, `lesson_node_draft`, `interaction_draft`

Characteristics:
- mutable
- human-editable
- may be invalid/incomplete

### Published Runtime Model
Stored across:
- `runtime_package`, `runtime_lesson`, `runtime_node`

Characteristics:
- immutable after publish
- fully validated
- app-renderable without authoring joins

## 2) Runtime Package Manifest

`runtime_package.manifest_json` example:

```json
{
  "schemaVersion": 1,
  "course": {"id": "course_uuid", "title": "Course"},
  "packageVersion": 3,
  "publishedAt": "2026-03-29T00:00:00Z",
  "modules": [
    {
      "order": 1,
      "title": "Module 1",
      "lessons": [{"id": "lesson_uuid", "slug": "intro"}]
    }
  ]
}
```

## 3) Runtime Node Contract by Type

All nodes share:
- `id`
- `node_type`
- `order_index`
- `render_json`
- `completion_json`

### Video node (`node_type = video`)
`render_json`:
- `assetId`
- `durationSec`
- `captions` (optional)
- `overlays[]` (time-coded prompts)

### Reading node
`render_json`:
- `blocks[]` (rich text fragments, callouts, embeds)
- `estimatedMinutes`

### Quiz node
`render_json`:
- `quizMode` (`formative|summative`)
- `questions[]` with `questionKey`, `prompt`, `type`, `choices`, `answerKey` (optional hidden)
- `attemptPolicy` (`maxAttempts`, `shuffle`)

`scoring_json`:
- `passScore`
- `pointsByQuestion`

### Reflection node
`render_json`:
- `prompt`
- `minChars`
- `aiFeedbackEnabled`

### Scenario node
`render_json`:
- `entrySceneId`
- `scenes[]` with `sceneId`, `blocks`, `transitions[]`
- transition rules reference local variables in `state`

### AI-practice node
`render_json`:
- `mode` (`qa|coach|roleplay`)
- `systemPromptTemplate`
- `guardrails`
- `maxTurns`

### Resource node
`render_json`:
- `resources[]` with `assetId`, `label`, `kind`, `downloadable`

## 4) Interaction Primitive Contract (Scenario/Interactive Content)

`interaction_draft.graph_json` and published scenario payloads share conceptual schema:

```json
{
  "variables": [{"key": "score", "type": "number", "initial": 0}],
  "scenes": [
    {
      "id": "scene_1",
      "blocks": [{"type": "text", "props": {"value": "..."}}],
      "triggers": [
        {
          "event": "choice_selected",
          "conditions": [{"op": "eq", "left": "choice", "right": "A"}],
          "actions": [
            {"type": "set_variable", "key": "score", "value": 1},
            {"type": "go_to_scene", "sceneId": "scene_2"}
          ]
        }
      ]
    }
  ]
}
```

## 5) Rendering Rules (Next.js Runtime)

1. Load current entitlement + current `runtime_package` for course.
2. Load `runtime_lesson` and ordered `runtime_node` rows.
3. Node renderer switch on `node_type`.
4. Persist learner actions to `node_attempt` / `assessment_response`.
5. Evaluate completion rules from `completion_json`.
6. Update `progress_record`; create `completion_record` if threshold met.

## 6) Publish Transform (Draft -> Runtime)

Publishing service transformation steps:
1. Resolve selected `course_version` tree.
2. Validate node config + interaction graph schemas.
3. Strip author-only fields; resolve asset URLs/IDs.
4. Materialize `runtime_lesson` and `runtime_node` records.
5. Persist `manifest_json` with `schemaVersion`.
6. Mark package current; previous package remains for rollback.

## 7) Rollback Model

- Rollback sets previous `runtime_package.is_current=true`.
- New learner sessions use rolled-back package.
- Existing attempts keep `runtime_package_id` for consistency.
