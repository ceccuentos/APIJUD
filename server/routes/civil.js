const express = require('express');
const puppeteer = require('puppeteer');
const { client } = require('../server')
const logger = require('../utils/logger');
const CIVIL_SELECTOR = require('../utils/config');
const { verifyToken } = require('../middleware/auth')
require('dotenv').config();

const app = express();

//TODO:
// agregar redis  OK

app.get('/civil/', [verifyToken], async function(req, res, next) {
    const _causa = req.query.idcausa
    const _ano = req.query.ano
    const _trib = req.query.tribunal

    // Validaciones
    let msg = ''
    if (!Number(_causa) && _ano !== 0) msg += `- NumCausa no válida.\n`
    if (!Number(_ano) && _ano !== 0) msg += `- Año no válido.\n`
    if (!Number(_trib) && _trib !== 0) msg += `- Trib. no válido.\n`

    if (msg !== '') {
        logger.error(`No Results: ${_causa}- ${_ano}-${_trib} `);
        return res.status(400).json({
            err: { message: 'No se pudo obtener datos: \n' + msg }
        })
    }

    const keyRedis = `CIVIL:${_causa.trim()+'_'+_ano.trim()+'_'+_trib.trim()}`

    // Valida CACHE
    logger.info('CIVIL - Check Cache...');
    // Get desde Redis 120 ss
    client.get(keyRedis, function(err, data) {
        if (data) {
            const resultJSON = JSON.parse(data);
            logger.info('Get Caching, End');
            return res.status(200).json(resultJSON);
        } else {
            const _causa = req.query.idcausa
            logger.info(`** Begin Scraping **`);

            scrapCivil(_causa, _ano, _trib, client)
                .then((data) => {
                    const responseJSON = data;
                    logger.info(`Saving data in cache`);
                    client.setex(keyRedis, 120, JSON.stringify(responseJSON));
                    logger.info(`** End Scraping **`);
                    return res.status(200).json(responseJSON);

                }).catch(err => {
                    logger.info(`** End Scraping with Errors **`);
                    return res.status(500).json({ error: err.message });
                });
        }
    })
})

// ********************************************************
// Civil 
// ======
// Head         --> Ingreso de datos de causa desde llamada
// Body-Head    --> Resultados cabecera 
// Body-Table   --> Table con trámites
// Despliegue   --> Datos de envío
// ********************************************************
const scrapCivil = async(_causa, _ano, _trib, client) => {
    // Head  
    var urlBase = process.env.CIVIL_URL;
    const numero = CIVIL_SELECTOR.numero;
    const ano = CIVIL_SELECTOR.ano;
    const boton = CIVIL_SELECTOR.boton;
    const tribunal = CIVIL_SELECTOR.tribunal;
    const linkRol = CIVIL_SELECTOR.linkRol;
    var urlFin // Apify

    try {

        logger.info('Launching instance Chromium...');
        //  '--no-sandbox' evita err de lanzamiento de Chromium en distros Linux
        const browser = await puppeteer.launch({
            slowMo: 20,
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox'
            ]
        });
        const page = await browser.newPage();

        logger.info(`Calling page...`);
        // change agent  evita err de lanzamiento de Chromium 
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3419.0 Safari/537.36');
        await page.goto(urlBase, { waitUntil: 'networkidle2' });

        logger.info(`Typing data ...`);
        const frame = page.frames().find(frame => frame.name() === 'body');

        const [numeroResp] = await Promise.all([
            frame.waitForSelector(numero),
            frame.type(numero, _causa, { delay: 100 })
        ]).catch((error) => {
            logger.error(`Cannot type data ${_causa}`, error);
            browser.close();
        })

        const [anoResp] = await Promise.all([
            frame.waitForSelector(ano),
            frame.type(ano, _ano, { delay: 100 })
        ]).catch((error) => {
            logger.error(`Cannot type data  ${_ano}`, error);
            browser.close();
        })

        const [tribResp] = await Promise.all([
            frame.waitForSelector(tribunal),
            frame.select(tribunal, _trib)
        ]).catch((error) => {
            logger.error(`Cannot type data: ${_causa}-${_ano}-${_trib}`, error);
            browser.close();
        })

        logger.info(`Loading/Consulting data ...`);
        await frame.click(boton);
        await frame.waitForSelector(linkRol);
        await frame.click(linkRol);
        await frame.waitForSelector(CIVIL_SELECTOR.tTabla);

        // Body-Head 
        var head = await frame.evaluate((CIVIL_SELECTOR) => {
            return {
                titulo: document.querySelector(CIVIL_SELECTOR.titulo).innerText,
                fIngreso: document.querySelector(CIVIL_SELECTOR.fIngreso).innerText.split(":")[1].trim(),
                estadoAdm: document.querySelector(CIVIL_SELECTOR.estadoAdm).textContent.trim(),
                proc: document.querySelector(CIVIL_SELECTOR.proc).innerText.split(":")[1].trim(),
                ubicacion: document.querySelector(CIVIL_SELECTOR.ubicacion).innerText.split(":")[1].trim(),
                etapa: document.querySelector(CIVIL_SELECTOR.etapa).innerText.split(":")[1].trim(),
                estadoProceso: document.querySelector(CIVIL_SELECTOR.estadoProceso).innerText.split(":")[1].trim(),

            }
        }, CIVIL_SELECTOR)

        urlFin = frame.url(); // para Apify

        // Body-Table 
        const result = await frame.evaluate(([CIVIL_URL, CIVIL_SELECTOR]) => {
            const rows = document.querySelectorAll(CIVIL_SELECTOR.trTable); //trTable
            return Array.from(rows, row => {
                const columns = row.querySelectorAll('td');
                return Array.from(columns, column => {

                    const celda = row.querySelector(CIVIL_SELECTOR.tdImg); // celda img tdImg

                    // Acomoda url de archivo
                    let urlfile = ""
                    if (celda.outerHTML.indexOf('onclick=" ShowPDFCabecera(') > 0) {
                        urlfile = celda.outerHTML.substring(
                            celda.outerHTML.indexOf('onclick=" ShowPDFCabecera('),
                            celda.outerHTML.indexOf(')" border="0"'))
                        urlfile = urlfile.substring('onclick=" ShowPDFCabecera('.length)
                    } else if (celda.outerHTML.indexOf('onclick="ShowWord(') > 0) {
                        urlfile = celda.outerHTML.substring(
                            celda.outerHTML.indexOf('onclick="ShowWord('),
                            celda.outerHTML.indexOf('border="0"'))
                        urlfile = urlfile.substring('onclick="ShowWord('.length)

                    } else urlfile = ""

                    urlfile = urlfile.replace(/["'"]/g, "") // quita '
                    urlfile = urlfile.replace(/[")"]/g, "");
                    urlfile = urlfile.replace('/CIVILPORWEB/', CIVIL_URL);
                    urlfile = urlfile.replace(/&amp;/g, "&");

                    return (column.cellIndex === 1 || column.cellIndex === 2) ? urlfile : column.innerText
                });
            });
        }, [process.env.CIVIL_URL, CIVIL_SELECTOR]);


        // Despliegue
        var objx = [];
        for (var i = 0; i < result.length; i++) {
            objx[i] = {
                numero: result[i][0],
                file: result[i][1],
                etapa: result[i][3],
                tramite: result[i][4],
                desc: result[i][5],
                fecha: result[i][6],
                foja: result[i][7],
            }
        }
        await browser.close(); // Cierra Instancia

        const resp = {
            url: urlFin,
            head,
            count: result.length,
            tramites: objx
        };

        return resp || []

    } catch (error) {
        logger.error(`No Results: ${_causa}-${_ano}-${_trib} `, error);
        //return res.status(500).json({
        return {
            err: { message: 'No se pudo obtener datos.' + error }
        }
    }



};

module.exports = app;