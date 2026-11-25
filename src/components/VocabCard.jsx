import { useEffect, useRef, useState } from "react";
import { speakEnglish, stopSpeech } from "../utils/speech";

const normalize = (value) => value.trim().toLowerCase().replace(/\s+/g, " ");

const isCorrect = (input, expected, acceptedList) => {
  const cleanInput = normalize(input);
  if (Array.isArray(acceptedList)) {
    return acceptedList.some((item) => normalize(item) === cleanInput);
  }
  return cleanInput === normalize(expected);
};

export default function VocabCard({
  item,
  isApproved,
  onApprove,
  inputLabel = "En inglés",
  placeholder = "Escribe en inglés...",
}) {
  const imgRef = useRef(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [answer, setAnswer] = useState(isApproved && item ? item.english : "");
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (imgRef.current?.complete && imgRef.current.naturalWidth > 0) {
      setImgLoaded(true);
    }
    return () => stopSpeech();
  }, []);

  if (!item) return null;

  const handleOpenBack = () => {
    document.activeElement?.blur();
    setIsFlipped(true);
  };

  const handleCloseBack = () => {
    stopSpeech();
    setIsFlipped(false);
  };

  const handleSpeak = (e) => {
    e.stopPropagation();
    speakEnglish(item.english);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const ok = isCorrect(answer, item.english, item.englishAccepted);
    setHasError(!ok);

    if (ok) {
      document.activeElement?.blur();
      onApprove(item.id);
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
              title="Haz clic en la imagen para ver la respuesta"
            >
              {!imgError ? (
                <img
                  ref={imgRef}
                  src={item.image}
                  alt={item.spanish}
                  fetchPriority="high"
                  decoding="async"
                  className={imgLoaded ? "is-loaded" : ""}
                  onLoad={() => setImgLoaded(true)}
                  onError={() => setImgError(true)}
                />
              ) : (
                <div className="image-placeholder">
                  <span>{item.emoji}</span>
                </div>
              )}
              {isApproved && <span className="badge-approved">✓ Aprobado</span>}
            </div>

            <div className="media-caption">
              <strong className="verb-spanish">{item.spanish}</strong>
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
            <label
              className={`field-row ${hasError ? "is-error" : ""} ${
                isApproved ? "is-approved" : ""
              }`}
            >
              <span className="field-tag">{inputLabel}</span>
              <input
                type="text"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="none"
                spellCheck={false}
                enterKeyHint="done"
                value={answer}
                disabled={isApproved}
                placeholder={placeholder}
                onChange={(e) => {
                  setAnswer(e.target.value);
                  setHasError(false);
                }}
              />
            </label>

            {isApproved ? (
              <div className="approved-banner">
                ✓ ¡Excelente! Palabra dominada
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
              <span className="back-emoji">{item.emoji}</span>
              {item.category && (
                <span className="category-pill">{item.category}</span>
              )}
              <h3>{item.spanish}</h3>
              <p className="back-subtitle">
                Escucha y memoriza cómo se escribe:
              </p>
            </div>

            <div className="answers-list">
              <div className="answer-row answer-row-single">
                <span>En inglés</span>
                <div className="answer-value">
                  <strong>{item.english}</strong>
                  <button
                    type="button"
                    className="btn-speak-mini"
                    onClick={handleSpeak}
                    title={`Escuchar ${item.english}`}
                    aria-label={`Escuchar pronunciación de ${item.english}`}
                  >
                    🔊
                  </button>
                </div>
              </div>
            </div>

            <div className="back-actions">
              <button
                type="button"
                className="btn-speak-all"
                onClick={handleSpeak}
              >
                🔊 Escuchar pronunciación
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