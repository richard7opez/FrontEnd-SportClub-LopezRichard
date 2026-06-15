const token = localStorage.getItem("token");
const user = JSON.parse(localStorage.getItem("user"));

const studentsTableBody = document.getElementById("studentsTableBody");
const coachMessage = document.getElementById("coachMessage");

function renderUsers(users) {
    studentsTableBody.innerHTML = "";

    users.forEach(function (currentUser) {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${currentUser.full_name}</td>
            <td>${currentUser.email}</td>
            <td>${currentUser.role}</td>
        `;

        studentsTableBody.appendChild(row);
    });

    document.getElementById("studentCount").textContent =
        users.filter(currentUser => currentUser.role === "user").length;

    document.getElementById("coachCount").textContent =
        users.filter(currentUser => currentUser.role === "coach").length;
}

async function loadCoachDashboard() {
    if (!token || !user || user.role !== "coach") {
        window.location.replace("login.html");
        return;
    }

    document.getElementById("coachName").textContent = user.full_name;

    try {
        const response = await fetch(`${API_URL}/users`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const result = await response.json();

        if (!response.ok) {
            coachMessage.textContent = result.message;
            coachMessage.style.color = "red";
            return;
        }

        renderUsers(result.data);
    } catch (error) {
        coachMessage.textContent = "No fue posible cargar los usuarios.";
        coachMessage.style.color = "red";
    }
}

document.getElementById("logoutButton").addEventListener("click", function (event) {
    event.preventDefault();

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.location.replace("login.html");
});

window.addEventListener("pageshow", loadCoachDashboard);