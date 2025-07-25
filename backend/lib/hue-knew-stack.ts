import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigw from 'aws-cdk-lib/aws-apigateway';
import * as iam from 'aws-cdk-lib/aws-iam'; 

export class HueKnewStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const createGameFn = new lambda.Function(this, 'CreateGameFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('lambdas/create-game', {
        exclude: ['cdk.out', '**/*.ts', '**/*.map', 'test', '.git'],
      }),
    });

//    createGameFn.addEnvironment("CDK_FORCE_DEPLOY", new Date().toISOString());

    createGameFn.role?.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole')
    );

    new apigw.LambdaRestApi(this, 'HueKnewApi', {
      handler: createGameFn,
    });
  }
}
