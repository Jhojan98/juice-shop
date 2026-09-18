from flask import Flask, request, jsonify

from rasp_agent import build_login_query

app = Flask(__name__)


@app.get("/")
def index():
    return jsonify(service="taller-waap-app", rasp="active")


@app.get("/health")
def health():
    return jsonify(status="ok")


@app.post("/login")
def login():
    data = request.get_json(force=True, silent=True) or {}
    query = build_login_query(data.get("username", ""), data.get("password", ""))
    return jsonify(query=query)


if __name__ == "__main__":
    # 0.0.0.0 requerido para publicar el puerto desde el contenedor (lab aislado)
    app.run(host="0.0.0.0", port=8080)  # nosemgrep: python.flask.security.audit.app-run-param-config.avoid_app_run_with_bad_host