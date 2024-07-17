#!/bin/bash

# Function to update version and push changes
update_version_and_push() {
  local dir=$1
  local version_type=$2
  cd $dir || { echo "Directory $dir not found"; exit 1; }
  npm --no-git-tag-version version $version_type || { echo "npm version $version_type failed"; exit 1; }
  git add package.json
  cd - || exit
}

# Function to commit and push changes
commit_and_push() {
  local message=$1
  git commit -m "$message"
  git push --set-upstream origin "$(git rev-parse --abbrev-ref HEAD)"
}

# Check for required arguments
if [ $# -ne 2 ]; then
  echo "Usage: $0 <patch|minor|major> <frontend|backend|both>"
  exit 1
fi

version_type=$1
target=$2

case $target in
  frontend)
    update_version_and_push "client" "$version_type"
    commit_and_push "frontend: $version_type version update"
    ;;
  backend)
    update_version_and_push "server" "$version_type"
    commit_and_push "backend: $version_type version update"
    ;;
  both)
    update_version_and_push "client" "$version_type"
    update_version_and_push "server" "$version_type"
    commit_and_push "frontend and backend: $version_type version update"
    ;;
  *)
    echo "Invalid argument: $target. Use 'frontend', 'backend', or 'both'."
    exit 1
    ;;
esac
