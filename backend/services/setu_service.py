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
        Get the current status of a consent request.
        """
        logger.info(f"Checking consent status for: {consent_id}")
        
        headers = await self._get_headers()
        
        async with aiohttp.ClientSession() as session:
            async with session.get(
                f"{self.base_url}/v2/consents/{consent_id}",
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
                "from": (datetime.now() - timedelta(days=365)).isoformat() + "Z",
                "to": datetime.now().isoformat() + "Z"
            },
            "format": format
        }
        
        async with aiohttp.ClientSession() as session:
            async with session.post(
                f"{self.base_url}/v2/data-sessions",
                headers=headers,
                json=payload
            ) as response:
                if response.status != 200:
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
                f"{self.base_url}/v2/data-sessions/{session_id}",
                headers=headers
            ) as response:
                if response.status != 200:
                    error_text = await response.text()
                    logger.error(f"Failed to fetch financial data: {error_text}")
                    raise Exception(f"Failed to fetch financial data: {error_text}")
                return await response.json()

# Instantiate the service
setu_service = SetuService()
