package routes

import (
	"backend/controllers"

	"github.com/labstack/echo/v4"
)

func SetUpRoutes(e *echo.Echo) {
	e.GET("/", controllers.Healthy)
	e.POST("/api/register", controllers.Register)
	e.POST("/api/login", controllers.Login)
	e.GET("/api/user", controllers.User)
	e.POST("/logout", controllers.Logout)
	e.POST("/refresh", controllers.Refresh)
}
