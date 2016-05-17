import React from 'react';
import {Map} from 'immutable';
// stores
import storeProvisioning, {storeMixins} from '../../storeProvisioning';
import ComponentStore from '../../../components/stores/ComponentsStore';
import RoutesStore from '../../../../stores/RoutesStore';
// import LatestJobsStore from '../../../jobs/stores/LatestJobsStore';
import createStoreMixin from '../../../../react/mixins/createStoreMixin';

// actions
import {deleteCredentialsAndConfigAuth} from '../../../oauth-v2/OauthUtils';
import actionsProvisioning from '../../actionsProvisioning';

// ui components
import AuthorizationRow from '../../../oauth-v2/react/AuthorizationRow';
import ComponentDescription from '../../../components/react/components/ComponentDescription';
import ComponentMetadata from '../../../components/react/components/ComponentMetadata';
import RunComponentButton from '../../../components/react/components/RunComponentButton';
import DeleteConfigurationButton from '../../../components/react/components/DeleteConfigurationButton';
import EmptyState from '../../../components/react/components/ComponentEmptyState';
import {Link} from 'react-router';
import ProfileInfo from '../ProfileInfo';

// index components
import QueriesTable from './QueriesTable';
import ProfilesManagerModal from './ProfilesManagerModal';

// CONSTS
const COMPONENT_ID = 'keboola.ex-google-analytics-v4';

export default React.createClass({
  mixins: [createStoreMixin(...storeMixins)],

  getStateFromStores() {
    const configId = RoutesStore.getCurrentRouteParam('config');
    const store = storeProvisioning(configId);
    const actions = actionsProvisioning(configId);
    const component = ComponentStore.getComponent(COMPONENT_ID);
    return {
      store: store,
      actions: actions,
      component: component,
      configId: configId,
      authorizedEmail: store.oauthCredentials.get('authorizedFor'),
      oauthCredentials: store.oauthCredentials,
      oauthCredentialsId: store.oauthCredentialsId,
      localState: store.getLocalState()
    };
  },

  render() {
    return (
      <div className="container-fluid">
        <ProfilesManagerModal
          show={this.state.localState.getIn(['ProfilesManagerModal', 'profiles'], false)}
          onHideFn={() => this.state.actions.updateLocalState('ProfilesManagerModal', Map())}
          profiles={this.state.store.profiles}
          isSaving={this.state.store.isSaving('profiles')}
          authorizedEmail={this.state.authorizedEmail}
          onSaveProfiles={(newProfiles) => this.state.actions.saveProfiles(newProfiles)}
          {...this.state.actions.prepareLocalState('ProfilesManagerModal')}
        />
        <div className="col-md-9 kbc-main-content">
          <div className="row kbc-header">
            <div className="col-sm-10">
              <ComponentDescription
                componentId={COMPONENT_ID}
                configId={this.state.configId}
              />
            </div>
            <div className="col-sm-2 kbc-buttons">
              {this.hasQueries() ? this.renderAddQueryLink() : null}
            </div>
          </div>
          <div className="row">
            {this.renderAuthorizedInfo('col-xs-5')}
            {this.renderProfiles('col-xs-7')}
          </div>
          {(this.hasQueries() > 0)
           ? this.renderQueriesTable()
           : this.renderEmptyQueries()
          }
        </div>
        <div className="col-md-3 kbc-main-sidebar">
          <ComponentMetadata
            componentId={COMPONENT_ID}
            configId={this.state.configId}
          />
          <ul className="nav nav-stacked">
            <li className={!!this.invalidToRun() ? 'disabled' : null}>
              <RunComponentButton
                title="Run"
                component={COMPONENT_ID}
                mode="link"
                runParams={this.runParams()}
                disabled={!!this.invalidToRun()}
                disabledReason={this.invalidToRun()}
              >
                You are about to run component.
              </RunComponentButton>
            </li>
            {/* <li>
            <a href={this.state.component.get('documentationUrl')} target="_blank">
            <i className="fa fa-question-circle fa-fw" /> Documentation
            </a>
            </li> */}
            {this.hasProfiles() ?
            <li>
              <a
                onClick={this.showProfilesModal}>
                <i className="fa fa-fw fa-globe" />
                Setup Profiles
              </a>
            </li>
            : null }
            <li>
              <DeleteConfigurationButton
                componentId={COMPONENT_ID}
                configId={this.state.configId}
              />
            </li>
          </ul>
          {/* <LatestJobs jobs={this.state.latestJobs} /> */}
        </div>
      </div>

    );
  },

  showProfilesModal() {
    return this.state.actions.updateLocalState(['ProfilesManagerModal', 'profiles'], this.state.store.profiles);
  },

  isAuthorized() {
    const creds = this.state.oauthCredentials;
    return  creds && creds.has('id');
  },

  hasProfiles() {
    return this.state.store.profiles.count() > 0;
  },

  hasQueries() {
    return this.state.store.queries && this.state.store.queries.count();
  },

  invalidToRun() {
    if (!this.isAuthorized()) {
      return 'No Google Analytics account authorized';
    }

    if (!this.hasProfiles()) {
      return 'No Profiles Available';
    }

    if (!this.hasQueries()) {
      return 'No queries configured';
    }

    return false;
  },

  renderAuthorizedInfo(clName) {
    return (
      <AuthorizationRow
        className={this.isAuthorized() || this.hasProfiles() ? clName : 'col-xs-12'}
        id={this.state.oauthCredentialsId}
        configId={this.state.configId}
        componentId={COMPONENT_ID}
        credentials={this.state.oauthCredentials}
        isResetingCredentials={false}
        onResetCredentials={this.deleteCredentials}
        showHeader={false}
      />
    );
  },

  renderProfiles(clName) {
    return (this.isAuthorized() || this.hasProfiles() ?
            <div className={clName}>
              <div className="form-group form-group-sm">
                <label> Available Profiles </label>
                <div>
                  {this.hasProfiles() ?
                   <div className="form-control-static">
                     {this.state.store.profiles.map(
                        (p) => <ProfileInfo profile={p} />
                      )}
                   </div>
                   :
                   <EmptyState>
                     <p> No profiles selected </p>
                     <button type="button" className="btn btn-success"
                       onClick={this.showProfilesModal}>
                       Select Profiles
                     </button>
                   </EmptyState>
                  }
                </div>
              </div>
            </div>
          : null
    );
  },

  renderQueriesTable() {
    return (
      <div className="row">
        <QueriesTable
          outputBucket={this.state.store.outputBucket}
          deleteQueryFn={this.state.actions.deleteQuery}
          toggleQueryEnabledFn={this.state.actions.toggleQueryEnabled}
          getRunSingleQueryDataFn={this.state.store.getRunSingleQueryData}
          isPendingFn={this.state.store.isPending}
          queries={this.state.store.queries}
          allProfiles={this.state.store.profiles}
          configId={this.state.configId}
          {...this.state.actions.prepareLocalState('QueriesTable')}
        />
      </div>
    );
  },
  renderAddQueryLink() {
    return (
      <Link
        to={COMPONENT_ID + '-new-query'}
        params={{config: this.state.configId}}
        className="btn btn-success">
        Add Query
      </Link>
    );
  },

  renderEmptyQueries() {
    return (
      this.hasProfiles() && this.isAuthorized() ?
      <div className="row">
        <EmptyState>
          <p>No Queries Configured</p>
          {this.renderAddQueryLink()}
        </EmptyState>
      </div>
    : null
    );
  },

  runParams() {
    return () => ({config: this.state.configId});
  },


  deleteCredentials() {
    deleteCredentialsAndConfigAuth(COMPONENT_ID, this.state.configId);
  }

});