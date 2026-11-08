import { useState, useEffect, useCallback } from 'react';

/**
 * Utility to request full screen and lock screen orientation to landscape.
 * Safe across mobile browsers (Android Chrome, iOS Safari, WebViews, Desktop).
 */
export async function requestLandscapeAndFullscreen(): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  let fullscreenGranted = false;

  // 1. Enter Fullscreen (required by most browsers to lock orientation)
  try {
    const docEl = document.documentElement as HTMLElement & {
      requestFullscreen?: () => Promise<void>;
      webkitRequestFullscreen?: () => Promise<void>;
      mozRequestFullScreen?: () => Promise<void>;
      msRequestFullscreen?: () => Promise<void>;
    };

    if (!document.fullscreenElement && !(document as any).webkitFullscreenElement) {
      if (docEl.requestFullscreen) {
        await docEl.requestFullscreen().catch(() => {});
        fullscreenGranted = true;
      } else if (docEl.webkitRequestFullscreen) {
        await docEl.webkitRequestFullscreen().catch(() => {});
        fullscreenGranted = true;
      } else if (docEl.mozRequestFullScreen) {
        await docEl.mozRequestFullScreen().catch(() => {});
        fullscreenGranted = true;
      } else if (docEl.msRequestFullscreen) {
        await docEl.msRequestFullscreen().catch(() => {});
        fullscreenGranted = true;
      }
    } else {
      fullscreenGranted = true;
    }
  } catch (err) {
    console.debug('[Orientation] Fullscreen request prevented:', err);
  }

  // 2. Lock Orientation to Landscape via Screen Orientation API
  try {
    const screenObj = window.screen as any;
    const orientation = screenObj?.orientation || screenObj?.mozOrientation || screenObj?.msOrientation;

    if (orientation && typeof orientation.lock === 'function') {
      await orientation.lock('landscape').catch(async () => {
        // Fallback to landscape-primary if general 'landscape' is rejected
        await orientation.lock('landscape-primary').catch(() => {});
      });
      return true;
    } else if (screenObj?.lockOrientation) {
      screenObj.lockOrientation('landscape');
      return true;
    }
  } catch (err) {
    console.debug('[Orientation] Screen orientation lock not available or prevented:', err);
  }

  return fullscreenGranted;
}

/**
 * Safely exit fullscreen mode
 */
export async function exitFullscreen(): Promise<void> {
  if (typeof document === 'undefined') return;

  try {
    const doc = document as Document & {
      exitFullscreen?: () => Promise<void>;
      webkitExitFullscreen?: () => Promise<void>;
      mozCancelFullScreen?: () => Promise<void>;
      msExitFullscreen?: () => Promise<void>;
    };

    if (document.fullscreenElement || (document as any).webkitFullscreenElement) {
      if (doc.exitFullscreen) {
        await doc.exitFullscreen().catch(() => {});
      } else if (doc.webkitExitFullscreen) {
        await doc.webkitExitFullscreen().catch(() => {});
      } else if (doc.mozCancelFullScreen) {
        await doc.mozCancelFullScreen().catch(() => {});
      } else if (doc.msExitFullscreen) {
        await doc.msExitFullscreen().catch(() => {});
      }
    }

    // Attempt to unlock orientation if locked
    const screenObj = window.screen as any;
    if (screenObj?.orientation?.unlock) {
      screenObj.orientation.unlock();
    } else if (screenObj?.unlockOrientation) {
      screenObj.unlockOrientation();
    }
  } catch (err) {
    console.debug('[Orientation] Exit fullscreen error:', err);
  }
}

/**
 * Toggle Fullscreen & Landscape
 */
export async function toggleFullscreenAndLandscape(): Promise<boolean> {
  if (typeof document === 'undefined') return false;
  const isFs = Boolean(document.fullscreenElement || (document as any).webkitFullscreenElement);
  if (isFs) {
    await exitFullscreen();
    return false;
  } else {
    return await requestLandscapeAndFullscreen();
  }
}

/**
 * Hook to detect orientation changes and touch device state
 */
export function useDeviceOrientation() {
  const checkState = useCallback(() => {
    if (typeof window === 'undefined') {
      return { isPortrait: false, isLandscape: true, isMobile: false, isFullscreen: false };
    }

    const width = window.innerWidth;
    const height = window.innerHeight;
    const isPortrait = height > width;
    const isMobile =
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      /Android|iPhone|iPad|iPod|Mobile|Silk/i.test(navigator.userAgent);

    const isFullscreen = Boolean(
      document.fullscreenElement || (document as any).webkitFullscreenElement
    );

    return {
      isPortrait,
      isLandscape: !isPortrait,
      isMobile,
      isFullscreen,
      width,
      height,
    };
  }, []);

  const [state, setState] = useState(checkState);

  useEffect(() => {
    const handleUpdate = () => {
      setState(checkState());
    };

    window.addEventListener('resize', handleUpdate, { passive: true });
    window.addEventListener('orientationchange', handleUpdate, { passive: true });
    document.addEventListener('fullscreenchange', handleUpdate, { passive: true });
    document.addEventListener('webkitfullscreenchange', handleUpdate, { passive: true });

    if (window.screen?.orientation) {
      window.screen.orientation.addEventListener('change', handleUpdate);
    }

    return () => {
      window.removeEventListener('resize', handleUpdate);
      window.removeEventListener('orientationchange', handleUpdate);
      document.removeEventListener('fullscreenchange', handleUpdate);
      document.removeEventListener('webkitfullscreenchange', handleUpdate);
      if (window.screen?.orientation) {
        window.screen.orientation.removeEventListener('change', handleUpdate);
      }
    };
  }, [checkState]);

  return state;
}
