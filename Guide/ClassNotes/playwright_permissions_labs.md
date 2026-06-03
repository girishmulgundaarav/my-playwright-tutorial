# Playwright Automation Lab Guide: Geolocation & Permissions

This lab guide covers 9 advanced geolocation mocking and browser hardware permission automation exercises designed to build E2E proficiency using the Geolocation & Permissions playground page. These exercises teach students how to grant/deny permission contexts, mock precise GPS coordinates, verify geofencing distance rules, read/write to the system clipboard under mock permissions, query device statuses via the Permissions API, handle camera/microphone prompts, and audit live permission status change event listeners.

---

## 🛠️ Global Setup

When testing browser permissions and geolocation, Playwright requires permissions to be granted at the **BrowserContext** level. You can configure these globally in `playwright.config.ts`, or dynamically inside specific tests or `beforeEach` hooks.

```typescript
import { test, expect } from '@playwright/test';

test.describe('Geolocation & Permissions Lab', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the Geolocation & Permissions page
    await page.goto('/permissions');
  });
});
```

---

## 📋 Part 1: Geolocation & Location Tracking Mocking (Labs 1–4)

### Lab 1: Grant & Mock Geolocation Coordinates
* **Objective**: Successfully mock the browser's Geolocation API to return custom coordinates (e.g., Tokyo: Lat 35.6762, Long 139.6503) and assert the page displays them correctly.
* **Selectors**:
  * Request button: `data-testid="request-geolocation-btn"`
  * Results text: `data-testid="geolocation-result"`
* **Exercises**:
  1. Grant the `'geolocation'` permission on the context.
  2. Set custom geolocation coordinates to `latitude: 35.6762` and `longitude: 139.6503`.
  3. Click **Request Geolocation**.
  4. Assert the result container contains `"Latitude: 35.6762, Longitude: 139.6503"`.

```typescript
test('Lab 1: Grant & Mock Geolocation Coordinates', async ({ page, context }) => {
  // 1. Grant permission and set geolocation
  await context.grantPermissions(['geolocation']);
  await context.setGeolocation({ latitude: 35.6762, longitude: 139.6503 });

  // 2. Trigger geolocation request
  await page.getByTestId('request-geolocation-btn').click();

  // 3. Assert mock data was received by the page
  await expect(page.getByTestId('geolocation-result')).toHaveText(
    'Latitude: 35.6762, Longitude: 139.6503'
  );
});
```

---

### Lab 2: Block/Deny Geolocation Access
* **Objective**: Verify application error handling when geolocation permissions are blocked or denied.
* **Selectors**:
  * Request button: `data-testid="request-geolocation-btn"`
  * Results text: `data-testid="geolocation-result"`
* **Exercises**:
  1. Clear any permissions or explicitly deny geolocation by granting an empty list or not granting permission. (Playwright contexts block geolocation by default if not granted, or you can use `clearPermissions()`).
  2. Click **Request Geolocation**.
  3. Assert that the result displays an error message containing `"Error: User denied Geolocation"` or `"Error: Permission denied"`.

```typescript
test('Lab 2: Block/Deny Geolocation Access', async ({ page, context }) => {
  // 1. Explicitly clear all permissions to trigger a prompt/denied state
  await context.clearPermissions();

  // 2. Click request button
  await page.getByTestId('request-geolocation-btn').click();

  // 3. Assert error state is displayed correctly
  await expect(page.getByTestId('geolocation-result')).toContainText('Error:');
});
```

---

### Lab 3: Continuous GPS Tracking Updates (`watchPosition`)
* **Objective**: Simulate live position movement updates by changing geolocation coordinates dynamically while the application is active.
* **Selectors**:
  * Toggle tracking button: `data-testid="watch-geo-btn"`
  * Coordinates output: `data-testid="watch-geo-coords"`
  * Update counter: `data-testid="watch-geo-count"`
* **Exercises**:
  1. Grant `'geolocation'` permission and set initial coordinates to Lat 40.7128, Long -74.0060 (New York).
  2. Click **Start Tracking** to initialize the continuous watch listener.
  3. Verify the display updates to show the initial coordinates and the update count equals 1.
  4. Dynamically update coordinates using `context.setGeolocation()` to Lat 34.0522, Long -118.2437 (Los Angeles).
  5. Assert that the displayed coordinates change and the update counter increments.

```typescript
test('Lab 3: Continuous GPS Tracking Updates', async ({ page, context }) => {
  // 1. Grant geolocation & set initial coordinates
  await context.grantPermissions(['geolocation']);
  await context.setGeolocation({ latitude: 40.7128, longitude: -74.0060 });

  // 2. Start tracking
  await page.getByTestId('watch-geo-btn').click();
  await expect(page.getByTestId('watch-geo-coords')).toContainText('Latitude: 40.7128, Longitude: -74.006');
  await expect(page.getByTestId('watch-geo-count')).toHaveText('1');

  // 3. Mock second movement update
  await context.setGeolocation({ latitude: 34.0522, longitude: -118.2437 });

  // 4. Assert update count incremented and new coordinates loaded
  await expect(page.getByTestId('watch-geo-coords')).toContainText('Latitude: 34.0522, Longitude: -118.2437');
  await expect(page.getByTestId('watch-geo-count')).toHaveText('2');
});
```

---

### Lab 4: Geofencing Calculation Verification
* **Objective**: Mock coordinates inside and outside of Paris to test local boundary validation calculations.
* **Selectors**:
  * Trigger button: `data-testid="geofence-trigger-btn"`
  * Status display: `data-testid="geofence-status"`
  * Calculated distance display: `data-testid="geofence-distance"`
* **Exercises**:
  1. Configure geolocation to be **inside Paris** (e.g. Lat 48.8584, Long 2.2945 - Eiffel Tower).
  2. Grant `'geolocation'` permissions, click **Verify Geofence Location**.
  3. Assert geofence status reads `"WITHIN_GEOFENCE"` and distance is less than 50km.
  4. Change geolocation coordinates to **outside Paris** (e.g. London: Lat 51.5074, Long -0.1278).
  5. Click **Verify Geofence Location** again and assert status updates to `"OUT_OF_BOUNDS"`.

```typescript
test('Lab 4: Geofencing Calculation Verification', async ({ page, context }) => {
  await context.grantPermissions(['geolocation']);

  // Case A: Inside Paris geofence radius
  await context.setGeolocation({ latitude: 48.8584, longitude: 2.2945 });
  await page.getByTestId('geofence-trigger-btn').click();
  await expect(page.getByTestId('geofence-status')).toHaveText('WITHIN_GEOFENCE');

  // Case B: Outside Paris geofence radius
  await context.setGeolocation({ latitude: 51.5074, longitude: -0.1278 });
  await page.getByTestId('geofence-trigger-btn').click();
  await expect(page.getByTestId('geofence-status')).toHaveText('OUT_OF_BOUNDS');
});
```

---

## 📋 Part 2: Hardware & Media Permissions (Labs 5–7)

### Lab 5: Querying Camera Permission States
* **Objective**: Mock permission query states to test how the UI handles query results.
* **Selectors**:
  * Check button: `data-testid="check-camera-btn"`
  * Status display: `data-testid="camera-status"`
* **Exercises**:
  1. Grant `'camera'` permission context.
  2. Click **Check Camera Status**.
  3. Assert status displays `"GRANTED"`.
  4. Clear permissions or deny camera access, then click the button again.
  5. Assert status displays `"DENIED"`.

```typescript
test('Lab 5: Querying Camera Permission States', async ({ page, context }) => {
  // Case A: Permission Granted
  await context.grantPermissions(['camera']);
  await page.getByTestId('check-camera-btn').click();
  await expect(page.getByTestId('camera-status')).toHaveText('GRANTED');

  // Case B: Permission Denied
  await context.clearPermissions();
  await page.getByTestId('check-camera-btn').click();
  await expect(page.getByTestId('camera-status')).toHaveText('DENIED');
});
```

---

### Lab 6: Microphone Stream Grant & Deny (`getUserMedia`)
* **Objective**: Verify media device capturing requests function properly when microphone access is mocked.
* **Selectors**:
  * Check Mic button: `data-testid="check-mic-btn"`
  * Request Access button: `data-testid="request-mic-btn"`
  * Status display: `data-testid="mic-status"`
* **Exercises**:
  1. Grant `'microphone'` permissions on the context.
  2. Click **Check Mic Status** to assert prompt status initial conditions.
  3. Click **Request Mic Access**.
  4. Assert the status display becomes `"Granted"`.
  5. Clear permissions, click **Request Mic Access** and verify that status displays `"Denied"`.

```typescript
test('Lab 6: Microphone Stream Grant & Deny', async ({ page, context }) => {
  // Case A: Allowed microphone stream access
  await context.grantPermissions(['microphone']);
  await page.getByTestId('request-mic-btn').click();
  await expect(page.getByTestId('mic-status')).toHaveText('GRANTED');

  // Case B: Denied microphone stream access
  await context.clearPermissions();
  await page.getByTestId('request-mic-btn').click();
  await expect(page.getByTestId('mic-status')).toHaveText('DENIED');
});
```

---

### Lab 7: Notification Triggers and Permissions
* **Objective**: Verify web notifications permission requests and handle toast confirmation messages.
* **Selectors**:
  * Check Status: `data-testid="check-notifications-btn"`
  * Request Access: `data-testid="request-notifications-btn"`
  * Send Notification: `data-testid="send-test-notification-btn"`
  * Status indicator: `data-testid="notification-permission-status"`
  * Toast response: `data-testid="notification-toast-msg"`
* **Exercises**:
  1. Grant `'notifications'` permission context.
  2. Click **Check Status** and assert status output displays `"granted"`.
  3. Click **Send Notification**.
  4. Verify the feedback message reads `"Test notification dispatched."`.
  5. Clear permissions, click **Send Notification** and verify message reads `"Cannot dispatch notification: Permission not GRANTED"`.

```typescript
test('Lab 7: Notification Triggers and Permissions', async ({ page, context }) => {
  // Case A: Notification Permissions Granted
  await context.grantPermissions(['notifications']);
  await page.getByTestId('check-notifications-btn').click();
  await expect(page.getByTestId('notification-permission-status')).toHaveText('GRANTED');

  await page.getByTestId('send-test-notification-btn').click();
  await expect(page.getByTestId('notification-toast-msg')).toHaveText('Test notification dispatched.');

  // Case B: Notification Permissions Blocked
  await context.clearPermissions();
  await page.getByTestId('send-test-notification-btn').click();
  await expect(page.getByTestId('notification-toast-msg')).toHaveText('Cannot dispatch notification: Permission not GRANTED');
});
```

---

## 📋 Part 3: Clipboard & Live Listeners (Labs 8–9)

### Lab 8: Clipboard Access Mocking (Copy/Paste Permissions)
* **Objective**: Grant clipboard read/write permissions to automate writing text to input fields, copying them programmatically, and pasting into a secondary display.
* **Selectors**:
  * Input text box: `data-testid="clipboard-input"`
  * Copy button: `data-testid="clipboard-copy-btn"`
  * Paste button: `data-testid="clipboard-paste-btn"`
  * Copy/Paste status: `data-testid="clipboard-status"`
  * Output result: `data-testid="clipboard-output"`
* **Exercises**:
  1. Grant permissions `'clipboard-read'` and `'clipboard-write'` on the browser context.
  2. Type `"Playwright Permission Sandbox Text"` into the text input.
  3. Click **Copy**. Assert status reads `"Copied successfully!"`.
  4. Click **Paste**. Assert the output container text matches `"Playwright Permission Sandbox Text"`.

```typescript
test('Lab 8: Clipboard Access Mocking', async ({ page, context }) => {
  // 1. Grant clipboard read/write access
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);

  // 2. Input and Copy text
  const testVal = 'Playwright Permission Sandbox Text';
  await page.getByTestId('clipboard-input').fill(testVal);
  await page.getByTestId('clipboard-copy-btn').click();
  await expect(page.getByTestId('clipboard-status')).toHaveText('Copied successfully!');

  // 3. Paste and verify result
  await page.getByTestId('clipboard-paste-btn').click();
  await expect(page.getByTestId('clipboard-status')).toHaveText('Pasted successfully!');
  await expect(page.getByTestId('clipboard-output')).toHaveText(testVal);
});
```

---

### Lab 9: Live Permission Event Listener Audits
* **Objective**: Assert that active event handlers capture and log browser permission status change triggers in real-time.
* **Selectors**:
  * Panel Status: `data-testid="permission-listener-status"`
  * Log container: `data-testid="permission-listener-logs"`
* **Exercises**:
  1. Set initial context permissions: Grant only `'geolocation'`.
  2. Load the playground page and verify the listener reads `"ACTIVE"`.
  3. Dynamically switch permission settings mid-test using `context.grantPermissions(['notifications'])`.
  4. Assert the log container logs a status change entry (e.g. containing `"status updated"`).

```typescript
test('Lab 9: Live Permission Event Listener Audits', async ({ page, context }) => {
  // 1. Grant geolocation initial permission
  await context.grantPermissions(['geolocation']);
  await page.reload(); // reload ensures the event listener is bound under correct initial states
  
  await expect(page.getByTestId('permission-listener-status')).toHaveText('ACTIVE');

  // 2. Change permissions dynamically to trigger the listener event
  await context.grantPermissions(['notifications']);

  // 3. Verify logs updated automatically reflecting permission change events
  await expect(page.getByTestId('permission-listener-logs')).toContainText('status updated');
});
```
