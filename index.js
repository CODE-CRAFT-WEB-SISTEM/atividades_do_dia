// Mapeamento dos nomes dos meses
const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
        .then(registration => {
            console.log('ServiceWorker registered: ', registration);
        })
        .catch(registrationError => {
            console.log('ServiceWorker registration failed: ', registrationError);
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const obfuscateTheme = document.querySelector('.obfuscateTheme');
    const form = document.getElementById('activityForm');
    const newExecutantButton = document.querySelector('.newExecutant');
    const dynamicExecutants = document.querySelector('.boxDinamicAddExecutants');
    const livePreview = document.getElementById('livePreview');
    const saveButton = document.getElementById('saveButton');
    const startLivePreviewButton = document.getElementById('startLivePreviewButton');

    // Load saved form data
    loadFormData();

    newExecutantButton.addEventListener('click', addExecutant);
    form.addEventListener('input', updateLivePreview);
    saveButton.addEventListener('click', saveAndShare);

    function addExecutant() {
        const executantDiv = document.createElement('div');
        executantDiv.classList.add('executantEntry');

        const newInput = document.createElement('input');
        newInput.classList.add('executant');
        newInput.placeholder = `Nome:`;

        const deleteButton = document.createElement('button');
        deleteButton.type = 'button';
        deleteButton.textContent = 'Excluir';
        deleteButton.classList.add('deleteButton');
        deleteButton.addEventListener('click', () => {
            dynamicExecutants.removeChild(executantDiv);
            updateLivePreview();
        });

        executantDiv.appendChild(newInput);
        executantDiv.appendChild(deleteButton);
        dynamicExecutants.appendChild(executantDiv);
    }

    function updateLivePreview() {
        const executants = Array.from(document.querySelectorAll('.executant'))
            .map(input => input.value)
            .filter(value => value.trim() !== '')
            .join(', ');

        const dateInput = document.getElementById('activityDate').value;
        const date = new Date(dateInput);
        const day = String(date.getDate()).padStart(2, '0');
        const month = monthNames[date.getMonth()];
        const year = date.getFullYear();
        const formattedDate = `${day} ${month} ${year}`;

        const startTime = document.getElementById('startTime').value;
        const endTime = document.getElementById('endTime').value;
        const description = document.getElementById('activityDescription').value;

        livePreview.innerHTML = `
            <button class="closeBtn" id="closeBtn">X</button>
            <h2>Pré visualização:</h2>
            <br>
            <br>
            <p><strong>Relatório de ${formattedDate}:</strong></p>
            <br>
            <p><strong>Executantes:</strong>
            <br>
            ${executants.toUpperCase()}</p>
            <br>
            <p><strong>Horários da atividade:</strong>
            <br>
            De ${startTime} às ${endTime}</p>
            <br>
            <p><strong>Descrição:</strong> <br>${description}</p>
        `;

        const closeBtn = document.getElementById('closeBtn');

        startLivePreviewButton.addEventListener('click', () => {
            obfuscateTheme.style.opacity = "10%";
            livePreview.classList.add('sartLivePreviewClass');
        });

        closeBtn.addEventListener('click', () => {
            obfuscateTheme.style.opacity = "100%";
            livePreview.classList.remove('sartLivePreviewClass');
        });
    }

    function saveFormData() {
        const formData = {
            executants: Array.from(document.querySelectorAll('.executant')).map(input => input.value),
            date: document.getElementById('activityDate').value,
            startTime: document.getElementById('startTime').value,
            endTime: document.getElementById('endTime').value,
            description: document.getElementById('activityDescription').value
        };
        localStorage.setItem('formData', JSON.stringify(formData));
    }

    function loadFormData() {
        const savedData = localStorage.getItem('formData');
        if (savedData) {
            const formData = JSON.parse(savedData);
            document.getElementById('activityDate').value = formData.date;
            document.getElementById('startTime').value = formData.startTime;
            document.getElementById('endTime').value = formData.endTime;
            document.getElementById('activityDescription').value = formData.description;

            formData.executants.forEach((executant, index) => {
                if (index < 2) {
                    document.querySelectorAll('.executant')[index].value = executant;
                } else {
                    addExecutant();
                    dynamicExecutants.lastChild.querySelector('.executant').value = executant;
                }
            });
            updateLivePreview();
        }
    }

    function saveAndShare() {
        const executants = Array.from(document.querySelectorAll('.executant'))
            .map(input => input.value)
            .filter(value => value.trim() !== '')
            .join(', ');

        const dateInput = document.getElementById('activityDate').value;
        const date = new Date(dateInput);
        const day = String(date.getDate()).padStart(2, '0');
        const month = monthNames[date.getMonth()];
        const year = date.getFullYear();
        const formattedDate = `${day} ${month} ${year}`;

        const startTime = document.getElementById('startTime').value;
        const endTime = document.getElementById('endTime').value;
        const description = document.getElementById('activityDescription').value;

        const message = `
*Relatório de* ${formattedDate}:

*Executantes:*
${executants.toUpperCase()}

*Horários da atividade:*
De ${startTime} às ${endTime}

*Descrição:*
${description}
        `;

        if (navigator.share) {
            navigator.share({
                title: 'Relatório de Atividade',
                text: message,
            })
            .catch(error => console.log('Error sharing:', error));
        } else {
            copyToClipboard(message);
            alert('Relatório copiado para a área de transferência');
        }
    }

    function copyToClipboard(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
    }
});