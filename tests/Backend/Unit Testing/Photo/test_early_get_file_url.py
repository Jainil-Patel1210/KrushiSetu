import pytest
from unittest.mock import Mock, patch
from photo.serializers import DocumentSerializer


@pytest.fixture
def serializer():
    return DocumentSerializer()


@pytest.fixture
def mock_cloudinary():
    # Patch actual cloudinary_url import path
    with patch("photo.serializers.cloudinary_url") as m:
        m.return_value = ("https://cloudinary.com/fake-url", None)
        yield m


# -------------------------------------------------------
# HAPPY PATH TESTS
# -------------------------------------------------------

def test_returns_file_url_when_obj_file_has_url(serializer, mock_cloudinary):
    file_mock = Mock()
    file_mock.url = "https://mybucket.com/file.pdf"
    obj = Mock()
    obj.file = file_mock

    result = serializer.get_file_url(obj)

    assert result == "https://mybucket.com/file.pdf"
    mock_cloudinary.assert_not_called()


def test_returns_cloudinary_url_when_obj_file_has_no_url(serializer, mock_cloudinary):
    file_mock = Mock()
    type(file_mock).url = property(lambda self: (_ for _ in ()).throw(Exception("no url")))
    file_mock.public_id = "doc/123"
    obj = Mock()
    obj.file = file_mock

    result = serializer.get_file_url(obj)

    assert result == "https://cloudinary.com/fake-url"
    mock_cloudinary.assert_called_once_with("doc/123", resource_type="auto", secure=True)


def test_returns_cloudinary_url_when_url_raises_generic_exception(serializer, mock_cloudinary):
    file_mock = Mock()
    type(file_mock).url = property(lambda self: (_ for _ in ()).throw(Exception("Boom")))
    file_mock.public_id = "abc/999"
    obj = Mock()
    obj.file = file_mock

    result = serializer.get_file_url(obj)

    assert result == "https://cloudinary.com/fake-url"
    mock_cloudinary.assert_called_once_with("abc/999", resource_type="auto", secure=True)


# -------------------------------------------------------
# EDGE CASE TESTS
# -------------------------------------------------------

def test_cloudinary_with_no_public_id_uses_str_file(serializer, mock_cloudinary):
    file_mock = Mock()
    type(file_mock).url = property(lambda self: (_ for _ in ()).throw(Exception()))

    # REMOVE public_id attribute so getattr() returns None
    if hasattr(file_mock, "public_id"):
        del file_mock.public_id

    file_mock.__str__ = Mock(return_value="string_file_id")
    obj = Mock()
    obj.file = file_mock

    result = serializer.get_file_url(obj)

    assert result == "https://cloudinary.com/fake-url"
    mock_cloudinary.assert_called_once_with("string_file_id", resource_type="auto", secure=True)


def test_cloudinary_with_public_id_none_uses_str_file(serializer, mock_cloudinary):
    file_mock = Mock()
    type(file_mock).url = property(lambda self: (_ for _ in ()).throw(Exception()))
    file_mock.public_id = None
    file_mock.__str__ = Mock(return_value="file_none")
    obj = Mock()
    obj.file = file_mock

    result = serializer.get_file_url(obj)

    assert result == "https://cloudinary.com/fake-url"
    mock_cloudinary.assert_called_once_with("file_none", resource_type="auto", secure=True)


def test_obj_file_is_none_raises_attribute_error(serializer):
    obj = Mock()
    obj.file = None

    with pytest.raises(AttributeError):
        serializer.get_file_url(obj)


def test_obj_file_str_raises_exception(serializer, mock_cloudinary):
    file_mock = Mock()
    type(file_mock).url = property(lambda self: (_ for _ in ()).throw(Exception()))
    file_mock.public_id = None
    file_mock.__str__ = Mock(side_effect=ValueError("cannot stringify"))

    obj = Mock()
    obj.file = file_mock

    with pytest.raises(ValueError, match="cannot stringify"):
        serializer.get_file_url(obj)
