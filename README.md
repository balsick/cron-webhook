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
cronWebhook({
    options: {
        queryOptions: {
            method: httpMethod, //'get', 'post'
            url: url
        },
        webhook: webhookURL,
        stateFilePath: stringStateFilePath, //optional, defaults to __tempState.json
        onStart: boolean, //optional, defaults to false, to make the webhook be notified on the first time
    },
    objectParser: (string) => {} //optional, defaults to JSON.parse, function that converts queried response to object,
    cronPattern: validCronPattern //optional, defaults to * * * * *, that is every minute
})

Visit [cron github project](https://www.npmjs.com/package/cron) for *cronPattern*.
