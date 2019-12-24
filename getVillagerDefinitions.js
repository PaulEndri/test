const cheerio = require('cheerio');
const fetch = require('node-fetch');
const VILLAGER_LIST = require('./listOfVillagers.json');
const fs = require('fs');
const jsonFormat = require('json-format');

const JSON_CONFIG = {
	type : 'space',
	size : 4
};

const FANDOM_URL = 'https://animalcrossing.fandom.com/wiki/';
const BASE_URL = 'https://nookipedia.com';
const MS_DELAY = 100;
const SELECTORS = {
	Name              : '#Infobox-villager > tbody > tr:nth-child(1) > th > big > big',
	Species           : '#Infobox-villager-species > a',
	Personality       : '#Infobox-villager-personality > a',
	Gender            : '#Infobox-villager-gender',
	Birthday          : '#Infobox-villager-birthday > a',
	'Star Sign'       : '#Infobox-villager-starsign > a.mw-redirect',
	'Initial Phrase'  : '#Infobox-villager-phrase',
	'Initial Clothes' : '#Infobox-villager-clothes',
	'Favorite Saying' : '#Infobox-villager-song'
};

const COFFEE_KEYS = [ 'Type', 'Milk', 'Sugar' ];
const REMOVE_KEYS = [ 'Favorite Saying', 'Initial Phrase' ];
const GIFT_KEYS = [ 'Name', 'Price', 'Source' ];

const parseInfo = ($, selector, remove = false) => {
	let $elem = $(selector);

	if (remove) {
		$elem.children().remove();
	}

	return $elem.text().trim();
};

const delay = async (index) => {
	return new Promise((resolve) => {
		setTimeout(() => resolve(), index * MS_DELAY);
	});
};

const tryAdditionalData = async (name) => {
	const additional = {};

	try {
		const res = await fetch(`${FANDOM_URL}${name}`);
		const text = await res.text();
		const $ = cheerio.load(text);

		const $song = $("td b:contains('Favorite song')");
		const $style = $("td b:contains('Style')");

		if ($song.length > 0) {
			additional.Song = $song.parent().next('td').text().trim();
		}

		if ($style.length > 0) {
			additional.Style = $style.parent().next('td').text().trim();
		}

		return additional;
	} catch (e) {
		console.log('Unable to get additional data for', name);

		return additional;
	}
};

const parseInfoTable = async ({ name, href }, index) => {
	const villager = {
		Name      : name,
		Url       : `${BASE_URL}${href}`,
		Biography : {},
		Favorites : {},
		Coffee    : {},
		Gifts     : []
	};

	await delay(index);
	console.log(`[Pinging] Call #${index} for ${name} with url ${href}`);
	const res = await fetch(villager.Url);
	const txt = await res.text();
	console.log('[Pinging succeeded]');
	const $ = cheerio.load(txt);
	const $parentTable = $('#In_New_Leaf, #In_Welcome_amiibo').parent().next('table');
	const $tables = $parentTable.find('td:first-child table table:not(:first-child)');
	const $bio = $($tables[0]);
	const $fav = $($tables[1]);
	const $giftsTable = $parentTable.find('td:not(:first-child) table.sortable tbody tr');

	Object.entries(SELECTORS).forEach(([ key, val ]) => {
		villager[key] = parseInfo($, val, REMOVE_KEYS.includes(key));
	});

	$bio.find('tr:not(:first-child)').each((i, elem) => {
		const $elem = $(elem);
		const key = $elem.find('th:first-child').text().trim();
		const val = $elem.find('td').text().trim();

		villager.Biography[key] = val;
	});

	$fav.find('tr:not(:first-child)').each((i, elem) => {
		const $elem = $(elem);
		const key = $elem.find('th:first-child').text().trim();
		const val = $elem.find('td').text().trim();

		if (key.length > 0 && val.length > 0) {
			if (COFFEE_KEYS.includes(key)) {
				villager.Coffee[key] = val;
			} else {
				villager.Favorites[key] = val;
			}
		}
	});

	$giftsTable.each((index, item) => {
		const gift = {};

		$(item).find('td').each((idx, val) => {
			gift[GIFT_KEYS[idx]] = $(val).text().trim();
		});

		if (Object.keys(gift).length > 0) {
			villager.Gifts.push(gift);
		}
	});
	villager.image = $('#Infobox-villager > tbody > tr:nth-child(3) > td > a > img').attr('src');

	return {
		...villager,
		...(await tryAdditionalData(name))
	};
};

const promises = VILLAGER_LIST.map(async (villager, index) => {
	const villagerData = await parseInfoTable(villager, index);
	const formattedData = jsonFormat(villagerData, JSON_CONFIG);

	fs.writeFile(`./villagers/${villager.name.toLowerCase()}.json`, formattedData, (e) => {
		if (e) {
			console.error('[Error] Unable to save file for', villager.name, e);
		} else {
			console.log(`[Success] Created File For ${villager.name}`);
		}
	});

	return villagerData;
});

Promise.all(promises).then((x) => {
	fs.writeFileSync('villagers.json', jsonFormat(x, JSON_CONFIG));

	console.log('[Succcess] Done');
	process.exit(1);
});
