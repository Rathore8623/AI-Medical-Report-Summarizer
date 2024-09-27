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

// Function to select file and get the summary ;
let summarySaver ;
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

        const heading = window.children[0] ;

        const formData = new FormData();
        formData.append('file', file);
        try {
            const response = await axios.post(apiUrl, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });
            localStorage.setItem('responseData', JSON.stringify(response.data));
            if (response.status === 200) { 
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
        window.style.animation = "scale_up 0.4s ease forwards";
        content.style.animation = "scale_up 0.4s ease forwards";
        operation.style.animation = "scale_up 0.4s ease forwards";

        if (data === "Error analyzing the file.") {
            heading.innerHTML = `Error!`;
            heading.style.color = 'red' ;
            createTypingEffect(data);
        } 
        else {
            let summary = splitString(data) ;
            summarySaver = summary ;
            heading.innerText = "Diagnosis" ;
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
let typed;
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
    const pElement = document.getElementById('summary') ;

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
    var summaryDiv = document.querySelector('.window');
    var heading = summaryDiv.querySelector('h1').textContent;
    var paragraph = document.querySelector('#summary').textContent;

    if (heading === "" && paragraph === "Error analyzing the file.") {
        alert("Nothing to download");
        return;
    }
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const pageHeight = doc.internal.pageSize.height;
    const margin = 10;
    const lineHeight = 10;  // Adjust as needed for the text size
    let y = margin;

    const splitText = doc.splitTextToSize(summarySaver, 180);  // Split the text to fit within the page width
    for (let i = 0; i < splitText.length; i++) {
      if (y + lineHeight > pageHeight - margin) {  // Check if text exceeds the page height
        doc.addPage();  // Add a new page
        y = margin;  // Reset the y-coordinate to the top for the new page
      }
      doc.text(splitText[i], margin, y);
      y += lineHeight;  // Move down for the next line
    }
    doc.save('summary.pdf');
});

//function to close the summary screen
var close = document.getElementById('close');
close.addEventListener('click', function() {
    document.getElementById('summary').style.animation = "scale_down .4s ease forwards";
    document.getElementById('operation').style.animation = "scale_down .4s ease forwards";
    document.querySelector('.window').style.animation = "scale_down .4s ease forwards";
});
