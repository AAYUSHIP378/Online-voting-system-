function loadStatus() {
  fetch('/voting-status')
    .then(res => res.json())
    .then(data => {
      const el = document.getElementById('votingStatus');
      if (el) el.textContent = data.enabled ? 'Enabled' : 'Disabled';
    });
}

function toggleVoting() {
  fetch('/toggle-voting', { method: 'POST' })
    .then(() => loadStatus());
}

function loadLiveMonitor() {
  fetch('/results')
    .then(res => res.json())
    .then(data => {
      const html = 
        <ul>
          ${data.map(c => <li>${c.name}: ${c.votes} vote(s)</li>).join('')}
        </ul>;
      const el = document.getElementById('liveMonitor');
      if (el) el.innerHTML = html;
    });
}

function loadVoters() {
  fetch('/voters')
    .then(res => res.json())
    .then(data => {
      const table = 
        <table border="1">
          <thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Age</th><th>Gender</th><th>Voted</th></tr></thead>
          <tbody>
            ${data.map(v => 
              <tr>
                <td>${v.id}</td>
                <td>${v.name}</td>
                <td>${v.email}</td>
                <td>${v.age}</td>
                <td>${v.gender}</td>
                <td>${v.has_voted ? 'Yes' : 'No'}</td>
              </tr>).join('')}
                </tbody>
        </table>;
      const el = document.getElementById('voterList');
      if (el) el.innerHTML = table;
    });
}
function loadCandidateResults() {
  fetch('/results')
    .then(res => res.json())
    .then(data => {
      const tableHTML = 
        <table border="1">
          <thead>
            <tr><th>ID</th><th>Candidate Name</th><th>Total Votes</th></tr>
          </thead>
          <tbody>
            ${data.map(c => 
              <tr>
                <td>${c.id}</td>
                <td>${c.name}</td> dalke do 
                <td>${c.votes}</td>
              </tr>).join('')}
          </tbody>
           </table>;
      const el = document.getElementById('candidateResults');
      if (el) el.innerHTML = tableHTML;
    });
}
function loadCandidates() {
  fetch('/results')
    .then(res => res.json())
    .then(data => {
      const rows = data.map(c => 
        <tr>
          <td>${c.id}</td>
          <td>${c.name}</td>
          <td>${c.votes}</td>   isme basic handlers for voter login and registration code ko attach
          <td><button onclick="deleteCandidate(${c.id})">Delete</button></td>
        </tr>).join('');
      
      const table = 
        <table border="1">
          <thead><tr><th>ID</th><th>Name</th><th>Votes</th><th>Actions</th></tr></thead>

   <tbody>${rows}</tbody>
        </table>;
      
      const el = document.getElementById('candidateTable');
      if (el) el.innerHTML = table;
    });
}

function deleteCandidate(id) {
  fetch(`/delete-candidate/${id}`, { method: 'DELETE' })
    .then(() => loadCandidates());
}

function loadView(view) {
  fetch(`views/${view}.html`)
    .then(r => r.text())
    .then(html => {
      document.getElementById('mainContent').innerHTML = html;
    });
}

// Initial load: Login
loadView('voter-login');



function loadView(viewName) {
  fetch(`views/${viewName}.html`)
    .then(res => res.text())
    .then(html => {
      document.getElementById('mainContent').innerHTML = html;

      setTimeout(() => {
        if (viewName === 'candidate-results') loadCandidateResults();
        if (viewName === 'manage-candidates') loadCandidates();
        if (viewName === 'registered-voters') loadVoters();
        if (viewName === 'voting-session') loadStatus();
        if (viewName === 'live-monitor') loadLiveMonitor();

        // ✅ Register Form Handler
        if (viewName === 'voter-register') {
          const form = document.getElementById('voterRegisterForm');
          if (form) {
            form.addEventListener('submit', function (e) {
              e.preventDefault();
              const data = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                age: document.getElementById('age').value,
                gender: document.getElementById('gender').value,
                password: document.getElementById('password').value
              };

              fetch('/register-voter', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
              })
              .then(res => res.json())
              .then(res => {
                document.getElementById('registerMessage').textContent = res.message || 'Registration successful!';
              })
              .catch(err => {
                document.getElementById('registerMessage').textContent = 'Error: ' + err.message;
              });
            });
          }
        }

        // ✅ (Optional) Voter Login Handler Placeholder
        if (viewName === 'voter-login') {
          // Attach voter login handler here
        }

      }, 100); // end of setTimeout
    });
}

// -------------------------
// VOTER REGISTRATION HANDLER
// -------------------------
function attachVoterRegistration() {
  const form = document.getElementById('voterRegisterForm');
  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const data = {
      name: document.getElementById('name').value,
      email: document.getElementById('email').value,
      age: document.getElementById('age').value,
      gender: document.getElementById('gender').value,
      password: document.getElementById('password').value,
    };

    fetch('http://localhost:3000/register-voter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
      .then((res) => res.json())
      .then((response) => {
        document.getElementById('registerMessage').textContent =
          response.message || 'Registered successfully!';
      })
      .catch((err) => {
        document.getElementById('registerMessage').textContent = 'Error: ' + err.message;
      });
  });
}

// -------------------------
// VOTER LOGIN HANDLER
// -------------------------
function attachVoterLogin() {
  const form = document.getElementById('voterLoginForm');
  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const data = {
      email: document.getElementById('loginEmail').value,
      password: document.getElementById('loginPassword').value,
    };

    fetch('http://localhost:3000/voter-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
      .then((res) => res.json())
      .then((response) => {
        if (response.success) {
          alert('Login successful');
          // Optionally redirect or load vote-cast form
          loadView('cast-vote');
        } else {
          alert('Invalid login credentials');
        }
      })
      .catch((err) => {
        alert('Login error: ' + err.message);
      });
  });
}
