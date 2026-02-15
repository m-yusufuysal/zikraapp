const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, '../src/i18n/locales');
const trPath = path.join(localesDir, 'tr.json');
const enPath = path.join(localesDir, 'en.json');
const arPath = path.join(localesDir, 'ar.json');
const frPath = path.join(localesDir, 'fr.json');
const idPath = path.join(localesDir, 'id.json');

const tr = JSON.parse(fs.readFileSync(trPath, 'utf8'));
const en = JSON.parse(fs.readFileSync(enPath, 'utf8')); // Use EN as fallback for values
const ar = JSON.parse(fs.readFileSync(arPath, 'utf8'));
const fr = JSON.parse(fs.readFileSync(frPath, 'utf8'));
const id = JSON.parse(fs.readFileSync(idPath, 'utf8'));

const targetFiles = [
    { name: 'en.json', data: en, path: enPath },
    { name: 'ar.json', data: ar, path: arPath },
    { name: 'fr.json', data: fr, path: frPath },
    { name: 'id.json', data: id, path: idPath },
];

function syncKeys(source, target, fallback) {
    let modified = false;
    // Recursive function to traverse keys
    function traverse(sourceObj, targetObj, fallbackObj) {
        for (const key in sourceObj) {
            if (typeof sourceObj[key] === 'object' && sourceObj[key] !== null) {
                if (!targetObj[key] || typeof targetObj[key] !== 'object') {
                    targetObj[key] = {}; // Create missing object
                    modified = true;
                }
                traverse(sourceObj[key], targetObj[key], fallbackObj ? fallbackObj[key] : null);
            } else {
                if (!targetObj.hasOwnProperty(key)) {
                    // Missing key detected
                    // Try to use fallback (English) value, otherwise use Source (Turkish) value but maybe marked?
                    // The user wants them to be present. I'll use English if available, else Turkish.
                    const value = (fallbackObj && fallbackObj[key]) ? fallbackObj[key] : sourceObj[key];
                    targetObj[key] = value;
                    modified = true;
                }
            }
        }
    }
    traverse(source, target, fallback);
    return modified;
}

targetFiles.forEach(file => {
    console.log(`Processing ${file.name}...`);
    const isModified = syncKeys(tr, file.data, en); // Use EN as fallback for others
    if (isModified) {
        fs.writeFileSync(file.path, JSON.stringify(file.data, null, 4));
        console.log(`Updated ${file.name}`);
    } else {
        console.log(`No changes needed for ${file.name}`);
    }
});
