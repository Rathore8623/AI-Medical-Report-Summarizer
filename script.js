const apiUrl = 'http://127.0.0.1:5000/analyze'; 

window.addEventListener('beforeunload', (event) => {
    // Save any data you want to persist before the page reloads
    localStorage.setItem('isRequestPending', 'true');
    // Optionally show a warning dialog to prevent accidental page reloads
    event.returnValue = "Are you sure you want to reload the page?";
});

// Check if the request was pending after a page refresh
if (localStorage.getItem('isRequestPending') === 'true') {
    // You can now try to reinitialize the request, or handle data loss gracefully.
    localStorage.removeItem('isRequestPending');  // Clear after handling
}

// Function to trigger file selection
var upload = document.getElementById('upload');
upload.addEventListener('click', function() {
    upload.style.transform = "scale(0.95)";
    setTimeout(() => {
        upload.style.transform = "scale(1)";
    }, 100);
    document.getElementById('report').click(); 
});

document.getElementById('uploadForm').addEventListener('submit', function(event){
    event.preventDefault() ;
});
// Function to select file
document.getElementById('report').addEventListener('change', async function(event) {
    let file = event.target.files[0];
    if (!file) {
        alert("Please select a file!");
    } 
    else {
        let data = "" ;
        const loader = document.getElementById('container');
        const content = document.getElementById('summary');
        const operation = document.getElementById('operation');
        const window = document.querySelector('.window');

        loader.style.display = 'flex';

        const formData = new FormData();
        formData.append('file', file);
        try {
            const response = await axios.post(apiUrl, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
                //timeout: 10000 // Timeout after 10 seconds
            });
            localStorage.setItem('responseData', JSON.stringify(response.data));
            if (response.status === 200) { // Checking status code instead of .ok
                data = await response.data.summary; // Get the summary field from JSON response
            }
            else {
                data = "Error analyzing the file." ;
            }
        }
        catch (error) {
            console.error('Fetch error:', error);
        }
        loader.style.display = 'none' ;
        console.log(data) ;
        window.style.animation = "scale_up 0.4s ease forwards";
        content.style.animation = "scale_up 0.4s ease forwards";
        operation.style.animation = "scale_up 0.4s ease forwards";
        if (data === "Error analyzing the file.") {
            content.innerHTML = `<h1>Error!</h1><br><p></p>`;
            content.getElementsByTagName('h1').style.color = 'red' ;
            createTypingEffect(data);
        } 
        else {
            let summary = splitString(data) ;
            content.innerHTML = `<h1>Diagnosis</h1><br><p></p>`;
            createTypingEffect(summary);
        }
    }
});

function splitString(input) {
    // Use a regular expression to split by #, ##, *, **
    const splitArray = input.split(/[#*]+/);
  
    // Filter out empty strings and add \n at the end of each sentence
    const resultString = splitArray
                        .filter(item => item.trim() !== '')
                        .map(sentence => sentence.trim() + '\n')
                        .join('');
  
    return resultString;
}

//function to create typing effect while displaying summary
let typed; // Global variable for Typed.js instance
function createTypingEffect(summaryText) {
    if (typeof typed !== 'undefined' && typed) {
        typed.destroy(); // Destroy previous instance to avoid overlap
    }

    if (typeof summaryText !== 'string' || summaryText.trim() === '') {
        console.error('Invalid summary text provided.');
        summaryText = '';  // Default to empty string if invalid
    }

    // Replace \n with <br> for line breaks in the text
    const formattedText = summaryText.replace(/\n/g, '<br>');

    // Check if the <p> element inside #summary exists
    const summaryElement = document.getElementById('summary');
    const pElement = summaryElement ? summaryElement.getElementsByTagName('p')[0] : null;

    if (!pElement) {
        console.error('The <p> element inside #summary was not found.');
        return;
    }

    // Destroy the previous instance if it exists to avoid overlap
    if (typed) {
        typed.destroy();
    }

    // Initialize a new Typed.js instance with formatted text
    typed = new Typed(pElement, {
        strings: [formattedText],
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
    document.querySelector('.window').style.animation = "scale_down .4s ease forwards";
});
