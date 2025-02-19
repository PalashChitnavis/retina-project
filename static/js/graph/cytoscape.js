const urlParams = new URLSearchParams(window.location.search);
const val = urlParams.get("val");
console.log("Random String:", val);

const data = localStorage.getItem(val);

//console.log(data);

const graphData = data ? JSON.parse(data) : { elements: [] };

console.log(graphData);

var cy = cytoscape({
  container: document.getElementById("cy"),
  elements: graphData.elements,
  layout: {
    name: "preset",
  },
  style: [
    {
      selector: "node",
      style: {
        "background-color": "#af0001",
        label: "data(id)",
        "text-valign": "center",
        "text-halign": "center",
        color: "#fff",
        width: 40,
        height: 40,
      },
    },
    {
      selector: "node:selected",
      style: {
        "background-color": "blue",
        "border-width": 2,
        "border-color": "#fff",
      },
    },
    {
      selector: "edge",
      style: {
        "line-color": "#008032",
        width: 5,
        "curve-style": "bezier",
      },
    },
    {
      selector: "edge:selected",
      style: {
        "line-color": "orange",
        width: 7,
      },
    },
  ],
});

cy.userPanningEnabled(true);

cy.zoomingEnabled(true);

cy.boxSelectionEnabled(true);

cy.lassoSelectionEnabled(false);

cy.autolock(false);

document.getElementById("layout-select").addEventListener("change", (event) => {
  cy.layout({ name: event.target.value }).run();
});

document.getElementById("reset-everything").addEventListener("click", () => {
  window.location.reload();
});

document.getElementById("lasso-value").addEventListener("change", (event) => {
  const isChecked = event.target.checked;
  cy.lassoSelectionEnabled(isChecked);
  document.getElementById("box-value").checked = !isChecked;
  cy.boxSelectionEnabled(!isChecked);
});

document.getElementById("panning-value").addEventListener("change", (event) => {
  const isChecked = event.target.checked;
  cy.userPanningEnabled(isChecked);
});

document.getElementById("zooming-value").addEventListener("change", (event) => {
  const isChecked = event.target.checked;
  cy.zoomingEnabled(isChecked);
});

document.getElementById("box-value").addEventListener("change", (event) => {
  const isChecked = event.target.checked;
  cy.boxSelectionEnabled(isChecked);
  document.getElementById("lasso-value").checked = !isChecked;
  cy.lassoSelectionEnabled(!isChecked);
});

document.getElementById("lock-value").addEventListener("change", (event) => {
  const isChecked = event.target.checked;
  cy.autolock(isChecked);
});

document
  .getElementById("node-color-value")
  .addEventListener("change", (event) => {
    const color = event.target.value;
    cy.nodes().style({ "background-color": color });
  });

document
  .getElementById("edge-color-value")
  .addEventListener("change", (event) => {
    const color = event.target.value;
    cy.edges().style({ "line-color": color });
  });

cy.on("tap", "node,edge", function (evt) {
  var element = evt.target;
  const elementData = element.data();
  const elementDiv = document.getElementById("element");
  const elementLabel = document.getElementById("element-label");

  elementDiv.innerHTML = "";

  // Create a table
  const table = document.createElement("table");

  // Iterate over the object and add rows to the table
  for (const [key, value] of Object.entries(elementData)) {
    const row = document.createElement("tr");
    // Create key cell
    const keyCell = document.createElement("td");
    keyCell.textContent = key;
    row.appendChild(keyCell);

    // Create value cell
    const valueCell = document.createElement("td");
    valueCell.textContent = value;
    row.appendChild(valueCell);

    // Add row to the table
    table.appendChild(row);
  }
  // Append the table to the element div
  elementDiv.append(table);
  elementLabel.textContent = element.isNode() ? "Node Data:" : "Edge Data:";
});

function updateSelectedItemsDisplay() {
  const selectedItemsElement = document.getElementById("selected-nodes-area");
  const selectedNodes = cy.$(":selected");
  // Clear existing content
  selectedItemsElement.innerHTML = "";

  // Iterate through selected nodes
  selectedNodes.forEach((node) => {
    if (node.isEdge()) return;
    // Create a container div for the node
    const nodeDiv = document.createElement("div");
    nodeDiv.style.display = "flex"; // Flexbox for alignment
    nodeDiv.style.justifyContent = "center"; // Space between text and button
    nodeDiv.style.alignItems = "center"; // Center items
    nodeDiv.style.backgroundColor = "#ccc"; // Grey background
    nodeDiv.style.color = "#000"; // Black text
    nodeDiv.style.textAlign = "center"; // Center text
    nodeDiv.style.padding = "10px"; // Padding
    nodeDiv.style.margin = "5px 0"; // Margin
    nodeDiv.style.borderRadius = "5px"; // Rounded corners
    nodeDiv.style.width = "90%"; // Fixed width
    nodeDiv.style.position = "relative"; // Relative position for button placement

    // Create text element for node ID
    const nodeText = document.createElement("span");
    nodeText.textContent = node.id();

    // Create a remove (X) button
    const closeButton = document.createElement("button");
    closeButton.textContent = "X";
    closeButton.style.background = "red";
    closeButton.style.position = "absolute";
    closeButton.style.right = "10px";
    closeButton.style.color = "white";
    closeButton.style.border = "none";
    closeButton.style.padding = "5px 10px";
    closeButton.style.marginLeft = "10px";
    closeButton.style.cursor = "pointer";
    closeButton.style.borderRadius = "50%";
    closeButton.style.fontSize = "14px";

    // Remove node from selection when button is clicked
    closeButton.addEventListener("click", () => {
      node.unselect(); // Deselects the node
    });

    // Append elements
    nodeDiv.appendChild(nodeText);
    nodeDiv.appendChild(closeButton);
    selectedItemsElement.appendChild(nodeDiv);
  });
}

// Event listeners for selection and deselection
cy.on("select", "node", updateSelectedItemsDisplay);
cy.on("unselect", "node", updateSelectedItemsDisplay);

cy.panzoom();

document.getElementById("upload-graph").addEventListener("click", () => {
  // Get the current base URL
  const baseUrl = window.location.origin; // e.g., "https://example.com"
  // Append "/upload" to the base URL
  const newUrl = `${baseUrl}/upload`;
  // Open the new URL in a new tab
  window.open(newUrl, "_blank");
});

document.getElementById("download").addEventListener("click", () => {
  document.getElementById("overlay").className = "overlay";
});

document.getElementById("png").addEventListener("click", () => {
  const imageData = cy.png({ full: true, output: "png" });
  const link = document.createElement("a");
  link.href = imageData;
  link.download = `graph.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  document.getElementById("overlay").className = "overlay hidden";
});

document.getElementById("jpg").addEventListener("click", () => {
  const imageData = cy.png({ full: true, output: "jpeg" });
  const link = document.createElement("a");
  link.href = imageData;
  link.download = `graph.jpeg`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  document.getElementById("overlay").className = "overlay hidden";
});

document.getElementById("json").addEventListener("click", () => {
  const jsonData = JSON.stringify(cy.json(), null, 2);
  const blob = new Blob([jsonData], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "graph.json";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  document.getElementById("overlay").className = "overlay hidden";
});

document.getElementById("create-subgraph").addEventListener("click", () => {
  const selectedNodes = cy.$(":selected");
  const selectedEdges = selectedNodes.connectedEdges();
  const nodeIDs = new Set();
  let nodeData = [];
  let edgeData = [];
  selectedNodes.forEach((node) => {
    if (node.isEdge()) return;
    nodeData.push({
      data: node.data(),
      position: {
        x: node.position().x,
        y: node.position().y,
      },
    });
    nodeIDs.add(node.id());
  });
  selectedEdges.forEach((edge) => {
    if (edge.isNode()) return;
    const sourceNode = cy.$(`#${edge.data().source}`);
    const targetNode = cy.$(`#${edge.data().target}`);
    if (!nodeIDs.has(sourceNode.id())) {
      console.log(sourceNode.id() + " not found");
      nodeData.push({
        data: sourceNode.data(),
        position: {
          x: sourceNode.position().x,
          y: sourceNode.position().y,
        },
      });
    }
    if (!nodeIDs.has(targetNode.id())) {
      console.log(targetNode.id() + " not found");
      nodeData.push({
        data: targetNode.data(),
        position: {
          x: targetNode.position().x,
          y: targetNode.position().y,
        },
      });
    }
    edgeData.push({ data: edge.data() });
  });
  const subgraphData = {
    elements: {
      nodes: nodeData,
      edges: edgeData,
    },
  };

  function generateRandomString(length) {
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }
  const randomString = generateRandomString(5);
  localStorage.setItem(randomString, JSON.stringify(subgraphData));
  const baseUrl = window.location.origin;
  const newUrl = `${baseUrl}/graph?val=${randomString}`;
  window.open(newUrl, "_blank");
});

document.getElementById("search").addEventListener("input", (event) => {
  const searchedContainer = document.querySelector(".searched-element");
  searchedContainer.innerHTML = ""; // Clear previous results

  // Split input by comma, trim spaces, and filter out empty values
  const searchValues = event.target.value
    .split(",")
    .map((val) => val.trim())
    .filter((val) => val !== "");

  searchValues.forEach((value) => {
    const node = cy.getElementById(value);

    if (node.length > 0 && node.isNode()) {
      // Create a container div for the node
      const nodeDiv = document.createElement("div");
      nodeDiv.style.display = "flex"; // Flexbox for alignment
      nodeDiv.style.justifyContent = "center"; // Center alignment
      nodeDiv.style.alignItems = "center"; // Center items
      nodeDiv.style.backgroundColor = "#ccc"; // Grey background
      nodeDiv.style.color = "#000"; // Black text
      nodeDiv.style.textAlign = "center"; // Center text
      nodeDiv.style.padding = "10px"; // Padding
      nodeDiv.style.margin = "5px 0"; // Margin
      nodeDiv.style.borderRadius = "5px"; // Rounded corners
      nodeDiv.style.width = "90%"; // Fixed width
      nodeDiv.style.position = "relative"; // Relative positioning

      // Create text element for node ID
      const nodeText = document.createElement("span");
      nodeText.textContent = node.id();

      // Create a tick button (✔)
      const tickButton = document.createElement("button");
      tickButton.textContent = "✔"; // Tick symbol
      tickButton.style.background = "green";
      tickButton.style.position = "absolute";
      tickButton.style.right = "10px";
      tickButton.style.color = "white";
      tickButton.style.border = "none";
      tickButton.style.padding = "5px 10px";
      tickButton.style.marginLeft = "10px";
      tickButton.style.cursor = "pointer";
      tickButton.style.borderRadius = "50%";
      tickButton.style.fontSize = "14px";

      // When clicked, select the node
      tickButton.addEventListener("click", () => {
        node.select(); // Selects the node
      });

      // Append elements
      nodeDiv.appendChild(nodeText);
      nodeDiv.appendChild(tickButton);
      searchedContainer.appendChild(nodeDiv);
    }
  });
});
