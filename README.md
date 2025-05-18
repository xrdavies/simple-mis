# MIS - Management Information System

A web-based tool for viewing and analyzing data from a SQLite database.

## Project Structure

The project consists of two main components:

1. **mis-backend**: A Flask server that connects to the SQLite database and provides API endpoints
2. **mis-web**: A web interface that communicates with the backend to display and filter database tables

## Setup Instructions

### Prerequisites

- Python 3.6 or higher
- A SQLite database file

### Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd mis
   ```

2. Install backend dependencies:
   ```
   cd mis-backend
   pip install -r requirements.txt
   ```

3. Configure the database path:
   
   Set the environment variable `MIS_DB_PATH` to the path of your SQLite database file:
   ```
   export MIS_DB_PATH=/path/to/your/database.db
   ```
   
   Alternatively, place your SQLite database file in the `mis-backend` directory and name it `database.db`.

### Running the Application

1. Start the backend server:
   ```
   cd mis-backend
   python app.py
   ```

2. Access the web interface:
   
   Open your browser and navigate to:
   ```
   http://localhost:5000
   ```

## Features

- View all tables in the SQLite database
- Select specific columns to display
- Filter table data based on column values
- Pagination for large datasets

## API Endpoints

The backend provides the following API endpoints:

- `GET /api/tables`: Get a list of all tables in the database
- `GET /api/tables/<table_name>/columns`: Get a list of columns for a specific table
- `GET /api/tables/<table_name>/data`: Get data from a table with optional filtering

## License

[MIT License](LICENSE)
