package controllers

import (
	"backend/database"
	"backend/models"
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/labstack/echo/v4"
	"golang.org/x/crypto/bcrypt"
)

type RegisterRequest struct {
	FirstName   string `json:"firstName"`
	LastName    string `json:"lastName"`
	Email       string `json:"email"`
	Password    string `json:"password"`
	PhoneNumber string `json:"phoneNumber"`
}

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

func Healthy(c echo.Context) error {
	return c.String(http.StatusOK, "Healthy")
}

// ------------------------- REGISTER -------------------------
func Register(c echo.Context) error {
	log.Print("received a registration request")

	var req RegisterRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"error": "invalid request body",
		})
	}

	var exsistingUser models.User
	if err := database.DB.Where("email = ?", req.Email).First(&exsistingUser).Error; err == nil {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"error": "Email already used by another account",
		})
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"error": "failed to hash password",
		})
	}

	user := models.User{
		FirstName:   req.FirstName,
		LastName:    req.LastName,
		Email:       req.Email,
		Password:    string(hashedPassword),
		PhoneNumber: req.PhoneNumber,
	}

	if err := database.DB.Create(&user).Error; err != nil {
		log.Printf("failed to create user: %v", err)
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"error": "failed to create user",
		})
	}

	return c.JSON(http.StatusOK, map[string]string{
		"message": "user registered successfully",
	})
}

// ------------------------- LOGIN -------------------------
func Login(c echo.Context) error {
	log.Print("received a login request")
	var req LoginRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"error": "failed to parse request body",
		})
	}

	var user models.User
	database.DB.Where("email = ?", req.Email).First(&user)
	if user.ID == 0 {
		log.Println("user not found")
		return c.JSON(http.StatusUnauthorized, map[string]string{
			"message": "invalid credentials",
		})
	}

	err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password))
	if err != nil {
		log.Printf("invalid password: %v", err)
		return c.JSON(http.StatusUnauthorized, map[string]string{
			"message": "invalid credentials",
		})
	}

	// Generate access token (15m expiry)
	accessToken := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"sub": strconv.Itoa(int(user.ID)),
		"exp": time.Now().Add(15 * time.Minute).Unix(),
	})
	accessTokenString, err := accessToken.SignedString([]byte(os.Getenv("JWT_SECRET")))
	if err != nil {
		log.Printf("error generating access token: %v", err)
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"error": "failed to generate token",
		})
	}

	// Set access token cookie
	cookie := new(http.Cookie)
	cookie.Name = "jwt"
	cookie.Value = accessTokenString
	cookie.Expires = time.Now().Add(15 * time.Minute)
	cookie.HttpOnly = true
	cookie.Secure = true
	cookie.Path = "/"
	c.SetCookie(cookie)

	// Generate refresh token (7d expiry)
	refreshToken := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"sub": strconv.Itoa(int(user.ID)),
		"exp": time.Now().Add(7 * 24 * time.Hour).Unix(),
	})
	refreshTokenString, err := refreshToken.SignedString([]byte(os.Getenv("JWT_REFRESH_SECRET")))
	if err != nil {
		log.Printf("error generating refresh token: %v", err)
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"error": "failed to generate refresh token",
		})
	}

	// Set refresh token cookie
	refreshCookie := new(http.Cookie)
	refreshCookie.Name = "refresh_token"
	refreshCookie.Value = refreshTokenString
	refreshCookie.Expires = time.Now().Add(7 * 24 * time.Hour)
	refreshCookie.HttpOnly = true
	refreshCookie.Secure = true
	refreshCookie.Path = "/"
	c.SetCookie(refreshCookie)

	return c.JSON(http.StatusAccepted, map[string]string{
		"message": "login successful",
	})
}

// ------------------------- GET USER -------------------------
func User(c echo.Context) error {
	fmt.Println("Request to get user...")

	// Retrieve JWT token from cookie
	cookie, err := c.Cookie("jwt")
	if err != nil {
		return c.JSON(http.StatusUnauthorized, map[string]string{
			"error": "Missing JWT cookie",
		})
	}

	// Parse JWT token with claims
	token, err := jwt.ParseWithClaims(cookie.Value, jwt.MapClaims{}, func(token *jwt.Token) (interface{}, error) {
		return []byte(os.Getenv("JWT_SECRET")), nil
	})
	if err != nil || !token.Valid {
		return c.JSON(http.StatusUnauthorized, map[string]string{
			"error": "Unauthorized",
		})
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"error": "Failed to parse claims",
		})
	}

	// Extract user ID
	id, err := strconv.Atoi(claims["sub"].(string))
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"error": "Invalid user ID in token",
		})
	}

	// Fetch user
	var user models.User
	if err := database.DB.Where("id = ?", id).First(&user).Error; err != nil {
		return c.JSON(http.StatusNotFound, map[string]string{
			"error": "User not found",
		})
	}

	return c.JSON(http.StatusOK, user)
}

// ------------------------- REFRESH -------------------------
func Refresh(c echo.Context) error {
	refreshCookie, err := c.Cookie("refresh_token")
	if err != nil {
		return c.JSON(http.StatusUnauthorized, map[string]string{
			"error": "Missing refresh token",
		})
	}

	token, err := jwt.ParseWithClaims(refreshCookie.Value, jwt.MapClaims{}, func(token *jwt.Token) (interface{}, error) {
		return []byte(os.Getenv("JWT_REFRESH_SECRET")), nil
	})
	if err != nil || !token.Valid {
		return c.JSON(http.StatusUnauthorized, map[string]string{
			"error": "Invalid refresh token",
		})
	}

	claims := token.Claims.(jwt.MapClaims)
	userId := claims["sub"].(string)

	// Create new access token
	newAccessToken := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"sub": userId,
		"exp": time.Now().Add(15 * time.Minute).Unix(),
	})
	accessTokenString, err := newAccessToken.SignedString([]byte(os.Getenv("JWT_SECRET")))
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"error": "Failed to generate access token",
		})
	}

	// Set new access token cookie
	cookie := new(http.Cookie)
	cookie.Name = "jwt"
	cookie.Value = accessTokenString
	cookie.Expires = time.Now().Add(15 * time.Minute)
	cookie.HttpOnly = true
	cookie.Secure = true
	cookie.Path = "/"
	c.SetCookie(cookie)

	return c.JSON(http.StatusOK, map[string]string{
		"message": "Token refreshed successfully",
	})
}

// ------------------------- LOGOUT -------------------------
func Logout(c echo.Context) error {
	fmt.Println("Received a logout request")

	expired := time.Now().Add(-time.Hour)

	// Clear access token
	c.SetCookie(&http.Cookie{
		Name:     "jwt",
		Value:    "",
		Expires:  expired,
		HttpOnly: true,
		Secure:   true,
		Path:     "/",
	})

	// Clear refresh token
	c.SetCookie(&http.Cookie{
		Name:     "refresh_token",
		Value:    "",
		Expires:  expired,
		HttpOnly: true,
		Secure:   true,
		Path:     "/",
	})

	return c.JSON(http.StatusAccepted, map[string]string{
		"message": "Logout successful",
	})
}
