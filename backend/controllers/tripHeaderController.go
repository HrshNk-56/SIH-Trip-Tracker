package controllers

import (
	"backend/database"
	"backend/models"
	"net/http"
	"time"

	"github.com/labstack/echo/v4"
)

type TripHeaderDTO struct {
	Destination string `json:"destination"`
	StartDate   string `json:"startDate"` // ISO date
	EndDate     string `json:"endDate"`   // ISO date
	SpentINR    int64  `json:"spentINR"`
	Places      int    `json:"places"`
}

// GetTripHeader returns singleton trip header (ID 1)
func GetTripHeader(c echo.Context) error {
	var header models.TripHeader
	if err := database.DB.First(&header).Error; err != nil {
		// not found, return defaults
		return c.JSON(http.StatusOK, models.TripHeader{
			Destination: "",
			StartDate:   time.Now(),
			EndDate:     time.Now().Add(24 * time.Hour),
			SpentINR:    0,
			Places:      0,
		})
	}
	return c.JSON(http.StatusOK, header)
}

// UpsertTripHeader creates or updates singleton header (ID 1)
func UpsertTripHeader(c echo.Context) error {
	var dto TripHeaderDTO
	if err := c.Bind(&dto); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid request"})
	}

	start, err1 := time.Parse("2006-01-02", dto.StartDate)
	end, err2 := time.Parse("2006-01-02", dto.EndDate)
	if err1 != nil || err2 != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid date format, use YYYY-MM-DD"})
	}

	var header models.TripHeader
	if err := database.DB.First(&header).Error; err != nil {
		header = models.TripHeader{
			Destination: dto.Destination,
			StartDate:   start,
			EndDate:     end,
			SpentINR:    dto.SpentINR,
			Places:      dto.Places,
		}
		database.DB.Create(&header)
	} else {
		header.Destination = dto.Destination
		header.StartDate = start
		header.EndDate = end
		header.SpentINR = dto.SpentINR
		header.Places = dto.Places
		database.DB.Save(&header)
	}

	return c.JSON(http.StatusOK, header)
}