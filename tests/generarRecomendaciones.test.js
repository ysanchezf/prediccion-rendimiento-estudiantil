jest.mock('@prisma/client', () => {
  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      Evaluacion: { create: jest.fn() }
    }))
  };
});

const { generarRecomendaciones } = require('../app');

describe('generarRecomendaciones', () => {
  test('indica alta probabilidad de éxito cuando el puntaje es alto', () => {
    const { resultado, porcentaje } = generarRecomendaciones(45, 60);
    expect(resultado).toBe('✅ Alta probabilidad de éxito académico');
    expect(porcentaje).toBeCloseTo(75);
  });

  test('indica riesgo moderado con puntaje medio', () => {
    const { resultado, porcentaje } = generarRecomendaciones(30, 60);
    expect(resultado).toBe('⚠️ Riesgo moderado');
    expect(porcentaje).toBeCloseTo(50);
  });

  test('indica alto riesgo con puntaje bajo', () => {
    const { resultado, porcentaje } = generarRecomendaciones(10, 60);
    expect(resultado).toBe('❌ Alta probabilidad de queme o abandono');
    expect(porcentaje).toBeLessThan(50);
  });
});
