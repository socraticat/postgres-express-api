const {
    initRoutine,
    dropAll
} = require('./dbSetup');

const command = process.argv[2] || null;
if (!command) {
    console.error("COMMAND arg#3 required.");
    process.exit(0);
}

if (command == 'init') {
    initRoutine()
        .then(res => {
            res && console.log(res);
            process.exit(0);
        })
        .catch(err => {
            console.error(err);
        });
}
else if (command == 'destroy') {
    dropAll()
        .then(res => {
            res && console.log(res);
            process.exit(0);
        })
        .catch(err => {
            console.error(err);
        });
}