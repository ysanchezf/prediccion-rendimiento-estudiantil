// app.js
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const trainModel = require('./ml/trainModel');
const app = express();
const prisma = new PrismaClient();

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

function cargarModelo() {
  try {
    const data = fs.readFileSync(path.join(__dirname, 'public', 'models', 'model.json')); 
    return JSON.parse(data);
  } catch (err) {
    console.error('No se pudo cargar el modelo, usando pesos por defecto');
    return { w: 6, b: -3 };
  }
}

let modelo = cargarModelo();

function predecirRiesgo(puntaje, maxPuntaje) {
  const porcentaje = (puntaje / maxPuntaje) * 100;
  const x = porcentaje / 100;
  const z = modelo.w * x + modelo.b;
  const prob = 1 / (1 + Math.exp(-z));

  let resultado = "";
  let razon = "";
  let recomendaciones = [];

  if (prob >= 0.66) {
    resultado = "✅ Alta probabilidad de éxito académico";
    razon = "El modelo predice alta probabilidad de éxito.";
    recomendaciones = [
      "Mantén tus rutinas de estudio consistentes.",
      "Continúa cuidando tu salud mental y física.",
      "Sigue aprovechando los recursos de la universidad (tutorías, biblioteca, asesorías)."
    ];
  } else if (prob >= 0.33) {
    resultado = "⚠️ Riesgo moderado";
    razon = "El modelo detecta factores de riesgo moderado.";
    recomendaciones = [
      "Establece un horario de estudio semanal y cúmplelo.",
      "Evita dejar tareas para último momento.",
      "Habla con un orientador académico si te sientes abrumado.",
      "Participa más en clases y usa los recursos de la universidad."
    ];
  } else {
    resultado = "❌ Alta probabilidad de queme o abandono";
    razon = "El modelo indica alto riesgo de queme o abandono.";
    recomendaciones = [
      "Busca ayuda de un orientador o psicólogo universitario.",
      "Establece prioridades y reduce las distracciones.",
      "No enfrentes todo solo: apóyate en profesores o compañeros.",
      "Consulta sobre becas, tutorías o programas de ayuda económica."
    ];
  }

  return { resultado, razon, recomendaciones, porcentaje };
}

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

const sugerenciasPreguntas = [
  "Organiza sesiones de estudio fuera del horario de clases para reforzar el aprendizaje.",
  "Establece un horario de estudio semanal y cúmplelo con constancia.",
  "Prioriza el descanso e intenta dormir al menos 6 horas cada noche.",
  "Mejora tu alimentación incorporando comidas balanceadas durante el día.",
  "Busca actividades o metas que te motiven dentro de tu carrera.",
  "Solicita apoyo de profesores o tutorías para las materias que se te dificultan.",
  "Planifica tus tareas con anticipación para poder entregarlas a tiempo.",
  "Participa más en clase para reforzar tu comprensión de los temas.",
  "Apóyate en familiares o amigos cuando lo necesites.",
  "Intenta equilibrar tus responsabilidades laborales y académicas.",
  "Investiga opciones de becas o apoyos económicos disponibles.",
  "Practica técnicas de manejo del estrés como ejercicios de respiración.",
  "Busca apoyo psicológico si sientes ansiedad o depresión.",
  "Infórmate sobre los servicios de ayuda académica y emocional de la universidad.",
  "Utiliza los servicios de apoyo de la universidad como tutorías y asesorías."
];

app.get('/', (req, res) => {
  res.render('formulario', {
    preguntas,
    resultado: null,
    recomendacionesPreguntas: [],
    respuestas: []
  });
});

app.post('/', async (req, res) => {
  const datos = req.body;
  const nombre = datos.nombre;
  let puntaje = 0;
  const maxPuntaje = preguntas.length * 3;
  const recomendacionesPreguntas = [];
  const respuestas = [];

  for (let i = 1; i <= preguntas.length; i++) {
    const valor = parseInt(datos[`p${i}`]) || 0;
    respuestas.push(valor);
    puntaje += valor;
    if (valor <= 1) {
      recomendacionesPreguntas.push({
        indice: i - 1,
        pregunta: preguntas[i - 1],
        sugerencia: sugerenciasPreguntas[i - 1]
      });
    }
  }

  const { resultado, razon, recomendaciones, porcentaje } = predecirRiesgo(puntaje, maxPuntaje);

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
    porcentaje,
    recomendacionesPreguntas,
    respuestas
  });
});

app.post('/api/evaluacion', async (req, res) => {
  const datos = req.body;
  const { nombre, ...respuestas } = datos;
  let puntaje = 0;
  let maxPuntaje = preguntas.length * 3;

  for (let i = 1; i <= preguntas.length; i++) {
    puntaje += parseInt(datos[`p${i}`]) || 0;
  }

  const { resultado, razon, recomendaciones, porcentaje } = predecirRiesgo(puntaje, maxPuntaje);

  await prisma.Evaluacion.create({
    data: {
      nombre,
      puntaje,
      maxPuntaje,
      porcentaje,
      resultado
    }
  });

  res.json({
    resultado,
    razon,
    recomendaciones,
    puntaje,
    porcentaje,
    maxPuntaje,
    nombre,
    respuestas
  });
});


app.post('/api/retrain', async (req, res) => {
  const token = req.headers['x-retrain-token'];
  const expected = process.env.RETRAIN_TOKEN || 'secret';
  if (token !== expected) {
    return res.status(403).json({ error: 'No autorizado' });
  }
  await trainModel();
  modelo = cargarModelo();
  res.json({ status: 'Modelo reentrenado' });
});

if (require.main === module) {
  app.listen(3000, () => {
    console.log("Servidor corriendo en http://localhost:3000");
  });
}

module.exports = { app, generarRecomendaciones: predecirRiesgo };
