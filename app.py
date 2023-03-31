import json
import openai
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app, supports_credentials=True)

openai.api_key = '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'
model_id = 'gpt-3.5-turbo'

def ChatGPT_conversation(conversation):
    response = openai.ChatCompletion.create(
        model=model_id,
        messages=conversation
    )
    conversation.append({'role': response.choices[0].message.role, 'content': response.choices[0].message.content})
    return conversation

def read_resume(file_path):
    with open(file_path, 'r') as file:
        resume = file.read()
    return resume

def read_job_info(file_path):
    with open(file_path, 'r') as file:
        job_info = json.load(file)
    return job_info

def generate_cover_letter(resume, job_info):
    conversation = [{'role': 'system', 'content': 'You are a cover letter generator.'}]
    
    conversation.append({'role': 'user', 'content': f"Generate a cover letter using the following resume:\n\n{resume}\n\nAnd the following job information:\n\n{json.dumps(job_info, indent=2)} make sure to use the information in the resume"})
    conversation = ChatGPT_conversation(conversation)
    cover_letter = conversation[-1]['content'].strip()

    return cover_letter

def save_cover_letter(cover_letter, filename):
    with open(filename, 'w') as file:
        file.write(cover_letter)

@app.route('/generate_cover_letter', methods=['POST'])
def api_generate_cover_letter():
    data = request.get_json()

    if 'resume' not in data or 'job_info' not in data:
        return jsonify({'error': 'Missing required data'}), 400

    resume = data['resume']
    job_info = data['job_info']

    if 'jobTitle' not in job_info or 'companyTitle' not in job_info or 'jobDescription' not in job_info:
        return jsonify({'error': 'Missing required job information'}), 400

    job_data = {
        "jobTitle": job_info['jobTitle'],
        "companyName": job_info['companyTitle'],
        "jobDescription": job_info['jobDescription']
    }

    cover_letter = generate_cover_letter(resume, job_data)
    return jsonify({'cover_letter': cover_letter})

@app.after_request
def after_request(response):
    header = response.headers
    header['Access-Control-Allow-Origin'] = '*'
    header['Access-Control-Allow-Headers'] = 'Content-Type,Authorization'
    header['Access-Control-Allow-Methods'] = 'GET,POST,OPTIONS'
    header['Access-Control-Allow-Credentials'] = 'true'
    return response

if __name__ == '__main__':
    app.run(debug=True)
