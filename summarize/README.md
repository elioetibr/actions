# Summarize Action

Write a beautiful structured summary to the GitHub Step Summary panel.

Accepts payload in three auto-detected formats — JSON, YAML, or plain Markdown —
and renders it as rich HTML in the workflow summary tab. ANSI escape codes are
automatically stripped from all text content before rendering.

## Usage

### JSON format

```yaml
- name: Write summary
  uses: elioetibr/actions/summarize@v1
  with:
    payload: |
      {
        "title": "Deployment Report",
        "status": "success",
        "sections": [
          {
            "type": "table",
            "rows": [
              [{ "data": "Environment", "header": true }, { "data": "Status", "header": true }],
              ["production", "deployed"]
            ]
          },
          {
            "type": "details",
            "summary": "Full logs",
            "content": "Step 1 passed\nStep 2 passed"
          }
        ]
      }
```

### YAML format

```yaml
- name: Write summary
  uses: elioetibr/actions/summarize@v1
  with:
    payload: |
      title: "Test Results"
      status: warning
      sections:
        - type: heading
          text: "Test Suite A"
          level: 3
        - type: list
          items:
            - "42 passed"
            - "2 skipped"
            - "0 failed"
        - type: code
          language: bash
          content: "npm test -- --coverage"
```

### Markdown format

```yaml
- name: Write summary
  uses: elioetibr/actions/summarize@v1
  with:
    payload: |
      # Release v2.4.0

      All checks passed. The release was published to the registry.

      ## Artifacts

      - `app-amd64.tar.gz`
      - `app-arm64.tar.gz`
```

## Inputs

| Input               | Required | Default  | Description                                                                              |
| ------------------- | -------- | -------- | ---------------------------------------------------------------------------------------- |
| `payload`           | yes      | —        | Summary content in JSON, YAML, or Markdown format                                        |
| `compact`           | no       | `true`   | Collapse non-critical sections when content exceeds `compact-threshold`                  |
| `compact-threshold` | no       | `900000` | Character threshold that triggers compacting (GitHub Step Summary hard limit: 1 048 576) |
| `overwrite`         | no       | `true`   | Overwrite the existing step summary instead of appending                                 |

## Outputs

| Output            | Description                                          |
| ----------------- | ---------------------------------------------------- |
| `character-count` | Number of characters written to the step summary     |
| `was-compacted`   | Whether compacting was applied (`true` or `false`)   |
| `format-detected` | Input format detected: `json`, `yaml`, or `markdown` |

## Section types reference

| Type        | Required fields      | Optional fields                   | Notes                                                                                     |
| ----------- | -------------------- | --------------------------------- | ----------------------------------------------------------------------------------------- |
| `table`     | `rows`               | —                                 | `rows` is a 2-D array; cells can be a `string` or `{ data, header?, colspan?, rowspan? }` |
| `details`   | `summary`, `content` | `open`, `critical`                | Renders as `<details>`. Set `open: true` to expand by default                             |
| `list`      | `items`              | `ordered`, `heading`, `critical`  | `ordered: true` renders `<ol>`; default is `<ul>`                                         |
| `code`      | `content`            | `language`, `heading`, `critical` | Rendered inside `<pre><code>`                                                             |
| `heading`   | `text`               | `level`                           | `level` defaults to `3`; accepts `1`–`6`                                                  |
| `quote`     | `text`               | `cite`                            | Renders as `<blockquote>`                                                                 |
| `raw`       | `content`            | —                                 | Content is written verbatim (after ANSI stripping)                                        |
| `separator` | —                    | —                                 | Renders as `<hr>`                                                                         |

## Compacting behaviour

When `compact: true` and the rendered HTML exceeds `compact-threshold`
characters, eligible sections are automatically wrapped in a collapsed
`<details>` element to keep the summary within GitHub's 1 048 576 character
limit.

Sections that are **never** compacted:

- `table`
- `heading`
- `quote`
- `separator`
- Any section with `critical: true`

Sections shorter than 500 characters are also left expanded regardless of the
flag.

## ANSI stripping

All text content (section bodies, list items, code blocks, raw sections) is
automatically stripped of ANSI/VT100 escape sequences before rendering. This
means you can pass raw terminal output directly without pre-processing.

## Character limits

| Limit                          | Value                |
| ------------------------------ | -------------------- |
| GitHub Step Summary hard limit | 1 048 576 characters |
| Default `compact-threshold`    | 900 000 characters   |

Set `compact-threshold` lower if your summaries include large base64 blobs or
binary-encoded content that inflates the character count beyond what the
rendered text suggests.
