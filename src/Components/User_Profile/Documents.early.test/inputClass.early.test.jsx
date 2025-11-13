import '@testing-library/react'import '@testing-library/jest-dom';

// src/Components/User_Profile/Documents.test.jsx

import '@testing-library/jest-dom/extend-expect';


// src/Components/User_Profile/Documents.test.jsx
describe('inputClass() inputClass method', () => {
    // Happy Path Tests
    describe('Happy Paths', () => {
        test('should return the correct class string when there is no error', () => {
            // Arrange
            const error = '';

            // Act
            const result = inputClass(error);

            // Assert
            expect(result).toBe('w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 border-gray-300 focus:ring-green-500');
        });

        test('should return the correct class string when there is an error', () => {
            // Arrange
            const error = 'Some error';

            // Act
            const result = inputClass(error);

            // Assert
            expect(result).toBe('w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 border-red-500 focus:ring-red-500');
        });
    });

    // Edge Case Tests
    describe('Edge Cases', () => {
        test('should handle null error gracefully', () => {
            // Arrange
            const error = null;

            // Act
            const result = inputClass(error);

            // Assert
            expect(result).toBe('w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 border-gray-300 focus:ring-green-500');
        });

        test('should handle undefined error gracefully', () => {
            // Arrange
            const error = undefined;

            // Act
            const result = inputClass(error);

            // Assert
            expect(result).toBe('w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 border-gray-300 focus:ring-green-500');
        });

        test('should handle non-string error gracefully', () => {
            // Arrange
            const error = 12345;

            // Act
            const result = inputClass(error);

            // Assert
            expect(result).toBe('w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 border-red-500 focus:ring-red-500');
        });
    });
});