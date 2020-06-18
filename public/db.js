let db;

// create budget database
const request = window.indexedDB.open("budget", 1)

// create "pending" object store
request.onupgradeneeded = function(event) {
   const db = event.target.result;
   db.createObjectStore("pending", { autoIncrement: true });
 };

 request.onsuccess = function(event) {
    db = event.target.result;
  
    if (navigator.onLine) {
      checkDatabase();
    }
  };

  request.onerror = function(event) {
    console.log("Woops! " + event.target.errorCode);
  };

  // create transaction on pending object store to add record to store
  function saveRecord(record) {
    const transaction = db.transaction(["pending"], "readwrite");
    const pendingStore = transaction.objectStore("pending");
    pendingStore.add(record);
  }

  // create transaction on pending object store to get all records from store
  function checkDatabase() {
    const transaction = db.transaction(["pending"], "readwrite");
    const pendingStore = transaction.objectStore("pending");
    const getAll = pendingStore.getAll();


    getAll.onsuccess = function() {
        if (getAll.result.length > 0) {
          fetch("/api/transaction/bulk", {
            method: "POST",
            body: JSON.stringify(getAll.result),
            headers: {
              Accept: "application/json, text/plain, */*",
              "Content-Type": "application/json"
            }
          })
          .then(response => response.json())
          .then(() => {
            // create transaction on pending object store to clear all records from store
            const transaction = db.transaction(["pending"], "readwrite");
            const pendingStore = transaction.objectStore("pending");
            pendingStore.clear();
          });
        }
      };
    }
    
    window.addEventListener("online", checkDatabase);