document.getElementById('submitPropInfo').addEventListener('click', async function () {
    const title = document.getElementById('propTitle').value;
    const type = document.getElementById('propType').value;
    const price = document.getElementById('propPrice').value;
    const propCity = document.getElementById('city').value;

    const propertyData = {
        title,
        type,
        price,
        propCity
    };

    try {
        const response = await fetch('/addProp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(propertyData)
        });

        if (!response.ok) {
            throw new Error('Failed to save property');
        }
        alert('Property saved successfully!');
    } catch (error) {
        alert('Error saving property: ' + error.message);
    }
});


const agentList = document.getElementById('agentList');

async function loadAPI() {
    try {
        const response = await fetch('/api/agents');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const agents = await response.json();

        let html = '';

        html += agents.map((
            { name, rating, languages, priceMin, priceMax, availableHours, availableDays }
        ) => {
            return `
    Agent Name: ${name}<br>
    Rated: ${rating}<br>
    Languages: ${languages.split(', ').map(lan => lan.trim())}<br>
    Price Range : $${priceMin} - $${priceMax}<br>
    Available on: ${availableDays.split(', ').map(day => day.trim())}<br>
    hoursAvailable: ${availableHours}<br>
    `
        }).join('')


        agentList.innerHTML = html;

    } catch (error) {
        console.error('Error fetching API:', error);
        return null;
    }
}

loadAPI();

