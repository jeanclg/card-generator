const querystring = require("querystring");
const { join } = require("path");
const { v1 } = require("uuid");

const puppeteer = require("puppeteer");

// Url do template do card
const BASE_URL =
  "https://erickwendel.github.io/business-card-template/index.html";

function createQueryStringFromObject(data) {
  const separator = null;
  const keyDelimiter = null;
  const options = {
    encodeURIComponent: querystring.unescape,
  };
  // cria a url da query
  const qs = querystring.stringify(data, separator, keyDelimiter, options);

  return qs;
}

async function render({ finalUrl, name }) {
  // Cria a url de todo o caminho até o pdf do card
  const output = join(__dirname, `/../output/${name}-${v1()}.pdf`);

  // Deixando o headless: false isso faz com que abra um novo browser
  const browser = await puppeteer.launch({
    // headless: false,
  });

  // Instancia uma nova pagina no browser
  const page = await browser.newPage();
  // Coloca no browser instanciado a url desejada
  await page.goto(finalUrl, { waitUntil: "networkidle2" });

  await page.pdf({
    path: output,
    format: "A4",
    landscape: true,
    printBackground: true,
  });

  await browser.close();
}

async function main(data) {
  const pid = process.pid;
  console.log(`${pid} got a message, `, data.name);

  const qs = createQueryStringFromObject(data);
  const finalUrl = `${BASE_URL}?${qs}`;

  try {
    await render({ finalUrl, name: data.name });
    process.send(`${pid} has finished!`);
  } catch (error) {
    process.send(`${pid} has broken! ${error.stack}`);
  }
}

process.once("message", main);
