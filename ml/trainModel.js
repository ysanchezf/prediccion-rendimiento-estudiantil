const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

async function trainModel() {
  const prisma = new PrismaClient();
  let w = 0;
  let b = 0;
  try {
    const registros = await prisma.evaluacion.findMany();
    if (registros.length > 0) {
      const xs = registros.map(r => r.porcentaje / 100);
      const ys = registros.map(r => r.resultado.includes('éxito') ? 1 : 0);
      const lr = 0.1;
      const epochs = 1000;
      for (let epoch = 0; epoch < epochs; epoch++) {
        let dw = 0;
        let db = 0;
        for (let i = 0; i < xs.length; i++) {
          const x = xs[i];
          const y = ys[i];
          const z = w * x + b;
          const pred = 1 / (1 + Math.exp(-z));
          const error = pred - y;
          dw += error * x;
          db += error;
        }
        dw /= xs.length;
        db /= xs.length;
        w -= lr * dw;
        b -= lr * db;
      }
    } else {
      console.warn('No hay datos para entrenar, se usarán pesos por defecto');
    }
  } catch (err) {
    console.error('Error durante el entrenamiento:', err.message);
  } finally {
    await prisma.$disconnect();
  }

  const model = { w, b, trained: new Date().toISOString() };
  const modelPath = path.join(__dirname, '..', 'public', 'models');
  fs.mkdirSync(modelPath, { recursive: true });
  fs.writeFileSync(path.join(modelPath, 'model.json'), JSON.stringify(model, null, 2));
  return model;
}

if (require.main === module) {
  trainModel().then(() => console.log('Entrenamiento completado'));
}

module.exports = trainModel;
