# Project Atlas

A workspace for evaluating how well AI software finds and fixes intentionally
introduced bugs in open-source projects.

## Layout

```text
project-atlas/
├── projects/                 # Imported source projects
│   └── <project-id>/
│       ├── project.json      # Source, license, revision, and setup commands
│       ├── upstream/         # Untouched source at the recorded revision
│       └── cases/
│           └── <case-id>/
│               ├── workspace/ # Runnable copy containing the bug
│               ├── case.json  # Bug metadata and evaluation commands
│               └── oracle/     # Private expected fix and evaluator notes
├── templates/                # Files to copy when adding projects and cases
├── docs/                     # Benchmark conventions
├── scripts/                  # Future import, validation, and export tooling
└── results/                  # Local AI-run outputs; ignored by Git
```

## Workflow

1. Choose an open-source project with a compatible license.
2. Copy a fixed revision into `projects/<project-id>/upstream/`.
3. Record its provenance and commands in `project.json`.
4. Copy `upstream/` into `cases/<case-id>/workspace/`.
5. Introduce exactly the bug described by the case design.
6. Put the expected repair and evaluator-only explanation in `oracle/`.
7. Confirm the fail command fails before the fix and the pass command succeeds
   after it.
8. Give the AI only an exported `workspace/`, never the surrounding case folder.

Use stable IDs such as `express-001-null-header`. Keep one primary fault per
case so results remain interpretable.

## Adding the first project

Copy the relevant templates:

```sh
mkdir -p projects/<project-id>/{upstream,cases}
cp templates/project.json projects/<project-id>/project.json

mkdir -p projects/<project-id>/cases/<case-id>/{workspace,oracle}
cp templates/case.json projects/<project-id>/cases/<case-id>/case.json
cp templates/oracle.md projects/<project-id>/cases/<case-id>/oracle/notes.md
```

Edit every placeholder before using the case.

## Current projects

| Project | Baseline command | Log file |
| --- | --- | --- |
| `visionary` | `cd projects/visionary/upstream && npm run verify` | `~/.visionary/server.log` |
| `openai-to-mcp` | `cd projects/openai-to-mcp/upstream && npm run build && npm test` | `~/.openapi-mcp/logs/app-YYYY-MM-DD.log` |
| `image-service` | `cd projects/image-service/upstream && npm run build` | `projects/image-service/logs/run.log` |

Dependencies are installed locally but excluded from Git.
