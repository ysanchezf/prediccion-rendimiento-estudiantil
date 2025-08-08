# Predicción de Rendimiento Estudiantil

## Requisitos de entorno
- Node.js 20 o superior
- npm

Instala las dependencias del proyecto:

```bash
npm install
```

## Ejecutar pruebas
La suite de pruebas usa [Jest](https://jestjs.io/) y [Supertest](https://github.com/ladjs/supertest).

Para ejecutar todos los tests:

```bash
npm test
```

Las pruebas unitarias cubren `generarRecomendaciones` y las de integración verifican las rutas `/` y `/api/evaluacion`.
