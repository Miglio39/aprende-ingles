import { useEffect, useState } from "react";
import { MODULES } from "./data/modules";
import { VERBS } from "./data/verbs";
import { ANIMALS } from "./data/animals";
import { FAMILY } from "./data/family";
import VerbCard from "./components/VerbCard";
import VocabCard from "./components/VocabCard";
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

    // Migra progreso anterior de Verbos al modo "Los 3 tiempos"
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

  const handleSelectModule = (mod) => {
    if (mod.ready) {
      setActiveView(mod.id);
    } else {
      setComingSoonModule(mod);
    }
  };

  /* ===== PANTALLA 1: MENÚ PRINCIPAL ===== */
  if (activeView === "menu") {
    const readyModules = MODULES.filter((m) => m.ready);
    const lockedModules = MODULES.filter((m) => !m.ready);

    const progressByModule = {
      verbs: {
        label: `Progreso (${activeVerbModeInfo.shortLabel})`,
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
          <span className="app-tag">Aprende Inglés</span>
          <h1>Elige una actividad</h1>
          <p>Practica paso a paso a tu ritmo.</p>
        </header>

        <section className="menu-content">
          {/* Módulos disponibles (Verbos, Animales y Familia) */}
          <div className="featured-grid">
            {readyModules.map((mod) => {
              const stats = progressByModule[mod.id];
              return (
                <button
                  key={mod.id}
                  type="button"
                  className="module-card module-card-featured"
                  onClick={() => handleSelectModule(mod)}
                >
                  <div className="module-card-top">
                    <span className="module-icon-md">{mod.emoji}</span>
                    <span className="pill pill-ready">Disponible</span>
                  </div>
                  <div className="module-info">
                    <h2>{mod.title}</h2>
                    <p>{mod.description}</p>
                  </div>
                  <div className="module-progress-wrap">
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
                  </div>
                </button>
              );
            })}
          </div>

          {/* Próximos módulos */}
          <div className="modules-grid">
            {lockedModules.map((mod) => (
              <button
                key={mod.id}
                type="button"
                className="module-card module-card-locked"
                onClick={() => handleSelectModule(mod)}
              >
                <div className="module-card-top">
                  <span className="module-icon">{mod.emoji}</span>
                  <span className="pill pill-soon">Pronto</span>
                </div>
                <h3>{mod.title}</h3>
                <p>{mod.description}</p>
              </button>
            ))}
          </div>
        </section>

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
              <button
                type="button"
                className="btn-back"
                onClick={() => setActiveView("menu")}
              >
                ← Menú
              </button>
              <h1>Verbos</h1>
            </div>
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

          {/* Selector de tiempo verbal a practicar */}
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
                  onClick={() => setVerbMode(m.id)}
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
            onApprove={(id) =>
              setApprovedVerbsByMode((prev) => {
                const currentList = prev[verbMode] || [];
                if (currentList.includes(id)) return prev;
                return {
                  ...prev,
                  [verbMode]: [...currentList, id],
                };
              })
            }
          />

          <div className="nav-controls">
            <button
              type="button"
              className="btn-nav"
              onClick={() =>
                setVerbIndex((prev) => (prev > 0 ? prev - 1 : prev))
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
                setVerbIndex((prev) =>
                  prev < VERBS.length - 1 ? prev + 1 : prev
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
                  onClick={() => setVerbIndex(index)}
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
              <button
                type="button"
                className="btn-back"
                onClick={() => setActiveView("menu")}
              >
                ← Menú
              </button>
              <h1>Animales</h1>
            </div>
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
            onApprove={(id) =>
              setApprovedAnimalIds((prev) =>
                prev.includes(id) ? prev : [...prev, id]
              )
            }
          />

          <div className="nav-controls">
            <button
              type="button"
              className="btn-nav"
              onClick={() =>
                setAnimalIndex((prev) => (prev > 0 ? prev - 1 : prev))
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
                setAnimalIndex((prev) =>
                  prev < ANIMALS.length - 1 ? prev + 1 : prev
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
                  onClick={() => setAnimalIndex(index)}
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
            <button
              type="button"
              className="btn-back"
              onClick={() => setActiveView("menu")}
            >
              ← Menú
            </button>
            <h1>Familia</h1>
          </div>
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
          onApprove={(id) =>
            setApprovedFamilyIds((prev) =>
              prev.includes(id) ? prev : [...prev, id]
            )
          }
        />

        <div className="nav-controls">
          <button
            type="button"
            className="btn-nav"
            onClick={() =>
              setFamilyIndex((prev) => (prev > 0 ? prev - 1 : prev))
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
              setFamilyIndex((prev) =>
                prev < FAMILY.length - 1 ? prev + 1 : prev
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
                onClick={() => setFamilyIndex(index)}
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