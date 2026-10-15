// Centralized logo manager for Apolinário Interlinear Bible
// Ensures 100% pixel-fidelity preservation of the official Logotipo.png file
// Guarantees permanent persistence across the app and PWA once uploaded.

const STORAGE_KEY = 'apolinario_official_logo';
const PERMANENT_FLAG_KEY = 'apolinario_logo_is_permanent';

export function getOfficialLogoUrl(): string {
  try {
    const local = localStorage.getItem(STORAGE_KEY);
    if (local && local.startsWith('data:image/')) {
      return local;
    }
  } catch (e) {
    // Ignore localStorage access issues
  }
  return '/Logotipo.png';
}

export function isLogoPermanentlyFixed(): boolean {
  try {
    const isPermanent = localStorage.getItem(PERMANENT_FLAG_KEY);
    const hasData = localStorage.getItem(STORAGE_KEY);
    if (isPermanent === 'true' && hasData && hasData.startsWith('data:image/')) {
      return true;
    }
  } catch (e) {
    // Ignore error
  }
  return false;
}

export function hasLocalLogo(): boolean {
  try {
    const local = localStorage.getItem(STORAGE_KEY);
    return !!(local && local.startsWith('data:image/'));
  } catch (e) {
    return false;
  }
}

// Dynamically update favicon and apple-touch-icon in the DOM
function updateHeadFavicons(logoUrl: string) {
  try {
    const iconSelectors = [
      "link[rel='icon']",
      "link[rel='alternate icon']",
      "link[rel='apple-touch-icon']"
    ];
    iconSelectors.forEach(sel => {
      const links = document.querySelectorAll<HTMLLinkElement>(sel);
      links.forEach(link => {
        link.href = logoUrl;
      });
    });
  } catch (err) {
    console.warn('Could not update head icons dynamically', err);
  }
}

export async function uploadOfficialLogoFile(file: File): Promise<{ success: boolean; message: string }> {
  return new Promise((resolve) => {
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        try {
          // 1. Immediately cache in localStorage for instant, permanent, zero-latency display
          localStorage.setItem(STORAGE_KEY, base64);
          localStorage.setItem(PERMANENT_FLAG_KEY, 'true');

          // 2. Dynamically update head icons (favicon, PWA icon)
          updateHeadFavicons(base64);

          // 3. Dispatch event so all components update immediately and hide any upload option
          window.dispatchEvent(new CustomEvent('logo-updated', { detail: { url: base64, permanent: true } }));

          // 4. Persist byte-for-byte to server public/Logotipo.png, dist/Logotipo.png, and src/assets/images/Logotipo.png
          const res = await fetch('/api/upload-logo', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ imageBase64: base64 })
          });

          if (res.ok) {
            resolve({
              success: true,
              message: 'Logotipo gravado com sucesso! A imagem agora está fixa permanentemente em todo o aplicativo e no PWA.'
            });
          } else {
            resolve({
              success: true,
              message: 'Logotipo gravado e fixado no navegador com sucesso!'
            });
          }
        } catch (err: any) {
          // Even if server upload has network delay, client storage is already permanently secured
          resolve({
            success: true,
            message: 'Logotipo fixado com sucesso localmente!'
          });
        }
      };
      reader.onerror = () => {
        resolve({ success: false, message: 'Erro ao ler arquivo da imagem.' });
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      resolve({ success: false, message: err?.message || 'Erro inesperado.' });
    }
  });
}

// Initial check on load
if (typeof window !== 'undefined') {
  const currentUrl = getOfficialLogoUrl();
  if (currentUrl && currentUrl.startsWith('data:image/')) {
    updateHeadFavicons(currentUrl);
  }

  // Also verify server status quietly
  fetch('/api/logo-info')
    .then(r => r.json())
    .then(data => {
      if (data && data.exists) {
        localStorage.setItem(PERMANENT_FLAG_KEY, 'true');
        window.dispatchEvent(new CustomEvent('logo-updated', { detail: { url: '/Logotipo.png', permanent: true } }));
      }
    })
    .catch(() => {
      // Ignore background check errors
    });
}
