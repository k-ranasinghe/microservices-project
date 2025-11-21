# Stage 1: Build
FROM golang:1.24-alpine AS builder

WORKDIR /app
COPY . .
RUN go mod tidy && go build -o catalog

# Stage 2: Run
FROM alpine:latest

WORKDIR /root/
COPY --from=builder /app/catalog .
EXPOSE 8080
CMD ["./catalog"]
