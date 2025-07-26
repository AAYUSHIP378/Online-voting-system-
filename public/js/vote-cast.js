// public/js/vote-cast.js

async function loadCandidates() {
  try {
    const res = await fetch('/api/candidates');
    const candidates = await res.json();
    const select = document.getElementById('candidateSelect');

    candidates.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.id;
      opt.textContent = `${c.name} (${c.party})`;
      select.appendChild(opt);
    });
  } catch (err) {
    console.error("Failed to load candidates:", err);
  }
}

window.addEventListener('DOMContentLoaded', loadCandidates);
