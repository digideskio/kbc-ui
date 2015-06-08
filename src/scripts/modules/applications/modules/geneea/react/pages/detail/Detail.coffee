React = require 'react'
Immutable = require('immutable')
{ul, li, span, div, a, p, h2, label, input, form} = React.DOM
_ = require 'underscore'
Tooltip = React.createFactory(require('react-bootstrap').Tooltip)
OverlayTrigger = React.createFactory(require('react-bootstrap').OverlayTrigger)
Input = React.createFactory(require('react-bootstrap').Input)
ComponentDescription = require '../../../../../../components/react/components/ComponentDescription'
ComponentDescription = React.createFactory(ComponentDescription)
ComponentMetadata = require '../../../../../../components/react/components/ComponentMetadata'
RunButtonModal = React.createFactory(require('../../../../../../components/react/components/RunComponentButton'))
DeleteConfigurationButton = require '../../../../../../components/react/components/DeleteConfigurationButton'
DeleteConfigurationButton = React.createFactory DeleteConfigurationButton
LatestJobs = require '../../../../../../components/react/components/SidebarJobs'

createStoreMixin = require '../../../../../../../react/mixins/createStoreMixin'
InstalledComponentsStore = require '../../../../../../components/stores/InstalledComponentsStore'
InstalledComponentsActions = require '../../../../../../components/InstalledComponentsActionCreators'
storageActionCreators = require '../../../../../../components/StorageActionCreators'
storageTablesStore = require '../../../../../../components/stores/StorageTablesStore'
Select = React.createFactory(require('react-select'))
LatestJobsStore = require '../../../../../../jobs/stores/LatestJobsStore'
fuzzy = require 'fuzzy'

RoutesStore = require '../../../../../../../stores/RoutesStore'
StaticText = React.createFactory(require('react-bootstrap').FormControls.Static)
Autosuggest = React.createFactory(require 'react-autosuggest')

createGetSuggestions = (getOptions) ->
  (input, callback) ->
    suggestions = getOptions()
      .filter (value) -> fuzzy.match(input, value)
      .slice 0, 10
      .toList()
    callback(null, suggestions.toJS())

tooltips =
  intable: "Table containing text for topic detection"
  data_column: "Column of the input table containing text for topic detection"
  primary_key_column: "Column of the input table uniquely identifying each row of the input table"
  outtable: "Result table containing columns id(primary key column values),\
   topic column and confidence column as a result of topic detection of data column"


module.exports = React.createClass

  displayName: 'GeneeaAppDetail'

  mixins: [createStoreMixin(InstalledComponentsStore, storageTablesStore)]
  getStateFromStores: ->
    configId = RoutesStore.getCurrentRouteParam('config')
    configData = InstalledComponentsStore.getConfigData("geneea-topic-detection", configId)
    editingConfigData = InstalledComponentsStore.getEditingConfigData("geneea-topic-detection", configId)

    inputTables = configData?.getIn [ 'storage', 'input', 'tables']
    intable = inputTables?.get(0)?.get 'source'
    outTables = configData?.getIn [ 'storage', 'output', 'tables']
    outTable = outTables?.get(0)?.get 'source'
    parameters = configData?.getIn ['parameters']
    editingData = @_prepareEditingData(editingConfigData)
    isEditing = InstalledComponentsStore.getEditingConfigData('geneea-topic-detection', configId)


    data_column: parameters?.get 'data_column'
    primary_key_column: parameters?.get 'primary_key_column'
    intable: intable
    outtable: outTable
    isEditing: isEditing
    editingData: editingData
    configId: configId
    latestJobs: LatestJobsStore.getJobs 'geneea-topic-detection', configId

  componentWillMount: ->
    storageActionCreators.loadTables()
  componentDidMount: ->
    storageActionCreators.loadTables()

  render: ->
    #console.log 'rendering', @state.config.toJS()
    div {className: 'container-fluid'},
      @_renderMainContent()
      @_renderSideBar()

  _renderSideBar: ->
    div {className: 'col-md-3 kbc-main-sidebar'},
      div className: 'kbc-buttons kbc-text-light',
        React.createElement ComponentMetadata,
          componentId: 'geneea-topic-detection'
          configId: @state.configId
      ul className: 'nav nav-stacked',
        li disabled: true,
          RunButtonModal

            title: 'Run Extraction'
            mode: 'link'
            component: 'geneea-topic-detection'
            runParams: =>
              config: @state.configId
          ,
            'You are about to run the topic detection job of this configuration.'
        li null,
          DeleteConfigurationButton
            componentId: 'geneea-topic-detection'
            configId: @state.configId
      # React.createElement LatestJobs,
      #   jobs: @state.latestJobs


  _renderMainContent: ->
    div {className: 'col-md-9 kbc-main-content'},
      div className: 'row',
        ComponentDescription
          componentId: 'geneea-topic-detection'
          configId: @state.configId
      div className: 'row',
        form className: 'form-horizontal',
          if @state.isEditing
            @_renderEditorRow()
          else
            div className: 'row',
              @_createInput('Input Table', @state.intable, tooltips.intable)
              @_createInput('Data Column', @state.data_column, tooltips.data_column)
              @_createInput('Primary Key', @state.primary_key_column, tooltips.primary_key_column)
              @_createInput('Output Table', @state.outtable, tooltips.outtable)


  _renderEditorRow: ->
    div className: 'row',
      div className: 'form-group',
        label className: 'col-xs-2 control-label', 'Source Table'
        div className: 'col-xs-10',
          Select
            key: 'sourcetable'
            name: 'source'
            value: @state.editingData.intable
            placeholder: "Source table"
            onChange: (newValue) =>
              newEditingData = @state.editingData
              newEditingData.intable = newValue
              newEditingData.outtable = "#{newValue}-ex"
              newEditingData.data_column = ""
              newEditingData.primary_key_column = ""
              @setState
                editingData: newEditingData
              @_updateEditingConfig()
            options: @_getTables()
        ,
          p className: 'help-block', tooltips.intable

      div className: 'form-group',
        label className: 'col-xs-2 control-label', 'Data Column'
        div className: 'col-xs-10',
          Select
            key: 'datacol'
            name: 'data_column'
            value: @state.editingData.data_column
            placeholder: "Data Column"
            onChange: (newValue) =>
              newEditingData = @state.editingData
              newEditingData.data_column = newValue
              @setState
                editingData: newEditingData
              @_updateEditingConfig()
            options: @_getColumns()
        ,
          p className: 'help-block', tooltips.data_column

      div className: 'form-group',
        label className: 'col-xs-2 control-label', 'Primary Key'
        div className: 'col-xs-10',
          Select
            key: 'primcol'
            name: 'primary_key_column'
            value: @state.editingData.primary_key_column
            placeholder: "Primary Key Column"
            onChange: (newValue) =>
              newEditingData = @state.editingData
              newEditingData.primary_key_column = newValue
              @setState
                editingData: newEditingData
              @_updateEditingConfig()
            options: @_getColumns()
        ,
          p className: 'help-block', tooltips.primary_key_column

      div className: 'form-group',
        label className: 'control-label col-xs-2', 'Output Table'
        div className: "col-xs-10",
          Autosuggest
            suggestions: createGetSuggestions(@_getOutTables)
            inputAttributes:
              className: 'form-control'
              placeholder: 'to get hint start typing'
              value: @state.editingData.outtable
              onChange: (newValue) =>
                newEditingData = @state.editingData
                newEditingData.outtable = newValue
                @setState
                  editingData: newEditingData
                @_updateEditingConfig()
        ,
          p className: 'help-block', tooltips.outtable


  _getTables: ->
    tables = storageTablesStore.getAll()
    tables.filter( (table) ->
      table.getIn(['bucket','stage']) != 'sys').map( (value,key) ->
      {
        label: key
        value: key
      }
      ).toList().toJS()

  _getOutTables: ->
    tables = storageTablesStore.getAll()
    tables.filter( (table) ->
      table.getIn(['bucket','stage']) != 'sys').map( (value,key) ->
      return key
      )

  _getColumns: ->
    tableId = @state.editingData?.intable
    tables = storageTablesStore.getAll()
    if !tableId or !tables
      return []
    table = tables.find((table) ->
      table.get("id") == tableId
    )
    return [] if !table
    result = table.get("columns").map( (column) ->
      {
        label: column
        value: column
      }
    ).toList().toJS()
    return result

  _createInput: (caption, value, tooltip) ->
    OverlayTrigger
      overlay: Tooltip null, tooltip
      key: caption
      placement: 'top'
    ,
      StaticText
        label: caption
        labelClassName: 'col-xs-4'
        wrapperClassName: 'col-xs-8'
      , value or 'N/A'

  _prepareEditingData: (editingData) ->
    #console.log "editing data", editingData?.toJS()
    getTables = (source) ->
      editingData?.getIn ['storage', source, 'tables']
    params = editingData?.getIn ['parameters']

    intable: getTables('input')?.get(0)?.get('source')
    outtable: getTables('output')?.get(0)?.get('source') or ""
    primary_key_column: params?.get 'primary_key_column'
    data_column: params?.get 'data_column'


  _updateEditingConfig: ->
    columns = _.map @_getColumns(), (value, key) ->
      key
    setup = @state.editingData
    template =
      storage:
        input:
          tables: [{source: setup.intable, columns: columns}]
        output:
          tables: [{source: setup.outtable, destination: setup.outtable}]
      parameters:
        'primary_key_column': setup.primary_key_column
        data_column: setup.data_column
        user_key: '9cf1a9a51553e32fda1ecf101fc630d5'
    updateFn = InstalledComponentsActions.updateEditComponentConfigData
    data = Immutable.fromJS template
    updateFn 'geneea-topic-detection', @state.configId, data