import pandas as pd
import mysql.connector
from getpass import getpass

from datetime import date
PRICE_DATE = date(2026, 9, 10)

# FILE LOCATION

excel_file = r"C:\DBMS_Food_Price_Project\data\Annex_10.09.2026.xlsx"

# CONNECT TO MYSQL

print("Connecting to MySQL...")

password = getpass("Enter your MySQL root password: ")

db = mysql.connector.connect(
    host="localhost",
    user="root",
    password=password,
    database="food_price_db"
)

cursor = db.cursor()

print("Connected to MySQL successfully!")

# READ PBS EXCEL FILE

print("Reading PBS Excel file...")

df = pd.read_excel(
    excel_file,
    sheet_name="Appendix-A",
    header=None
)

print("Excel file loaded successfully!")

# FOOD PRODUCT INFORMATION
#    First 32 items from PBS Appendix-A

products_info = []

for row in range(6, 38):

    product_number = int(df.iloc[row, 0])
    product_name = str(df.iloc[row, 1])
    unit = str(df.iloc[row, 2])

    products_info.append(
        (product_number, product_name, unit)
    )

# CATEGORY MAPPING

def get_category(product_number):

    if product_number in [1, 2, 3]:
        return "Food Grains"

    elif product_number in [4]:
        return "Bakery"

    elif product_number in [5, 6, 7]:
        return "Meat"

    elif product_number in [8, 9, 10, 11]:
        return "Dairy & Eggs"

    elif product_number in [12, 13, 14, 15]:
        return "Cooking Oil & Ghee"

    elif product_number in [16]:
        return "Fruits"

    elif product_number in [17, 18, 19, 20]:
        return "Pulses"

    elif product_number in [21, 22, 23]:
        return "Vegetables"

    elif product_number in [24, 25]:
        return "Sugar & Sweeteners"

    elif product_number in [26, 27, 28]:
        return "Spices & Condiments"

    elif product_number in [29]:
        return "Beverages"

    elif product_number in [30, 31, 32]:
        return "Prepared Food"

    return "Other"

# INSERT CATEGORIES

print("\nInserting categories...")

categories = [
    "Food Grains",
    "Bakery",
    "Meat",
    "Dairy & Eggs",
    "Cooking Oil & Ghee",
    "Fruits",
    "Pulses",
    "Vegetables",
    "Sugar & Sweeteners",
    "Spices & Condiments",
    "Beverages",
    "Prepared Food"
]

for category in categories:

    cursor.execute(
        "SELECT category_id FROM categories WHERE category_name = %s",
        (category,)
    )

    result = cursor.fetchone()

    if result is None:

        cursor.execute(
            "INSERT INTO categories (category_name) VALUES (%s)",
            (category,)
        )

db.commit()

print("Categories inserted successfully!")

# GET CATEGORY IDs

cursor.execute(
    "SELECT category_id, category_name FROM categories"
)

category_rows = cursor.fetchall()

category_ids = {
    name: category_id
    for category_id, name in category_rows
}

# INSERT PRODUCTS

print("\nInserting products...")

product_ids = {}

for product_number, product_name, unit in products_info:

    category_name = get_category(product_number)

    # Check if product already exists
    cursor.execute(
        """
        SELECT product_id
        FROM products
        WHERE product_name = %s
        """,
        (product_name,)
    )

    result = cursor.fetchone()

    if result is None:

        cursor.execute(
            """
            INSERT INTO products
            (product_name, unit, category_id)
            VALUES (%s, %s, %s)
            """,
            (
                product_name,
                unit,
                category_ids[category_name]
            )
        )

        product_id = cursor.lastrowid

    else:
        product_id = result[0]

    product_ids[product_number] = product_id

db.commit()

print("Products inserted successfully!")

# CITY INFORMATION

cities = [
    ("Islamabad", "Islamabad Capital Territory"),
    ("Rawalpindi", "Punjab"),
    ("Gujranwala", "Punjab"),
    ("Sialkot", "Punjab"),
    ("Lahore", "Punjab"),
    ("Faisalabad", "Punjab"),
    ("Sargodha", "Punjab"),
    ("Multan", "Punjab"),
    ("Bahawalpur", "Punjab"),
    ("Karachi", "Sindh"),
    ("Hyderabad", "Sindh"),
    ("Sukkur", "Sindh"),
    ("Larkana", "Sindh"),
    ("Peshawar", "Khyber Pakhtunkhwa"),
    ("Bannu", "Khyber Pakhtunkhwa"),
    ("Quetta", "Balochistan"),
    ("Khuzdar", "Balochistan")
]

# INSERT CITIES

print("\nInserting cities...")

city_ids = {}

for city_name, province in cities:

    cursor.execute(
        """
        SELECT city_id
        FROM cities
        WHERE city_name = %s
        """,
        (city_name,)
    )

    result = cursor.fetchone()

    if result is None:

        cursor.execute(
            """
            INSERT INTO cities
            (city_name, province)
            VALUES (%s, %s)
            """,
            (city_name, province)
        )

        city_id = cursor.lastrowid

    else:
        city_id = result[0]

    city_ids[city_name] = city_id

db.commit()

print("Cities inserted successfully!")

# EXCEL CITY COLUMN INFORMATION

# First Excel block
# Columns:
# 3-5   Islamabad
# 6-8   Rawalpindi
# 9-11  Gujranwala
# 12-14 Sialkot
# 15-17 Lahore
# 18-20 Faisalabad
# 21-23 Sargodha

block_1 = {
    "Islamabad": (3, 4, 5),
    "Rawalpindi": (6, 7, 8),
    "Gujranwala": (9, 10, 11),
    "Sialkot": (12, 13, 14),
    "Lahore": (15, 16, 17),
    "Faisalabad": (18, 19, 20),
    "Sargodha": (21, 22, 23)
}


# Second Excel block
# Rows 64-95 contain the 32 food items

block_2 = {
    "Multan": (3, 4, 5),
    "Bahawalpur": (6, 7, 8),
    "Karachi": (9, 10, 11),
    "Hyderabad": (12, 13, 14),
    "Sukkur": (15, 16, 17),
    "Larkana": (18, 19, 20),
    "Peshawar": (21, 22, 23)
}


# Third Excel block
# Rows 122-153 contain the 32 food items

block_3 = {
    "Bannu": (3, 4, 5),
    "Quetta": (6, 7, 8),
    "Khuzdar": (9, 10, 11)
}

# INSERT PRICE RECORDS

print("\nImporting PBS price records...")

price_count = 0


def insert_prices(start_row, city_columns):

    global price_count

    for i in range(32):

        excel_row = start_row + i

        product_number = int(df.iloc[excel_row, 0])

        product_id = product_ids[product_number]

        for city_name, columns in city_columns.items():

            min_col, avg_col, max_col = columns

            min_price = pd.to_numeric(
                df.iloc[excel_row, min_col],
                errors="coerce"
            )

            avg_price = pd.to_numeric(
                df.iloc[excel_row, avg_col],
                errors="coerce"
            )

            max_price = pd.to_numeric(
                df.iloc[excel_row, max_col],
                errors="coerce"
            )

                       # Skip if all three values are missing
            if pd.isna(min_price) and pd.isna(avg_price) and pd.isna(max_price):
                continue

            # Skip if all three prices are zero 
            if min_price == 0 and avg_price == 0 and max_price == 0:
                continue

            city_id = city_ids[city_name]

            cursor.execute(
                """
                INSERT INTO price_records
                (
                    product_id,
                    city_id,
                    record_date,
                    min_price,
                    avg_price,
                    max_price
                )
                VALUES (%s, %s, %s, %s, %s, %s)
                """,
                (
                    product_id,
                    city_id,
                    PRICE_DATE,
                    None if pd.isna(min_price) else float(min_price),
                    None if pd.isna(avg_price) else float(avg_price),
                    None if pd.isna(max_price) else float(max_price)
                )
            )

            price_count += 1


# First block starts at Excel row 6
insert_prices(6, block_1)

# Second block starts at row 64
insert_prices(64, block_2)

# Third block starts at row 122
insert_prices(122, block_3)

# SAVE EVERYTHING

db.commit()

print("\n----------------------------------------")
print("PBS DATA IMPORT COMPLETED!")
print("----------------------------------------")

print("Products imported:", len(products_info))
print("Cities imported:", len(cities))
print("Price records imported:", price_count)

# CLOSE DATABASE CONNECTION

cursor.close()
db.close()

print("\nMySQL connection closed.")
print("Done!")