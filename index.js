const cheerio = require('cheerio');
const fetch = require('node-fetch');
const fs = require('fs');
const jsonFormat = require('json-format');

const JSON_CONFIG = {
	type : 'space',
	size : 4
};
const LIST_OF_VILLAGERS_URL = 'https://nookipedia.com/wiki/List_of_villagers';
const BASE_URL = 'https://nookipedia.com';
const MS_DELAY = 100;
const SELECTORS = {
	"Name": "#Infobox-villager > tbody > tr:nth-child(1) > th > big > big",
	"Species": "#Infobox-villager-species > a",
	"Personality": "#Infobox-villager-personality > a",
	"Gender": "#Infobox-villager-gender",
	"Birthday": "#Infobox-villager-birthday > a",
	"Star Sign": "#Infobox-villager-starsign > a.mw-redirect",
	"Initial Phrase": "#Infobox-villager-phrase",
	"Initial Clothes": "#Infobox-villager-clothes",
	"Favorite Saying": "#Infobox-villager-song",
}
const IMAGE
const getList = () => {
	return fetch(LIST_OF_VILLAGERS_URL).then((res) => res.text()).then((html) => {
		const $ = cheerio.load(html);

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
	});
};

const parseInfo = ($, selector) => {
    return $(selector).text().trim();
}

const parseInfoTable = (name, href) => {
    const $table = $("#In_New_Leaf").parent().next("table").find('td:first table').children();

    const core = {
        
    }


}
getList()
	.then((data) => {
		fs.writeFileSync('listOfVillagers.json', jsonFormat(data, JSON_CONFIG));

		return data;
	})
	.then((data) => {
        const promises = data.map(({name, href}, index) => {
            return new Promise((resolve) => {

            })
        })
    });
