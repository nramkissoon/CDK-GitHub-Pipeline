import * as cdk from "@aws-cdk/core";
import * as codepipeline from "@aws-cdk/aws-codepipeline";
import * as codepipelineActions from "@aws-cdk/aws-codepipeline-actions";
import { SimpleSynthAction, CdkPipeline } from "@aws-cdk/pipelines";
import { SecretValue } from "@aws-cdk/core";

export class CdkPipelineStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Get GitHub access token from Secrets Manager
    const githubAccessToken = SecretValue.secretsManager("TestAccessToken");

    // Artifacts
    const sourceArtifact = new codepipeline.Artifact();
    const cloudAssemblyArtifact = new codepipeline.Artifact();

    // Initialize CDK pipeline
    const pipeline = new CdkPipeline(this, "TestCDKPipeline", {
      pipelineName: "TestCDKPipeline",
      cloudAssemblyArtifact,

      sourceAction: new codepipelineActions.GitHubSourceAction({
        actionName: "GitHub",
        output: sourceArtifact,
        oauthToken: githubAccessToken,
        owner: "nramkissoon",
        repo: "CDK-GitHub-Pipeline",
        branch: "main",
        trigger: codepipelineActions.GitHubTrigger.WEBHOOK,
      }),

      // Build cloud assembly artifact
      synthAction: SimpleSynthAction.standardNpmSynth({
        sourceArtifact: sourceArtifact,
        cloudAssemblyArtifact,
        installCommand: "npm install",
        buildCommand: "npm run build",
      }),
    });
  }
}
