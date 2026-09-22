# CareSignal Mobile

Patient-facing Expo foundation for CareSignal. Includes branded welcome, patient registration, login, persistent AsyncStorage session management, and the **AI Symptom Checker**.

---

## Features

- **Authentication**: Patient registration, login, and secure JWT session persistence with `@react-native-async-storage/async-storage`.
- **Symptom Checker**:
  - Fetches the clinical catalog of ~130 symptoms via `GET /api/symptoms`.
  - Fast live search filtering and multi-symptom selection with removable chips.
  - Submits reported symptoms to `POST /api/predictions/symptom-check`.
  - Machine learning assessment ranking top condition matches with statistical probabilities.
  - Contextual follow-up suggestions (e.g. diabetes or cardiovascular risk recommendations).
  - Clear medical disclaimers and option to reset and re-check.

---

## Prerequisites & Running Locally

The mobile application connects through the Node.js backend to the Python FastAPI ML microservice. For the symptom checker to return live predictions, **both services must be running**:

### 1. Start the ML Service (Port 8002)

```bash
cd ml-service
# Activate your virtual environment (e.g., venv\Scripts\activate on Windows)
python -m uvicorn app:app --port 8002
```

> **Note**: Port 8002 is required because `backend/.env` is configured with `ML_SERVICE_URL=http://127.0.0.1:8002`.

### 2. Start the Backend API (Port 8000)

```bash
cd backend
npm start
```

### 3. Start Expo Mobile App

```bash
cd mobile
npx expo start
```

---

## Testing on Physical Phone (Expo Go)

`127.0.0.1` refers to the mobile device itself when running through Expo Go. It cannot reach the backend running on your computer.

1. Find your computer's local network IP on Windows:
   ```powershell
   ipconfig
   ```
2. Find the active Wi-Fi adapter IPv4 address (e.g., `10.51.51.167` or `192.168.1.x`).
3. Update `src/api/apiClient.js`:
   ```javascript
   export const API_BASE_URL = 'http://10.51.51.167:8000';
   ```
4. Ensure both your computer and phone are connected to the same Wi-Fi network.
5. Scan the terminal QR code with **Expo Go** (Android) or the **Camera app** (iOS).

---

## Testing the Symptom Checker Flow

1. Register a new patient account or sign in.
2. On the Home screen, tap **"Check my symptoms →"**.
3. Search for symptoms (e.g. "fever", "chills", "cough", "fatigue") and tap to select them.
4. Review your selected symptoms in the top chips section.
5. Tap **"Check symptoms (N)"**.
6. The app submits to the ML service and renders the **Clinical Indication** screen displaying:
   - Primary predicted condition with percentage match.
   - Secondary candidate conditions.
   - Follow-up recommendation banner (if diabetes or heart-related symptoms are detected).
   - Medical disclaimer.
   - Option to "Check symptoms again" (clears selection) or "Return to Home".
