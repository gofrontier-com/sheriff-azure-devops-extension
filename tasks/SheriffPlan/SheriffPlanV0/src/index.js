#!/usr/bin/env node

const tl = require('azure-pipelines-task-lib/task');

async function run() {
  try {
    const connectedService = tl.getInput('serviceConnectionName', true);
    const authScheme = tl.getEndpointAuthorizationScheme(connectedService, true);
    // const subscriptionID = tl.getEndpointDataParameter(connectedService, 'SubscriptionID', true);

    if (authScheme.toLowerCase() === 'workloadidentityfederation') {
      tl.debug('workload identity federation based endpoint');
    } else if (authScheme.toLowerCase() === 'serviceprincipal') {
      const authType = tl.getEndpointAuthorizationParameter(connectedService, 'authenticationType', true);

      if (authType === 'spnCertificate') {
        tl.debug('certificate based endpoint');
      } else {
        tl.debug('key based endpoint');
      }
    } else if (authScheme.toLowerCase() === 'managedserviceidentity') {
      tl.debug('managed service identity based endpoint');
    } else {
      throw new Error(`Authentication scheme ${authScheme} is not supported`);
    }
  } catch (err) {
    if (err instanceof Error) {
      tl.setResult(tl.TaskResult.Failed, err.message);
    } else {
      tl.setResult(tl.TaskResult.Failed, 'Unknown error');
    }
  }
}

run();
