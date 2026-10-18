let weatherChart = null;
let weatherCalendar = null;
let weatherCalendarElement = null;

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
        <tr id="weather-row-${weather.ID}">
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
                <button type="button" class="btn btn-primary btn-sm"
                    onclick="editWeather(${weather.ID}, ${index + 1})">
                    &nbsp;&nbsp;Edit
                </button>
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
function editWeather(weatherID, index) {
    let row = document.querySelector('#weather-row-' + weatherID);


    let cells = row.querySelectorAll('td');

    let date = cells[0].innerText;
    let location = cells[1].innerText;
    let weather_type = cells[2].innerText;
    let temp_min = cells[3].innerText.replace(' °C', '');
    let temp_max = cells[4].innerText.replace(' °C', '');
    let precipitation = cells[5].innerText;
    let precipitation_probability = cells[6].innerText.replace('%', '');
    let wind = cells[7].innerText.split(' ');
    let wind_speed = wind[0] === '-' ? '' : wind[0];
    let wind_direction = wind[1] || '';
    let humidity = cells[8].innerText.replace('%', '');
    let pressure = cells[9].innerText;
    let uv_index = cells[10].innerText;

    if (precipitation === '-') precipitation = '';
    if (precipitation_probability === '-') precipitation_probability = '';
    if (humidity === '-') humidity = '';
    if (pressure === '-') pressure = '';
    if (uv_index === '-') uv_index = '';

    date = moment(date, 'YYYY.MM.DD').format('YYYY-MM-DD');

    row.innerHTML = `
        <th scope="row">${index}</th>

        <td><input type="date" id="edit-date-${weatherID}"
            class="form-control" value="${date}"></td>

        <td><input type="text" id="edit-location-${weatherID}"
            class="form-control" value="${location}"></td>

        <td><input type="text" id="edit-type-${weatherID}"
            class="form-control" value="${weather_type}"></td>

        <td><input type="number" id="edit-min-${weatherID}"
            class="form-control" value="${temp_min}"></td>

        <td><input type="number" id="edit-max-${weatherID}"
            class="form-control" value="${temp_max}"></td>

        <td><input type="number" id="edit-precipitation-${weatherID}"
            class="form-control" value="${precipitation}"></td>

        <td><input type="number" id="edit-probability-${weatherID}"
            class="form-control" value="${precipitation_probability}"></td>

        <td>
            <input type="number" id="edit-wind-${weatherID}"
                class="form-control mb-1" placeholder="Speed"
                value="${wind_speed}">
            <input type="text" id="edit-direction-${weatherID}"
                class="form-control" placeholder="Direction"
                value="${wind_direction}">
        </td>

        <td><input type="number" id="edit-humidity-${weatherID}"
            class="form-control" value="${humidity}"></td>

        <td><input type="number" id="edit-pressure-${weatherID}"
            class="form-control" value="${pressure}"></td>

        <td><input type="number" id="edit-uv-${weatherID}"
            class="form-control" value="${uv_index}"></td>

        <td>
            <button type="button" class="btn btn-success btn-sm"
                onclick="saveWeather(${weatherID})">
                Save
            </button>

            <button type="button" class="btn btn-secondary btn-sm"
                onclick="getWeather()">
                Cancel
            </button>
        </td>
    `;
    
}
async function saveWeather(weatherID) {
    let luid = loadUser().ID ? loadUser().ID : 0;

    let date = document.querySelector('#edit-date-' + weatherID).value;
    let location = document.querySelector('#edit-location-' + weatherID).value;
    let weather_type = document.querySelector('#edit-type-' + weatherID).value;
    let temp_min = document.querySelector('#edit-min-' + weatherID).value;
    let temp_max = document.querySelector('#edit-max-' + weatherID).value;
    let precipitation = document.querySelector('#edit-precipitation-' + weatherID).value;
    let precipitation_probability = document.querySelector('#edit-probability-' + weatherID).value;
    let wind_speed = document.querySelector('#edit-wind-' + weatherID).value;
    let wind_direction = document.querySelector('#edit-direction-' + weatherID).value;
    let humidity = document.querySelector('#edit-humidity-' + weatherID).value;
    let pressure = document.querySelector('#edit-pressure-' + weatherID).value;
    let uv_index = document.querySelector('#edit-uv-' + weatherID).value;

    if (!date || !location || !weather_type ||
        temp_min === '' || temp_max === '') {
        showMessage('danger', 'ERROR', 'Please fill in all required fields!');
        return;
    }

    try {
        const response = await fetch(
            `http://localhost:3000/weather/${luid}/${weatherID}`,
            {
                method: 'PATCH',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    luid: luid,
                    date: date,
                    location: location,
                    temp_min: temp_min,
                    temp_max: temp_max,
                    weather_type: weather_type,
                    precipitation: precipitation === '' ? null : precipitation,
                    precipitation_probability: precipitation_probability === '' ? null : precipitation_probability,
                    wind_speed: wind_speed === '' ? null : wind_speed,
                    wind_direction: wind_direction === '' ? null : wind_direction,
                    humidity: humidity === '' ? null : humidity,
                    pressure: pressure === '' ? null : pressure,
                    uv_index: uv_index === '' ? null : uv_index
                })
            }
        );

        const res = await response.json();

        if (!response.ok) {
            showMessage('danger', 'ERROR', res.error);
            return;
        }

        showMessage('success', 'SUCCESS', res.message);

        getWeather();

    } catch (error) {
        console.error('Weather update error:', error);
        showMessage('danger', 'ERROR', 'Could not connect to the server.');
    }
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
    const canvas = document.getElementById('myChart');

    if (!canvas) {
        console.warn('Chart canvas #myChart was not found.');
        return;
    }

    if (typeof Chart === 'undefined') {
        console.error('Chart.js is not loaded.');
        return;
    }

    // korabbi torlese ha van mar letrehozva
    if (weatherChart) {
        weatherChart.destroy();
        weatherChart = null;
    }

    const sortedResults = [...results].sort(
        (a, b) => new Date(a.date) - new Date(b.date)
    );

    const labels = sortedResults.map(
        result => moment(result.date).format('YYYY-MM-DD')
    );

    const minTemps = sortedResults.map(
        result => Number(result.temp_min)
    );

    const maxTemps = sortedResults.map(
        result => Number(result.temp_max)
    );

    weatherChart = new Chart(canvas, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Minimum temperature (°C)',
                    data: minTemps,
                    borderWidth: 2,
                    tension: 0.25
                },
                {
                    label: 'Maximum temperature (°C)',
                    data: maxTemps,
                    borderWidth: 2,
                    tension: 0.25
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false
            },
            scales: {
                y: {
                    beginAtZero: false,
                    title: {
                        display: true,
                        text: 'Temperature (°C)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Date'
                    }
                }
            }
        }
    });
}




function initCalendar(results) {
    const calendarElement = document.getElementById('calendar');

    if (!calendarElement) {
        console.warn('Calendar element #calendar was not found.');
        return;
    }

    if (typeof FullCalendar === 'undefined') {
        console.error('FullCalendar is not loaded.');
        return;
    }

    const events = results.map(result => ({
        title: `Min: ${result.temp_min}°C | Max: ${result.temp_max}°C`,
        start: result.date,
        allDay: true
    }));

    if (
        weatherCalendar &&
        weatherCalendarElement !== calendarElement
    ) {
        weatherCalendar.destroy();
        weatherCalendar = null;
        weatherCalendarElement = null;
    }


    if (weatherCalendar) {
        weatherCalendar.removeAllEvents();
        weatherCalendar.addEventSource(events);
        weatherCalendar.updateSize();
        return;
    }

    weatherCalendar = new FullCalendar.Calendar(calendarElement, {
        initialView: 'dayGridMonth',
        height: 'auto',
        events: events,
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,listWeek'
        }
    });

    weatherCalendarElement = calendarElement;
    weatherCalendar.render();
}
