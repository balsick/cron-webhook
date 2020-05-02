This module lets you set a cron job that notifies your webhook when data queried changes.

## Setup
```sh
npm i --save cron-webhoom
```

## Minimal import and usage
```javascript
const cronWebhook = require('cron-webhook')

cronWebhook({
    options: {
        query: url,
        webhook: webhookUrl
    }
})
```

This will perform every minute a *get* on the provided *url* and when data changes perform a *get* on *webhookUrl*.

## Params
Additional parameters and configurations can be set.

```javascript
cronWebhook({
    options: {
        query: { // this can either be a url or an object made of method, url, parameters and body
            method: httpMethod, //'get', 'post'
            url: url,
            ...
        },
        webhook: { // this can either be a url or an object made of method, url, parameters and body
            method: httpMethod, //'get', 'post'
            url: url,
            ...
        },
        stateFilePath: stringStateFilePath, //optional, defaults to __tempState.json
        onStart: boolean, //optional, defaults to false, to make the webhook be notified on the first time
    },
    objectParser: (string) => JSON.parse(string), //optional, defaults to JSON.parse, function that converts queried response to object,
    equal: (s1, s2) => false, //optional, defaults to deepEqual, function that is called to check
    cronPattern: validCronPattern, //optional, defaults to * * * * *, that is every minute
})
```

Visit [cron github project](https://www.npmjs.com/package/cron) for *cronPattern*.
[Axios](https://www.npmjs.com/package/axios) is used for http, so check its docs.
