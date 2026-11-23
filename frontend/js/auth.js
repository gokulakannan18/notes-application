const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const authMessage = document.getElementById("authMessage");
if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const name = document.getElementById("registerName").value.trim();
        const email = document.getElementById("registerEmail").value.trim();
        const password = document.getElementById("registerPassword").value;
        try {
            const response = await fetch("/api/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ name, email, password })
            });

            const data = await response.json();

            authMessage.textContent = data.message;

            if (response.ok) {
                registerForm.reset();
                setTimeout(() => {
                    window.location.href = "login.html";
                }, 1000);
            }
        } catch (error) {
            authMessage.textContent = "Something went wrong. Please try again.";
        }
    });
}
if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = document.getElementById("loginEmail").value.trim();
        const password = document.getElementById("loginPassword").value;

        try {
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            authMessage.textContent = data.message;

            if (response.ok) {
                loginForm.reset();
                window.location.href = "index.html";
            }
        } catch (error) {
            authMessage.textContent = "Something went wrong. Please try again.";
        }
    });
}
const forgotPasswordForm = document.getElementById("forgotPasswordForm");
if (forgotPasswordForm) {
    forgotPasswordForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = document.getElementById("forgotEmail").value.trim();
        try {
            const response = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            authMessage.textContent = data.message;

            if (response.ok) {
                forgotPasswordForm.reset();
            }
        } catch (error) {
            authMessage.textContent = "Something went wrong. Please try again.";
        }
    });
}
const resetPasswordForm = document.getElementById("resetPasswordForm");
if (resetPasswordForm) {
    resetPasswordForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const password = document.getElementById("newPassword").value;
        const confirmPassword = document.getElementById("confirmPassword").value;

        const params = new URLSearchParams(window.location.search);
        const token = params.get("token");

        if (!token) {
            authMessage.textContent = "Reset token is missing.";
            return;
        }

        if (password !== confirmPassword) {
            authMessage.textContent = "Passwords do not match.";
            return;
        }

        try {
            const response = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ token, password })
            });

            const data = await response.json();

            authMessage.textContent = data.message;

            if (response.ok) {
                resetPasswordForm.reset();

                setTimeout(() => {
                    window.location.href = "login.html";
                }, 2000);
            }
        } catch (error) {
            authMessage.textContent = "Password reset failed. Please try again.";
        }
    });
}
