import { useEffect, useRef, useState } from "react";
import { speakEnglish, speakSequence, stopSpeech } from "../utils/speech";

const normalize = (value) => value.trim().toLowerCase().replace(/\s+/g, " ");

const isCorrect = (input, expected, acceptedList) => {
  const cleanInput = normalize(input);
  if (Array.isArray(acceptedList)) {
    return acceptedList.some((item) => normalize(item) === cleanInput);
  }
  return cleanInput === normalize(expected);
};

const FIELD_CONFIG = {
  infinitive: {
    key: "infinitive",
    label: "Infinitivo",
    shortLabel: "Infinitivo",
    placeholder: "Escribe aquí...",
    acceptedKey: "infinitiveAccepted",
    isPastOrParticiple: false,
    approvedText: "✓ ¡Excelente! Infinitivo dominado",
  },
  past: {
    key: "past",
    label: "Pasado simple",
    shortLabel: "P. simple",
    placeholder: "Escribe aquí...",
    acceptedKey: "pastAccepted",
    isPastOrParticiple: true,
    approvedText: "✓ ¡Excelente! Pasado simple dominado",
  },
  participle: {
    key: "participle",
    label: "Pasado participio",
    shortLabel: "Participio",
    placeholder: "Escribe aquí...",
    acceptedKey: "participleAccepted",
    isPastOrParticiple: true,
    approvedText: "✓ ¡Excelente! Participio dominado",
  },
};

const MODE_FIELDS = {
  infinitive: [FIELD_CONFIG.infinitive],
  past: [FIELD_CONFIG.past],
  participle: [FIELD_CONFIG.participle],
  all: [FIELD_CONFIG.infinitive, FIELD_CONFIG.past, FIELD_CONFIG.participle],
};

export default function VerbCard({
  verb,
  item,
  isApproved,
  onApprove,
  mode = "all",
}) {
  const currentVerb = verb || item;
  const activeFields = MODE_FIELDS[mode] || MODE_FIELDS.all;
  const isSingleMode = activeFields.length === 1;
  const singleField = isSingleMode ? activeFields[0] : null;

  const imgRef = useRef(null);
  const inputRefs = useRef([]);
  const [isFlipped, setIsFlipped] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [form, setForm] = useState({
    infinitive: isApproved && currentVerb ? currentVerb.infinitive : "",
    past: isApproved && currentVerb ? currentVerb.past : "",
    participle: isApproved && currentVerb ? currentVerb.participle : "",
  });
  const [errors, setErrors] = useState({
    infinitive: false,
    past: false,
    participle: false,
  });

  useEffect(() => {
    if (imgRef.current?.complete && imgRef.current.naturalWidth > 0) {
      setImgLoaded(true);
    }
    return () => stopSpeech();
  }, []);

  if (!currentVerb) return null;

  const handleOpenBack = () => {
    document.activeElement?.blur();
    setIsFlipped(true);
  };

  const handleCloseBack = () => {
    stopSpeech();
    setIsFlipped(false);
  };

  const handleSpeakOne = (e, text, isPastOrParticiple = false) => {
    e.stopPropagation();
    speakEnglish(text, { isPastOrParticiple });
  };

  const handleSpeakActive = (e) => {
    e.stopPropagation();
    if (isSingleMode) {
      speakEnglish(currentVerb[singleField.key], {
        isPastOrParticiple: singleField.isPastOrParticiple,
      });
      return;
    }

    speakSequence([
      { text: currentVerb.infinitive },
      { text: currentVerb.past, isPastOrParticiple: true },
      { text: currentVerb.participle, isPastOrParticiple: true },
    ]);
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: false }));
  };

  const handleInputKeyDown = (e, idx) => {
    if (e.key === "Enter" && idx < activeFields.length - 1) {
      e.preventDefault();
      inputRefs.current[idx + 1]?.focus();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const nextErrors = { infinitive: false, past: false, participle: false };
    let allValid = true;

    activeFields.forEach((field) => {
      const ok = isCorrect(
        form[field.key],
        currentVerb[field.key],
        currentVerb[field.acceptedKey]
      );
      nextErrors[field.key] = !ok;
      if (!ok) allValid = false;
    });

    setErrors(nextErrors);

    if (allValid) {
      document.activeElement?.blur();
      onApprove(currentVerb.id);
    }
  };

  return (
    <div className="card-scene">
      <div className={`card-inner ${isFlipped ? "is-flipped" : ""}`}>
        {/* PARTE FRONTAL */}
        <div className={`card-face card-front ${isApproved ? "approved" : ""}`}>
          <div className="card-media">
            <div
              className={`image-box ${
                !imgLoaded && !imgError ? "is-loading" : ""
              }`}
              onClick={handleOpenBack}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && handleOpenBack()}
              title={
                isSingleMode
                  ? `Haz clic en la imagen para ver el ${singleField.label.toLowerCase()}`
                  : "Haz clic en la imagen para ver los 3 tiempos"
              }
            >
              {!imgError ? (
                <img
                  ref={imgRef}
                  src={currentVerb.image}
                  alt={currentVerb.spanish}
                  fetchPriority="high"
                  decoding="async"
                  className={imgLoaded ? "is-loaded" : ""}
                  onLoad={() => setImgLoaded(true)}
                  onError={() => setImgError(true)}
                />
              ) : (
                <div className="image-placeholder">
                  <span>{currentVerb.emoji}</span>
                </div>
              )}
              {isApproved && <span className="badge-approved">✓ Aprobado</span>}
            </div>

            <div className="media-caption">
              <strong className="verb-spanish">{currentVerb.spanish}</strong>
              <button
                type="button"
                className="btn-flip-hint"
                onClick={handleOpenBack}
              >
                Girar ↻
              </button>
            </div>
          </div>

          <form className="verb-form" onSubmit={handleSubmit}>
            {activeFields.map((field, idx) => {
              const isLast = idx === activeFields.length - 1;
              return (
                <label
                  key={field.key}
                  className={`field-row ${
                    errors[field.key] ? "is-error" : ""
                  } ${isApproved ? "is-approved" : ""}`}
                >
                  <span className="field-tag">{field.shortLabel}</span>
                  <input
                    ref={(el) => {
                      inputRefs.current[idx] = el;
                    }}
                    type="text"
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="none"
                    spellCheck={false}
                    enterKeyHint={isLast ? "done" : "next"}
                    value={form[field.key]}
                    disabled={isApproved}
                    placeholder={field.placeholder}
                    onKeyDown={(e) => handleInputKeyDown(e, idx)}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                  />
                </label>
              );
            })}

            {isApproved ? (
              <div className="approved-banner">
                {isSingleMode
                  ? singleField.approvedText
                  : "✓ ¡Excelente! Verbo dominado"}
              </div>
            ) : (
              <button type="submit" className="btn-check">
                Comprobar
              </button>
            )}
          </form>
        </div>

        {/* PARTE TRASERA */}
        <div
          className={`card-face card-back ${isApproved ? "approved" : ""}`}
          onClick={handleCloseBack}
        >
          <div className="back-content">
            <div className="back-header">
              <span className="back-emoji">{currentVerb.emoji}</span>
              <h3>{currentVerb.spanish}</h3>
              <p className="back-subtitle">
                {isSingleMode
                  ? `Escucha y memoriza el ${singleField.label.toLowerCase()}:`
                  : "Escucha y memoriza los 3 tiempos:"}
              </p>
              {isSingleMode && singleField.key !== "infinitive" && (
                <span className="back-context-pill">
                  Infinitivo: <strong>{currentVerb.infinitive}</strong>
                </span>
              )}
            </div>

            <div className="answers-list">
              {activeFields.map((field) => (
                <div
                  key={field.key}
                  className={`answer-row ${
                    isSingleMode ? "answer-row-single" : ""
                  }`}
                >
                  <span>{field.label}</span>
                  <div className="answer-value">
                    <strong>{currentVerb[field.key]}</strong>
                    <button
                      type="button"
                      className="btn-speak-mini"
                      onClick={(e) =>
                        handleSpeakOne(
                          e,
                          currentVerb[field.key],
                          field.isPastOrParticiple
                        )
                      }
                      title={`Escuchar ${currentVerb[field.key]}`}
                      aria-label={`Escuchar ${field.label.toLowerCase()} ${
                        currentVerb[field.key]
                      }`}
                    >
                      🔊
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="back-actions">
              <button
                type="button"
                className="btn-speak-all"
                onClick={handleSpeakActive}
              >
                {isSingleMode
                  ? "🔊 Escuchar pronunciación"
                  : "🔊 Escuchar los 3 tiempos"}
              </button>
              <button
                type="button"
                className="btn-flip-back"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCloseBack();
                }}
              >
                Volver a escribir ↺
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}