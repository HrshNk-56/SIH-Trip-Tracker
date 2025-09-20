package controllers

import (
	"bytes"
	"encoding/json"
	"io"
	"log"
	"mime/multipart"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/labstack/echo/v4"
)

type ModelBillItem struct {
	Title    string  `json:"title"`
	Amount   float64 `json:"amount"`
	Category string  `json:"category"`
	Date     string  `json:"date"`
}

type modelResponse struct {
	Items []map[string]any `json:"items"`
	Lines []map[string]any `json:"lines"`
	Data  []map[string]any `json:"data"`
}

// ProcessImage accepts an image and forwards it to the model API, then normalizes the result
func ProcessImage(c echo.Context) error {
	log.Print("received an image processing request")

	modelURL := os.Getenv("MODEL_IMAGE_API")
	if modelURL == "" {
		modelURL = "http://localhost:7000/ocr/bill"
	}

	// accept 'file' or 'image'
	fileHeader, err := c.FormFile("file")
	if err != nil {
		fileHeader, err = c.FormFile("image")
		if err != nil {
			log.Printf("error getting file: %v", err)
			return c.JSON(http.StatusBadRequest, map[string]string{"error": "no image provided"})
		}
	}

	src, err := fileHeader.Open()
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "failed to open uploaded file"})
	}
	defer src.Close()

	var body bytes.Buffer
	writer := multipart.NewWriter(&body)
	part, err := writer.CreateFormFile("file", fileHeader.Filename)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "failed to create form file"})
	}
	if _, err = io.Copy(part, src); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "failed to copy image"})
	}
	writer.Close()

	req, err := http.NewRequest(http.MethodPost, modelURL, &body)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "failed to create model request"})
	}
	req.Header.Set("Content-Type", writer.FormDataContentType())
	client := &http.Client{Timeout: 20 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return c.JSON(http.StatusBadGateway, map[string]string{"error": "model not reachable"})
	}
	defer resp.Body.Close()

	raw, _ := io.ReadAll(resp.Body)

	var mr modelResponse
	_ = json.Unmarshal(raw, &mr)
	rows := mr.Items
	if len(rows) == 0 {
		if len(mr.Lines) > 0 { rows = mr.Lines }
		if len(mr.Data) > 0 { rows = mr.Data }
	}

	out := struct{ Items []ModelBillItem `json:"items"` }{Items: []ModelBillItem{}}
	for _, r := range rows {
		item := ModelBillItem{}
		if v, ok := r["title"].(string); ok && v != "" { item.Title = v } else if v, ok := r["name"].(string); ok { item.Title = v } else { item.Title = "Item" }
		// amount
		switch v := r["amount"].(type) {
		case float64:
			item.Amount = v
		case int:
			item.Amount = float64(v)
		case string:
			if vv := strings.TrimSpace(v); vv != "" { if f, err := strconv.ParseFloat(strings.ReplaceAll(vv, ",", ""), 64); err == nil { item.Amount = f } }
		}
		if item.Amount == 0 {
			if v, ok := r["total"].(float64); ok { item.Amount = v }
		}
		if v, ok := r["category"].(string); ok { item.Category = v } else { item.Category = "Misc" }
		if v, ok := r["date"].(string); ok && v != "" { item.Date = v } else { item.Date = time.Now().Format("2006-01-02") }
		out.Items = append(out.Items, item)
	}

	return c.JSON(http.StatusOK, out)
}
