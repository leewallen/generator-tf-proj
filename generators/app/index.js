'use strict';
const Generator = require('yeoman-generator');
const chalk = require('chalk');
const yosay = require('yosay');
const accounts = require('./templates/accounts.json');
const providers = require('./templates/providers.json');
const backends = require('./templates/backends.json');

module.exports = class extends Generator {
  prompting() {
    // Have Yeoman greet the user.
    this.log(
      yosay(
        'Welcome to the ' + chalk.green('generator-tf-proj') + ' generator!'
      )
    );

    const prompts = [
      {
        type: 'input',
        name: 'appDescription',
        message:
          'Please provide a project description: ',
        validate: input => input.length > 0
      },
      {
        type: 'input',
        name: 'subgroups',
        message:
          'What are the logical group names for your project (separate multiple responses by comma)? ',
        default: 'solr,zookeeper',
        choices: Object.keys(accounts),
        store: true,
        validate: input => input.length > 0
      },
      {
        type: 'input',
        name: 'environments',
        message:
          'What logical environments will you be running (separate multiple responses by comma)? ',
        default: 'sandbox,candidate,stage,prod',
        store: true,
        validate: input => input.length > 0
      },
      {
        type: 'input',
        name: 'regions',
        message:
          'What regions will you be running in (separate multiple responses by comma)? ',
        default: 'us-west-2,us-east-1',
        store: true
      },
      {
        type: 'input',
        name: 'components',
        message:
          'What components will you be running (separate multiple responses by comma)? ',
        default: 'ec2,networking,lambda,s3',
        store: true
      },
      {
        type: 'list',
        name: 'provider',
        message:
          'What Terraform provider will you be using? (Full list of providers here: https://www.terraform.io/docs/providers) ',
        choices: Object.keys(providers)
      },
      {
        type: 'input',
        name: 'providerVersion',
        message: 'What is the provider version? ',
        default: '1.7',
        store: true
      },
      {
        type: 'input',
        name: 'appgroup',
        message: 'What is your application group name? (optional) ',
        default: 'search',
        store: true
      },
      {
        type: 'input',
        name: 'businessowner',
        message: 'Who is the business owner? (optional) ',
        store: true
      },
      {
        type: 'list',
        name: 'backend',
        message:
          'What state backend will you be using? (Full list of backends here: https://www.terraform.io/docs/backend/types/index.html) ',
        choices: Object.keys(backends)
      },
      {
        when: props => props.backend === 's3',
        type: 'input',
        name: 'backendBucketName',
        message: 'Name of the S3 Bucket for remote terraform state: ',
        default: 'my-bucket',
        store: true,
        validate: input => input.length > 0
      },
      {
        when: props => props.backend === 's3',
        type: 'input',
        name: 'backendBucketKeyPrefix',
        message: 'The key prefix for the remote terraform state files: ',
        default: 'terraform-remote-state',
        validate: input => input.length > 0
      },
      {
        when: props => props.backend === 's3',
        type: 'input',
        name: 'backendBucketRegion',
        message: 'The AWS region for the S3 Bucket',
        default: 'us-west-2',
        validate: input => input.length > 0
      },
      {
        when: props => props.backend === 's3',
        type: 'input',
        name: 'backendRoleArn',
        message: 'The default role arn to use when reading/writing the terraform state: ',
        default: 'arn:aws:iam::ENTER_AN_ACCOUNT_NUMBER:role/ENTER_A_ROLE_NAME',
        validate: input => input.length > 0
      },
      {
        when: props => props.backend === 'local',
        type: 'input',
        name: 'backendLocalPathPrefix',
        message: 'The path prefix for the local terraform state: ',
        default: 'terraform-local-state',
        validate: input => input.length > 0
      }
    ];

    return this.prompt(prompts).then(props => {
      this.props = props;
    });
  }

  writingSubGroups() {
    var subgroups = this.props.subgroups.split(',');
    var environments = this.props.environments.split(',');
    var regions = this.props.regions.split(',');
    var components = this.props.components.split(',');

    // create subgroup folders
    for (let region of regions) {
      for (let environment of environments) {
        for (let subgroup of subgroups) {
          this.fs.copyTpl(
            this.templatePath('subgroups/environments/regions/main.tf'),
            this.destinationPath(
              `${subgroup}/${environment}/${region}/main.tf`
            ),
            {
              provider: this.props.provider,
              providerAttributes: providers[this.props.provider],
              appName: this.props.appName,
              backend: this.props.backend,
              components: components
            }
          );
          this.fs.copyTpl(
            this.templatePath('subgroups/environments/regions/terraform.tfvars'),
            this.destinationPath(
              `${subgroup}/${environment}/${region}/terraform.tfvars`
            ),
            {
              environment: environment,
              region: region,
              appgroup: this.props.appgroup,
              accounts: accounts,
              environment: `${environment}`,
              businessowner: this.props.businessowner
            }
          );
          this.fs.copyTpl(
            this.templatePath('subgroups/environments/regions/backend.tf'),
            this.destinationPath(
              `${subgroup}/${environment}/${region}/backend.tf`
            ),
            {
              provider: this.props.provider,
              providerVersion: this.props.providerVersion,
              providerAttributes: providers[this.props.provider],
              backend: this.props.backend,
              region: region,
              environment: environment,
              backendBucketRegion: this.props.backendBucketRegion,
              backendBucketName: this.props.backendBucketName,
              backendBucketKeyPrefix: this.props.backendBucketKeyPrefix,
              backendRoleArn: this.props.backendRoleArn,
              backendLocalPathPrefix: this.props.backendLocalPathPrefix,
              components: components
            }
          );
          this.fs.copyTpl(
            this.templatePath('README.md'),
            this.destinationPath(`README.md`),
            {
              appName: this.appname,
              appDescription: this.props.appDescription,
              components: components,
              regions: regions,
              environments: environments
            }
          );
          this.fs.copy(this.templatePath('gitignore'), this.destinationPath('.gitignore'));
        }
      }
    }

  }


  writingModules() {
    var components = this.props.components.split(',');
    for (let component of components) {
      // Creates module folders
      this.fs.copy(
        this.templatePath('modules/main.tf'),
        this.destinationPath(`modules/${component}/main.tf`)
      );
      this.fs.copyTpl(
        this.templatePath('modules/module.tf'),
        this.destinationPath(`modules/${component}/${component}.tf`),
        { component: component }
      );
    }
  }

  install() {}
};
