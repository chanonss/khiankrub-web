// Browser bootstrap only: reject phone screens before Trunk downloads the Wasm.
// The editor and font-loading stages remain in Rust.
export function isPhoneScreen({ userAgent, mobile, maxTouchPoints, coarse, width, height }) {
  // iPadOS may identify as a Mac; its physical screen stays tablet-sized in Split View.
  const shortEdge = Math.min(width, height);
  const ipad = /iPad/i.test(userAgent) || (/Macintosh/i.test(userAgent) && maxTouchPoints > 1 && shortEdge >= 600);
  if (ipad) return false;
  if (mobile || /iPhone|iPod|Windows Phone|Android.*Mobile/i.test(userAgent)) return true;
  // Also catch phones using a desktop user agent, without blocking a narrow desktop window.
  return coarse && shortEdge > 0 && shortEdge < 600;
}

export default function loading() {
  const progress = document.getElementById("wordcraft_progress");
  const status = document.getElementById("wordcraft_loading_status");
  const message = (text) => {
    if (status) status.textContent = text;
  };
  return {
    onStart() {
      if (!isPhoneScreen({
        userAgent: navigator.userAgent,
        mobile: navigator.userAgentData?.mobile ?? false,
        maxTouchPoints: navigator.maxTouchPoints,
        coarse: matchMedia("(pointer: coarse)").matches,
        width: screen.width,
        height: screen.height,
      })) return;
      if (progress) progress.hidden = true;
      document.getElementById("wordcraft_canvas")?.remove();
      document.getElementById("wordcraft_loading")?.setAttribute("aria-busy", "false");
      status?.setAttribute("role", "alert");
      message("เขียนครับยังไม่รองรับการใช้งานบนโทรศัพท์มือถือ");
      const note = document.createElement("p");
      note.className = "loading-note";
      note.textContent = "กรุณาเปิดด้วยคอมพิวเตอร์หรือ iPad";
      document.getElementById("wordcraft_loading")?.appendChild(note);
      // Trunk invokes onStart before fetch; stop both the download and editor initialization.
      throw new DOMException("KhianKrub does not support phone screens", "NotSupportedError");
    },
    onFailure(error) {
      console.error("KhianKrub could not start", error);
      if (progress) progress.hidden = true;
      document.getElementById("wordcraft_loading")?.setAttribute("aria-busy", "false");
      message("ไม่สามารถเปิดเขียนครับได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต แล้วโหลดหน้านี้ใหม่");
    },
  };
}
