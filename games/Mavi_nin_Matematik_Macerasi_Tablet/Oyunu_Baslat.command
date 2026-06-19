#!/bin/zsh

cd "$(dirname "$0")" || exit 1

PORT=8081
HOST="127.0.0.1"
URL="http://${HOST}:${PORT}/?v=boss-cinematic-2"
LOG_FILE=".mavi_server.log"
PID_FILE=".mavi_server.pid"

server_is_ready() {
  /usr/bin/curl -fsI "http://${HOST}:${PORT}" >/dev/null 2>&1
}

start_server() {
  if server_is_ready; then
    return
  fi

  if [ -f "$PID_FILE" ]; then
    OLD_PID="$(cat "$PID_FILE" 2>/dev/null)"
    if [ -n "$OLD_PID" ] && /bin/kill -0 "$OLD_PID" >/dev/null 2>&1; then
      return
    fi
  fi

  /usr/bin/nohup /usr/bin/env python3 -m http.server "$PORT" --bind "$HOST" >"$LOG_FILE" 2>&1 &
  echo $! > "$PID_FILE"

  for _ in {1..30}; do
    if server_is_ready; then
      return
    fi
    sleep 0.1
  done
}

start_server
/usr/bin/open "$URL"

sleep 0.5
/usr/bin/osascript >/dev/null 2>&1 <<'APPLESCRIPT'
tell application "Terminal"
  if (count of windows) > 0 then
    close front window
  end if
end tell
APPLESCRIPT

exit 0
