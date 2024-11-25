from flask import Flask, request, jsonify
import sqlite3
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend interaction

DATABASE = 'llc_database.db'

# Initialize database
def init_db():
    with sqlite3.connect(DATABASE) as conn:
        cursor = conn.cursor()
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS llcs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            registration_code TEXT UNIQUE NOT NULL,
            incorporation_date DATE NOT NULL,
            total_capital INTEGER NOT NULL
        )""")
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS shareholders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            llc_id INTEGER NOT NULL,
            type TEXT NOT NULL,
            name TEXT NOT NULL,
            id_number TEXT NOT NULL,
            share INTEGER NOT NULL,
            is_founder BOOLEAN NOT NULL,
            FOREIGN KEY(llc_id) REFERENCES llcs(id)
        )""")
        conn.commit()

# Get all LLCs
@app.route('/shareholders', methods=['GET'])
def get_shareholders():
    with sqlite3.connect(DATABASE) as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM shareholders")
        shareholders = cursor.fetchall()

        return jsonify([{
            'id': row[0],
            'llc_id':row[1],
            'type': row[2],
            'name': row[3],
            'id_number': row[4],
            'share': row[5],
            'is_founder': bool(row[6])
        } for row in shareholders]), 200

# Get all LLCs
@app.route('/llcs', methods=['GET'])
def get_llcs():
    with sqlite3.connect(DATABASE) as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM llcs")
        llcs = cursor.fetchall()

        return jsonify([{
                'id': row[0],
                'name': row[1],
                'registration_code': row[2],
                'incorporation_date': row[3],
                'total_capital': row[4]
            } for row in llcs]), 200


# Get LLC details by ID
@app.route('/llcs/<int:llc_id>', methods=['GET'])
def get_llc_details(llc_id):
    with sqlite3.connect(DATABASE) as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM llcs WHERE id = ?", (llc_id,))
        llc = cursor.fetchone()
        if not llc:
            return jsonify({'error': 'LLC not found'}), 404

        cursor.execute("SELECT * FROM shareholders WHERE llc_id = ?", (llc_id,))
        shareholders = cursor.fetchall()
        return jsonify({
            'id': llc[0],
            'name': llc[1],
            'registration_code': llc[2],
            'incorporation_date': llc[3],
            'total_capital': llc[4],
            'shareholders': [{
                'id': row[0],
                'type': row[2],
                'name': row[3],
                'id_number': row[4],
                'share': row[5],
                'is_founder': bool(row[6])
            } for row in shareholders]
        }), 200

# Add a new LLC
@app.route('/llcs', methods=['POST'])
def add_llc():
    data = request.json
    name = data['name']
    registration_code = data['registration_code']
    incorporation_date = data['incorporation_date']
    total_capital = data['total_capital']
    shareholders = data['shareholders']

    with sqlite3.connect(DATABASE) as conn:
        cursor = conn.cursor()
        try:
            # Insert LLC data
            cursor.execute("""
            INSERT INTO llcs (name, registration_code, incorporation_date, total_capital)
            VALUES (?, ?, ?, ?)""", (name, registration_code, incorporation_date, total_capital))
            llc_id = cursor.lastrowid

            # Insert shareholders
            for shareholder in shareholders:
                cursor.execute("""
                INSERT INTO shareholders (llc_id, type, name, id_number, share, is_founder)
                VALUES (?, ?, ?, ?, ?, ?)""", (
                    llc_id,
                    shareholder['type'],
                    shareholder['name'],
                    shareholder['id'],
                    shareholder['share'],
                    shareholder['is_founder']
                ))

            conn.commit()
            return jsonify({'message': 'LLC added successfully', 'llc_id': llc_id}), 201
        except sqlite3.IntegrityError as e:
            return jsonify({'error': str(e)}), 400

# Run the application
if __name__ == '__main__':
    init_db()
    app.run(debug=True)
