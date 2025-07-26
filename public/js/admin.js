function loadView(viewName) {
  fetch(`/views/${viewName}.html`)
    .then(res => {
      if (!res.ok) throw new Error('Page not found');
      return res.text();
    })
    .then(html => {
      document.getElementById('contentArea').innerHTML = html;
    })
    .catch(err => {
      document.getElementById('contentArea').innerHTML = '<p style="color:red;">Failed to load view.</p>';
      console.error(err);
    });
}
