from flask import Flask, jsonify
from flask_cors import CORS
import mysql.connector
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

# Allow frontend to communicate with the Flask API
CORS(app)


# function connects Flask app with the MySQL database
def get_db_connection():
    db = mysql.connector.connect(
        host=os.getenv("DB_HOST", "localhost"),
        user=os.getenv("DB_USER", "root"),
        password=os.getenv("DB_PASSWORD"),
        database=os.getenv("DB_NAME", "food_price_db")
    )
    return db


# home page of API
# check whether the Flask API is running or not
@app.route("/")
def home():
    return "Smart Food Price Monitoring API is running!"


# API gets all the products from the products table
@app.route("/api/products")
def get_products():
    db = None
    cursor = None
    try:
        db = get_db_connection()
        cursor = db.cursor(dictionary=True)
        cursor.execute("""
            SELECT
                product_id,
                product_name,
                unit,
                category_id
            FROM products
        """)
        return jsonify(cursor.fetchall())
    except mysql.connector.Error as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if cursor:
            cursor.close()
        if db and db.is_connected():
            db.close()


# API gets all the cities stored in database
@app.route("/api/cities")
def get_cities():
    db = None
    cursor = None
    try:
        db = get_db_connection()
        cursor = db.cursor(dictionary=True)
        cursor.execute("""
            SELECT
                city_id,
                city_name,
                province
            FROM cities
        """)
        return jsonify(cursor.fetchall())
    except mysql.connector.Error as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if cursor:
            cursor.close()
        if db and db.is_connected():
            db.close()


# API gets all the food price records
@app.route("/api/prices")
def get_prices():
    db = None
    cursor = None
    try:
        db = get_db_connection()
        cursor = db.cursor(dictionary=True)
        cursor.execute("""
            SELECT
                p.product_name,
                p.unit,
                c.city_name,
                c.province,
                pr.record_date,
                pr.min_price,
                pr.avg_price,
                pr.max_price
            FROM price_records pr
            JOIN products p
                ON pr.product_id = p.product_id
            JOIN cities c
                ON pr.city_id = c.city_id
        """)
        return jsonify(cursor.fetchall())
    except mysql.connector.Error as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if cursor:
            cursor.close()
        if db and db.is_connected():
            db.close()


# API gets prices for only one specific city
# city name is taken from the URL
@app.route("/api/prices/city/<city_name>")
def get_prices_by_city(city_name):
    db = None
    cursor = None
    try:
        db = get_db_connection()
        cursor = db.cursor(dictionary=True)
        cursor.execute("""
            SELECT
                p.product_name,
                p.unit,
                c.city_name,
                c.province,
                pr.record_date,
                pr.min_price,
                pr.avg_price,
                pr.max_price
            FROM price_records pr
            JOIN products p
                ON pr.product_id = p.product_id
            JOIN cities c
                ON pr.city_id = c.city_id
            WHERE c.city_name = %s
        """, (city_name,))
        return jsonify(cursor.fetchall())
    except mysql.connector.Error as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if cursor:
            cursor.close()
        if db and db.is_connected():
            db.close()


# API gets prices for one specific product
# product name is taken from the URL
@app.route("/api/prices/product/<product_name>")
def get_prices_by_product(product_name):
    db = None
    cursor = None
    try:
        db = get_db_connection()
        cursor = db.cursor(dictionary=True)
        cursor.execute("""
            SELECT
                p.product_name,
                p.unit,
                c.city_name,
                c.province,
                pr.record_date,
                pr.min_price,
                pr.avg_price,
                pr.max_price
            FROM price_records pr
            JOIN products p
                ON pr.product_id = p.product_id
            JOIN cities c
                ON pr.city_id = c.city_id
            WHERE p.product_name = %s
        """, (product_name,))
        return jsonify(cursor.fetchall())
    except mysql.connector.Error as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if cursor:
            cursor.close()
        if db and db.is_connected():
            db.close()


# starts the Flask server
if __name__ == "__main__":
    app.run(debug=True)