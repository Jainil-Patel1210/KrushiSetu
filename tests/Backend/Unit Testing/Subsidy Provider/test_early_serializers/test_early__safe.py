# test_serializers.py

import pytest

from subsidy_provider.serializers import SimpleUserSerializer

@pytest.mark.usefixtures("dummy_obj")
class TestSimpleUserSerializerSafe:
    """
    Unit tests for SimpleUserSerializer._safe method.
    """

    @pytest.fixture
    def dummy_obj(self):
        """
        Provides a simple dummy object for attribute access.
        """
        class Dummy:
            pass
        return Dummy()

    # -------------------- Happy Path Tests --------------------

    @pytest.mark.happy
    def test_returns_first_non_none_attribute(self, dummy_obj):
        """
        Test that _safe returns the value of the first attribute that is not None or falsy.
        """
        dummy_obj.foo = None
        dummy_obj.bar = ""
        dummy_obj.baz = "value"
        serializer = SimpleUserSerializer()
        result = serializer._safe(dummy_obj, "foo", "bar", "baz")
        assert result == "value"

    @pytest.mark.happy
    def test_returns_first_truthy_attribute(self, dummy_obj):
        """
        Test that _safe returns the first attribute that is truthy, even if previous ones are falsy.
        """
        dummy_obj.a = ""
        dummy_obj.b = 0
        dummy_obj.c = []
        dummy_obj.d = "found"
        serializer = SimpleUserSerializer()
        result = serializer._safe(dummy_obj, "a", "b", "c", "d")
        assert result == "found"

    @pytest.mark.happy
    def test_returns_first_attribute_when_multiple_are_truthy(self, dummy_obj):
        """
        Test that _safe returns the first attribute if multiple attributes are truthy.
        """
        dummy_obj.x = "first"
        dummy_obj.y = "second"
        serializer = SimpleUserSerializer()
        result = serializer._safe(dummy_obj, "x", "y")
        assert result == "first"

    @pytest.mark.happy
    def test_returns_none_when_all_attributes_missing(self, dummy_obj):
        """
        Test that _safe returns None if none of the attributes exist on the object.
        """
        serializer = SimpleUserSerializer()
        result = serializer._safe(dummy_obj, "not_there", "also_missing")
        assert result is None

    @pytest.mark.happy
    def test_returns_none_when_all_attributes_are_none_or_falsy(self, dummy_obj):
        """
        Test that _safe returns None if all attributes are present but all are None or falsy.
        """
        dummy_obj.a = None
        dummy_obj.b = ""
        dummy_obj.c = 0
        dummy_obj.d = []
        serializer = SimpleUserSerializer()
        result = serializer._safe(dummy_obj, "a", "b", "c", "d")
        assert result is None

    # -------------------- Edge Case Tests --------------------

    @pytest.mark.edge
    def test_returns_none_when_no_attrs_passed(self, dummy_obj):
        """
        Test that _safe returns None if no attribute names are provided.
        """
        serializer = SimpleUserSerializer()
        result = serializer._safe(dummy_obj)
        assert result is None

    @pytest.mark.edge
    def test_handles_attribute_raising_exception(self, dummy_obj):
        """
        Test that _safe skips attributes that raise exceptions and continues to next.
        """
        class Evil:
            @property
            def bad(self):
                raise ValueError("fail!")
            good = "ok"
        evil = Evil()
        serializer = SimpleUserSerializer()
        result = serializer._safe(evil, "bad", "good")
        assert result == "ok"

    @pytest.mark.edge
    def test_returns_none_if_all_attributes_raise_exceptions(self):
        """
        Test that _safe returns None if all attributes raise exceptions.
        """
        class Evil:
            @property
            def bad1(self):
                raise AttributeError("fail1")
            @property
            def bad2(self):
                raise RuntimeError("fail2")
        evil = Evil()
        serializer = SimpleUserSerializer()
        result = serializer._safe(evil, "bad1", "bad2")
        assert result is None

    @pytest.mark.edge
    def test_returns_none_if_obj_is_none(self):
        """
        Test that _safe returns None if the object itself is None.
        """
        serializer = SimpleUserSerializer()
        result = serializer._safe(None, "foo", "bar")
        assert result is None

    @pytest.mark.edge
    def test_returns_none_if_attrs_are_empty_strings(self, dummy_obj):
        """
        Test that _safe returns None if attribute names are empty strings.
        """
        serializer = SimpleUserSerializer()
        result = serializer._safe(dummy_obj, "", "")
        assert result is None

    @pytest.mark.edge
    def test_returns_none_if_attrs_are_not_strings(self, dummy_obj):
        """
        Test that _safe returns None if attribute names are not strings.
        """
        serializer = SimpleUserSerializer()
        result = serializer._safe(dummy_obj, 123, None, True)
        assert result is None

    @pytest.mark.edge
    def test_returns_first_truthy_even_if_later_raises(self, dummy_obj):
        """
        Test that _safe returns the first truthy attribute even if a later attribute would raise.
        """
        class Evil:
            good = "yes"
            @property
            def bad(self):
                raise Exception("should not be accessed")
        evil = Evil()
        serializer = SimpleUserSerializer()
        result = serializer._safe(evil, "good", "bad")
        assert result == "yes"