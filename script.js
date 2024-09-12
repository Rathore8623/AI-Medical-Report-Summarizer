
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

var download = document.getElementById('download');
download.addEventListener('click', function() {
    // Get the <h1> and <p> elements inside the #summary div
    var summaryDiv = document.getElementById('summary');
    
    // Get the text content from <h1> and <p>
    var heading = summaryDiv.querySelector('h1').textContent;
    var paragraph = summaryDiv.querySelector('p').textContent;

    if(heading === "" && paragraph === "Error analyzing the file."){
        alert("Nothing to download") ;
        return ;
    }
    
    // Combine the text into a single string
    var fullText = heading + "\n\n" + paragraph;
    
    // Initialize jsPDF
    const { jsPDF } = window.jspdf;
    var doc = new jsPDF();
    
    // Add the text content to the PDF
    doc.text(fullText, 10, 10); // Starting coordinates (10, 10)

    // Save the PDF with the name 'summary.pdf'
    doc.save('summary.pdf');
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
        document.getElementById('summary').innerHTML = '<h1></h1><p>Error analyzing the file.</p>';
    });
});