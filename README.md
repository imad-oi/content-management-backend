# content-management-backend

# Content Management and Duplicate Detection API

## Table of Contents
1. [Introduction](#introduction)
2. [Features](#features)
3. [Installation](#installation)
4. [Configuration](#configuration)
5. [API Endpoints](#api-endpoints)
6. [Authentication](#authentication)
7. [Web Crawling Process](#web-crawling-process)
8. [Duplicate Detection](#duplicate-detection)
9. [Content Comparison](#content-comparison)
10. [Usage Examples](#usage-examples)
11. [Error Handling](#error-handling)
12. [Security Measures](#security-measures)

## Introduction

This project is a backend system designed to manage and analyze large volumes of text data. It supports the creation and management of unique identifiers (UUIDs) for text entries, detects duplicate content at the paragraph level, and compares stored content with text from crawled websites.

## Features

- User authentication and authorization
- Text submission and retrieval
- UUID generation and management
- Duplicate detection within submitted texts
- Web crawling and content comparison
- API documentation with Swagger

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/imad-oi/content-management-backend.git
   ```
2. Install dependencies:
   ```
   cd content-management-backend
   npm install
   ```
3. Set up environment variables (see [Configuration](#configuration))
4. Start the server:
   ```
   npm start
   ```

## Configuration

Create a `.env` file in the root directory with the following variables:

```
NODE_ENV=development
PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=30d
```

## API Endpoints

Full API documentation is available at `/api-docs` when the server is running. Here's a brief overview:

- POST `/api/auth/register`: Register a new user
- POST `/api/auth/login`: Log in a user
- POST `/api/text`: Submit a new text
- GET `/api/text`: Retrieve all texts for the authenticated user
- GET `/api/text/:uuid`: Retrieve a specific text by UUID
- POST `/api/crawl-and-compare`: Crawl specified URLs and compare content

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header as a Bearer token for protected routes.

## Web Crawling Process

1. The system accepts an array of URLs to crawl.
2. It uses Puppeteer to visit each URL and extract the text content.
3. Script and style elements are removed to focus on visible text.
4. The extracted content is then used for comparison with stored texts.

## Duplicate Detection

Duplicate detection occurs at two levels:

1. **Internal Duplicates**: Within a single submitted text.
2. **External Duplicates**: Between the submitted text and previously stored texts.

The process involves:

1. Splitting text into paragraphs or sentences.
2. Generating hash values for each paragraph.
3. Comparing hash values to detect exact matches.
4. Using Jaccard similarity for detecting similar (non-exact) matches.

## Content Comparison

Content comparison between crawled websites and stored texts involves:

1. Processing the crawled content through the duplicate detection system.
2. Comparing the processed content against all stored texts for the user.
3. Identifying and reporting both exact and similar matches.

## Usage Examples

### Submitting a New Text

```javascript
const response = await fetch('http://localhost:3000/api/text', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_JWT_TOKEN'
  },
  body: JSON.stringify({ content: 'Your text content here' })
});
const data = await response.json();
console.log(data);
```

### Crawling and Comparing Content

```javascript
const response = await fetch('http://localhost:3000/api/crawl-and-compare', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_JWT_TOKEN'
  },
  body: JSON.stringify({ urls: ['https://example.com', 'https://another-example.com'] })
});
const data = await response.json();
console.log(data);
```

## Error Handling

The API uses standard HTTP status codes for error responses. Common codes include:

- 400: Bad Request (e.g., invalid input)
- 401: Unauthorized (authentication required)
- 403: Forbidden (insufficient permissions)
- 404: Not Found
- 500: Internal Server Error

Detailed error messages are provided in the response body.

## Security Measures

- JWT-based authentication
- Password hashing using bcrypt
- Input validation and sanitization
- Rate limiting to prevent abuse
- CORS configuration
- Helmet.js for HTTP header security
