import { describe, it, expect, vi, afterEach } from 'vitest';
import { fetchImageAsBase64, fetchImagesAsBase64 } from './pdfImages';

class FakeFileReader {
  readAsDataURL() {
    this.result = 'data:image/png;base64,ZmFrZQ==';
    this.onloadend?.();
  }
}

describe('fetchImageAsBase64', () => {
  const originalFetch = global.fetch;
  const originalFileReader = global.FileReader;

  afterEach(() => {
    global.fetch = originalFetch;
    global.FileReader = originalFileReader;
    vi.restoreAllMocks();
  });

  it('devuelve null si no hay url', async () => {
    expect(await fetchImageAsBase64(null)).toBeNull();
    expect(await fetchImageAsBase64(undefined)).toBeNull();
  });

  it('convierte una respuesta exitosa a data URI', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, blob: async () => new Blob(['x']) });
    global.FileReader = FakeFileReader;

    const resultado = await fetchImageAsBase64('https://sgnvbgolihurdxflqsjs.supabase.co/foo.jpg');
    expect(resultado).toBe('data:image/png;base64,ZmFrZQ==');
  });

  it('devuelve null si la respuesta no es ok (imagen rota / 404)', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false });
    const resultado = await fetchImageAsBase64('https://example.com/no-existe.jpg');
    expect(resultado).toBeNull();
  });

  it('devuelve null si fetch lanza (sin red, CORS, etc.)', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('network error'));
    const resultado = await fetchImageAsBase64('https://example.com/falla.jpg');
    expect(resultado).toBeNull();
  });
});

describe('fetchImagesAsBase64', () => {
  const originalFetch = global.fetch;
  const originalFileReader = global.FileReader;

  afterEach(() => {
    global.fetch = originalFetch;
    global.FileReader = originalFileReader;
    vi.restoreAllMocks();
  });

  it('solo incluye en el mapa las imágenes que sí se resolvieron', async () => {
    global.FileReader = FakeFileReader;
    global.fetch = vi.fn((url) => {
      if (url.includes('rota')) return Promise.resolve({ ok: false });
      return Promise.resolve({ ok: true, blob: async () => new Blob(['x']) });
    });

    const mapa = await fetchImagesAsBase64(['https://a.com/ok.jpg', 'https://a.com/rota.jpg']);
    expect(mapa.has('https://a.com/ok.jpg')).toBe(true);
    expect(mapa.has('https://a.com/rota.jpg')).toBe(false);
  });

  it('ignora urls vacías o duplicadas', async () => {
    global.FileReader = FakeFileReader;
    global.fetch = vi.fn().mockResolvedValue({ ok: true, blob: async () => new Blob(['x']) });

    const mapa = await fetchImagesAsBase64(['https://a.com/x.jpg', '', null, 'https://a.com/x.jpg']);
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(mapa.size).toBe(1);
  });
});
