import http from 'node:http';
const port = Number(process.argv[2] ?? '0');
const server = http.createServer((_, res) => res.end('ok'));
server.listen(port, () => {
  console.log(`Local: http://localhost:${server.address().port}`);
});
process.on('SIGTERM', () => process.exit(0));
