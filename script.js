const STORAGE_KEY = "campusdesk_students_v1";

const form = document.getElementById("studentForm");
const editIdInput = document.getElementById("editId");
const fullNameInput = document.getElementById("fullName");
const matricNoInput = document.getElementById("matricNo");
const departmentInput = document.getElementById("department");
const levelInput = document.getElementById("level");
const emailInput = document.getElementById("email");
const phoneInput = document.getElementById("phone");
const tableBody = document.getElementById("studentTableBody");
const emptyState = document.getElementById("emptyState");
const searchInput = document.getElementById("searchInput");
const levelFilter = document.getElementById("levelFilter");
const toast = document.getElementById("toast");

let students = loadStudents();

function loadStudents() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(stored) ? stored : [];
  } catch (error) {
    console.error("Could not read saved student records:", error);
    return [];
  }
}

function saveStudents() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
    return true;
  } catch (error) {
    console.error("Could not save student records:", error);
    showToast("Unable to save. Browser storage may be full or unavailable.");
    return false;
  }
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove("show"), 2600);
}

function clearErrors() {
  ["nameError", "matricError", "departmentError", "levelError", "emailError", "phoneError"]
    .forEach(id => document.getElementById(id).textContent = "");
}

function validateStudent(data) {
  clearErrors();
  let valid = true;

  if (!data.fullName) {
    document.getElementById("nameError").textContent = "Please enter the student's full name.";
    valid = false;
  }
  if (!data.matricNo) {
    document.getElementById("matricError").textContent = "Matriculation number is required.";
    valid = false;
  } else {
    const duplicate = students.some(student =>
      student.matricNo.toLowerCase() === data.matricNo.toLowerCase() &&
      student.id !== data.id
    );
    if (duplicate) {
      document.getElementById("matricError").textContent = "This matriculation number already exists.";
      valid = false;
    }
  }
  if (!data.department) {
    document.getElementById("departmentError").textContent = "Please enter a department.";
    valid = false;
  }
  if (!data.level) {
    document.getElementById("levelError").textContent = "Please select a level.";
    valid = false;
  }
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    document.getElementById("emailError").textContent = "Enter a valid email address.";
    valid = false;
  }
  if (data.phone && !/^[0-9+\-\s()]{7,20}$/.test(data.phone)) {
    document.getElementById("phoneError").textContent = "Enter a valid phone number.";
    valid = false;
  }
  return valid;
}

function getFormData() {
  return {
    id: editIdInput.value || makeId(),
    fullName: fullNameInput.value.trim(),
    matricNo: matricNoInput.value.trim(),
    department: departmentInput.value.trim(),
    level: levelInput.value,
    email: emailInput.value.trim(),
    phone: phoneInput.value.trim()
  };
}

function makeId() {
  return (window.crypto && crypto.randomUUID)
    ? crypto.randomUUID()
    : `student-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

form.addEventListener("submit", event => {
  event.preventDefault();
  const data = getFormData();
  if (!validateStudent(data)) return;

  const editing = Boolean(editIdInput.value);
  if (editing) {
    students = students.map(student => student.id === data.id ? data : student);
  } else {
    students.unshift(data);
  }

  if (!saveStudents()) return;
  renderStudents();
  resetForm();
  showToast(editing ? "Student record updated." : "Student added successfully.");
});

function resetForm() {
  form.reset();
  editIdInput.value = "";
  document.getElementById("formTitle").textContent = "Add a student";
  document.getElementById("saveButton").textContent = "Save student";
  document.getElementById("cancelEdit").classList.add("hidden");
  clearErrors();
}

document.getElementById("cancelEdit").addEventListener("click", resetForm);

function renderStudents() {
  const query = searchInput.value.trim().toLowerCase();
  const selectedLevel = levelFilter.value;
  const filtered = students.filter(student => {
    const searchable = [student.fullName, student.matricNo, student.department, student.email]
      .join(" ").toLowerCase();
    return searchable.includes(query) && (!selectedLevel || student.level === selectedLevel);
  });

  tableBody.innerHTML = "";
  filtered.forEach(student => {
    const row = document.createElement("tr");

    const studentCell = document.createElement("td");
    const identity = document.createElement("div");
    identity.className = "student-cell";
    const avatar = document.createElement("div");
    avatar.className = "student-avatar";
    avatar.textContent = initials(student.fullName);
    const details = document.createElement("div");
    const name = document.createElement("div");
    name.className = "student-name";
    name.textContent = student.fullName;
    const email = document.createElement("div");
    email.className = "student-email";
    email.textContent = student.email || "No email supplied";
    details.append(name, email);
    identity.append(avatar, details);
    studentCell.append(identity);

    const matricCell = makeCell(student.matricNo);
    const deptCell = makeCell(student.department);
    const levelCell = document.createElement("td");
    const pill = document.createElement("span");
    pill.className = "level-pill";
    pill.textContent = student.level;
    levelCell.append(pill);

    const actionCell = document.createElement("td");
    const actions = document.createElement("div");
    actions.className = "action-group";
    const editButton = document.createElement("button");
    editButton.className = "icon-btn";
    editButton.type = "button";
    editButton.textContent = "Edit";
    editButton.setAttribute("aria-label", `Edit ${student.fullName}`);
    editButton.addEventListener("click", () => beginEdit(student.id));
    const deleteButton = document.createElement("button");
    deleteButton.className = "icon-btn delete";
    deleteButton.type = "button";
    deleteButton.textContent = "Delete";
    deleteButton.setAttribute("aria-label", `Delete ${student.fullName}`);
    deleteButton.addEventListener("click", () => deleteStudent(student.id));
    actions.append(editButton, deleteButton);
    actionCell.append(actions);

    row.append(studentCell, matricCell, deptCell, levelCell, actionCell);
    tableBody.append(row);
  });

  emptyState.classList.toggle("hidden", filtered.length > 0);
  if (students.length > 0 && filtered.length === 0) {
    emptyState.querySelector("strong").textContent = "No matching records";
    emptyState.querySelector("p").textContent = "Try another search term or filter.";
  } else {
    emptyState.querySelector("strong").textContent = "No student records yet";
    emptyState.querySelector("p").textContent = "Add your first student using the form.";
  }
  document.getElementById("recordCount").textContent =
    `Showing ${filtered.length} of ${students.length} record${students.length === 1 ? "" : "s"}`;
  document.getElementById("totalStudents").textContent = students.length;
  document.getElementById("totalDepartments").textContent =
    new Set(students.map(s => s.department.toLowerCase())).size;
  document.getElementById("totalLevels").textContent =
    new Set(students.map(s => s.level)).size;
}

function makeCell(value) {
  const cell = document.createElement("td");
  cell.textContent = value;
  return cell;
}

function initials(name) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0].toUpperCase()).join("");
}

function beginEdit(id) {
  const student = students.find(item => item.id === id);
  if (!student) return;
  editIdInput.value = student.id;
  fullNameInput.value = student.fullName;
  matricNoInput.value = student.matricNo;
  departmentInput.value = student.department;
  levelInput.value = student.level;
  emailInput.value = student.email;
  phoneInput.value = student.phone;
  document.getElementById("formTitle").textContent = "Edit student";
  document.getElementById("saveButton").textContent = "Update student";
  document.getElementById("cancelEdit").classList.remove("hidden");
  clearErrors();
  fullNameInput.focus();
  document.getElementById("students").scrollIntoView({ behavior: "smooth", block: "start" });
}

function deleteStudent(id) {
  const student = students.find(item => item.id === id);
  if (!student) return;
  if (!window.confirm(`Delete the record for ${student.fullName}? This cannot be undone.`)) return;
  students = students.filter(item => item.id !== id);
  if (saveStudents()) {
    renderStudents();
    if (editIdInput.value === id) resetForm();
    showToast("Student record deleted.");
  }
}

searchInput.addEventListener("input", renderStudents);
levelFilter.addEventListener("change", renderStudents);

document.getElementById("clearAll").addEventListener("click", () => {
  if (!students.length) {
    showToast("There are no records to clear.");
    return;
  }
  if (!window.confirm("Delete ALL student records from this browser? This cannot be undone.")) return;
  students = [];
  if (saveStudents()) {
    resetForm();
    renderStudents();
    showToast("All student records have been cleared.");
  }
});

document.getElementById("exportCsv").addEventListener("click", () => {
  if (!students.length) {
    showToast("There are no records to export.");
    return;
  }
  const headers = ["Full Name", "Matriculation Number", "Department", "Level", "Email", "Phone"];
  const rows = students.map(s => [s.fullName, s.matricNo, s.department, s.level, s.email, s.phone]);
  const csv = [headers, ...rows].map(row => row.map(csvEscape).join(",")).join("\r\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "student-records.csv";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  showToast("CSV export downloaded.");
});

function csvEscape(value) {
  const safe = String(value ?? "").replace(/"/g, '""');
  return `"${safe}"`;
}

renderStudents();
