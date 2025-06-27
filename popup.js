// IndexedDB setup
let db;
const request = indexedDB.open("MyDB", 1);

request.onerror = function(event) {
  document.getElementById('result').textContent = "Error opening DB";
};

request.onsuccess = function(event) {
  db = event.target.result;
};

request.onupgradeneeded = function(event) {
  db = event.target.result;
  db.createObjectStore("data", { keyPath: "id" });
};

document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('saveBtn').addEventListener('click', function() {
    const tx = db.transaction("data", "readwrite");
    const store = tx.objectStore("data");
    store.put({ id: 1, value: "Hello from IndexedDB!" });
    document.getElementById('result').textContent = "Data saved!";
  });

  document.getElementById('loadBtn').addEventListener('click', function() {
    const tx = db.transaction("data", "readonly");
    const store = tx.objectStore("data");
    const getReq = store.get(1);
    getReq.onsuccess = function() {
      document.getElementById('result').textContent = getReq.result ? getReq.result.value : "No data found";
    };
  });
}); 