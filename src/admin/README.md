# Admin Dashboard API

## Overview
This API provides comprehensive dashboard statistics for admin users including revenue, orders, user metrics, and analytics.

## Authentication
All endpoints require:
- JWT Bearer token
- Admin role (ADMIN user type)

## Endpoints

### GET /admin/dashboard/stats

Returns complete dashboard statistics including:

**Response Structure:**
```json
{
  "stats": {
    "todayRevenue": 2450.75,
    "todayOrders": 87,
    "totalUsers": 1250,
    "activeRestaurants": 15,
    "revenueGrowth": 12.5,
    "ordersGrowth": 8.3,
    "newUsersToday": 12,
    "totalRestaurants": 18
  },
  "orderTrend": [
    {
      "date": "2024-10-01",
      "orders": 75,
      "revenue": 1850.50
    },
    {
      "date": "2024-10-02", 
      "orders": 82,
      "revenue": 2150.25
    }
  ],
  "topDishes": [
    {
      "id": "dish123",
      "name": "Margherita Pizza",
      "orders": 25,
      "revenue": 375.00,
      "restaurant": "Mario's Pizzeria",
      "restaurantId": "rest123"
    }
  ],
  "recentOrders": [
    {
      "id": "order123",
      "customerName": "John Doe",
      "status": "DELIVERED",
      "total": 28.50,
      "createdAt": "2024-10-03T10:30:00.000Z",
      "restaurantName": "Mario's Pizzeria"
    }
  ]
}
```

**Data Calculations:**
- `todayRevenue`: Sum of all order totals from today
- `todayOrders`: Count of orders placed today
- `revenueGrowth`: Percentage change compared to yesterday
- `ordersGrowth`: Percentage change in order count compared to yesterday
- `orderTrend`: Daily statistics for the last 7 days
- `topDishes`: Most ordered dishes ranked by order count
- `recentOrders`: Latest 10 orders with customer and restaurant info

**Usage Example:**
```bash
curl -X GET "http://localhost:3000/admin/dashboard/stats" \
  -H "Authorization: Bearer your-jwt-token" \
  -H "Content-Type: application/json"
```

**Response Codes:**
- 200: Success
- 401: Unauthorized (missing or invalid token)
- 403: Forbidden (user is not an admin)