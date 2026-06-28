const STORAGE_KEY = 'studentManagementStudents';
const defaultStudents = [
  {
    id: '1',
    name: 'Monica Amer',
    course: 'BS Information Technology',
    year: '3rd Year',
    email: 'monica@example.com',
    status: 'Active'
  },
  {
    id: '2',
    name: 'John Santos',
    course: 'BS Computer Science',
    year: '2nd Year',
    email: 'john@example.com',
    status: 'On Leave'
  }
];

let students = loadStudents();
let editingId = null;

const form = document.getElementById('studentForm');
const studentIdInput = document.getElementById('studentId');
const nameInput = document.getElementById('name');
const courseInput = document.getElementById('course');
const yearInput = document.getElementById('year');
const emailInput = document.getElementById('email');
const statusInput = document.getElementById('status');
const searchInput = document.getElementById('searchInput');
const tableBody = document.getElementById('studentTableBody');
const formTitle = document.getElementById('formTitle');
const submitBtn = document.getElementById('submitBtn');
const cancelEditBtn = document.getElementById('cancelEdit');

form.addEventListener('submit', handleSubmit);
searchInput.addEventListener('input', renderStudents);
cancelEditBtn.addEventListener('click', resetForm);
tableBody.addEventListener('click', handleTableAction);

renderStudents();
updateSummary();

function loadStudents() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    return defaultStudents;
  }

  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) && parsed.length ? parsed : defaultStudents;
  } catch (error) {
    console.error('Unable to read student data.', error);
    return defaultStudents;
  }
}

function saveStudents() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
}

function handleSubmit(event) {
  event.preventDefault();

  const studentData = {
    name: nameInput.value.trim(),
    course: courseInput.value.trim(),
    year: yearInput.value.trim(),
    email: emailInput.value.trim(),
    status: statusInput.value
  };

  if (!studentData.name || !studentData.course || !studentData.year || !studentData.email) {
    return;
  }

  if (editingId) {
    students = students.map((student) =>
      student.id === editingId ? { ...student, ...studentData } : student
    );
  } else {
    students.unshift({
      id: createId(),
      ...studentData
    });
  }

  saveStudents();
  renderStudents();
  updateSummary();
  resetForm();
}

function handleTableAction(event) {
  const actionButton = event.target.closest('button');
  if (!actionButton) return;

  const studentId = actionButton.getAttribute('data-id');
  if (!studentId) return;

  if (actionButton.classList.contains('edit')) {
    editStudent(studentId);
  }

  if (actionButton.classList.contains('delete')) {
    deleteStudent(studentId);
  }
}

function editStudent(studentId) {
  const student = students.find((entry) => entry.id === studentId);
  if (!student) return;

  editingId = studentId;
  studentIdInput.value = student.id;
  nameInput.value = student.name;
  courseInput.value = student.course;
  yearInput.value = student.year;
  emailInput.value = student.email;
  statusInput.value = student.status;

  formTitle.textContent = 'Edit Student';
  submitBtn.textContent = 'Update Student';
  cancelEditBtn.style.display = 'inline-flex';
  nameInput.focus();
}

function deleteStudent(studentId) {
  const student = students.find((entry) => entry.id === studentId);
  if (!student) return;

  const confirmDelete = window.confirm(`Delete ${student.name}?`);
  if (!confirmDelete) return;

  students = students.filter((entry) => entry.id !== studentId);
  saveStudents();
  renderStudents();
  updateSummary();

  if (editingId === studentId) {
    resetForm();
  }
}

function renderStudents() {
  const searchTerm = searchInput.value.toLowerCase();
  const filteredStudents = students.filter((student) => {
    const haystack = `${student.name} ${student.course}`.toLowerCase();
    return haystack.includes(searchTerm);
  });

  if (!filteredStudents.length) {
    tableBody.innerHTML = '<tr><td colspan="5" class="empty-state">No student records found.</td></tr>';
    return;
  }

  tableBody.innerHTML = filteredStudents.map((student) => `
    <tr>
      <td>${student.name}</td>
      <td>${student.course}</td>
      <td>${student.year}</td>
      <td>${student.status}</td>
      <td>
        <button class="action-btn edit" data-id="${student.id}"><i class="fas fa-edit"></i> Edit</button>
        <button class="action-btn delete" data-id="${student.id}"><i class="fas fa-trash"></i> Delete</button>
      </td>
    </tr>
  `).join('');
}

function updateSummary() {
  document.getElementById('totalStudents').textContent = students.length;
  document.getElementById('activeStudents').textContent = students.filter((student) => student.status === 'Active').length;
  document.getElementById('graduatedStudents').textContent = students.filter((student) => student.status === 'Graduated').length;
}

function resetForm() {
  form.reset();
  studentIdInput.value = '';
  editingId = null;
  formTitle.textContent = 'Add Student';
  submitBtn.textContent = 'Add Student';
  cancelEditBtn.style.display = 'none';
  statusInput.value = 'Active';
}

function createId() {
  return window.crypto && window.crypto.randomUUID
    ? window.crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

resetForm();
