const CronJob = require('cron').CronJob

const axios = require(`axios`)
const deepEqual = require('deep-equal')
const fs = require('fs')

function getCronFunction(options, objectParser) {
    let {
        query,
        stateFilePath = '__tempState.json',
        equal = deepEqual
    } = options;
    
    let queryOptions = extractQueryOptions(query);
    if (!(queryOptions) || !(queryOptions.url))
        throw 'invalid query options'

    return async () => {
        const response = await axios(queryOptions);
        let object = objectParser(response.data);
        let stateEmpty = !options.state;
        if (object && (stateEmpty || !equal(options.state, object))) {
            options.state = object
            fs.writeFileSync(stateFilePath, JSON.stringify(object))
            if (stateEmpty && options.onStart || !stateEmpty)
                notify(options)
        }   
    }
}

function extractQueryOptions(query) {
    let queryOptions = query;
    if (typeof query === 'string') {
        queryOptions = {
            url: query,
            method: 'get'
        };
    }
    return queryOptions;
}

function notify(options) {
    let {
        webhook
    } = options;
    
    axios(extractQueryOptions(webhook))
}

function getState0(filePath) {
    try {
        let content = fs.readFileSync(filePath)
        return JSON.parse(content)
    } catch (err) {
        return null;
    }
}

module.exports = ({options, objectParser = JSON.parse, cronPattern = "* * * * *"}) => {
    options.state = options.state || getState0(options.stateFilePath || '__tempState.json');
    var job = new CronJob(cronPattern, getCronFunction(options, objectParser), null, true, "Europe/Rome")
    job.start();
}