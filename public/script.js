document.getElementById('athleteForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const eesnimi = formData.get('eesnimi');
    const perenimi = formData.get('perenimi');

    if (!validateName(eesnimi) || !validateName(perenimi)) {
        alert('Nimed sisaldavad keelatud tähemärke!');
        return; // Stop form submission
    }

    const data = {
        eesnimi: eesnimi,
        perenimi: perenimi,
        sugu: formData.get('sugu'),
        ala: formData.get('ala'),
        vanusegrupp: formData.get('vanusegrupp'),
        meetrid: parseFloat(formData.get('meetrid')).toFixed(2)
    };

    try {
        const response = await fetch('/submit-result', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const contentType = response.headers.get('content-type');
        let result;

        if (contentType && contentType.indexOf('application/json') !== -1) {
            result = await response.json();
        } else {
            result = await response.text();
            console.log('Received text response:', result);
        }

        if (response.ok) {
            alert('Result saved successfully!');
        } else {
            alert(`Error: ${result.error || result}`);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred, please try again.');
    }
});

function validateName(name) {
    const forbiddenChars = /[:;?\=\(\)\[\]{}<>'"/\\!@#$%^&*_+`|~0-9]/;
    return name && !forbiddenChars.test(name);
}
