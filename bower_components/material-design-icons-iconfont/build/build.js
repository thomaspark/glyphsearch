const common = require('./common');

common.updateAndBuild()
    .then(() => process.exit(0))
    .catch((e) => {
        console.error(e);
        process.exit(1)
    });


