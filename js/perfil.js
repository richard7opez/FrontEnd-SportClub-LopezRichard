const token = localStorage.getItem("token");
const storedUser = JSON.parse(localStorage.getItem("user"));

const profileMessage = document.getElementById("profileMessage");
const passwordMessage = document.getElementById("passwordMessage");

function showFieldError(field, message) {
    const input = document.getElementById(field);
    const error = document.getElementById(`${field}Error`);

    input.style.borderColor = "red";
    error.textContent = message;
    error.style.color = "red";
}

function clearFieldErrors(fields) {
    fields.forEach(function (field) {
        document.getElementById(field).style.borderColor = "";
        document.getElementById(`${field}Error`).textContent = "";
    });
}

function renderProfile(user) {
    document.getElementById("profileName").textContent = user.full_name;
    document.getElementById("profileEmail").textContent = user.email;
    document.getElementById("profileRole").textContent = user.role;
    document.getElementById("profileBirthDate").textContent =
        user.birth_date || "No registrada";

    document.getElementById("fullName").value = user.full_name;
    document.getElementById("birthDate").value = user.birth_date || "";
}

async function loadProfile() {
    if (!token || !storedUser) {
        window.location.replace("login.html");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/auth/me`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const result = await response.json();

        if (!response.ok) {
            window.location.replace("login.html");
            return;
        }

        localStorage.setItem("user", JSON.stringify(result.data));
        renderProfile(result.data);
    } catch (error) {
        profileMessage.textContent = "No fue posible cargar el perfil.";
        profileMessage.style.color = "red";
    }
}

document.getElementById("profileForm").addEventListener("submit", async function (event) {
    event.preventDefault();

    clearFieldErrors(["fullName", "birthDate"]);
    profileMessage.textContent = "";

    const fullName = document.getElementById("fullName").value.trim();
    const birthDate = document.getElementById("birthDate").value;

    let isValid = true;

    if (fullName.length < 3) {
        showFieldError("fullName", "El nombre debe tener mínimo 3 caracteres.");
        isValid = false;
    }

    if (!birthDate) {
        showFieldError("birthDate", "La fecha de nacimiento es obligatoria.");
        isValid = false;
    }

    if (!isValid) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/auth/me`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                full_name: fullName,
                birth_date: birthDate
            })
        });

        const result = await response.json();

        if (!response.ok) {
            profileMessage.textContent = result.message;
            profileMessage.style.color = "red";
            return;
        }

        localStorage.setItem("user", JSON.stringify(result.data));
        renderProfile(result.data);

        profileMessage.textContent = "Perfil actualizado correctamente.";
        profileMessage.style.color = "green";
    } catch (error) {
        profileMessage.textContent = "No fue posible actualizar el perfil.";
        profileMessage.style.color = "red";
    }
});

document.getElementById("passwordForm").addEventListener("submit", async function (event) {
    event.preventDefault();

    clearFieldErrors(["currentPassword", "newPassword", "confirmPassword"]);
    passwordMessage.textContent = "";

    const currentPassword = document.getElementById("currentPassword").value;
    const newPassword = document.getElementById("newPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    let isValid = true;

    if (!currentPassword) {
        showFieldError("currentPassword", "La contraseña actual es obligatoria.");
        isValid = false;
    }

    if (newPassword.length < 8) {
        showFieldError("newPassword", "La nueva contraseña debe tener mínimo 8 caracteres.");
        isValid = false;
    }

    if (newPassword !== confirmPassword) {
        showFieldError("confirmPassword", "Las contraseñas no coinciden.");
        isValid = false;
    }

    if (!isValid) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/auth/me/password`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                current_password: currentPassword,
                new_password: newPassword,
                confirm_password: confirmPassword
            })
        });

        const result = await response.json();

        if (!response.ok) {
            passwordMessage.textContent = result.message;
            passwordMessage.style.color = "red";
            return;
        }

        passwordMessage.textContent = "Contraseña actualizada correctamente.";
        passwordMessage.style.color = "green";

        document.getElementById("passwordForm").reset();
    } catch (error) {
        passwordMessage.textContent = "No fue posible cambiar la contraseña.";
        passwordMessage.style.color = "red";
    }
});

document.getElementById("logoutButton").addEventListener("click", function (event) {
    event.preventDefault();

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.location.replace("login.html");
});

window.addEventListener("pageshow", loadProfile);