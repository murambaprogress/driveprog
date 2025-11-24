import os
import json
from datetime import date

# Configure Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'drivecash_backend.settings')
import django

django.setup()

from loans.gemini_loan_analyzer import GeminiLoanAnalyzer


class MockApplication:
    """Lightweight stand-in for LoanApplication to smoke test AI analyzer without DB."""
    def __init__(self):
        # Core loan fields
        self.application_id = '00000000-0000-0000-0000-000000000000'
        self.amount = 20000  # requested
        self.term = 36
        self.purpose = 'Working capital'
        self.credit_score = 680

        # Personal
        self._first_name = 'Jane'
        self._last_name = 'Doe'
        self._email = 'jane@example.com'
        self._phone = '+10000000000'
        self._dob = date(1990, 1, 1)
        self._ssn = None
        self._bank = 'Example Bank'

        # Financial
        self._income = 60000
        self._gross_monthly_income = 5000
        self._employment_status = 'employed'
        self._employment_length = 5.0
        self._income_source = 'Employer Inc.'
        self._pay_frequency = 'Biweekly'
        self._active_bankruptcy = 'No'
        self._direct_deposit = 'Yes'
        self._military_status = 'None'

        # Address
        self._street = '123 Main St'
        self._city = 'Somewhere'
        self._state = 'CA'
        self._zip_code = '90001'

        # Vehicle
        self._vehicle_make = 'Toyota'
        self._vehicle_model = 'Camry'
        self._vehicle_year = '2018'
        self._vehicle_vin = '1HGCM82633A004352'
        self._vehicle_mileage = 65000
        self._vehicle_color = 'Blue'
        self._license_plate = 'ABC1234'
        self._registration_state = 'CA'
        self.applicant_estimated_value = 40000

        # No uploaded photos for this smoke test
        self.photo_vin_sticker = None
        self.photo_odometer = None
        self.photo_borrower = None
        self.photo_front_car = None
        self.photo_vin = None
        self.photo_license = None
        self.photo_insurance = None

    # Methods/properties the analyzer expects
    def get_full_name(self):
        return f"{self._first_name} {self._last_name}".strip()

    @property
    def email(self):
        return self._email

    @property
    def phone(self):
        return self._phone

    @property
    def dob(self):
        return self._dob

    @property
    def social_security(self):
        return self._ssn

    @property
    def banks_name(self):
        return self._bank

    @property
    def income(self):
        return self._income

    @property
    def gross_monthly_income(self):
        return self._gross_monthly_income

    @property
    def employment_status(self):
        return self._employment_status

    @property
    def employment_length(self):
        return self._employment_length

    @property
    def income_source(self):
        return self._income_source

    @property
    def pay_frequency(self):
        return self._pay_frequency

    @property
    def active_bankruptcy(self):
        return self._active_bankruptcy

    @property
    def direct_deposit(self):
        return self._direct_deposit

    @property
    def military_status(self):
        return self._military_status

    @property
    def street(self):
        return self._street

    @property
    def city(self):
        return self._city

    @property
    def state(self):
        return self._state

    @property
    def zip_code(self):
        return self._zip_code

    @property
    def vehicle_make(self):
        return self._vehicle_make

    @property
    def vehicle_model(self):
        return self._vehicle_model

    @property
    def vehicle_year(self):
        return self._vehicle_year

    @property
    def vehicle_vin(self):
        return self._vehicle_vin

    @property
    def vehicle_mileage(self):
        return self._vehicle_mileage

    @property
    def vehicle_color(self):
        return self._vehicle_color

    @property
    def license_plate(self):
        return self._license_plate

    @property
    def registration_state(self):
        return self._registration_state
    # Identification expected by analyzer
    @property
    def identification_type(self):
        return 'Driver License'

    @property
    def identification_no(self):
        return 'D1234567'

    @property
    def id_issuing_agency(self):
        return 'CA DMV'


if __name__ == '__main__':
    app = MockApplication()
    analyzer = GeminiLoanAnalyzer()
    result = analyzer.analyze_loan_application(app)

    # Print a compact summary
    summary = {
        'approval_suggestion': result.get('approval_suggestion'),
        'risk_assessment': result.get('risk_assessment'),
        'suggested_loan_amount': result.get('suggested_loan_amount'),
        'loan_limit_check': result.get('loan_limit_check'),
        'error': result.get('error'),
    }
    print(json.dumps(summary, indent=2))
