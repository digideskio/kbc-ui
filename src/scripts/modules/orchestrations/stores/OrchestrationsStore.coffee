
Dispatcher = require '../../../Dispatcher.coffee'
Immutable = require('immutable')
Map = Immutable.Map
List = Immutable.List
Constants = require '../Constants.coffee'
fuzzy = require 'fuzzy'
StoreUtils = require '../../../utils/StoreUtils.coffee'

_store = Map(
  orchestrationsById: Map()
  orchestrationTasksById: Map()
  filter: ''
  isLoading: false
  isLoaded: false
  loadingOrchestrations: List()
)

updateOrchestration = (store, id, payload) ->
  store.updateIn(['orchestrationsById', id], (orchestration) ->
    orchestration.merge payload
  )

removeOrchestrationFromLoading = (store, id) ->
  store.update 'loadingOrchestrations', (loadingOrchestrations) ->
    loadingOrchestrations.remove(store.get('loadingOrchestrations').indexOf(id))

setLastExecutedJob = (store, orchestrationId, job) ->
  orchestration = store.getIn ['orchestrationsById', orchestrationId]
  return store if !orchestration || !orchestration.get('lastExecutedJob')
  return store if orchestration.getIn(['lastExecutedJob', 'id']) > job.get('id')

  # set only if job is newer or same
  store.setIn ['orchestrationsById', orchestrationId, 'lastExecutedJob'], job


OrchestrationStore = StoreUtils.createStore

  ###
    Returns all orchestrations sorted by last execution date desc
  ###
  getAll: ->
    _store
      .get('orchestrationsById')
      .sortBy((orchestration) -> orchestration.get('name'))
      .sortBy((orchestration) ->
        date = orchestration.getIn ['lastExecutedJob', 'startTime']
        if date then -1 * (new Date(date).getTime()) else null
      )

  ###
    Returns orchestration specified by id
  ###
  get: (id) ->
    _store.getIn ['orchestrationsById', parseInt(id)]

  has: (id) ->
    _store.get('orchestrationsById').has parseInt(id)

  getOrchestrationTasks: (orchestrationId) ->
    _store.getIn ['orchestrationTasksById', parseInt(orchestrationId)]

  hasOrchestrationTasks: (orchestrationId) ->
    _store.get('orchestrationTasksById').has parseInt(orchestrationId)

  ###
    Returns all orchestrations filtered by current filter value
  ###
  getFiltered: ->
    filter = @getFilter()
    @getAll().filter((orchestration) ->
      if filter
        fuzzy.match(filter, orchestration.get('name'))
      else
        true
    )

  getFilter: ->
    _store.get 'filter'

  getIsLoading: ->
    _store.get 'isLoading'

  getIsOrchestrationLoading: (id) ->
    _store.get('loadingOrchestrations').contains id

  getIsLoaded: ->
    _store.get 'isLoaded'


Dispatcher.register (payload) ->
  action = payload.action

  switch action.type
    when Constants.ActionTypes.ORCHESTRATIONS_SET_FILTER
      _store = _store.set 'filter', action.query.trim()
      OrchestrationStore.emitChange()

    when Constants.ActionTypes.ORCHESTRATION_ACTIVATE
      _store = updateOrchestration _store, action.orchestrationId,
        active: true
      OrchestrationStore.emitChange()

    when Constants.ActionTypes.ORCHESTRATION_DISABLE
      _store = updateOrchestration _store, action.orchestrationId,
        active: false
      OrchestrationStore.emitChange()

    when Constants.ActionTypes.ORCHESTRATIONS_LOAD
      _store = _store.set 'isLoading', true
      OrchestrationStore.emitChange()

    when Constants.ActionTypes.ORCHESTRATIONS_LOAD_SUCCESS
      console.log 'load success'
      _store = _store.withMutations((store) ->
        store
          .set('isLoading', false)
          .set('isLoaded', true)
          .set('orchestrationsById', Immutable.fromJS(action.orchestrations).toMap().mapKeys((key, orchestration) ->
            orchestration.get 'id'
          ))
      )
      OrchestrationStore.emitChange()

    when Constants.ActionTypes.ORCHESTRATION_LOAD
      _store = _store.update 'loadingOrchestrations', (loadingOrchestrations) ->
        loadingOrchestrations.push action.orchestrationId
      OrchestrationStore.emitChange()

    when Constants.ActionTypes.ORCHESTRATION_DELETE
      _store = _store.removeIn ['orchestrationsById', action.orchestrationId]
      OrchestrationStore.emitChange()

    when Constants.ActionTypes.ORCHESTRATION_LOAD_ERROR
      _store = removeOrchestrationFromLoading(_store, action.orchestrationId)
      OrchestrationStore.emitChange()

    when Constants.ActionTypes.ORCHESTRATION_LOAD_SUCCESS
      _store = _store.withMutations((store) ->
        removeOrchestrationFromLoading(store, action.orchestration.id)
        .setIn ['orchestrationsById', action.orchestration.id], Immutable.fromJS(action.orchestration)
        .setIn ['orchestrationTasksById', action.orchestration.id], Immutable.fromJS(action.orchestration.tasks)
      )
      OrchestrationStore.emitChange()


    when Constants.ActionTypes.ORCHESTRATION_JOB_LOAD_SUCCESS
      # try to update orchestration latest job
      _store = setLastExecutedJob(_store, action.job.orchestrationId, Immutable.fromJS(action.job))
      OrchestrationStore.emitChange()


    when Constants.ActionTypes.ORCHESTRATION_JOBS_LOAD_SUCCESS
      # try to update orchestration latest job

      latestJob = Immutable.fromJS(action.jobs).last()
      if latestJob
        _store = setLastExecutedJob(_store, parseInt(action.orchestrationId), latestJob)
        OrchestrationStore.emitChange()

module.exports = OrchestrationStore