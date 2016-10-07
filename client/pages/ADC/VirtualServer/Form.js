import React from 'react';
import { FieldArray } from 'redux-form/immutable'; // imported Field
import { FormControl, Button, Col, Row, Panel, Radio, Checkbox, Table } from 'react-bootstrap';
import Helmet from 'react-helmet';
// import { isEqual } from 'lodash';
import { fromJS, Map } from 'immutable';
// import { SubmissionError } from 'redux-form';
import { A10Button, A10FieldSubmit } from 'components/Form/A10Button';
import { A10Field, A10SchemaField } from 'components/Form/A10Field';
import A10Form from 'components/Form/A10Form';

import AppManager from 'helpers/AppManager';
import BaseForm from 'pages/BaseForm';

// import * as logger from 'helpers/logger';
import { isInt } from 'helpers/validations';
import slbVirtualServerSchema from 'schemas/slb-virtual-server.json';

import VirtualPortForm from 'pages/ADC/VirtualPort/Form';

const makeError = (status=true, errMsg='') => ( status ? '' : errMsg );

const ipv4 = (value) => {
  const reg = /^(?:(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?))$/;
  return makeError(reg.test(value), 'IPv4 Required');
};


const renderTable = ({ fields, meta: { touched, error } }) => {
  // fields.map((port) => {
  //   logger.debug(port);
  // });
  let popupInfo = { pageClass: VirtualPortForm, 
    urlKeysConnect: [ 'virtual-server.name' ],
    title: 'Create Virtual Port', 
    pageName: 'virtualPort', 
    bsSize:'lg', 
    connectOptions: {
      connectToValue: {
        'virtual-server.port-list': {
          'port.port-number': 'port.port-number',
          'port.range': 'port.range',
          'port.protocol': 'port.protocol'
        }
      },
      connectToApiStore: {
        targetIsArray: true,
        target: 'virtual-server.port-list',
        source: 'port'
      }
    }
  };
  return (
    <Table responsive>
      <thead>
        <tr>
          <td cols="3">
            <div className="pull-right">
              <Button onClick={() => fields.push({ 
                'port': {
                  'port-number': 81,
                  'range': '80-100',
                  'protocol': 'HTTP'
                }
              })} bsStyle="primary">Add Member</Button>
              <A10Button bsStyle="default" popup={ popupInfo }>Create...</A10Button>

              {touched && error && <span>{error}</span>}
            </div>
          </td>
        </tr>
        <tr>
          <td>Number</td>
          <td>Range</td>
          <td>Protocol</td>
        </tr>
      </thead>  
      <tbody>
      {fields.map((port, index) =>
        <tr key={index}>
          <td>
            <A10SchemaField layout={false} name={`${port}.port.port-number`} validation={{ isInt: isInt }}   />
          </td>

          <td>
            <A10SchemaField layout={false} name={`${port}.port.range`}  conditional={{ [ `${port}.port.port-number` ]: 91 }}/>
          </td>

          <td>     
            <A10SchemaField layout={false} name={`${port}.port.protocol`} >  
              <FormControl componentClass="select">
                <option value="tcp">tcp</option>
                <option value="udp">udp</option>
              </FormControl>
            </A10SchemaField>
          </td>
        </tr>
      )}
      </tbody>
    </Table>
  );
};


class VirtualServerForm extends BaseForm {
  addLine() {
    const valuePath = [ 'values', 'virtual-server', 'port-list' ];
    let list = this.props.pageForm.getIn(valuePath, Map()).toJS();
    list.push({ 
      'port': {
        'port-number': 91,
        'range': '92',
        'protocol': 'tcp'
      }
    });
    this.props.change('virtual-server.port-list', list);
  }

  handleSubmit(v) {
    let values = fromJS(v);
    const pathWildcard = [ 'x', 'virtual-server','wildcard' ];
    if (values.hasIn(pathWildcard) && values.getIn(pathWildcard) === true
       && values.getIn([ 'x', 'virtual-server', 'address-type' ]) === '0') {
      return {
        'virtual-server': {
          'ip-address': '0.0.0.0',
          'netmask': '/24'
        }
      };
    }

    return {};
  }


  render() {
    const { handleSubmit,  ...rest } = this.props; // eslint-disable-line
    const elements = slbVirtualServerSchema.properties;
    return (
      <div className="container-fluid">
        <Helmet title="Edit Virtual Server"/>
        <Row>
          <Col xs={2}>
            <h4>Help  </h4>
            <Button onClick={::this.addLine} > Add a Line </Button>
          </Col>
          <Col xs={10}>                   
              <A10Form onBeforeSubmit={::this.handleSubmit} schemas={[ slbVirtualServerSchema ]} edit={false} horizontal>
                <Row>
                  <Col xs={6}>
                    <Panel header={<h4>Basic Field</h4>}>
                      <A10SchemaField schema={elements['name']} name="virtual-server.name" label="Name" value="vs2" /> 
   

                      <A10SchemaField  name="x.virtual-server.wildcard" component={A10Field} label="Wildcard" value={true}>
                        <Checkbox value={true} />
                      </A10SchemaField>
                      
                      <A10SchemaField name="x.virtual-server.address-type" component={A10Field} label="Address Type" value="0" conditional={{ 'x.virtual-server.wildcard': false }}>
                        <Radio value="0" inline> IPv4 </Radio>
                        <Radio value="1" inline> IPv6 </Radio>
                      </A10SchemaField>

                      <A10SchemaField schema={elements['ip-address']} name="virtual-server.ip-address" label="IPv4 Address" validation={{ ipv4: ipv4 }} conditional={{ 'x.virtual-server.address-type': '0' }} />

                      <A10SchemaField schema={elements['netmask']} name="virtual-server.netmask" component={A10Field} label="Netmask"  conditional={{ 'x.virtual-server.address-type': '0' }} />

                      <A10SchemaField schema={elements['ipv6-address']} name="virtual-server.ipv6-address" component={A10Field} label="IPv6 Address"  conditional={{ 'x.virtual-server.address-type': '1' }} />
                      <A10SchemaField schema={elements['ipv6-acl']} name="virtual-server.ipv6-acl" component={A10Field} label="IPv6 ACL" />
                      <A10SchemaField schema={elements['vrid']} name="virtual-server.vrid" label="VRRP-A" />                       
                    </Panel> 
                  </Col>

                  <Col xs={6}>
                    <Panel header={<h4>Virtual Ports</h4>}>
                      <FieldArray name="virtual-server.port-list" component={renderTable}/>
                    </Panel>
                  </Col>
                </Row>

                <A10FieldSubmit {...rest}/>

              </A10Form>              
          </Col>
        </Row>
      </div>      
    );
  }
}


const initialValues = {
  'virtual-server': {
    'name': 'vs',
    'netmask': '/24',
    'port-list': [
      { 
        'port': {
          'port-number': 80,
          'range': '80-100',
          'protocol': 'HTTP'
        }
      },
      { 
        'port': {
          'port-number': 81,
          'range': '80-101',
          'protocol': 'HTTPS'
        }
      }
    ]
  },
  'x': {
    'virtual-server': {
      'address-type': '0',
      'wildcard': false
    }
  }
};

const InitializeFromStateForm = AppManager({
  page: 'virtualServer',
  form: 'virtualServerForm', 
  initialValues: initialValues
})(VirtualServerForm);

export default InitializeFromStateForm;
