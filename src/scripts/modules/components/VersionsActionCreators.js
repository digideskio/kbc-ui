import dispatcher from '../../Dispatcher';
import Promise from 'bluebird';
import Store from './stores/VersionsStore';
import Api from './InstalledComponentsApi';
import Constants from './VersionsConstants';
import ApplicationActionCreators from '../../actions/ApplicationActionCreators';
import {Link} from 'react-router';
import React from 'react';

module.exports = {
  loadVersions: function(componentId, configId) {
    if (Store.hasVersions(componentId, configId)) {
      return Promise.resolve();
    }
    return this.loadVersionsForce(componentId, configId);
  },

  loadVersionsForce: function(componentId, configId) {
    dispatcher.handleViewAction({
      componentId: componentId,
      configId: configId,
      type: Constants.ActionTypes.VERSIONS_LOAD_START
    });
    return Api.getComponentConfigVersions(componentId, configId).then(function(result) {
      dispatcher.handleViewAction({
        componentId: componentId,
        configId: configId,
        type: Constants.ActionTypes.VERSIONS_LOAD_SUCCESS,
        versions: result
      });
      return result;
    }).catch(function(error) {
      dispatcher.handleViewAction({
        componentId: componentId,
        configId: configId,
        type: Constants.ActionTypes.VERSIONS_LOAD_ERROR
      });
      throw error;
    });
  },

  rollbackVersion: function(componentId, configId, version, reloadCallback) {
    var self = this;
    dispatcher.handleViewAction({
      componentId: componentId,
      configId: configId,
      version: version,
      type: Constants.ActionTypes.VERSIONS_ROLLBACK_START
    });
    return Api.rollbackVersion(componentId, configId, version).then(function(result) {
      dispatcher.handleViewAction({
        componentId: componentId,
        configId: configId,
        version: version,
        type: Constants.ActionTypes.VERSIONS_ROLLBACK_SUCCESS
      });
      // reload versions, not required after sapi update
      self.loadVersionsForce(componentId, configId);
      // reload configs!
      reloadCallback(componentId, configId);
      // send notification
      ApplicationActionCreators.sendNotification({
        message: 'Configuration rollback successful'
      });
      return result;
    }).catch(function(error) {
      dispatcher.handleViewAction({
        componentId: componentId,
        configId: configId,
        version: version,
        type: Constants.ActionTypes.VERSIONS_ROLLBACK_ERROR
      });
      throw error;
    });
  },

  copyVersion: function(componentId, configId, version, name, reloadCallback) {
    var self = this;
    dispatcher.handleViewAction({
      componentId: componentId,
      configId: configId,
      version: version,
      name: name,
      type: Constants.ActionTypes.VERSIONS_COPY_START
    });
    return Api.createConfigCopy(componentId, configId, version, name).then(function(result) {
      dispatcher.handleViewAction({
        componentId: componentId,
        configId: configId,
        version: version,
        name: name,
        type: Constants.ActionTypes.VERSIONS_COPY_SUCCESS
      });
      // reload versions, not required after sapi update
      self.loadVersionsForce(componentId, configId);
      // reload configs!
      reloadCallback(componentId);

      // send notification, TODO after the callback!!!!!
      if (componentId === 'transformation') {
        ApplicationActionCreators.sendNotification({
          message: React.createClass({
            render() {
              return (
                <span>
                  Configuration copied successfully,&nbsp;
                  <Link
                    to="transformationBucket"
                    params={{bucketId: result.id}}
                  >
                    go to the new configuration
                  </Link>.
                </span>
              );
            }
          })
        });
      } else {
        ApplicationActionCreators.sendNotification({
          message: React.createClass({
            render() {
              return (
                <span>
                  Configuration copied successfully.
                </span>
              );
            }
          })
        });
      }
      return result;
    }).catch(function(error) {
      dispatcher.handleViewAction({
        componentId: componentId,
        configId: configId,
        version: version,
        name: name,
        type: Constants.ActionTypes.VERSIONS_COPY_ERROR
      });
      throw error;
    });
  },

  changeNewVersionName: function(componentId, configId, version, name) {
    dispatcher.handleViewAction({
      componentId: componentId,
      configId: configId,
      version: version,
      name: name,
      type: Constants.ActionTypes.VERSIONS_NEW_NAME_CHANGE
    });
  }
};
