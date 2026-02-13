package internal

import (
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
)

var Logger *zap.Logger

func InitLogger() {
	config := zap.NewProductionConfig()
	config.EncoderConfig.EncodeTime = zapcore.ISO8601TimeEncoder

	// Create logger with stdout and custom config
	logger, _ := config.Build()
	Logger = logger
}

func GetLogger() *zap.Logger {
	if Logger == nil {
		InitLogger()
	}
	return Logger
}
