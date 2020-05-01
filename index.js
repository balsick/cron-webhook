const CronJob = require('cron').CronJob

const axios = require(`axios`)
const deepEqual = require('deep-equal')
const fs = require('fs')

var state = getState0();

function getCronFunction(options, objectParser) {
    let {
        webhook,
        queryOptions
    } = options;
    return async () => {
        console.log('going to perform query')
        const response = await axios(queryOptions);
        console.log(response)
        let object = objectParser(response.data);
        console.log(object)
        let stateEmpty = !state;
        if (!state || !deepEqual(state, object)) {
            state = object
            fs.writeFileSync('state.json', JSON.stringify(state))
            if (stateEmpty && options.onStart || !stateEmpty)
                axios({
                    method: 'get',
                    url: webhook
                })
        }   
    }
}

function getState0() {
    try {
        let content = fs.readFileSync('state.json')
        console.log(content)
        return JSON.parse(content)
    } catch (err) {
        console.log('no data found')
        return null;
    }
}

module.exports = ({options, objectParser, cronPattern = "*/1 * * * *"}) => {
    console.log('going to start cron job')
    console.log(options)
    console.log(cronPattern)
    var job = new CronJob(cronPattern, getCronFunction(options, objectParser), null, true, "Europe/Rome")
    job.start();
    console.log('started')
}