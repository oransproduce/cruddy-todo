const fs = require('fs');
const path = require('path');
const _ = require('underscore');
const counter = require('./counter');
const Promise = require('bluebird');



// Public API - Fix these CRUD functions ///////////////////////////////////////

exports.create = (text, callback) => {
  var id = counter.getNextUniqueId((err, id) => {
    if (err) {
      console.log('cannot read');
    } else {
      fs.writeFile(path.join(exports.dataDir, `${id}.txt`), text, (err) => {
        if (err) {
          console.log('cant create file: ', err);
        } else {
          return callback(null, { id, text });
        }
      });
    }
  });
};
//  1) should return an empty array when there are no todos
// // create results arr
// let todos = [];
// // Node.js | fs.readdir() Method lowercaseeeee dir
// fs.readdir(exports.dataDir, (err, files) => {
//   if (err) {
//     console.log('Cannot read folder');
//   } else {
//     files.forEach(fileName => {
//       let id = fileName.slice(0, 5);
//       let todo = {id: id, text: id};
//       todos.push(todo);
//     });
//     callback(err, todos);
//   }
// });
//      2) should return an array with all saved todos
const PromisifiedReadFileAsync = Promise.promisify(fs.readFile);
exports.readAll = (callback) => {
  let readdirAsync = Promise.promisify(fs.readdir);
  readdirAsync(exports.dataDir).then((files) => {
    var promiseArray = files.map((fileName) => {
      return PromisifiedReadFileAsync(
        path.join(exports.dataDir, fileName)
      ).then((data) => {
        return { id: fileName.slice(0, 5), text: data.toString() };
      }).catch((err) => {
        callback(err);
      });
    }); return Promise.all(promiseArray).then((results) => {
      callback(null, results);
    });
  });
};

exports.readOne = (id, callback) => {
  fs.readFile(path.join(exports.dataDir, `${id}.txt`), (err, data) => {
    if (err) {
      callback(err);
    } else {
      callback(null, {id: id, text: data.toString()});
    }
  });
};

exports.update = (id, text, callback) => {
  // var item = items[id];
  // if (!item) {
  //   callback(new Error(`No item with id: ${id}`));
  // } else {
  //   items[id] = text;
  //   callback(null, { id, text });
  // }

  fs.readFile(path.join(exports.dataDir, `${id}.txt`), (err, data) => {
    if (err) {
      callback(err);
    } else {
      fs.writeFile(path.join(exports.dataDir, `${id}.txt`), text, (err) => {
        if (err) {
          callback(err);
        } else {
          callback(null, {id: id, text: text});
        }
      });
    }
  });
};


// 15 passing (69ms)
// 3 failing
exports.delete = (id, callback) => {
  // var item = items[id];
  // delete items[id];
  // if (!item) {
  //   // report an error if item not found
  //   callback(new Error(`No item with id: ${id}`));
  // } else {
  //   callback();
  // }
  fs.unlink(path.join(exports.dataDir, `${id}.txt`), (err) => {
    if (err) {
      callback(err);
    } else {
      callback();
    }
  });
};

// Config+Initialization code -- DO NOT MODIFY /////////////////////////////////

exports.dataDir = path.join(__dirname, 'data');

exports.initialize = () => {
  if (!fs.existsSync(exports.dataDir)) {
    fs.mkdirSync(exports.dataDir);
  }
};
