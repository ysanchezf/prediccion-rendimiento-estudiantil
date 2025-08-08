document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('form');
  const pasos = document.querySelectorAll('.question-step');
  const resultadoDiv = document.getElementById('resultado');
  const barraPreguntas = document.getElementById('preguntasProgress');
  const nombreInput = document.querySelector('input[name="nombre"]');

  const validarNombre = () => {
    const nombre = nombreInput.value.trim();
    if (!nombre) {
      alert('Por favor ingresa tu nombre');
      nombreInput.focus();
      return false;
    }
    return true;
  };

  let pasoActual = 0;

  const actualizarProgreso = () => {
    const porcentaje = (pasoActual / pasos.length) * 100;
    barraPreguntas.style.width = `${porcentaje}%`;
  };

  const mostrarPaso = (indice) => {
    pasos.forEach((p, i) => {
      p.classList.remove('animate__fadeIn');
      p.classList.toggle('active', i === indice);
    });
    if (pasos[indice]) {
      pasos[indice].classList.add('animate__fadeIn');
    }
    actualizarProgreso();
  };

  mostrarPaso(pasoActual);

  pasos.forEach((paso, idx) => {
    const select = paso.querySelector('select');
    const btn = paso.querySelector('.next-btn');
    const feedback = paso.querySelector('.feedback');

    btn.addEventListener('click', () => {
      if (!validarNombre()) return;
      if (!select.value) return;

      const valor = parseInt(select.value, 10);
      let color = 'secondary', icono = 'dash-circle', mensaje = 'Registrado';
      if (valor >= 2) {
        color = 'success';
        icono = 'check-circle';
        mensaje = '¡Bien!';
      } else if (valor === 1) {
        color = 'warning';
        icono = 'exclamation-circle';
        mensaje = 'Puede mejorar';
      } else {
        color = 'danger';
        icono = 'x-circle';
        mensaje = 'Necesita atención';
      }
      feedback.innerHTML = `<i class="bi bi-${icono}"></i> ${mensaje}`;
      feedback.className = `feedback text-${color}`;

      setTimeout(() => {
        if (idx === pasos.length - 1) {
          form.requestSubmit();
        } else {
          paso.classList.add('animate__fadeOut');
          setTimeout(() => {
            paso.classList.remove('active', 'animate__fadeOut');
            pasoActual++;
            mostrarPaso(pasoActual);
          }, 500);
        }
      }, 800);
    });
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validarNombre()) return;
    const formData = new FormData(form);
    const data = {};
    formData.forEach((value, key) => data[key] = value);

    try {
      const response = await fetch('/api/evaluacion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const res = await response.json();

      let imgSrc = '/img/alto_riesgo.svg';
      if (res.resultado.includes('éxito')) {
        imgSrc = '/img/exito.svg';
      } else if (res.resultado.includes('Riesgo moderado')) {
        imgSrc = '/img/riesgo_moderado.svg';
      }

        let respuestasHTML = '';
        if (res.respuestas) {
          const items = Object.entries(res.respuestas)
            .map(([k, v]) => `<li><strong>${k}:</strong> ${v}</li>`)
            .join('');
          respuestasHTML = `<h5>Respuestas:</h5><ul>${items}</ul>`;
        }

        const nombre = res.nombre || 'No especificado';

        resultadoDiv.innerHTML = `
          <div class="alert alert-info animate__animated animate__fadeInUp">
            <h4>${res.resultado}</h4>
            <p><strong>Estudiante:</strong> ${nombre}</p>
            <p><strong>Puntaje:</strong> ${res.puntaje} / ${res.maxPuntaje}</p>
            <img src="${imgSrc}" alt="${res.resultado}" class="resultado-img"/>
            ${respuestasHTML}
          </div>
          <div class="progress mt-3 animate__animated animate__fadeInUp">
          <div id="progressBar" class="progress-bar" role="progressbar" style="width:0%"></div>
        </div>
        <canvas id="resumenChart" class="mt-4"></canvas>
      `;

      const progressBar = document.getElementById('progressBar');
      progressBar.style.width = `${res.porcentaje}%`;
      progressBar.textContent = `${res.porcentaje.toFixed(2)}%`;

      const ctx = document.getElementById('resumenChart').getContext('2d');
      new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['Obtenido', 'Restante'],
          datasets: [{
            data: [res.puntaje, res.maxPuntaje - res.puntaje],
            backgroundColor: ['#0d6efd', '#e9ecef']
          }]
        }
      });

    } catch (err) {
      resultadoDiv.innerHTML = `<div class="alert alert-danger">Error al procesar la evaluación</div>`;
      console.error(err);
    }
  });
});
