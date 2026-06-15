const loginForm = document.getElementById("loginForm");
const loginMessage = document.getElementById("loginMessage");

loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    loginMessage.textContent = "Verificando credenciales...";

    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password })
        });

        const result = await response.json();

        if (!response.ok) {
            loginMessage.textContent = result.message;
            return;
        }

        localStorage.setItem("token", result.data.token);
        localStorage.setItem("user", JSON.stringify(result.data.user));

        const role = result.data.user.role;

        if (role === "admin") {
            window.location.href = "dashboard_admin.html";
        } else if (role === "coach") {
            window.location.href = "dashboard_coach.html";
        } else {
            window.location.href = "dashboard_usuario.html";
        }
    } catch (error) {
        loginMessage.textContent = "No fue posible conectar con el servidor.";
    }
});