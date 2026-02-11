import java.util.List;

/** Code to test the Lexer works as intended. Modify as needed.
 *
 */
public class Tester {
    public static void main(String[] args) {
        String code = "if (x > 10) { y = x - 5; } //test \n/*test 1 2 3 4 5 6 7 8 9*/ 10 11 12 13 14 15";
        Lexer lexer = new Lexer(code);
        List<Token> tokens = lexer.tokenize();

        for (Token token : tokens) {
            System.out.println(token);
        }
    }
}