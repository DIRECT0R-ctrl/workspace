function getElements() {
  return {
  addWorkerBtn: document.getElementById('add-worker-btn'),
  unassignedList: document.getElementById('unassigned-list'),
  workspace: document.getElementById('workspace'),
  modal: document.getElementById('modal'),
  employeeForm: document.getElementById('employee-form'),
  closeModalBtn: document.getElementById('close-modal'),
  addExperienceBtn: document.getElementById('add-experience-btn'),
  photoPreview: document.getElementById('photo-preview'),
  nameInput: document.getElementById('name'),
  roleInput: document.getElementById('role'),
  emailInput: document.getElementById('email'),
  phoneInput: document.getElementById('phone'),
  photoInput: document.getElementById('photo'),
  experienceList: document.getElementById('experience-list'),
  profileModal: document.getElementById('profile-modal'),
  photo: document.getElementById('profile-photo'),
  nameEl: document.getElementById('profile-name'),
  roleEl: document.getElementById('profile-role'),
  emailEl: document.getElementById('profile-email'),
  phoneEl: document.getElementById('profile-phone'),
  localEl: document.getElementById('profile-location'),
  expList: document.getElementById('profile-experiences'),
  closeProfileModal: document.getElementById('close-profile-modal'),
  }
};


const elements = getElements();
function showModal(el) { if (!el) return; el.classList.remove('hidden'); }
function hideModal(el) { if (!el) return; el.classList.add('hidden'); }
function closeModal() {
  hideModal(elements.modal);
  elements.employeeForm.reset();
  elements.experienceList.innerHTML = '';
  elements.photoPreview.innerHTML = '';
}
elements.addWorkerBtn.addEventListener('click', () => showModal(elements.modal));
elements.closeModalBtn.addEventListener('click', closeModal);


elements.photoInput.addEventListener('input', () => {
  const url = elements.photoInput.value.trim(); 
  elements.photoPreview.innerHTML = `<img src="${url}" alt="Photo Preview" style="width:100%;border-radius:6px;">`;
});

elements.addExperienceBtn.addEventListener('click', () => {
  const div = document.createElement('div');
  div.classList.add('experience-entry');
  div.innerHTML = `
    <input type="text" placeholder="Nom de l'entreprise" class="exp-company" required>
    <input type="text" placeholder="Rôle" class="exp-role" required>
    <input type="text" id="location" placeholder="Localisation">
    <input type="month" class="exp-start" required>
    <input type="month" class="exp-end" required>
    <button type="button" class="remove-exp-btn">Supprimer</button>
  `;
  elements.experienceList.appendChild(div);
  div.querySelector('.remove-exp-btn').addEventListener('click', () => div.remove());
});

function createEmployeeCard(employee) {
  const li = document.createElement('li');
  li.className = 'employee-card';
  li.setAttribute('draggable', 'true');
  li.dataset.role = employee.role;
  li.dataset.name = employee.name;

  li.innerHTML = `
    <img src="${employee.photo}" alt="${employee.name}" class="image">
    <div class="employee-info">
      <strong>${employee.name}</strong>
      <span>${employee.role}</span>
    </div>
    <button class="remove-btn" title="Supprimer">X</button>
  `;

  li.querySelector('.remove-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    const card = e.currentTarget.closest('.employee-card');
    elements.unassignedList.appendChild(card);
    });


  li.addEventListener('dragstart', () => li.classList.add('dragging'));
  li.addEventListener('dragend', () => li.classList.remove('dragging'));

  li.addEventListener('click', (e) => {
    if (e.target.classList.contains('remove-btn')) return;
    openProfile(employee);
  });

  return li;
};

function canEnterZone(role, zone) {
  const rules = {
    reception: ['Réceptionniste', 'Manager'],
    serveurs: ['Technicien IT', 'Manager'],
    securite: ['Agent de sécurité', 'Manager'],
    archives: ['Manager']
  };
  if (zone === 'archives' && role === 'Nettoyage') return false;
  if (rules[zone]) return rules.zone.includes(role);
  return true;

}

function openProfile(employee) {
  elements.photo.src = employee.photo;
  elements.nameEl.textContent = employee.name;
  elements.roleEl.textContent = employee.role;
  elements.emailEl.textContent = employee.email;
  elements.phoneEl.textContent = employee.phone || 'N/A';
  elements.localEl.textContent = employee.location || 'N/A';
  
  const ul = elements.expList;
  ul.innerHTML = '';
  employee.experiences.forEach(exp => {
    const li = document.createElement('li');
    li.textContent = `${exp.company} - ${exp.role} - (${exp.start} -> ${exp.end})`
    ul.appendChild(li);
  });

  
  showModal(elements.profileModal);
}
elements.closeProfileModal.addEventListener('click', () => {
  hideModal(elements.profileModal);
});

elements.employeeForm.addEventListener('submit', e => {
  e.preventDefault();

  const name = elements.nameInput.value.trim();
  const role = elements.roleInput.value.trim();
  const email = elements.emailInput.value.trim();
  const phone = elements.phoneInput.value.trim();
  const photo = elements.photoInput.value.trim() || 'https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg';

  if (!name || !role) { alert('Nom et rôle sont requis.'); return; }

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!emailOk) { alert('Email invalide.'); return; }

  const phoneOk = /^[+\d\-\s]{6,20}$/.test(phone);
  if (!phoneOk) { alert('Téléphone invalide.'); return; }

  const experiences = [];
  Array.from(elements.experienceList.children).forEach(exp => {
    const company = exp.querySelector('.exp-company')?.value || '';
    const erole = exp.querySelector('.exp-role')?.value || '';
    const start = exp.querySelector('.exp-start')?.value || '';
    const end = exp.querySelector('.exp-end')?.value || '';
    if (start && end && start > end) {
      alert('La date de début doit être antérieure à la date de fin.');
      throw new Error('date order invalid');
    }
    experiences.push({ company, role: erole, start, end });
  });

  const employee = { name, role, email, phone, photo, experiences };
  const card = createEmployeeCard(employee);
  elements.unassignedList.appendChild(card);
  closeModal();
});


const zones = document.querySelectorAll('.zone .zone-content');
zones.forEach(zone => {
  zone.addEventListener('dragover', e => e.preventDefault());
  zone.addEventListener('drop', e => {
    e.preventDefault();
    const dragging = document.querySelector('.dragging');
    if (!dragging) return;

    const role = dragging.dataset.role;
    const zoneName = zone.parentElement.dataset.zone;

    if (!canEnterZone(role, zoneName)) {
      alert(`Impossible : ${role} ne peut pas être assigné ici.`);
      return;
    }

    zone.appendChild(dragging);
  });
});


document.querySelectorAll('.zone').forEach(zoneDiv => {
  const btn = zoneDiv.querySelector('.add-btn');
  const content = zoneDiv.querySelector('.zone-content');

  btn.addEventListener('click', () => {
    const unassignedWorkers = Array.from(elements.unassignedList.children);
    if (unassignedWorkers.length === 0) { alert('Aucun employé non assigné.'); return; }

    let message = 'Choisir un employé à assigner:\n';
    unassignedWorkers.forEach((li, idx) => {
      message += `${idx + 1}: ${li.dataset.name} (${li.dataset.role})\n`;
    });

    const choice = parseInt(prompt(message), 10);
    if (isNaN(choice) || choice < 1 || choice > unassignedWorkers.length) return;

    const selectedWorker = unassignedWorkers[choice - 1];
    const role = selectedWorker.dataset.role;
    const zoneName = zoneDiv.dataset.zone;

    if (!canEnterZone(role, zoneName)) {
      alert(`Impossible : ${role} ne peut pas être assigné ici.`);
      return;
    }
    
    content.appendChild(selectedWorker);
  });
});


