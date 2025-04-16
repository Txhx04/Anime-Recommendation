import pandas as pd
import mysql.connector

# Load the CSV file
df = pd.read_csv("Refined_Anime_Data.csv")

# Clean Genre column: Remove curly brackets and single quotes
df["Genre"] = df["Genre"].str.replace(r"[{}']", "", regex=True)

# Connect to MySQL
conn = mysql.connector.connect(
    host="localhost",
    user="root",
    password="root",
    database="miniproject"
)
cursor = conn.cursor()

# SQL Query for inserting data
sql = "INSERT INTO anime (title, genre, release_year, rating, studio) VALUES (%s, %s, %s, %s, %s)"

# Insert each row into MySQL
for _, row in df.iterrows():
    cursor.execute(sql, (row["Title"], row["Genre"], row["Year Release"], row["Rating"], row["Studio"]))

# Commit changes and close connection
conn.commit()
cursor.close()
conn.close()

print("✅ Data successfully inserted into the anime table!")
