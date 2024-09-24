from flask import Flask, request, jsonify
import os
from PyPDF2 import PdfReader
from docx import Document
import google.generativeai as genai
from werkzeug.utils import secure_filename
from dotenv import load_dotenv
import sys
from flask_cors import CORS 
sys.stdout.reconfigure(encoding='utf-8')

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)


# Set your Google Gemini API key
api_key = os.getenv('gemini_api_key')

# Configure the Generative AI (Gemini) API
genai.configure(api_key=api_key)

# Directory where files will be temporarily stored
UPLOAD_FOLDER = os.path.join(os.getcwd(), 'uploads')  # Use current working directory and uploads folder
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)  # Create the folder if it doesn't exist

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
    full_text = []
    for para in doc.paragraphs:
        full_text.append(para.text)
    return '\n'.join(full_text)

# Function to summarize text using Google's Gemini model (PaLM API)
def summarize_text(text):
    try:
        # Instantiate the GenerativeModel
        model = genai.GenerativeModel('gemini-1.5-flash')
        input_prompt = f"Summarize the following medical report:\n\n{text}.\n\nThe summary should highlight key medical conditions, medical history, follow-ups, and future health threats make each heading and bullet points in new line only the paragraph should be continuous. If it is not a medical report do not generate the summary rather tell the user that he uploaded wrong file."
        # Generate content using the model
        response = model.generate_content(
            [input_prompt]
        )
        # Access the result
        # Extract the text from the response
        if response and response.text:
            return response.text 
        return "No summary available"

    except Exception as e:
        print(f"Error during summarization: {e}")
        return "Error in summarizing the text."


@app.route('/analyze', methods=['POST'])
def analyze_file():
    if 'file' not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files['file']
    file_extension = os.path.splitext(file.filename)[1].lower()

    # Save the uploaded file to the UPLOAD_FOLDER
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
    
    # Optionally remove the uploaded file after processing
    if os.path.exists(file_path):
        os.remove(file_path)

    # Return the summary as a JSON response
    try:
        return jsonify({'summary': summary})
    except Exception as e:
        return jsonify({'summary': 'Error analyzing the file.'}), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)

