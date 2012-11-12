var fs = require('fs'),
	_ = require('underscore'),
    async = require('async'),
    events = require('events');

var DataLoad = function(opts) {
	this.files = [];
	this.rootPath = opts.rootFilePath;
	this.db = opts.db;
	this.opts = opts;
};

DataLoad.prototype = new events.EventEmitter;

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


