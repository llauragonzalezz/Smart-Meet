# SmartMeet - Intelligent Meeting Support System

## Project Description
**SmartMeet** is an intelligent system designed to enhance meeting experiences through speech detection, idea generation, and late arrival detection. With advanced features such as real-time transcription, automatic summary generation, and keyword extraction, SmartMeet transforms the way meetings are conducted.

## Authors
- **Lucía Cordero**  
- **Jorge Garcelán**  
- **Laura González**

**Course**: Ambient Intelligence

**Date**: January 2025  

## Technologies Used
- **Python 3.9+**
- **Flask** (Backend and API)
- **Transformers.js and Whisper** (Speech recognition and real-time transcription)
- **OpenAI API** (Summary, idea, and keyword generation)
- **YOLOv10 and COCO-SSD** (People detection in meetings)
- **Jinja2 and HTML/CSS/JS** (User interface)

## Key Features
### 🔹 Real-Time Transcription and Visualization
- Uses **Whisper with Transformers.js** for live meeting transcriptions.
- Updates transcriptions every **3 seconds** to balance speed and accuracy.
- Optimized formatting with speaker identification.
- Supports **Spanish, English, and Italian**.

### 🔹 Summary, Keyword, and Idea Generation
- **Automatic summaries** generated with OpenAI API.
- **Keyword extraction** based on natural language processing.
- **Idea generation** based on detected discussion topics.
- **Interactive idea visualization** through movable cards organized by priority.

### 🔹 New Participant Detection
- **YOLOv10** implementation for precise participant detection.
- **COCO-SSD** as an alternative for faster processing.
- **Grace period system** to alert about late arrivals.

### 🔹 Additional Features
- **Adaptive interface:** Light/dark mode and font size adjustments.
- **Timeline:** Chronological log of generated ideas.
- **Final report:** Automatic generation of a complete meeting summary.
- **Language selection:** Multilingual support for interface and transcription.

# Project Setup

## Creating a Virtual Environment

1. Navigate to your project directory:
    ```sh
    cd /Users/jorgegarcelan/Desktop/UNI/5-MASTER IAA/SC2/AMBIENTAL/IAA-Aml/PROJECT
    ```

2. Create a virtual environment:
    ```sh
    python3 -m venv .venv
    ```

3. Activate the virtual environment:
    - On Windows:
        ```sh
        .venv\Scripts\activate
        ```
    - On macOS and Linux:
        ```sh
        source .venv/bin/activate
        ```

4. Install the required packages:
    ```sh
    pip install -r requirements.txt
    ```

## Project Components

### Web Component

The web component is a Flask application that serves the frontend of the project. It is configured using the `config.ini` file.

- **File:** `web/web.py`
- **Configuration:**
    - `WEB_HOST`: Host for the web server
    - `WEB_PORT`: Port for the web server
    - `DEBUG`: Debug mode for the web server
    - `SECRET_KEY`: Secret key for the Flask application

To run the web server:
```sh
python web/web.py
```

### API Component

The API component is another Flask application that serves as the backend API for the project. It is also configured using the `config.ini` file.

- **File:** `api/api.py`
- **Configuration:**
    - `API_HOST`: Host for the API server
    - `API_PORT`: Port for the API server
    - `SECRET_KEY`: Secret key for the Flask application

To run the API server:
```sh
python api/api.py
```

### Database Configuration

The database configuration is specified in the `config.ini` file under the `[DATABASE]` section.

- **Configuration:**
    - `HOST`: Host for the database server
    - `PORT`: Port for the database server
    - `USERNAME`: Username for the database
    - `PASSWORD`: Password for the database
    - `DATABASE_NAME`: Name of the database

Ensure that your database server is running and accessible with the provided configuration.

## Configuration File

The `config.ini` file contains all the necessary configurations for the web, API, and database components. Make sure to update this file with your specific settings.

```ini
[DEFAULT]
SECRET_KEY = 0000000011111111

[API]
HOST = localhost
PORT = 5000

[WEB]
HOST = localhost
PORT = 8080
DEBUG = True

[DATABASE]
HOST = localhost
PORT = 5432
USERNAME = your_username
PASSWORD = your_password
DATABASE_NAME = your_database_name
```
