# NordicWalking Project

This repository contains the source code for the NordicWalking application, featuring a .NET 10 backend and a React (Vite) frontend.

<img src="https://ucarecdn.com/2c299c78-7f7c-431b-b43c-eee55af968e1/Screenshot20260203at55303PM.png" alt="Project Screenshot" width="800">

## Prerequisites

Before running the application, ensure you have the following installed:

- **.NET 10 SDK**: [Download .NET](https://dotnet.microsoft.com/download)
- **Node.js** (LTS recommended): [Download Node.js](https://nodejs.org/)

## Getting Started

### 1. Backend

The backend is an ASP.NET Core Web API project.

**Steps to run:**

1. Navigate to the backend directory:
   ```bash
   cd NordicWalking.Backend
   ```

2. Run the application:
   ```bash
   dotnet run
   ```

The backend API will start and be available at:
- **HTTP**: `http://localhost:5191`
- **HTTPS**: `https://localhost:7055`

> **Note:** The API provides endpoints for track data and GPX file processing.

### 2. Frontend

The frontend is a React application built with Vite and Tailwind CSS.

**Steps to run:**

1. Navigate to the frontend directory:
   ```bash
   cd NordicWalking.Frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

The frontend application will typically run at: `http://localhost:5173` (check the terminal output for the exact URL).

## Project Structure

- **`NordicWalking.Backend/`**: .NET Web API source code.
  - `Data/`: Contains JSON data storage.
  - `GpxSources/`: Source GPX files.
- **`NordicWalking.Frontend/`**: React frontend source code.
  - `src/`: Components, assets, and application logic.
