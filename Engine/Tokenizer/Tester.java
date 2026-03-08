import java.util.List;

/** Code to test the Lexer works as intended. Modify as needed.
 *
 */
public class Tester {
    public static void main(String[] args) {
        String code3 = "if (x > 10) { y = x-5; } //test \n/*test 1 2 3 4 5 6 7 8 9*/ 10 11 12 13 14 15";
        String code = "test (x > 10) {_ y = x - 5; } for //test\n _ _  _ \"a b c d\"";
        String code2 = "for (i = 0; i < 10; i++){\nx +=1;\nSystem.out.printLn(x);}";
        String code4 = "test (x > 10) {_ y = x - NULL; } ";

        Lexer lexer = new Lexer(code);
        List<Token> tokens = lexer.tokenize();
        List<Token> copy = lexer.tokenize();
        System.out.println(new ComparisonEngine().compare(code, code));

        for (Token token : tokens) {
            System.out.println(token);
        }


    }
}