const http = require('http');

http.get('http://localhost:3000', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log('HTTP Status:', res.statusCode, '\nBody:', data.slice(0, 500)));
}).on('error', err => console.log(err.message));
