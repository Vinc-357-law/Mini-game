// Lưu ảnh Photobooth trong IndexedDB (không giới hạn 5MB như localStorage).
const DB_NAME = 'thoinoi-photos';
const STORE = 'photos';
let dbp = null;

function open() {
  if (!dbp) {
    dbp = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = () => {
        req.result.createObjectStore(STORE, { keyPath: 'id', autoIncrement: true });
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }
  return dbp;
}

async function tx(mode, fn) {
  const db = await open();
  return new Promise((resolve, reject) => {
    const t = db.transaction(STORE, mode);
    const store = t.objectStore(STORE);
    const out = fn(store);
    t.oncomplete = () => resolve(out && 'result' in out ? out.result : out);
    t.onerror = () => reject(t.error);
  });
}

export const addPhoto = (photo) => tx('readwrite', (s) => s.add(photo));
export const allPhotos = () => tx('readonly', (s) => s.getAll());
export const deletePhoto = (id) => tx('readwrite', (s) => s.delete(id));
export const clearPhotos = () => tx('readwrite', (s) => s.clear());
export const countPhotos = () => tx('readonly', (s) => s.count());
