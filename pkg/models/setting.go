package models

import (
	"encoding/json"
	"fmt"

	"github.com/grafana/grafana-aws-sdk/pkg/awsds"
	"github.com/grafana/grafana-plugin-sdk-go/backend"
)

const EDGE_REGION string = "Edge"
const EDGE_AUTH_MODE_DEFAULT string = "default"
const EDGE_AUTH_MODE_LDAP string = "ldap"
const EDGE_AUTH_MODE_LINUX string = "linux"

type AWSSiteWiseDataSourceSetting struct {
	awsds.AWSDatasourceSettings
	Cert         string `json:"-"`
	EdgeAuthMode string `json:"edgeAuthMode"`
	EdgeAuthUser string `json:"edgeAuthUser"`
	EdgeAuthPass string `json:"-"`

	AIAssistant    AIAssistantOptions `json:"aiAssistant"`
	SecureJsonData map[string]string  `json:"-"` // keep secrets decrypted here
}

type AIAssistantOptions struct {
	Provider        string `json:"provider"` // "azure" | "bedrock"
	AzureEndpoint   string `json:"azureEndpoint"`
	AzureDeployment string `json:"azureDeployment"`
	AzureApiVersion string `json:"azureApiVersion"`
	BedrockRegion   string `json:"bedrockRegion"`
	BedrockModelId  string `json:"bedrockModelId"`
}

type AIAssistantSecureOptions struct {
	AzureApiKey      string `json:"azureApiKey"`
	BedrockAccessKey string `json:"bedrockAccessKey"`
	BedrockSecretKey string `json:"bedrockSecretKey"`
}

func (s *AWSSiteWiseDataSourceSetting) Load(config backend.DataSourceInstanceSettings) error {
	fmt.Printf("\n========== DEBUG: Load() called ==========\n")
	fmt.Printf("DEBUG: Raw JSONData: %s\n", string(config.JSONData))
	fmt.Printf("DEBUG: Raw DecryptedSecureJSONData: %#v\n", config.DecryptedSecureJSONData)

	if len(config.JSONData) > 1 {
		if err := json.Unmarshal(config.JSONData, s); err != nil {
			fmt.Printf("DEBUG: Failed to unmarshal JSONData: %v\n", err)
			return fmt.Errorf("could not unmarshal DatasourceSettings json: %w", err)
		}
		fmt.Printf("DEBUG: After unmarshal AIAssistant: %+v\n", s.AIAssistant)
	}

	if s.Region == "default" || s.Region == "" {
		fmt.Printf("DEBUG: Resetting Region from %q to DefaultRegion=%q\n", s.Region, s.DefaultRegion)
		s.Region = s.DefaultRegion
	}

	if s.Profile == "" {
		fmt.Printf("DEBUG: Using legacy profile from config.Database=%q\n", config.Database)
		s.Profile = config.Database
	}

	if s.Region == EDGE_REGION && s.EdgeAuthMode == "" {
		fmt.Printf("DEBUG: Region=EDGE, setting EdgeAuthMode=default\n")
		s.EdgeAuthMode = EDGE_AUTH_MODE_DEFAULT
	}

	// Load AWS + edge credentials
	s.AccessKey = config.DecryptedSecureJSONData["accessKey"]
	s.SecretKey = config.DecryptedSecureJSONData["secretKey"]
	s.Cert = config.DecryptedSecureJSONData["cert"]
	s.EdgeAuthPass = config.DecryptedSecureJSONData["edgeAuthPass"]

	fmt.Printf("DEBUG: Loaded AWS AccessKey=%q SecretKey(len)=%d Cert(len)=%d\n",
		s.AccessKey, len(s.SecretKey), len(s.Cert))

	// Save AI assistant secrets as-is
	s.SecureJsonData = map[string]string{}
	for k, v := range config.DecryptedSecureJSONData {
		fmt.Printf("DEBUG: SecureJsonData[%s] = %q\n", k, v)
		s.SecureJsonData[k] = v
	}

	fmt.Printf("========== DEBUG: End Load() ==========\n\n")
	return nil
}

// Typed accessor for AI secure options
func (s *AWSSiteWiseDataSourceSetting) SecureOptions() AIAssistantSecureOptions {
	return AIAssistantSecureOptions{
		AzureApiKey:      s.SecureJsonData["azureApiKey"],
		BedrockAccessKey: s.SecureJsonData["bedrockAccessKey"],
		BedrockSecretKey: s.SecureJsonData["bedrockSecretKey"],
	}
}

func (s *AWSSiteWiseDataSourceSetting) Validate() error {
	if s.Region != EDGE_REGION {
		return nil
	}

	if s.Endpoint == "" {
		return fmt.Errorf("edge region requires an explicit endpoint")
	}
	if s.Cert == "" {
		return fmt.Errorf("edge region requires an SSL certificate")
	}

	if s.EdgeAuthMode != EDGE_AUTH_MODE_DEFAULT {
		if s.EdgeAuthUser == "" {
			return fmt.Errorf("missing edge auth user")
		}
		if s.EdgeAuthPass == "" {
			return fmt.Errorf("missing edge auth password")
		}
	}

	return nil
}

func (s *AWSSiteWiseDataSourceSetting) ToAWSDatasourceSettings() awsds.AWSDatasourceSettings {
	cfg := awsds.AWSDatasourceSettings{
		Profile:       s.Profile,
		Region:        s.Region,
		AuthType:      s.AuthType,
		AssumeRoleARN: s.AssumeRoleARN,
		ExternalID:    s.ExternalID,
		Endpoint:      s.Endpoint,
		DefaultRegion: s.DefaultRegion,
		AccessKey:     s.AccessKey,
		SecretKey:     s.SecretKey,
		SessionToken:  s.SessionToken,
	}

	return cfg
}
