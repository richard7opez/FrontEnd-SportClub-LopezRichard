const registerForm = document.getElementById("registerForm");
const registerMessage = document.getElementById("registerMessage");

function mostrarError(field, message) {
    const input = document.getElementById(field);
    const error = document.getElementById(`${field}Error`);

    input.style.borderColor = "red";
    error.textContent = message;
    error.style.color = "red";
}

function limpiarErrores() {
    const fields = [
        "fullName",
        "birthDate",
        "email",
        "password",
        "confirmPassword"
    ];

    fields.forEach(function (field) {
        document.getElementById(field).style.borderColor = "";
        document.getElementById(`${field}Error`).textContent = "";
    });

    registerMessage.textContent = "";
}

registerForm.addEventListener("submit", async function (event) {
    event.preventDefault();
    limpiarErrores();

    const fullName = document.getElementById("fullName").value.trim();
    const birthDate = document.getElementById("birthDate").value;
    const email = document.getElementById("email").value.trim().toLowerCase();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const sport = document.getElementById("sport").value;

    let isValid = true;

    if (fullName.length < 3) {
        mostrarError("fullName", "El nombre debe tener mínimo 3 caracteres.");
        isValid = false;
    }

    if (!birthDate) {
        mostrarError("birthDate", "La fecha de nacimiento es obligatoria.");
        isValid = false;
    }

    if (!email) {
        mostrarError("email", "El correo es obligatorio.");
        isValid = false;
    }

    if (password.length < 8) {
        mostrarError("password", "La contraseña debe tener mínimo 8 caracteres.");
        isValid = false;
    }

    if (password !== confirmPassword) {
        mostrarError("confirmPassword", "Las contraseñas no coinciden.");
        isValid = false;
    }

    if (!isValid) {
        return;
    }

    const newUser = {
        full_name: fullName,
        birth_date: birthDate,
        email,
        password,
        metadata: {
            sports: sport
                ? [{ name: sport, frequency_per_week: 0 }]
                : []
        }
    };

    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(newUser)
        });

        const result = await response.json();

        if (!response.ok) {
            registerMessage.textContent = result.message;
            registerMessage.style.color = "red";
            return;
        }

        registerMessage.textContent =
            "Usuario registrado correctamente. Ya puedes iniciar sesión.";
        registerMessage.style.color = "green";

        registerForm.reset();
    } catch (error) {
        registerMessage.textContent = "No fue posible conectar con el servidor.";
        registerMessage.style.color = "red";
    }
});