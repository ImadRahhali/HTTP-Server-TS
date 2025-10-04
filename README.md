# HTTP Server - TypeScript

> A custom HTTP/1.1 server implementation built from scratch using Node.js and TypeScript. Zero web frameworks, just raw TCP sockets and protocol-level networking.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)

## 🎯 Overview

Educational HTTP server demonstrating low-level protocol implementation using Node.js's `net` module. Built to understand how web servers work under the hood without relying on Express or other frameworks.

## ✨ Features

- **Static File Serving** - Automatic MIME type detection, directory index support, path traversal protection
- **POST Request Handling** - Full body parsing with `/echo` endpoint
- **Chunked Transfer Encoding** - Stream-based request body processing
- **HTTP/1.1 Keep-Alive** - Persistent connections with 5s idle timeout
- **Concurrent Requests** - Event-driven architecture with async/await
- **Stream-Based I/O** - Non-blocking file transfers

## 🚀 Quick Start

```bash
npm install
npm run dev
# Server runs on http://localhost:4000
```

## 🧪 Testing

```bash
# Static files
curl http://localhost:4000/index.html

# POST request
curl -X POST http://localhost:4000/echo -d "Hello, World!"

# Chunked transfer encoding
curl -X POST http://localhost:4000/echo \
  -H "Transfer-Encoding: chunked" -d "Chunked data"

# Keep-alive connection
curl -v http://localhost:4000/ -H "Connection: keep-alive"

# Raw TCP test
printf 'GET / HTTP/1.1\r\nHost: localhost\r\n\r\n' | nc localhost 4000
```

## 📁 Project Structure

```
src/
├── index.ts                    # Server initialization & socket management
├── httpRequestParser.ts        # HTTP request parsing (headers + body)
├── router.ts                   # Route matching logic
├── httpResponseBuilder.ts      # Response serialization
├── types.ts                    # TypeScript interfaces
└── handlers/
    ├── staticFileHandler.ts    # File serving with MIME detection
    └── postRequestHandler.ts   # POST body processing

public/                         # Static assets directory
├── index.html
└── about.html
```

## 🎓 Technical Deep Dive

**Protocol Implementation:**

- Manual HTTP/1.1 parsing (RFC 7230 compliance)
- Support for both `Content-Length` and `Transfer-Encoding: chunked`
- Request line, headers, and body parsing from raw TCP streams

**Concurrency & Performance:**

- Event-driven I/O using Node.js streams
- Non-blocking file operations with `fs/promises`
- Async handlers for simultaneous request processing

**Security:**

- Path traversal detection (`403 Forbidden`)
- Proper error handling (`400`, `404`, `500` responses)
- Safe file serving with allowed MIME types

## 🛠️ Built With

- **Node.js `net` module** - Raw TCP socket handling
- **TypeScript** - Type-safe development
- **Node.js streams** - Efficient data processing
- **fs/promises** - Async file system operations

---

**Note:** Educational project for learning HTTP internals. Not intended for production use.

**Built to understand the web from first principles** 🌐
