/**
 * VRPinEntry Component Tests
 * DR-574: Accès VR par Code PIN
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import VRPinEntry from '../VRPinEntry';

// Mock fetch globally
beforeEach(() => {
  global.fetch = jest.fn();
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('VRPinEntry (DR-574)', () => {
  it('renders the PIN entry form', () => {
    render(<VRPinEntry onSuccess={jest.fn()} />);

    expect(screen.getByText('Entrez votre code VR')).toBeInTheDocument();
    expect(screen.getByText("Lancer l'expérience VR")).toBeInTheDocument();

    // Should have 6 input fields
    const inputs = screen.getAllByRole('textbox');
    expect(inputs).toHaveLength(6);
  });

  it('auto-focuses the first input on mount', () => {
    render(<VRPinEntry onSuccess={jest.fn()} />);

    const inputs = screen.getAllByRole('textbox');
    expect(document.activeElement).toBe(inputs[0]);
  });

  it('advances focus to next input on digit entry', () => {
    render(<VRPinEntry onSuccess={jest.fn()} />);

    const inputs = screen.getAllByRole('textbox');
    fireEvent.change(inputs[0], { target: { value: '8' } });

    expect(inputs[0].value).toBe('8');
    expect(document.activeElement).toBe(inputs[1]);
  });

  it('only accepts numeric input', () => {
    render(<VRPinEntry onSuccess={jest.fn()} />);

    const inputs = screen.getAllByRole('textbox');
    fireEvent.change(inputs[0], { target: { value: 'a' } });

    expect(inputs[0].value).toBe('');
  });

  it('submit button is disabled when PIN is incomplete', () => {
    render(<VRPinEntry onSuccess={jest.fn()} />);

    const submitButton = screen.getByText("Lancer l'expérience VR").closest('button');
    expect(submitButton).toBeDisabled();
  });

  it('submit button is enabled when all 6 digits are entered', () => {
    render(<VRPinEntry onSuccess={jest.fn()} />);

    const inputs = screen.getAllByRole('textbox');
    '847291'.split('').forEach((digit, i) => {
      fireEvent.change(inputs[i], { target: { value: digit } });
    });

    const submitButton = screen.getByText("Lancer l'expérience VR").closest('button');
    expect(submitButton).not.toBeDisabled();
  });

  it('calls onSuccess with destination when PIN is valid', async () => {
    const onSuccess = jest.fn();
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        success: true,
        data: { destination: 'barcelona', autoVR: true }
      })
    });

    render(<VRPinEntry onSuccess={onSuccess} />);

    const inputs = screen.getAllByRole('textbox');
    '847291'.split('').forEach((digit, i) => {
      fireEvent.change(inputs[i], { target: { value: digit } });
    });

    const submitButton = screen.getByText("Lancer l'expérience VR").closest('button');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith({ destination: 'barcelona', autoVR: true });
    });
  });

  it('shows error message for invalid PIN', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 404,
      json: () => Promise.resolve({
        success: false,
        error: 'PIN not found or expired'
      })
    });

    render(<VRPinEntry onSuccess={jest.fn()} />);

    const inputs = screen.getAllByRole('textbox');
    '000000'.split('').forEach((digit, i) => {
      fireEvent.change(inputs[i], { target: { value: digit } });
    });

    const submitButton = screen.getByText("Lancer l'expérience VR").closest('button');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/introuvable/i)).toBeInTheDocument();
    });
  });

  it('shows error for expired PIN', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 410,
      json: () => Promise.resolve({
        success: false,
        error: 'PIN has expired'
      })
    });

    render(<VRPinEntry onSuccess={jest.fn()} />);

    const inputs = screen.getAllByRole('textbox');
    '123456'.split('').forEach((digit, i) => {
      fireEvent.change(inputs[i], { target: { value: digit } });
    });

    fireEvent.click(screen.getByText("Lancer l'expérience VR").closest('button'));

    await waitFor(() => {
      expect(screen.getByText(/expiré/i)).toBeInTheDocument();
    });
  });

  it('clears all inputs when clear button is clicked', () => {
    render(<VRPinEntry onSuccess={jest.fn()} />);

    const inputs = screen.getAllByRole('textbox');
    '847291'.split('').forEach((digit, i) => {
      fireEvent.change(inputs[i], { target: { value: digit } });
    });

    fireEvent.click(screen.getByText('Effacer'));

    inputs.forEach(input => {
      expect(input.value).toBe('');
    });
  });

  it('shows network error when server is unreachable', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

    render(<VRPinEntry onSuccess={jest.fn()} />);

    const inputs = screen.getAllByRole('textbox');
    '847291'.split('').forEach((digit, i) => {
      fireEvent.change(inputs[i], { target: { value: digit } });
    });

    fireEvent.click(screen.getByText("Lancer l'expérience VR").closest('button'));

    await waitFor(() => {
      expect(screen.getByText(/connexion/i)).toBeInTheDocument();
    });
  });

  it('displays instructions for obtaining a code', () => {
    render(<VRPinEntry onSuccess={jest.fn()} />);

    expect(screen.getByText('Comment obtenir un code ?')).toBeInTheDocument();
  });

  it('handles paste of full PIN', () => {
    render(<VRPinEntry onSuccess={jest.fn()} />);

    const inputs = screen.getAllByRole('textbox');

    fireEvent.paste(inputs[0], {
      clipboardData: { getData: () => '847291' }
    });

    expect(inputs[0].value).toBe('8');
    expect(inputs[1].value).toBe('4');
    expect(inputs[2].value).toBe('7');
    expect(inputs[3].value).toBe('2');
    expect(inputs[4].value).toBe('9');
    expect(inputs[5].value).toBe('1');
  });
});
