const { readJsonFile, downloadAndExtract, verify_updatePackages } = require("./library.js")



const main = async () => {
    await downloadAndExtract();
    const result = await readJsonFile();
    if (verify_updatePackages(result)) {
        console.log("Signature verification succeeded.Posting update packages to Vehicle Computer...");
    } else {
        console.log("Signature verification failed.")
    }
}
main();



