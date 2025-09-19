package models

import "time"

type TripHeader struct {
	ID          uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	Destination string    `json:"destination"`
	StartDate   time.Time `json:"startDate"`
	EndDate     time.Time `json:"endDate"`
	SpentINR    int64     `json:"spentINR"`
	Places      int       `json:"places"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
}