package models

type User struct {
	ID          uint   `gorm:"primaryKey;autoIncrement" json:"id"`
	FirstName   string `json:"firstName"`
	LastName    string `json:"lastName"`
	Email       string `gorm:"unique" json:"email"`
	Password    string `json:"-"`
	PhoneNumber string `gorm:"unique" json:"phoneNumber"`
}
