

async function registration() {
    const name = document.querySelector('#name').value.trim();
    const email = document.querySelector('#email').value.trim();
    const passwd = document.querySelector('#passwd').value;
    const confirm = document.querySelector('#confirm').value;

    if (!name || !email || !passwd || !confirm) {
        showMessage('danger', 'HIBA', 'Minden mező kitöltése kötelező!');
        return;
    }

    if (passwd !== confirm) {
        showMessage('danger', 'HIBA', 'A két jelszó nem egyezik!');
        return;
    }

    const user = {
        name,
        email,
        passwd,
        confirm
    };

    try {
        const response = await fetch('http://localhost:3000/users/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(user)
        });

        const res = await response.json();

        if (response.status !== 201) {
            showMessage(
                'danger',
                'HIBA',
                res.error || 'Sikertelen regisztráció!'
            );
            return;
        }

        showMessage('success', 'SIKER', res.message);
        navigate('users/login');

    } catch (error) {
        console.error('Regisztrációs hiba:', error);
        showMessage(
            'danger',
            'HIBA',
            'Nem sikerült kapcsolódni a szerverhez!'
        );
    }
}

async function login(){
    let email = document.querySelector('#email').value;
    let passwd = document.querySelector('#passwd').value;

    let user = {
        email,
        passwd
    }

    const response = await fetch(`http://localhost:3000/users/login`,{
        method: 'POST',
        headers: {
            "Content-Type": "Application/json"
        },
        body: JSON.stringify(user)
    });
    const res = await response.json();

     if (response.status != 200){
        showMessage('danger', 'ERROR', res.error)
    }
    else{
        showMessage('success', 'OK', res.message)
        storeUser(res.loggedUser)
        loginCheck()
        navigate('users/home')
    }
}
function logout(){
    clearUser()
    loginCheck()
    navigate('users/home')
}

function storeUser(user){
    sessionStorage.setItem('SCU', JSON.stringify(user))
}
function loadUser(){
    let user = JSON.parse(sessionStorage.getItem('SCU'));
    return user;
}
function clearUser(){
    sessionStorage.removeItem('SCU');
}

function loginCheck() {
    let user = loadUser();

    if (user) {
        if (user.role == 'admin') {
            setMenuItems('admin');
        }
        else {
            setMenuItems('user');
        }
    }
    else {
        setMenuItems('');
    }
}


function setMenuItems(param){
    let baseMenu = document.querySelector('#baseMenu');
    let adminMenu = document.querySelector('#adminMenu');
    let userMenu = document.querySelector('#userMenu');
    switch(param){
        case 'admin': {
            baseMenu.classList.add('hide')
            userMenu.classList.add('hide')
            adminMenu.classList.remove('hide')
            break;
        }
        case 'user': {
            baseMenu.classList.add('hide')
            adminMenu.classList.add('hide')
            userMenu.classList.remove('hide')
            break;
        }
        default: {
            userMenu.classList.add('hide')
            adminMenu.classList.add('hide')
            baseMenu.classList.remove('hide')
            break;
        }
    }
}

async function updateProfile() {
    let name = document.querySelector('#name');
    let email = document.querySelector('#email');

    const user = loadUser();

    if (!user || !user.ID) {
        showMessage('danger', 'ERROR', 'You are not logged in!');
        return;
    }

    const uid = user.ID;

    const data = {
        username: name.value,
        email: email.value,
        luid: uid
    };


    const response = await fetch(`http://localhost:3000/users/${uid}`, {
        method: 'PATCH',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });

    const res = await response.json();

    if (!response.ok) {
        showMessage('danger', 'ERROR', res.error);
    }
    else {
        showMessage('success', 'OK', res.message);

        name.value = '';
        email.value = '';
    }
}

async function updatePasswd(){
    let oldpass = document.querySelector('#oldpass');
    let newpass = document.querySelector('#newpass');
    let confirm = document.querySelector('#confirm');

    let data = {
        oldpass: oldpass.value,
        newpass: newpass.value,
        confirm: confirm.value
    }

    let uid = loadUser().ID ? loadUser().ID : 0;

    const response = await fetch(`http://localhost:3000/users/${uid}/passmod`,{
        method: 'POST',
        headers: {
            "Content-Type": "Application/json"
        },
        body: JSON.stringify(data),
    });

    const res = await response.json();

    if (response.status != 200){
        showMessage('danger', 'ERROR', res.error)
    }
    else{
        showMessage('success', 'OK', res.message)
        oldpass.value = '';
        newpass.value = '';
        confirm.value = '';
    }
}
function getUserData(){
    let user = loadUser();
    document.querySelector('#name').value = user.name;
    document.querySelector('#email').value = user.email;
}