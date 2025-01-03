const soap = require('soap');
const { promisify } = require('util');
const axios = require('axios');

const verifyWSDLAccess = async () => {
  try {
    await axios.get('https://msmsenterpriseapi.mobitel.lk/mSMSEnterpriseAPI/mSMSEnterpriseAPI.wsdl');
    console.log('WSDL endpoint is accessible');
    return true;
  } catch (error) {
    console.error('WSDL access error:', error.message);
    return false;
  }
};

const createSMSClient = async (config) => {
  try {
    console.log('SMS Configuration:', {
      username: config.username,
      hasPassword: !!config.password,
      customer: config.customer || '+94766308272'
    });

    const isWSDLAccessible = await verifyWSDLAccess();
    if (!isWSDLAccessible) {
      throw new Error('WSDL endpoint is not accessible');
    }

    const wsdlUrl = 'https://msmsenterpriseapi.mobitel.lk/mSMSEnterpriseAPI/mSMSEnterpriseAPI.wsdl';
    const client = await soap.createClientAsync(wsdlUrl);

    if (!client) {
      throw new Error('Failed to create SOAP client');
    }

    client.createSessionAsync = promisify(client.createSession);
    client.sendMessagesAsync = promisify(client.sendMessages);
    client.closeSessionAsync = promisify(client.closeSession);

    return client;
  } catch (error) {
    console.error('Error creating SMS client:', error);
    throw new Error(`Failed to create SMS client: ${error.message}`);
  }
};

const createSession = async (client, config) => {
  try {
    const user = {
      id: '',
      username: config.username,
      password: config.password,
      customer: config.customer || '+94766308272'
    };

    console.log('Creating session with user:', JSON.stringify(user, null, 2));
    const result = await client.createSessionAsync({ user });

    console.log('SOAP Request/Response Completed');
    console.log('Session creation raw result:', JSON.stringify(result, null, 2));

    if (!result || !result[0] || !result[0].return) {
      console.error('Raw SOAP Response:', JSON.stringify(result));
      throw new Error('Session creation failed: No session ID returned');
    }

    return result[0].return;
  } catch (error) {
    console.error('Detailed session creation error:', error);
    throw new Error(`Failed to create SMS session: ${error.message}`);
  }
};


const sendMessage = async (client, session, alias, message, recipients, messageType = 0) => {
  try {
    if (!session) {
      throw new Error('Valid session is required');
    }

    if (!alias || !message || !recipients || recipients.length === 0) {
      throw new Error('Sender alias, message, and recipients are required');
    }

    const smsMessage = {
      message,
      messageId: Date.now().toString(),
      recipients: Array.isArray(recipients) ? recipients : recipients.split(','),
      retries: '3',
      sender: alias,
      messageType,
      sequenceNum: '1',
      status: 'PENDING',
      time: new Date().toISOString(),
      type: 'NORMAL',
      user: ''
    };

    console.log('Sending SMS with:', JSON.stringify(smsMessage, null, 2));
    const result = await client.sendMessagesAsync({
      session,
      smsMessage
    });
    console.log('SMS send result:', JSON.stringify(result, null, 2));

    if (!result || !result[0] || !result[0].return) {
      throw new Error('Message sending failed: No confirmation received');
    }

    return result[0].return;
  } catch (error) {
    console.error('Error sending message:', error);
    throw new Error(`Failed to send SMS message: ${error.message}`);
  }
};

const closeSession = async (client, session) => {
  try {
    if (!session) {
      console.warn('No session to close');
      return;
    }

    console.log('Closing session:', session);
    await client.closeSessionAsync({ session });
    console.log('Session closed successfully');
  } catch (error) {
    console.error('Error closing session:', error);
    throw new Error(`Failed to close SMS session: ${error.message}`);
  }
};

module.exports = {
  createSMSClient,
  createSession,
  sendMessage,
  closeSession,
  verifyWSDLAccess
};