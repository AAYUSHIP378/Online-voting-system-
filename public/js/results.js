async function fetchResults() {
  try {
    const response = await fetch('/api/results');
    if (!response.ok) throw new Error('Failed to fetch');

    const data = await response.json();
    console.log(data);

    const tbody = document.getElementById('resultsTable');
    tbody.innerHTML = ''; // Clear previous rows

    data.forEach(row => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${row.name}</td>
        <td>${row.party}</td>
        <td>${row.vote_count}</td>
      `;
      tbody.appendChild(tr);
    });

  } catch (err) {
    console.error('❌ Failed to load results:', err);
    alert('❌ Could not fetch results. Make sure you are logged in as Admin.');
  }
}

window.addEventListener('DOMContentLoaded', fetchResults);
