document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.getElementById("login-form");
  const passwordInput = document.getElementById("password");
  const passwordToggle = document.querySelector(".password-toggle");
  const errorMessage = document.getElementById("error-message"); // Add this line

  let passwordVisible = false;

  loginForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    // Send a POST request to the login API endpoint
    fetch("http://localhost:8080/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: username,
        password: password, // Send the plain password
      }),
    })
      .then((response) => {
        if (response.status === 200) {
          return response.json();
        } else {
          throw new Error("Invalid credentials");
        }
      })
      .then((data) => {
        // Store the username and role in session storage
        sessionStorage.setItem("username", data.username);
        sessionStorage.setItem("role", data.role);

        // Redirect to the index.html page
        window.location.href = "../";
      })
      .catch((error) => {
        console.error(error);
        errorMessage.textContent = "Invalid username or password"; // Add this line
      });
  });

  passwordToggle.addEventListener("click", function () {
    passwordVisible = !passwordVisible;
    passwordInput.type = passwordVisible ? "text" : "password";
    passwordToggle.classList.toggle("active");
  });
});