function showAdminWeather() {
    let user = loadUser();

    if (user && user.role == 'admin') {
        document.querySelector('#adminWeather').style.display = 'block';
    }
    else {
        document.querySelector('#adminWeather').style.display = 'none';
    }
}




async function getAllUsers(){

    let luid = loadUser().ID ? loadUser().ID : 0;
    const response = await fetch(`http://localhost:3000/admin/users`,{
        method: 'POST',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({luid}),
    });
    

    if (response.status !== 200){
        const res = await response.json();
        showMessage('danger', 'ERROR', res.error);
    }
    else{
        const data = await response.json();
        drawTable(data.results);
    }
    
    
}

function drawTable(users) {

    let userList = document.querySelector('#userList');
    let usersCount = document.querySelector('#usersCount');

    userList.innerHTML = '';
    usersCount.innerHTML = users.length;

    users.forEach((user, index) => {addTableRow(user, index);});
}


function addTableRow(user, index) {

    let tr = document.createElement('tr');

    let td1 = document.createElement('td');
    let td2 = document.createElement('td');
    let td3 = document.createElement('td');
    let td4 = document.createElement('td');
    let td5 = document.createElement('td');
    let td6 = document.createElement('td');
    let td7 = document.createElement('td');

    td1.innerHTML = (index + 1) + ".";
    td2.innerHTML = user.name;
    td3.innerHTML = user.email;

    td4.innerHTML = user.registration_date
        ? moment(user.registration_date).format('YYYY-MM-DD HH:mm')
        : 'N/A';

    td5.innerHTML = user.last_login
        ? moment(user.last_login).fromNow()
        : 'Never';

    td6.innerHTML = user.login_count;

    let isActive = Number(user.status) === 1 ? 'checked' : '';
    let isDisabled = user.ID == loadUser().ID ? 'disabled' : '';

    td7.innerHTML = `
        <div class="form-check form-switch float-end">
            <input
                class="form-check-input"
                type="checkbox"
                role="switch"
                id="is_active_${user.ID}"
                ${isActive}
                ${isDisabled}
                onclick="changeUserStatus(${user.ID})"
            >
        </div>
    `;

    tr.appendChild(td1);
    tr.appendChild(td2);
    tr.appendChild(td3);
    tr.appendChild(td4);
    tr.appendChild(td5);
    tr.appendChild(td6);
    tr.appendChild(td7);

    document.querySelector('#userList').appendChild(tr);
}

  

async function changeUserStatus(uid) {

    let luid = loadUser().ID ? loadUser().ID : 0;

    let data = {
        uid,
        luid
    };

    const response = await fetch('http://localhost:3000/admin/status', {
        method: 'PATCH',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });

    const res = await response.json();

    if (!response.ok) {
        showMessage('danger', 'ERROR', res.error);

        getAllUsers();
    }
    else {
        showMessage('success', 'OK', res.message);
        getAllUsers();
    }
}
