import sqlite3

conn = sqlite3.connect('votes.db')
cursor = conn.cursor()

cursor.execute("SELECT * FROM votes")
rows = cursor.fetchall()

for row in rows:
    print(row)

conn.close()
