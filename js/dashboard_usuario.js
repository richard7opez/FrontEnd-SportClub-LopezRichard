function verificarSesion() {
    const user = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");

    if (!user || !token || user.role !== "user") {
        window.location.replace("login.html");
        return;
    }

    document.getElementById("nombreUsuario").textContent = user.full_name;
    document.getElementById("perfilNombre").textContent = user.full_name;
    document.getElementById("perfilCorreo").textContent = user.email;
    document.getElementById("perfilRol").textContent = user.role;
    document.getElementById("perfilNacimiento").textContent =
        user.birth_date || "No registrada";
}

window.addEventListener("pageshow", verificarSesion);

document.getElementById("logoutButton").addEventListener("click", function (event) {
    event.preventDefault();

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.location.replace("login.html");
});