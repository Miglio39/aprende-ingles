import { useEffect, useState } from "react";
import { speakEnglish, speakSequence, stopSpeech } from "../utils/speech";

const normalize = (value) => value.trim().toLowerCase().replace(/\s+/g, " ");

const isCorrect = (input, expected, acceptedList) => {
  const cleanInput = normalize(input);
  if (Array.isArray(acceptedList)) {
    return acceptedList.some((item) => normalize(item) === cleanInput);
  }
  return cleanInput === normalize(expected);
};

export default function VerbCard({ verb, isApproved, onApprove }) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [form, setForm] = useState({
    infinitive: isApproved ? verb.infinitive : "",
    past: isApproved ? verb.past : "",
    participle: isApproved ? verb.participle : "",
  });
  const [errors, setErrors] = useState({
    infinitive: false,
    past: false,
    participle: false,
  });

  useEffect(() => {
    return () => stopSpeech();
  }, []);

  const handleCloseBack = () => {
    stopSpeech();
    setIsFlipped(false);
  };

  const handleSpeakOne = (e, text, isPastOrParticiple = false) => {
    e.stopPropagation();
    speakEnglish(text, { isPastOrParticiple });
  };

  const handleSpeakAll = (e) => {
    e.stopPropagation();
    speakSequence([
      { text: verb.infinitive },
      { text: verb.past, isPastOrParticiple: true },
      { text: verb.participle, isPastOrParticiple: true },
    ]);
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: false }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const infOk = isCorrect(
      form.infinitive,
      verb.infinitive,
      verb.infinitiveAccepted
    );
    const pastOk = isCorrect(form.past, verb.past, verb.pastAccepted);
    const partOk = isCorrect(
      form.participle,
      verb.participle,
      verb.participleAccepted
    );

    setErrors({
      infinitive: !infOk,
      past: !pastOk,
      participle: !partOk,
    });

    if (infOk && pastOk && partOk) {
      onApprove(verb.id);
    }
  };

  return (
    <div className="card-scene">
      <div className={`card-inner ${isFlipped ? "is-flipped" : ""}`}>
        {/* PARTE FRONTAL */}
        <div className={`card-face card-front ${isApproved ? "approved" : ""}`}>
          <div className="card-media">
            <div
              className="image-box"
              onClick={() => setIsFlipped(true)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && setIsFlipped(true)}
              title="Haz clic en la imagen para ver los 3 tiempos"
            >
              {!imgError ? (
                <img
                  src={verb.image}
                  alt={verb.spanish}
                  onError={() => setImgError(true)}
                />
              ) : (
                <div className="image-placeholder">
                  <span>{verb.emoji}</span>
                </div>
              )}
              {isApproved && <span className="badge-approved">✓ Aprobado</span>}
            </div>

            <div className="media-caption">
              <strong className="verb-spanish">{verb.spanish}</strong>
              <button
                type="button"
                className="btn-flip-hint"
                onClick={() => setIsFlipped(true)}
              >
                Girar tarjeta ↻
              </button>
            </div>
          </div>

          <form className="verb-form" onSubmit={handleSubmit}>
            <label>
              Infinitivo
              <input
                type="text"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="none"
                spellCheck={false}
                enterKeyHint="next"
                value={form.infinitive}
                disabled={isApproved}
                className={errors.infinitive ? "input-error" : ""}
                placeholder="Escribe el infinitivo..."
                onChange={(e) => handleChange("infinitive", e.target.value)}
              />
            </label>

            <label>
              Pasado simple
              <input
                type="text"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="none"
                spellCheck={false}
                enterKeyHint="next"
                value={form.past}
                disabled={isApproved}
                className={errors.past ? "input-error" : ""}
                placeholder="Escribe el pasado simple..."
                onChange={(e) => handleChange("past", e.target.value)}
              />
            </label>

            <label>
              Pasado participio
              <input
                type="text"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="none"
                spellCheck={false}
                enterKeyHint="done"
                value={form.participle}
                disabled={isApproved}
                className={errors.participle ? "input-error" : ""}
                placeholder="Escribe el pasado participio..."
                onChange={(e) => handleChange("participle", e.target.value)}
              />
            </label>

            {isApproved ? (
              <div className="approved-banner">
                ✓ ¡Excelente! Verbo dominado
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
              <span className="back-emoji">{verb.emoji}</span>
              <h3>{verb.spanish}</h3>
              <p className="back-subtitle">Escucha y memoriza los 3 tiempos:</p>
            </div>

            <div className="answers-list">
              <div className="answer-row">
                <span>Infinitivo</span>
                <div className="answer-value">
                  <strong>{verb.infinitive}</strong>
                  <button
                    type="button"
                    className="btn-speak-mini"
                    onClick={(e) => handleSpeakOne(e, verb.infinitive)}
                    title={`Escuchar ${verb.infinitive}`}
                    aria-label={`Escuchar infinitivo ${verb.infinitive}`}
                  >
                    🔊
                  </button>
                </div>
              </div>

              <div className="answer-row">
                <span>Pasado simple</span>
                <div className="answer-value">
                  <strong>{verb.past}</strong>
                  <button
                    type="button"
                    className="btn-speak-mini"
                    onClick={(e) => handleSpeakOne(e, verb.past, true)}
                    title={`Escuchar ${verb.past}`}
                    aria-label={`Escuchar pasado simple ${verb.past}`}
                  >
                    🔊
                  </button>
                </div>
              </div>

              <div className="answer-row">
                <span>Pasado participio</span>
                <div className="answer-value">
                  <strong>{verb.participle}</strong>
                  <button
                    type="button"
                    className="btn-speak-mini"
                    onClick={(e) => handleSpeakOne(e, verb.participle, true)}
                    title={`Escuchar ${verb.participle}`}
                    aria-label={`Escuchar participio ${verb.participle}`}
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
                onClick={handleSpeakAll}
              >
                🔊 Escuchar los 3 tiempos
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