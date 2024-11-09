from flask import Flask, request, jsonify, render_template, send_from_directory
import os
from PyPDF2 import PdfReader
from docx import Document
import google.generativeai as genai
from werkzeug.utils import secure_filename
from dotenv import load_dotenv
import sys
from flask_cors import CORS

# Configure output encoding for UTF-8
sys.stdout.reconfigure(encoding='utf-8')

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Set your Google Gemini API key
api_key = os.getenv('gemini_api_key')
genai.configure(api_key=api_key)

# Directory where files will be temporarily stored (use /tmp in serverless environments)
UPLOAD_FOLDER = '/tmp/uploads'

# Ensure the /tmp/uploads directory exists
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

# Function to extract text from PDF files
def extract_text_from_pdf(pdf_path):
    reader = PdfReader(pdf_path)
    text = ''
    for page in reader.pages:
        text += page.extract_text()
    return text

# Function to extract text from Word files
def extract_text_from_word(docx_path):
    doc = Document(docx_path)
    full_text = [para.text for para in doc.paragraphs]
    return '\n'.join(full_text)

# Function to summarize text using Google's Gemini model
def summarize_text(text):
    try:
        if not text.strip():
            return "No text found to summarize."
        model = genai.GenerativeModel('gemini-1.5-flash')
        input_prompt = (
            f"Summarize the following medical report:\n\n{text}.\n\n"
            "The summary should highlight patient's details, key medical conditions, "
            "operations, medications, follow-ups, and future health threats in bullet points. "
            "Keep the summary brief in about 200 words. If it's not a medical report, "
            "inform the user that the file is incorrect."
        )
        response = model.generate_content([input_prompt])

        # Check if the response contains text
        if response and response.text:
            return response.text 
        return "No summary available."
    
    except Exception as e:
        return "Error in summarizing the text."

# Route for file analysis
@app.route('/analyze', methods=['POST'])
def analyze_file():
    if 'file' not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files['file']
    file_extension = os.path.splitext(file.filename)[1].lower()

    # Save the uploaded file to /tmp/uploads
    filename = secure_filename(file.filename)
    file_path = os.path.join(UPLOAD_FOLDER, filename)
    file.save(file_path)

    # Extract text based on the file extension
    if file_extension == '.pdf':
        text = extract_text_from_pdf(file_path)
    elif file_extension in ['.doc', '.docx']:
        text = extract_text_from_word(file_path)
    elif file_extension == '.txt':
        text = file.read().decode('utf-8')
    else:
        return jsonify({"error": "Unsupported file format"}), 400

    # Summarize the extracted text
    summary = summarize_text(text)
    
    # Remove the uploaded file after processing
    if os.path.exists(file_path):
        os.remove(file_path)

    # Return the summary as a JSON response
        return jsonify({'summary': summary})

# Serve static files in the "static" folder
@app.route('/static/<path:path>')
def send_static(path):
    return send_from_directory('static', path)

# Serve the main HTML template
@app.route('/') 
def index():
    try:
        return render_template('index.html')
    except Exception as e:
        return jsonify({'error': 'Could not load page'}), 500

# Handle favicon requests
@app.route('/favicon.ico')
def favicon():
    return send_from_directory('icons', 'favicon.ico')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
