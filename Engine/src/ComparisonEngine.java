import java.util.ArrayList;
import java.util.List;

import static java.lang.Math.min;

public class ComparisonEngine {
    ComparisonEngine(){}

    public static Token[] tokensToArray(List<Token> tokens){
        Token[] tokenArray = new Token[tokens.size()];
        int i = 0;
        for(Token t: tokens){
            tokenArray[i] = t;
            i++;
        }

        return tokenArray;
    }

    public static double compareSingle(List<Token> submission, List<Token> comparison, int tolerance){
        Token[] submissionArray = tokensToArray(submission);
        Token[] comparisonArray = tokensToArray(comparison);

        List<Token[]> comparisonToList = new ArrayList<>();
        comparisonToList.add(comparisonArray);

        List<Sequence> similaritySequences = StringTiling.tile(submissionArray, comparisonToList, tolerance);
        return SimilarityScore.getSimilarityScore(submissionArray, similaritySequences);
    }

    public static double compareDatabase(List<Token> submission, List<List<Token>> database, int tolerance){
        Token[] submissionArray = tokensToArray(submission);
        List<Token[]> databaseArray = new ArrayList<>();
        for(List<Token> lt: database){
            databaseArray.add(tokensToArray(lt));
        }

        List<Sequence> similaritySequences = StringTiling.tile(submissionArray, databaseArray, tolerance);
        return SimilarityScore.getSimilarityScore(submissionArray, similaritySequences);
    }
}
