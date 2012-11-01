var fs = require('fs'),
    util = require('util'),
    async = require('async'),
    DataLoad = require('./data-load');

var ProductLoad = function(opts) {
	this.db = opts.db;
	this.loadFilePathRoot = opts.loadFilePathRoot;
	this.loadFilePath = this.loadFilePathRoot + "product\\";
	this.databaseTable = "products";
};  

ProductLoad.prototype = new DataLoad();

ProductLoad.prototype.constructor  = ProductLoad;

ProductLoad.prototype.load = function(opts) {
	var self = this;

	fs.readdir(self.loadFilePath, function(err, files) {

		if (err) {
			console.log("Could not read loadFilePath : " + self.loadFilePath);
			console.log(err);
			throw err;
		}

		if (files) {
			async.forEach(files, loadFile, function(err) {
				console.log("Unable to load affiliate catalogs.");
				console.log(err);
			});
		}
	});

};

module.exports = ProductLoad;

var loadFile = function(file) {
	console.log(file);
}