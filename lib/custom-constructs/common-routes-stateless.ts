import { Construct } from "constructs";
import * as nodeLambda from 'aws-cdk-lib/aws-lambda-nodejs'
import * as cdk from 'aws-cdk-lib'
import * as apigatewayv2 from 'aws-cdk-lib/aws-apigatewayv2'
import * as iam from 'aws-cdk-lib/aws-iam'


export class CommonRoutesStateless extends Construct{
    props: {
        table: cdk.aws_dynamodb.Table;
        api: cdk.aws_apigatewayv2.CfnApi,
        authorizer: cdk.aws_apigatewayv2.CfnAuthorizer;
    }

    getTokenFunction: nodeLambda.NodejsFunction;
    getTokenIntegration: cdk.aws_apigatewayv2.CfnIntegration;
    getTokenRoute: cdk.aws_apigatewayv2.CfnRoute;

    getSchools: cdk.aws_lambda_nodejs.NodejsFunction;
    getSchoolsIntegration: cdk.aws_apigatewayv2.CfnIntegration;
    getSchoolsRoute: cdk.aws_apigatewayv2.CfnRoute;
    getThreads: nodeLambda.NodejsFunction;
    getThreadsIntegration: cdk.aws_apigatewayv2.CfnIntegration;
    getThreadsRoute: cdk.aws_apigatewayv2.CfnRoute;
    getMessages: nodeLambda.NodejsFunction;
    getMessagesIntegration: cdk.aws_apigatewayv2.CfnIntegration;
    getMessagesRoute: cdk.aws_apigatewayv2.CfnRoute;
    deleteThread: nodeLambda.NodejsFunction;
    deleteThreadIntegration: cdk.aws_apigatewayv2.CfnIntegration;
    deleteThreadRoute: cdk.aws_apigatewayv2.CfnRoute;

    constructor(scope: Construct,id: string,props: {
        table: cdk.aws_dynamodb.Table;
        api: cdk.aws_apigatewayv2.CfnApi,
        authorizer: cdk.aws_apigatewayv2.CfnAuthorizer;
    }){
        super(scope,id);
        this.props = props
        

        this.getSchools = new nodeLambda.NodejsFunction(this,"getSchoolsFunction",this.lambdaConfig("./apps/backend/lambdas/get-schools.ts","get schools"))
        this.getSchoolsIntegration = new apigatewayv2.CfnIntegration(this,"getSchoolsIntegration",this.lambdaIntegrationConfig(this.getSchools,"get schools function"))
        this.getSchoolsRoute = new apigatewayv2.CfnRoute(this,"getSchoolsRoute",this.lambdaRouteConfig(this.getSchoolsIntegration,"POST /getschools"))
        this.getSchools.addPermission("getSchoolsPermission",this.lambdaPermissionConfig("getschools"))

        this.getTokenFunction = new nodeLambda.NodejsFunction(this,"getTokenFunction",this.lambdaConfig('./apps/backend/lambdas/get-token.ts','get token function'))
        this.getTokenIntegration = new apigatewayv2.CfnIntegration(this, "getTokenIntegration",this.lambdaIntegrationConfig(this.getTokenFunction,"get token function integration"))
        this.getTokenRoute = new apigatewayv2.CfnRoute(this, "getTokenRoute", this.lambdaRouteConfig(this.getTokenIntegration,"POST /gettoken"))
        this.getTokenFunction.addPermission("getTokenPermission",this.lambdaPermissionConfig("gettoken"))

        this.getThreads = new nodeLambda.NodejsFunction(this,"getThreadsFunction",this.lambdaConfig("./apps/backend/lambdas/get-threads.ts","get threads function"))
        this.getThreadsIntegration = new apigatewayv2.CfnIntegration(this,"getThreadsIntegration",this.lambdaIntegrationConfig(this.getThreads,"get threads function"))
        this.getThreadsRoute = new apigatewayv2.CfnRoute(this,"getThreadsRoute",this.lambdaRouteConfig(this.getThreadsIntegration,"POST /getthreads"))
        this.getThreads.addPermission("getThreadsPermission",this.lambdaPermissionConfig("getthreads"))

        this.getMessages = new nodeLambda.NodejsFunction(this,"getMessagesFunction",this.lambdaConfig('./apps/backend/lambdas/get-messages.ts','get messages function'))
        this.getMessagesIntegration = new apigatewayv2.CfnIntegration(this,'getMessagesIntegration',this.lambdaIntegrationConfig(this.getMessages,'get messages integration'))
        this.getMessagesRoute = new apigatewayv2.CfnRoute(this,'getMessageRoute',this.lambdaRouteConfig(this.getMessagesIntegration,'POST /getmessages'))
        this.getMessages.addPermission('getMessagesPermission',this.lambdaPermissionConfig('getthreads'))

        this.deleteThread = new nodeLambda.NodejsFunction(this,'deleteThreadFunction',this.lambdaConfig('./apps/backend/lambdas/delete-thread.ts','delete thread function'))
        this.deleteThreadIntegration = new apigatewayv2.CfnIntegration(this,'deleteThreadIntegration',this.lambdaIntegrationConfig(this.deleteThread,'delete thread integration'))
        this.deleteThreadRoute = new apigatewayv2.CfnRoute(this,'deleteThreadRoute',this.lambdaRouteConfig(this.deleteThreadIntegration,'POST /deletethread'))
        this.deleteThread.addPermission('deleteThreadPermission',this.lambdaPermissionConfig('deletethread'))

    }

    
    lambdaConfig(entry: string,description: string): cdk.aws_lambda_nodejs.NodejsFunctionProps {
        return {
            runtime: cdk.aws_lambda.Runtime.NODEJS_16_X,
            handler: 'handler',
            entry: entry,
            description: description,
            depsLockFilePath: './yarn.lock',
            memorySize: cdk.Size.mebibytes(512).toMebibytes(),
            timeout: cdk.Duration.seconds(25),
            environment: {
                'TABLE_NAME': this.props.table.tableName,
                'TABLE_REGION': this.props.table.tableArn.split(':')[3],
                'FROM_INDEX_NAME': 'from_threads',
                'TO_INDEX_NAME': 'to_threads'
            },
            bundling: {
                externalModules: ['aws-sdk'],
                footer: '/*global handler*/',
                minify: true,
                format: nodeLambda.OutputFormat.CJS,
                sourceMap: true,
                sourcesContent: false,
                sourceMapMode: nodeLambda.SourceMapMode.DEFAULT,
                metafile: true,
                forceDockerBundling: false
            }
        }
    }

    lambdaIntegrationConfig(fn: cdk.aws_lambda_nodejs.NodejsFunction,description: string): cdk.aws_apigatewayv2.CfnIntegrationProps{
        return {
            apiId: this.props.api.ref,
            connectionType: "INTERNET",
            description,
            integrationMethod: "POST",
            integrationType: "AWS_PROXY",
            integrationUri: `arn:aws:apigateway:<api-region>:lambda:path/2015-03-31/functions/arn:aws:lambda:<function-region>:<account-no>:function:${fn.functionName}/invocations`,
            payloadFormatVersion: "2.0",
            timeoutInMillis: cdk.Duration.seconds(25).toMilliseconds(),
        }
    }

    lambdaRouteConfig(integration: cdk.aws_apigatewayv2.CfnIntegration,routeKey: string): cdk.aws_apigatewayv2.CfnRouteProps{
        return {
            apiId: this.props.api.ref, // Required
            authorizationType: "CUSTOM",
            authorizerId: this.props.authorizer.ref,
            routeKey, // Required
            target: `integrations/${integration.ref}`,
        }
    }

    lambdaPermissionConfig(route: string): cdk.aws_lambda.Permission{
        return {
            principal: new iam.ServicePrincipal('apigateway.amazonaws.com'),
            action: 'lambda:InvokeFunction',
            sourceArn: `arn:aws:execute-api:<function-region>:<account-no>:${this.props.api.ref}/$default/POST/${route}`,
            sourceAccount: '<account>'
        }
    }
}