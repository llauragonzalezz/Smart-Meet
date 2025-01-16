from flask import Flask, render_template, request, jsonify
import configparser
import openai
from flask_cors import CORS, cross_origin
from pydantic import BaseModel
import os


# ----------------- CONFIG -----------------
config = configparser.ConfigParser()
config.read('../settings.ini')

WEB_HOST = os.environ.get('WEB_HOST', config['WEB']['HOST'])
WEB_HOST = os.environ.get('WEB_HOST', config['WEB']['HOST'])
WEB_PORT = os.environ.get('WEB_PORT', config['WEB']['PORT'])
DEBUG = os.environ.get('DEBUG', config['WEB'].getboolean('DEBUG'))
API_HOST = os.environ.get('API_HOST', config['API']['HOST'])
API_PORT = os.environ.get('API_PORT', config['API']['PORT'])
OPENAI_MODEL = os.environ.get('OPENAI_MODEL', config['DEFAULT']['OPENAI_MODEL'])
openai.api_key = os.environ.get('OPENAI_API_KEY', config['DEFAULT']['OPENAI_API_KEY'])


app = Flask(__name__)
# Habilitar CORS para todas las rutas
CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'



# ----------------- RESPONSE FORMAT (Structured Outputs OpenAI) -----------------
class SummaryFormat(BaseModel):
    text: str

class IdeaFormat(BaseModel):
    name: str
    text: str
class IdeasFormat(BaseModel):
    ideas: list[IdeaFormat]

class KeywordFormat(BaseModel):
    text: str
class KeywordsFormat(BaseModel):
    keywords: list[KeywordFormat]

class GuideFormat(BaseModel):
    text: str
class GuidesFormat(BaseModel):
    guides: list[GuideFormat]

class KeywordStatsFormat(BaseModel):
    text: str
    apariciones: int
    importancia: str
    positividad: str
    neutralidad: str
    negatividad: str
class KeywordsStatsFormat(BaseModel):
    keywords_stats: list[KeywordStatsFormat]

language_map = {
            "es": "español",
            "en": "inglés",
            "it": "italiano"
        }

# ----------------- ENDPOINTS -----------------
@app.route('/healtcheck', methods=['GET'])
def healtcheck():
    return jsonify({"status": "ok"})

# Endpoint: Generación de resúmenes
@cross_origin()
@app.route('/generate-summary', methods=['POST'])
def generate_summary():
    try:
        # Obtener la transcripción del cuerpo de la solicitud
        data = request.get_json()
        transcript = data.get('transcript')
        language = data.get('language', 'es')  # Default to 'es' if not provided
        print(f"{language=}")
        readable_language = language_map.get(language, "español")

        if not transcript:
            return jsonify({"error": "No transcript provided"}), 400

        # Usar GPT-4 para generar un resumen
        completion = openai.beta.chat.completions.parse(
            model=OPENAI_MODEL,
            messages=[
                {"role": "system", "content": "Eres un asistente virtual que ayuda a generar resúmenes claros y concisos de reuniones."},
                {"role": "user", "content": f"Genera un resumen en {readable_language} para esta transcripción: {transcript}"}
            ],
            response_format=SummaryFormat,
            max_tokens=1000,
            temperature=0.7,
            top_p=None,
            presence_penalty=1
        )

        # Extraer y devolver la respuesta
        response_message = completion.choices[0].message.content
        return jsonify({"summary": response_message})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Endpoint: Generación de ideas
@cross_origin()
@app.route('/generate-ideas', methods=['POST'])
def generate_ideas():
    try:
        # Obtener las keywords del cuerpo de la solicitud
        data = request.get_json()
        keywords = data.get('keywords')
        language = data.get('language', 'es')  # Default to 'es' if not provided
        print(f"Keywords: {keywords}")
        print(f"{language=}")
        readable_language = language_map.get(language, "español")

        if not keywords:
            return jsonify({"error": "No transcript provided"}), 400

        # Usar GPT-4 para generar palabras clave
        completion = openai.beta.chat.completions.parse(
            model=OPENAI_MODEL,
            messages=[
                {"role": "system", "content": "Eres un asistente que ayuda a crear ideas en reuniones."},
                {"role": "user", "content": f"Extrae un número de ideas entre 1 y 3 en {readable_language} dadas las siguientes palabras clave: {keywords}"}
            ], 
            response_format=IdeasFormat,
            max_tokens=1000,
            temperature=0.7,
            top_p=None,
            presence_penalty=1
        )

        # Extraer y devolver la respuesta
        response_message = completion.choices[0].message.content
        return jsonify({"ideas": response_message})

    except Exception as e:
            return jsonify({"error": str(e)}), 500


# Endpoint: Generación de palabras clave
@cross_origin()
@app.route('/generate-keywords', methods=['POST'])
def generate_keywords():
    try:
        # Obtener la transcripción del cuerpo de la solicitud
        data = request.get_json()
        transcript = data.get('transcript')
        language = data.get('language', 'es')  # Default to 'es' if not provided
        print(f"{language=}")
        readable_language = language_map.get(language, "español")

        if not transcript:
            return jsonify({"error": "No transcript provided"}), 400

        # Usar GPT-4 para generar palabras clave
        completion = openai.beta.chat.completions.parse(
            model=OPENAI_MODEL,
            messages=[
                {"role": "system", "content": "Eres un asistente que ayuda a identificar palabras clave importantes en reuniones."},
                {"role": "user", "content": f"Extrae palabras clave en {readable_language} de esta transcripción: {transcript}"}
            ],
            response_format=KeywordsFormat,
            max_tokens=1000,
            temperature=0.7,
            top_p=None,
            presence_penalty=1
        )

        # Extraer y devolver la respuesta
        response_message = completion.choices[0].message.content
        return jsonify({"keywords": response_message})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@cross_origin()
@app.route('/generate-keywords-stats', methods=['POST'])
def generate_keyword_stats():
    try:
        # Obtener datos del cuerpo de la solicitud
        data = request.get_json()
        print(data)
        transcript = data.get('transcript')
        keywords = data.get('keywords', [])
        language = data.get('language', 'es')  # Idioma predeterminado: español

        if not transcript or not keywords:
            return jsonify({"error": "Transcript or keywords not provided"}), 400

        # Selección del idioma legible para el prompt
        readable_language = language_map.get(language, "español")

        # Crear el prompt para GPT
        prompt = f"""
        Analiza la siguiente transcripción en {readable_language} y calcula estadísticas para las siguientes palabras clave.
        Para cada palabra clave, indica:
        - El número total de apariciones.
        - El porcentaje de importancia de esa palabra con respecto a la transcripción.
        - El porcentaje de positividad asociado a las frases donde aparece.
        - El porcentaje de neutralidad asociado a las frases donde aparece.
        - El porcentaje de negatividad asociado a las frases donde aparece.

        Transcripción:
        {transcript}

        Palabras clave: {keywords}
        """

        # Llamada a GPT
        completion = openai.beta.chat.completions.parse(
            model=OPENAI_MODEL,
            messages=[
                {"role": "system", "content": "Eres un asistente experto en análisis de texto."},
                {"role": "user", "content": prompt}
            ], response_format=KeywordsStatsFormat,
            max_tokens=1000,
            temperature=0.7,
            top_p=None,
            presence_penalty=1
        )

        # Extraer y devolver la respuesta de GPT
        response_message = completion.choices[0].message.content

        return jsonify({"keyword_stats": response_message})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True, host=API_HOST, port=API_PORT)

    app.config['SECRET_KEY'] = config['DEFAULT']['SECRET_KEY']