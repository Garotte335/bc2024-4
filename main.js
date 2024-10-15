const http = require('http');
const { program } = require('commander');
const fs = require('fs').promises;
const path = require('path');

// Налаштовуємо програму для прийому аргументів командного рядка
program
  .requiredOption('-h, --host <host>', 'Server host')
  .requiredOption('-p, --port <port>', 'Server port')
  .requiredOption('-c, --cache <path>', 'Path to cache directory')
  .parse(process.argv);

const options = program.opts();

// Функція для отримання шляху до файлу у кеші
const getCacheFilePath = (code) => path.join(options.cache, `${code}.jpg`);

// Створюємо HTTP сервер
const server = http.createServer(async (req, res) => {
  const method = req.method;
  const urlParts = req.url.split('/');
  const code = urlParts[1]; // отримаємо код з URL

  if (!code) {
    res.statusCode = 400; // Bad Request
    res.end('HTTP code not specified');
    return;
  }

  const filePath = getCacheFilePath(code);

  try {
    switch (method) {
      case 'GET':
        // Читання файлу з кешу
        try {
          const data = await fs.readFile(filePath);
          res.writeHead(200, { 'Content-Type': 'image/jpeg' });
          res.end(data);
        } catch (error) {
          if (error.code === 'ENOENT') {
            res.statusCode = 404; // Not Found
            res.end('Image not found');
          } else {
            res.statusCode = 500; // Internal Server Error
            res.end('Server error');
          }
        }
        break;

      case 'PUT':
        // Запис нового файлу або оновлення існуючого
        let body = [];
        req.on('data', chunk => {
          body.push(chunk);
        }).on('end', async () => {
          body = Buffer.concat(body);
          await fs.writeFile(filePath, body);
          res.statusCode = 201; // Created
          res.end('Image saved');
        });
        break;

      case 'DELETE':
        // Видалення файлу з кешу
        try {
          await fs.unlink(filePath);
          res.statusCode = 200; // OK
          res.end('Image deleted');
        } catch (error) {
          if (error.code === 'ENOENT') {
            res.statusCode = 404; // Not Found
            res.end('Image not found');
          } else {
            res.statusCode = 500; // Internal Server Error
            res.end('Server error');
          }
        }
        break;

      default:
        res.statusCode = 405; // Method Not Allowed
        res.end('Method not allowed');
    }
  } catch (error) {
    res.statusCode = 500;
    res.end('Server error');
  }
});

// Запускаємо сервер з переданими параметрами host і port
server.listen(options.port, options.host, () => {
  console.log(`Server running at http://${options.host}:${options.port}/`);
});
