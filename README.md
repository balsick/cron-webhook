This module lets you set a cron job that notifies your webhook when data queried changes.

## Setup
```sh
npm i --save cron-webhook
```

## Minimal import and usage
```javascript
const cronWebhook = require('cron-webhook').startCronWebhook

cronWebhook({
    querySettings: {
        query: url,
        webhook: webhookUrl
    }
})
```

This will perform every minute a *get* on the provided *url* and when data changes perform a *get* on *webhookUrl*.

## Params
Additional parameters and configurations can be set.

```javascript
import {
    CronWebHook, //class
    TYPE_XML, //facility for setting the CronWebHook to convert XML response to object
    TYPE_JSON, //facility for setting the CronWebHook to convert JSON response to object
    TYPE_PLAIN_TEXT, //facility for setting the CronWebHook to convert PLAIN_TEXT response to object
    startCronWebHook //facility if you don't care using the class
} from 'cron-webhook'

new CronWebHook({
    querySettings: {
        query: { // this can either be a url or an object made of method, url, parameters and body
            method: httpMethod, //'get', 'post'
            url: url,
            //...
        },
        webhook: { // this can either be a url or an object made of method, url, parameters and body
            method: httpMethod, //'get', 'post'
            url: url,
            //...
        },
    },
    objectParser: TYPE_XML | TYPE_JSON | TYPE_PLAIN_TEXT | (string) => JSON.parse(string), //optional, defaults to plain text, function that converts queried response to an object,
    objectTransformer: (bject) => object, //optional, defaults to identity, use it to filter out only part of the object you want to test for changes
    stateFilePath: stringStateFilePath, //optional, defaults to __tempState.json
    onStart: true, //optional, defaults to false, to make the webhook be notified on the first time,
    state: null, //optional, initial state. if not provided, it is read from stateFilePath
    equal: (s1, s2) => false, //optional, defaults to deepEqual, function that is called to check
    cronPattern: '* * * * *', //optional, defaults to * * * * *, that is every minute
})
```

Visit [cron github project](https://www.npmjs.com/package/cron) for *cronPattern*.
[Axios](https://www.npmjs.com/package/axios) is used for http, so check its docs.
