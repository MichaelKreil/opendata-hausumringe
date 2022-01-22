"use strict"

const fs = require('fs')
const yaml = require('yaml')
const mustache = require('mustache')

process.chdir(__dirname)

let data = fs.readFileSync('../data/bundeslaender.yaml', 'utf8')
data = yaml.parse(data);

let result = {
	columns: ['Hausumringe', 'Hauskoordinaten']
}

result.bundeslaender = Object.entries(data).map(([key,value]) => {
	value.name = key;
	value.columns = [
		prepare(value.Hausumringe),
		prepare(value.Hauskoordinaten),
	];
	
	return value;

	function prepare(obj) {
		switch (obj.license) {
			case 'DL-DE-0': 
				obj.color = '#009640';
				obj.licenseLabel = 'DL-DE-0';
			break;
			case 'DL-DE-BY': 
				obj.color = '#76b82a';
				obj.licenseLabel = 'DL-DE-BY';
			break;
			case 'proprietary': 
				obj.color = '#f08482';
				obj.licenseLabel = 'proprietär';
			break;
			default:
				console.error(`Unknown license "${obj.license}"`)
		}
		return obj;
	}
})

//console.log(data);

let svg = fs.readFileSync('../data/map.svg', 'utf8');

result.mapUmringe = svg.replace(/id=\"(.*?)\"/g, (a,b) => 'fill="'+data[b].Hausumringe.color+'"')
result.mapKoordinaten = svg.replace(/id=\"(.*?)\"/g, (a,b) => 'fill="'+data[b].Hauskoordinaten.color+'"')

let html = fs.readFileSync('../data/index.template', 'utf8');
html = mustache.render(html, result);
fs.writeFileSync('../docs/index.html', html);
