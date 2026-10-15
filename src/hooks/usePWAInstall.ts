import { useEffect, useState, useCallback } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export function getCleanAppUrl(): string {
  if (typeof window !== 'undefined') {
    try {
      const origin = window.location.origin;
      if (origin && origin !== 'null' && !origin.startsWith('about:')) {
        return origin;
      }
      if (window.location.href && !window.location.href.startsWith('about:')) {
        const url = new URL(window.location.href);
        return url.origin;
      }
    } catch (err) {
      console.warn('Could not parse window.location:', err);
    }
    return window.location.href || '';
  }
  return '';
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isIframe, setIsIframe] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [appUrl, setAppUrl] = useState<string>(() => getCleanAppUrl());

  useEffect(() => {
    // Determine dynamic app URL
    const detectedUrl = getCleanAppUrl();
    if (detectedUrl) {
      setAppUrl(detectedUrl);
    }

    // Attempt to query server for reverse-proxy host if available
    fetch('/api/app-info')
      .then((res) => res.json())
      .then((data) => {
        if (data?.url && typeof data.url === 'string' && !data.url.includes('localhost')) {
          setAppUrl(data.url);
        }
      })
      .catch(() => {
        // Ignore fallback to client location
      });

    // Detect standalone mode (already installed as PWA)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsInstalled(isStandalone);

    // Detect if running inside iframe (e.g. AI Studio preview)
    try {
      setIsIframe(window.self !== window.top);
    } catch {
      setIsIframe(true);
    }

    // Detect iOS devices (Safari does not fire beforeinstallprompt)
    const ua = window.navigator.userAgent.toLowerCase();
    const isIOSDevice =
      /iphone|ipad|ipod/.test(ua) ||
      (window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1);
    setIsIOS(isIOSDevice);

    // Listen for browser install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const install = useCallback(async (): Promise<'accepted' | 'dismissed' | 'unsupported'> => {
    if (!deferredPrompt) return 'unsupported';
    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsInstalled(true);
        setDeferredPrompt(null);
        return 'accepted';
      }
      return 'dismissed';
    } catch (err) {
      console.warn('PWA install error:', err);
      return 'unsupported';
    }
  }, [deferredPrompt]);

  const toggleFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        }
      }
    } catch (err) {
      console.warn('Fullscreen error:', err);
    }
  }, []);

  return {
    isInstallable: !!deferredPrompt,
    isInstalled,
    isIOS,
    isIframe,
    isFullscreen,
    install,
    toggleFullscreen,
    appUrl: appUrl || getCleanAppUrl(),
    // Backward compatibility for any remaining caller
    shareUrl: appUrl || getCleanAppUrl(),
  };
}
