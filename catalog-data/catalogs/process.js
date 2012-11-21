var Q = require('q'),
	fs = require('fs');

var process = function(filePath, file, opts) {
	var self = this,
		db = opts.db,
		deferred = Q.defer();

	fs.readFile(filePath + "\\" + file, function(err, data) {
		if (err) {
			console.log(["Error reading file.", err]);
			deferred.reject(new Error(err));
		}
		var id = getId(file);
		var record = { _id : id, groups : JSON.parse(data).groups };

		db.collection("catalogs", function(err, collection) {
			if (err) {
				console.log(["Error selecting collection.", err]);
				deferred.reject(new Error(err));
			}
			collection.update({ _id : id }, record, {safe : true, upsert : true}, function(err, doc) {
				if (err) {
					console.log(["Error writing to db.", err]);
					deferred.reject(new Error(err));
				}
				deferred.resolve(file);
			});
		});
	});

	return deferred.promise;
}; 

var getId = function(file)  {
	s = file.split(".");
	return s[0];
}; 

module.exports = process;
