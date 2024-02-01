#!/usr/bin/env node

const tl = require('azure-pipelines-task-lib/task');

async function run() {
  try {
    const configDir = tl.getInput('configDir', false);
    const connectedService = tl.getInput('serviceConnectionName', true);
    const mode = tl.getInput('mode', true);
    const planOnly = (tl.getInput('planOnly', false) === 'true');

    let subscriptionId = tl.getInput('subscriptionId', false);

    const env = {};

    const authScheme = tl.getEndpointAuthorizationScheme(connectedService, true);
    if (!subscriptionId) {
      subscriptionId = tl.getEndpointDataParameter(connectedService, 'SubscriptionID', true);
    }

    env.AZURE_SUBSCRIPTION_ID = subscriptionId;

    if (authScheme.toLowerCase() === 'workloadidentityfederation') {
      tl.debug('workload identity federation scheme');
      throw new Error('Workload identity federation scheme not implemented');
    } else if (authScheme.toLowerCase() === 'serviceprincipal') {
      tl.debug('service principal scheme');
      const authType = tl.getEndpointAuthorizationParameter(connectedService, 'authenticationType', false);

      const servicePrincipalId = tl.getEndpointAuthorizationParameter(connectedService, 'serviceprincipalid', false);
      env.AZURE_CLIENT_ID = servicePrincipalId;

      const tenantId = tl.getEndpointAuthorizationParameter(connectedService, 'tenantid', false);
      env.AZURE_TENANT_ID = tenantId;

      if (authType === 'spnCertificate') {
        tl.debug('certificate based endpoint');
        throw new Error('certificate based service principal scheme not implemented');
      } else {
        tl.debug('key based endpoint');
        const servicePrincipalKey = tl.getEndpointAuthorizationParameter(connectedService, 'serviceprincipalkey', false);
        env.AZURE_CLIENT_SECRET = servicePrincipalKey;
      }
    } else if (authScheme.toLowerCase() === 'managedserviceidentity') {
      tl.debug('managed service identity scheme');
      throw new Error('managed service identity scheme not implemented');
    } else {
      throw new Error(`Authentication scheme ${authScheme} is not supported`);
    }

    await tl.execAsync(
      'sheriff',
      [
        'apply',
        mode,
        configDir ? '--config-dir' : '',
        configDir,
        '--subscription-id',
        subscriptionId,
        planOnly ? '--plan-only' : '',
      ],
      {
        env: {
          ...process.env,
          ...env,
        },
        silent: false,
      },
    );

    tl.setResult(tl.TaskResult.Succeeded, 'Success');
  } catch (err) {
    if (err instanceof Error) {
      tl.setResult(tl.TaskResult.Failed, err.message);
    } else {
      tl.setResult(tl.TaskResult.Failed, 'Unknown error');
    }
  }
}

run();
