#!/usr/bin/env python3
"""
Via Sacra Backend API Testing
Tests all API endpoints for the Via Sacra interactive website
"""

import requests
import sys
import json
from datetime import datetime

class ViaSacraAPITester:
    def __init__(self, base_url="https://passos-cristo.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []

    def log_test(self, name, success, details=""):
        """Log test results"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED")
        else:
            self.failed_tests.append({"test": name, "details": details})
            print(f"❌ {name} - FAILED: {details}")

    def test_api_root(self):
        """Test API root endpoint"""
        try:
            response = requests.get(f"{self.api_url}/", timeout=10)
            success = response.status_code == 200
            if success:
                data = response.json()
                success = "message" in data and "Via Sacra API" in data["message"]
            self.log_test("API Root", success, f"Status: {response.status_code}")
            return success
        except Exception as e:
            self.log_test("API Root", False, str(e))
            return False

    def test_intro_endpoint(self):
        """Test intro prayer endpoint"""
        try:
            response = requests.get(f"{self.api_url}/intro", timeout=10)
            success = response.status_code == 200
            if success:
                data = response.json()
                success = all(key in data for key in ["title", "text"])
                if success:
                    print(f"   📖 Intro title: {data['title'][:50]}...")
            self.log_test("GET /api/intro", success, f"Status: {response.status_code}")
            return success, data if success else {}
        except Exception as e:
            self.log_test("GET /api/intro", False, str(e))
            return False, {}

    def test_stations_list(self):
        """Test stations list endpoint"""
        try:
            response = requests.get(f"{self.api_url}/stations", timeout=10)
            success = response.status_code == 200
            if success:
                data = response.json()
                success = isinstance(data, list) and len(data) == 14
                if success:
                    # Check first station structure
                    first_station = data[0]
                    required_fields = ["id", "title", "image_url", "versicle", "meditation", "prayer", "standard_prayers", "hymn"]
                    success = all(field in first_station for field in required_fields)
                    if success:
                        print(f"   📋 Found {len(data)} stations")
                        print(f"   📖 First station: {first_station['title']}")
            self.log_test("GET /api/stations", success, f"Status: {response.status_code}, Count: {len(data) if success else 0}")
            return success, data if success else []
        except Exception as e:
            self.log_test("GET /api/stations", False, str(e))
            return False, []

    def test_individual_stations(self):
        """Test individual station endpoints"""
        all_success = True
        for station_id in range(1, 15):  # Test stations 1-14
            try:
                response = requests.get(f"{self.api_url}/stations/{station_id}", timeout=10)
                success = response.status_code == 200
                if success:
                    data = response.json()
                    required_fields = ["id", "title", "image_url", "versicle", "meditation", "prayer", "standard_prayers", "hymn"]
                    success = all(field in data for field in required_fields) and data["id"] == station_id
                
                if not success:
                    all_success = False
                    self.log_test(f"GET /api/stations/{station_id}", False, f"Status: {response.status_code}")
                else:
                    print(f"   ✅ Station {station_id}: {data['title'][:40]}...")
            except Exception as e:
                all_success = False
                self.log_test(f"GET /api/stations/{station_id}", False, str(e))
        
        self.log_test("Individual Stations (1-14)", all_success)
        return all_success

    def test_invalid_station_ids(self):
        """Test invalid station IDs"""
        invalid_ids = [0, 15, -1, 999]
        all_success = True
        
        for invalid_id in invalid_ids:
            try:
                response = requests.get(f"{self.api_url}/stations/{invalid_id}", timeout=10)
                success = response.status_code == 400  # Should return 400 for invalid IDs
                if not success:
                    all_success = False
                    print(f"   ❌ Station {invalid_id} should return 400, got {response.status_code}")
                else:
                    print(f"   ✅ Station {invalid_id} correctly returned 400")
            except Exception as e:
                all_success = False
                print(f"   ❌ Station {invalid_id} error: {str(e)}")
        
        self.log_test("Invalid Station IDs", all_success)
        return all_success

    def test_final_prayers(self):
        """Test final prayers endpoint"""
        try:
            response = requests.get(f"{self.api_url}/final-prayers", timeout=10)
            success = response.status_code == 200
            if success:
                data = response.json()
                success = isinstance(data, list) and len(data) > 0
                if success:
                    # Check first prayer structure
                    first_prayer = data[0]
                    success = all(key in first_prayer for key in ["title", "text"])
                    if success:
                        print(f"   📋 Found {len(data)} final prayers")
                        print(f"   📖 First prayer: {first_prayer['title']}")
            self.log_test("GET /api/final-prayers", success, f"Status: {response.status_code}")
            return success, data if success else []
        except Exception as e:
            self.log_test("GET /api/final-prayers", False, str(e))
            return False, []

    def test_cors_headers(self):
        """Test CORS headers"""
        try:
            response = requests.options(f"{self.api_url}/stations", timeout=10)
            success = response.status_code in [200, 204]
            if success:
                headers = response.headers
                cors_headers = ['Access-Control-Allow-Origin', 'Access-Control-Allow-Methods']
                success = any(header in headers for header in cors_headers)
            self.log_test("CORS Headers", success, f"Status: {response.status_code}")
            return success
        except Exception as e:
            self.log_test("CORS Headers", False, str(e))
            return False

    def run_all_tests(self):
        """Run all backend tests"""
        print("🚀 Starting Via Sacra Backend API Tests")
        print(f"🌐 Testing API at: {self.api_url}")
        print("=" * 60)

        # Test API availability
        if not self.test_api_root():
            print("❌ API is not accessible. Stopping tests.")
            return False

        # Test all endpoints
        self.test_intro_endpoint()
        self.test_stations_list()
        self.test_individual_stations()
        self.test_invalid_station_ids()
        self.test_final_prayers()
        self.test_cors_headers()

        # Print summary
        print("\n" + "=" * 60)
        print(f"📊 Test Summary: {self.tests_passed}/{self.tests_run} tests passed")
        
        if self.failed_tests:
            print("\n❌ Failed Tests:")
            for failed in self.failed_tests:
                print(f"   • {failed['test']}: {failed['details']}")
        
        success_rate = (self.tests_passed / self.tests_run) * 100 if self.tests_run > 0 else 0
        print(f"✨ Success Rate: {success_rate:.1f}%")
        
        return self.tests_passed == self.tests_run

def main():
    tester = ViaSacraAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())