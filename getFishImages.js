const fs = require('fs');
const jsonFormat = require('json-format');
const FISH = require('./fish.json');
const cheerio = require('cheerio');
const fetch = require('node-fetch');
const Axios = require('axios');

const URL = 'https://nookipedia.com/wiki/File:{{FISH_NAME}}_HHD_Icon.png';
const JSON_CONFIG = {
	type : 'space',
	size : 4
};

const downloadFile = async (name) => {
	const pageRes = await fetch(URL.replace('{{FISH_NAME}}', name));
	const pageHtml = await pageRes.text();
	console.log('[Success] Fetched Page For', name);
	const $ = cheerio.load(pageHtml);
	const img = $('#file > a > img').attr('src');
	const imageUrl = `https://nookipedia.com/${img}`;

	await new Promise(async (resolve, reject) => {
		const writer = fs.createWriteStream(`images/fish/${name}.png`);

		const response = await Axios({
			url          : imageUrl,
			method       : 'GET',
			responseType : 'stream'
		});

		console.log('[Success] Fetched Image For', name);

		response.data.pipe(writer);

		return new Promise((resolve, reject) => {
			writer.on('finish', resolve);
			writer.on('error', reject);
		});
	});
};

Promise.all(
	FISH.map((fish, i) => {
		return new Promise((resolve) => {
			setTimeout(() => {
				downloadFile(fish.Name).then(() =>
					resolve().catch((e) => {
						console.log('[ERROR FOR]', fish.name, e);
					})
				);
			}, i * 100);
		});
	})
).then((x) => console.log('[done]'));
