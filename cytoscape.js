import data1 from './dataType1.json' with {type: 'json'};
import data2 from './dataType2.json' with {type: 'json'};
import dataValidator from "./dataValidator.js";

const data = data2;

const graphData = dataValidator(data);

var cy = cytoscape({
  container: document.getElementById("cy"),
  elements: graphData,
  layout: {
    name: "preset",
  },
});

cy.lassoSelectionEnabled(false)

document.getElementById('layout-select').addEventListener('change',(event)=>{
  console.log(event.target.value);
  cy.layout({ name: event.target.value }).run();
})

document.getElementById('reset-everything').addEventListener('click',()=>{
  window.location.reload();
})

document.getElementById('lasso-value').addEventListener('change', (event) => {
  const isChecked = event.target.checked;
  cy.lassoSelectionEnabled(isChecked)
});

cy.on('tap','node,edge', function(evt){
  var element = evt.target;
  //console.log(element.isNode());

  const elementData = element["_private"]["data"];
  const elementDiv = document.getElementById('element');
  const elementLabel = document.getElementById('element-label');
  
  elementDiv.innerHTML = '';

  // Create a table
  const table = document.createElement('table');

  // Iterate over the object and add rows to the table
  for (const [key, value] of Object.entries(elementData)) {
    const row = document.createElement('tr');
    // Create key cell
    const keyCell = document.createElement('td');
    keyCell.textContent = key;
    row.appendChild(keyCell);

    // Create value cell
    const valueCell = document.createElement('td');
    valueCell.textContent = value;
    row.appendChild(valueCell);

    // Add row to the table
    table.appendChild(row);
  }
  // Append the table to the element div
  elementDiv.append(table);
  elementLabel.textContent = element.isNode() ? 'Node Data:' : 'Edge Data:';
});

function updateSelectedItemsDisplay() {
  const selectedItemsElement = document.getElementById('selected-items');
  const selectedNodes = cy.$(':selected'); // Get all selected nodes
  const subGraphButton = document.getElementById('create-subgraph');
  //console.log(selectedNodes);
}

// Event listeners for selection and deselection
cy.on('select', 'node', updateSelectedItemsDisplay);
cy.on('unselect', 'node', updateSelectedItemsDisplay);

cy.panzoom()