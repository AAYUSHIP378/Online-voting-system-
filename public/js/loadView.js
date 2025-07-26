function loadView(viewName) {
    fetch(`/${viewName}.html`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to load ${viewName}.html`);
            }
            return response.text();
        })
        .then(html => {
            document.getElementById("main-content").innerHTML = html;
        })
        .catch(error => {
            console.error("Error loading view:", error);
        });
}
