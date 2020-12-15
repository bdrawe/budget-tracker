//create variable to hold db connections
let db;
//establish a connection to IndexedDB database called 'pizza_hunt and set it to version 1
const request = indexedDB.open('budget-tracker',1);
//this event will emit if the database version changes (nonexistant to version 1, v1 to v2 etc.)
request.onupgradeneeded = function(event) {
    //save a ref to the database
    const db = event.target.result;
    //create an object store (table) called `new_pizza`, set it to have an auto incrementing primary key of sorts
    db.createObjectStore('new_record', { autoIncrement: true});
};

request.onsuccess = function(event){
    //when db is successfully created with its object store (from onupgradedneeded event above) or simply established a connection save referecence to db in global variable
    db = event.target.result;

    //check if app is online, if yes run uploadPizza() function to send all local db data to api
    if (navigator.onLine) {
        uploadRecord();
    }
};

request.onerror = function(event) {
    console.log(event.target.errorCode);
};

//this function will be executed if we attempt to submit  a new pizza if there is no internet connection
function saveRecord(record) {
    //open a new transaction with the database with read and write permissions
    const transaction = db.transaction(['new_record'], 'readwrite');

    //access the object store for `new_pizza`
    const recordObjectStore = transaction.objectStore('new_record');

    //add record to your store with add method
    recordObjectStore.add(record);
};

function uploadPizza() {
    //open a transaction on your db
    const transaction = db.transaction(['new_record'], 'readwrite');

    //access your object store
    const recordObjectStore = transaction.objectStore('new_record');

    //get all records from store and set to a variable
    const getAll = recordObjectStore.getAll();

    //upon a successful .getAll() execution, run this function
    getAll.onsuccess = function() {
        //if there was data in indexedDb's store, let's sent it to the api server
       if(getAll.result.length > 0) {
           fetch('/api/transaction', {
               method: 'POST',
               body: JSON.stringify(getAll.result),
               headers: {
                   Accept: 'application/json, text/plain, */*',
                   'Content-Type': 'application/json'
               }
           })
           .then(response => response.json())
           .then(serverResponse => {
               if (serverResponse.message) {
                   throw new Error(serverResponse);
               }
               //open one more transaction
               const transaction = db.transaction(['new_record'], 'readwrite');
               //access the new_pizza object store
               const recordObjectStore = transaction.objectStore('new_record');
               recordObjectStore.clear();

               alert('All records were updated. You are now online');
           })
           .catch(err => {
               console.log(err);
           });
       } 
       else if(getAll.result.length > 1) {
           fetch('/api/transaction/bulk',{
               method: 'POST',
               body: JSON.stringify(getAll.result),
               headers: {
                   Accept: 'application/json, text/plain, */*',
                   'Content-Type': 'application/json'
               }
           })
           .then(response => response.json())
           .then(serverResponse => {
               if(serverResponse.message) throw new Error(serverResponse);

               const transaction = db.transaction(['new_record'], 'readwrite');
               const recordObjectStore = transaction.objectStore('new_record');
               recordObjectStore.clear();

               alert('All records were updated. You are now online');
           })
           .catch(err => console.log(err));
       }
    }
};
//listen for app coming back online
window.addEventListener('online', uploadPizza);