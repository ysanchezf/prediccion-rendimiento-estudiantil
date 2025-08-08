document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('form');
  const resultadoDiv = document.getElementById('resultado');

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
        </div>
        <div class="progress mt-3 animate__animated animate__fadeInUp">
          <div id="progressBar" class="progress-bar" role="progressbar" style="width:0%"></div>
        </div>
      `;

      const progressBar = document.getElementById('progressBar');
      progressBar.style.width = `${res.porcentaje}%`;
      progressBar.textContent = `${res.porcentaje.toFixed(2)}%`;

    } catch (err) {
      resultadoDiv.innerHTML = `<div class="alert alert-danger">Error al procesar la evaluación</div>`;
      console.error(err);
    }
  });
});
