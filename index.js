const CronJob = require('cron').CronJob

const axios = require(`axios`)
const deepEqual = require('deep-equal')
const fs = require('fs')
const parseXmlString = require('xml2js').parseString

const TYPE_JSON = 'application/json'
const TYPE_XML = 'application/xml'
const TYPE_PLAIN_TEXT = 'text/plain'

function extractQueryOptions(query) {
    let queryOptions = query;
    if (typeof query === 'string') {
        queryOptions = {
            url: query,
            method: 'get'
        }
    }
    return queryOptions
}

function fromXml (string) {
    let a;
    parseXmlString(string, (err, res) => {
        if (res)
            a = res;
    })
    return a;
}

function getCronFunction(cronWebHook) {
    let query = cronWebHook.querySettings.query
    
    let queryOptions = extractQueryOptions(query)
    if (!(queryOptions) || !(queryOptions.url))
        throw 'invalid query options'

    return async () => {
        const response = await axios(queryOptions)
        console.log(response)
        console.log(response.data)
        console.log(typeof response.data)
        let object = typeof response.data === 'string' ? cronWebHook.objectParser(response.data) : response.data
        console.log(object)
        object = cronWebHook.objectTransformer(object)
        console.log(object)
        let stateEmpty = !cronWebHook.state
        if (object && (stateEmpty || !cronWebHook.equal(cronWebHook.state, object))) {
            cronWebHook.state = object
            fs.writeFileSync((cronWebHook.stateFilePath), JSON.stringify(object))
            if (stateEmpty && cronWebHook.onStart || !stateEmpty)
                notify(cronWebHook.querySettings.webhook)
        }   
    }
}

function notify(webhook) {
    axios(extractQueryOptions(webhook))
}

function getState0(filePath) {
    try {
        let content = fs.readFileSync(filePath)
        return JSON.parse(content)
    } catch (err) {
        return null
    }
}

function startCronWebhook({querySettings, objectParser, objectTransformer, cronPattern, stateFilePath, equal, state, onStart}) {
    return new CronWebHook({querySettings, objectParser, objectTransformer, cronPattern, stateFilePath, equal, state, onStart}).start()
}

class CronWebHook {
    constructor({querySettings, objectParser, objectTransformer, cronPattern, stateFilePath, equal, state, onStart}) {
        this.querySettings = querySettings
        this.cronPattern = cronPattern || '* * * * *'
        this.stateFilePath = stateFilePath || '__tempState.json'
        this.equal = equal || deepEqual
        this.state = state
        this.onStart = onStart
        if (typeof objectParser === 'function')
            this.objectParser = objectParser
        else if (objectParser === TYPE_JSON)
            this.objectParser = JSON.parse
        else if (objectParser === TYPE_XML)
            this.objectParser = fromXml
        if (!this.objectParser)
            this.objectParser = s => s + ''
        this.objectTransformer = objectTransformer || (o => o)
    }

    start() {
        this.job = new CronJob(this.cronPattern, getCronFunction(this), null, true, "Europe/Rome")
        this.state = this.state || getState0(this.stateFilePath || '__tempState.json')
        return this
    }

    stop() {
        return this.job.stop()
    }

    setCronPattern(cronPattern) {
        if (cronPattern)
            this.job.setTime(cronPattern)
    }

    toProperties() {
        {this.querySettings, this.objectParser, this.cronPattern, this.stateFilePath, this.equal, this.state}
    }
}

module.exports = {
    CronWebHook,
    startCronWebhook,
    TYPE_XML,
    TYPE_JSON,
    TYPE_PLAIN_TEXT
}