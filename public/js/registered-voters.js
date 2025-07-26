// /js/registered-voters.js

async function fetchVoters() {
  try {
    const res = await fetch('/api/voters');
    if (!res.ok) throw new Error('Network response was not ok');

    const data = await res.json();
    console.log("✅ Fetched voters:", data);

    const tableBody = document.getElementById('voterTable');
    tableBody.innerHTML = '';

    data.forEach(voter => {
      const row = document.createElement('tr');
      row.innerHTML = `<td>${voter.id}</td><td>${voter.full_name}</td><td>${voter.email}</td>`;
      tableBody.appendChild(row);
    });

  } catch (err) {
    console.error('❌ Error fetching voters:', err);
    alert('Server error. Please try again later.');
  }
}

window.addEventListener('DOMContentLoaded', fetchVoters);
