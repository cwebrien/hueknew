import { Stack, StackProps } from 'aws-cdk-lib';
import { RemovalPolicy } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigw from 'aws-cdk-lib/aws-apigateway';
import * as iam from 'aws-cdk-lib/aws-iam'; 

export class HueKnewStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const gameTable = new dynamodb.Table(this, 'HueKnewGames', {
      partitionKey: { name: 'gameId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.DESTROY // ❗ for dev only — change to RETAIN in prod
    });

    const createGameFn = new lambda.Function(this, 'CreateGameFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('lambdas/create-game', {
        exclude: ['cdk.out', '**/*.ts', '**/*.map', 'test', '.git']
      }),
      environment: {
        GAME_TABLE_NAME: gameTable.tableName
      }
    });

    gameTable.grantWriteData(createGameFn);


    createGameFn.role?.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole')
    );

    new apigw.LambdaRestApi(this, 'HueKnewApi', {
      handler: createGameFn,
      defaultCorsPreflightOptions: {
        allowOrigins: apigw.Cors.ALL_ORIGINS,
        allowMethods: apigw.Cors.ALL_METHODS,
      },
    });
  }
}
