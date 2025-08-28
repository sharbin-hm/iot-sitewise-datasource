package ai

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"

	"github.com/grafana/iot-sitewise-datasource/pkg/models"
)

// -----------------------------
// Azure OpenAI Client
// -----------------------------
type OpenAIClient struct {
	settings       models.AIAssistantOptions
	secureSettings models.AIAssistantSecureOptions
}

func NewOpenAIClient(cfg models.AWSSiteWiseDataSourceSetting) (*OpenAIClient, error) {
	return &OpenAIClient{
		settings:       cfg.AIAssistant,
		secureSettings: cfg.SecureOptions(), // ⚠ use typed accessor
	}, nil
}

func (c *OpenAIClient) Chat(ctx context.Context, prompt string) (string, error) {
	body := map[string]interface{}{
		"messages": []map[string]string{
			{"role": "user", "content": prompt},
		},
	}
	b, _ := json.Marshal(body)

	url := fmt.Sprintf("%s/openai/deployments/%s/chat/completions?api-version=%s",
		c.settings.AzureEndpoint, c.settings.AzureDeployment, c.settings.AzureApiVersion)

	req, _ := http.NewRequestWithContext(ctx, "POST", url, bytes.NewBuffer(b))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("api-key", c.secureSettings.AzureApiKey)

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	rb, _ := ioutil.ReadAll(resp.Body)

	// ⚠ parse response to extract content
	var respJSON struct {
		Choices []struct {
			Message struct {
				Content string `json:"content"`
			} `json:"message"`
		} `json:"choices"`
	}
	if err := json.Unmarshal(rb, &respJSON); err != nil {
		return "", fmt.Errorf("failed to parse OpenAI response: %w", err)
	}

	if len(respJSON.Choices) == 0 {
		return "", fmt.Errorf("no choices returned from OpenAI")
	}

	return respJSON.Choices[0].Message.Content, nil
}

func (c *OpenAIClient) GenerateSQL(ctx context.Context, prompt string, schema string) (string, error) {
	return c.Chat(ctx, fmt.Sprintf("Given schema: %s\nGenerate SQL for: %s", schema, prompt))
}
