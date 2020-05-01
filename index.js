const CronJob = require('cron').CronJob

const axios = require(`axios`)
const deepEqual = require('deep-equal')
const fs = require('fs')

var state;

function getCronFunction(options, objectParser) {
    let {
        webhook,
        query,
        stateFilePath = '__tempState.json',
        equal = deepEqual
    } = options;
    
    let queryOptions = query
    if (typeof query === 'string') {
        queryOptions = {
            url: query,
            method: 'get'
        }
    }
    if (!(queryOptions) || !(queryOptions.url))
        throw 'invalid query options'

    return async () => {
        //console.log('going to perform query')
        const response = await axios(queryOptions);
        //console.log(response)
        let object = objectParser(response.data);
        //console.log(object)
        let stateEmpty = !state;
        if (object && (stateEmpty || !equal(state, object))) {
            state = object
            fs.writeFileSync(stateFilePath, JSON.stringify(state))
            if (stateEmpty && options.onStart || !stateEmpty)
                axios({
                    method: 'get',
                    url: webhook
                })
        }   
    }
}

function getState0(filePath) {
    try {
        let content = fs.readFileSync(filePath)
        //console.log(content)
        return JSON.parse(content)
    } catch (err) {
        //console.log('no data found')
        return null;
    }
}

module.exports = ({options, objectParser = JSON.parse, cronPattern = "* * * * *"}) => {
    //console.log('going to start cron job')
    //console.log(options)
    //console.log(cronPattern)
    state = getState0(options.stateFilePath || '__tempState.json');
    var job = new CronJob(cronPattern, getCronFunction(options, objectParser), null, true, "Europe/Rome")
    job.start();
    //console.log('started')
}