import React, {PropTypes} from 'react';
import {DragDropMixin} from 'react-dnd';
import _ from 'underscore';
import Tooltip from '../../../../../react/common/Tooltip';

export default React.createClass({
  mixins: [DragDropMixin],
  propTypes: {
    toggleHide: PropTypes.func.isRequired,
    phase: PropTypes.object.isRequired,
    onPhaseMove: PropTypes.func.isRequired,
    onMarkPhase: PropTypes.func.isRequired,
    togglePhaseIdChange: PropTypes.bool.isRequired,
    isMarked: PropTypes.bool.isRequired,
    toggleAddNewTask: PropTypes.func.isRequired
  },

  statics: {
    configureDragDrop: (register) => {
      register('phase', {
        dragSource: {beginDrag: (phaseRow) => {
          // TODO this.props.onBeginDrag(phaseRow.props.phase.get('id'));
          return {item: phaseRow.props.phase};
        }
        },
        dropTarget: {over: (phaseRow, phase) => {
          // TODO this.props.onEndDrag(phaseRow.props.phase.get('id'));
          phaseRow.props.onPhaseMove(phase.get('id'), phaseRow.props.phase.get('id'));
        }}});
    }
  },

  render() {
    const isDragging = this.getDragState('phase').isDragging;
    const style = {
      opacity: isDragging ? 0.5 : 1

    };
    const tdcn = 'kb-orchestrator-task-drag text-center';
    const dragprops = _.extend({style: {cursor: 'move'}, className: tdcn}, this.dragSourceFor('phase'), this.dropTargetFor('phase'));
    return (
      <tr style={style}
        onClick={this.onRowClick}>
        <td {...dragprops} >
          <i  className="fa fa-bars"/>
        </td>
        <td colSpan="6" className="kbc-cursor-pointer">
          <Tooltip
            tooltip="Select phase to merge">
            <input
              checked={this.props.isMarked}
              type="checkbox"
              onClick={this.toggleMarkPhase}
            />
          </Tooltip>

          <div className="text-center form-group form-group-sm">
            <span className="label label-default kbc-label-rounded kbc-cursor-pointer">
              <span>{this.props.phase.get('id')} </span>
              <Tooltip
                tooltip="rename phase">
                <span
                  onClick={this.toggleTitleChange}
                  className="kbc-icon-pencil"/>
              </Tooltip>
            </span>
          </div>
        </td>
        <td>
          <Tooltip tooltip="Add New Task" placement="top">
            <button
              className="btn btn-link"
              style={{padding: '0'}}
              onClick={this.toggleTaskAdd}>
              <span className="fa fa-fw fa-plus"/>
            </button>
          </Tooltip>
        </td>

      </tr>
    );
  },

  toggleTaskAdd(e) {
    this.props.toggleAddNewTask();
    this.onStopPropagation(e);
  },

  toggleMarkPhase(e) {
    this.props.onMarkPhase(this.props.phase.get('id'), e.shiftKey);
    e.stopPropagation();
  },

  toggleTitleChange(e) {
    this.props.togglePhaseIdChange(this.props.phase.get('id'));
    this.onStopPropagation(e);
  },

  onRowClick(e) {
    this.props.toggleHide();
    e.preventDefault();
  },

  onStopPropagation(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  /* <TasksEditTableRow
     task=this.props.task
     component: @props.components.get(task.get('component'))
     disabled: @props.disabled
     key: task.get('id')
     onTaskDelete: @props.onTaskDelete
     onTaskUpdate: @props.onTaskUpdate
     onTaskMove: @props.onTaskMove
   */


});
