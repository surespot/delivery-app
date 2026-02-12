# Delivery Confirmation Code - Rider App Integration Guide

## Overview

When delivering a **door delivery** order, riders must obtain a **4-digit confirmation code** from the customer and provide it when marking the order as delivered. This code is automatically generated when the order payment is confirmed and sent to the customer via SMS and WebSocket.

**Rider App** must:
1. Request the confirmation code from the customer
2. Enter the code when marking order as delivered
3. Handle validation errors if code is incorrect

---

## HTTP API Changes

### `POST /orders/rider/:orderId/delivered`

**Updated Request Body** (confirmation code is now **required**):

```json
{
  "confirmationCode": "1234"
}
```

**Request Schema**:
- `confirmationCode` (string, required) - Exactly 4 digits (e.g., "1234")

**Success Response** (200):
```json
{
  "success": true,
  "message": "Order marked as delivered successfully",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "orderNumber": "ORD-2026-000123",
    "status": "delivered",
    ...
  }
}
```

**Error Responses**:

1. **Missing Code** (400):
```json
{
  "success": false,
  "error": {
    "code": "CONFIRMATION_CODE_MISSING",
    "message": "Delivery confirmation code is required but not found for this order"
  }
}
```

1. **Invalid Code** (400):
```json
{
  "success": false,
  "error": {
    "code": "INVALID_CONFIRMATION_CODE",
    "message": "Invalid delivery confirmation code. Please verify the code with the customer."
  }
}
```

1. **Order Not Assigned** (403):
```json
{
  "success": false,
  "error": {
    "code": "ORDER_NOT_ASSIGNED_TO_RIDER",
    "message": "This order is not assigned to you"
  }
}
```

1. **Invalid Status** (400):
```json
{
  "success": false,
  "error": {
    "code": "INVALID_ORDER_STATUS",
    "message": "Order must be out for delivery to mark as delivered. Current status: ready"
  }
}
```

---

## Order Details Endpoint

### `GET /orders/:orderId`

**Response** includes `deliveryConfirmationCode` (if present):

```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "orderNumber": "ORD-2026-000123",
    "status": "out-for-delivery",
    "deliveryType": "door-delivery",
    "deliveryConfirmationCode": "1234",  // Present for door-delivery orders
    "deliveryAddress": {
      "address": "123 Main St, Lagos",
      ...
    },
    ...
  }
}
```

**Note**: 
- `deliveryConfirmationCode` is only present for `door-delivery` orders
- It's generated when payment is confirmed
- **Rider should NOT see this code** - it's for customer reference only
- Rider must **ask customer** for the code

---

## UI/UX Flow

### 1. When Order is Assigned to Rider

- Rider sees order in their assigned orders list
- Order status: `READY` or `OUT_FOR_DELIVERY`
- **No confirmation code visible** (rider must ask customer)

### 2. When Rider Arrives at Delivery Location

- Rider opens order details
- **Show prompt**: "Ask customer for 4-digit confirmation code"
- **Input field** for entering the code (4 digits, numeric only)
- **"Mark as Delivered" button** (disabled until code is entered)

### 3. When Marking as Delivered

**UI Flow**:
```
1. Rider enters confirmation code: [1][2][3][4]
2. Rider taps "Mark as Delivered"
3. Show loading state
4. If success → Show success message, update order status
5. If error → Show error message, allow retry
```

**Error Handling**:
- **INVALID_CONFIRMATION_CODE**: 
  - Show error: "Invalid code. Please verify with customer."
  - Clear input field
  - Allow retry
  
- **CONFIRMATION_CODE_MISSING**:
  - Show error: "Confirmation code not found. Please contact support."
  - This shouldn't happen for door-delivery orders

### 4. Code Input Validation

**Client-side validation** (before API call):
- Must be exactly 4 digits
- Must be numeric only (0-9)
- Format: `XXXX` (e.g., "1234", not "12 34" or "12-34")

**Example validation**:
```javascript
function validateConfirmationCode(code) {
  return /^[0-9]{4}$/.test(code);
}
```

---

## Implementation Example

### TypeScript/React Example

```typescript
interface MarkDeliveredRequest {
  confirmationCode: string;
  message?: string;
  latitude?: number;
  longitude?: number;
}

async function markOrderAsDelivered(
  orderId: string,
  data: MarkDeliveredRequest
): Promise<OrderResponse> {
  const response = await fetch(`/orders/rider/${orderId}/delivered`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    },
    body: JSON.stringify({
      confirmationCode: data.confirmationCode,
      message: data.message,
      latitude: data.latitude,
      longitude: data.longitude
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to mark order as delivered');
  }

  return response.json();
}

// UI Component
function DeliveryConfirmationForm({ orderId }: { orderId: string }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    // Validate code format
    if (!/^[0-9]{4}$/.test(code)) {
      setError('Code must be exactly 4 digits');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const location = await getCurrentLocation(); // Your location service
      
      await markOrderAsDelivered(orderId, {
        confirmationCode: code,
        latitude: location.latitude,
        longitude: location.longitude
      });

      // Success - navigate or update UI
      showSuccessMessage('Order marked as delivered');
    } catch (err: any) {
      if (err.message.includes('INVALID_CONFIRMATION_CODE')) {
        setError('Invalid code. Please verify with customer.');
        setCode(''); // Clear input
      } else {
        setError(err.message || 'Failed to mark as delivered');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View>
      <Text>Ask customer for 4-digit confirmation code</Text>
      <TextInput
        value={code}
        onChangeText={setCode}
        keyboardType="numeric"
        maxLength={4}
        placeholder="1234"
      />
      {error && <Text style={{ color: 'red' }}>{error}</Text>}
      <Button
        title="Mark as Delivered"
        onPress={handleSubmit}
        disabled={code.length !== 4 || loading}
      />
    </View>
  );
}
```

---

## Edge Cases

### 1. Pickup Orders

- **No confirmation code required**
- Backend will skip code validation for `pickup` orders
- Rider can mark as delivered without code

### 2. Code Not Provided by Customer

- Rider should **politely ask customer** to check their SMS or app
- If customer doesn't have code, rider can contact support
- Backend will reject delivery without valid code

### 3. Wrong Code Entered

- Backend returns `INVALID_CONFIRMATION_CODE`
- Rider should verify code with customer
- Allow retry (don't block rider)

### 4. Order Status Changes

- Code validation only happens when order status is `OUT_FOR_DELIVERY`
- If order status changes (e.g., cancelled), delivery will fail with appropriate error

---

## Testing Checklist

- [ ] Enter valid 4-digit code → Delivery succeeds
- [ ] Enter invalid code → Error: "Invalid confirmation code"
- [ ] Enter code with wrong format (e.g., "12 34") → Client-side validation error
- [ ] Mark pickup order as delivered → No code required
- [ ] Handle network errors gracefully
- [ ] Show loading state during API call
- [ ] Clear code input on error
- [ ] Allow retry after error

---

## Backward Compatibility

**Important**: The `confirmationCode` field is **required** for door-delivery orders. Old versions of the rider app that don't send the code will receive a validation error.

**Migration Path**:
1. Update rider app to always request code from customer
2. Update API call to include `confirmationCode` in request body
3. Handle validation errors gracefully

---

## Summary

**What Rider App Needs to Do**:

1. ✅ **Request code from customer** when arriving at delivery location
2. ✅ **Validate code format** client-side (4 digits, numeric)
3. ✅ **Include code in API request** when marking order as delivered
4. ✅ **Handle validation errors** (invalid code, missing code)
5. ✅ **Show clear UI** prompting rider to ask customer for code
6. ✅ **Allow retry** if code is incorrect

**API Contract**:
- Endpoint: `POST /orders/rider/:orderId/delivered`
- Required field: `confirmationCode` (string, 4 digits)
- Error codes: `INVALID_CONFIRMATION_CODE`, `CONFIRMATION_CODE_MISSING`

**User Flow**:
1. Rider arrives at customer location
2. Rider asks: "What's your 4-digit confirmation code?"
3. Customer provides code (from SMS/app)
4. Rider enters code in app
5. Rider taps "Mark as Delivered"
6. Backend validates code → Success or error
7. If error, rider verifies code with customer and retries
