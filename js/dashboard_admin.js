const token = localStorage.getItem("token");
const loggedUser = JSON.parse(localStorage.getItem("user"));

const usersTableBody = document.getElementById("usersTableBody");
const adminMessage = document.getElementById("adminMessage");
const userFormSection = document.getElementById("userFormSection");
const userForm = document.getElementById("userForm");

let users = [];

function formatDate(date) {
    return new Date(date).toLocaleDateString("es-CL");
}

function getRoleBadge(role) {
    const colors = {
        admin: "purple",
        coach: "blue",
        user: "green"
    };

    return `
        <span style="
            color: white;
            background: ${colors[role]};
            padding: 4px 8px;
            border-radius: 8px;
        ">
            ${role}
        </span>
    `;
}

function showMessage(message, color) {
    adminMessage.textContent = message;
    adminMessage.style.color = color;
}

function clearErrors() {
    const fields = ["fullName", "email", "password", "confirmPassword"];

    fields.forEach(function (field) {
        document.getElementById(field).style.borderColor = "";
        document.getElementById(`${field}Error`).textContent = "";
    });
}

function showError(field, message) {
    document.getElementById(field).style.borderColor = "red";

    const error = document.getElementById(`${field}Error`);
    error.textContent = message;
    error.style.color = "red";
}

function renderUsers() {
    usersTableBody.innerHTML = "";

    users.forEach(function (currentUser) {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${currentUser.id}</td>
            <td>${currentUser.full_name}</td>
            <td>${currentUser.email}</td>
            <td>${getRoleBadge(currentUser.role)}</td>
            <td>${formatDate(currentUser.created_at)}</td>
            <td>
                <button
                    type="button"
                    onclick="editUser(${currentUser.id})"
                >
                    Editar
                </button>

                <button
                    type="button"
                    onclick="deleteUser(${currentUser.id})"
                >
                    Eliminar
                </button>
            </td>
        `;

        usersTableBody.appendChild(row);
    });

    document.getElementById("totalUsers").textContent = users.length;

    document.getElementById("totalCoaches").textContent =
        users.filter(user => user.role === "coach").length;

    document.getElementById("totalAdmins").textContent =
        users.filter(user => user.role === "admin").length;
}

async function loadUsers() {
    if (!token || !loggedUser || loggedUser.role !== "admin") {
        window.location.replace("login.html");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/users`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const result = await response.json();

        if (!response.ok) {
            showMessage(result.message, "red");
            return;
        }

        users = result.data;
        renderUsers();
    } catch (error) {
        showMessage("No fue posible cargar los usuarios.", "red");
    }
}

function openNewUserForm() {
    clearErrors();
    userForm.reset();

    document.getElementById("userId").value = "";
    document.getElementById("formTitle").textContent = "Nuevo Usuario";
    document.getElementById("password").required = true;
    document.getElementById("confirmPassword").required = true;

    userFormSection.hidden = false;
    userFormSection.scrollIntoView({ behavior: "smooth" });
}

function editUser(userId) {
    const selectedUser = users.find(user => user.id === userId);

    if (!selectedUser) {
        showMessage("Usuario no encontrado.", "red");
        return;
    }

    clearErrors();
    userForm.reset();

    document.getElementById("userId").value = selectedUser.id;
    document.getElementById("fullName").value = selectedUser.full_name;
    document.getElementById("email").value = selectedUser.email;
    document.getElementById("role").value = selectedUser.role;

    document.getElementById("formTitle").textContent = "Editar Usuario";
    document.getElementById("password").required = false;
    document.getElementById("confirmPassword").required = false;

    userFormSection.hidden = false;
    userFormSection.scrollIntoView({ behavior: "smooth" });
}

async function saveUser(event) {
    event.preventDefault();
    clearErrors();

    const userId = document.getElementById("userId").value;
    const fullName = document.getElementById("fullName").value.trim();
    const email = document.getElementById("email").value.trim().toLowerCase();
    const role = document.getElementById("role").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    let isValid = true;

    if (fullName.length < 3) {
        showError("fullName", "El nombre debe tener mínimo 3 caracteres.");
        isValid = false;
    }

    if (!email.includes("@")) {
        showError("email", "Ingresa un correo válido.");
        isValid = false;
    }

    if (!userId && password.length < 8) {
        showError("password", "La contraseña debe tener mínimo 8 caracteres.");
        isValid = false;
    }

    if (password && password.length < 8) {
        showError("password", "La contraseña debe tener mínimo 8 caracteres.");
        isValid = false;
    }

    if (password !== confirmPassword) {
        showError("confirmPassword", "Las contraseñas no coinciden.");
        isValid = false;
    }

    if (!isValid) {
        return;
    }

    const userData = {
        full_name: fullName,
        email,
        role
    };

    if (password) {
        userData.password = password;
    }

    const url = userId
        ? `${API_URL}/users/${userId}`
        : `${API_URL}/users`;

    const method = userId ? "PUT" : "POST";

    try {
        const response = await fetch(url, {
            method,
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(userData)
        });

        const result = await response.json();

        if (!response.ok) {
            showMessage(result.message, "red");
            return;
        }

        showMessage(
            userId
                ? "Usuario actualizado correctamente."
                : "Usuario creado correctamente.",
            "green"
        );

        userFormSection.hidden = true;
        userForm.reset();

        loadUsers();
    } catch (error) {
        showMessage("No fue posible guardar el usuario.", "red");
    }
}

async function deleteUser(userId) {
    const confirmed = confirm("¿Estás seguro de eliminar este usuario?");

    if (!confirmed) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/users/${userId}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const result = await response.json();

        if (!response.ok) {
            showMessage(result.message, "red");
            return;
        }

        showMessage("Usuario eliminado correctamente.", "green");
        loadUsers();
    } catch (error) {
        showMessage("No fue posible eliminar el usuario.", "red");
    }
}

document.getElementById("newUserButton").addEventListener("click", openNewUserForm);

document.getElementById("cancelButton").addEventListener("click", function () {
    userFormSection.hidden = true;
    userForm.reset();
    clearErrors();
});

userForm.addEventListener("submit", saveUser);

document.getElementById("logoutButton").addEventListener("click", function (event) {
    event.preventDefault();

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.location.replace("login.html");
});

window.addEventListener("pageshow", loadUsers);