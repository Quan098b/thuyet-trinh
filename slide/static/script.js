"use strict";

const slides = [...document.querySelectorAll(".slide")];
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const fullscreenBtn = document.getElementById("fullscreenBtn");
const notesBtn = document.getElementById("notesBtn");
const slideCounter = document.getElementById("slideCounter");
const progressBar = document.getElementById("progressBar");
const presenterNotes = document.getElementById("presenterNotes");
const presenterText = document.getElementById("presenterText");
let currentSlide = 0;

function showSlide(index) {
    currentSlide = Math.max(0, Math.min(index, slides.length - 1));

    slides.forEach((slide, position) => {
        const isActive = position === currentSlide;
        slide.classList.toggle("active", isActive);
        slide.setAttribute("aria-hidden", String(!isActive));
    });

    prevBtn.disabled = currentSlide === 0;
    nextBtn.disabled = currentSlide === slides.length - 1;
    slideCounter.textContent = `${String(currentSlide + 1).padStart(2, "0")} / ${String(slides.length).padStart(2, "0")}`;
    progressBar.style.width = `${((currentSlide + 1) / slides.length) * 100}%`;
    presenterText.textContent = slides[currentSlide].querySelector(".speaker-script")?.textContent.trim() || "";
    history.replaceState(null, "", `#slide-${currentSlide + 1}`);
}

function togglePresenterNotes() {
    const willShow = presenterNotes.hidden;
    presenterNotes.hidden = !willShow;
    notesBtn.setAttribute("aria-pressed", String(willShow));
    notesBtn.classList.toggle("active", willShow);
}

prevBtn.addEventListener("click", () => showSlide(currentSlide - 1));
nextBtn.addEventListener("click", () => showSlide(currentSlide + 1));

document.addEventListener("keydown", (event) => {
    // Không chiếm phím mũi tên khi người dùng đang nhập liệu ở slide demo.
    const isEditing = ["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement?.tagName);
    if (isEditing) return;

    if (event.key.toLowerCase() === "n") {
        event.preventDefault();
        togglePresenterNotes();
        return;
    }

    if (event.key === "ArrowRight" || event.key === "PageDown" || event.key === " ") {
        event.preventDefault();
        showSlide(currentSlide + 1);
    }
    if (event.key === "ArrowLeft" || event.key === "PageUp") {
        event.preventDefault();
        showSlide(currentSlide - 1);
    }
    if (event.key === "Home") showSlide(0);
    if (event.key === "End") showSlide(slides.length - 1);
});

notesBtn.addEventListener("click", togglePresenterNotes);

fullscreenBtn.addEventListener("click", async () => {
    try {
        if (!document.fullscreenElement) {
            await document.documentElement.requestFullscreen();
        } else {
            await document.exitFullscreen();
        }
    } catch (error) {
        console.warn("Không thể bật toàn màn hình:", error);
    }
});

// Khởi tạo từ hash, ví dụ /#slide-6 để vào thẳng phần demo.
const initialMatch = window.location.hash.match(/^#slide-(\d+)$/);
showSlide(initialMatch ? Number(initialMatch[1]) - 1 : 0);

const form = document.getElementById("registrationForm");
const hoTenInput = document.getElementById("hoTen");
const tuoiInput = document.getElementById("tuoi");
const bypassBtn = document.getElementById("bypassBtn");
const serverValidation = document.getElementById("serverValidation");
const serverState = document.getElementById("serverState");
const unsafeBanner = document.getElementById("unsafeBanner");
const clientMessage = document.getElementById("clientMessage");
const clientJsonLabel = document.getElementById("clientJsonLabel");
const clientJson = document.getElementById("clientJson");
const requestArrow = document.getElementById("requestArrow");
const arrowLabel = document.getElementById("arrowLabel");
const arrowSymbol = document.getElementById("arrowSymbol");
const requestLabel = document.getElementById("requestLabel");
const requestJson = document.getElementById("requestJson");
const responseLabel = document.getElementById("responseLabel");
const responseJson = document.getElementById("responseJson");
const httpStatus = document.getElementById("httpStatus");
const clientStatus = document.getElementById("clientStatus");
const serverStatus = document.getElementById("serverStatus");

// Unicode property escape giúp kiểm tra đúng cả chữ cái tiếng Việt.
const mauHoTen = /^[\p{L}]+(?:[ '\-][\p{L}]+)*$/u;

function setArrowState(state, label, symbol) {
    requestArrow.className = `client-server-arrow ${state}`;
    arrowLabel.textContent = label;
    arrowSymbol.textContent = symbol;
}

function showClientMessage(type, message) {
    clientMessage.hidden = false;
    clientMessage.className = `client-message ${type}`;
    clientMessage.textContent = message;
}

function setSideStatus(element, state, text) {
    element.className = `side-status ${state}`;
    element.textContent = text;
}

serverValidation.addEventListener("change", async () => {
    const enabled = serverValidation.checked;
    serverState.textContent = enabled ? "BẬT" : "TẮT";
    serverState.style.color = enabled ? "var(--success)" : "var(--danger)";
    unsafeBanner.hidden = enabled;
    serverValidation.disabled = true;

    try {
        const response = await fetch("/demo/server-validation", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ enabled })
        });
        if (!response.ok) throw new Error("Máy chủ không đổi được chế độ kiểm tra.");
    } catch (error) {
        // Nếu cấu hình thất bại, trả công tắc về trạng thái trước đó.
        serverValidation.checked = !enabled;
        serverState.textContent = !enabled ? "BẬT" : "TẮT";
        serverState.style.color = !enabled ? "var(--success)" : "var(--danger)";
        unsafeBanner.hidden = !enabled;
        showClientMessage("error", `✕ Không thể đổi chế độ máy chủ: ${error.message}`);
    } finally {
        serverValidation.disabled = false;
    }
});

[hoTenInput, tuoiInput].forEach((input) => {
    input.addEventListener("input", () => input.classList.remove("invalid"));
});

form.addEventListener("submit", async (event) => {
    event.preventDefault();

    // Client-side validation: chặn request sai trước khi fetch được gọi.
    const hoTen = hoTenInput.value.trim();
    const hoTenHopLe = hoTen.length >= 2 && mauHoTen.test(hoTen);
    const tuoi = Number(tuoiInput.value);
    const tuoiHopLe = Number.isInteger(tuoi) && tuoi >= 18 && tuoi <= 60;
    hoTenInput.classList.toggle("invalid", !hoTenHopLe);
    tuoiInput.classList.toggle("invalid", !tuoiHopLe);

    if (!hoTenHopLe || !tuoiHopLe) {
        const duLieuBiChan = {
            ho_ten: hoTen,
            tuoi: tuoiInput.value === "" ? null : tuoi
        };
        const loiClient = [];
        if (!hoTenHopLe) loiClient.push("Họ tên không hợp lệ.");
        if (!tuoiHopLe) loiClient.push("Tuổi phải từ 18 đến 60.");

        setSideStatus(clientStatus, "error", "LỖI");
        setSideStatus(serverStatus, "waiting", "CHỜ");
        clientJsonLabel.textContent = "JSON BỊ CLIENT CHẶN";
        clientJson.textContent = JSON.stringify(duLieuBiChan, null, 2);
        requestLabel.textContent = "SERVER KHÔNG NHẬN DỮ LIỆU";
        requestJson.textContent = JSON.stringify({
            trang_thai: "KHÔNG NHẬN"
        }, null, 2);
        httpStatus.textContent = "LỖI · KHÔNG GỬI";
        httpStatus.className = "status error";
        responseLabel.textContent = "SERVER CHƯA PHẢN HỒI";
        responseJson.textContent = JSON.stringify({
            ket_qua: "CHƯA XỬ LÝ"
        }, null, 2);
        setArrowState("blocked", "CLIENT CHẶN", "✕");
        showClientMessage("error", `✕ ${loiClient.join(" ")}`);
        return;
    }

    await sendRegistration({
        ho_ten: hoTen,
        tuoi
    }, false);
});

bypassBtn.addEventListener("click", async () => {
    // Bỏ qua hoàn toàn form và gửi JSON giả lập từ Postman/DevTools.
    // Giữ tên đang nhập nếu hợp lệ để người xem tập trung vào tuổi -100 bị bypass.
    const hoTenHienTai = hoTenInput.value.trim();
    const hoTenBypass = hoTenHienTai.length >= 2 && mauHoTen.test(hoTenHienTai)
        ? hoTenHienTai
        : "Quan";

    await sendRegistration({
        ho_ten: hoTenBypass,
        tuoi: -100
    }, true);
});

async function sendRegistration(payload, isBypass) {
    setSideStatus(clientStatus, isBypass ? "bypass" : "success", isBypass ? "BỎ QUA" : "ĐÚNG");
    setSideStatus(serverStatus, "waiting", "ĐANG XỬ LÝ");
    clientJsonLabel.textContent = isBypass ? "JSON CLIENT TỰ TẠO ĐỂ GỬI" : "JSON CLIENT GỬI ĐI";
    clientJson.textContent = JSON.stringify(payload, null, 2);
    requestLabel.textContent = "JSON SERVER NHẬN ĐƯỢC";
    requestJson.textContent = JSON.stringify(payload, null, 2);
    httpStatus.textContent = "ĐANG XỬ LÝ…";
    httpStatus.className = "status waiting";
    responseLabel.textContent = "JSON SERVER TRẢ VỀ CLIENT";
    responseJson.textContent = "Đang chờ server…";
    setArrowState("sending", "ĐANG GỬI", "→");
    showClientMessage(
        isBypass ? "bypass" : "success",
        isBypass
            ? "⚠ Bỏ qua kiểm tra: gửi tuổi -100."
            : "✓ Dữ liệu hợp lệ, đã gửi sang server."
    );

    try {
        const response = await fetch("/dang-ky", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        const data = await response.json();

        httpStatus.textContent = `${response.ok ? "ĐÚNG" : "LỖI"} · HTTP ${response.status}`;
        httpStatus.className = `status ${response.ok ? "success" : "error"}`;
        responseJson.textContent = JSON.stringify(data, null, 2);
        setSideStatus(serverStatus, response.ok ? "success" : "error", response.ok ? "ĐÚNG" : "LỖI");
        setArrowState(
            response.ok ? "accepted" : "rejected",
            response.ok ? "SERVER NHẬN" : "SERVER CHẶN",
            response.ok ? "→ ✓" : "→ ✕"
        );
    } catch (error) {
        httpStatus.textContent = "LỖI KẾT NỐI";
        httpStatus.className = "status error";
        responseJson.textContent = JSON.stringify({ loi: error.message }, null, 2);
        setSideStatus(serverStatus, "error", "LỖI");
        setArrowState("rejected", "LỖI KẾT NỐI", "✕");
    }
}
