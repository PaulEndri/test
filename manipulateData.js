const data = require('./data.json');
const fs = require('fs');
const jsonFormat = require('json-format');

const JSON_CONFIG = {
	type : 'space',
	size : 4
};
const CLOTHING_KEYS = [
	'#Dresses',
	'#Tops',
	'#Bottoms',
	'#Hats',
	'#Accessories',
	'#Umbrellas',
	'#Footwear'
];

const Clothing = CLOTHING_KEYS.reduce((clothing, type) => {
	return [ ...clothing, ...data[type].map((i) => ({ ...i, Type: type.substr(1) })) ];
}, []);

console.log(Clothing);

const createFile = (name, data) => {
	fs.writeFileSync(name, jsonFormat(data, JSON_CONFIG));
};

createFile('./clothing.json', Clothing);
Object.keys(data).forEach((k) => {
	if (CLOTHING_KEYS.indexOf(k) < 0) {
		if (k === '#K.K.' || k === '#Fossils') {
			return;
		}

		createFile(`./${k.replace('#', '')}.json`, data[k]);
	}
});
