

async function getWeather() {
    try {
        const response = await fetch('http://localhost:3000/weather');
        const res = await response.json();

        if (!response.ok) {
            showMessage('danger', 'ERROR', res.error || 'Failed to load weather forecasts.');
            return;
        }

        const results = res.results;

        showAdminWeather();
        drawWeatherTable(results);
        initChart(results);
        initCalendar(results);

    } catch (error) {
        console.error('Weather loading error:', error);
        showMessage('danger', 'ERROR', 'Could not connect to the server.');
    }
}



function drawWeatherTable(results) {
    let tbody = document.querySelector('#tbody');
    tbody.innerHTML = '';
    const user = loadUser();
    const isAdmin = user && user.role === 'admin';

    const operations = document.querySelector('#operationsHeader');
    if (operations) {
        operations.style.display = isAdmin ? '' : 'none';
    }

    results.forEach((weather, index) => {
        tbody.innerHTML += `
            <tr>
                <th scope="row">${index + 1}</th>
                <td>${moment(weather.date).format('YYYY.MM.DD')}</td>
                <td>${weather.location}</td>
                <td>${weather.weather_type}</td>
                <td class="text-end">${weather.temp_min} °C</td>
                <td class="text-end">${weather.temp_max} °C</td>
                <td class="text-end">${weather.precipitation ?? '-'}</td>
                <td class="text-end">${weather.precipitation_probability ?? '-'}%</td>
                <td class="text-end">${weather.wind_speed ?? '-'} ${weather.wind_direction ?? ''}</td>
                <td class="text-end">${weather.humidity ?? '-'}%</td>
                <td class="text-end">${weather.pressure ?? '-'}</td>
                <td class="text-end">${weather.uv_index ?? '-'}</td>
                ${isAdmin ? `<td class="text-end">
                <button type="button" class="btn btn-danger"
                    onclick="deleteWeather(${weather.ID})">
                    <i class="bi bi-trash3-fill"></i>
                    &nbsp;&nbsp;Delete
                </button>
            </td>` : ''}
            </tr>
        `;
    });
}


async function createWeather() {
    let luid = loadUser().ID ? loadUser().ID : 0;

    let date = document.querySelector('#date').value;
    let location = document.querySelector('#location').value;
    let weather_type = document.querySelector('#weathertype').value;

    let temp_min = document.querySelector('#tempmin').value;
    let temp_max = document.querySelector('#tempmax').value;
    let precipitation = document.querySelector('#precipitation').value;
    let precipitation_probability = document.querySelector('#precipitationprobability').value;

    let wind_speed = document.querySelector('#windspeed').value;
    let wind_direction = document.querySelector('#winddirection').value;
    let humidity = document.querySelector('#humidity').value;
    let pressure = document.querySelector('#pressure').value;
    let uv_index = document.querySelector('#uvindex').value;

    if (!date || !location || !weather_type || temp_min === '' || temp_max === '') {
        showMessage('danger', 'ERROR', 'Please fill in all required fields!');
        return;
    }

    const response = await fetch('http://localhost:3000/admin/weather', {
        method: 'POST',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            luid: luid,
            date: date,
            location: location,
            weather_type: weather_type,
            temp_min: temp_min,
            temp_max: temp_max,
            precipitation: precipitation === '' ? null : precipitation,
            precipitation_probability: precipitation_probability === '' ? null : precipitation_probability,
            wind_speed: wind_speed === '' ? null : wind_speed,
            wind_direction: wind_direction === '' ? null : wind_direction,
            humidity: humidity === '' ? null : humidity,
            pressure: pressure === '' ? null : pressure,
            uv_index: uv_index === '' ? null : uv_index
        })
    });

    const res = await response.json();

    if (response.status !== 201) {
        showMessage('danger', 'ERROR', res.error);
        return;
    }

    showMessage('success', 'SUCCESS', res.message);

    document.querySelector('#date').value = '';
    document.querySelector('#location').value = '';
    document.querySelector('#weathertype').value = '';
    document.querySelector('#tempmin').value = '';
    document.querySelector('#tempmax').value = '';
    document.querySelector('#precipitation').value = '';
    document.querySelector('#precipitationprobability').value = '';
    document.querySelector('#windspeed').value = '';
    document.querySelector('#winddirection').value = '';
    document.querySelector('#humidity').value = '';
    document.querySelector('#pressure').value = '';
    document.querySelector('#uvindex').value = '';

    getWeather();
}


async function deleteWeather(weatherID) {
    let luid = loadUser().ID ? loadUser().ID : 0;

    const response = await fetch(`http://localhost:3000/admin/weather/${weatherID}`, {
        method: 'DELETE',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            luid: luid
        })
    });

    const res = await response.json();

    if (response.status !== 200) {
        showMessage('danger', 'ERROR', res.error);
        return;
    }

    showMessage('success', 'SUCCESS', res.message);

    getWeather();
}


function initChart(results) {
    let labels = [];
    let minTemps = [];
    let maxTemps = [];

    results.sort((a, b) => new Date(a.date) - new Date(b.date));

    results.forEach((result) => {
        labels.push(moment(result.date).format('YYYY-MM-DD'));
        minTemps.push(result.temp_min);
        maxTemps.push(result.temp_max);
    });

    const ctx = document.getElementById('myChart');

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Minimum temperature (°C)',
                    data: minTemps,
                    borderWidth: 1
                },
                {
                    label: 'Maximum temperature (°C)',
                    data: maxTemps,
                    borderWidth: 1
                }
            ]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: false
                }
            }
        }
    });
}


function initCalendar(results) {
    var calendarEl = document.getElementById('calendar');
    colorSheme = localStorage.getItem('SCT') || 'light';

    let myEvents = results.map((result) => {
        return {
            title: result.location + ' - ' + result.weather_type,
            start: result.date
        };
    });

    var calendar = new FullCalendar.Calendar(calendarEl, {
        colorScheme: colorSheme,
        initialDate: new Date(),
        initialView: 'dayGridMonth',
        nowIndicator: true,
        headerToolbar: {
            left: 'prevYear,prev,today,next,nextYear',
            center: 'title',
            right: 'multiMonthYear,dayGridMonth,timeGridWeek,timeGridDay,listWeek'
        },
        navLinks: true,
        editable: false,
        selectable: false,
        selectMirror: true,
        dayMaxEvents: true,
        events: myEvents
    });

    calendar.render();
}
function showAdminWeather() {
    let user = loadUser();

    if (user && user.role == 'admin') {
        document.querySelector('#adminWeather').style.display = 'block';
    }
    else {
        document.querySelector('#adminWeather').style.display = 'none';
    }
}