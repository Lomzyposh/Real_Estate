const entireForm = document.querySelector('.entireForm');
const formContainer = document.getElementById('formContainer');
const loginForm = document.getElementById('loginForm');
const loginEmailInput = document.getElementById('loginEmailInput');
const loginPassInput = document.getElementById('loginPasswordInput');
const loginForgotPassword = document.querySelector('.loginForgotPassword span');

const loginSubFormBtn = document.getElementById('loginSubFormBtn');

const signUpForm = document.getElementById('signUpForm');
const signUpEmailInput = document.getElementById('signUpEmailInput');
const signUpPasswordInput = document.getElementById('signUpPasswordInput');
const confirmSignUpPasswordInput = document.getElementById('confirmSignUpPasswordInput');
const signErrorMsg = document.querySelector('.signError-message');
const logErrorMsg = document.querySelector('.logError-message');
const forgotErrorMsg = document.querySelector('.forgotErrorMsg')

const forgotPasswordForm = document.getElementById('forgotPasswordForm');

const forgotEmailInput = document.getElementById('forgotEmailInput');

const forgotBackBtn = document.getElementById('forgotBackBtn');

const slider = document.querySelector('.slider');
const signUp = document.getElementById('signUpSwitch');
const login = document.getElementById('loginSwitch');
const verifyOtpForm = document.getElementById('resetOtpForm');
const otpCodeInputs = document.querySelectorAll('#code-input input');
const otpErrorMsg = document.querySelector('.otpErrorMsg')

const resendOtp = document.querySelector('#resendOtp');

const loader = document.querySelector('.loaderDiv');

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// const toggle = document.getElementById('themeToggle');
// toggle.addEventListener('click', () => {
//     document.body.classList.toggle('light');
//     toggle.classList.toggle('sun-mode');
// });

const darkBtn = document.querySelector('.themeBtn');
darkBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    const icon = darkBtn.querySelector('i');
    if (icon.classList.contains('dark')) {
        icon.className = "fa-solid fa-sun fa-2xl";
    } else {
        icon.className = "fa-solid fa-moon fa-2xl dark"
    }
});

function changeSlide(text) {
    slider.style.left = text === "signUp" ? '50%' : '0%';
}


// A SetTimout async 
async function setDelay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


signUp.addEventListener('click', () => {
    changeSlide("signUp");
    entireForm.classList.add('sign-active');
});

login.addEventListener('click', () => {
    changeSlide("left");
    entireForm.classList.remove('sign-active');
});

loginForgotPassword.addEventListener('click', () => {
    formContainer.classList.add('forgot-active');
    forgotPasswordForm.style.display = 'flex';
    forgotEmailInput.value = loginEmailInput.value;
});

let countNum = 10;
const count = setInterval(() => {

    if (countNum > 0) {
        resendOtp.querySelector('span').innerHTML = `( ${countNum}s )`;
    } else {
        clearInterval(count);
        resendOtp.querySelector('span').innerHTML = '';
        resendOtp.disabled = false;
    }

    countNum--;

}, 1000);


forgotPasswordForm.addEventListener('submit', async (e) => {
    forgotErrorMsg.style.display = 'none';
    e.preventDefault();
    loader.style.display = 'flex';
    await setDelay(1000);
    loader.style.display = 'none';

    const email = forgotEmailInput.value.trim();

    if (!emailRegex.test(email)) {
        displayErrorMessage(logErrorMsg, 'Please enter a valid email address.');
        return;
    }

    try {
        const response = await fetch('/api/forgot-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email }),
        });

        const data = await response.json();
        if (response.ok) {
            alert(data.message || 'Password reset link sent to your email.');
            forgotPasswordForm.style.display = "none";
            resetOtpForm.style.display = "flex";
            console.log("Otp sent")
            let countNum = 10;
            const count = setInterval(() => {

                if (countNum > 0) {
                    resendOtp.querySelector('span').innerHTML = `( ${countNum}s )`;
                } else {
                    clearInterval(count);
                    resendOtp.querySelector('span').innerHTML = '';
                    resendOtp.disabled = false;
                }

                countNum--;

            }, 1000);
        } else {
            displayErrorMessage(forgotErrorMsg, data.message || 'Failed to send reset link.');
        }
    } catch (error) {
        console.error('Network error:', error);
        displayErrorMessage(forgotErrorMsg, 'Network error. Please try again.');
    }
});

resendOtp.addEventListener('click', async (e) => {
    otpErrorMsg.style.display = 'none';
    e.preventDefault();
    loader.style.display = 'flex';
    await setDelay(2000);
    loader.style.display = 'none';

    const email = forgotEmailInput.value.trim();
    try {
        const response = await fetch('/api/forgot-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email }),
        });

        const data = await response.json();

        if (response.ok) {
            alert(data.message || 'Password reset link sent to your email.');
            console.log("Otp sent")
            let countNum = 10;
            const count = setInterval(() => {

                if (countNum > 0) {
                    resendOtp.querySelector('span').innerHTML = `( ${countNum}s )`;
                } else {
                    clearInterval(count);
                    resendOtp.querySelector('span').innerHTML = '';
                    resendOtp.disabled = false;
                }

                countNum--;

            }, 1000);
        } else {
            displayErrorMessage(otpErrorMsg, data.message || 'Failed to send reset link.');
        }

    } catch (err) {
        console.error('Network error:', err);
        displayErrorMessage(otpErrorMsg, 'Network error. Please try again.');
    }

})



forgotBackBtn.addEventListener('click', () => {
    formContainer.classList.remove('forgot-active');
});



otpCodeInputs.forEach((input, index) => {
    input.addEventListener('input', () => {
        input.value = input.value.replace(/[^0-9]/g, '').slice(0, 1);

        if (input.value.length === 1 && index < otpCodeInputs.length - 1) {
            otpCodeInputs[index + 1].focus();
        }

    });

    input.addEventListener('keydown', (e) => {
        if (e.key === "Backspace" && input.value === '' && index > 0) {
            otpCodeInputs[index - 1].focus();
        }
    })
});


resetOtpForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const otpInput = Array.from(otpCodeInputs).map(input => {
        return input.value
    }).join("");
    const otp = parseInt(otpInput);

    const email = forgotEmailInput.value;

    const response = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp }),
    });

    loader.style.display = 'flex';
    await setDelay(1000);
    loader.style.display = 'none';

    if (response.ok) {

    } else {
        displayErrorMessage(signErrorMsg, 'User Already Registered');
    }
})

function displayErrorMessage(errorDiv, message) {
    errorDiv.textContent = message;
    errorDiv.style.display = 'inline-block';
}

// {
//     id: 1,
//     fullName: "Alice Johnson",
//     email: "alice.johnson@example.com",
//     password: "Test@1234",
//     savedListings: ["prop001", "prop002"],
//     recentViews: ["prop002", "prop005"],
//     profilePic: "https://example.com/images/alice.jpg",
//     createdAt: "2025-05-101T10:30:00Z"
// }


async function registerUser(email, password) {
    console.log('Registering user:', email);
    try {
        const response = await fetch('/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();
        if (response.ok) {
            signErrorMsg.style.display = 'none';
            try {
                const response = await fetch('/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email, password }),
                });
                const data = await response.json();
                if (response.ok) {
                    console.log(data);
                    if (data.role === 'lender') {
                        window.location.href = '/lenders/lenderDash.html';
                    } else {
                        window.location.href = '/';
                    }
                } else {
                    displayErrorMessage(signErrorMsg, data.message || 'Invalid email or password.');
                }
            } catch (err) {
                displayErrorMessage(signErrorMsg, 'Network Error');
                console.error('Network error:', err);
            }
        } else {
            displayErrorMessage(signErrorMsg, 'User Already Registered');
        }
    } catch (error) {
        console.error('Network error:', error);
    }
}

async function loginUser(email, password) {
    console.log('Logging in user:', email);
    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();
        if (response.ok) {
            logErrorMsg.style.display = 'none'
            alert(data.message);
            // localStorage.setItem('userData', JSON.stringify(data.user));
            console.log(data);

            if (data.role === 'lender') {

                window.location.href = '/lenders/lenderDash.html';
            } else {
                window.location.href = '/';
            }
        } else {
            displayErrorMessage(logErrorMsg, data.message || 'Invalid email or password.');
        }
    } catch (error) {
        displayErrorMessage(logErrorMsg, 'Network Error');
        console.error('Network error:', error);
    }
}

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    loader.style.display = 'flex';
    await setDelay(3000);
    loader.style.display = 'none';

    const email = loginEmailInput.value.trim();
    const password = loginPassInput.value.trim();

    if (!emailRegex.test(email)) {
        displayErrorMessage(logErrorMsg, 'Please enter a valid email address.');
        return;
    }

    if (password.length < 8) {
        displayErrorMessage(logErrorMsg, 'Password must be at least 8 characters long.');
        return;
    }

    loginUser(email, password)
        .then(() => {
            loginForm.querySelector('#loginPasswordInput').value = '';
        })
        .catch((error) => {
            console.error('Error logging in user:', error);
            displayErrorMessage(logErrorMsg, 'Failed to log in. Please try again.');
        });
});

signUpForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    loader.style.display = 'flex';
    await setDelay(1000);
    loader.style.display = 'none';

    signErrorMsg.style.display = 'none';
    const email = signUpEmailInput.value.trim();
    const password = signUpPasswordInput.value.trim();

    if (!emailRegex.test(email)) {
        displayErrorMessage(signErrorMsg, 'Please enter a valid email address.');
        return;
    }

    if (password.length < 8) {
        displayErrorMessage(signErrorMsg, 'Password must be at least 8 characters long.');
        return;
    }

    if (password !== confirmSignUpPasswordInput.value.trim()) {
        displayErrorMessage(signErrorMsg, 'Passwords do not match.');
        return;
    }

    registerUser(email, password)
        .then(() => {
            signUpEmailInput.value = '';
            signUpPasswordInput.value = '';
            confirmSignUpPasswordInput.value = '';
        })
        .catch((error) => {
            console.error('Error registering user:', error);
            displayErrorMessage(signErrorMsg, 'Failed to register user. Please try again.');
        });

});

// Img storage Cloudianary

// const form = document.getElementById('uploadForm');
// const resultDiv = document.getElementById('result');

// form.addEventListener('submit', async (e) => {
//     e.preventDefault();

//     const fileInput = document.getElementById('profileImage');
//     const file = fileInput.files[0];

//     if (!file) {
//         alert("Choose an Image")
//         return;
//     }

//     const formData = new FormData();
//     formData.append('profileImage', file);

//     try {
//         const res = await fetch('http://localhost:3000/upload-profile', {
//             method: 'POST',
//             body: formData
//         });
//         const data = await res.json();
//         if (res.ok) {
//             resultDiv.innerHTML = `
//             <p>Upload Successful</p>
//             <img src="${data.imageUrl}" alt="Profile">
//             <p>URL: <a href="${data.imageUrl}" target="_blank">${data.imageUrl}</a></p>`;
//         } else {
//             resultDiv.textContent = 'Upload failed: ' + (data.message || 'Unknown error');
//         }
//     } catch (err) {
//         resultDiv.textContent = 'Upload failed: ' + err.message;
//     }
// })

