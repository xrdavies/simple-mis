from flask import Flask, jsonify, request
from flask_cors import CORS
from database import Database
import os
import json

app = Flask(__name__, static_folder='../mis-web', static_url_path='/')
CORS(app)  # Enable CORS for all routes

# Configure the database path
DB_PATH = os.environ.get('MIS_DB_PATH', 'database.db')
db = Database(DB_PATH)

@app.route('/')
def index():
    """Serve the main web application."""
    return app.send_static_file('index.html')

@app.route('/api/tables', methods=['GET'])
def get_tables():
    """Get a list of all tables in the database."""
    try:
        db.connect()
        tables = db.get_tables()
        return jsonify({'tables': tables})
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        db.disconnect()

@app.route('/api/tables/<table_name>/columns', methods=['GET'])
def get_table_columns(table_name):
    """Get a list of columns for a specific table."""
    try:
        db.connect()
        columns = db.get_table_columns(table_name)
        return jsonify({'columns': columns})
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        db.disconnect()

@app.route('/api/tables/<table_name>/data', methods=['GET'])
def get_table_data(table_name):
    """Get data from a table with optional filtering."""
    try:
        # Parse query parameters
        columns_param = request.args.get('columns')
        columns = columns_param.split(',') if columns_param else None
        
        # Parse filters from query parameters
        filters = {}
        for key, value in request.args.items():
            if key not in ['columns', 'limit', 'offset']:
                filters[key] = value
        
        # Parse pagination parameters
        limit = int(request.args.get('limit', 100))
        offset = int(request.args.get('offset', 0))
        
        # Query the database
        db.connect()
        rows, total_count = db.query_table(
            table_name=table_name,
            columns=columns,
            filters=filters,
            limit=limit,
            offset=offset
        )
        
        return jsonify({
            'data': rows,
            'total': total_count,
            'limit': limit,
            'offset': offset
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        db.disconnect()

if __name__ == '__main__':
    # Get port from environment variable or use default 5001
    port = int(os.environ.get('PORT', 5001))
    # Run the Flask app
    app.run(host='0.0.0.0', port=port, debug=True)
