const fs = require('fs').promises;
const ellipticcurve = require("@starkbank/ecdsa");
const { read } = require('fs');
const path = require('path');
const ECDSA = ellipticcurve.Ecdsa
const tar = require('tar');
const axios = require("axios");


async function readJsonFile() {
    try {
        const data = await fs.readFile(path.join(__dirname, 'extracted', 'updatepackages', 'metadata.json'), 'utf8');
        const obj = JSON.parse(data);
        return obj;
    } catch (err) {
        console.error('An error occurred:', err);
        return;
    }
}



const downloadAndExtract = async () => {

    return new Promise(async (resolve, reject) => {
        let response = await axios({
            url: "http://localhost:3000/updatepackages/updatepackages.tar",
            method: 'GET',
            responseType: 'stream'
        });

        let tarStream = response.data.pipe(tar.extract({ cwd: './extracted' }));

        tarStream.on('finish', function () {
            console.log('The extraction of updatepackages.tar has been completed.');
            resolve()
        });

        tarStream.on('error', function (error) {
            console.log('Error during extraction: ', error);
            reject();
        });
    })

}

const verify_updatePackages = (result) => {
    return ECDSA.verify(JSON.stringify(result.metadata), ellipticcurve.Signature.fromBase64(JSON.stringify(result.signature)), ellipticcurve.PublicKey.fromPem(`-----BEGIN PUBLIC KEY-----
    MFYwEAYHKoZIzj0CAQYFK4EEAAoDQgAEHYxqqUj+xDevCMJSGNlNclk2qgi0az2k
    Ok4RsyMJBhpZw39NT2L6S6HjNMMudL/eBworzk7uSq6oynKEV5sn0A==
    -----END PUBLIC KEY-----`))
}

module.exports = { readJsonFile, downloadAndExtract, verify_updatePackages }