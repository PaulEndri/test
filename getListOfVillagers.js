const cheerio = require('cheerio');
const fetch = require('node-fetch');
const fs = require('fs');
const jsonFormat = require('json-format');

const JSON_CONFIG = {
	type : 'space',
	size : 4
};
const LIST_OF_VILLAGERS_URL = 'https://nookipedia.com/wiki/List_of_villagers';

const getList = async () => {
	const res = await fetch(LIST_OF_VILLAGERS_URL);
	const txt = await res.text();
	const $ = cheerio.load(txt);

	return $('#mw-content-text > div > table > tbody > tr')
		.filter((index, item) => $(item).find('td:nth-child(11)').hasClass('table-yes'))
		.toArray()
		.map((item) => {
			const text = $(item).find('th:nth-child(2) a');

			return {
				name : text.text(),
				href : text.attr('href')
			};
		});
};

module.exports = getList()
	.then((data) => {
		fs.writeFileSync('listOfVillagers.json', jsonFormat(data, JSON_CONFIG));

		return data;
	})
	.then((data) => {
		console.log('[Got List]', data.length);

		return data;
	});
