import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

public class ComparisonTest {

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

    String counter = "public class Counter {\n" +
            "\n" +
            "    public static void main(String[] args) {\n" +
            "        int sum = 0;\n" +
            "        for (int i = 0; i < 10; i++) {\n" +
            "            if (i % 2 == 0) {\n" +
            "                sum += i;\n" +
            "            }\n" +
            "        }\n" +
            "        System.out.println(sum);\n" +
            "    }\n" +
            "}\n" +
            "// counting even numbers\n" +
            "if (sum > 10) { sum -= 3; }\n";

    String counter2 = "public class CounterTest {\n" +
            "\n" +
            "    public static void main(String[] args) {\n" +
            "        int total = 0;\n" +
            "        for (int i = 0; i < 10; i++) {\n" +
            "            if (i % 2 != 0) {\n" +
            "                total += i;\n" +
            "            }\n" +
            "        }\n" +
            "        System.out.println(total);\n" +
            "    }\n" +
            "}\n" +
            "// counting odd numbers\n" +
            "if (total > 10) { total -= 2; }\n";

    String square = "public class MathUtil {\n" +
            "\n" +
            "    public static int square(int x) {\n" +
            "        return x * x;\n" +
            "    }\n" +
            "\n" +
            "    public static void main(String[] args) {\n" +
            "        int result = square(5);\n" +
            "        System.out.println(result);\n" +
            "    }\n" +
            "}\n" +
            "// simple square function\n" +
            "if (result < 50) { result += 10; }\n";

    String cube = "public class MathUtil {\n" +
            "\n" +
            "    public static int cube(int x) {\n" +
            "        return x * x * x;\n" +
            "    }\n" +
            "\n" +
            "    public static void main(String[] args) {\n" +
            "        int result = cube(3);\n" +
            "        System.out.println(result);\n" +
            "    }\n" +
            "}\n" +
            "// cube function\n" +
            "if (result > 20) { result -= 5; }\n";

    String printer = "public class Printer {\n" +
            "\n" +
            "    public static void main(String[] args) {\n" +
            "        String message = \"Hello World\";\n" +
            "        for (int i = 0; i < 3; i++) {\n" +
            "            System.out.println(message);\n" +
            "        }\n" +
            "    }\n" +
            "}\n" +
            "// print message multiple times\n" +
            "if (message.length() > 5) { message = message + \"!\"; }\n";

    String printer2 = "public class Printer {\n" +
            "\n" +
            "    public static void main(String[] args) {\n" +
            "        String text = \"Hello World\";\n" +
            "        for (int i = 0; i < 3; i++) {\n" +
            "            System.out.println(text);\n" +
            "        }\n" +
            "    }\n" +
            "}\n" +
            "// repeat output\n" +
            "if (text.length() > 5) { text = text + \"?\"; }\n";

    String math = "public class Noise {\n" +
            "\n" +
            "    public static void main(String[] args) {\n" +
            "        int x = 10;\n" +
            "        int y = 20;\n" +
            "        int z = x + y;\n" +
            "        System.out.println(z);\n" +
            "    }\n" +
            "}\n" +
            "/* random math operations */\n" +
            "if (z > 15) { z = z * 2; }\n";

    String helloWorldModified = "public class HelloWorld {\n" +
            "\n" +
            "    // Your program begins with a call to main()\n" +
            "    public static void main(String args[])\n" +
            "    {\n" +
            "        // Prints \"Hello test\" to the terminal window.\n" +
            "        System.out.print(\"Hello 你 World\");\n" +
            "    }\n" +
            "}\n" +
            "if (x > 10) { y = x-5; } //test \n/*test 1 2 3 4 5 6 7 8 9*/ 10 11 12 13 14 15";

    String empty = "";

    String codeHalf1 = "public class HelloWorld {\n" +
            "\n" +
            "    // Your program begins with a call to main()\n" +
            "    public static void main(String args[])\n" +
            "    {";

    String codeHalf2 = "        // Prints \"Hello test\" to the terminal window.\n" +
            "        System.out.println(\"Hello 你 World\");\n" +
            "    }\n" +
            "}\n" +
            "if (x > 10) { y = x-5; } //test \n/*test 1 2 3 4 5 6 7 8 9*/ 10 11 12 13 14 15";

    Lexer lexer_1 = new Lexer(helloWorld);
    Lexer lexer_2 = new Lexer(empty);
    Lexer lexer_3 = new Lexer(codeHalf1);
    Lexer lexer_4 = new Lexer(codeHalf2);
    Lexer lexer_5 = new Lexer(helloWorldModified);

    Lexer lexer_6 = new Lexer(counter);
    Lexer lexer_7 = new Lexer(counter2);
    Lexer lexer_8 = new Lexer(square);
    Lexer lexer_9 = new Lexer(cube);
    Lexer lexer_10 = new Lexer(printer);
    Lexer lexer_11 = new Lexer(printer2);
    Lexer lexer_12 = new Lexer(math);

    List<Token> tokens1 = lexer_1.tokenize();
    List<Token> tokens2 = lexer_2.tokenize();
    List<Token> tokens3 = lexer_3.tokenize();
    List<Token> tokens4 = lexer_4.tokenize();
    List<Token> tokens5 = lexer_5.tokenize();
    List<Token> tokens6 = lexer_6.tokenize();
    List<Token> tokens7 = lexer_7.tokenize();
    List<Token> tokens8 = lexer_8.tokenize();
    List<Token> tokens9 = lexer_9.tokenize();
    List<Token> tokens10 = lexer_10.tokenize();
    List<Token> tokens11 = lexer_11.tokenize();
    List<Token> tokens12 = lexer_12.tokenize();

    Submission submission1 = new Submission(tokens1, "123");
    Submission submission2 = new Submission(tokens1, "456");
    Submission submission3 = new Submission(tokens2, "123");
    Submission submission4 = new Submission(tokens2, "456");
    Submission submission5 = new Submission(tokens3, "111");
    Submission submission6 = new Submission(tokens4, "222");
    Submission submission7 = new Submission(tokens5, "555");

    Submission submission8 = new Submission(tokens6, "111");
    Submission submission9 = new Submission(tokens7, "222");
    Submission submission10 = new Submission(tokens8, "333");
    Submission submission11 = new Submission(tokens9, "444");
    Submission submission12 = new Submission(tokens10, "555");
    Submission submission13 = new Submission(tokens11, "666");
    Submission submission14 = new Submission(tokens12, "777");

    @Test
    public void testIdentical(){
        StringTiling tiling = new StringTiling();
        SimilarityScore simScore = new SimilarityScore();
        List<Submission> database = new ArrayList<>();
        database.add(submission2);

        List<Sequence> results = tiling.tile(submission1, database, 5);
        double score = simScore.getSimilarityScore(submission1.getTokens(), results);

        assertEquals(100.00, score);

    }

    //Comparison function should ignore submissions with the same ID

    @Test
    public void testSame(){
        StringTiling tiling = new StringTiling();
        SimilarityScore simScore = new SimilarityScore();
        List<Submission> database = new ArrayList<>();
        database.add(submission1);

        List<Sequence> results = tiling.tile(submission1, database, 5);
        double score = simScore.getSimilarityScore(submission1.getTokens(), results);

        assertEquals(0.00, score);

    }

    //tests two empty token lists

    @Test
    public void testEmpty(){
        StringTiling tiling = new StringTiling();
        SimilarityScore simScore = new SimilarityScore();
        List<Submission> database = new ArrayList<>();
        database.add(submission4);

        List<Sequence> results = tiling.tile(submission3, database, 5);
        double score = simScore.getSimilarityScore(submission3.getTokens(), results);

        assertEquals(0.00, score);

    }

    //tests code against an empty token list

    @Test
    public void testAgainstEmpty(){
        StringTiling tiling = new StringTiling();
        SimilarityScore simScore = new SimilarityScore();
        List<Submission> database = new ArrayList<>();
        database.add(submission4);

        List<Sequence> results = tiling.tile(submission1, database, 5);
        double score = simScore.getSimilarityScore(submission1.getTokens(), results);

        assertEquals(0.00, score);

    }

    //testing a piece of code against two separate pieces containing the same contents returns a 100% score
    @Test
    public void testAgainstTwoHalves(){
        StringTiling tiling = new StringTiling();
        SimilarityScore simScore = new SimilarityScore();
        List<Submission> database = new ArrayList<>();
        database.add(submission5);
        database.add(submission6);

        List<Sequence> results = tiling.tile(submission1, database, 5);
        double score = simScore.getSimilarityScore(submission1.getTokens(), results);

        assertEquals(100.00, score);

    }

    @Test
    public void testBoilerPlateDetection(){
        StringTiling tiling = new StringTiling();
        SimilarityScore simScore = new SimilarityScore();

        List<Submission> database = new ArrayList<>();
        database.add(submission2);

        boolean[] boilerplateMask = tiling.getMatchedTokenMask(submission1, submission2, 5);

        List<Sequence> results = tiling.tile(submission1, database, 5, boilerplateMask);
        double score = simScore.getSimilarityScore(submission1.getTokens(), results);

        assertEquals(0.00, score);
    }

    @Test
    public void testEmptyBoilerplateArray(){
        StringTiling tiling = new StringTiling();
        SimilarityScore simScore = new SimilarityScore();

        List<Submission> database = new ArrayList<>();
        database.add(submission2);

        boolean[] boilerplateMask = new boolean[submission1.getTokens().size()];

        List<Sequence> results = tiling.tile(submission1, database, 5, boilerplateMask);
        double score = simScore.getSimilarityScore(submission1.getTokens(), results);

        assertEquals(100.00, score);
    }

    @Test
    public void testDatabaseOrder(){
        StringTiling tiling = new StringTiling();
        SimilarityScore simScore = new SimilarityScore();

        List<Submission> database = new ArrayList<>();
        database.add(submission7);
        database.add(submission2);

        List<Sequence> results = tiling.tile(submission1, database, 5);
        double score = simScore.getSimilarityScore(submission1.getTokens(), results);

        assertEquals(100.00, score);
    }

    @Test
    public void runtimeTest(){
        StringTiling tiling = new StringTiling();
        SimilarityScore simScore = new SimilarityScore();

        List<Submission> database = new ArrayList<>();

        database.add(submission1);
        database.add(submission2);
        database.add(submission3);
        database.add(submission4);
        database.add(submission5);
        database.add(submission6);
        database.add(submission7);
        database.add(submission8);
        database.add(submission9);
        database.add(submission10);
        database.add(submission11);
        database.add(submission12);
        database.add(submission13);
        database.add(submission14);

        for(Submission s: database){
            List<Sequence> results = tiling.tile(s, database, 5);
            double score = simScore.getSimilarityScore(s.getTokens(), results);

            System.out.println("Score: " + score);
        }
    }
}
