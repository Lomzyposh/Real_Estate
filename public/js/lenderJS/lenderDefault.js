const username = document.querySelector('.name h3');
const userRole = document.querySelector('.name p');
const verifylogOut = document.getElementById('verifyLogout');
const logoutBtn = document.getElementById('logoutBtn');
const logoutConfirm = document.getElementById('logoutConfirm');
const cancelLogoutBtn = document.getElementById('logoutCancelBtn');
const sessionTimeoutCont = document.getElementById('sessionTimeout');
const sessionLoginBtn = document.getElementById('sessionTimeoutLoginBtn');


sessionLoginBtn.addEventListener('click', () => {
    window.location.href = "/login.html"
})

const darkBtn = document.querySelector('.themeBtn');
darkBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    const icon = darkBtn.querySelector('i');
    if (document.body.classList.contains('dark')) {
        icon.className = "fa-solid fa-sun fa-xl";
        localStorage.setItem('novaTheme', JSON.stringify({ name: 'dark' }));
    } else {
        icon.className = "fa-solid fa-moon fa-xl dark"
        localStorage.setItem('novaTheme', JSON.stringify({ name: 'light' }));
    }
});

document.addEventListener('DOMContentLoaded', () => {
    let theme = JSON.parse(localStorage.getItem('novaTheme')) || { name: 'light' };
    const icon = darkBtn.querySelector('i');

    if (theme.name === "dark") {
        document.body.classList.add('dark');
        icon.className = "fa-solid fa-sun fa-xl";
    } else {
        document.body.classList.remove('dark');
        icon.className = "fa-solid fa-moon fa-xl dark";
    }
})

verifylogOut.addEventListener('click', () => {
    logoutConfirm.classList.add('open');
});

logoutBtn.addEventListener('click', () => {
    fetch('/logout-dashboard', {
        method: 'POST',
        credentials: 'include'
    })
        .then(res => {
            if (res.ok) {
                window.location.href = '/';
            } else {
                console.error('Logout failed');
            }
        })
        .catch(err => console.error('Error during logout:', err));
});

cancelLogoutBtn.addEventListener('click', () => {
    logoutConfirm.classList.remove('open');
});

document.addEventListener('click', (e) => {
    if (e.target === logoutConfirm) {
        logoutConfirm.classList.remove('open');
    }
});