let contentBox = document.getElementById('content');

let lightModeBtn = document.querySelector('#lightModeBtn');
let darkModeBtn = document.querySelector('#darkModeBtn');

let theme = 'light';


async function navigate(page) {
    let user = loadUser();

    if (page.startsWith('admin/') &&
        (!user || user.role != 'admin')) {
        showMessage('danger', 'ERROR', 'Access denied!');
        return;
    }

    if (page.startsWith('users/') && page != 'users/home' && page != 'users/login' &&
        page != 'users/register' && page != 'users/weather' &&(!user || (user.role != 'user' && user.role != 'admin'))) {
        showMessage('danger', 'ERROR', 'Please log in first!');
        return;
    }

    contentBox.innerHTML = await (await fetch(`views/${page}.html`)).text();

    switch (page) {
        case 'admin/users': {
            getAllUsers();
            break;
        }
        case 'admin/dashboard': {
            getStatistics();
            break;
        }
        case 'users/profile': {
            getUserData();
            break;
        }
        case 'users/weather': {
            showAdminWeather();
            getWeather();
            break;
        }
    }
}


lightModeBtn.addEventListener('click', ()=>{
    let theme = 'light';
    setTheme(theme);

})
darkModeBtn.addEventListener('click', ()=>{
    let theme = 'dark'
    setTheme(theme);

})
function setTheme(theme){
document.documentElement.setAttribute('data-bs-theme', theme);
document.body.setAttribute('data-color-scheme', theme)


saveTheme(theme);
setThemeBtnState();
}

function saveTheme(theme){
    localStorage.setItem('SCT', theme);
}

function loadTheme(){
    theme = 'light';
    if (localStorage.getItem('SCT')){
        theme = localStorage.getItem('SCT');
        if (theme == 'dark'){
            setThemeBtnState();
        }
    }
    setTheme(theme);
}

function setThemeBtnState(){
    lightModeBtn.classList.toggle('hide');
    darkModeBtn.classList.toggle('hide');
}
navigate('guest/home');

loadTheme();

loginCheck();