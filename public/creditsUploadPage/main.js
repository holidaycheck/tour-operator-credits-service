function showLogo(tourOperatorLogoElement) {
    var url = window.location.href;
    var tourOperatorId = url.slice(
        url.search('/credits/') + '/credits/'.length,
        url.search('/upload')
    );
    tourOperatorLogoElement.src =
        'https://media.holidaycheck.com/data/common/organizerlogo/by-uuid/' +
        tourOperatorId +
        '/240x100';
}

function updateFileName(inputFileElement, fileNameElement, resultElement) {
    resultElement.textContent = '';
    if (inputFileElement.files[0]) {
        fileNameElement.textContent = inputFileElement.files[0].name;
    } else {
        fileNameElement.textContent = '';
    }
}

function findPostUrl() {
    var url = window.location.href;
    var endOfRequiredUrl = url.search('/upload');
    return url.slice(0, endOfRequiredUrl);
}

function processUploadResult(
    inputFileElement,
    fileNameElement,
    resultElement,
    request
) {
    if (request.readyState === XMLHttpRequest.DONE) {
        if (request.status === 201) {
            resultElement.textContent =
                'Erfolg: Datei wurde hochgeladen und verarbeitet.';
            inputFileElement.value = '';
            fileNameElement.textContent = '';
        } else {
            resultElement.textContent =
                'Fehler: ' + request.status + ': ' + request.responseText;
        }
    }
}

function uploadFile(inputFileElement, fileNameElement, resultElement) {
    if (inputFileElement.files[0]) {
        var request = new XMLHttpRequest();
        var postUrl = findPostUrl();
        request.open('POST', postUrl);
        request.onreadystatechange = function () {
            processUploadResult(
                inputFileElement,
                fileNameElement,
                resultElement,
                request
            );
        };
        var blob = new Blob([inputFileElement.files[0]], { type: 'text/csv' });
        request.send(blob);
    } else {
        resultElement.textContent =
            'Fehler: Bitte zuerst eine Datei auswählen.';
    }
}

window.onload = function () {
    var tourOperatorLogoElement = document.querySelector('#tourOperatorLogo');
    var inputFileElement = document.querySelector('#inputFile');
    var fileNameElement = document.querySelector('#fileName');
    var uploadElement = document.querySelector('#upload');
    var resultElement = document.querySelector('#result');

    inputFileElement.onchange = function () {
        updateFileName(inputFileElement, fileNameElement, resultElement);
    };

    uploadElement.onclick = function () {
        uploadFile(inputFileElement, fileNameElement, resultElement);
    };

    showLogo(tourOperatorLogoElement);
};
