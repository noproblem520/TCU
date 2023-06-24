const { readJsonFile, downloadAndExtract, verify_updatePackages, uploadFile } = require("./library.js")



const main = async () => {
    await downloadAndExtract();
    const result = await readJsonFile();
    if (verify_updatePackages(result)) {
        try {
            console.log("Signature verification succeeded.Posting update packages to Vehicle Computer...");
            if (await uploadFile()) {
                console.log("Upload Succeeded!");
            } else {
                console.log("Upload Failed!");
            }
        } catch (e) {
            console.log(e);
        }
    } else {
        console.log("Signature verification failed.")
    }
}
main();



