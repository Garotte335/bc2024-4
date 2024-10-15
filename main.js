const http = require('http');
const { program } = require('commander');

// Налаштовуємо програму для прийому аргументів командного рядка
program
  .requiredOption('-h, --host <host>', 'Server host')
  .requiredOption('-p, --port <port>', 'Server port')
  .requiredOption('-c, --cache <path>', 'Path to cache directory')
  .parse(process.argv);

const options = program.opts();

// Створюємо HTTP сервер
const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Hello from the web server!\n');
});

// Запускаємо сервер з переданими параметрами host і port
server.listen(options.port, options.host, () => {
  console.log(`Server running at http://${options.host}:${options.port}/`);
});
