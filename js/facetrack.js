// Photobooth bản Nâng cao: nhận diện khuôn mặt bằng MediaPipe để mũ tự bám theo đầu bé.
// Ưu tiên thư viện tải sẵn trong assets/vendor (chạy không cần mạng), dự phòng bằng CDN.
// Nếu không tải được hoặc không thấy mặt, face() trả về null → game dùng khung tròn cố định.

const V = '0.10.14';
const SOURCES = [
  {
    bundle: new URL('../assets/vendor/mediapipe/vision_bundle.js', import.meta.url).href,
    wasm: new URL('../assets/vendor/mediapipe/wasm', import.meta.url).href,
    model: new URL('../assets/vendor/mediapipe/blaze_face_short_range.tflite', import.meta.url).href,
  },
  {
    bundle: `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${V}/vision_bundle.mjs`,
    wasm: `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${V}/wasm`,
    model: 'https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite',
  },
];

let detector = null;
let loading = null;
let running = false;
let video = null;
let raf = 0;
let lastRun = 0;
let lastSeen = 0;
let box = null;        // khung mặt gần nhất (toạ độ video)
let smooth = null;     // vị trí đã làm mượt (toạ độ canvas)
export let status = 'off';   // off | loading | ready | fail

async function load() {
  if (detector) return;
  if (!loading) {
    loading = (async () => {
      status = 'loading';
      let lastErr;
      for (const src of SOURCES) {
        try {
          const mp = await import(src.bundle);
          const fileset = await mp.FilesetResolver.forVisionTasks(src.wasm);
          for (const delegate of ['GPU', 'CPU']) {
            try {
              detector = await mp.FaceDetector.createFromOptions(fileset, {
                baseOptions: { modelAssetPath: src.model, delegate },
                runningMode: 'VIDEO',
                minDetectionConfidence: 0.5,
              });
              status = 'ready';
              return;
            } catch (e) { lastErr = e; }
          }
        } catch (e) { lastErr = e; }
      }
      status = 'fail';
      loading = null;
      throw lastErr || new Error('Không tải được MediaPipe');
    })();
  }
  return loading;
}

export async function start(v) {
  video = v;
  running = true;
  try { await load(); }
  catch (e) { console.warn('Bám khuôn mặt không khả dụng, dùng khung cố định.', e); return false; }
  if (running) { cancelAnimationFrame(raf); loop(); }
  return true;
}

export function stop() {
  running = false;
  cancelAnimationFrame(raf);
  box = null;
  smooth = null;
}

function loop() {
  if (!running) return;
  const now = performance.now();
  if (detector && video && video.readyState >= 2 && now - lastRun > 60) {
    lastRun = now;
    try {
      const res = detector.detectForVideo(video, now);
      const faces = (res && res.detections) || [];
      if (faces.length) {
        // chọn khuôn mặt lớn nhất (bé đứng gần nhất)
        const best = faces.reduce((a, b) =>
          (b.boundingBox.width * b.boundingBox.height > a.boundingBox.width * a.boundingBox.height ? b : a));
        box = { ...best.boundingBox, vw: video.videoWidth, vh: video.videoHeight };
        lastSeen = now;
      }
    } catch { /* bỏ qua khung hình lỗi */ }
  }
  raf = requestAnimationFrame(loop);
}

// Trả về { cx, top, w } trong toạ độ canvas W×H (đã lật gương), hoặc null
export function face(W, H) {
  if (!running || !box || performance.now() - lastSeen > 900) { smooth = null; return null; }
  const scale = Math.max(W / box.vw, H / box.vh);
  const ox = (W - box.vw * scale) / 2;
  const oy = (H - box.vh * scale) / 2;
  const w = box.width * scale;
  const x = W - (ox + (box.originX + box.width) * scale);   // lật gương
  const target = { cx: x + w / 2, top: oy + box.originY * scale, w };
  if (!smooth) smooth = target;
  else {
    const k = 0.35;
    smooth = {
      cx: smooth.cx + (target.cx - smooth.cx) * k,
      top: smooth.top + (target.top - smooth.top) * k,
      w: smooth.w + (target.w - smooth.w) * k,
    };
  }
  return smooth;
}
