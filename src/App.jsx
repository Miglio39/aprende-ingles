import { useEffect, useState } from "react";
import { MODULES } from "./data/modules";
import { VERBS } from "./data/verbs";
import { ANIMALS } from "./data/animals";
import { FAMILY } from "./data/family";
import VerbCard from "./components/VerbCard";
import VocabCard from "./components/VocabCard";
import InstallPrompt from "./components/InstallPrompt";
import { usePwaInstall } from "./hooks/usePwaInstall";
import { isSfxEnabled, playNextSound, setSfxEnabled } from "./utils/sounds";
import "./App.css";

const LEGACY_VERBS_STORAGE_KEY = "aprende_ingles_approved_verbs";
const VERBS_BY_MODE_STORAGE_KEY = "aprende_ingles_approved_verbs_by_mode";
const VERB_MODE_STORAGE_KEY = "aprende_ingles_verb_mode";
const ANIMALS_STORAGE_KEY = "aprende_ingles_approved_animals";
const FAMILY_STORAGE_KEY = "aprende_ingles_approved_family";

const VERB_MODES = [
  { id: "infinitive", label: "Infinitivo", shortLabel: "Infinitivo" },
  { id: "past", label: "Pasado simple", shortLabel: "P. simple" },
  { id: "participle", label: "Pasado participio", shortLabel: "Participio" },
  { id: "all", label: "Los 3 tiempos", shortLabel: "Los 3" },
];

const DEFAULT_VERBS_PROGRESS = {
  infinitive: [],
  past: [],
  participle: [],
  all: [],
};

export default function App() {
  const [activeView, setActiveView] = useState("menu");
  const [comingSoonModule, setComingSoonModule] = useState(null);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [sfxOn, setSfxOn] = useState(isSfxEnabled);

  const { isInstalled, isIos, canPromptInstall, promptInstall } =
    usePwaInstall();

  // Estado módulo Verbos (con modo de práctica independiente)
  const [verbMode, setVerbMode] = useState(() => {
    const saved = localStorage.getItem(VERB_MODE_STORAGE_KEY);
    return VERB_MODES.some((m) => m.id === saved) ? saved : "all";
  });
  const [verbIndex, setVerbIndex] = useState(0);
  const [verbResetKey, setVerbResetKey] = useState(0);
  const [approvedVerbsByMode, setApprovedVerbsByMode] = useState(() => {
    const savedByMode = localStorage.getItem(VERBS_BY_MODE_STORAGE_KEY);
    if (savedByMode) {
      return { ...DEFAULT_VERBS_PROGRESS, ...JSON.parse(savedByMode) };
    }

    const legacySaved = localStorage.getItem(LEGACY_VERBS_STORAGE_KEY);
    return {
      ...DEFAULT_VERBS_PROGRESS,
      all: legacySaved ? JSON.parse(legacySaved) : [],
    };
  });

  // Estado módulo Animales
  const [animalIndex, setAnimalIndex] = useState(0);
  const [animalResetKey, setAnimalResetKey] = useState(0);
  const [approvedAnimalIds, setApprovedAnimalIds] = useState(() => {
    const saved = localStorage.getItem(ANIMALS_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  // Estado módulo Familia
  const [familyIndex, setFamilyIndex] = useState(0);
  const [familyResetKey, setFamilyResetKey] = useState(0);
  const [approvedFamilyIds, setApprovedFamilyIds] = useState(() => {
    const saved = localStorage.getItem(FAMILY_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  // Permite desplazar suavemente al campo activo sobre el teclado sin cambiar el tamaño de la tarjeta
  useEffect(() => {
    let scrollTimer;

    const syncViewport = () => {
      const vv = window.visualViewport;
      const height = vv ? vv.height : window.innerHeight;
      document.documentElement.style.setProperty("--app-height", `${height}px`);
    };

    const handleFocusIn = (e) => {
      if (e.target.tagName !== "INPUT") return;
      if (window.innerWidth > 767) return;
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => {
        syncViewport();
        e.target.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 220);
    };

    syncViewport();
    document.addEventListener("focusin", handleFocusIn);
    window.addEventListener("resize", syncViewport);
    window.visualViewport?.addEventListener("resize", syncViewport);

    return () => {
      clearTimeout(scrollTimer);
      document.removeEventListener("focusin", handleFocusIn);
      window.removeEventListener("resize", syncViewport);
      window.visualViewport?.removeEventListener("resize", syncViewport);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem(VERB_MODE_STORAGE_KEY, verbMode);
  }, [verbMode]);

  useEffect(() => {
    localStorage.setItem(
      VERBS_BY_MODE_STORAGE_KEY,
      JSON.stringify(approvedVerbsByMode)
    );
  }, [approvedVerbsByMode]);

  useEffect(() => {
    localStorage.setItem(
      ANIMALS_STORAGE_KEY,
      JSON.stringify(approvedAnimalIds)
    );
  }, [approvedAnimalIds]);

  useEffect(() => {
    localStorage.setItem(FAMILY_STORAGE_KEY, JSON.stringify(approvedFamilyIds));
  }, [approvedFamilyIds]);

  // Precarga inteligente: primeras tarjetas desde el menú y 3 siguientes al avanzar
  useEffect(() => {
    const urlsToPreload = [];

    if (activeView === "menu") {
      VERBS.slice(0, 2).forEach((v) => urlsToPreload.push(v.image));
      ANIMALS.slice(0, 2).forEach((a) => urlsToPreload.push(a.image));
      FAMILY.slice(0, 2).forEach((f) => urlsToPreload.push(f.image));
    } else if (activeView === "verbs") {
      VERBS.slice(verbIndex + 1, verbIndex + 4).forEach((v) =>
        urlsToPreload.push(v.image)
      );
    } else if (activeView === "animals") {
      ANIMALS.slice(animalIndex + 1, animalIndex + 4).forEach((a) =>
        urlsToPreload.push(a.image)
      );
    } else if (activeView === "family") {
      FAMILY.slice(familyIndex + 1, familyIndex + 4).forEach((f) =>
        urlsToPreload.push(f.image)
      );
    }

    urlsToPreload.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, [activeView, verbIndex, animalIndex, familyIndex]);

  const approvedVerbIds = approvedVerbsByMode[verbMode] || [];
  const activeVerbModeInfo =
    VERB_MODES.find((m) => m.id === verbMode) || VERB_MODES[3];

  const verbsProgress = Math.round(
    (approvedVerbIds.length / VERBS.length) * 100
  );
  const animalsProgress = Math.round(
    (approvedAnimalIds.length / ANIMALS.length) * 100
  );
  const familyProgress = Math.round(
    (approvedFamilyIds.length / FAMILY.length) * 100
  );

  const toggleSfx = () => {
    const next = !sfxOn;
    setSfxOn(next);
    setSfxEnabled(next);
    if (next) playNextSound();
  };

  const handleInstallClick = async () => {
    if (canPromptInstall) {
      const result = await promptInstall();
      if (result === "manual") setShowInstallModal(true);
    } else {
      setShowInstallModal(true);
    }
  };

  const goToMenu = () => {
    document.activeElement?.blur();
    setActiveView("menu");
  };

  const handleSelectModule = (mod) => {
    if (mod.ready) {
      playNextSound();
      setActiveView(mod.id);
    } else {
      setComingSoonModule(mod);
    }
  };

  const navigateCard = (setter, nextIndex, currentIndex) => {
    if (nextIndex === currentIndex) return;
    playNextSound();
    setter(nextIndex);
  };

  /* ===== PANTALLA 1: MENÚ PRINCIPAL ===== */
  if (activeView === "menu") {
    const progressByModule = {
      verbs: {
        label: activeVerbModeInfo.shortLabel,
        approved: approvedVerbIds.length,
        total: VERBS.length,
        percent: verbsProgress,
      },
      animals: {
        label: "Progreso",
        approved: approvedAnimalIds.length,
        total: ANIMALS.length,
        percent: animalsProgress,
      },
      family: {
        label: "Progreso",
        approved: approvedFamilyIds.length,
        total: FAMILY.length,
        percent: familyProgress,
      },
    };

    return (
      <main className="app-shell menu-shell">
        <header className="menu-header">
          <div className="menu-top-bar">
            <span className="app-tag">Aprende Inglés</span>
            <div className="menu-top-actions">
              <button
                type="button"
                className={`btn-sfx-toggle ${sfxOn ? "is-on" : ""}`}
                onClick={toggleSfx}
                title={
                  sfxOn
                    ? "Silenciar efectos de sonido"
                    : "Activar efectos de sonido"
                }
                aria-label={sfxOn ? "Silenciar sonidos" : "Activar sonidos"}
              >
                {sfxOn ? "🔔" : "🔕"}
              </button>

              {!isInstalled && (
                <button
                  type="button"
                  className="btn-install-app"
                  onClick={handleInstallClick}
                >
                  📲 Instalar app
                </button>
              )}
            </div>
          </div>

          <h1>Elige una actividad</h1>
          <p>Practica paso a paso a tu ritmo.</p>
        </header>

        <section className="menu-content">
          <div className="modules-grid">
            {MODULES.map((mod) => {
              const stats = progressByModule[mod.id];
              const isReady = Boolean(mod.ready && stats);

              return (
                <button
                  key={mod.id}
                  type="button"
                  className={`module-card ${
                    isReady ? "module-card-ready" : "module-card-locked"
                  }`}
                  onClick={() => handleSelectModule(mod)}
                >
                  <div className="module-card-top">
                    <span className="module-icon">{mod.emoji}</span>
                    <span
                      className={`pill ${isReady ? "pill-ready" : "pill-soon"}`}
                    >
                      {isReady ? "Disponible" : "Pronto"}
                    </span>
                  </div>

                  <div className="module-info">
                    <h2>{mod.title}</h2>
                    <p>{mod.description}</p>
                  </div>

                  <div className="module-footer">
                    {isReady ? (
                      <>
                        <div className="module-progress-text">
                          <span>{stats.label}</span>
                          <strong>
                            {stats.approved} / {stats.total}
                          </strong>
                        </div>
                        <div className="progress-track">
                          <div
                            className="progress-fill"
                            style={{ width: `${stats.percent}%` }}
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="module-progress-text module-locked-text">
                          <span>En construcción</span>
                          <strong>—</strong>
                        </div>
                        <div className="progress-track progress-track-locked" />
                      </>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Modal: Instalar como App Móvil */}
        {showInstallModal && (
          <div
            className="modal-backdrop"
            onClick={() => setShowInstallModal(false)}
            role="dialog"
            aria-modal="true"
          >
            <div className="modal-box" onClick={(e) => e.stopPropagation()}>
              <img
                src="/icon-192.png"
                alt="Logotipo Aprende Inglés"
                className="modal-logo"
              />
              <span className="pill pill-ready">App Móvil</span>
              <h2>Instalar Aprende Inglés</h2>
              {isIos ? (
                <ol className="install-steps">
                  <li>
                    Toca el botón <strong>Compartir</strong> (cuadrado con flecha
                    hacia arriba) en la barra de Safari.
                  </li>
                  <li>
                    Desliza hacia abajo y selecciona{" "}
                    <strong>Agregar a inicio</strong>.
                  </li>
                  <li>
                    Toca <strong>Agregar</strong> arriba a la derecha y listo.
                  </li>
                </ol>
              ) : (
                <ol className="install-steps">
                  <li>
                    Toca el menú del navegador (<strong>⋮</strong>) arriba a la
                    derecha.
                  </li>
                  <li>
                    Selecciona <strong>Instalar aplicación</strong> o{" "}
                    <strong>Añadir a la pantalla de inicio</strong>.
                  </li>
                  <li>
                    Confirma en <strong>Instalar</strong> para abrirla desde tu
                    celular con su logotipo.
                  </li>
                </ol>
              )}
              <button
                type="button"
                className="btn-check modal-btn"
                onClick={() => setShowInstallModal(false)}
              >
                Entendido
              </button>
            </div>
          </div>
        )}

        {/* Modal: Módulo en construcción */}
        {comingSoonModule && (
          <div
            className="modal-backdrop"
            onClick={() => setComingSoonModule(null)}
            role="dialog"
            aria-modal="true"
          >
            <div className="modal-box" onClick={(e) => e.stopPropagation()}>
              <span className="modal-emoji">{comingSoonModule.emoji}</span>
              <span className="pill pill-soon">Módulo en construcción</span>
              <h2>{comingSoonModule.title}</h2>
              <p>
                Esta actividad (<strong>{comingSoonModule.description}</strong>)
                aún se encuentra en desarrollo. Muy pronto estará disponible
                para practicar.
              </p>
              <button
                type="button"
                className="btn-check modal-btn"
                onClick={() => setComingSoonModule(null)}
              >
                Entendido
              </button>
            </div>
          </div>
        )}

        <InstallPrompt
          isInstalled={isInstalled}
          isIos={isIos}
          canPromptInstall={canPromptInstall}
          onInstall={handleInstallClick}
        />
      </main>
    );
  }

  /* ===== PANTALLA 2: MÓDULO DE VERBOS ===== */
  if (activeView === "verbs") {
    const currentVerb = VERBS[verbIndex];
    const isCurrentApproved = approvedVerbIds.includes(currentVerb.id);

    return (
      <main className="app-shell">
        <header className="top-bar">
          <div className="title-row">
            <div className="title-left">
              <button type="button" className="btn-back" onClick={goToMenu}>
                ← Menú
              </button>
              <h1>Verbos</h1>
            </div>
            <div className="title-actions">
              <button
                type="button"
                className={`btn-sfx-toggle ${sfxOn ? "is-on" : ""}`}
                onClick={toggleSfx}
                title={sfxOn ? "Silenciar sonidos" : "Activar sonidos"}
              >
                {sfxOn ? "🔔" : "🔕"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setApprovedVerbsByMode((prev) => ({
                    ...prev,
                    [verbMode]: [],
                  }));
                  if (verbMode === "all") {
                    localStorage.removeItem(LEGACY_VERBS_STORAGE_KEY);
                  }
                  setVerbIndex(0);
                  setVerbResetKey((prev) => prev + 1);
                }}
                className="btn-reset"
                title={`Reiniciar solo ${activeVerbModeInfo.label}`}
              >
                Reiniciar
              </button>
            </div>
          </div>

          <div
            className="verb-mode-bar"
            role="tablist"
            aria-label="Elegir tiempo verbal a practicar"
          >
            {VERB_MODES.map((m) => {
              const isActive = m.id === verbMode;
              const modeDone =
                (approvedVerbsByMode[m.id]?.length || 0) === VERBS.length;
              return (
                <button
                  key={m.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  className={`verb-mode-btn ${isActive ? "is-active" : ""} ${
                    modeDone ? "is-complete" : ""
                  }`}
                  onClick={() => {
                    playNextSound();
                    setVerbMode(m.id);
                  }}
                >
                  {m.shortLabel}
                </button>
              );
            })}
          </div>

          <div className="progress-meta">
            <span>
              Tarjeta <strong>{verbIndex + 1}</strong> de {VERBS.length}
            </span>
            <span>
              {activeVerbModeInfo.shortLabel}:{" "}
              <strong>{approvedVerbIds.length}</strong> / {VERBS.length}
            </span>
          </div>

          <div className="progress-track">
            <div
              className="progress-fill"
              style={{ width: `${verbsProgress}%` }}
            />
          </div>
        </header>

        <section className="stage">
          <VerbCard
            key={`${currentVerb.id}-${verbMode}-${verbResetKey}`}
            verb={currentVerb}
            mode={verbMode}
            isApproved={isCurrentApproved}
            onApprove={(id) => {
              document.activeElement?.blur();
              setApprovedVerbsByMode((prev) => {
                const currentList = prev[verbMode] || [];
                if (currentList.includes(id)) return prev;
                return {
                  ...prev,
                  [verbMode]: [...currentList, id],
                };
              });
            }}
          />

          <div className="nav-controls">
            <button
              type="button"
              className="btn-nav"
              onClick={() =>
                navigateCard(setVerbIndex, Math.max(0, verbIndex - 1), verbIndex)
              }
              disabled={verbIndex === 0}
            >
              ← Anterior
            </button>

            <button
              type="button"
              className={`btn-nav ${
                isCurrentApproved ? "btn-nav-highlight" : ""
              }`}
              onClick={() =>
                navigateCard(
                  setVerbIndex,
                  Math.min(VERBS.length - 1, verbIndex + 1),
                  verbIndex
                )
              }
              disabled={verbIndex === VERBS.length - 1}
            >
              Siguiente →
            </button>
          </div>

          <div className="dots-strip" aria-label="Selector rápido de verbos">
            {VERBS.map((verb, index) => {
              const approved = approvedVerbIds.includes(verb.id);
              const active = index === verbIndex;
              return (
                <button
                  key={verb.id}
                  type="button"
                  className={`dot-item ${active ? "is-active" : ""} ${
                    approved ? "is-approved" : ""
                  }`}
                  onClick={() => navigateCard(setVerbIndex, index, verbIndex)}
                  title={`${index + 1}. ${verb.spanish}`}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>
        </section>
      </main>
    );
  }

  /* ===== PANTALLA 3: MÓDULO DE ANIMALES ===== */
  if (activeView === "animals") {
    const currentAnimal = ANIMALS[animalIndex];
    const isAnimalApproved = approvedAnimalIds.includes(currentAnimal.id);

    return (
      <main className="app-shell">
        <header className="top-bar">
          <div className="title-row">
            <div className="title-left">
              <button type="button" className="btn-back" onClick={goToMenu}>
                ← Menú
              </button>
              <h1>Animales</h1>
            </div>
            <div className="title-actions">
              <button
                type="button"
                className={`btn-sfx-toggle ${sfxOn ? "is-on" : ""}`}
                onClick={toggleSfx}
                title={sfxOn ? "Silenciar sonidos" : "Activar sonidos"}
              >
                {sfxOn ? "🔔" : "🔕"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setApprovedAnimalIds([]);
                  localStorage.removeItem(ANIMALS_STORAGE_KEY);
                  setAnimalIndex(0);
                  setAnimalResetKey((prev) => prev + 1);
                }}
                className="btn-reset"
              >
                Reiniciar
              </button>
            </div>
          </div>

          <div className="progress-meta">
            <span>
              Tarjeta <strong>{animalIndex + 1}</strong> de {ANIMALS.length}
            </span>
            <span>
              Aprobados: <strong>{approvedAnimalIds.length}</strong> /{" "}
              {ANIMALS.length}
            </span>
          </div>

          <div className="progress-track">
            <div
              className="progress-fill"
              style={{ width: `${animalsProgress}%` }}
            />
          </div>
        </header>

        <section className="stage">
          <VocabCard
            key={`${currentAnimal.id}-${animalResetKey}`}
            item={currentAnimal}
            isApproved={isAnimalApproved}
            inputLabel="Animal en inglés"
            placeholder="Escribe el nombre del animal..."
            onApprove={(id) => {
              document.activeElement?.blur();
              setApprovedAnimalIds((prev) =>
                prev.includes(id) ? prev : [...prev, id]
              );
            }}
          />

          <div className="nav-controls">
            <button
              type="button"
              className="btn-nav"
              onClick={() =>
                navigateCard(
                  setAnimalIndex,
                  Math.max(0, animalIndex - 1),
                  animalIndex
                )
              }
              disabled={animalIndex === 0}
            >
              ← Anterior
            </button>

            <button
              type="button"
              className={`btn-nav ${
                isAnimalApproved ? "btn-nav-highlight" : ""
              }`}
              onClick={() =>
                navigateCard(
                  setAnimalIndex,
                  Math.min(ANIMALS.length - 1, animalIndex + 1),
                  animalIndex
                )
              }
              disabled={animalIndex === ANIMALS.length - 1}
            >
              Siguiente →
            </button>
          </div>

          <div className="dots-strip" aria-label="Selector rápido de animales">
            {ANIMALS.map((animal, index) => {
              const approved = approvedAnimalIds.includes(animal.id);
              const active = index === animalIndex;
              return (
                <button
                  key={animal.id}
                  type="button"
                  className={`dot-item ${active ? "is-active" : ""} ${
                    approved ? "is-approved" : ""
                  }`}
                  onClick={() =>
                    navigateCard(setAnimalIndex, index, animalIndex)
                  }
                  title={`${index + 1}. ${animal.spanish}`}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>
        </section>
      </main>
    );
  }

  /* ===== PANTALLA 4: MÓDULO DE FAMILIA ===== */
  const currentMember = FAMILY[familyIndex];
  const isFamilyApproved = approvedFamilyIds.includes(currentMember.id);

  return (
    <main className="app-shell">
      <header className="top-bar">
        <div className="title-row">
          <div className="title-left">
            <button type="button" className="btn-back" onClick={goToMenu}>
              ← Menú
            </button>
            <h1>Familia</h1>
          </div>
          <div className="title-actions">
            <button
              type="button"
              className={`btn-sfx-toggle ${sfxOn ? "is-on" : ""}`}
              onClick={toggleSfx}
              title={sfxOn ? "Silenciar sonidos" : "Activar sonidos"}
            >
              {sfxOn ? "🔔" : "🔕"}
            </button>
            <button
              type="button"
              onClick={() => {
                setApprovedFamilyIds([]);
                localStorage.removeItem(FAMILY_STORAGE_KEY);
                setFamilyIndex(0);
                setFamilyResetKey((prev) => prev + 1);
              }}
              className="btn-reset"
            >
              Reiniciar
            </button>
          </div>
        </div>

        <div className="progress-meta">
          <span>
            Tarjeta <strong>{familyIndex + 1}</strong> de {FAMILY.length}
          </span>
          <span>
            Aprobados: <strong>{approvedFamilyIds.length}</strong> /{" "}
            {FAMILY.length}
          </span>
        </div>

        <div className="progress-track">
          <div
            className="progress-fill"
            style={{ width: `${familyProgress}%` }}
          />
        </div>
      </header>

      <section className="stage">
        <VocabCard
          key={`${currentMember.id}-${familyResetKey}`}
          item={currentMember}
          isApproved={isFamilyApproved}
          inputLabel="Miembro en inglés"
          placeholder="Escribe el miembro de la familia..."
          onApprove={(id) => {
            document.activeElement?.blur();
            setApprovedFamilyIds((prev) =>
              prev.includes(id) ? prev : [...prev, id]
            );
          }}
        />

        <div className="nav-controls">
          <button
            type="button"
            className="btn-nav"
            onClick={() =>
              navigateCard(
                setFamilyIndex,
                Math.max(0, familyIndex - 1),
                familyIndex
              )
            }
            disabled={familyIndex === 0}
          >
            ← Anterior
          </button>

          <button
            type="button"
            className={`btn-nav ${
              isFamilyApproved ? "btn-nav-highlight" : ""
            }`}
            onClick={() =>
              navigateCard(
                setFamilyIndex,
                Math.min(FAMILY.length - 1, familyIndex + 1),
                familyIndex
              )
            }
            disabled={familyIndex === FAMILY.length - 1}
          >
            Siguiente →
          </button>
        </div>

        <div className="dots-strip" aria-label="Selector rápido de familia">
          {FAMILY.map((member, index) => {
            const approved = approvedFamilyIds.includes(member.id);
            const active = index === familyIndex;
            return (
              <button
                key={member.id}
                type="button"
                className={`dot-item ${active ? "is-active" : ""} ${
                  approved ? "is-approved" : ""
                }`}
                onClick={() =>
                  navigateCard(setFamilyIndex, index, familyIndex)
                }
                title={`${index + 1}. ${member.spanish}`}
              >
                {index + 1}
              </button>
            );
          })}
        </div>
      </section>
    </main>
  );
}