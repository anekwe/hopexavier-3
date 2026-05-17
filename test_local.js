import http from 'http';

http.get('http://localhost:3000', (res) => {
  console.log('Status code:', res.statusCode);
  res.on('data', d => console.log(d.toString().slice(0, 100)));
}).on('error', console.error);
