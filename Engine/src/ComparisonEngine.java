import java.util.ArrayList;
import java.util.List;
import org.json.JSONObject;
import org.json.JSONArray;
import java.util.*;

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

    public static void buildComparisonData(Submission submission, List<Sequence> sequences, double similarityScore){
        JSONObject comparisonJson = new JSONObject();
        Token[] submissionCode = submission.getTokens();
        sequences.sort(Comparator.comparingInt(Sequence::getStart));
        int sequenceStart = sequences.getFirst().getStart();
        int sequenceIndex = 0;

        comparisonJson.put("submission_id", submission.getId());

        JSONArray tokensArray = new JSONArray();
        for(int i = 0; i < submissionCode.length; i++){
            JSONObject tokenJson = new JSONObject();
            tokenJson.put("token_type", submissionCode[i].getType());
            tokenJson.put("token_value", submissionCode[i].getValue());
            tokensArray.put(tokenJson);
        }

        comparisonJson.put("tokens", tokensArray);

        JSONArray sequenceArray = new JSONArray();
        for(Sequence s: sequences){
            JSONObject sequenceJson = new JSONObject();
            sequenceJson.put("sequence_start", s.getStart());
            sequenceJson.put("sequence_length", s.getLength());
            sequenceJson.put("flagged_submission", s.getSubmissionId());
            sequenceArray.put(sequenceJson);
        }

        comparisonJson.put("similarity_sequences", sequenceArray);

        comparisonJson.put("similarity_score", similarityScore);

        String jsonString = comparisonJson.toString(4);

        System.out.println(jsonString);
    }
}
