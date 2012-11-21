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
		renameFile(self.filePath+ "\\" + file, self.filePath+ "\\" + file.replace(/.inprocess/, ".complete"))
		.then(function() {
			self.file = self.file + ".complete";
			console.log("File processed. " + self.file);
		deferred.resolve(self.file);			
		})
		.fail(function(error) {
			console.log(error);
			throw error;
		})	
		.done();


	})
	.done();

	return deferred.promise;
};

module.exports = Process;
