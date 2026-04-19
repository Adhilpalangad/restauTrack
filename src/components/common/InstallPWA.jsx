import { useState, useEffect } from 'react';
import { Download } from 'lucide-react';

const InstallPWA = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  // Only show the button if the browser fires the event (meaning it's installable)
  if (!deferredPrompt) return null;

  return (
    <button
      onClick={handleInstallClick}
      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full transition-all active:scale-95"
      style={{
        background: 'var(--btn-ghost-bg)',
        border: '1px solid var(--btn-ghost-border)',
        color: 'var(--btn-ghost-color)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'var(--btn-ghost-bg-hover)';
        e.currentTarget.style.color = 'var(--btn-ghost-color-hover)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'var(--btn-ghost-bg)';
        e.currentTarget.style.color = 'var(--btn-ghost-color)';
      }}
    >
      <Download className="w-3.5 h-3.5" />
      <span>Install</span>
    </button>
  );
};

export default InstallPWA;
