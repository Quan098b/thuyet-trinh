"""Entry point cho Firebase Cloud Functions (2nd gen) — bọc Flask app thật.

Không đổi logic: chỉ chuyển tiếp request/response qua app Flask có sẵn
trong app.py (import từ slide.app), y hệt cách app.py chạy ở local.
"""

from firebase_functions import https_fn

from app import app as flask_app


@https_fn.on_request(region="asia-southeast1")
def owaspapp(req: https_fn.Request) -> https_fn.Response:
    with flask_app.request_context(req.environ):
        return flask_app.full_dispatch_request()
