import React from 'react';
import _ from 'lodash';
import editableComponent from './editableComponent';


let registeredComponents = {};
const registerComponents = (componentsDict) => {
// registerComponents before you start to use jsonToComponent
// example:
// import ContainerWidget from '../../../examples/A10Field/components/ContainerWidget';
// import NotEditableCom  from '../../../examples/A10Field/components/NotEditableCom';
// import EditableCom     from '../../../examples/A10Field/components/EditableCom';
// import FieldCheckbox   from '../../../examples/A10Field/components/FieldCheckbox';
// editableUtils.registerComponents({
//   ContainerWidget,
//   NotEditableCom,
//   EditableCom,
//   FieldCheckbox
// });
  registeredComponents = Object.assign({}, componentsDict);
};


let _cachedWrappedComponents;
_cachedWrappedComponents = {};

const jsonToComponent = (obj, enableWrap = false, props = {}, actions = {}) => {
  const {
    schemaChildren,
    component
  } = obj;

  let reactComponent = component;
  if (typeof component === 'string') {
    const matchedComponent = registeredComponents[component];
    if (matchedComponent) {
      reactComponent = matchedComponent;
    } else {
      console.error(`component ${component} is not found, use editableUtils.registerComponents to register component`);
    }
  }
  if (enableWrap && obj.componentId !== 'root') {
    if (!_cachedWrappedComponents[component]) {
      const { editableProps = {} } = reactComponent;
      _cachedWrappedComponents[component] = editableComponent(actions)(reactComponent, editableProps);
    }
    reactComponent = _cachedWrappedComponents[component];
  }
  const reactComponentChildren = !schemaChildren || typeof schemaChildren === 'string' ? [ 
    schemaChildren 
  ] : (
    (schemaChildren || []).map(item => jsonToComponent(item, enableWrap, props, actions))
  );
  
  return React.createElement
    .apply(this, [ 
      reactComponent, 
      Object.assign({}, obj, props, { key: obj.componentId }), ...reactComponentChildren 
    ]);
};

const deleteComponent = (schema, componentId) => {
  return {
    ...schema,
    schemaChildren: !schema.schemaChildren || typeof schema.schemaChildren === 'string' ? schema.schemaChildren :
      schema.schemaChildren.filter(item => item.componentId !== componentId)
      .map(item => {
        return deleteComponent(item, componentId);
      })
  };
};

const updateComponent = (schema, componentId, component) => {
  return {
    ...schema,
    schemaChildren: !schema.schemaChildren || typeof schema.schemaChildren === 'string' ? schema.schemaChildren :
      schema.schemaChildren
      .map(item => {
        if ( item.componentId === componentId) {
          Object.assign(item, component);
        }
        return updateComponent(item, componentId, component);
      })
  };
};

const moveComponent = (schema, dragComponent, dropComponentId, isNew, newPosition) => {
  if (isNew && !dragComponent.componentId) {
    dragComponent.componentId = _.uniqueId();
  }
  const modifiedChildren = !schema.schemaChildren || typeof schema.schemaChildren === 'string' ? schema.schemaChildren :
    schema.schemaChildren.filter(item => item.componentId !== dragComponent.componentId)
    .map(item => moveComponent(item, dragComponent, dropComponentId, isNew, newPosition))
    .reduce((prev, current) => {
      if (current.componentId === dropComponentId) {
        if (newPosition === 'inside') {
          current.schemaChildren = current.schemaChildren || [];
          current.schemaChildren = [ ...current.schemaChildren, dragComponent ];
        } else {
          return newPosition === 'before' ? [ ...prev, dragComponent, current ] : [ ...prev, current, dragComponent ];
        }
      } else if (current.componentId === dragComponent.id) {
        return prev;
      }
      return [ ...prev, current ];
    }, []);
  return {
    ...schema,
    schemaChildren: modifiedChildren
  };
};

export default {
  registerComponents,
  jsonToComponent,
  moveComponent,
  deleteComponent,
  updateComponent
};
