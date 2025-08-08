const request = require('supertest');

jest.mock('@prisma/client', () => {
  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      Evaluacion: { create: jest.fn().mockResolvedValue({}) }
    }))
  };
});

const { app } = require('../app');

describe('Rutas principales', () => {
  test('GET / responde con el formulario', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
    expect(res.text).toContain('Formulario de Evaluación');
  });

  test('POST /api/evaluacion devuelve un resultado', async () => {
    const body = { nombre: 'Test' };
    for (let i = 1; i <= 15; i++) {
      body[`p${i}`] = 3;
    }
    const res = await request(app).post('/api/evaluacion').send(body);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('resultado');
    expect(res.body).toHaveProperty('puntaje', 45);
    expect(res.body).toHaveProperty('maxPuntaje', 45);
    expect(res.body).toHaveProperty('porcentaje', 100);
    expect(res.body).toHaveProperty('razon');
    expect(Array.isArray(res.body.recomendaciones)).toBe(true);
    expect(res.body.recomendaciones.length).toBeGreaterThan(0);
  });

  test('POST /api/evaluacion incluye campo resultado para animación', async () => {
    const body = { nombre: 'Otro' };
    for (let i = 1; i <= 15; i++) {
      body[`p${i}`] = 1;
    }
    const res = await request(app).post('/api/evaluacion').send(body);
    expect(res.statusCode).toBe(200);
    expect(typeof res.body.resultado).toBe('string');
    const opciones = ['éxito', 'Riesgo moderado', 'queme o abandono'];
    const contiene = opciones.some(op => res.body.resultado.includes(op));
    expect(contiene).toBe(true);

  });
});
