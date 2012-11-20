var fs = require('fs'),
	_ = require('underscore'),
	Q = require('q'),
	Process = require('../model/process'),
    async = require('async'),
    events = require('events'),
    readDir = Q.nbind(fs.readdir),
    renameFile = Q.nbind(fs.rename);



var DataLoad = function(opts) {
	this.files = [];
	this.rootPath = opts.rootFilePath;
	this.db = opts.db;
	this.opts = opts;
};

DataLoad.prototype = new events.EventEmitter;


DataLoad.prototype.load = function() {

	var self = this;
	var rootPath = self.rootPath;
	var getProcesses = Q.nbind(FN.getProcesses, self);

	readDir.call(self, rootPath)
	.then(getProcesses)
	.then(function(processes) {
		processes.forEach(function(p) {
			console.log(p);
		});
	})
	.fail(function(error) {
		console.log(error);
		throw error;
	})
	.done();

	self.emit("files-loaded");
};

var FN = {
	processFolder : function(folder) {
		var self = this;
		var rootPath = self.rootPath;
		var processor = require(rootPath + folder + "\\process.js");
		readDir.call(self, rootPath + folder)
		.then(function(files) {
			return files.filter(function(file) {
				if (file.match(/.*\.json.inprocess$/)) {
					return true;
				} else if (file.match(/.*\.json$/)) {
					renameFile.call(file, rootPath + folder + "\\" + file, rootPath + folder + "\\" + file + ".inprocess")
					.then(function() {
						file = file + ".inprocess";
						return true;
					})
					.done();
				}
				return false;
			});
		})
		.then(function(files) {
			var x = files.map(function(file) {
				return new Process(rootPath + folder, file, processor);
			});
			processes = processes.concat(x);
			console.log(processes.length);
		})
		.fail(function(error) {
			console.log(error);
			throw error;
		})
		.done();		
	},
	getProcesses : function(folders) {
		var self = this;
		var deferred = Q.defer();
		var rootPath = self.rootPath;
		var fn = Q.nbind(FN.processFolder, self);

		return Q.fcall(function() {
			var processes = [];
			var promises = [];
			folders.forEach(function(folder) {
				promises.push(
					Q.fcall(fn, folder)
				);
			});
			Q.all(promises)
			.then(function() {
				console.log(processes);
				return processes;
			})
			.done();
		});
	}

};

















DataLoad.prototype.start = function() {
	var self = this;
	_.bind(initialize, self)();
};	

module.exports = DataLoad;

var initialize = function() {
	var self = this;

	var folders = fs.readdirSync(self.rootPath);
	if (folders) {
		for (var f in folders) {
			var folder = folders[f];
			var process = _.bind(require(self.rootPath + folder + "\\process.js"), self);
			var files = fs.readdirSync(self.rootPath + folder);
			_.bind(processFiles, self)(folder, files, process);
		}

		var loadCount = 0;
		var totalCount = self.files.length;
		self.on("file-loaded", function() {
			loadCount++;
			if (loadCount === totalCount) {
				self.emit("files-loaded");
			}
		});

		if (self.files.length === 0) {
			self.emit("files-loaded");
		}

		async.forEach(self.files, _.bind(processFile, self), function(err) {
			if (err) {
				throw err;
			}
		});
	}
};

var processFiles = function(folder, files, processor) {
	var self = this;
	if (files) {
		for (var i = files.length - 1; i >= 0; i--) {
			var f = files[i];
			var filePath = self.rootPath + folder + "\\" + f;
			var file = {};
			if (f.match(/.*\.json.inprocess$/)) {
				file.file = filePath;
				file.processor = processor;
			} else if (f.match(/.*\.json$/)) {
				fs.renameSync(filePath, filePath + ".inprocess")
				file.file = filePath + ".inprocess";
				file.processor = processor;
			} else {
				continue;
			}
			self.files.push(file);
		}
	}
};

var processFile = function(file, callback) {
	var self = this;
	var fn = file.processor;
	var f = file.file;

	_.bind(fn, self)(f, function(file) {
		var self = this;
		fs.rename(file, file.replace(".inprocess", ".complete"));
		self.emit("file-loaded");
	});
};


