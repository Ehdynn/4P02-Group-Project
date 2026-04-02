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

    List<Token> tokens1 = lexer_1.tokenize();
    List<Token> tokens2 = lexer_2.tokenize();
    List<Token> tokens3 = lexer_3.tokenize();
    List<Token> tokens4 = lexer_4.tokenize();

    Submission submission1 = new Submission(tokens1, "123");
    Submission submission2 = new Submission(tokens1, "456");
    Submission submission3 = new Submission(tokens2, "123");
    Submission submission4 = new Submission(tokens2, "456");
    Submission submission5 = new Submission(tokens3, "111");
    Submission submission6 = new Submission(tokens4, "222");

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

}
