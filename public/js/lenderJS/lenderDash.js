fetch("/lender-dashboard", {
    method: "GET",
    credentials: 'include'
})
    .then(res => {
        sessionTimeoutCont.classList.remove('open');
        if (!res.ok) {
            let count = 5;
            sessionTimeoutCont.classList.add('open');
            const interval = setInterval(() => {
                if (count > 0) {
                    sessionTimeoutCont.querySelector('.timer span').textContent = count;
                } else {
                    clearInterval(interval);
                    count = 0;
                    window.location.href = "/login.html";
                    setTimeout(() => { sessionTimeoutCont.classList.remove('open'); }, 500)
                }

                count--;
            }, 1000);


            // window.location.href = "/login.html";
        }
        return res.json();
    })
    .then(data => {
        username.textContent = data.name || data.id || "Guest";
        userRole.textContent = data.role ? data.role.charAt(0).toUpperCase() + data.role.slice(1) : "role not found";
    })

