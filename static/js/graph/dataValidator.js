export default function dataValidator(json) {
  // Check if the JSON is of type 1
  if (Array.isArray(json) && json.length > 0 && json[0].group === "nodes") {
    return json; // Type 1
  }
  // Check if the JSON is of type 2
  else if (
    json.elements &&
    json.elements.nodes &&
    Array.isArray(json.elements.nodes)
  ) {
    return json.elements;
  }
  // If neither type matches, return -1 (invalid type)
  else {
    return -1;
  }
}
