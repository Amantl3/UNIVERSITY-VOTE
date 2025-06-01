from flask import Flask, render_template
import sqlite3

# Create the Flask app
app = Flask(__name__)

# Set up the route to view the results
@app.route('/admin_results')
def view_results():
    # Connect to the SQLite database
    conn = sqlite3.connect('votes.db')
    cursor = conn.cursor()

    # Fetch all vote results from the 'votes' table
    cursor.execute('SELECT * FROM votes')
    results = cursor.fetchall()  # Get all the rows

    # Close the connection
    conn.close()

    # Render the existing template to display the vote results
    return render_template('admin_results.html', results=results)

# Run the app
if __name__ == '__main__':
    app.run(debug=True)

