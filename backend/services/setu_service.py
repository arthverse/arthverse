import os
import aiohttp
import json
from typing import Dict, Optional
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)

class SetuService:
    """Service for Setu Account Aggregator API integration"""
    
    def __init__(self):
        self.base_url = os.getenv("SETU_BASE_URL", "https://fiu-sandbox.setu.co")
        self.client_id = os.getenv("SETU_CLIENT_ID", "")
        self.client_secret = os.getenv("SETU_CLIENT_SECRET", "")
        self.product_instance_id = os.getenv("SETU_PRODUCT_INSTANCE_ID", "918583b0-3495-4a0e-b709-777e840ffb97")
    
    async def _get_headers(self) -> Dict[str, str]:
        """Generate headers for Setu API requests"""
        return {
            "Content-Type": "application/json",
            "x-client-id": self.client_id,
            "x-client-secret": self.client_secret,
            "x-product-instance-id": self.product_instance_id,
        }
    
    async def create_consent_request(
        self,
        phone_number: str,
        user_id: str,
        data_range_from: datetime,
        data_range_to: datetime,
        consent_duration_months: int = 12,
    ) -> Dict:
        """
        Create a consent request with Setu AA.
        The consent object is the core binding contract.
        """
        logger.info(f"Creating consent request for phone: {phone_number}, user: {user_id}")
        
        headers = await self._get_headers()
        vua = f"{phone_number}@setu"
        
        payload = {
            "vua": vua,
            "dataRange": {
                "from": data_range_from.isoformat() + "Z",
                "to": data_range_to.isoformat() + "Z"
            },
            "consentDuration": {
                "unit": "MONTH",
                "value": consent_duration_months
            },
            "context": [],
            "additionalParams": {
                "tags": ["ArthVerse", "PersonalFinance"]
            }
        }
        
        async with aiohttp.ClientSession() as session:
            async with session.post(
                f"{self.base_url}/v2/consents",
                headers=headers,
                json=payload
            ) as response:
                if response.status != 200:
                    error_text = await response.text()
                    logger.error(f"Consent creation failed: {error_text}")
                    raise Exception(f"Consent creation failed: {error_text}")
                return await response.json()
    
    async def get_consent_status(self, consent_id: str) -> Dict:
        """
        TODO (POST-DEPLOYMENT): Implement actual Setu consent status check
        
        Get the current status of a consent request.
        """
        logger.info(f"Checking consent status for: {consent_id}")
        
        # TODO: Uncomment and implement post-deployment
        # headers = await self._get_headers()
        # 
        # async with aiohttp.ClientSession() as session:
        #     async with session.get(
        #         f"{self.base_url}/v2/consents/{consent_id}",
        #         headers=headers
        #     ) as response:
        #         if response.status != 200:
        #             raise Exception(f"Failed to fetch consent status")
        #         return await response.json()
        
        # Mock response for UI testing
        return {
            "id": consent_id,
            "status": "ACTIVE",
            "accounts": [
                {
                    "fipId": "HDFC-FIP",
                    "maskedAccNumber": "XXXXXXXX1234",
                    "accType": "SAVINGS",
                    "fiType": "DEPOSIT"
                },
                {
                    "fipId": "ICICI-FIP",
                    "maskedAccNumber": "XXXXXXXX5678",
                    "accType": "SAVINGS",
                    "fiType": "DEPOSIT"
                }
            ]
        }
    
    async def create_data_session(
        self,
        consent_id: str,
        format: str = "json"
    ) -> Dict:
        """
        TODO (POST-DEPLOYMENT): Implement actual Setu data session creation
        
        Create a data session for fetching financial information.
        This API is used only after customer has approved consent.
        """
        logger.info(f"Creating data session for consent: {consent_id}")
        
        # TODO: Uncomment and implement post-deployment
        # headers = await self._get_headers()
        # 
        # payload = {
        #     "consentId": consent_id,
        #     "dataRange": {
        #         "from": (datetime.now() - timedelta(days=365)).isoformat() + "Z",
        #         "to": datetime.now().isoformat() + "Z"
        #     },
        #     "format": format
        # }
        # 
        # async with aiohttp.ClientSession() as session:
        #     async with session.post(
        #         f"{self.base_url}/v2/data-sessions",
        #         headers=headers,
        #         json=payload
        #     ) as response:
        #         if response.status != 200:
        #             raise Exception("Data session creation failed")
        #         return await response.json()
        
        # Mock response for UI testing
        session_id = f"session_{consent_id}_{int(datetime.now().timestamp())}"
        return {
            "id": session_id,
            "status": "INITIATED"
        }
    
    async def fetch_financial_data(self, session_id: str) -> Dict:
        """
        TODO (POST-DEPLOYMENT): Implement actual Setu financial data fetching
        
        Fetch the actual financial information for an approved consent.
        """
        logger.info(f"Fetching financial data for session: {session_id}")
        
        # TODO: Uncomment and implement post-deployment
        # headers = await self._get_headers()
        # 
        # async with aiohttp.ClientSession() as session:
        #     async with session.get(
        #         f"{self.base_url}/v2/data-sessions/{session_id}",
        #         headers=headers
        #     ) as response:
        #         if response.status != 200:
        #             raise Exception("Failed to fetch financial data")
        #         return await response.json()
        
        # Mock response for UI testing - simulating bank data
        return {
            "accounts": [
                {
                    "fipId": "HDFC-FIP",
                    "fipName": "HDFC Bank",
                    "maskedAccNumber": "XXXXXXXX1234",
                    "accType": "SAVINGS",
                    "fiType": "DEPOSIT",
                    "profile": {
                        "holders": {
                            "holder": [{"name": "Demo User", "email": "demo@example.com"}]
                        }
                    },
                    "summary": {
                        "currentBalance": "250000.50",
                        "currency": "INR",
                        "balanceDateTime": datetime.now().isoformat()
                    },
                    "transactions": {
                        "transaction": [
                            {
                                "txnId": "TXN001",
                                "type": "CREDIT",
                                "mode": "UPI",
                                "amount": "5000.00",
                                "currentBalance": "250000.50",
                                "transactionTimestamp": (datetime.now() - timedelta(days=2)).isoformat(),
                                "narration": "Salary Credit"
                            },
                            {
                                "txnId": "TXN002",
                                "type": "DEBIT",
                                "mode": "UPI",
                                "amount": "1500.00",
                                "currentBalance": "245000.50",
                                "transactionTimestamp": (datetime.now() - timedelta(days=5)).isoformat(),
                                "narration": "Shopping - Amazon"
                            }
                        ]
                    }
                },
                {
                    "fipId": "ICICI-FIP",
                    "fipName": "ICICI Bank",
                    "maskedAccNumber": "XXXXXXXX5678",
                    "accType": "SAVINGS",
                    "fiType": "DEPOSIT",
                    "profile": {
                        "holders": {
                            "holder": [{"name": "Demo User"}]
                        }
                    },
                    "summary": {
                        "currentBalance": "125000.00",
                        "currency": "INR",
                        "balanceDateTime": datetime.now().isoformat()
                    },
                    "transactions": {
                        "transaction": []
                    }
                }
            ],
            "mutualFunds": [
                {
                    "fipId": "MUTUAL-FUND-FIP",
                    "fipName": "SBI Mutual Fund",
                    "folioNumber": "MF123456",
                    "fiType": "MUTUAL_FUNDS",
                    "holdings": [
                        {
                            "schemeName": "SBI Blue Chip Fund",
                            "units": "500.00",
                            "nav": "85.50",
                            "currentValue": "42750.00"
                        }
                    ]
                }
            ],
            "insurance": [
                {
                    "fipId": "INSURANCE-FIP",
                    "fipName": "LIC",
                    "policyNumber": "LIC987654",
                    "fiType": "INSURANCE",
                    "policyDetails": {
                        "policyType": "TERM",
                        "sumAssured": "5000000",
                        "premium": "25000",
                        "premiumFrequency": "YEARLY"
                    }
                }
            ]
        }

# Instantiate the service
setu_service = SetuService()
