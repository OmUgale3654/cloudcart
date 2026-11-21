#!/usr/bin/env bash
# CloudCart Maven Runner Script

set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"
LOCAL_MAVEN="/Users/omugale/.gemini/antigravity/scratch/tools/apache-maven-3.9.9/bin/mvn"

if [ -f "$LOCAL_MAVEN" ]; then
    exec "$LOCAL_MAVEN" "$@"
elif command -v mvn >/dev/null 2>&1; then
    exec mvn "$@"
else
    echo "Error: Maven not found." >&2
    exit 1
fi
