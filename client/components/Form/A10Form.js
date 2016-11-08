import React, { Component, PropTypes } from 'react';
// import { connect } from 'react-redux';
import { Form } from 'react-bootstrap';
// import invariant from 'invariant';
import { Map, List, fromJS } from 'immutable';
import { toPath, has } from 'lodash';
import { getAppValueStore } from 'helpers/stateHelper';
import { widgetWrapper } from 'helpers/widgetWrapper';
import A10FormSchema from 'helpers/Schema/A10FormSchema';

import { FORM_FIELD_KEY } from 'configs/appKeys';
import { UPDATE_TARGET_DATA, HIDE_COMPONENT_MODAL, REDIRECT_ROUTE } from 'configs/messages';

class A10SchemaForm extends Component {
  static displayName = 'A10SchemaForm'
  // static componentId = uniqueId('A10SchemaForm-')

  static contextTypes = {
    props: PropTypes.object,
    ballKicker: PropTypes.object
  }

  // context defined at page
  constructor(props, context) {
    super(props, context);
    if (!context.props) {
      throw new Error('Config should passed from parent');
    }
    // this.context.props = context.props;
    const { schemas, removePrefix } = this.props;
    const { urlParams, edit } = this.context.props;
    this.isEdit = edit;
    this.schemaHandler = new A10FormSchema({ schemas, edit, urlParams, removePrefix });
    // console.log(this.context.props, this.props);
  }

  componentWillMount() {
    if (this.isEdit) {
      let requests = [];
      this.props.schemas.forEach((schema) => {
        const requestURL = this.schemaHandler.getAxapiURL(schema.axapi, schema['obj-name']);
        const request = {
          path: requestURL,
          method: 'GET'
        };
        requests.push(request);
      });
      const result = this.props.comAxapiRequest(requests);
      result.then(() => {
        let data = fromJS(this.props.data);
        if (typeof this.props.onInitialize === 'function') {
          data = this.props.onInitialize(data);
        }
        this.context.props.initialize(data);
        // TODO:
        // after initialized, need reinitialConditional
      });
    }
  }

  // connect
  connectValues(storeData, parsedValues) {
    // console.log(parsedValues);
    // const { fieldConnector: { options: { connectToApiStore } } } = this.context.props;
    let primaryObj = parsedValues.first(), mergingObj = Map(), copyStoreData = [];
    storeData.forEach((apiRequestData) => {
      if (apiRequestData.connectOptions) {
        const { connectToApiStore: { source, target, targetIsArray } } = apiRequestData.connectOptions;
        const value = source ? apiRequestData.body.getIn([ source ]) : apiRequestData.body;
        if (targetIsArray || storeData.length > 1) {
          let l = mergingObj.getIn(toPath(target), List());
          l = l.push(value);
          mergingObj = mergingObj.setIn( toPath(target), l);
        } else {
          mergingObj =  mergingObj.setIn( toPath(target), value);
        }
      } else {
        copyStoreData.push(apiRequestData);
      }
    });

    if (mergingObj.size) {
      // console.log('parsed values on default submitter', mergingObj.toJS());
      primaryObj.body = primaryObj.body.mergeDeep(mergingObj);
      parsedValues = parsedValues.set(0, primaryObj);
    }

    if (copyStoreData.length) {
      return parsedValues.concat(copyStoreData);
    } else {
      return parsedValues;
    }

  }

  defaultHandleSubmit(values, form, save=true) {
    let parsedValues = values;
    // console.log('parsed values::::', parsedValues);

    if (save) {
      // console.log('test......0.1');
      let storeData = getAppValueStore(this.props.app);
      if (storeData.length) {
        parsedValues = this.connectValues(storeData, parsedValues);
      }
      const promise = this.props.comAxapiRequest(parsedValues, true);
      // console.log(' returned promise ', promise);
      if (promise) {
        // TODO: release the store
        // promise.finally(() => {
        //   this.context.props.storeApiInfo(form, false);
        // });
        // console.log('returned from propmise');
      }

      return promise;
    } else {
      // console.log('dont save');
      // console.log(values, form, save);
      this.context.props.storeApiInfo(form, parsedValues, this.context.props.fieldConnector.options);
      return new Promise((resolve, reject) => { // eslint-disable-line
        resolve(parsedValues);
      });
    }
  }

  dataFinalize(values) {
    let newValues = values;
    const instanceParentPath = this.props.findParent(A10SchemaForm.displayName);
    // console.log(instanceParentPath);
    const formFields = this.props.app.getIn([ ...instanceParentPath, FORM_FIELD_KEY ]);
    formFields.forEach((fieldProps, fieldName) => {
      const visible = fieldProps.getIn([ 'conditionals', 'visible' ]);

      if (!visible) {
        newValues = newValues.deleteIn(toPath(fieldName));
      }
    });

    return newValues;
  }

  render() {
    const {
      instancePath,
      targetInstancePath,
      children,
      onBeforeSubmit,
      onAfterSubmit,
      onSubmit,
      // Form props
      bsClass,
      componentClass,
      horizontal,
      inline
    } = this.props;
    // console.log(data);
    // console.log('render at A10Form');
    // console.log(urlParams, 'is url keys...............');
    const { handleSubmit, fieldConnector } = this.context.props;
    // const parentInstancePath = this.props.findParent('A10SchemaForm');
    // console.log(this.context.props, this.props);
    let submit = (values) => {
      // validation triggle
      const parentInstancePath = this.props.findParent(A10SchemaForm.displayName);
      this.props.comTriggleValidation(parentInstancePath);
      // console.log('test234............');

      let newValues = this.schemaHandler.parseValues(values),
        patchedValues = Map(),
        submitFunc = this.defaultHandleSubmit;

      if (onBeforeSubmit) {
        patchedValues = onBeforeSubmit(newValues);
      }
      // console.log('test............');

      // let visible data hidden
      newValues = this.dataFinalize(newValues);
      // console.log('test............1', newValues);

      // patch values need keep outside newValues, otherwise, data finalizer could be remove it by visible
      newValues = newValues.mergeDeep(fromJS(patchedValues));

      if (onSubmit) {
        submitFunc = onSubmit;
      }
      // console.log(submitFunc);

      let result = null;
      if (has(fieldConnector , 'options.connectToValue')) {
        // console.log('3');
        // fieldConnector.connectToValues(newValues);
        result = submitFunc.call(this, newValues, instancePath[0], false);
        // console.log('3.1');
      } else {
        // console.log('4');
        result = submitFunc.call(this, newValues, instancePath[0], true);
        // console.log('5');
        // fieldConnector.connectToResult(result);
        if (onAfterSubmit) {
          result = onAfterSubmit.call(this, result);
        }
      }

      result.then(() => {
        this.props.kickBall(UPDATE_TARGET_DATA, newValues, targetInstancePath );
        if (this.context.props.modal) {
          this.props.kickBall(HIDE_COMPONENT_MODAL, null, parentInstancePath);
        } else {
          this.props.kickBall(REDIRECT_ROUTE, { path: 'list' });
        }

      });
      return result;
    };

    // console.log('.......................................', children);
    const formProps = { bsClass, componentClass, horizontal, inline };
    return (
      <Form onSubmit={ handleSubmit(submit) } { ...formProps }>
        { children }
      </Form>
    );
  }
}

export default widgetWrapper((state) => {
  return {
    // env: getAppEnvVar(state),
    app: state.getIn([ 'app' ]),
    form: state.getIn([ 'form' ])
  };
})(A10SchemaForm);
