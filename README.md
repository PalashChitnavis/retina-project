Assessment Task: Scalable Network Visualization Web Application


[Assessment](https://github.com/DBRetina/GSOC_proposals/issues/)

[Demo Video](https://drive.google.com/file/d/1EWWLF22uNcO1NuZ3H4jwlkoe3cfUDqle/view?usp=sharing)

Basic Architecture : 

1. All execution is done on the client side by JavaScript.
2. Cytoscape.js is used to render the graphs and all logic is written in `static/js/graph/cytoscape.js`
3. Various checks are performed on the input files, and every error encountered is responded with a custom, easy-to-understand error message. 


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

