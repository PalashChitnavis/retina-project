Assessment Task: Scalable Network Visualization Web Application

[Demo Video](https://drive.google.com/file/d/1EWWLF22uNcO1NuZ3H4jwlkoe3cfUDqle/view?usp=sharing)

[Assessment](https://github.com/DBRetina/GSOC_proposals/issues/3)

[Topic](https://github.com/nrnb/GoogleSummerOfCode/issues/251)

Basic Architecture : 

1.	All execution is done on the client side using JavaScript. The Flask server only serves static HTML, CSS, and JavaScript files. Once the page loads, all processing—file parsing, data conversion, and visualization—is handled directly in the browser.

2.	Cytoscape.js powers the network visualization. The core graph rendering and interaction logic is written in static/js/graph/cytoscape.js, ensuring a smooth and dynamic user experience.

3.	Comprehensive input validation with clear error messages. Before visualization, the uploaded file is checked for formatting errors, missing values, or unsupported structures. Any issues encountered are reported back with user-friendly error messages for quick resolution.

4.	No backend processing—everything runs in the browser. The application does not require a backend for parsing or computation. Once the static files are loaded, JavaScript handles everything, making the system lightweight and scalable.

5.	Simple and intuitive workflow. Users can upload Excel, JSON, SIF, and TXT files at the moment, and upon successful parsing, they are immediately redirected to the visualization page. If errors occur, they receive a clear message explaining the issue and how to fix it.


Libraries used : 

1. Cytoscape.js 
2. Cytoscape extensions

Run Locally : 

1. Clone the repository:
   ```sh
   git clone https://github.com/PalashChitnavis/retina-project
   cd retina-project
   ```
   
2. Create and activate a virtualenv for python (optional)
  ```sh
  python3 -m venv venv
  source venv/bin/activate
  ```

3. Install Flask
  ```sh
  pip3 install flask
  ```

4. Start the Flask Server
   ```sh
   python3 app.py
   ```

5. Open your browser and visit
  ```
  http://127.0.0.1:5000
  ```

