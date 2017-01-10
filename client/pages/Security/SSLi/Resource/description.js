

export const sampleDescripton = {
  'network': 'Network: For SSLi to work, a number of servers require configuration. These servers will be included inside different service groups, which, in turn, will be included in the virtual server with the wildcard VIP 0.0.0.0.On the Inside partition, one server will be configured and will have the IP address of the Outside partition.This will ensure that traffic is forwarded from the Inside partition to the Outside partition, being inspectedby Cisco FirePOWER in transit. A total of three wildcard ports — port 0 tcp, port 0 udp and port 8443 tcp —will be configured under the server on the Inside partition, to ensure that both TCP and UDP traffic types are handled. Port 8443 tcp is used for decrypted traffic once port translation takes place and HTTPS traffic is converted to HTTP.',
  'system': 'System: For SSLi to work, a number of servers require configuration. These servers will be included inside different service groups, which, in turn, will be included in the virtual server with the wildcard VIP 0.0.0.0.On the Inside partition, one server will be configured and will have the IP address of the Outside partition.This will ensure that traffic is forwarded from the Inside partition to the Outside partition, being inspectedby Cisco FirePOWER in transit. A total of three wildcard ports — port 0 tcp, port 0 udp and port 8443 tcp —will be configured under the server on the Inside partition, to ensure that both TCP and UDP traffic types are handled. ',
  'internal': 'Internal: For SSLi to work, a number of servers require configuration. These servers will be included inside different service groups, which, in turn, will be included in the virtual server with the wildcard VIP 0.0.0.0.On the Inside partition, one server will be configured and will have the IP address of the Outside partition.This will ensure that traffic is forwarded from the Inside partition to the Outside partition, being inspectedby Cisco FirePOWER in transit.'
};
