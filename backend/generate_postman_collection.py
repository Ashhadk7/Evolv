"""
Postman Collection Generator for Person 1 (Auth, Profiles/Onboarding, Notifications)
"""
import json

collection = {
    "info": {
        "_postman_id": "evolv-person1-collection-id",
        "name": "Evolv API Collection - Person 1 (Auth, Profiles & Notifications)",
        "description": "Postman collection covering Person 1's features: Authentication & Session, Profile Onboarding & Gating, and Notifications.",
        "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
    },
    "variable": [
        {"key": "baseUrl", "value": "http://localhost:8000/api/v1", "type": "string"},
        {"key": "authToken", "value": "", "type": "string"},
        {"key": "userEmail", "value": "founder@evolv.ai", "type": "string"},
        {"key": "userPassword", "value": "Password123!", "type": "string"},
        {"key": "otpCode", "value": "123456", "type": "string"}
    ],
    "item": [
        {
            "name": "1. Authentication & Session",
            "item": [
                {
                    "name": "Start Signup (OTP Request)",
                    "request": {
                        "method": "POST",
                        "header": [{"key": "Content-Type", "value": "application/json"}],
                        "body": {
                            "mode": "raw",
                            "raw": json.dumps({
                                "email": "{{userEmail}}",
                                "password": "{{userPassword}}",
                                "first_name": "Eman",
                                "last_name": "Butt",
                                "role": "founder"
                            }, indent=2)
                        },
                        "url": {
                            "raw": "{{baseUrl}}/auth/signup",
                            "host": ["{{baseUrl}}"],
                            "path": ["auth", "signup"]
                        }
                    }
                },
                {
                    "name": "Verify Signup Email OTP",
                    "request": {
                        "method": "POST",
                        "header": [{"key": "Content-Type", "value": "application/json"}],
                        "body": {
                            "mode": "raw",
                            "raw": json.dumps({
                                "email": "{{userEmail}}",
                                "code": "{{otpCode}}"
                            }, indent=2)
                        },
                        "url": {
                            "raw": "{{baseUrl}}/auth/signup/verify-email",
                            "host": ["{{baseUrl}}"],
                            "path": ["auth", "signup", "verify-email"]
                        }
                    }
                },
                {
                    "name": "Resend Signup OTP",
                    "request": {
                        "method": "POST",
                        "header": [{"key": "Content-Type", "value": "application/json"}],
                        "body": {
                            "mode": "raw",
                            "raw": json.dumps({
                                "email": "{{userEmail}}"
                            }, indent=2)
                        },
                        "url": {
                            "raw": "{{baseUrl}}/auth/signup/resend-otp",
                            "host": ["{{baseUrl}}"],
                            "path": ["auth", "signup", "resend-otp"]
                        }
                    }
                },
                {
                    "name": "Sign In (Get Access Token)",
                    "event": [
                        {
                            "listen": "test",
                            "script": {
                                "exec": [
                                    "var jsonData = pm.response.json();",
                                    "if (jsonData.access_token) {",
                                    "    pm.environment.set('authToken', jsonData.access_token);",
                                    "    pm.collectionVariables.set('authToken', jsonData.access_token);",
                                    "}"
                                ],
                                "type": "text/javascript"
                            }
                        }
                    ],
                    "request": {
                        "method": "POST",
                        "header": [{"key": "Content-Type", "value": "application/json"}],
                        "body": {
                            "mode": "raw",
                            "raw": json.dumps({
                                "email": "{{userEmail}}",
                                "password": "{{userPassword}}"
                            }, indent=2)
                        },
                        "url": {
                            "raw": "{{baseUrl}}/auth/signin",
                            "host": ["{{baseUrl}}"],
                            "path": ["auth", "signin"]
                        }
                    }
                },
                {
                    "name": "Forgot Password Request",
                    "request": {
                        "method": "POST",
                        "header": [{"key": "Content-Type", "value": "application/json"}],
                        "body": {
                            "mode": "raw",
                            "raw": json.dumps({
                                "email": "{{userEmail}}"
                            }, indent=2)
                        },
                        "url": {
                            "raw": "{{baseUrl}}/auth/forgot-password",
                            "host": ["{{baseUrl}}"],
                            "path": ["auth", "forgot-password"]
                        }
                    }
                },
                {
                    "name": "Reset Password",
                    "request": {
                        "method": "POST",
                        "header": [{"key": "Content-Type", "value": "application/json"}],
                        "body": {
                            "mode": "raw",
                            "raw": json.dumps({
                                "email": "{{userEmail}}",
                                "code": "{{otpCode}}",
                                "new_password": "NewPassword123!"
                            }, indent=2)
                        },
                        "url": {
                            "raw": "{{baseUrl}}/auth/reset-password",
                            "host": ["{{baseUrl}}"],
                            "path": ["auth", "reset-password"]
                        }
                    }
                }
            ]
        },
        {
            "name": "2. Account & Profile Onboarding",
            "item": [
                {
                    "name": "Get Current User Profile (/me)",
                    "request": {
                        "method": "GET",
                        "header": [
                            {"key": "Authorization", "value": "Bearer {{authToken}}"}
                        ],
                        "url": {
                            "raw": "{{baseUrl}}/me",
                            "host": ["{{baseUrl}}"],
                            "path": ["me"]
                        }
                    }
                },
                {
                    "name": "Create Founder Profile",
                    "request": {
                        "method": "POST",
                        "header": [
                            {"key": "Content-Type", "value": "application/json"},
                            {"key": "Authorization", "value": "Bearer {{authToken}}"}
                        ],
                        "body": {
                            "mode": "raw",
                            "raw": json.dumps({
                                "company_name": "Evolv AI",
                                "bio": "Building the future of software development",
                                "location": "Karachi, Pakistan"
                            }, indent=2)
                        },
                        "url": {
                            "raw": "{{baseUrl}}/founder-profile",
                            "host": ["{{baseUrl}}"],
                            "path": ["founder-profile"]
                        }
                    }
                },
                {
                    "name": "Create Developer Profile",
                    "request": {
                        "method": "POST",
                        "header": [
                            {"key": "Content-Type", "value": "application/json"},
                            {"key": "Authorization", "value": "Bearer {{authToken}}"}
                        ],
                        "body": {
                            "mode": "raw",
                            "raw": json.dumps({
                                "bio": "Full Stack Engineer",
                                "skills": ["React", "Python", "FastAPI", "Next.js"],
                                "hourly_rate": 50
                            }, indent=2)
                        },
                        "url": {
                            "raw": "{{baseUrl}}/developer-profile",
                            "host": ["{{baseUrl}}"],
                            "path": ["developer-profile"]
                        }
                    }
                }
            ]
        },
        {
            "name": "3. Notifications",
            "item": [
                {
                    "name": "List User Notifications",
                    "request": {
                        "method": "GET",
                        "header": [
                            {"key": "Authorization", "value": "Bearer {{authToken}}"}
                        ],
                        "url": {
                            "raw": "{{baseUrl}}/notifications",
                            "host": ["{{baseUrl}}"],
                            "path": ["notifications"]
                        }
                    }
                },
                {
                    "name": "Get Notification Preferences",
                    "request": {
                        "method": "GET",
                        "header": [
                            {"key": "Authorization", "value": "Bearer {{authToken}}"}
                        ],
                        "url": {
                            "raw": "{{baseUrl}}/notifications/preferences",
                            "host": ["{{baseUrl}}"],
                            "path": ["notifications", "preferences"]
                        }
                    }
                },
                {
                    "name": "Update Notification Preferences",
                    "request": {
                        "method": "PATCH",
                        "header": [
                            {"key": "Content-Type", "value": "application/json"},
                            {"key": "Authorization", "value": "Bearer {{authToken}}"}
                        ],
                        "body": {
                            "mode": "raw",
                            "raw": json.dumps({
                                "preferences": {
                                    "email_notifications": True,
                                    "push_notifications": True
                                }
                            }, indent=2)
                        },
                        "url": {
                            "raw": "{{baseUrl}}/notifications/preferences",
                            "host": ["{{baseUrl}}"],
                            "path": ["notifications", "preferences"]
                        }
                    }
                },
                {
                    "name": "Mark All Notifications Read",
                    "request": {
                        "method": "POST",
                        "header": [
                            {"key": "Authorization", "value": "Bearer {{authToken}}"}
                        ],
                        "url": {
                            "raw": "{{baseUrl}}/notifications/mark-all-read",
                            "host": ["{{baseUrl}}"],
                            "path": ["notifications", "mark-all-read"]
                        }
                    }
                }
            ]
        }
    ]
}

with open("Evolv_Person1_Postman_Collection.json", "w") as f:
    json.dump(collection, f, indent=2)

print("[SUCCESS] Evolv_Person1_Postman_Collection.json generated successfully!")
