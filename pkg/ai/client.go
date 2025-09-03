package ai

import (
	"context"
	"fmt"

	"github.com/grafana/iot-sitewise-datasource/pkg/models"
)

// -----------------------------
// AI Client Interface
// -----------------------------
type Client interface {
	Chat(ctx context.Context, userPrompt string, context string) (string, error)
}

// -----------------------------
// Factory to pick correct AI Client
// -----------------------------
func GetAIClient(cfg models.AWSSiteWiseDataSourceSetting) (Client, error) {
	switch cfg.AIAssistant.Provider {
	case "azure":
		return NewOpenAIClient(cfg)
	case "bedrock":
		return NewBedrockClient(cfg)
	default:
		return nil, fmt.Errorf("unsupported AI provider: %s", cfg.AIAssistant.Provider)
	}
}
