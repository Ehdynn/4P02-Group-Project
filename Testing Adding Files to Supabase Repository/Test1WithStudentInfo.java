//John Smith
//12345678
//Cosc1234


import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

/**
 * Generic test suite for student submissions.
 * 
 * INSTRUCTIONS FOR INSTRUCTORS:
 * - Replace "StudentSolution" with the class students must implement.
 * - Add or modify tests as needed.
 */
class StudentSubmissionTest {

    private StudentSolution solution;

    @BeforeEach
    void setUp() {
        solution = new StudentSolution();
    }

    @Test
    @DisplayName("Test basic functionality")
    void testBasicCase() {
        int result = solution.exampleMethod(5);
        assertEquals(10, result, "exampleMethod should double the input");
    }

    @Test
    @DisplayName("Test edge case: zero")
    void testZeroCase() {
        int result = solution.exampleMethod(0);
        assertEquals(0, result);
    }

    @Test
    @DisplayName("Test negative numbers")
    void testNegativeCase() {
        int result = solution.exampleMethod(-3);
        assertEquals(-6, result);
    }

    @Test
    @DisplayName("Test invalid input handling")
    void testInvalidInput() {
        assertThrows(IllegalArgumentException.class, () -> {
            solution.exampleMethod(Integer.MIN_VALUE);
        });
    }
}
