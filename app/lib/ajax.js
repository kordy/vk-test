export default (opts) => (
  new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const method = (opts.method || 'GET').toUpperCase();
    let url = opts.url;
    let params = opts.params;
    // We'll need to stringify if we've been given an object
    // If we have a string, this is skipped.
    if (params && typeof params === 'object') {
      params = Object.keys(params).map(key => encodeURIComponent(key) + '=' + encodeURIComponent(params[key])).join('&');
    }
    if (method === 'GET' && params) {
      url = `${url}?${params}`;
      params = null;
    }

    xhr.open(method, url);
    xhr.onload = function () {
      if (this.status >= 200 && this.status < 300) {
        resolve(((res, contentType) => {
          if (contentType && contentType.toUpperCase() === 'JSON') {
            try {
              return JSON.parse(res);
            } catch (e) {
              return res;
            }
          }
          return res;
        })(xhr.response, opts.contentType));
      } else {
        reject({
          status: this.status,
          statusText: xhr.statusText
        });
      }
    };
    xhr.onerror = function () {
      reject({
        status: this.status,
        statusText: xhr.statusText
      });
    };
    if (opts.headers) {
      Object.keys(opts.headers).forEach(key => {
        xhr.setRequestHeader(key, opts.headers[key]);
      });
    }

    xhr.send(params);
  })
)