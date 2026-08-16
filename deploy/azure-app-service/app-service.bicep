@description('The name of the App Service')
param appName string = 'notg-reader'

@description('The location for all resources')
param location string = resourceGroup().location

@description('The SKU of the App Service Plan')
param sku string = 'B1'

resource appServicePlan 'Microsoft.Web/serverfarms@2022-09-01' = {
  name: '${appName}-plan'
  location: location
  kind: 'linux'
  sku: {
    name: sku
  }
  properties: {
    reserved: true
  }
}

resource appService 'Microsoft.Web/sites@2022-09-01' = {
  name: appName
  location: location
  properties: {
    serverFarmId: appServicePlan.id
    siteConfig: {
      linuxFxVersion: 'NODE|22-lts'
      alwaysOn: true
      httpLoggingEnabled: true
      minTlsVersion: '1.2'
      ftpsState: 'Disabled'
      appSettings: [
        {
          name: 'NODE_ENV'
          value: 'production'
        }
        {
          name: 'PORT'
          value: '3001'
        }
        {
          name: 'WEBSITES_PORT'
          value: '3001'
        }
      ]
    }
    httpsOnly: true
  }
}

output appServiceUrl string = 'https://${appService.properties.defaultHostName}'
