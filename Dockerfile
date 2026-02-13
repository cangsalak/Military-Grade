# Build stage
FROM golang:1.25-alpine AS builder

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache git build-base

# Copy go mod and sum files
COPY go.mod go.sum ./
RUN go mod download

# Copy the source code
COPY . .

# Build the application
# CGO_ENABLED=1 might be needed if using some network libs, but usually 0 is safer for alpine
RUN CGO_ENABLED=0 GOOS=linux go build -o wg-automation main.go

# Final stage
FROM alpine:latest

WORKDIR /root/

# Install wireguard-tools and nftables for the backend to execute commands
RUN apk add --no-cache wireguard-tools nftables ca-certificates

# Copy the pre-built binary
COPY --from=builder /app/wg-automation .

# Expose API port
EXPOSE 8080

# Run the binary
CMD ["./wg-automation"]
