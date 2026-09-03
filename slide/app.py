"""Ứng dụng Flask phục vụ website trình chiếu OWASP Input Validation."""

import re

from flask import Flask, jsonify, render_template, request, session


app = Flask(__name__)
# Khóa này chỉ dùng cho phiên demo local để lưu trạng thái công tắc theo trình duyệt.
app.secret_key = "owasp-input-validation-demo-local-only"


@app.get("/")
def index():
    """Hiển thị toàn bộ bài trình chiếu trên một trang."""
    # Mỗi lần mở lại bài trình chiếu, demo bắt đầu ở trạng thái an toàn: BẬT.
    session["server_validation"] = True
    return render_template("index.html")


@app.post("/dang-ky")
def dang_ky():
    """API minh họa sự khác nhau giữa validation ở client và server."""
    du_lieu = request.get_json(silent=True)

    if not isinstance(du_lieu, dict):
        return jsonify({"ket_qua": "LỖI", "loi": "Body phải là một JSON object hợp lệ."}), 400

    ho_ten = du_lieu.get("ho_ten")
    tuoi = du_lieu.get("tuoi")
    # Trạng thái kiểm tra nằm ở máy chủ, không nhận từ JSON đăng ký của client.
    server_validation = session.get("server_validation", True)

    # Công tắc này chỉ phục vụ demo. Hệ thống thật không được cho client tắt validation.
    if server_validation is not False:
        loi = []

        ho_ten_da_chuan_hoa = ho_ten.strip() if isinstance(ho_ten, str) else ""
        # Chấp nhận chữ Unicode (có tiếng Việt), khoảng trắng, dấu nháy và gạch nối.
        mau_ho_ten = r"[^\W\d_]+(?:[ '\-][^\W\d_]+)*"
        if (
            len(ho_ten_da_chuan_hoa) < 2
            or re.fullmatch(mau_ho_ten, ho_ten_da_chuan_hoa, flags=re.UNICODE) is None
        ):
            loi.append(
                "ho_ten phải có tối thiểu 2 ký tự và chỉ gồm chữ, khoảng trắng, dấu nháy hoặc gạch nối."
            )

        # Dùng type(...) is int để không vô tình chấp nhận boolean như một số nguyên.
        if type(tuoi) is not int or not 18 <= tuoi <= 60:
            loi.append("tuoi phải là int và nằm trong khoảng từ 18 đến 60.")

        if loi:
            return jsonify({
                "ket_qua": "LỖI",
                "kiem_tra_may_chu": "BẬT",
                "loi": loi,
                "thong_bao": "Máy chủ đã chặn dữ liệu không hợp lệ."
            }), 400

        return jsonify({
            "ket_qua": "ĐÚNG",
            "kiem_tra_may_chu": "BẬT",
            "thong_bao": "Đăng ký thành công.",
            "nguoi_dung": {"ho_ten": ho_ten_da_chuan_hoa, "tuoi": tuoi}
        }), 200

    # Nhánh cố ý không an toàn để chứng minh nguy cơ khi backend bỏ qua validation.
    return jsonify({
        "ket_qua": "ĐÚNG",
        "kiem_tra_may_chu": "TẮT",
        "canh_bao": "NGUY HIỂM: Máy chủ đang không kiểm tra và đã chấp nhận dữ liệu đầu vào.",
        "nguoi_dung_da_chap_nhan": {"ho_ten": ho_ten, "tuoi": tuoi}
    }), 200


@app.post("/demo/server-validation")
def cau_hinh_server_validation():
    """Đổi chế độ máy chủ cho phiên demo, tách biệt khỏi request đăng ký."""
    du_lieu = request.get_json(silent=True)
    enabled = du_lieu.get("enabled") if isinstance(du_lieu, dict) else None

    if type(enabled) is not bool:
        return jsonify({"ket_qua": "LỖI", "loi": "enabled phải là boolean."}), 400

    session["server_validation"] = enabled
    return jsonify({
        "ket_qua": "ĐÚNG",
        "kiem_tra_may_chu": "BẬT" if enabled else "TẮT"
    }), 200


if __name__ == "__main__":
    # Chạy ổn định trên cổng demo; không bật debugger khi trình chiếu.
    app.run(host="127.0.0.1", port=3000, debug=False)
