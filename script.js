//function to trigger file selection
var upload = document.getElementById('upload');
upload.addEventListener('click', function(event) {
  event.preventDefault(); // Prevent form submission
  upload.style.transform = "scale(0.95)";
  setTimeout(() => {
    upload.style.transform = "scale(1)";
  }, 100);
  document.getElementById('report').click(); 
});

//function to select file
document.getElementById('report').addEventListener('change', function(event) {
    const form = document.getElementById('uploadForm');
    form.addEventListener('submit', function(event) {
            event.preventDefault(); // Prevent the form from reloading the page
    // Trigger file upload logic
    });
    const file = event.target.files[0];
    if(!file){
        alert("Please select a file!") ;
    }
    else {
        loading(file);
    }
});

const apiUrl = 'http://127.0.0.1:5000/analyze'; 

//function to fetch summary
async function fetchSummary(file) {
    const formData = new FormData();
    formData.append('file', file);
    
    try {
        alert("file sent");

        let response = axios.post(apiUrl, formData) ;

        alert("response received");
        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers);

        // Log the raw response text to see if it's correct
        const responseText = await response.text();
        console.log('Raw response:', responseText);

        // If the response is JSON, parse it
        const data = JSON.parse(responseText);  // Use JSON.parse to ensure it's valid JSON
        console.log('Parsed response data:', data);

        if (!data || !data.summary) {
            throw new Error('Invalid response structure');
        }

        return data.summary;
    } 
    catch (error) {
        console.error('Fetch error:', error);
        return "Error analyzing the file.";
    }
}
// Function to show loader and display summary
async function loading(file) {
    const loader = document.getElementById('container');
    const content = document.getElementById('summary');
    const operation = document.getElementById('operation');

    loader.style.display = 'flex';

    try {
        let summary = await fetchSummary(file); // Await the fetchSummary promise
        if (summary === "Error analyzing the file.") {
            loader.style.display = "none";
            content.style.animation = "scale_up 0.4s ease forwards";
            operation.style.animation = "scale_up 0.4s ease forwards";
            content.innerHTML = `<h1>Error</h1><br><p></p>`;
        } 
        else {
            loader.style.display = "none"; // Hide the loader once the summary is ready
            content.style.animation = "scale_up 0.4s ease forwards";
            operation.style.animation = "scale_up 0.4s ease forwards";
            content.innerHTML = `<h1>Diagnosis</h1><br><p></p>`;
        }
        createTypingEffect(summary);

    } catch (error) {
        loader.style.display = "none";
        content.innerHTML = `<h1>Error</h1><br><p></p>`;
        createTypingEffect("An unexpected error occurred.") ;
        console.error(error);
    }
}

//function to create typing effect while displaying summary
let typed; // Global variable for Typed.js instance
function createTypingEffect(summaryText) {
    if (typeof typed !== 'undefined' && typed) {
        typed.destroy(); // Destroy previous instance to avoid overlap
    }

    typed = new Typed(document.getElementById('summary').getElementsByTagName('p')[0], {
        strings: [summaryText],
        typeSpeed: 12,
        loop: false
    });
}

//function to download the summary
var download = document.getElementById('download');
download.addEventListener('click', function() {
    var summaryDiv = document.getElementById('summary');
    var heading = summaryDiv.querySelector('h1').textContent;
    var paragraph = summaryDiv.querySelector('p').textContent;

    if (heading === "" && paragraph === "Error analyzing the file.") {
        alert("Nothing to download");
        return;
    }

    var fullText = heading + "\n\n" + paragraph;
    const { jsPDF } = window.jspdf;
    var doc = new jsPDF();
    doc.text(fullText, 10, 10);
    doc.save('summary.pdf');
});

//function to close the summary screen
var close = document.getElementById('close');
close.addEventListener('click', function() {
    document.getElementById('summary').style.animation = "scale_down .4s ease forwards";
    document.getElementById('operation').style.animation = "scale_down .4s ease forwards";
});
