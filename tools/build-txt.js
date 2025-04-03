const fs = require('fs');
const path = require('path');
const { version } = require('../package.json');

if (!version) {
    throw new Error('Missing required field "version" in package.json');
}

const ROOT_LEVEL = '../';

const DIST_FOLDER_NAME = 'dist';
const OUTPUT_FILE_NAME = 'build.txt';

// Computed constants
const distFolderLocation = path.join(__dirname, ROOT_LEVEL, DIST_FOLDER_NAME);

const buildTxt = () => {
    const content = `version=${version}`;

    // Create the dist folder if it doesn't exist
    if (!fs.existsSync(distFolderLocation)) {
        fs.mkdirSync(distFolderLocation);
    }

    // Write the output file
    const file = path.resolve(distFolderLocation, OUTPUT_FILE_NAME);
    fs.writeFileSync(file, content);

    // eslint-disable-next-line no-console
    console.log(`Wrote ${content} to ${file} was successful`);
};

buildTxt();
