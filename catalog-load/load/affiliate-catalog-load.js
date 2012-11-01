var fs = require('fs'),
    util = require('util'),
    async = require('async'),
    DataLoad = require('./data-load');

var AffiliateCatalogLoad = function(opts) {
	this.db = opts.db;
	this.loadFilePathRoot = opts.loadFilePathRoot;
	this.loadFilePath = this.loadFilePathRoot + "affiliate-catalogs\\";
	this.databaseTable = "affiliate_catalogs";
};  

util.inherits(AffiliateCatalogLoad, DataLoad);

AffiliateCatalogLoad.prototype.load = function() {
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

module.exports = AffiliateCatalogLoad;

var loadFile = function(file) {
	console.log(file);
}



