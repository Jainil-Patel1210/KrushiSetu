# subsidy/tests/test_serializers_validate_status.py

import pytest
from rest_framework import serializers
from subsidy.serializers import OfficerReviewSerializer

"""
Unit tests for OfficerReviewSerializer.validate_status.

These tests assert that only the exact allowed strings are accepted:
  - "Approved"
  - "Rejected"
  - "Under Review"

All other inputs (wrong casing, whitespace, non-strings, empty, numeric, collections, None)
must raise rest_framework.serializers.ValidationError.
"""


class TestOfficerReviewSerializerValidateStatus:
    # --- Happy Path Tests ---

    @pytest.mark.happy_path
    def test_validate_status_approved(self):
        serializer = OfficerReviewSerializer()
        result = serializer.validate_status("Approved")
        assert result == "Approved"

    @pytest.mark.happy_path
    def test_validate_status_rejected(self):
        serializer = OfficerReviewSerializer()
        result = serializer.validate_status("Rejected")
        assert result == "Rejected"

    @pytest.mark.happy_path
    def test_validate_status_under_review(self):
        serializer = OfficerReviewSerializer()
        result = serializer.validate_status("Under Review")
        assert result == "Under Review"

    # --- Edge Case & Error Condition Tests ---
    # use the exact ValidationError class exported by DRF for precise checks
    ValidationError = serializers.ValidationError

    @pytest.mark.edge_case
    def test_validate_status_invalid_status(self):
        serializer = OfficerReviewSerializer()
        with pytest.raises(self.ValidationError) as excinfo:
            serializer.validate_status("Pending")
        assert "Invalid status" in str(excinfo.value)

    @pytest.mark.edge_case
    def test_validate_status_empty_string(self):
        serializer = OfficerReviewSerializer()
        with pytest.raises(self.ValidationError) as excinfo:
            serializer.validate_status("")
        assert "Invalid status" in str(excinfo.value)

    @pytest.mark.edge_case
    def test_validate_status_none(self):
        serializer = OfficerReviewSerializer()
        with pytest.raises(self.ValidationError) as excinfo:
            serializer.validate_status(None)
        assert "Invalid status" in str(excinfo.value)

    @pytest.mark.edge_case
    def test_validate_status_case_sensitivity(self):
        serializer = OfficerReviewSerializer()
        with pytest.raises(self.ValidationError) as excinfo:
            serializer.validate_status("approved")  # lower-case should be invalid
        assert "Invalid status" in str(excinfo.value)

    @pytest.mark.edge_case
    def test_validate_status_whitespace(self):
        serializer = OfficerReviewSerializer()
        with pytest.raises(self.ValidationError) as excinfo:
            serializer.validate_status(" Approved ")  # surrounding whitespace invalid
        assert "Invalid status" in str(excinfo.value)

    @pytest.mark.edge_case
    def test_validate_status_numeric_string(self):
        serializer = OfficerReviewSerializer()
        with pytest.raises(self.ValidationError) as excinfo:
            serializer.validate_status("123")
        assert "Invalid status" in str(excinfo.value)

    @pytest.mark.edge_case
    def test_validate_status_integer(self):
        serializer = OfficerReviewSerializer()
        with pytest.raises(self.ValidationError) as excinfo:
            serializer.validate_status(1)
        assert "Invalid status" in str(excinfo.value)

    @pytest.mark.edge_case
    def test_validate_status_list(self):
        serializer = OfficerReviewSerializer()
        with pytest.raises(self.ValidationError) as excinfo:
            serializer.validate_status(["Approved"])
        assert "Invalid status" in str(excinfo.value)
