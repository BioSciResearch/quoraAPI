/* 
  This function generates a minimal header to get a response from multiFeedQuery.
  This header can be used for any tribe/space.
*/

const axios = require('axios');
const { getQueryKey } = require('./getQueryKey');
const { getHeader } = require('./getHeader');

async function getSession(tribe='quoraspacesupdates', user='Adam-DAngelo') {
  const tribeQueryKey = await getQueryKey('tribe', tribe)
  const userQueryKey = await getQueryKey('user', user)
  const header = await getHeader(tribe)

  // Minimal api header to get post response. (update every ~12hr)
  const session = {
    ...header,
    tribeQueryKey,
    userQueryKey,
    unix: new Date()
  }

  console.log('Session:', session)
  return session
}

exports.getSession = getSession
