const soap = require('soap');
const { promisify } = require('util');

const createSMSClient = async (config) => {
  const wsdlUrl = 'https://msmsenterpriseapi.mobitel.lk/mSMSEnterpriseAPI/mSMSEnterpriseAPI.wsdl';
  const client = await soap.createClientAsync(wsdlUrl);
  client.createSessionAsync = promisify(client.createSession);
  client.sendMessagesAsync = promisify(client.sendMessages);
  client.closeSessionAsync = promisify(client.closeSession);

  return client;
};

const createSession = async (client, config) => {
  try {
    const user = {
      id: '',
      username: config.username,
      password: config.password,
      customer: config.customer || ''
    };

    const result = await client.createSessionAsync({ user });
    console.log('createSessionAsync result:', result);

    // Check response structure and extract session
    const session = result[0]?.return || result?.return;
    if (!session) {
      throw new Error('Session not returned in SOAP response');
    }

    return session;
  } catch (error) {
    console.error('Error creating session:', error.response?.body || error);
    throw new Error('Failed to create SMS session');
  }
};


const sendMessage = async (client, session, alias, message, recipients, messageType = 0) => {
  try {
    if (!session) {
      throw new Error('Session not created');
    }

    const smsMessage = {
      message,
      messageId: '',
      recipients: Array.isArray(recipients) ? recipients : recipients.split(','),
      retries: '',
      sender: alias,
      messageType,
      sequenceNum: '',
      status: '',
      time: '',
      type: '',
      user: ''
    };

    const result = await client.sendMessagesAsync({
      session,
      smsMessage
    });

    return result[0].return;
  } catch (error) {
    console.error('Error sending message:', error);
    throw new Error('Failed to send SMS message');
  }
};

const closeSession = async (client, session) => {
  try {
    if (session) {
      await client.closeSessionAsync({ session });
    }
  } catch (error) {
    console.error('Error closing session:', error);
    throw new Error('Failed to close SMS session');
  }
};

module.exports = {
  createSMSClient,
  createSession,
  sendMessage,
  closeSession
};