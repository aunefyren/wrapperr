#!/bin/sh

# Start building the command
set -- /app/wrapperr

[ -n "$port" ] && set -- "$@" --port "$port"
[ -n "$timezone" ] && set -- "$@" --timezone "$timezone"
[ -n "$applicationname" ] && set -- "$@" --applicationname "$applicationname"
[ -n "$createsharelink" ] && set -- "$@" --createsharelink "$createsharelink"
[ -n "$plexauth" ] && set -- "$@" --plexauth "$plexauth"

# Run the command safely
exec "$@"
