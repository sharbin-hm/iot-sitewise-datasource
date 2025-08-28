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

func (c *BedrockClient) Chat(ctx context.Context, prompt string) (string, error) {
	input := &bedrockruntime.InvokeModelInput{
		ModelId:     aws.String(c.modelId),
		ContentType: aws.String("application/json"),
		Accept:      aws.String("application/json"),
		Body:        []byte(fmt.Sprintf(`{"inputText":"%s"}`, prompt)),
	}

	resp, err := c.svc.InvokeModel(ctx, input)
	if err != nil {
		return "", fmt.Errorf("bedrock invoke failed: %w", err)
	}

	// ⚠ optional structured parse
	var respJSON map[string]interface{}
	if err := json.Unmarshal(resp.Body, &respJSON); err == nil {
		if output, ok := respJSON["outputText"].(string); ok {
			return output, nil
		}
	}

	return string(resp.Body), nil
}

func (c *BedrockClient) GenerateSQL(ctx context.Context, prompt string, schema string) (string, error) {
	return c.Chat(ctx, fmt.Sprintf("Given schema: %s\nGenerate SQL for: %s", schema, prompt))
}
