import { useState } from "react";

const DISMISS_KEY = "aprende_ingles_install_banner_dismissed";

export default function InstallPrompt({
  isInstalled,
  isIos,
  canPromptInstall,
  onInstall,
}) {
  const [dismissed, setDismissed] = useState(
    () => sessionStorage.getItem(DISMISS_KEY) === "1"
  );

  const isMobile =
    typeof navigator !== "undefined" &&
    /android|iphone|ipad|ipod/i.test(navigator.userAgent);

  if (isInstalled || dismissed) return null;
  if (!canPromptInstall && !isIos && !isMobile) return null;

  const handleClose = () => {
    sessionStorage.setItem(DISMISS_KEY, "1");
    setDismissed(true);
  };

  return (
    <aside
      className="install-banner"
      role="region"
      aria-label="Instalar aplicación"
    >
      <img
        src="/icon-192.png"
        alt="Logotipo Aprende Inglés"
        className="install-banner-logo"
      />
      <div className="install-banner-text">
        <strong>Descargar Aprende Inglés</strong>
        <span>Instálala en tu celular con su logotipo.</span>
      </div>
      <div className="install-banner-actions">
        <button type="button" className="btn-install-now" onClick={onInstall}>
          Instalar
        </button>
        <button
          type="button"
          className="btn-install-close"
          onClick={handleClose}
          aria-label="Cerrar aviso"
        >
          ✕
        </button>
      </div>
    </aside>
  );
}