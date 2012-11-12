#Catalog Load
##Description
A node based project which will read json flat files and load a MongoDB backend.  Process will read all directories contained within the rootFilePath location defined in config.json.  All files will be fed through the process.js found in the child directories.

Example json load files can be found within the catalog-data directory.

Directions:

* Install mongodb.
* Start mongodb.
* Edit catalog-load/config/config.json
	* Point rootFilePath attribute to local catalog-data folder.
	* Set any desired mongodb properties.
* From a command prompt navigate to the catalog-load directory.
	* Run 'npm install' this will gather necessary node dependecies which are defined in package.json.
* Run node app.js
* Mongo should now be loaded.
