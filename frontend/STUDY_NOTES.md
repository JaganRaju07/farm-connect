# Farm Connect - Week 3 Technical Study Notes 📚
*Prepared for Mentor Presentation & Interview Alignment*

This document outlines the core architectural and implementation patterns adopted in the Week 3 frontend deliverables, detailing **why** these patterns represent modern industry-standard practices.

---

## 1. FormData vs JSON for File Upload

### Standard JSON Payloads
When making standard HTTP requests, client-side applications default to stringified JSON format (`Content-Type: application/json`):
```javascript
axios.post('/api/products', { name: 'Tomatoes', price: 40 });
```
JSON is human-readable, lightweight, and easy to parse, but **cannot native encode binary objects** (like images, PDF files, or videos) without converting them to massive Base64 strings. Base64 encoding increases the request size by roughly 33%, causing substantial overhead.

### FormData Objects (Multipart requests)
For file uploads, we use browser-native `FormData` objects paired with the `multipart/form-data` encoding standard:
```javascript
const fd = new FormData();
fd.append('name', 'Tomatoes');
fd.append('image', fileInput.files[0]); // Binary image attachment
axios.post('/api/products', fd);
```
- **Why this works:** `FormData` lets you append key-value pairs where values can be either strings or binary files (`Blob`/`File`).
- **Axios integration:** By passing a `FormData` object as the request payload, Axios automatically strips the default `application/json` header and sets `Content-Type: multipart/form-data`, appending the correct cryptographic boundaries to delineate fields.

---

## 2. Modal Overlay Pattern

A **Modal** is a UI overlay that prompts users for input or displays critical notices while blocking interaction with the parent page.

### Architectural Best Practices
1. **Backdrop Blocking:** Renders a dark, semi-transparent overlay behind the modal window, preventing ad-hoc clicking of parent elements.
2. **Contextual Dismissal:** The modal must close smoothly when:
   - The "Cancel" or close (`X`) button is clicked.
   - The user clicks on the backdrop outside the modal container.
   - The `Escape` key is pressed.
3. **Data Refresh via Callbacks:** To ensure fresh list updates without full-page reloads, parent components pass down an `onSuccess()` callback to the modal. When the modal form successfully completes a transaction, it invokes `onSuccess()`, triggering the parent to run fetch operations.

---

## 3. Pull-based Notification Polling

### The Architecture: Pull vs Push
- **Pull-based (Polling):** The client periodically asks the server, "Is there anything new?" (e.g., every 30 seconds).
- **Push-based (WebSockets / SSE):** The server holds open a continuous TCP socket, pushing alerts instantly as they occur.

### Why Polling for MVPs?
While Push-based networks are ideal for real-time applications (like instant chats), they introduce high computational overhead:
1. **Server scaling:** Each open WebSocket requires memory and server persistence, introducing complexity in load-balanced setups.
2. **Stateless servers:** HTTP Polling is completely stateless, making backend deployments (e.g. Serverless, Docker nodes) easily scalable.
3. **Sufficient UX:** For e-commerce tracking (placed, packed, delivered), a 30-second delay is imperceptible and completely matches professional production flows.

---

## 4. useEffect Dependency Array Rules

React's `useEffect` hook runs side-effects. The dependency array tells React exactly when to re-trigger the effect:

```typescript
// 1. Run once on mount (empty array)
useEffect(() => { fetchData() }, []);

// 2. Run whenever token changes
useEffect(() => { fetchData() }, [token]);

// 3. Infinite Loop Risk (No dependency array)
useEffect(() => { fetchData() }); // Runs after EVERY single render, causing infinite database query loops.
```
**Mentor Tip:** Always ensure that all props, state variables, or hook-derived values referenced inside the effect callback are explicitly listed in the dependency array (or memoized using `useCallback` or `useMemo`) to prevent stale closures.
