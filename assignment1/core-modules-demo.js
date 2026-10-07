const os = require('os');
const path = require('path');
const fs = require('fs');

const sampleFilesDir = path.join(__dirname, 'sample-files');

if (!fs.existsSync(sampleFilesDir)) {
  fs.mkdirSync(sampleFilesDir, { recursive: true });
}

// OS module
console.log('Platform:', os.platform());
console.log('CPU:', os.cpus()[0].model);
console.log('Total Memory:', os.totalmem());

// Path module
const joinedPath = path.join(sampleFilesDir, 'folder', 'file.txt');
console.log('Joined path:', joinedPath);

// fs.promises API
async function fileDemo() {
  try {
    const demoFile = path.join(sampleFilesDir, 'demo.txt');

    await fs.promises.writeFile(
      demoFile,
      'Hello from fs.promises!'
    );

    const content = await fs.promises.readFile(
      demoFile,
      'utf8'
    );

    console.log('fs.promises read:', content);
  } catch (err) {
    console.log('File operation failed:', err.message);
  }
}

fileDemo();

// Streams for large files- log first 40 chars of each chunk
// Create a large file
const largeFile = path.join(sampleFilesDir, 'largefile.txt');

let largeFileContent = '';

for (let i = 1; i <= 100; i++) {
  largeFileContent += `This is line ${i} of the large file.\n`;
}

fs.writeFileSync(largeFile, largeFileContent);

// Read the large file using a stream
const readStream = fs.createReadStream(largeFile, {
  encoding: 'utf8',
  highWaterMark: 1024,
});

readStream.on('data', (chunk) => {
  console.log('Read chunk:', chunk.slice(0, 40));
});

readStream.on('end', () => {
  console.log('Finished reading large file with streams.');
});

readStream.on('error', (err) => {
  console.log('Stream error:', err.message);
});