const allowedExtensions = new Set(["json", "xls", "xlsx", "sif", "txt"]);

const dropArea = document.querySelector(".drop_box"),
  button = dropArea.querySelector("button"),
  input = dropArea.querySelector("input");

button.onclick = () => {
  input.click();
};

// perform basic checks
// file size, extension

input.addEventListener("change", function (e) {
  var fileSize = e.target.files[0].size;
  var fileName = e.target.files[0].name;
  var extension = fileName.slice(((fileName.lastIndexOf(".") - 1) >>> 0) + 2);
  const file = e.target.files[0];
  if (!allowedExtensions.has(extension)) {
    alert(
      `Invalid file format found: ${extension}. Please upload: json, xls, xlsx, sif, txt`
    );
    window.location.href = "/upload";
  }
  if (fileSize == 0) {
    alert("File is empty. Please upload a non-empty file.");
    window.location.href = "/upload";
  }
  let filedata = `
    <div class="form">
      <h4 class="file-name">${fileName}</h4>
      <button type="button" class="btn-red" id="goBackBtn">Go Back</button>
      <button type="submit" class="btn" id="uploadBtn">Load File</button>
    </div>`;

  dropArea.innerHTML = filedata;

  let json = null;

  if (extension == "sif" || extension == "txt") {
    json = sifToJson(file);
  } else if (extension == "json") {
    json = jsonToCYJson(file);
  } else if (extension == "xls" || extension == "xlsx") {
    json = excelToCytoJson(file);
  }

  document.getElementById("goBackBtn").addEventListener("click", function () {
    window.location.href = "/upload";
  });

  document.getElementById("uploadBtn").addEventListener("click", function () {
    json.then((data) => {
      function generateRandomString(length) {
        const characters =
          "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        let result = "";
        const charactersLength = characters.length;
        for (let i = 0; i < length; i++) {
          result += characters.charAt(
            Math.floor(Math.random() * charactersLength)
          );
        }
        return result;
      }
      const randomString = generateRandomString(5);
      localStorage.setItem(randomString, JSON.stringify(data));
      window.location.href = `/graph?val=${randomString}`;
    });
  });
});

function fileToText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = function (event) {
      resolve(event.target.result); // Return the file content
    };

    reader.onerror = function () {
      reject("Error reading file!");
    };

    reader.readAsText(file);
  });
}

async function sifToJson(file) {
  try {
    const text = await fileToText(file); // Wait for file content
    const cytoscapeJson = sifToCytoscapeJson(text);
    console.log(cytoscapeJson);
    return cytoscapeJson;
  } catch (error) {
    alert(error);
    window.location.href = "/upload";
  }
}

async function jsonToCYJson(file) {
  try {
    const text = await fileToText(file); // Wait for file content
    const json = JSON.parse(text); // ✅ Ensure it's parsed into an object

    // ✅ Convert to Cytoscape format
    const cytoscapeJson = jsonToCytoscapeJson(json);
    console.log("Converted JSON:", cytoscapeJson);
    return cytoscapeJson;
  } catch (error) {
    alert(error);
    window.location.href = "/upload";
  }
}

function jsonToCytoscapeJson(inputJson) {
  if (typeof inputJson !== "object" || inputJson === null) {
    throw "❌ Invalid JSON format: Expected an object or array.";
  }

  let nodes = [];
  let edges = [];

  // ✅ Case 1: JSON is already in Cytoscape format
  if (isCytoscapeJson(inputJson)) {
    return inputJson;
  }

  // ✅ Case 2: JSON is a flat array with mixed nodes and edges
  if (Array.isArray(inputJson)) {
    inputJson.forEach((item, index) => {
      if (typeof item !== "object" || item === null) {
        throw `❌ Invalid element at index ${index}: Expected an object.`;
      }

      const i = item.data ? item.data : item;

      // Check for "group" property
      if (i.group === "nodes") {
        if (!i.id) {
          throw `❌ Node at index ${index} is missing 'id'.`;
        }
        nodes.push({ data: { id: i.id, ...item } });
      } else if (i.group === "edges") {
        if (!i.source || !i.target) {
          throw `❌ Edge at index ${index} is missing 'source' or 'target'.`;
        }
        edges.push({ data: { id: i.id || `edge_${i}`, ...i } });
      }
      // Fallback to implicit detection
      else if ("source" in i && "target" in i) {
        if (!i.source || !i.target) {
          throw `❌ Edge at index ${index} is missing 'source' or 'target'.`;
        }
        edges.push({ data: { id: i.id || `edge_${i}`, ...i } });
      } else if ("id" in i) {
        nodes.push({ data: { id: i.id, ...i } });
      } else {
        throw `❌ Invalid item at index ${index}: Missing 'group', 'id', 'source', or 'target'.`;
      }
    });
  }

  // ✅ Case 3: JSON has "nodes" and "edges" but not wrapped in "elements"
  else if ("nodes" in inputJson || "edges" in inputJson) {
    if (!Array.isArray(inputJson.nodes) || !Array.isArray(inputJson.edges)) {
      throw "❌ Invalid JSON format: 'nodes' and 'edges' must be arrays.";
    }

    nodes = inputJson.nodes.map((node, index) => {
      if (!node.id) {
        throw `❌ Node at index ${index} is missing 'id'.`;
      }
      return { data: { id: node.id, ...node } };
    });

    edges = inputJson.edges.map((edge, index) => {
      if (!edge.source || !edge.target) {
        throw `❌ Edge at index ${index} is missing 'source' or 'target'.`;
      }
      return {
        data: {
          id: edge.id || `edge_${index}`,
          source: edge.source,
          target: edge.target,
          ...edge,
        },
      };
    });
  }

  // ✅ Case 4: JSON is completely invalid
  else {
    throw "❌ Invalid JSON format: Expected 'elements', a flat array, or 'nodes' and 'edges' keys.";
  }

  return {
    elements: { nodes, edges },
  };
}

function isCytoscapeJson(json) {
  return (
    typeof json === "object" &&
    json !== null &&
    "elements" in json &&
    typeof json.elements === "object" &&
    Array.isArray(json.elements.nodes) &&
    Array.isArray(json.elements.edges) &&
    json.elements.nodes.every(
      (node) => typeof node === "object" && "data" in node
    ) &&
    json.elements.edges.every(
      (edge) => typeof edge === "object" && "data" in edge
    )
  );
}

function sifToCytoscapeJson(sifText) {
  if (typeof sifText !== "string" || sifText.trim() === "") {
    throw "🚨 Error: Input must be a non-empty SIF-formatted text.";
  }

  const lines = sifText.split("\n").filter((line) => line.trim() !== "");
  const nodes = new Set();
  const edges = new Map(); // Map to track duplicate edges

  lines.forEach((line, index) => {
    const parts = line.trim().split(/\s+/);

    // ✅ Error: Malformed line (must have at least 3 parts)
    if (parts.length < 3) {
      throw `⚠️ Error at line ${
        index + 1
      }: Expected 'source interaction target', but found '${line}'.\n➤ Ensure each line follows this format: 'Node1 interaction Node2'.`;
    }

    const [source, interaction, target] = parts;

    // ✅ Error: Missing source/target
    if (!source || !target) {
      throw `🚨 Error at line ${
        index + 1
      }: Missing source or target node.\n➤ Found: 'source="${
        source || "MISSING"
      }"', 'target="${target || "MISSING"}"'.`;
    }

    // ✅ Warning: Self-loop detection
    if (source === target) {
      throw `⚠️ Warning at line ${
        index + 1
      }: Self-loop detected ('${source} interacts with itself').`;
    }

    // ✅ Error: Check for invalid characters (allowing underscores)
    const invalidNodePattern = /[^a-zA-Z0-9_]/;
    if (invalidNodePattern.test(source) || invalidNodePattern.test(target)) {
      throw `⚠️ Error at line ${
        index + 1
      }: Node names should contain only letters, numbers, and underscores.\n➤ Found: 'source="${source}", target="${target}"'.`;
    }

    // ✅ Error: Prevent duplicate edges
    const edgeId = `${source}-${interaction}-${target}`;
    if (edges.has(edgeId)) {
      throw `⚠️ Error at line ${
        index + 1
      }: Duplicate edge detected ('${edgeId}').\n➤ Remove duplicate edges to avoid redundancy.`;
    }

    // ✅ Add nodes to the set
    nodes.add(source);
    nodes.add(target);

    // ✅ Add edge to the map
    edges.set(edgeId, {
      data: {
        id: edgeId,
        source: source,
        target: target,
        interaction: interaction, // Optional: Store interaction type
      },
    });
  });

  // ✅ Convert nodes set to Cytoscape.js format
  const cytoscapeNodes = Array.from(nodes).map((node) => ({
    data: { id: node },
  }));

  // ✅ Create Cytoscape.js JSON
  return {
    elements: {
      nodes: cytoscapeNodes,
      edges: Array.from(edges.values()),
    },
  };
}

async function excelToCytoJson(file) {
  try {
    const workbook = await excelReader(file);
    const cytoJson = excelReadToJson(workbook);
    console.log(cytoJson);
    return cytoJson;
  } catch (error) {
    alert(`${error.message || error}`);
    window.location.href = "/upload";
  }
}

function excelReader(file) {
  return new Promise((resolve, reject) => {
    if (!(file instanceof File)) {
      return reject("Invalid file input. Please upload a valid Excel file.");
    }

    const reader = new FileReader();

    reader.onload = function (e) {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });

        if (!workbook || !workbook.SheetNames.length) {
          return reject("❌ The uploaded file contains no sheets.");
        }

        resolve(workbook);
      } catch (error) {
        reject("❌ Failed to read the Excel file.");
      }
    };

    reader.onerror = () => reject("❌ Error reading the file.");
    reader.readAsArrayBuffer(file);
  });
}

function excelReadToJson(workbook) {
  let nodes = [];
  let edges = [];
  let nodeIds = new Set();

  let sheetNames = workbook.SheetNames;
  let nodeSheet, edgeSheet;

  if (sheetNames.includes("Nodes") && sheetNames.includes("Edges")) {
    nodeSheet = XLSX.utils.sheet_to_json(workbook.Sheets["Nodes"]);
    edgeSheet = XLSX.utils.sheet_to_json(workbook.Sheets["Edges"]);
  } else {
    let firstSheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetNames[0]]);
    if (!firstSheet.length) {
      throw "❌ Error: Excel sheet is empty.";
    }

    if (firstSheet.some((row) => row.group)) {
      nodeSheet = firstSheet.filter((row) => row.group === "nodes");
      edgeSheet = firstSheet.filter((row) => row.group === "edges");
    } else {
      nodeSheet = firstSheet.filter((row) => row.id);
      edgeSheet = firstSheet.filter((row) => row.source && row.target);
    }
  }

  if (!nodeSheet.length) throw "❌ Error: No valid nodes found.";
  if (!nodeSheet.every((row) => row.id))
    throw "❌ Error: Every node must have an 'id'.";

  nodeSheet.forEach((row) => {
    let nodeId = String(row.id).trim();
    if (nodeIds.has(nodeId))
      throw `❌ Error: Duplicate node ID found: '${nodeId}'`;
    nodeIds.add(nodeId);

    let nodeData = { ...row };
    delete nodeData.group;
    nodes.push({ data: nodeData });
  });

  if (!edgeSheet.length) throw "❌ Error: No valid edges found.";
  if (!edgeSheet.every((row) => row.source && row.target))
    throw "❌ Error: Every edge must have 'source' and 'target'.";

  edgeSheet.forEach((row, index) => {
    let src = String(row.source).trim();
    let tgt = String(row.target).trim();

    if (!nodeIds.has(src))
      throw `❌ Error: Edge ${
        index + 1
      } references non-existent source '${src}'.`;
    if (!nodeIds.has(tgt))
      throw `❌ Error: Edge ${
        index + 1
      } references non-existent target '${tgt}'.`;

    let edgeData = { ...row, id: row.id || `edge_${index}` };
    delete edgeData.group;
    edges.push({ data: edgeData });
  });

  return { elements: { nodes, edges } };
}
