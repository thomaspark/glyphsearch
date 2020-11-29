const common = require('./common');
const path = require('path');

async function main() {
    let fontJsonFilePath = path.join(common.DIST_DIR_PATH, 'fonts', 'MaterialIcons-Regular.json');
    let hashPreUpdate = await common.calculateFileHash(fontJsonFilePath).hash;
    await common.updateAndBuild();
    let hashPostUpdate = await common.calculateFileHash(fontJsonFilePath).hash;

    let requireUpdate = hashPreUpdate !== hashPostUpdate;
    if (!requireUpdate) {
        throw new Error("nothing to update")
    }
    console.log(`an update is required ${hashPreUpdate} != ${hashPostUpdate}`);
}


main()
    .then(() => process.exit(0))
    .catch((e) => {
        console.error(e);
        process.exit(1)
    });


