package ai

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/bedrockruntime"
	"github.com/grafana/iot-sitewise-datasource/pkg/models"
)

// -----------------------------
// AWS Bedrock Client
// -----------------------------
type BedrockClient struct {
	svc     *bedrockruntime.Client
	modelId string
}

func NewBedrockClient(cfg models.AWSSiteWiseDataSourceSetting) (*BedrockClient, error) {
	ctx := context.Background()
	var awsCfg aws.Config
	var err error

	if cfg.SecureOptions().BedrockAccessKey != "" && cfg.SecureOptions().BedrockSecretKey != "" {
		awsCfg, err = config.LoadDefaultConfig(ctx,
			config.WithRegion(cfg.AIAssistant.BedrockRegion),
			config.WithCredentialsProvider(credentials.NewStaticCredentialsProvider(
				cfg.SecureOptions().BedrockAccessKey,
				cfg.SecureOptions().BedrockSecretKey,
				"",
			)),
		)
	} else {
		awsCfg, err = config.LoadDefaultConfig(ctx, config.WithRegion(cfg.AIAssistant.BedrockRegion))
	}

	if err != nil {
		return nil, fmt.Errorf("failed to load AWS config: %w", err)
	}

	svc := bedrockruntime.NewFromConfig(awsCfg)
	return &BedrockClient{svc: svc, modelId: cfg.AIAssistant.BedrockModelId}, nil
}

// request payload matches Bedrock Anthropic model spec
type anthropicMessage struct {
	Role    string `json:"role"`
	Content []struct {
		Type string `json:"type"`
		Text string `json:"text"`
	} `json:"content"`
}

type anthropicRequest struct {
	AnthropicVersion string             `json:"anthropic_version"`
	MaxTokens        int                `json:"max_tokens"`
	System           string             `json:"system"`
	Messages         []anthropicMessage `json:"messages"`
}

// response payload
type anthropicResponse struct {
	Content []struct {
		Text string `json:"text"`
	} `json:"content"`
}

func (c *BedrockClient) Chat(ctx context.Context, prompt string) (string, error) {
	// build request
	req := anthropicRequest{
		AnthropicVersion: "bedrock-2023-05-31",
		MaxTokens:        500,
		System:           "You are a helpful AI assistant for SQL generation.",
		Messages: []anthropicMessage{
			{
				Role: "user",
				Content: []struct {
					Type string `json:"type"`
					Text string `json:"text"`
				}{
					{Type: "text", Text: prompt},
				},
			},
		},
	}

	body, err := json.Marshal(req)
	if err != nil {
		return "", fmt.Errorf("failed to marshal request: %w", err)
	}

	input := &bedrockruntime.InvokeModelInput{
		ModelId:     aws.String(c.modelId),
		ContentType: aws.String("application/json"),
		Accept:      aws.String("application/json"),
		Body:        body,
	}

	resp, err := c.svc.InvokeModel(ctx, input)
	if err != nil {
		return "", fmt.Errorf("bedrock invoke failed: %w", err)
	}

	var parsed anthropicResponse
	if err := json.Unmarshal(resp.Body, &parsed); err != nil {
		return "", fmt.Errorf("failed to parse bedrock response: %w", err)
	}

	if len(parsed.Content) > 0 {
		return parsed.Content[0].Text, nil
	}
	return "No response", nil
}

func (c *BedrockClient) GenerateSQL(ctx context.Context, prompt string, schema string) (string, error) {
	return c.Chat(ctx, fmt.Sprintf("Given schema: %s\nGenerate SQL for: %s", schema, prompt))
}
