# web_calculator

A web-based calculator with advanced math, plotting, and matrix operations.

---

## Setup Instructions

### Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher recommended)
- [npm](https://www.npmjs.com/) (comes with Node.js)
- [MongoDB](https://www.mongodb.com/) (for backend database)

---

## Frontend Setup

1. Open a terminal and navigate to the frontend directory:

   ```sh
   cd client
   ```

2. Install dependencies:

   ```sh
   npm install
   ```

3. Start the frontend development server:

   ```sh
   npm run dev
   ```

   The app will run at [http://localhost:5173](http://localhost:5173) by default.

---

## Backend Setup

1. Open a terminal and navigate to the backend directory:

   ```sh
   cd server
   ```

2. Install dependencies:

   ```sh
   npm install
   ```

3. Configure environment variables:

   - Set your `MONGO_URI` and other required variables in `.env`.

4. Start the backend server:

   ```sh
   npm run dev
   ```

   The backend will run at [http://localhost:4000](http://localhost:4000) by default.

---

## Notes

- Make sure MongoDB is running and accessible.
- The frontend communicates with the backend at `http://localhost:4000`.
- Update environment variables in `.env` for backend configuration (e.g., database URI).
- For matrix operations, input matrices as JSON arrays (e.g., `[[1,2],[3,4]]`).
- For advanced math and plotting, see the in-app help/info box.

---

## Project Structure

```
web_calculator/
├── client/      # React frontend
├── server/      # Node.js/Express backend
└── README.md
```

---

