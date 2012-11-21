var Q = require('q'),
	events = require('events');

var Process = function(filePath, file, processor, opts) {
	this.filePath = filePath;
	this.file = file;
	this.processor = processor;
	this.opts = opts;
};

Process.prototype = new events.EventEmitter;

Process.prototype.execute = function() {
	var self = this,
		deferred = Q.defer(),
		fn = Q.nbind(self.processor);

	fn.call(self, self.filePath, self.file, self.opts)

	/**
	 * Executor callback.
	 */		
	.then(function(file) {
		console.log("File Processed. " + self.filePath + "\\" + self.file);
		deferred.resolve(file);
	})

	/**
	 * Handle any exceptions.
	 */		
	.fail(function(error) {
		console.log(error);
		throw error;
	})	

	/**
	 * Terminate promise chain.
	 */	
	.done();

	return deferred.promise;
};

module.exports = Process;