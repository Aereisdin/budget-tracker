
const request = indexedDB.open('budgetDB', 1);

var db;

request.onupgradeneeded = function (event) {
    const { oldVersion } = event;
    const newVersion = event.newVersion || db.version;

    db = event.target.result;

    if (db.objectStoreNames.length === 0){
        db.createObjectStore('BudgetStore', { autoIncrement: true });
    }
};

request.error = function (event) {
    console.error(`Your error is ${event.target.errorCode}`);
};

function chkDB() {
    var transaction = db.transaction(['BudgetStore'], 'readwrite');
    var store = transaction.objectStore('BudgetStore');
    var getAll = store.getAll();

    getAll.onsuccess = function () {
        if (getAll.result.length > 0){
            fetch('api/transaction/bulk', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept : 'application/json, text/plain, */*',
                    'Content-Type' : 'application/json',
                },
            })
            .then((response) => response.json)
            .then((response) => {
                if (response.length !== 0){
                    var transaction = db.transaction(['BudgetStore'], 'readwrite');
                    var currentStore = transaction.objectStore('BudgetStore');
                    currentStore.clear();
                }
            })
            .catch(error =>
                response.json(error));
        }
    }
}

request.onsuccess = function (event) {
    db = event.target.result;
    if (navigator.onLine) {
        chkDB();
    }
};

const saveRecord = (record) => {
    let transaction = db.transaction(['BudgetStore', 'readwrite']);
    let store = transaction.objectStore('BudgetStore');
    store.add(record);
};

window.addEventListener('onLine', chkDB);