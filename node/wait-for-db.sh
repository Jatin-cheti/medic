#!/usr/bin/env bash
# wait-for-db.sh: wait for multiple host:port entries, then exec the given command.
# Usage:
#   ./wait-for-db.sh mysql:3306 mongo:27017 redis:6379 -- npm run dev
# Services are host:port pairs before the `--`. Everything after `--` is the command to exec.

set -e

usage() {
  echo "Usage: $0 host:port [host:port ...] -- command [args...]"
  exit 1
}

if [ "$#" -lt 2 ]; then
  usage
fi

# split args into services (before --) and command (after --)
SERVICES=()
CMD=()
SEP_FOUND=0
for arg in "$@"; do
  if [ "$arg" = "--" ]; then
    SEP_FOUND=1
    continue
  fi
  if [ "$SEP_FOUND" -eq 0 ]; then
    SERVICES+=("$arg")
  else
    CMD+=("$arg")
  fi
done

if [ ${#SERVICES[@]} -eq 0 ] || [ ${#CMD[@]} -eq 0 ]; then
  usage
fi

# helper to test host:port using nc if available, otherwise fallback to bash /dev/tcp
check_host_port() {
  host="$1"
  port="$2"

  if command -v nc >/dev/null 2>&1; then
    nc -z -w5 "$host" "$port" >/dev/null 2>&1
    return $?
  fi

  # fallback: try bash /dev/tcp
  if [ -e /dev/tcp/"$host"/"$port" ] 2>/dev/null; then
    # This test path doesn't actually open; try using timeout trick
    (timeout 5 bash -c "cat < /dev/tcp/$host/$port") >/dev/null 2>&1 || return 0
  fi

  return 1
}

MAX_RETRIES=60
SLEEP=1
for svc in "${SERVICES[@]}"; do
  IFS=':' read -r host port <<<"$svc"
  if [ -z "$host" ] || [ -z "$port" ]; then
    echo "Invalid service entry: $svc (expected host:port)"
    exit 2
  fi

  echo "Waiting for $host:$port ..."
  n=0
  until check_host_port "$host" "$port"; do
    n=$((n+1))
    if [ $n -ge $MAX_RETRIES ]; then
      echo "Timeout waiting for $host:$port"
      exit 3
    fi
    sleep $SLEEP
  done
  echo "$host:$port is available"
done

# exec the command (replace process)
echo "All services ready — executing: ${CMD[*]}"
exec "${CMD[@]}"