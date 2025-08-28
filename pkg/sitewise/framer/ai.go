package framer

import "github.com/grafana/grafana-plugin-sdk-go/data"

func FrameAIChatResponse(prompt, response string) data.Frames {
	frame := data.NewFrame("ai_chat")
	frame.Fields = append(frame.Fields,
		data.NewField("prompt", nil, []string{prompt}),
		data.NewField("response", nil, []string{response}),
	)
	return data.Frames{frame}
}

func FrameAISQLResponse(prompt, sql string) data.Frames {
	frame := data.NewFrame("ai_sql")
	frame.Fields = append(frame.Fields,
		data.NewField("prompt", nil, []string{prompt}),
		data.NewField("sql", nil, []string{sql}),
	)
	return data.Frames{frame}
}
