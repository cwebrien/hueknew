import { Stack, StackProps, RemovalPolicy } from 'aws-cdk-lib';
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
      removalPolicy: RemovalPolicy.DESTROY,
    });

    const createGameFn = new lambda.Function(this, 'CreateGameFunction', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('lambdas/create-game', {
        exclude: ['cdk.out', '**/*.ts', '**/*.map', 'test', '.git'],
      }),
      environment: {
        GAME_TABLE_NAME: gameTable.tableName,
      },
    });
    gameTable.grantWriteData(createGameFn);
    createGameFn.role?.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole')
    );

    const submitClueFn = new lambda.Function(this, 'SubmitClueFunction', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('lambdas/submit-clue', {
        exclude: ['cdk.out', '**/*.ts', '**/*.map', 'test', '.git'],
      }),
      environment: {
        GAME_TABLE_NAME: gameTable.tableName,
      },
    });
    gameTable.grantReadWriteData(submitClueFn);
    submitClueFn.role?.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole')
    );

    const joinGameFn = new lambda.Function(this, 'JoinGameFunction', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('lambdas/join-game', {
        exclude: ['cdk.out', '**/*.ts', '**/*.map', 'test', '.git']
      }),
      environment: {
        GAME_TABLE_NAME: gameTable.tableName
      }
    });
    gameTable.grantReadWriteData(joinGameFn);
    joinGameFn.role?.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole')
    );

    const getGameStateFn = new lambda.Function(this, 'GetGameStateFunction', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('lambdas/get-game-state', {
        exclude: ['cdk.out', '**/*.ts', '**/*.map', 'test', '.git'],
      }),
      environment: {
        GAME_TABLE_NAME: gameTable.tableName,
      },
    });
    gameTable.grantReadData(getGameStateFn);
    getGameStateFn.role?.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole')
    );

    const submitGuessFn = new lambda.Function(this, 'SubmitGuessFunction', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('lambdas/submit-guess', {
        exclude: ['cdk.out', '**/*.ts', '**/*.map', 'test', '.git'],
      }),
      environment: { GAME_TABLE_NAME: gameTable.tableName }
    });
    gameTable.grantReadWriteData(submitGuessFn);

    const submitGuess2Fn = new lambda.Function(this, 'SubmitGuess2Function', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('lambdas/submit-guess2', {
        exclude: ['cdk.out', '**/*.ts', '**/*.map', 'test', '.git'],
      }),
      environment: { GAME_TABLE_NAME: gameTable.tableName }
    });
    gameTable.grantReadWriteData(submitGuess2Fn);

    const scoreRoundFn = new lambda.Function(this, 'ScoreRoundFunction', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('lambdas/score-round', {
        exclude: ['cdk.out', '**/*.ts', '**/*.map', 'test', '.git']
      }),
      environment: {
        GAME_TABLE_NAME: gameTable.tableName
      }
    });
    gameTable.grantReadWriteData(scoreRoundFn);

    const api = new apigw.RestApi(this, 'HueKnewApi', {
      defaultCorsPreflightOptions: {
        allowOrigins: apigw.Cors.ALL_ORIGINS,
        allowMethods: apigw.Cors.ALL_METHODS,
      },
    });

    const gameResource = api.root.addResource('game');
    gameResource.addMethod(
      'POST',
      new apigw.LambdaIntegration(createGameFn, {
        integrationResponses: [
          {
            statusCode: '200',
            responseParameters: {
              'method.response.header.Access-Control-Allow-Origin': "'*'",
            },
          },
        ],
      }),
      {
        methodResponses: [
          {
            statusCode: '200',
            responseParameters: {
              'method.response.header.Access-Control-Allow-Origin': true,
            },
          },
        ],
      }
    );

    const gameIdResource = gameResource.addResource('{gameId}');
    gameIdResource.addResource('leader').addMethod('POST', new apigw.LambdaIntegration(submitClueFn));
    gameIdResource.addResource('join').addMethod('POST', new apigw.LambdaIntegration(joinGameFn));
    gameIdResource.addResource('state').addMethod('GET', new apigw.LambdaIntegration(getGameStateFn));
    gameIdResource.addResource('guess').addMethod('POST', new apigw.LambdaIntegration(submitGuessFn));
    gameIdResource.addResource('guess2').addMethod('POST', new apigw.LambdaIntegration(submitGuess2Fn));
    gameIdResource.addResource('score').addMethod('POST', new apigw.LambdaIntegration(scoreRoundFn));
  }
}