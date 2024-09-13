from flask import Flask, request, jsonify
import openai
import os
from PyPDF2 import PdfReader
from docx import Document
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)  # Allow CORS for requests from other ports like 5500 (frontend)

# Set your OpenAI API key
openai.api_key = 'OpenAi_api_key'

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

# Function to summarize text using OpenAI's GPT model
def summarize_text(text):
    response = openai.Completion.create(
        engine="gpt-3.5-turbo",
        prompt=f"Summarize the following medical report:\n\n{text}\n\nThe summary should highlight key medical conditions, medical history, follow-ups, and future health threats.",
        max_tokens=300,
        n=1,
        stop=None,
        temperature=0.5
    )
    return response.choices[0].text.strip()

@app.route('/analyze', methods=['POST'])
def analyze_file():
    if 'file' not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files['file']
    file_extension = os.path.splitext(file.filename)[1].lower()

    if file_extension == '.pdf':
        file.save('uploaded_report.pdf')
        text = extract_text_from_pdf('uploaded_report.pdf')
    elif file_extension in ['.doc', '.docx']:
        file.save('uploaded_report.docx')
        text = extract_text_from_word('uploaded_report.docx')
    elif file_extension == '.txt':
        text = file.read().decode('utf-8')
    else:
        return jsonify({"error": "Unsupported file format"}), 400

    summary = summarize_text(text)
    
    # Return the summary as a JSON response
    return jsonify({"summary": summary})

if __name__ == '__main__':
    app.run(debug=True)