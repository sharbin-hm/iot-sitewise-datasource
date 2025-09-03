import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { accessKeyId, secretAccessKey } from '../utils/credentials';

export async function fetchSqlFromBedrock(userQuery: string, systemPrompt: string): Promise<string> {
  const client = new BedrockRuntimeClient({
    region: 'us-east-1',
    credentials: {
      accessKeyId: accessKeyId,
      secretAccessKey: secretAccessKey,
    },
  });

  const command = new InvokeModelCommand({
    modelId: 'anthropic.claude-3-haiku-20240307-v1:0',
    contentType: 'application/json',
    accept: 'application/json',
    body: JSON.stringify({
      anthropic_version: 'bedrock-2023-05-31',
      max_tokens: 500,
      system: systemPrompt,
      messages: [{ role: 'user', content: [{ type: 'text', text: userQuery }] }],
    }),
  });

  const resp = await client.send(command);
  const json = JSON.parse(new TextDecoder().decode(resp.body));
  return json?.content?.[0]?.text ?? 'No response';
}
