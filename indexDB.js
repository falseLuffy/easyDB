export default function easyDB(dbName,storeName, version) {
  this.db_Name = dbName;
  this.db_version = version;

  this.storeName = storeName;

  this.db = '';

  this.promise = '';

  this.indexedDB = window.indexedDB || window.msIndexedDB || window.mozIndexedDB || window.webkitIndexedDB;
}

easyDB.prototype._open = function () {
  this.promise = new Promise(function (resolve, reject) {
    var request = this.indexedDB.open(this.db_Name, this.db_version);
    request.onerror = function (e) {
      console.log('error');
    }
    request.onsuccess = function (e) {
      this.db = e.target.result;
      resolve();
    }.bind(this);
    request.onupgradeneeded = function (e) {
      this.db = e.target.result;
      if (!this.db.objectStoreNames.contains(this.storeName)) {
        var objectStore = this.db.createObjectStore(this.storeName, {keyPath: 'id'})
      }
    }.bind(this)
  }.bind(this))

};
easyDB.prototype._getTransaction = function () {
  var transaction = this.db.transaction([this.storeName], 'readwrite');
  return transaction.objectStore(this.storeName, {keyPath: 'id'});
};

easyDB.prototype.add = function (data) {
  this._open();
  this.promise.then(function (value) {
    var objectStore = this._getTransaction();

    var request = objectStore.add(data);
    request.onerror = function (e) {
      console.log(e.target.error);
      this.db.close()
    }.bind(this);
    request.onsuccess = function (e) {
      this.db.close()
    }.bind(this)

  }.bind(this))
};

easyDB.prototype.put = function (data) {
  this._open();
  this.promise.then(function (value) {
    var objectStore = this._getTransaction();
    var request=null;
    if (data.length) {
      for (var k in data) {
        request = objectStore.put(data[k])
      }
    } else {
      request= objectStore.put(data);
    }
    request.onsuccess = function () {
      this.db.close();
    }.bind(this);
  }.bind(this))
}

easyDB.prototype.get = function (index) {
  this._open();
  this.promise.then(function () {
    var objectStore = this._getTransaction();
    var request = objectStore.get(index);
    request.onsuccess = function (e) {
      console.log(e.target.result);
      this.db.close();
    }
  }.bind(this))
};

easyDB.prototype.getAll = function (fn) {
  this._open();
  this.promise.then(function (value) {
    var tmpArr = [];
    var objectStore = this._getTransaction();
    objectStore.openCursor().onsuccess = function (event) {
      var cursor = event.target.result;
      if (cursor) {
        tmpArr.push(cursor.value);
        cursor.continue();
      } else {
        console.log('already empty');
        fn(tmpArr);
      }
      this.db.close();
    }.bind(this);
  }.bind(this))
};

easyDB.prototype.delete = function (index) {
  this._open();
  this.promise.then(function (value) {
    var objectStore = this._getTransaction();
    var request = objectStore.delete(index)
    request.onsuccess = function () {
      console.log('删除成功');
      this.db.close();
    }.bind(this)
  }.bind(this))
};

easyDB.prototype.deleteAll = function () {
  this.indexedDB.deleteDatabase(this.db_Name)
};
