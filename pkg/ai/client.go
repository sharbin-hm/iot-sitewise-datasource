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
	Chat(ctx context.Context, prompt string) (string, error)
	GenerateSQL(ctx context.Context, prompt string, schema string) (string, error)
}

// -----------------------------
// Factory to pick correct AI Client
// -----------------------------
func GetAIClient(ctx context.Context, cfg models.AWSSiteWiseDataSourceSetting) (Client, error) {
	switch cfg.AIAssistant.Provider {
	case "azure": // ⚠ match FE provider string
		return NewOpenAIClient(cfg)
	case "bedrock":
		return NewBedrockClient(cfg)
	default:
		return nil, fmt.Errorf("unsupported AI provider: %s", cfg.AIAssistant.Provider)
	}
}
