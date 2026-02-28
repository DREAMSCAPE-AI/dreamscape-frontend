/**
 * VRPinEntry Component
 * DR-574: Accès VR par Code PIN (casques sans scanner QR)
 *
 * Écran plein page pour saisir un code PIN à 6 chiffres
 * depuis le navigateur d'un casque VR.
 * Design optimisé pour les casques (gros boutons, texte lisible).
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';

const GATEWAY_URL = process.env.REACT_APP_GATEWAY_URL || 'http://localhost:4000';
const PIN_LENGTH = 6;

/**
 * VRPinEntry - Full-screen PIN entry for VR headsets
 * @param {Object} props
 * @param {function} props.onSuccess - Called with { destination, autoVR } when PIN is valid
 */
export default function VRPinEntry({ onSuccess }) {
  const [digits, setDigits] = useState(Array(PIN_LENGTH).fill(''));
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef([]);

  // Auto-focus first input on mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleDigitChange = useCallback((index, value) => {
    // Accept only single digit
    const digit = value.replace(/\D/g, '').slice(-1);

    setDigits(prev => {
      const next = [...prev];
      next[index] = digit;
      return next;
    });

    setError(null);

    // Auto-advance to next input
    if (digit && index < PIN_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }, []);

  const handleKeyDown = useCallback((index, e) => {
    // Backspace: clear current and go back
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
        setDigits(prev => {
          const next = [...prev];
          next[index - 1] = '';
          return next;
        });
      }
    }
    // Arrow keys
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowRight' && index < PIN_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
    // Enter: submit if complete
    if (e.key === 'Enter') {
      handleSubmit();
    }
  }, [digits]);

  const handlePaste = useCallback((e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, PIN_LENGTH);
    if (pasted.length > 0) {
      const newDigits = Array(PIN_LENGTH).fill('');
      for (let i = 0; i < pasted.length; i++) {
        newDigits[i] = pasted[i];
      }
      setDigits(newDigits);
      // Focus last filled or next empty
      const focusIndex = Math.min(pasted.length, PIN_LENGTH - 1);
      inputRefs.current[focusIndex]?.focus();
    }
  }, []);

  const handleSubmit = useCallback(async () => {
    const pin = digits.join('');

    if (pin.length !== PIN_LENGTH) {
      setError('Entrez les 6 chiffres du code');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${GATEWAY_URL}/api/v1/vr/sessions/${pin}`);
      const data = await response.json();

      if (response.ok && data.success) {
        onSuccess(data.data);
      } else {
        // Map error codes to user-friendly messages
        if (response.status === 404) {
          setError('Code introuvable. Vérifiez le code et réessayez.');
        } else if (response.status === 410) {
          setError('Code expiré. Générez un nouveau code depuis le site.');
        } else if (response.status === 409) {
          setError('Code déjà utilisé. Générez un nouveau code.');
        } else {
          setError(data.error || 'Erreur de validation');
        }
      }
    } catch (err) {
      setError('Impossible de contacter le serveur. Vérifiez votre connexion.');
    } finally {
      setLoading(false);
    }
  }, [digits, onSuccess]);

  const handleClear = useCallback(() => {
    setDigits(Array(PIN_LENGTH).fill(''));
    setError(null);
    inputRefs.current[0]?.focus();
  }, []);

  const isComplete = digits.every(d => d !== '');

  return (
    <div style={styles.container}>
      {/* Background gradient overlay */}
      <div style={styles.backgroundOverlay} />

      <div style={styles.content}>
        {/* Logo */}
        <div style={styles.logo}>
          <span style={styles.logoIcon}>🌍</span>
          <span style={styles.logoText}>DreamScape VR</span>
        </div>

        {/* Title */}
        <h1 style={styles.title}>Entrez votre code VR</h1>
        <p style={styles.subtitle}>
          Saisissez le code PIN à 6 chiffres affiché sur votre écran
        </p>

        {/* PIN Input Grid */}
        <div style={styles.pinContainer}>
          {digits.map((digit, index) => (
            <React.Fragment key={index}>
              <input
                ref={el => inputRefs.current[index] = el}
                type="tel"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={e => handleDigitChange(index, e.target.value)}
                onKeyDown={e => handleKeyDown(index, e)}
                onPaste={index === 0 ? handlePaste : undefined}
                style={{
                  ...styles.pinInput,
                  ...(digit ? styles.pinInputFilled : {}),
                  ...(error ? styles.pinInputError : {})
                }}
                aria-label={`Chiffre ${index + 1}`}
                disabled={loading}
              />
              {index === 2 && <div style={styles.pinSeparator} />}
            </React.Fragment>
          ))}
        </div>

        {/* Error message */}
        {error && (
          <div style={styles.errorContainer}>
            <span style={styles.errorIcon}>⚠️</span>
            <span style={styles.errorText}>{error}</span>
          </div>
        )}

        {/* Action buttons */}
        <div style={styles.buttonContainer}>
          <button
            onClick={handleSubmit}
            disabled={!isComplete || loading}
            style={{
              ...styles.submitButton,
              ...(!isComplete || loading ? styles.submitButtonDisabled : {})
            }}
          >
            {loading ? (
              <span style={styles.loadingText}>Vérification...</span>
            ) : (
              <>
                <span style={styles.buttonIcon}>🥽</span>
                <span>Lancer l'expérience VR</span>
              </>
            )}
          </button>

          <button
            onClick={handleClear}
            disabled={loading}
            style={styles.clearButton}
          >
            Effacer
          </button>
        </div>

        {/* Instructions */}
        <div style={styles.instructions}>
          <p style={styles.instructionTitle}>Comment obtenir un code ?</p>
          <div style={styles.instructionStep}>
            <span style={styles.stepNumber}>1</span>
            <span>Ouvrez DreamScape sur votre ordinateur ou téléphone</span>
          </div>
          <div style={styles.instructionStep}>
            <span style={styles.stepNumber}>2</span>
            <span>Choisissez une destination et cliquez "VR Quick Access"</span>
          </div>
          <div style={styles.instructionStep}>
            <span style={styles.stepNumber}>3</span>
            <span>Le code PIN à 6 chiffres s'affiche à l'écran</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Styles (inline for VR headset compatibility, no CSS modules needed) ---

const styles = {
  container: {
    position: 'fixed',
    inset: 0,
    zIndex: 9999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    overflow: 'auto',
  },
  backgroundOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
    zIndex: -1,
  },
  content: {
    textAlign: 'center',
    padding: '40px 32px',
    maxWidth: '560px',
    width: '100%',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    marginBottom: '32px',
  },
  logoIcon: {
    fontSize: '48px',
  },
  logoText: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: '1px',
  },
  title: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#FFFFFF',
    margin: '0 0 12px 0',
  },
  subtitle: {
    fontSize: '18px',
    color: '#A5B4FC',
    margin: '0 0 40px 0',
  },
  pinContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    marginBottom: '24px',
  },
  pinInput: {
    width: '64px',
    height: '80px',
    fontSize: '36px',
    fontWeight: 'bold',
    textAlign: 'center',
    border: '3px solid rgba(165, 180, 252, 0.3)',
    borderRadius: '16px',
    background: 'rgba(255, 255, 255, 0.08)',
    color: '#FFFFFF',
    outline: 'none',
    transition: 'all 0.2s',
    caretColor: '#818CF8',
  },
  pinInputFilled: {
    borderColor: '#818CF8',
    background: 'rgba(129, 140, 248, 0.15)',
  },
  pinInputError: {
    borderColor: '#EF4444',
    background: 'rgba(239, 68, 68, 0.1)',
  },
  pinSeparator: {
    width: '16px',
    height: '4px',
    borderRadius: '2px',
    background: 'rgba(165, 180, 252, 0.4)',
  },
  errorContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '12px 20px',
    background: 'rgba(239, 68, 68, 0.15)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: '12px',
    marginBottom: '24px',
  },
  errorIcon: {
    fontSize: '20px',
  },
  errorText: {
    color: '#FCA5A5',
    fontSize: '16px',
  },
  buttonContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginBottom: '40px',
  },
  submitButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    width: '100%',
    padding: '20px 32px',
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#FFFFFF',
    background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
    border: 'none',
    borderRadius: '16px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    boxShadow: '0 8px 24px rgba(99, 102, 241, 0.4)',
  },
  submitButtonDisabled: {
    opacity: 0.4,
    cursor: 'not-allowed',
    boxShadow: 'none',
  },
  buttonIcon: {
    fontSize: '28px',
  },
  loadingText: {
    fontSize: '20px',
  },
  clearButton: {
    padding: '14px 24px',
    fontSize: '16px',
    color: '#A5B4FC',
    background: 'transparent',
    border: '2px solid rgba(165, 180, 252, 0.3)',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  instructions: {
    textAlign: 'left',
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '16px',
    padding: '24px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },
  instructionTitle: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#C7D2FE',
    margin: '0 0 16px 0',
  },
  instructionStep: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    marginBottom: '12px',
    fontSize: '15px',
    color: '#94A3B8',
    lineHeight: '1.4',
  },
  stepNumber: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '28px',
    height: '28px',
    borderRadius: '50%',
    background: 'rgba(129, 140, 248, 0.2)',
    color: '#A5B4FC',
    fontSize: '14px',
    fontWeight: 'bold',
  },
};
