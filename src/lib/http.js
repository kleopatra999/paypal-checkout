/* @flow */

import { SyncPromise } from 'sync-browser-mocks/src/promise';

type RequestOptionsType = {
    url : string,
    method? : string,
    headers? : { [key : string] : string },
    json? : Object,
    data? : { [key : string] : string },
    body? : string,
    win? : typeof window
};

const HEADERS = {
    CONTENT_TYPE: 'content-type',
    ACCEPT: 'accept'
};

export function request({ url, method = 'get', headers = {}, json, data, body, win = window } : RequestOptionsType) : SyncPromise<Object> {

    return new SyncPromise((resolve, reject) => {

        if (json && data || json && body || data && json) {
            throw new Error(`Only options.json or options.data or options.body should be passed`);
        }

        let normalizedHeaders = {};

        for (let key of Object.keys(headers)) {
            normalizedHeaders[key.toLowerCase()] = headers[key];
        }

        if (json) {
            normalizedHeaders[HEADERS.CONTENT_TYPE] = normalizedHeaders[HEADERS.CONTENT_TYPE] || 'application/json';
        } else if (data || body) {
            normalizedHeaders[HEADERS.CONTENT_TYPE] = normalizedHeaders[HEADERS.CONTENT_TYPE] || 'application/x-www-form-urlencoded; charset=utf-8';
        }

        normalizedHeaders[HEADERS.ACCEPT] = normalizedHeaders[HEADERS.ACCEPT] || 'application/json';

        let xhr = new win.XMLHttpRequest();

        xhr.addEventListener('load', function() {
            resolve(JSON.parse(this.responseText));
        }, false);

        xhr.addEventListener('error', (evt) => {
            reject(new Error(`Request to ${method.toLowerCase()} ${url} failed: ${evt.toString()}`));
        }, false);

        xhr.open(method, url, true);

        if (normalizedHeaders) {
            for (let key in normalizedHeaders) {
                xhr.setRequestHeader(key, normalizedHeaders[key]);
            }
        }

        if (json) {
            body = JSON.stringify(json);
        } else if (data) {
            body = Object.keys(data).map(key => {
                return `${encodeURIComponent(key)}=${data ? encodeURIComponent(data[key]) : ''}`;
            }).join('&');
        }

        xhr.send(body);
    });
}

request.get = (url : string, options = {}) => {
    return request({ method: 'get', url, ...options });
};

request.post = (url : string, data, options = {}) => {
    return request({ method: 'post', url, data, ...options });
};
