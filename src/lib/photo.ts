// Client-side photo resize before upload
// 縮到 1024×1024 max + JPEG 0.8 → 通常 < 300KB,避開 Vercel 4.5MB body limit
// Canvas re-encoding 也會自動剝掉 EXIF (GPS / 拍照時間等),增加隱私
// iOS 照片注意:
//  - HEIC 預設格式 createImageBitmap 不支援,要給明確錯誤訊息
//  - EXIF orientation:必須帶 imageOrientation: "from-image" 否則直立照片變橫

const MAX_SIZE = 1024;
const QUALITY = 0.8;

export type ResizeResult = {
  blob: Blob;
  width: number;
  height: number;
  bytes: number;
};

// iPhone 預設拍照是 HEIC,瀏覽器不認 - 給 user 看得懂的錯誤訊息
function isHeicLike(file: File): boolean {
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();
  return (
    name.endsWith(".heic") ||
    name.endsWith(".heif") ||
    type === "image/heic" ||
    type === "image/heif"
  );
}

export async function resizePhoto(file: File): Promise<ResizeResult> {
  if (isHeicLike(file)) {
    throw new Error(
      "iPhone HEIC 格式不支援,請到「設定 → 相機 → 格式 → 最相容」改成 JPEG 後重拍"
    );
  }

  let bitmap: ImageBitmap;
  try {
    // imageOrientation: "from-image" → 讀 EXIF orientation tag 自動轉正,
    // 避免 iPhone 直立照片在 canvas 上變橫的
    bitmap = await createImageBitmap(file, {
      imageOrientation: "from-image",
    });
  } catch {
    throw new Error("圖片解碼失敗,請換一張或改用 JPG/PNG");
  }

  // 計算等比例縮放
  let { width, height } = bitmap;
  if (width > MAX_SIZE || height > MAX_SIZE) {
    if (width > height) {
      height = Math.round((height * MAX_SIZE) / width);
      width = MAX_SIZE;
    } else {
      width = Math.round((width * MAX_SIZE) / height);
      height = MAX_SIZE;
    }
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    throw new Error("Canvas 2D not supported");
  }

  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob: Blob = await new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("toBlob failed"))),
      "image/jpeg",
      QUALITY
    );
  });

  return { blob, width, height, bytes: blob.size };
}

export async function uploadPhoto(
  file: File,
  opts: { elderId: string; purpose: "record" | "expense" }
): Promise<{
  ok: boolean;
  path?: string;
  previewUrl?: string;
  error?: string;
}> {
  try {
    const resized = await resizePhoto(file);
    const fd = new FormData();
    fd.append("photo", resized.blob, "photo.jpg");
    fd.append("elderId", opts.elderId);
    fd.append("purpose", opts.purpose);
    const res = await fetch("/api/photo/upload", {
      method: "POST",
      body: fd,
    });
    const data = await res.json();
    if (!res.ok) return { ok: false, error: data.error ?? "上傳失敗" };
    // 預覽用 local blob URL (bucket 已轉 private,不再有公開 URL)
    const previewUrl = URL.createObjectURL(resized.blob);
    return { ok: true, path: data.path, previewUrl };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "未知錯誤" };
  }
}
