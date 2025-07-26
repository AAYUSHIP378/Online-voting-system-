let allCandidates = [];

async function fetchCandidates() {
  try {
    const res = await fetch('/get-candidates');
    const data = await res.json();
    allCandidates = data;
    renderTable(data);
  } catch (err) {
    console.error('Error fetching candidates:', err);
  }
}

function renderTable(data) {
  const tbody = document.querySelector('#candidates-table tbody');
  tbody.innerHTML = '';
  data.forEach(c => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${c.name}</td>
      <td>${c.party}</td>
      <td>${c.type}</td>
      <td><img src="/symbols/${c.symbol}" height="30"></td>
      <td>
        <button class="edit-btn" data-id="${c.id}">Edit</button>
        <button class="delete-btn" data-id="${c.id}">Delete</button>
      </td>
    `;
    tbody.appendChild(row);
  });

  document.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', () => loadCandidate(btn.dataset.id));
  });

  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', () => deleteCandidate(btn.dataset.id));
  });
}

async function deleteCandidate(id) {
  await fetch(`/delete-candidate/${id}`, { method: 'DELETE' });
  fetchCandidates();
}

function loadCandidate(id) {
  const c = allCandidates.find(x => x.id == id);
  if (!c) return;
  document.getElementById('candidate-id').value = c.id;
  document.getElementById('name').value = c.name;
  document.getElementById('party').value = c.party;
  document.getElementById('type').value = c.type;

  const symbolInput = document.getElementById('symbol');
  symbolInput.setAttribute('data-existing-symbol', c.symbol);

  const currentSymbol = document.getElementById('current-symbol');
  currentSymbol.innerHTML = `<p>Current Symbol:</p><img src="/symbols/${c.symbol}" height="40">`;

  document.getElementById('submitBtn').textContent = 'Update Candidate';
}

document.getElementById('candidate-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const id = document.getElementById('candidate-id').value;
  const name = document.getElementById('name').value;
  const party = document.getElementById('party').value;
  const type = document.getElementById('type').value;

  const symbolFileInput = document.getElementById('symbolFile');
  const symbolInput = document.getElementById('symbol');
  const existingSymbol = symbolInput.getAttribute('data-existing-symbol') || '';

  const formData = new FormData();
  formData.append('name', name);
  formData.append('party', party);
  formData.append('type', type);

  if (symbolFileInput.files.length > 0) {
    formData.append('symbolFile', symbolFileInput.files[0]);
  } else {
    formData.append('symbol', existingSymbol);
  }

  const url = id ? `/edit-candidate/${id}` : '/add-candidate';

  await fetch(url, {
    method: 'POST',
    body: formData
  });

  e.target.reset();
  document.getElementById('candidate-id').value = '';
  document.getElementById('current-symbol').innerHTML = '';
  document.getElementById('submitBtn').textContent = 'Add Candidate';
  fetchCandidates();
});

document.getElementById('filter-type').addEventListener('change', (e) => {
  const selected = e.target.value;
  const filtered = selected ? allCandidates.filter(c => c.type === selected) : allCandidates;
  renderTable(filtered);
});

fetchCandidates();
