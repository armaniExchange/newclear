import React, { Component, PropTypes } from 'react';
import { DragSource as dragSource } from 'react-dnd';
import DndTypes from './DndTypes';


import './componentCandidate.css';

export default function (componentCandidate) {

  const componentSource = {
    isDragging(props, monitor) {
      return monitor.getItem().id === props.id;
    },

    beginDrag(props/* , monitor, component */) {
      const componentModule = componentCandidate[props.component];
      const item = Object.assign({
        component: props.component,
        _isNew: true,
        _isContainer: props.isContainer,
        _isRoot: props.isRoot
      }, componentModule.meta.defaultProps ? { ...componentModule.meta.defaultProps } : {});
      console.log('beginDrag');
      console.log(item);
      return item;
    }
  };

  @dragSource(DndTypes.COMPONENT, componentSource, (connect, monitor) => ({
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging()
  }))

  class ComponentCandidate extends Component {
    static propTypes = {
      connectDragSource: PropTypes.func,
      addComponentByClicking: PropTypes.func,
      iconClassName: PropTypes.string,
      name: PropTypes.string,
      component: PropTypes.string,
      isContainer: PropTypes.bool,
      style: PropTypes.object
    }

    onClick = () => {
      this.props.addComponentByClicking(componentSource.beginDrag(this.props));
    }

    render() {
      const {
        connectDragSource,
        iconClassName,
        name, 
        style
      } = this.props;

      return connectDragSource(
        <div style={style} onClick={this.onClick}>
          <i className={iconClassName} />
          <br />{name}
        </div>

      );
    }
  }
  return ComponentCandidate;
}


