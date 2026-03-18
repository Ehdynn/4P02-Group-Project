import java.io.File;
import java.io.IOException;
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
                "        // Prints \"Hello test\" to the terminal window.\n" +
                "        System.out.println(\"Hello 你 World\");\n" +
                "    }\n" +
                "}\n" +
                "if (x > 10) { y = x-5; } //test \n/*test 1 2 3 4 5 6 7 8 9*/ 10 11 12 13 14 15";

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
                "}" +
                "if (x > 10) { y = x-5; } //test \n/*test 1 2 3 4 5 6 7 8 9*/ 10 11 12 13 14 15";

        Lexer lexer_1 = new Lexer(helloWorld);
        Lexer lexer_2 = new Lexer(hiWorld);
        Lexer lexer_3 = new Lexer(code3);
        Lexer lexer_4 = new Lexer(printsNumbers);

        List<Token> tokens1 = lexer_1.tokenize();
        List<Token> copy1 = tokens1;
        List<Token> hiWorldTokens = lexer_2.tokenize();
        List<Token> code3Tokens = lexer_3.tokenize();
        List<Token> numberTokens = lexer_4.tokenize();

        /*System.out.println("Test 1: Two identical files:");
        System.out.println(ComparisonEngine.compareSingle(tokens1, copy1, 5));
        System.out.println(" ");

        System.out.println("Test 2: Two highly similar files:");
        System.out.println(ComparisonEngine.compareSingle(tokens1, hiWorldTokens, 5));
        System.out.println(" ");

        System.out.println("Test 3: Two dissimilar files:");
        System.out.println(ComparisonEngine.compareSingle(tokens1, code3Tokens, 5));
        System.out.println(" ");*/

        System.out.println("Test 4: Two somewhat similar files:");
        Token[] testTokens = ComparisonEngine.tokensToArray(tokens1);
        Token[] testTokens2 = ComparisonEngine.tokensToArray(numberTokens);
        Submission testSub = new Submission(testTokens, 123123);
        Submission testSub2 = new Submission(testTokens2, 456545);

        List<Submission> testSubList = new ArrayList<>();
        testSubList.add(testSub2);

        List<Sequence> testSequences = StringTiling.tile(testSub, testSubList, 5);
        double testScore = SimilarityScore.getSimilarityScore(testTokens, testSequences);

        ComparisonEngine.buildComparisonData(testSub, testSequences, testScore);

        System.out.println("Test 5: Evaluating tests 2 and 4 simultaneously:");
        //System.out.println(ComparisonEngine.compareDatabase(tokens1, multipleSubmissions, 5));

        SourceCode sourceCode;

        try{
            String sourceFile = "Engine/testFiles/VectorImp.java";
            FileHandler f = new FileHandler();
            File file = new File(sourceFile);
            sourceCode = f.getSourceCode(file);
            Lexer lexer = new Lexer(sourceCode);
            List<Token> tokens = lexer.tokenize();
            List<Token> copy = lexer.tokenize();
            //System.out.println(new ComparisonEngine().compare(code, code));

            for (Token token : tokens) {
                //System.out.println(token);
            }

            f.saveTokenList(tokens);
            System.out.println(f.getTokensFromFile(new File("Engine/src/resources/tokens.csv")).toString());
        } catch (IOException e) {
            throw new RuntimeException(e);
        }





    }
}