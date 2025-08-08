// app.js
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const bodyParser = require('body-parser');
const app = express();
const prisma = new PrismaClient();

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

const preguntas = [
  "¿Con qué frecuencia estudias fuera del horario de clases?",
  "¿Tienes un horario de estudio semanal?",
  "¿Duermes al menos 6 horas por noche?",
  "¿Cómo calificas tu alimentación diaria?",
  "¿Te sientes motivado con tu carrera?",
  "¿Tienes dificultades con las materias actuales?",
  "¿Con qué frecuencia entregas tus trabajos a tiempo?",
  "¿Qué tan seguido participas en clase?",
  "¿Tienes apoyo familiar o de amigos?",
  "¿Tienes que trabajar mientras estudias?",
  "¿Tienes problemas económicos que afectan tus estudios?",
  "¿Te sientes estresado por la universidad?",
  "¿Sufres de ansiedad o depresión relacionada con los estudios?",
  "¿Sabes a quién acudir si tienes problemas emocionales o académicos?",
  "¿Utilizas los servicios de apoyo de la universidad?"
];

function generarRecomendaciones(puntaje, maxPuntaje) {
  const porcentaje = (puntaje / maxPuntaje) * 100;
  let resultado = "";
  let razon = "";
  let recomendaciones = [];

  if (porcentaje >= 75) {
    resultado = "✅ Alta probabilidad de éxito académico";
    razon = "Tu puntaje indica que tienes buenos hábitos de estudio, motivación y equilibrio personal.";
    recomendaciones = [
      "Mantén tus rutinas de estudio consistentes.",
      "Continúa cuidando tu salud mental y física.",
      "Sigue aprovechando los recursos de la universidad (tutorías, biblioteca, asesorías)."
    ];
  } else if (porcentaje >= 50) {
    resultado = "⚠️ Riesgo moderado";
    razon = "Tu puntaje sugiere que hay áreas donde podrías mejorar, como la organización del tiempo, participación o salud emocional.";
    recomendaciones = [
      "Establece un horario de estudio semanal y cúmplelo.",
      "Evita dejar tareas para último momento.",
      "Habla con un orientador académico si te sientes abrumado.",
      "Participa más en clases y usa los recursos de la universidad."
    ];
  } else {
    resultado = "❌ Alta probabilidad de queme o abandono";
    razon = "Tu puntaje muestra muchas señales de riesgo: posibles problemas económicos, emocionales o académicos que requieren atención urgente.";
    recomendaciones = [
      "Busca ayuda de un orientador o psicólogo universitario.",
      "Establece prioridades y reduce las distracciones.",
      "No enfrentes todo solo: apóyate en profesores o compañeros.",
      "Consulta sobre becas, tutorías o programas de ayuda económica."
    ];
  }

  return { resultado, razon, recomendaciones, porcentaje };
}

app.get('/', (req, res) => {
  res.render('formulario', { preguntas, resultado: null });
});

app.post('/', async (req, res) => {
  const datos = req.body;
  const nombre = datos.nombre;
  let puntaje = 0;
  let maxPuntaje = preguntas.length * 3;

  for (let i = 1; i <= preguntas.length; i++) {
    puntaje += parseInt(datos[`p${i}`]) || 0;
  }

  const { resultado, razon, recomendaciones, porcentaje } = generarRecomendaciones(puntaje, maxPuntaje);

  await prisma.Evaluacion.create({
    data: {
      nombre,
      puntaje,
      maxPuntaje,
      porcentaje,
      resultado
    }
  });

  res.render('formulario', {
    preguntas,
    resultado,
    razon,
    recomendaciones,
    puntaje,
    porcentaje
  });
});

app.post('/api/evaluacion', async (req, res) => {
  const datos = req.body;
  const nombre = datos.nombre;
  let puntaje = 0;
  let maxPuntaje = preguntas.length * 3;

  for (let i = 1; i <= preguntas.length; i++) {
    puntaje += parseInt(datos[`p${i}`]) || 0;
  }

  const { resultado, razon, recomendaciones, porcentaje } = generarRecomendaciones(puntaje, maxPuntaje);

  await prisma.Evaluacion.create({
    data: {
      nombre,
      puntaje,
      maxPuntaje,
      porcentaje,
      resultado
    }
  });

  res.json({ resultado, razon, recomendaciones, puntaje, porcentaje, maxPuntaje });
});

app.listen(3000, () => {
  console.log("Servidor corriendo en http://localhost:3000");
});
