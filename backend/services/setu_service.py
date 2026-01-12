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
        self.auth_url = "https://accountservice.setu.co/v1/users/login"  # Token API endpoint
        self.client_id = os.getenv("SETU_CLIENT_ID", "")
        self.client_secret = os.getenv("SETU_CLIENT_SECRET", "")
        self.product_instance_id = os.getenv("SETU_PRODUCT_INSTANCE_ID", "")
        self._access_token = None
        self._token_expiry = None
    
    async def _get_access_token(self) -> str:
        """Get OAuth access token from Setu"""
        # Check if we have a valid cached token
        if self._access_token and self._token_expiry and datetime.now() < self._token_expiry:
            return self._access_token
        
        logger.info("Fetching new Setu access token...")
        
        # Request new token using Setu's Token API
        async with aiohttp.ClientSession() as session:
            async with session.post(
                self.auth_url,
                headers={
                    "Content-Type": "application/json",
                    "client": "bridge"
                },
                json={
                    "clientID": self.client_id,
                    "secret": self.client_secret,
                    "grant_type": "client_credentials"
                }
            ) as response:
                response_text = await response.text()
                logger.info(f"Token API response status: {response.status}")
                
                if response.status != 200:
                    logger.error(f"Failed to get access token: {response_text}")
                    raise Exception(f"Authentication failed: {response_text}")
                
                data = json.loads(response_text)
                self._access_token = data.get("access_token")
                # Token typically valid for 300 seconds, cache for 250 to be safe
                expires_in = data.get("expiresIn", 300)
                self._token_expiry = datetime.now() + timedelta(seconds=expires_in - 50)
                
                logger.info("Successfully obtained Setu access token")
                return self._access_token
    
    async def _get_headers(self) -> Dict[str, str]:
        """Generate headers for Setu API requests"""
        access_token = await self._get_access_token()
        return {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {access_token}",
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
        
        # VUA format: phone number with @setu handle
        vua = f"{phone_number}@setu"
        
        payload = {
            "vua": vua,
            "dataRange": {
                "from": data_range_from.strftime("%Y-%m-%dT%H:%M:%SZ"),
                "to": data_range_to.strftime("%Y-%m-%dT%H:%M:%SZ")
            },
            "consentDuration": {
                "unit": "MONTH",
                "value": str(consent_duration_months)
            },
            "context": [],
        }
        
        async with aiohttp.ClientSession() as session:
            async with session.post(
                f"{self.base_url}/consents",
                headers=headers,
                json=payload
            ) as response:
                response_text = await response.text()
                logger.info(f"Consent creation response status: {response.status}")
                logger.info(f"Consent creation response: {response_text}")
                
                if response.status not in [200, 201]:
                    logger.error(f"Consent creation failed: {response_text}")
                    raise Exception(f"Consent creation failed: {response_text}")
                
                return json.loads(response_text)
    
    async def get_consent_status(self, consent_id: str) -> Dict:
        """
        Get the current status of a consent request.
        """
        logger.info(f"Checking consent status for: {consent_id}")
        
        headers = await self._get_headers()
        
        async with aiohttp.ClientSession() as session:
            async with session.get(
                f"{self.base_url}/consents/{consent_id}",
                headers=headers
            ) as response:
                if response.status != 200:
                    error_text = await response.text()
                    logger.error(f"Failed to fetch consent status: {error_text}")
                    raise Exception(f"Failed to fetch consent status: {error_text}")
                return await response.json()
    
    async def create_data_session(
        self,
        consent_id: str,
        format: str = "json"
    ) -> Dict:
        """
        Create a data session for fetching financial information.
        This API is used only after customer has approved consent.
        """
        logger.info(f"Creating data session for consent: {consent_id}")
        
        headers = await self._get_headers()
        
        payload = {
            "consentId": consent_id,
            "dataRange": {
                "from": (datetime.now() - timedelta(days=365)).strftime("%Y-%m-%dT%H:%M:%SZ"),
                "to": datetime.now().strftime("%Y-%m-%dT%H:%M:%SZ")
            },
            "format": format
        }
        
        async with aiohttp.ClientSession() as session:
            async with session.post(
                f"{self.base_url}/sessions",
                headers=headers,
                json=payload
            ) as response:
                if response.status not in [200, 201]:
                    error_text = await response.text()
                    logger.error(f"Data session creation failed: {error_text}")
                    raise Exception(f"Data session creation failed: {error_text}")
                return await response.json()
    
    async def fetch_financial_data(self, session_id: str) -> Dict:
        """
        Fetch the actual financial information for an approved consent.
        """
        logger.info(f"Fetching financial data for session: {session_id}")
        
        headers = await self._get_headers()
        
        async with aiohttp.ClientSession() as session:
            async with session.get(
                f"{self.base_url}/sessions/{session_id}",
                headers=headers
            ) as response:
                if response.status != 200:
                    error_text = await response.text()
                    logger.error(f"Failed to fetch financial data: {error_text}")
                    raise Exception(f"Failed to fetch financial data: {error_text}")
                return await response.json()

# Instantiate the service
setu_service = SetuService()
