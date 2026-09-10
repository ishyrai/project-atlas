#!/bin/bash
set -euo pipefail

project_dir="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
log_dir="$project_dir/logs"
log_file="$log_dir/run.log"

mkdir -p "$log_dir"
cd "$project_dir/upstream"

{
  printf '\n[%s] npm run build\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
  npm run build
  printf '[%s] node dist/index.js %s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$*"
  node dist/index.js "$@"
} 2>&1 | tee -a "$log_file"
