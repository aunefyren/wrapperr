#!/bin/sh

# Maps environment variables onto Wrapperr command-line flags.
#
# The preferred convention is UPPER_SNAKE_CASE (e.g. APPLICATION_NAME). The
# original lowercase names (port, timezone, applicationname, createsharelink,
# plexauth) are still honoured as a fallback so existing deployments keep
# working. Only variables that are actually set are forwarded, so unset
# variables leave the value in config.json untouched.

# pick <NEW_NAME> <old_name> -> echoes whichever is set (new takes priority)
pick() {
	eval "new=\$$1"
	eval "old=\$$2"
	[ -n "$new" ] && { printf '%s' "$new"; return; }
	[ -n "$old" ] && printf '%s' "$old"
}

# Start building the command
set -- /app/wrapperr

v=$(pick PORT port);                       [ -n "$v" ] && set -- "$@" --port "$v"
v=$(pick TIMEZONE timezone);               [ -n "$v" ] && set -- "$@" --timezone "$v"
v=$(pick APPLICATION_NAME applicationname); [ -n "$v" ] && set -- "$@" --applicationname "$v"
v=$(pick APPLICATION_URL applicationurl);   [ -n "$v" ] && set -- "$@" --applicationurl "$v"
v=$(pick WRAPPERR_ROOT wrapperrroot);       [ -n "$v" ] && set -- "$@" --wrapperrroot "$v"
v=$(pick CREATE_SHARE_LINK createsharelink);[ -n "$v" ] && set -- "$@" --createsharelink "$v"
v=$(pick PLEX_AUTH plexauth);              [ -n "$v" ] && set -- "$@" --plexauth "$v"
v=$(pick BASIC_AUTH basicauth);            [ -n "$v" ] && set -- "$@" --basicauth "$v"
v=$(pick USE_CACHE usecache);              [ -n "$v" ] && set -- "$@" --usecache "$v"
v=$(pick USE_LOGS uselogs);                [ -n "$v" ] && set -- "$@" --uselogs "$v"
v=$(pick WINTER_THEME wintertheme);        [ -n "$v" ] && set -- "$@" --wintertheme "$v"
v=$(pick DISABLE_ADMIN_PAGE disableadminpage); [ -n "$v" ] && set -- "$@" --disableadminpage "$v"

# Drop privileges to PUID:PGID (default 1000:1000) when started as root.
#
# Running as root, take ownership of the writable data directory and re-exec as
# the requested user. If the container was already started as a non-root user
# (e.g. `docker run --user 1000:1000`), skip this and run directly.
if [ "$(id -u)" = "0" ]; then
	PUID="${PUID:-1000}"
	PGID="${PGID:-1000}"

	# Everything Wrapperr writes lives under ./config, so only that needs to be owned by the runtime user.
	chown -R "$PUID:$PGID" /app/config 2>/dev/null || true

	# Run the command safely as the unprivileged user
	exec setpriv --reuid "$PUID" --regid "$PGID" --clear-groups "$@"
fi

# Already non-root; run the command safely
exec "$@"
