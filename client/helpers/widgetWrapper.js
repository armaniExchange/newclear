import React, { Component, PropTypes } from 'react'; //PropTypes
import { connect } from 'react-redux';
import hoistStatics from 'hoist-non-react-statics';
import { getAppPageVar, getAppEnvVar } from './stateHelper';
// import React, { Component, PropTypes } from 'react'; //PropTypes
// import { connect } from 'react-redux';
import { uniqueId, upperFirst } from 'lodash';
// import { getAppEnvVar, getAppPageVar } from 'helpers/stateHelper';
import { buildInstancePath } from 'helpers/actionHelper';

// wrapper for widgets, add a wrapper to get state
export function widgetWrapper(WrappedComponent, widgetProps) {

  const widgetName = WrappedComponent.displayName || 'NOT_DEFINED_DISPLAY_NAME';
  const displayName = `Widget${widgetName}`;
  const componentId = uniqueId(displayName + '-');

  class Widget extends Component {
    static displayName = displayName

    static contextTypes = {
      props: PropTypes.object.isRequired
    }

    static childContextTypes = {
      props: PropTypes.object.isRequired
    }

    // _componentId = 0

    constructor(props, context) {
      super(props, context);
    }

    /**
     * support all actions dispatchable
     * new method name like 'comSetComponentData', 'comSetComponentVisible'
     */
    get newMethods() {
      const appActions = {};
      Object.keys(window.appActions).forEach((actionName) => {
        const newMethodName = `com${upperFirst(actionName)}`;
        appActions[newMethodName] = (...args) => {
          args.unshift(this.instancePath);
          return this.props.dispatch(window.appActions[actionName].apply(null, args));
        };
      });
      return appActions;
    }

    get componentName() {
      return displayName;
    }

    get componentId() {
      // if (!this._componentId) {
      //   this._componentId = uniqueId(this.componentName.toLowerCase() + '-');
      // }
      // return this._componentId;
      return componentId;
    }

    get instanceData() {
      const data = this.props.page.getIn(this.instancePath);
      if (data) {
        return data.toJS();
      } else {
        return {};
      }
    }

    get pageId() {
      return this.props.env.pageId || 'UNKNOWN-PAGE-ID';
    }

    get pageName() {
      return this.props.env.page || 'UNKNOWN-PAGE';
    }

    get visible() {
      return this.props.page.getIn([ ...this.instancePath, 'visible' ], true);
    }

    get data() {
      return this.props.page.getIn([ ...this.instancePath, 'data' ]);
    }

    get instancePath() {
      return buildInstancePath(this.pageId, this.pageName, this.componentName, this.componentId );
    }

    // componentAxapiRequest(data, notifiable=false) {
    //   return this.context.props.axapiRequest(this.instancePath, data, notifiable);
    // }
    //
    // componentSetState(data) {
    //   return this.context.props.setComponentState(this.pageId, this.componentName, this.componentId, data);
    // }

    getChildContext() {
      const props = Object.assign(
        {},
        this.context.props,
        this.props
      );
      return {  props: props };
    }

    render() {
      const newProps = Object.assign(
        {}, this.props, this.newMethods,
        {
          instancePath: this.instancePath,
          data: this.data,
          visible: this.visible
        }
      );
      // console.log('widgetProps', rest, this);
      this.renderedElement = React.createElement(WrappedComponent, newProps);
      return this.renderedElement;
    }
  }

  const stateMapper = (state) => {
    return {
      env: getAppEnvVar(state),
      page: getAppPageVar(state),
      app: state.getIn([ 'app' ]),
      form: state.getIn([ 'form' ]),
      ...widgetProps
    };
  };

  let newComponent = connect(stateMapper)(Widget);
  newComponent.displayName = displayName; //`Connect(${displayName})`;
  newComponent.componentId = componentId; //`Connect(${displayName})`;
  // newComponent.contextTypes =  { props: PropTypes.object.isRequired };
  return hoistStatics(newComponent, Widget, WrappedComponent);
}
