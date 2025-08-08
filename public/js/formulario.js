document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('form');
  const pasos = document.querySelectorAll('.question-step');
  const resultadoDiv = document.getElementById('resultado');
  let chart;

  let pasoActual = 0;
  const mostrarPaso = (indice) => {
    pasos.forEach((p, i) => p.classList.toggle('active', i === indice));
  };
  mostrarPaso(pasoActual);

  pasos.forEach((paso, idx) => {
    const select = paso.querySelector('select');
    const btn = paso.querySelector('.next-btn');
    btn.addEventListener('click', () => {
      if (!select.value) return;
      if (idx === pasos.length - 1) {
        form.submit();
      } else {
        pasoActual++;
        mostrarPaso(pasoActual);
      }
    });
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
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

      resultadoDiv.innerHTML = `
        <div class="alert alert-info animate__animated animate__fadeInUp">
          <h4>${res.resultado}</h4>
          <p><strong>Puntaje:</strong> ${res.puntaje} / ${res.maxPuntaje}</p>
          <p><strong>Porcentaje:</strong> ${res.porcentaje.toFixed(2)}%</p>
          <p><strong>Razón del resultado:</strong> ${res.razon}</p>
          <h5 class="mt-3">🔍 Recomendaciones personalizadas:</h5>
          <ul>${res.recomendaciones.map(r => `<li>${r}</li>`).join('')}</ul>
        </div>
        <div class="progress mt-3 animate__animated animate__fadeInUp">
          <div id="progressBar" class="progress-bar" role="progressbar" style="width:0%"></div>
        </div>
        <canvas id="resultChart" class="mt-3"></canvas>
      `;

      const progressBar = document.getElementById('progressBar');
      progressBar.style.width = `${res.porcentaje}%`;
      progressBar.textContent = `${res.porcentaje.toFixed(2)}%`;

      const ctx = document.getElementById('resultChart');
      const remaining = 100 - res.porcentaje;
      if (chart) chart.destroy();
      chart = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['Obtenido', 'Restante'],
          datasets: [{
            data: [res.porcentaje, remaining],
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
