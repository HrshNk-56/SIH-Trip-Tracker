package main

import (
	"backend/database"
	"backend/routes"
	"log"

	"github.com/joho/godotenv"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

func main() {
	// load .env file
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	// connect to db
	_, err = database.ConnectDB()
	if err != nil {
		log.Fatalf("could not connect to database: %v", err)
	}
	log.Print("database connection successful")

	e := echo.New()

	//adding cors middleware
	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins: []string{"http://localhost:3000", "http://127.0.0.1:3000"},
		AllowMethods: []string{echo.GET, echo.POST, echo.PUT, echo.DELETE, echo.PATCH, echo.OPTIONS},
		AllowHeaders: []string{
			echo.HeaderOrigin,
			echo.HeaderContentType,
			echo.HeaderAccept,
			echo.HeaderAuthorization,
			"Access-Control-Request-Method",
			"Access-Control-Request-Headers",
			"Access-Control-Allow-Origin",
			"Access-Control-Allow-Headers",
			"Access-Control-Allow-Methods",
			"Access-Control-Expose-Headers",
			"Access-Control-Max-Age",
			"Access-Control-Allow-Credentials",
			"X-Requested-With",
		},
		AllowCredentials: true,
	}))

	routes.SetUpRoutes(e)
	e.Logger.Fatal(e.Start(":8080"))
}