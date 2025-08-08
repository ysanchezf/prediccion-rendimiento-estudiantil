# Predicción de Rendimiento Estudiantil

## Entrenamiento del modelo

1. **Preparar los datos**  
   El modelo utiliza un archivo CSV donde cada fila representa a un estudiante.
   Ejemplo de formato:

   ```csv
   nombre,p1,p2,p3,p4,p5,p6,p7,p8,p9,p10,p11,p12,p13,p14,p15
   Ana,3,2,1,3,2,3,2,1,0,2,3,2,1,3,2
   ```

   Las columnas `p1` a `p15` corresponden a las respuestas (0-3) de las preguntas del formulario.

2. **Entrenar**  
   Ejecutar el script de entrenamiento (por ejemplo `scripts/entrenar_modelo.py`) con el archivo de datos:

   ```bash
   python scripts/entrenar_modelo.py datos.csv modelo.json
   ```

   El modelo entrenado se guarda en `modelo.json`.

3. **Integrar con la aplicación**  
   Copiar `modelo.json` al directorio `public/` y ajustar `app.js` para cargarlo:

   ```javascript
   const modelo = require('./public/modelo.json');
   ```

   Durante la evaluación, el modelo genera la predicción que se usa en `generarRecomendaciones`.

4. **Validar ausencia de archivos `.bin`**  
   Después del entrenamiento, comprobar que no se generaron archivos binarios:

   ```bash
   find . -name "*.bin"
   ```

   El comando no debe producir resultados.

## Reentrenamiento con datos nuevos

1. Incorporar nuevas filas al archivo `datos.csv`.
2. Repetir el proceso de entrenamiento.
3. Reemplazar `public/modelo.json` por la nueva versión.
4. Ejecutar nuevamente `find . -name "*.bin"` para confirmar que no aparecen archivos binarios.

## Uso de la API `/api/evaluacion`

El servicio expone un endpoint `POST /api/evaluacion` que evalúa las respuestas de un estudiante y devuelve las recomendaciones derivadas del modelo.

### Ejemplo: alto rendimiento

```bash
curl -X POST http://localhost:3000/api/evaluacion \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Ana",
    "p1":3,"p2":3,"p3":3,"p4":3,"p5":3,
    "p6":3,"p7":3,"p8":3,"p9":3,"p10":3,
    "p11":3,"p12":3,"p13":3,"p14":3,"p15":3
  }'
```

Respuesta:

```json
{
  "resultado": "✅ Alta probabilidad de éxito académico",
  "recomendaciones": [
    "Mantén tus rutinas de estudio consistentes.",
    "Continúa cuidando tu salud mental y física.",
    "Sigue aprovechando los recursos de la universidad (tutorías, biblioteca, asesorías)."
  ]
}
```

### Ejemplo: alto riesgo

```bash
curl -X POST http://localhost:3000/api/evaluacion \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Luis",
    "p1":0,"p2":0,"p3":0,"p4":0,"p5":0,
    "p6":0,"p7":0,"p8":0,"p9":0,"p10":0,
    "p11":0,"p12":0,"p13":0,"p14":0,"p15":0
  }'
```

Respuesta:

```json
{
  "resultado": "❌ Alta probabilidad de queme o abandono",
  "recomendaciones": [
    "Busca ayuda de un orientador o psicólogo universitario.",
    "Establece prioridades y reduce las distracciones.",
    "No enfrentes todo solo: apóyate en profesores o compañeros.",
    "Consulta sobre becas, tutorías o programas de ayuda económica."
  ]
}
```

Estos ejemplos muestran cómo la salida del modelo afecta las recomendaciones proporcionadas por la API.
