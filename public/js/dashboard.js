function loadView(viewName) {
  fetch(`/views/${viewName}.html`)
    .then(res => {
      if (!res.ok) throw new Error("View not found");
      return res.text();
    })
    .then(html => {
      document.getElementById('content').innerHTML = html;
    })
    .catch(err => {
      document.getElementById('content').innerHTML = `<p style="color: red;">Error loading view: ${err.message}</p>`;
    });
}

// Optionally load default view
window.onload = () => loadView('candidate-results');
