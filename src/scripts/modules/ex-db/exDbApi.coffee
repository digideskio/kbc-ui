
request = require '../../utils/request'
_ = require 'underscore'
ApplicationStore = require '../../stores/ApplicationStore'
ComponentsStore = require '../components/stores/ComponentsStore'
SyrupApi = require '../components/SyrupComponentApi'

jobPoller = require '../../utils/jobPoller'

createRequest = (method, path) ->
  SyrupApi.createRequest('ex-db', method, path)


module.exports =

  getQueries: (configurationId) ->
    createRequest('GET', "configs/#{configurationId}/queries")
    .promise()
    .then((response) ->
      response.body
    )

  getCredentials: (configurationId) ->
    createRequest('GET', "configs/#{configurationId}/credentials")
    .promise()
    .then((response) ->
      response.body
    )

  saveQuery: (configurationId, query) ->
    createRequest('PUT', "configs/#{configurationId}/queries/#{query.id}")
    .timeout 10000
    .send(query)
    .promise()
    .then((response) ->
      response.body
    )

  deleteQuery: (configurationId, queryId) ->
    createRequest('DELETE', "configs/#{configurationId}/queries/#{queryId}")
    .promise()
    .then((response) ->
      response.body
    )

  createQuery: (configurationId, newQuery) ->
    createRequest('POST', "configs/#{configurationId}/queries")
    .send(newQuery)
    .promise()
    .then((response) ->
      response.body
    )

  saveCredentials: (configurationId, credentials) ->
    createRequest 'POST', "configs/#{configurationId}/credentials"
    .send credentials
    .promise()
    .then (response) ->
      response.body

  testCredentials: (credentials) ->
    allowedColumns = [
      'database'
      'driver'
      'host'
      'password'
      'port'
      'user'
      'ssl'
    ]
    createRequest 'POST', 'test'
    .send _.pick credentials, allowedColumns...
    .promise()
    .then (response) ->
      response.body

  testAndWaitForCredentials: (credentials) ->
    @testCredentials(credentials)
    .then (response) ->
      jobPoller.poll ApplicationStore.getSapiTokenString(), response.url
