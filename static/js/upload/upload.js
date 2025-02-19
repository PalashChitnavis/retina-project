const allowedExtensions = new Set(["json", "csv", "xml", "xls", "xlsx"]);

const dropArea = document.querySelector(".drop_box"),
  button = dropArea.querySelector("button"),
  input = dropArea.querySelector("input");

button.onclick = () => {
  input.click();
};

// perform basic checks
// file size, extension, empty file

input.addEventListener("change", function (e) {
  var fileSize = e.target.files[0].size;
  var fileName = e.target.files[0].name;
  var extension = fileName.slice(((fileName.lastIndexOf(".") - 1) >>> 0) + 2);
  if (!allowedExtensions.has(extension)) {
    alert(
      `Invalid file format found: ${extension}. Please upload: xml,csv, xls, xlsx, json`
    );
    window.location.href = "/upload";
  }
  if (fileSize == 0) {
    alert("File is empty. Please upload a non-empty file.");
    window.location.href = "/upload";
  }
  let filedata = `
    <div class="form">
      <h4>${fileName}</h4>
      <button type="button" class="btn-red" id="goBackBtn">Go Back</button>
      <button type="submit" class="btn" id="uploadBtn">Load File</button>
    </div>`;

  dropArea.innerHTML = filedata;

  document.getElementById("goBackBtn").addEventListener("click", function () {
    window.location.href = "/upload";
  });

  document.getElementById("uploadBtn").addEventListener("click", function () {
    alert("TODO");
  });
});
