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