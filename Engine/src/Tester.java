import java.util.ArrayList;
import java.util.List;

/** Code to test the Lexer works as intended. Modify as needed.
 *
 */
public class Tester {
    public static void main(String[] args) {
        String code3 = "if (x > 10) { y = x-5; } //test \n/*test 1 2 3 4 5 6 7 8 9*/ 10 11 12 13 14 15";
        String code = "test (x > 10) {_ y = x - null; } for //test\n _ _  _ \"a b c d\"";
        String code2 = "for (i = 0; i < 10; i++){\nx +=1;\nSystem.out.printLn(x);}";
        String code4 = "test (x > 10) {_ y = x - null; } ";
        String helloWorld = "public class HelloWorld {\n" +
                "\n" +
                "    // Your program begins with a call to main()\n" +
                "    public static void main(String args[])\n" +
                "    {\n" +
                "        // Prints \"Hello, World\" to the terminal window.\n" +
                "        System.out.println(\"Hello, World\");\n" +
                "    }\n" +
                "}";

        String hiWorld = "public class HelloWorld {\n" +
                "\n" +
                "    // Your program begins with a call to main()\n" +
                "    public static void main(String args[])\n" +
                "    {\n" +
                "        // Prints \"Hi, World\" to the terminal window.\n" +
                "        System.out.print(\"Hi, World\");\n" +
                "    }\n" +
                "}";

        String printsNumbers = "public class HelloWorld {\n" +
                "\n" +
                "    // Your program begins with a call to main()\n" +
                "    public static void main(String args[])\n" +
                "    {\n" +
                "        // Prints \"Numbers 1 - 10\" to the terminal window.\n" +
                "        for (i = 0; i < 10; i++){\nx +=1;\nSystem.out.printLn(x);}" +
                "    }\n" +
                "}";

        Lexer lexer = new Lexer(helloWorld);
        Lexer lexer_2 = new Lexer(hiWorld);
        Lexer lexer_3 = new Lexer(code3);
        Lexer lexer_4 = new Lexer(printsNumbers);

        List<Token> tokens = lexer.tokenize();
        List<Token> copy = tokens;
        List<Token> hiWorldTokens = lexer_2.tokenize();
        List<Token> code3Tokens = lexer_3.tokenize();
        List<Token> numberTokens = lexer_4.tokenize();

        //for (Token token : tokens) {
        //    System.out.println(token);
        //}

        System.out.println("Test 1: Two identical files:");
        System.out.println(ComparisonEngine.compareSingle(tokens, copy, 5));
        System.out.println(" ");

        System.out.println("Test 2: Two highly similar files:");
        System.out.println(ComparisonEngine.compareSingle(tokens, hiWorldTokens, 5));
        System.out.println(" ");

        System.out.println("Test 3: Two dissimilar files:");
        System.out.println(ComparisonEngine.compareSingle(tokens, code3Tokens, 5));
        System.out.println(" ");

        System.out.println("Test 4: Two somewhat similar files:");
        System.out.println(ComparisonEngine.compareSingle(tokens, numberTokens, 5));
        System.out.println(" ");

        List<List<Token>> multipleSubmissions = new ArrayList<>();

        multipleSubmissions.add(hiWorldTokens);
        multipleSubmissions.add(numberTokens);

        System.out.println("Test 5: Evaluating tests 2 and 4 simultaneously:");
        System.out.println(ComparisonEngine.compareDatabase(tokens, multipleSubmissions, 5));

    }
}