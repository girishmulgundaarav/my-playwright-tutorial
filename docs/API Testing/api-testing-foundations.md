---
title: API Testing Foundations
sidebar_position: 1
---

# API Testing Foundations

In modern web applications, the user interface (UI) is just a layer built on top of underlying services. Behind the screens, data is processed, stored, and retrieved using **Application Programming Interfaces (APIs)**. 

API testing validates the core business logic, database transactions, security, and performance of these backend services before they reach the user interface.

---

## 📐 Core Concepts: UI vs. API Testing

While UI testing operates at the presentation layer (inspecting buttons, forms, and pages), API testing validates data exchanges directly at the message layer.

| Metric | UI Automation | API Automation |
| :--- | :--- | :--- |
| **Execution Speed** | Slow (requires browser rendering, page loads) | Extremely Fast (milliseconds per request) |
| **Stability / Flakiness** | High (susceptible to dynamic UI changes, timing issues) | Extremely Low (highly stable structured JSON payloads) |
| **Bug Detection Phase** | Late (requires fully developed UI) | Early (can run as soon as endpoints are defined) |
| **Test Level** | End-to-End User Experience | Integration, Security, and Business Logic |

---

## 🌐 The HTTP Request-Response Model

Most APIs communicate over the **HTTP (Hypertext Transfer Protocol)**. A standard interaction consists of a client sending a request and the server sending a response.

![Core Foundations of API Testing](/img/playwright_api_foundations.png)

### 1. Anatomy of an HTTP Request
An HTTP Request contains four key components:
1.  **HTTP Method (Verb):** Instructs the server on the type of operation to perform:
    *   `GET`: Retrieve data (read-only).
    *   `POST`: Create a new resource.
    *   `PUT`: Update/replace an existing resource entirely.
    *   `PATCH`: Partially update specific fields of a resource.
    *   `DELETE`: Remove a resource.
2.  **Request URL (Endpoint):** Address pointing to the resource (e.g., `https://restful-booker.herokuapp.com/booking`).
3.  **Headers:** Key-value pairs providing metadata about the request (e.g., `Content-Type: application/json` or authentication tokens).
4.  **Request Body (Payload):** Data sent to the server (primarily JSON for REST APIs).

### 2. Anatomy of an HTTP Response
An HTTP Response returns the outcome of the request:
1.  **Status Code:** Numeric code indicating the request outcome (e.g., `200 OK`, `201 Created`, `400 Bad Request`, `401 Unauthorized`, `404 Not Found`, `500 Internal Server Error`).
2.  **Headers:** Server metadata, caching rules, content type, and cookie settings.
3.  **Response Body:** The data payload returned by the server, typically formatted as JSON.

---

## 🛠️ Postman Client Setup & Collection Guide

**Postman** is an interactive, visual API development tool used to design, mock, debug, and manually test APIs. 

### 1. Installation & Environment Configuration
1.  **Download Postman:** Install the native desktop client from the [Official Postman Download Page](https://www.postman.com/downloads/).
2.  **Create a Workspace:** Set up a dedicated workspace (e.g., `Playwright API Testing`) to organize collections and configurations.
3.  **Verify via Public Sandbox:**
    *   Send a `GET` request to the public endpoint: `https://reqres.in/api/users?page=2`.
    *   Confirm the status is `200 OK` and inspect the structured JSON user records returned.

### 2. Organizing with Collections & Environments
*   **Collections:** Folders in Postman used to group related requests (e.g., all endpoints related to a booking API).
*   **Environment Variables:** Key-value pairs used to substitute dynamic values across requests:
    *   Define a variable `url` with value `https://restful-booker.herokuapp.com`.
    *   Reference the variable in the request address bar using double curly braces: `{{url}}/booking`.

> [!TIP]
> **Exporting Collections:** You can share collections by exporting them as JSON files (Share ➔ Export ➔ Collection v2.1). In the lessons directory, you can find the exported `BookingAPI.postman_collection.json` containing pre-configured requests for testing.

---

## 📚 Introduction to RESTful Booker API Sandbox

For our automated API verification practices, we will use the open-source **RESTful Booker API Sandbox**.

*   **Base URL:** `https://restful-booker.herokuapp.com`
*   **API Documentation:** The service provides endpoints to authenticate, create, fetch, modify, and delete room bookings.
*   **Main Endpoints:**
    *   `POST /auth`: Generates an authentication token for administrative requests.
    *   `GET /booking`: Fetches all booking IDs (supports filter queries).
    *   `GET /booking/:id`: Retrieves detailed information for a specific booking.
    *   `POST /booking`: Creates a new booking.
    *   `PUT /booking/:id`: Performs a complete booking update (requires authentication).
    *   `PATCH /booking/:id`: Performs a partial booking update (requires authentication).
    *   `DELETE /booking/:id`: Removes a booking (requires authentication).
