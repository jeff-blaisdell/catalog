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
		var record = { _id : id, product : JSON.parse(data).product };
		console.log(["RECORD: ", record]);

		db.collection("products").update(record, {safe : true, upsert : true}, function(err, doc) {
			if (err) {
				console.log(["Error writing to db.", err]);
				deferred.reject(new Error(err));
			}			
			deferred.resolve(file);
		});

	});

	return deferred.promise;
};

var getId = function(file)  {
	s = file.split(".");
	return s[0];
}; 

module.exports = process;
