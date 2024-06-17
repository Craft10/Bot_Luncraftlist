const http = require('http');

class APIClient {
  constructor(baseURL) {
    this.baseURL = baseURL;
  }

  async get(path) {
    return new Promise((resolve, reject) => {
      const url = `${this.baseURL}${path}`;

      http.get(url, (response) => {
        let data = '';

        response.on('data', (chunk) => {
          data += chunk;
        });

        response.on('end', () => {
          try {
            const jsonData = JSON.parse(data);
            resolve(jsonData);
          } catch (error) {
            reject(error);
          }
        });
      }).on('error', (error) => {
        reject(error);
      });
    });
  }
}

module.exports = APIClient;
			