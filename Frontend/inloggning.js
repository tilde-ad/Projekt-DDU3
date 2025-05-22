const createButton = document.getElementById("createButton");
const loginButton = document.getElementById("loginButton");

createButton.addEventListener("click", async () => {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    const response = await fetch("http://localhost:8000/savedAcounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    });

    if (response.ok) {
        alert("Account created!");
        window.location.href = "index.html"; // Ändra till korrekt namn på spelets sida
    } else {
        alert("Something went wrong. Please try again.");
    }
});

loginButton.addEventListener("click", async () => {
    const username = document.getElementById("loginUsername").value;
    const password = document.getElementById("loginPassword").value;

    const response = await fetch("http://localhost:8000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    });

    const result = await response.json();
    if (result.success) {
        alert("Login successful!");
        window.location.href = "index.html"; // byt till rätt spelsida
    } else {
        alert("Incorrect username or password.");
    }
});
