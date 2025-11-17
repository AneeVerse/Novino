# Shiprocket API Testing Guide with Postman

This guide will help you test and debug the Shiprocket API integration using Postman.

## Prerequisites

1. **Postman Desktop App**: Download from [postman.com](https://www.postman.com/downloads/)
2. **Shiprocket API Credentials**:
   - `SHIPROCKET_EMAIL`: Your Shiprocket API user email
   - `SHIPROCKET_PASSWORD`: Your Shiprocket API user password
   - `SHIPROCKET_CHANNEL_ID`: Your Shiprocket channel ID
   - Shiprocket API Base URL: `https://apiv2.shiprocket.in/v1/external`

## Step 1: Import Shiprocket Postman Collection

1. Open Postman
2. Click **Import** button
3. Import Shiprocket's official collection:
   - Go to: https://www.postman.com/shiprocketdev/shiprocket-dev-s-public-workspace/collection/qu05zax/shiprocket-api
   - Click **Run in Postman** button
   - This will import all Shiprocket API endpoints into your Postman workspace

## Step 2: Set Up Environment Variables

1. In Postman, click the **Environments** icon (left sidebar) or press `Ctrl+E`
2. Click **+** to create a new environment
3. Name it `Shiprocket API`
4. Add the following variables:

| Variable | Initial Value | Current Value |
|----------|---------------|---------------|
| `base_url` | `https://apiv2.shiprocket.in/v1/external` | `https://apiv2.shiprocket.in/v1/external` |
| `email` | Your Shiprocket email | Your Shiprocket email |
| `password` | Your Shiprocket password | Your Shiprocket password |
| `token` | (leave empty) | (will be set automatically) |
| `channel_id` | Your channel ID | Your channel ID |

5. Select this environment from the dropdown in the top-right corner

## Step 3: Authenticate and Get Token

1. In the imported collection, find the **Authentication** request
2. The request should be:
   - **Method**: `POST`
   - **URL**: `{{base_url}}/auth/login`
   - **Body** (raw JSON):
   ```json
   {
     "email": "{{email}}",
     "password": "{{password}}"
   }
   ```
3. Click **Send**
4. If successful, you'll get a response like:
   ```json
   {
     "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
     "expires_in": 864000
   }
   ```
5. Copy the `token` value
6. Go back to Environment variables
7. Update the `token` variable with the copied value
8. Save the environment

**Note**: Tokens are valid for 240 hours (10 days)

## Step 4: Test Create Order Endpoint

### Endpoint Details
- **Method**: `POST`
- **URL**: `{{base_url}}/orders/create/adhoc`
- **Headers**:
  ```
  Content-Type: application/json
  Authorization: Bearer {{token}}
  ```

### Sample Request Body

```json
{
  "order_id": "ORD1234567890123",
  "order_date": "2024-01-15T10:30:00.000Z",
  "pickup_location": "Primary",
  "channel_id": 123456,
  "billing_customer_name": "John Doe",
  "billing_last_name": "",
  "billing_phone": "9876543210",
  "billing_email": "john.doe@example.com",
  "billing_address": "123 Main Street",
  "billing_address_2": "Apartment 4B",
  "billing_city": "Mumbai",
  "billing_state": "Maharashtra",
  "billing_country": "India",
  "billing_pincode": "400001",
  "shipping_is_billing": true,
  "payment_method": "PREPAID",
  "sub_total": 1000,
  "length": 10,
  "breadth": 10,
  "height": 5,
  "weight": 0.5,
  "order_items": [
    {
      "name": "Test Product",
      "sku": "PROD001",
      "units": 1,
      "selling_price": 1000,
      "discount": 0
    }
  ]
}
```

### Important: Phone Number Format

**⚠️ CRITICAL**: The `billing_phone` field must be:
- Exactly **10 digits**
- No spaces, dashes, or special characters
- Must be a valid Indian mobile number (starting with 6-9)
- Examples:
  - ✅ Valid: `"9876543210"`, `"8765432109"`, `"9123456789"`
  - ❌ Invalid: `"+91 9876543210"`, `"98765-43210"`, `"09876543210"`, `"1234567890"`

### Common Phone Number Format Issues

If you get error `422: Phone number is in invalid format`, check:

1. **Phone has spaces/special chars**: Remove all non-digits
   - Input: `"+91 98765 43210"` → Normalized: `"9876543210"`

2. **Phone has country code**: Remove `+91` or `91` prefix
   - Input: `"919876543210"` → Normalized: `"9876543210"`

3. **Phone has leading zero**: Remove leading zero
   - Input: `"09876543210"` → Normalized: `"9876543210"`

4. **Phone is too short/long**: Take last 10 digits
   - Input: `"123456789012345"` → Normalized: `"2345678901"`

5. **Phone starts with invalid digit**: Must start with 6-9 for mobile
   - ❌ Invalid: `"1234567890"` (starts with 1)
   - ✅ Valid: `"9876543210"` (starts with 9)

### Testing Different Phone Formats

Test these scenarios in Postman:

**Test Case 1: Standard 10-digit number**
```json
{
  "billing_phone": "9876543210"
}
```
Expected: ✅ Should work

**Test Case 2: Phone with country code**
```json
{
  "billing_phone": "919876543210"
}
```
Expected: ❌ Should normalize to `9876543210` (check your code)

**Test Case 3: Phone with spaces**
```json
{
  "billing_phone": "+91 98765 43210"
}
```
Expected: ❌ Should normalize to `9876543210` (check your code)

**Test Case 4: Phone with leading zero**
```json
{
  "billing_phone": "09876543210"
}
```
Expected: ❌ Should normalize to `9876543210` (check your code)

**Test Case 5: Invalid phone (starts with 1)**
```json
{
  "billing_phone": "1234567890"
}
```
Expected: ❌ Should be rejected with error

## Step 5: Debugging Failed Requests

### Check Response Status Codes

- **200/201**: Success ✅
- **400**: Bad Request - Check request body format
- **401**: Unauthorized - Token expired or invalid
- **422**: Validation Error - Check field requirements (phone format, etc.)
- **500**: Server Error - Contact Shiprocket support

### Check Response Body

On error, Shiprocket returns detailed error messages:

```json
{
  "message": "Phone number is in invalid format",
  "errors": {
    "billing_phone": ["Phone number is in invalid format"]
  },
  "status_code": 422
}
```

### Logging in Postman

1. Click on the request
2. Go to **Tests** tab
3. Add test script to log response:
```javascript
pm.test("Log response", function () {
    console.log(pm.response.json());
});
```

4. Click **Send** and check **Console** (View → Show Postman Console)

## Step 6: Testing Your Application Integration

### Test with Real Order Data

1. **Start your Next.js dev server**:
   ```bash
   npm run dev
   ```

2. **Create a test order through your application**

3. **Check server logs** for the exact request being sent to Shiprocket

4. **Copy the request body** from logs

5. **Test the same payload in Postman** to isolate if the issue is with:
   - Phone normalization logic
   - Request formatting
   - Shiprocket API

### Compare Request Payloads

1. **Application Request** (from your server logs):
   - Check what `billing_phone` value is being sent
   - Verify it's exactly 10 digits

2. **Postman Request**:
   - Use the same payload
   - Manually set `billing_phone` to a normalized value
   - Compare responses

## Step 7: Common Issues and Solutions

### Issue 1: Phone Number Format Error (422)

**Problem**: `"Phone number is in invalid format"`

**Solution**:
1. Check the phone number value in your database/order
2. Ensure it's being normalized correctly
3. Use the `normalizePhone()` function before sending to Shiprocket
4. Test the normalization with various input formats

**Quick Fix**: Add validation in your code:
```typescript
const normalizedPhone = normalizePhone(payload.deliveryAddress.phone);
if (!normalizedPhone || normalizedPhone.length !== 10) {
  throw new Error(`Invalid phone number: ${payload.deliveryAddress.phone}`);
}
```

### Issue 2: Token Expired (401)

**Problem**: `"Unauthorized"` or `401` error

**Solution**:
1. Generate a new token using the Authentication endpoint
2. Update the `token` environment variable in Postman
3. For your application: Ensure token refresh logic is working

### Issue 3: Channel ID Not Found

**Problem**: Channel ID related errors

**Solution**:
1. Verify `SHIPROCKET_CHANNEL_ID` is correct
2. Check your Shiprocket dashboard for the correct channel ID
3. Ensure channel is active

## Step 8: Automated Testing with Postman Collections

1. **Save requests** in a collection
2. **Use environment variables** for dynamic values
3. **Add tests** to validate responses
4. **Run collection** to test all endpoints at once

Example test script:
```javascript
pm.test("Status code is 201", function () {
    pm.response.to.have.status(201);
});

pm.test("Response has shipment_id", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.shipment_id).to.exist;
});

// Save shipment_id for next request
if (pm.response.code === 201) {
    var jsonData = pm.response.json();
    pm.environment.set("shipment_id", jsonData.shipment_id);
}
```

## Additional Resources

- **Shiprocket API Documentation**: https://apidocs.shiprocket.in/
- **Shiprocket Postman Collection**: https://www.postman.com/shiprocketdev/shiprocket-dev-s-public-workspace/collection/qu05zax/shiprocket-api
- **Shiprocket Support**: 
  - Integration Support: integration@shiprocket.in
  - General Support: support@shiprocket.in

## Quick Checklist

Before testing, ensure:
- [ ] Postman is installed and updated
- [ ] Shiprocket API credentials are correct
- [ ] Environment variables are set
- [ ] Authentication token is generated and set
- [ ] Phone numbers are normalized to 10 digits
- [ ] All required fields are present in request body
- [ ] Request headers include `Authorization: Bearer {{token}}`
- [ ] Console is open to view request/response logs

---

**Need Help?** If issues persist after following this guide, check:
1. Server logs for detailed error messages
2. Postman Console for request/response details
3. Shiprocket API documentation for latest changes
4. Contact Shiprocket support with request/response details

