"""Launcher tiện lợi khi chạy từ C:\\Users\\khanh\\Desktop\\demmo."""

# Ứng dụng và toàn bộ templates/static thực tế nằm trong thư mục slide.
from slide.app import app


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=3000, debug=False)
