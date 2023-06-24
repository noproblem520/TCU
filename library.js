const fs = require('fs');
const ellipticcurve = require("@starkbank/ecdsa");
const fsp = fs.promises;
const path = require('path');
const ECDSA = ellipticcurve.Ecdsa
const tar = require('tar');
const axios = require("axios");
const FormData = require('form-data');

async function readJsonFile() {
    try {
        const data = await fsp.readFile(path.join(__dirname, 'extracted', 'updatepackages', 'metadata.json'), 'utf8');
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
            url: "http://localhost:3001/updatepackages/updatepackages.tar",
            method: 'GET',
            responseType: 'stream'
        });

        const writer = fs.createWriteStream('./updatepackages/updatepackages.tar');
        response.data.pipe(writer);

        writer.on('finish', async function () {
            console.log('The download of updatepackages.tar has been completed.');


            let tarStream = fs.createReadStream('./updatepackages/updatepackages.tar')
                .pipe(tar.extract({ cwd: './extracted' }));

            tarStream.on('finish', function () {
                console.log('The extraction of updatepackages.tar has been completed.');
                resolve();
            });

            tarStream.on('error', function (error) {
                console.log('Error during extraction: ', error);
                reject();
            });
        });

        writer.on('error', function (err) {
            console.log('Error during download: ', err);
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

async function uploadFile() {
    const formData = new FormData();
    formData.append('file', fs.createReadStream(path.join(__dirname, 'updatepackages', 'updatepackages.tar')));

    try {
        const res = await axios.post('http://localhost:3000/upload', formData, {
            headers: formData.getHeaders()
        });
        return res.data.success;
    } catch (err) {
        console.error(err);
        return false;
    }
}

module.exports = { readJsonFile, downloadAndExtract, verify_updatePackages, uploadFile }