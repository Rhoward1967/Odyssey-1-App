import * as fs from 'fs';
import * as path from 'path';

const outputDir = path.join(process.cwd(), 'patent-filing-package');

// Files to convert to ASCII
const files = [
  '01_SPECIFICATION.txt',
  '03_CLAIMS.txt', 
  '04_ABSTRACT.txt',
  '05_OATH_DECLARATION.txt',
  '07_TRANSMITTAL_LETTER.txt',
  '08_APPLICATION_DATA_SHEET.txt'
];

console.log('🔧 Converting files to ASCII format for USPTO...\n');

files.forEach(file => {
  const filePath = path.join(outputDir, file);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Remove any non-ASCII characters (keep only printable ASCII 0x20-0x7E plus whitespace)
    const asciiContent = content
      // eslint-disable-next-line no-control-regex
      .replace(/[^\x00-\x7F]/g, '') // Remove non-ASCII
      .replace(/\r\n/g, '\n')       // Normalize line endings
      .replace(/\r/g, '\n');        // Convert any remaining \r to \n
    
    // Write as ASCII encoding
    fs.writeFileSync(filePath, asciiContent, { encoding: 'ascii' });
    console.log(`✅ Converted to ASCII: ${file}`);
  } else {
    console.log(`⚠️  File not found: ${file}`);
  }
});

console.log('\n✅ All files converted to ASCII format!');
console.log(`📂 Location: ${outputDir}`);
console.log('\n📤 Ready to upload to USPTO Patent Center!');
