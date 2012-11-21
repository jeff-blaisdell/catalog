var Q = require('q'),
	fs = require('fs'),
	events = require('events'),
	renameFile = Q.nbind(fs.rename);

var Process = function(filePath, file, processor, opts) {
	this.filePath = filePath;
	this.file = file;
	this.processor = processor;
	this.opts = opts;
};

Process.prototype = new events.EventEmitter;

Process.prototype.execute = function() {
	var self = this,
		deferred = Q.defer();

	self.processor(self.filePath, self.file, self.opts)
	.then(function(file) {
		PRIVATE.markComplete(self.filePath, self.file)
		.then(function(file) {
			deferred.resolve(file);	
		})
	})
	.fail(function(error) {
		console.log(error);
		throw error;
	})	
	.done();

	return deferred.promise;
};

module.exports = Process;



var PRIVATE = {
	markComplete = function(filePath, file) {

		var deferred = Q.defer();
		var fileComplete = file.replace(/.inprocess/, ".complete");

		renameFile(filePath+ "\\" + file, filePath+ "\\" + fileComplete)
		.then(function() {
			console.log("File processed. " + fileComplete);
			deferred.resolve(fileComplete);		
		})
		.fail(function(error) {
			console.log(error);
			throw error;
		})	
		.done();

		return deferred.promise;
	}
};
