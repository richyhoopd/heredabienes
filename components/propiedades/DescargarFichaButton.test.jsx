import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, afterEach } from 'vitest';
import DescargarFichaButton from './DescargarFichaButton';

const descargarFichaPdfMock = vi.fn().mockResolvedValue(undefined);

vi.mock('../../lib/pdf/generarFichaPdf', () => ({
  descargarFichaPdf: (...args) => descargarFichaPdfMock(...args),
}));

const property = { slug: 'terreno-seattle', titulo: 'Terreno Seattle' };

describe('DescargarFichaButton', () => {
  afterEach(() => {
    descargarFichaPdfMock.mockClear();
  });

  it('cuando hay fichaPdfUrl, enlaza directo al PDF subido (comportamiento original)', () => {
    render(
      <DescargarFichaButton
        property={{ ...property, fichaPdfUrl: 'https://cdn.supabase.co/ficha.pdf' }}
        urlPublica="https://www.heredabienes.com.mx/propiedades/terreno-seattle"
      />
    );
    const link = screen.getByRole('link', { name: /descargar ficha pdf/i });
    expect(link).toHaveAttribute('href', 'https://cdn.supabase.co/ficha.pdf');
    expect(link).toHaveAttribute('target', '_blank');
  });

  it('sin fichaPdfUrl, genera el PDF al vuelo al hacer click', async () => {
    const user = userEvent.setup();
    render(
      <DescargarFichaButton
        property={property}
        urlPublica="https://www.heredabienes.com.mx/propiedades/terreno-seattle"
      />
    );

    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    const boton = screen.getByRole('button', { name: /descargar ficha/i });

    await user.click(boton);

    expect(descargarFichaPdfMock).toHaveBeenCalledWith(
      property,
      'https://www.heredabienes.com.mx/propiedades/terreno-seattle'
    );

    await waitFor(() => expect(screen.getByRole('button')).not.toBeDisabled());
  });

  it('muestra estado de error sin usar alert() si la generación falla', async () => {
    descargarFichaPdfMock.mockRejectedValueOnce(new Error('boom'));
    const user = userEvent.setup();
    render(<DescargarFichaButton property={property} urlPublica="https://example.com/p" />);

    await user.click(screen.getByRole('button', { name: /descargar ficha/i }));

    await waitFor(() =>
      expect(screen.getByText(/no se pudo generar el pdf/i)).toBeInTheDocument()
    );
  });

  it('variant="icon" no muestra el texto largo pero conserva accesibilidad', () => {
    render(
      <DescargarFichaButton
        property={{ ...property, fichaPdfUrl: 'https://cdn.supabase.co/ficha.pdf' }}
        urlPublica="https://example.com/p"
        variant="icon"
      />
    );
    expect(screen.getByRole('link', { name: /descargar ficha pdf/i })).toBeInTheDocument();
  });
});
