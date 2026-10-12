const fs = require('fs');
const path = require('path');

// Write a sample file for demonstration
const sampleDir = path.join(__dirname, 'sample-files');
const sampleFile = path.join(sampleDir, 'sample.txt');

fs.mkdirSync(sampleDir, { recursive: true });
fs.writeFileSync(sampleFile, 'Hello, async world!');

// 1. Callback style
fs.readFile(sampleFile, 'utf8', (err, content) => {
  if (err) {
    console.log('Callback error:', err.message);
    return;
  }

  console.log('Callback:', content);
});

// Callback hell example (test and leave it in comments):
//
// fs.readFile(file1, 'utf8', (err, content1) => {
//   if (err) {
//     console.log(err);
//     return;
//   }
//
//   fs.readFile(file2, 'utf8', (err, content2) => {
//     if (err) {
//       console.log(err);
//       return;
//     }
//
//     fs.readFile(file3, 'utf8', (err, content3) => {
//       if (err) {
//         console.log(err);
//         return;
//       }
//
//       console.log(content1, content2, content3);
//     });
//   });
// });

// 2. Promise style
fs.promises
  .readFile(sampleFile, 'utf8')
  .then((content) => {
    console.log('Promise:', content);
  })
  .catch((err) => {
    console.log('Promise error:', err.message);
  });

// 3. Async/Await style
async function readFileAsync() {
  try {
    const content = await fs.promises.readFile(sampleFile, 'utf8');
    console.log('Async/Await:', content);
  } catch (err) {
    console.log('Async/Await error:', err.message);
  }
}

readFileAsync();
