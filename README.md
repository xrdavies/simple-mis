# MIS - Management Information System

A modern web-based tool for viewing and analyzing data from a SQLite database. This tool provides an intuitive interface to explore database tables, filter data, and export results.

![MIS Screenshot](https://via.placeholder.com/800x450.png?text=MIS+Management+Information+System)

## Features

- Browse all tables in your SQLite database
- Select specific columns to display
- Filter data based on column values
- Export data in CSV or JSON formats
- Responsive design for desktop and mobile devices
- Real-time search functionality

## Project Structure

The project consists of two main components:

1. **mis-backend**: A Flask server that connects to the SQLite database and provides API endpoints
2. **mis-web**: A web interface that communicates with the backend to display and filter database tables

## Setup Instructions

### Prerequisites

- Python 3.6 or higher
- A SQLite database file (sample database `chinook.db` is included)
- Git (for cloning the repository)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/xrdavies/simple-mis.git
   cd simple-mis
   ```

2. Create and activate a virtual environment:
   ```bash
   # Create a virtual environment
   python -m venv .venv
   
   # Activate the virtual environment
   # On macOS/Linux:
   source .venv/bin/activate
   # On Windows:
   # .venv\Scripts\activate
   ```

3. Install backend dependencies:
   ```bash
   cd mis-backend
   pip install -r requirements.txt
   ```

4. Configure the database path:
    
    Set the environment variable `MIS_DB_PATH` to the path of your SQLite database file:
    ```bash
    # On macOS/Linux:
    export MIS_DB_PATH=/path/to/your/database.db
    # On Windows:
    # set MIS_DB_PATH=C:\path\to\your\database.db
    ```
    
    Alternatively, place your SQLite database file in the `mis-backend` directory and name it `database.db`.
    
    **Sample Database**: The project includes a sample SQLite database file called `chinook.db` that you can use for testing. This is a commonly used sample database that contains tables for artists, albums, tracks, invoices, and more.

### Running the Application

1. Start the backend server:
   ```bash
   # Make sure you're in the mis-backend directory and the virtual environment is activated
   cd mis-backend
   python app.py
   ```

2. Access the web interface:
   
   Open your browser and navigate to:
   ```
   http://localhost:5001
   ```

   Note: The default port is 5001. If you want to use a different port, you can set the PORT environment variable:
   ```bash
   # On macOS/Linux:
   export PORT=8080
   # On Windows:
   # set PORT=8080
   ```

## Usage Guide

1. **Browse Tables**: When you first open the application, you'll see a list of all tables in your SQLite database in the left sidebar.

2. **View Table Data**: Click on any table name to view its data in the main panel.

3. **Filter Columns**: Use the column selector at the top of the data view to choose which columns to display.

4. **Filter Data**: Click the "Filter" button to open the filter modal, where you can enter values to filter the data by specific column values.

5. **Export Data**: Click the "Export" button to download the current view as CSV or JSON.

6. **Search Tables**: Use the search box in the sidebar to quickly find specific tables.

## API Endpoints

The backend provides the following API endpoints:

- `GET /api/tables`: Get a list of all tables in the database
- `GET /api/tables/<table_name>/columns`: Get a list of columns for a specific table
- `GET /api/tables/<table_name>/data`: Get data from a table with optional filtering
  - Query parameters:
    - `columns`: Comma-separated list of columns to include
    - `limit`: Maximum number of rows to return (default: 100)
    - `offset`: Number of rows to skip (for pagination)
    - Any other parameter will be treated as a filter (e.g., `?id=1` will filter rows where id=1)

## Sample Database: Chinook

The included `chinook.db` is a sample SQLite database that represents a digital media store, including tables for artists, albums, media tracks, invoices, and customers. It's perfect for testing the MIS application.

Some of the main tables in the Chinook database:

- `Artist`: Music artists
- `Album`: Music albums
- `Track`: Individual music tracks
- `Customer`: Customer information
- `Invoice`: Sales invoices
- `Employee`: Employee information
- `Genre`: Music genres
- `Playlist`: Playlists and track listings

To use the sample database, you can set:
```bash
export MIS_DB_PATH=/path/to/chinook.db
```

## Troubleshooting

- **Port Already in Use**: If you see an error like "Address already in use", try changing the port as described above.

- **Database Connection Issues**: Make sure your SQLite database file exists and is accessible. Check that the `MIS_DB_PATH` environment variable is set correctly.

- **Missing Dependencies**: If you encounter import errors, make sure you've activated the virtual environment and installed all dependencies from requirements.txt.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

[MIT License](LICENSE)
