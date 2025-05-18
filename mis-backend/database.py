import sqlite3
from typing import List, Dict, Any, Optional, Tuple

class Database:
    def __init__(self, db_path: str):
        """Initialize the database connection.
        
        Args:
            db_path: Path to the SQLite database file
        """
        self.db_path = db_path
        self.connection = None
        
    def connect(self):
        """Establish a connection to the database."""
        self.connection = sqlite3.connect(self.db_path)
        # Enable row factory to return rows as dictionaries
        self.connection.row_factory = sqlite3.Row
        
    def disconnect(self):
        """Close the database connection."""
        if self.connection:
            self.connection.close()
            self.connection = None
    
    def get_tables(self) -> List[str]:
        """Get a list of all tables in the database.
        
        Returns:
            List of table names
        """
        if not self.connection:
            self.connect()
            
        cursor = self.connection.cursor()
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = [row['name'] for row in cursor.fetchall()]
        return tables
    
    def get_table_columns(self, table_name: str) -> List[str]:
        """Get a list of columns for a specific table.
        
        Args:
            table_name: Name of the table
            
        Returns:
            List of column names
        """
        if not self.connection:
            self.connect()
            
        cursor = self.connection.cursor()
        cursor.execute(f"PRAGMA table_info({table_name});")
        columns = [row['name'] for row in cursor.fetchall()]
        return columns
    
    def query_table(self, table_name: str, columns: Optional[List[str]] = None, 
                   filters: Optional[Dict[str, Any]] = None, 
                   limit: int = 100, offset: int = 0) -> Tuple[List[Dict[str, Any]], int]:
        """Query a table with optional column selection and filters.
        
        Args:
            table_name: Name of the table to query
            columns: List of columns to select (None for all columns)
            filters: Dictionary of column-value pairs for filtering
            limit: Maximum number of rows to return
            offset: Number of rows to skip
            
        Returns:
            Tuple containing (list of rows as dictionaries, total count of rows)
        """
        if not self.connection:
            self.connect()
            
        # Prepare column selection
        column_str = "*"
        if columns and len(columns) > 0:
            column_str = ", ".join(columns)
            
        # Prepare WHERE clause if filters are provided
        where_clause = ""
        params = []
        
        if filters and len(filters) > 0:
            conditions = []
            for column, value in filters.items():
                conditions.append(f"{column} = ?")
                params.append(value)
                
            where_clause = "WHERE " + " AND ".join(conditions)
        
        # Get total count (without limit/offset)
        count_query = f"SELECT COUNT(*) as count FROM {table_name} {where_clause}"
        cursor = self.connection.cursor()
        cursor.execute(count_query, params)
        total_count = cursor.fetchone()['count']
        
        # Execute the main query with limit and offset
        query = f"SELECT {column_str} FROM {table_name} {where_clause} LIMIT {limit} OFFSET {offset}"
        cursor.execute(query, params)
        
        # Convert rows to dictionaries
        rows = []
        for row in cursor.fetchall():
            rows.append({key: row[key] for key in row.keys()})
            
        return rows, total_count
