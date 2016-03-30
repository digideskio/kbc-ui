import React from 'react';
import {Modal, Button, Input} from 'react-bootstrap';
import moment from 'moment';
import ImmutableRenderMixin from '../mixins/ImmutableRendererMixin';

export default React.createClass({
  mixins: [ImmutableRenderMixin],

  propTypes: {
    version: React.PropTypes.object.isRequired,
    show: React.PropTypes.bool.isRequired,
    onClose: React.PropTypes.func.isRequired,
    onCopy: React.PropTypes.func.isRequired,
    newVersionName: React.PropTypes.string,
    onChangeName: React.PropTypes.func.isRequired
  },

  onChange(e) {
    this.props.onChangeName(e.target.value);
  },

  render() {
    return (
      <Modal show={this.props.show} onHide={this.props.onClose}>
        <Modal.Header closeButton>
          <Modal.Title>Version Copy</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            You are goint to copy version #{this.props.version.get('version')} created {moment(this.props.version.get('created')).fromNow()} by {this.props.version.getIn(['creatorToken', 'description'], 'unknown')} to a new configuration.
          </p>
          <form className="form-horizontal">
            <Input
              type="text"
              label="New name"
              labelClassName="col-xs-4"
              wrapperClassName="col-xs-8"
              value={this.props.newVersionName}
              onChange={this.onChange}
            />
          </form>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={this.props.onClose}>Close</Button>
          <Button onClick={this.props.onCopy} bsStyle="success">Copy</Button>
        </Modal.Footer>
      </Modal>
    );
  }
});
