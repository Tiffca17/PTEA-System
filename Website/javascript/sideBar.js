// Get the menu icon and sidebar elements
// const menuIcon = document.querySelector('.fa-bars');
// const sidebar = document.querySelector('.sideBar');
// const content = document.getElementById('main');
// const closeIcon = document.querySelector('.fa-xmark');
// const menuIconHolder = document.querySelector('.leftBar');

// // Add click event listener to the menu icon
// menuIcon.addEventListener('click', () => {
//     // Toggle the 'active' class on the sidebar
//     sidebar.classList.toggle('active');

//     if (sidebar.classList.contains('active')) {
//         menuIcon.style.display = 'none';
//         content.style.marginLeft = '150px'; // Match sidebar width
//         menuIconHolder.style.marginRight = '-35px';

//     } else {
//         content.style.marginLeft = '0';
//     }
// });

// closeIcon.addEventListener('click', () => {
//     menuIcon.style.display = 'block';
//     sidebar.classList.remove('active');
//     content.style.marginLeft = '0';
//     menuIconHolder.style.marginRight = '0px';
// });


const menuIcon = document.querySelector('.fa-bars');
const sidebar = document.querySelector('.sideBar');
const content = document.getElementById('main');
const closeIcon = document.querySelector('.fa-xmark');
const menuIconHolder = document.querySelector('.leftBar');
// const overlay = document.querySelector('#overlay');

// Add click event listener to the menu icon
menuIcon.addEventListener('click', () => {
    // Toggle the 'active' class on the sidebar
    sidebar.classList.toggle('active');

    if (sidebar.classList.contains('active')) {
        menuIcon.style.display = 'none';
        content.style.marginLeft = '150px'; // Match sidebar width
        // overlay.style.display = 'block';
        menuIconHolder.style.marginRight = '-35px';

    } else {
        // overlay.style.display = 'none';
        // content.style.marginLeft = '0px'; // Match sidebar width
    }
});

closeIcon.addEventListener('click', () => {
    menuIcon.style.display = 'block';
    sidebar.classList.remove('active');
    content.style.marginLeft = '0px';
    // overlay.style.display = 'none';
    menuIconHolder.style.marginRight = '0px';
});
