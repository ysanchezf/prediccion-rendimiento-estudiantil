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
  });

  test('POST /api/evaluacion responde 400 si falta nombre', async () => {
    const body = {};
    for (let i = 1; i <= 15; i++) {
      body[`p${i}`] = 3;
    }
    const res = await request(app).post('/api/evaluacion').send(body);
    expect(res.statusCode).toBe(400);
  });
});
