"""
User Login ID Generator for ArthVerse
Format: [FirstInitial][LastInitial][Random][DDMM]
Example: Rahul Sharma, DOB 14-09-1996 -> RSX1409
"""

import random
import string
from datetime import datetime
from typing import Optional
import logging

logger = logging.getLogger(__name__)


def generate_user_login_id(name: str, date_of_birth: str, existing_ids_checker) -> str:
    """
    Generate a unique 7-character User Login ID
    
    Args:
        name: Full name (e.g., "Rahul Sharma")
        date_of_birth: DOB in format YYYY-MM-DD or DD-MM-YYYY
        existing_ids_checker: Async function to check if ID exists
    
    Returns:
        str: Generated unique login ID (e.g., "RSX1409")
    """
    # Parse name
    name_parts = name.strip().split()
    if len(name_parts) < 2:
        # If only one name, use first two letters
        first_initial = name_parts[0][0].upper() if len(name_parts[0]) > 0 else 'A'
        last_initial = name_parts[0][1].upper() if len(name_parts[0]) > 1 else 'A'
    else:
        first_initial = name_parts[0][0].upper()
        last_initial = name_parts[-1][0].upper()
    
    # Parse date of birth
    try:
        # Try YYYY-MM-DD format first
        if '-' in date_of_birth and len(date_of_birth.split('-')[0]) == 4:
            dob = datetime.strptime(date_of_birth, '%Y-%m-%d')
        # Try DD-MM-YYYY format
        elif '-' in date_of_birth:
            dob = datetime.strptime(date_of_birth, '%d-%m-%Y')
        # Try YYYY/MM/DD format
        elif '/' in date_of_birth and len(date_of_birth.split('/')[0]) == 4:
            dob = datetime.strptime(date_of_birth, '%Y/%m/%d')
        # Try DD/MM/YYYY format
        elif '/' in date_of_birth:
            dob = datetime.strptime(date_of_birth, '%d/%m/%Y')
        else:
            raise ValueError("Invalid date format")
        
        ddmm = dob.strftime('%d%m')
    except Exception as e:
        logger.error(f"Error parsing date of birth: {e}")
        raise ValueError("Invalid date of birth format. Use YYYY-MM-DD or DD-MM-YYYY")
    
    # Generate random alphanumeric character
    random_chars = string.ascii_uppercase + string.digits
    
    # Try to generate unique ID (max 50 attempts)
    for _ in range(50):
        random_char = random.choice(random_chars)
        login_id = f"{first_initial}{last_initial}{random_char}{ddmm}"
        
        # Check if ID already exists
        if not existing_ids_checker(login_id):
            return login_id
    
    # If still not unique after 50 attempts, add an extra random character
    random_char1 = random.choice(random_chars)
    random_char2 = random.choice(random_chars)
    login_id = f"{first_initial}{last_initial}{random_char1}{random_char2}{ddmm[2:]}"
    
    return login_id


def validate_date_of_birth(dob_str: str) -> bool:
    """
    Validate if the date of birth string is in correct format
    
    Args:
        dob_str: Date string to validate
    
    Returns:
        bool: True if valid, False otherwise
    """
    try:
        if '-' in dob_str and len(dob_str.split('-')[0]) == 4:
            datetime.strptime(dob_str, '%Y-%m-%d')
        elif '-' in dob_str:
            datetime.strptime(dob_str, '%d-%m-%Y')
        elif '/' in dob_str and len(dob_str.split('/')[0]) == 4:
            datetime.strptime(dob_str, '%Y/%m/%d')
        elif '/' in dob_str:
            datetime.strptime(dob_str, '%d/%m/%Y')
        else:
            return False
        return True
    except:
        return False
