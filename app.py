from flask import Flask, render_template, redirect, url_for
import os

app = Flask(__name__)

DATA_FOLDER = os.path.join(os.getcwd(), 'data')

@app.route('/')
def home():
    return redirect(url_for('upload'))

@app.route('/upload')
def upload():
    return render_template('upload.html')

@app.route('/graph')
def graph():
    return render_template('graph.html')
    
if __name__ == '__main__':
    app.run(debug=True)
