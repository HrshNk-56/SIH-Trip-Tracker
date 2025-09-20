package controllers

import (
	"bytes"
	"io"
	"log"
	"mime/multipart"
	"net/http"

	"github.com/labstack/echo/v4"
)

// ProcessImage handles the image upload and forwards it to the AI bot.
func ProcessImage(c echo.Context) error {
	log.Print("received an image processing request")

	// 1. DEFINE AI BOT URL
	// IMPORTANT: Replace this with your actual AI bot URL
	aiBotURL := "https://your-ai-bot-placeholder.com/api/process"

	// 2. GET THE UPLOADED IMAGE FROM THE REQUEST
	file, err := c.FormFile("image")
	if err != nil {
		log.Printf("error getting image from form: %v", err)
		return c.JSON(http.StatusBadRequest, map[string]string{
			"error": "image upload failed: " + err.Error(),
		})
	}

	src, err := file.Open()
	if err != nil {
		log.Printf("error opening uploaded file: %v", err)
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"error": "failed to open uploaded file",
		})
	}
	defer src.Close()

	// 3. PREPARE THE REQUEST TO THE AI BOT
	// Create a buffer to store our request body
	var requestBody bytes.Buffer
	// Create a multipart writer to write the form data to the buffer
	writer := multipart.NewWriter(&requestBody)

	// Create a form file field for the image
	part, err := writer.CreateFormFile("image", file.Filename)
	if err != nil {
		log.Printf("error creating form file for AI bot: %v", err)
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"error": "failed to create request for AI bot",
		})
	}

	// Copy the image data to the form file field
	if _, err = io.Copy(part, src); err != nil {
		log.Printf("error copying image data to AI bot request: %v", err)
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"error": "failed to prepare image for AI bot",
		})
	}

	// Close the multipart writer to finalize the request body
	writer.Close()

	// 4. SEND THE REQUEST TO THE AI BOT
	req, err := http.NewRequest("POST", aiBotURL, &requestBody)
	if err != nil {
		log.Printf("error creating request to AI bot: %v", err)
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"error": "failed to create request to AI bot",
		})
	}
	// Set the content type header, which includes the multipart boundary
	req.Header.Set("Content-Type", writer.FormDataContentType())

	log.Printf("forwarding image to AI bot at %s", aiBotURL)
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		log.Printf("error sending request to AI bot: %v", err)
		return c.JSON(http.StatusBadGateway, map[string]string{
			"error": "failed to communicate with AI bot",
		})
	}
	defer resp.Body.Close()

	// 5. RETURN THE AI BOT'S RESPONSE TO THE FRONTEND
	log.Printf("received response from AI bot with status: %s", resp.Status)
	// Read the response body from the AI bot
	responseBody, err := io.ReadAll(resp.Body)
	if err != nil {
		log.Printf("error reading response from AI bot: %v", err)
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"error": "failed to read response from AI bot",
		})
	}

	// Return the AI bot's response with the same status code and body
	return c.Blob(resp.StatusCode, resp.Header.Get("Content-Type"), responseBody)
}
