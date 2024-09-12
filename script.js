
document.onreadystatechange = function () {
    if(document.readyState !== "complete")
    {
        //document.querySelector("body").style.visibility = "hidden" ;
        document.getElementById("loaderContainer").style.visibility = "visible" ;
    }
    else
    {
        setTimeout(()=> {
            document.getElementById('loader').style.display = "none" ;
            //document.querySelector('body').style.visibility = "visible" ;
            }, 5000) ;
    }
}

function loading() {
    const loader = document.querySelector('#container');
    const content = document.querySelector('#summary');
    loader.style.display = 'flex' ;
    fetchSummary().then(() => {
        loader.style.display = 'none';
        summary.style.display = 'block';
    });
};

function fetchSummary() {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve();
        }, 2000);
    });
}

var close = document.getElementById('close');
close.addEventListener('click', function() {
    document.getElementById('summary').style.display = 'none';
    document.getElementById('operation').style.display = 'none';
});

var upload = document.getElementById('upload') ;
upload.addEventListener('click', function(){
    document.getElementById('report').click() ;
}) ;

document.getElementById('report').addEventListener('change', function(event) {
    const fileInput = document.getElementById('report');
    const file = fileInput.files[0];

    if (!file) {
        alert('Please select a file!');
        return;
    }

    const formData = new FormData();
    formData.append('file', file);
    loading() ;
    fetch('http://127.0.0.1:5000/analyze', {  
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Error analyzing the file');
        }
        return response.json(); 
    })
    .then(data => {
        document.getElementById('summary').style.display = 'block' ;
        document.getElementById('operation').style.display = 'flex' ;
        document.getElementById('summary').innerHTML = `<h1>Diagnosis</h1><p>${data.summary}</p>`;
    })
    .catch(error => {
        document.getElementById('summary').style.display = 'block' ;
        document.getElementById('operation').style.display = 'block' ;
        document.getElementById('summary').innerHTML = '<p>Error analyzing the file.</p>';
    });
});