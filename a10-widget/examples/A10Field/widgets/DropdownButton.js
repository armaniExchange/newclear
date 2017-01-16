import React from 'react';
import { widgetWrapper } from 'widgetWrapper';
import { DropdownButton, MenuItem } from 'react-bootstrap';

function CustomizedDropdownButton({ ...props }) {
  let dropdownButtonProps = {};
  Object.keys(DropdownButton.propTypes).forEach((key)=>{
    dropdownButtonProps[key] = props[key];
  });
  return (
    <div style={ { position: 'relative' } }>
      {props.children}
      <DropdownButton {...dropdownButtonProps}>
        <MenuItem eventKey="1">Action</MenuItem>
        <MenuItem eventKey="2">Another action</MenuItem>
        <MenuItem eventKey="3" active>Active Item</MenuItem>
        <MenuItem divider />
        <MenuItem eventKey="4">Separated link</MenuItem>
      </DropdownButton>
    </div>
  );
}

export default widgetWrapper()(CustomizedDropdownButton, {
  meta: {
    widget: {
      iconClassName: 'fa fa-caret-square-o-down',
      type: 'basic',
      name: 'DropdownButton',
      component: 'DropdownButton',
      description: ''
    },
    defaultProps: Object.assign({}, DropdownButton.defaultProps, {
      title: 'my dropdown button'
    }),
    propTypes: Object.assign({}, DropdownButton.propTypes),
    propGroups: {
      title: 'basic',
      bsStyle: 'basic',
      bsSize: 'basic',
      open: 'basic',
      bsClass: 'basic',
      noCaret: 'basic',
      children: 'ignore'
    }
  }
});
