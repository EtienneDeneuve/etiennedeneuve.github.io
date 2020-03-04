---
layout: layouts/post-sidebar.njk
title: 'Azure Devops'
summary: "I was looking for the easiest way to test Azure infrastructure."
# hero: /images/posts/chromeextensions.png
# thumb: /images/posts/chromeextensions_tn.png
sidebar: infratesting
# mySlug: infra-testing-easy-path
# permalink: "{{ page.date | date: '%Y/%m/%d' }}/{{ mySlug }}/04_azure_devops/index.html"
eleventyNavigation:
  key: seven-styles
  sidebar: infratesting
  title: 'Azure Devops'
  parent: infra-testing
  order: 3
updateDate: 2020-02-28 12:35:17
date: 2020-02-07 12:35:17
tags:
  - Azure
  - PowerShell
  - Azure Devops
  - Cloud
  - Tests
---
## Azure Devops

### Azure Devops CLI

Get a Personal Access Token here : `https://dev.azure.com/<YourOrganisation>/_usersSettings/tokens`

``` shell
az extension add --name azure-devops
az devops login
# paste your PAT
az login
# with the sam
az account set -s <YOUR SUB>
az devops configure --defaults 'organization=https://dev.azure.com/etiennedeneuve'
az devops project create --name GherkinTest
# Store the repo git url to configure the repo locally, you will need a SSH Key for that.
$repo=$(az repos list --project GherkinTest --query [].sshUrl -o tsv)
```

### Configure the repo locally

``` shell
cd ~/GherkinTest
git init
git remote add origin $repo
git add .
git commit -m 'inital commit'
git push origin master
```

### Create the pipeline

``` shell
az pipelines create --name "GherkinTest"
```

Answer the questions like :

``` shell
This command is in preview. It may be changed/removed in a future release.
Which template do you want to use for this pipeline?
 [1] Starter pipeline
 [2] Android
 [3] Ant
 [4] ASP.NET
 [5] ASP.NET Core
 [6] .NET Core Function App to Windows on Azure
 [7] ASP.NET Core (.NET Framework)
Please enter a choice [Default choice(1)]: Starter pipeline

Do you want to view/edit the template yaml before proceeding?
Please enter a choice [Default choice(1)]: Continue with generated yaml

Files to be added to your repository (1)
1) azure-pipelines.yml

How do you want to commit the files to the repository?
Please enter a choice [Default choice(1)]: Create a new branch for this commit and start a pull request.

Enter new branch name to create: features/cicd
Checking in file azure-pipelines.yml in the Azure repo c279436a-e2f4-4e01-8f41-a30f660f7515
Created a Pull Request - https://dev.azure.com/etiennedeneuve/6874897d-6d09-412e-b73b-4b2966c04b64/_apis/git/repositories/c279436a-e2f4-4e01-8f41-a30f660f7515/pullRequests/1
Successfully created a pipeline with Name: GherkinTest, Id: 25.
{
  "agentSpecification": null,
  "buildNumber": "20200214.1",
  "buildNumberRevision": 1,
  "controller": null
}
```

### Create the Service Endpoint for Azure RM Subscription

First we need to create a SPN in Azure AD :

``` shell
az ad sp create-for-rbac --name AzureDevops
Changing "AzureDevops" to a valid URI of "http://AzureDevops", which is the required format used for service principal names
Creating a role assignment under the scope of "/subscriptions/1417c648-XXXX"

{
  "appId": "41176fe8-XXXXX",
  "displayName": "AzureDevops",
  "name": "http://AzureDevops",
  "password": "7eaeb380-XXXXX",
  "tenant": "06329ce4-XXXX"
}
```

Take note of the appId, Name, Password and Tenant.

Now, list your subscriptions :

``` shell
az account show
{
  "environmentName": "AzureCloud",
  "id": "1417c648-XXXXX",
  "isDefault": true,
  "name": "Microsoft XXXX",
  "state": "Enabled",
  "tenantId": "06329ce4-XXXX",
  "user": {
    "name": "etienne@deneuve.xyz",
    "type": "user"
  }
}
```

Take note of the Id, Name, and Tenant.

And then create the service endpoint in Azure DevOps :

``` shell
 az devops service-endpoint azurerm create --name 'Azure MVP' `
>> --azure-rm-tenant-id "YourTenantId" `
>>     --azure-rm-service-principal-id "AppID" `
>>     --azure-rm-subscription-id "SubID" `
>>     --azure-rm-subscription-name "Name of the Sub"
Azure RM service principal key: "Password"
Confirm Azure RM service principal key: "Password"
{
  "administratorsGroup": null,
   < shortened >
  "type": "azurerm",
  "url": "https://management.azure.com/"
}
```

### Configure the pipeline

Now, checkout to the newly created branch :

``` shell
# change branch
git checkout features/cicd
# get latests info from remote
git pull
# open code in the current folder
code .
```

Add the following snippet into `azure-pipelines.yml` :

``` yaml
# ./azure-pipelines.yml
# Starter pipeline
# Start with a minimal pipeline that you can customize to build and deploy your code.
# Add steps that build, run tests, deploy, and more:
# https://aka.ms/yaml

trigger:
- master

pool:
  vmImage: 'windows-latest'

steps:
- task: AzurePowerShell@5
  inputs:
    azurePowerShellVersion: LatestVersion
    azureSubscription: 'Azure MVP'
    Inline: |
      Install-Module -Name Pester -Force
    ScriptType: InlineScript
    pwsh: true
    workingDirectory: $(Build.Repository.LocalPath)
  displayName: 'Install Pester'

- task: AzurePowerShell@5
  inputs:
    azurePowerShellVersion: LatestVersion
    azureSubscription: 'Azure MVP'
    Inline: |
      Invoke-Gherkin -OutputFile result.xml -OutputFormat NUnitXml
    ScriptType: InlineScript
    pwsh: true
    workingDirectory: $(Build.Repository.LocalPath)
  displayName: 'Launch Test'

- task: PublishTestResults@2
  inputs:
    buildConfiguration: Azure
    buildPlatform: Azure
    publishRunAttachments: true
    testResultsFiles: result.xml
    testResultsFormat: NUnit
    testRunTitle: ValidateAzure
```

Commit the file :

``` shell
git add azure-pipelines.yaml
git commit -m 'feat: add cicd for tests'
git push origin features/cicd
```

Go in your Azure Devops project, select your new pipeline, and go in Tests, you should have something like my public repo :

[Azure Devops](https://dev.azure.com/etiennedeneuve/gherkintest/_build/results?buildId=357&view=ms.vss-test-web.build-test-results-tab)

*Et Voila!*