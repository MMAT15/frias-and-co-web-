#!/bin/sh

if [ -z "$husky_skip_init" ]; then
  debug() {
    [ "$HUSKY_DEBUG" = "1" ] && echo "husky: $*"
  }
  readonly hook_name="$(basename "$0")"
  debug "starting $hook_name..."
  readonly husky_dir="$(dirname "$0")/.."
  debug "husky_dir: $husky_dir"
  readonly git_params="$(printf '%q ' "$@")"
  if [ -f "$husky_dir/husky.sh" ]; then
    . "$husky_dir/husky.sh"
  else
    debug "running npx --no-install husky-run $hook_name $git_params"
    npx --no-install husky-run "$hook_name" $git_params
  fi
fi
