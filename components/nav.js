const arrowText = document.querySelector('.buyDrop');
const arrow = document.querySelector('#arrow');
const dropDown = document.querySelector('.dropdownMenu ul');
const hamburgerMenu = document.querySelector('.hamburgerMenu');
const overlay = document.querySelector('.overlay');
const navMenu = document.querySelector('ul.gen');

arrow.addEventListener('click', dropDownSection)

const dropDownMenu = document.querySelector('.dropdownMenu ul');
function dropDownSection() {
    event.preventDefault();
    dropDown.classList.toggle('active');
    arrow.classList.toggle('rotate');
    console.log("added")
}

function closeDropdown() {
    dropDown.classList.remove('active');
    arrow.className = 'fa-solid fa-chevron-down';
}

document.addEventListener('click', function (event) {
    const isClickInside = arrowText.contains(event.target) || dropDown.contains(event.target) || arrow.contains(event.target);
    if (!isClickInside) {
        closeDropdown();
    }
    if (!hamburgerMenu.contains(event.target) && !navMenu.contains(event.target)) {
        hamburgerMenu.classList.remove('active');
        navMenu.classList.remove('show');
        overlay.classList.remove('active');
    }
});

hamburgerMenu.addEventListener('click', () => {
    hamburgerMenu.classList.toggle('active');
    navMenu.classList.toggle('show');
    overlay.classList.toggle('active');
});

overlay.addEventListener('click', () => {
    hamburgerMenu.classList.remove('active');
    overlay.classList.remove('active');
});



// const arrowText = document.querySelector('.buyDrop');
// const arrow = document.querySelector('#arrow');
// const dropDown = document.querySelector('.dropdownMenu ul');
// const hamburgerMenu = document.querySelector('.hamburgerMenu');
// const navMenu = document.querySelector('ul.gen');
// const side = document.querySelector('#sideMenu .side');
// const sideMenu = document.getElementById('sideMenu');
// const overlay = document.querySelector('#sideMenu .overlay');
// arrow.addEventListener('click', dropDownSection)

// const dropDownMenu = document.querySelector('.dropdownMenu ul');
// function dropDownSection() {
//     event.preventDefault();
//     dropDown.classList.toggle('active');
//     arrow.classList.toggle('rotate');
//     console.log("added")
// }

// function closeDropdown() {
//     dropDown.classList.remove('active');
//     arrow.className = 'fa-solid fa-chevron-down';
// }

// document.addEventListener('click', function (event) {
//     const isClickInside = arrowText.contains(event.target) || dropDown.contains(event.target) || arrow.contains(event.target)
//     if (!isClickInside) {
//         closeDropdown();
//     }
//     if (!hamburgerMenu.contains(event.target) && !navMenu.contains(event.target) && !side.contains(event.target)) {
//         hamburgerMenu.classList.remove('active');
//         navMenu.classList.remove('show');
//         overlay.classList.remove('active');
//         sideMenu.classList.remove('show');
//     }
// });

// hamburgerMenu.addEventListener('click', () => {
//     hamburgerMenu.classList.toggle('active');
//     sideMenu.classList.toggle('show')
// });