package ai

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"

	"github.com/grafana/iot-sitewise-datasource/pkg/models"
)

// -----------------------------
// Azure OpenAI Client
// -----------------------------
type OpenAIClient struct {
	settings       models.AIAssistantOptions
	secureSettings models.AIAssistantSecureOptions
	httpClient     *http.Client
}

func NewOpenAIClient(cfg models.AWSSiteWiseDataSourceSetting) (*OpenAIClient, error) {
	return &OpenAIClient{
		settings:       cfg.AIAssistant,
		secureSettings: cfg.SecureOptions(),
		httpClient:     http.DefaultClient,
	}, nil
}

func (c *OpenAIClient) Chat(ctx context.Context, userPrompt, contextPrompt string) (string, error) {
	payload := map[string]any{
		"messages": []map[string]string{
			{"role": "system", "content": contextPrompt},
			{"role": "user", "content": userPrompt},
		},
		"max_completion_tokens": 500,
	}

	b, err := json.Marshal(payload)
	if err != nil {
		return "", fmt.Errorf("failed to marshal request: %w", err)
	}

	url := fmt.Sprintf("%s/openai/deployments/%s/chat/completions?api-version=%s",
		c.settings.AzureEndpoint,
		c.settings.AzureDeployment,
		c.settings.AzureApiVersion,
	)

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewReader(b))
	if err != nil {
		return "", fmt.Errorf("failed to create request: %w", err)
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("api-key", c.secureSettings.AzureApiKey)

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return "", fmt.Errorf("azure openai request failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return "", fmt.Errorf("azure openai returned status %d: %s", resp.StatusCode, string(body))
	}

	var respJSON struct {
		Choices []struct {
			Message struct {
				Content string `json:"content"`
			} `json:"message"`
		} `json:"choices"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&respJSON); err != nil {
		return "", fmt.Errorf("failed to decode azure openai response: %w", err)
	}

	if len(respJSON.Choices) == 0 {
		return "", fmt.Errorf("no choices returned from azure openai")
	}

	return respJSON.Choices[0].Message.Content, nil
}

func (c *OpenAIClient) GenerateSQL(ctx context.Context, userPrompt, schema string) (string, error) {
	return c.Chat(ctx, userPrompt, schema)
}
