import React from 'react';
import {fromJS} from 'immutable';

import ComponentDescription from '../../components/react/components/ComponentDescription';
import ComponentMetadata from '../../components/react/components/ComponentMetadata';
import DeleteConfigurationButton from '../../components/react/components/DeleteConfigurationButton';
import Credentials from './Credentials';

import createStoreMixin from '../../../react/mixins/createStoreMixin';
import RoutesStore from '../../../stores/RoutesStore';
import InstalledComponentStore from '../../components/stores/InstalledComponentsStore';
/* import LatestJobsStore from '../../jobs/stores/LatestJobsStore'; */
/* import storageTablesStore from '../../components/stores/StorageTablesStore'; */

const componentId = 'wr-portal-sas';

export default React.createClass({
  mixins: [createStoreMixin(InstalledComponentStore)],

  getStateFromStores() {
    const configId = RoutesStore.getCurrentRouteParam('config');
    const localState = InstalledComponentStore.getLocalState(componentId, configId);
    const configData = InstalledComponentStore.getConfigData(componentId, configId);
    const credentials = fromJS({
      hostname: 'asdasd',
      port: '12345',
      use: 'asdasd',
      db: 'asdasd',
      schema: 'asd',
      id: '12'

    });
    return {
      credentials: credentials,
      configId: configId,
      localState: localState,
      configData: configData
    };
  },

  render() {
    return (
      <div className="container-fluid">
        <div className="col-md-9 kbc-main-content">
          <div className="row kbc-header">
            <ComponentDescription
              componentId={componentId}
              configId={this.state.configId}
            />
          </div>
          <div className="row">
            <Credentials
              credentials={this.state.credentials}
              isCreating={false}
            />
          </div>
        </div>
        {this.renderSideBar()}
      </div>
    );
  },

  renderSideBar() {
    return (
      <div className="col-md-3 kbc-main-sidebar">
        <div classNmae="kbc-buttons kbc-text-light">
          <ComponentMetadata
            componentId={componentId}
            configId={this.state.configId}
          />
        </div>
        <ul className="nav nav-stacked">

          <li>
            <DeleteConfigurationButton
              componentId={componentId}
              configId={this.state.configId}
            />
          </li>
        </ul>
      </div>
    );
  }

});