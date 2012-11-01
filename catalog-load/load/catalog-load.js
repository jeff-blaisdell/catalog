var fs = require('fs'),
    util = require('util'),
    async = require('async'),
    DataLoad = require('./data-load');

var CatalogLoad = function(opts) {
	this.db = opts.db;
	this.loadFilePathRoot = opts.loadFilePathRoot;
	this.loadFilePath = this.loadFilePathRoot + "catalogs\\";
	this.databaseTable = "catalogs";
};  

CatalogLoad.prototype = new DataLoad();

CatalogLoad.prototype.constructor  = CatalogLoad;

CatalogLoad.prototype.load = function() {
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

module.exports = CatalogLoad;

var loadFile = function(file) {
	console.log(file);
	fs.readFile(file, function (err, data) {
  		if (err) {
  			handleException(err);
  		}
  		var response = JSON.parse(data);
  		if ("Successful" === response.responseCode) {
  			var groups = response.groups;
  			
  		}
	});
};

var handleException = function(err) {
	console.log("Failure.");
	console.log(err);
	throw err;
};
