FROM nginxinc/nginx-unprivileged:stable-alpine
# Local-only static PAPER research room. No account API, no Bridge, no Python service.
COPY --chown=101:101 yoann-workspace.html /usr/share/nginx/html/index.html
COPY --chown=101:101 yoann-workspace.css /usr/share/nginx/html/yoann-workspace.css
COPY --chown=101:101 yoann-workspace.js /usr/share/nginx/html/yoann-workspace.js
COPY --chown=101:101 research-snapshot.json /usr/share/nginx/html/research-snapshot.json
USER 101:101
EXPOSE 8080
