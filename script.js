
//Disabling right clicks
/*document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
});
document.addEventListener('keydown', function(e) {
    if (e.key === 'F12' || 
        (e.ctrlKey && e.shiftKey && e.key === 'I') || 
        (e.ctrlKey && e.shiftKey && e.key === 'J') || 
        (e.ctrlKey && e.key === 'U')) {
        e.preventDefault();
    }
});*/

//activates while the site is fetching summary
function loading() {
    const loader = document.querySelector('#container');
    const content = document.querySelector('#summary');
    loader.style.display = 'flex' ;
    fetchSummary().then(() => {
        loader.style.display = 'none';
        summary.style.display = 'block';
    });
};

//function to select the document when upload button is clicked
var upload = document.getElementById('upload') ;
upload.addEventListener('click', function(){
    upload.style.scale = "0.95" ;
    setTimeout(() => {
        upload.style.scale = "1" ;
    }, 100) ;
    document.getElementById('report').click() ;
}) ;

//function to fetch summary
function fetchSummary() {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve();
        }, 2000);
    });
}

//function to display summary in the summary container
document.getElementById('report').addEventListener('change', function(event) {
    const fileInput = document.getElementById('report');
    const summaryDiv = document.getElementById('summary') ;
    const operation = document.getElementById('operation') ;
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
        //summaryDiv.style.display = 'block' ;
        //operation.style.display = 'flex' ;
        summaryDiv.style.animation = "scale_up .4s ease forwards" ;
        operation.style.animation = "scale_up .4s ease forwards" ;
        document.getElementById('summary').innerHTML = `<h1>Diagnosis</h1><p>${data.summary}</p>`;
    })
    .catch(error => {
        //summaryDiv.style.display = 'block' ;
        //operation.style.display = 'flex' ;
        summaryDiv.style.animation = "scale_up .4s ease forwards" ;
        operation.style.animation = "scale_up .4s ease forwards" ;
        document.getElementById('summary').innerHTML = '<h1></h1><p>Error analyzing the file.</p>';
    })
    .finally(() => {
        // Reset the file input so the same file can be selected again
        fileInput.value = ''; 
    });
});

//function to close the summary container
var close = document.getElementById('close');
close.addEventListener('click', function() {
    document.getElementById('summary').style.animation = "scale_down .4s ease forwards";
    document.getElementById('operation').style.animation = "scale_down .4s ease forwards" ;
});

//function to download the content of the summary container
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