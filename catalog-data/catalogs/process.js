var fs = require('fs');

var process = function(file, callback) {
	var self = this;
	var db = self.db;

	fs.readFile(file, function(err, data) {
		if (err) {
			throw err;
		}
		var i = file.lastIndexOf("\\");
		var fileName = file.substr(i, file.lenth).split(".");
		var id = fileName[0];
		var record = { _id : id, groups : JSON.parse(data).groups };
		db.collection("catalogs").update(record, {safe : true, upsert : true}, function(err, doc) {
			callback.call(self, file);
		});
	});
};  

module.exports = process;
