const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    if (!fs.existsSync(dir)) return results;
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.resolve(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else {
            results.push(file);
        }
    });
    return results;
}

const targetDirs = [
    path.resolve(__dirname, 'client', 'src'),
    path.resolve(__dirname, 'docs')
];

let files = [];
targetDirs.forEach(dir => {
    files = files.concat(walk(dir));
});

files.push(path.resolve(__dirname, 'README.md'));
files.push(path.resolve(__dirname, 'USER_GUIDE.md')); // just in case

files = files.filter(f => f.match(/\.(tsx|ts|json|md)$/));

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    if (content.includes('—')) {
        // Replace spaced em dashes with spaced en dashes/hyphens
        content = content.replace(/ — /g, ' - ');
        // Replace remaining em dashes with regular hyphens
        content = content.replace(/—/g, '-');
        fs.writeFileSync(file, content);
        console.log('Fixed:', file);
    }
});
