const soap = require('soap');
require('dotenv').config();

const WSDL_URL = 'https://msmsenterpriseapi.mobitel.lk/mSMSEnterpriseAPI/mSMSEnterpriseAPI.wsdl';

async function getClient() {
  const client = await soap.createClientAsync(WSDL_URL);
  return client;
}

async function createSession(username, password) {
  const client = await getClient();
  const user = {
    id: '',
    username: username,
    password: password,
    customer: ''
  };
  const createSessionArgs = { user };
  try {
    const [result] = await client.createSessionAsync(createSessionArgs);
    return result.return;
  } catch (error) {
    throw error;
  }
}

async function sendSms(session, alias, message, recipients) {
  try {
    const client = await getClient();

    const smsMessage = {
      message: message,
      messageId: "",
      recipients: recipients,
      retries: "",
      sender: alias,
      messageType: 0,
      sequenceNum: "",
      status: "",
      time: "",
      type: "",
      user: ""
    };

    const sendMessagesArgs = { session: session, smsMessage: smsMessage };
    const [result] = await client.sendMessagesAsync(sendMessagesArgs);
    return result.return;
  } catch (error) {
    throw error;
  }
}

async function closeSession(session) {
  try {
    const client = await getClient();
    const closeSessionArgs = { session: session };
    await client.closeSessionAsync(closeSessionArgs);
  } catch (error) {
    throw error;
  }
}

module.exports = {
  createSession,
  sendSms,
  closeSession
};
