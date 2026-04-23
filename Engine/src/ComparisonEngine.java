import java.util.ArrayList;
import java.util.List;
import org.json.JSONObject;
import org.json.JSONArray;
import java.util.*;

import static java.lang.Math.min;

/** Allows comparison data to be condensed into a JSON
 *
 */
public class ComparisonEngine {
    ComparisonEngine() {
    }

    /**Converts a token list into a token array
     * @param tokens token list to be converted
     * @return token Array */
    public static Token[] tokensToArray(List<Token> tokens) {
        Token[] tokenArray = new Token[tokens.size()];
        int i = 0;
        for (Token t : tokens) {
            tokenArray[i] = t;
            i++;
        }

        return tokenArray;
    }

    /**Creates a comparrison JSON string
     *
     * @param submission submission to be compared
     * @param sequences sequences that are suspicious
     * @param similarityScore plagarized value
     * @return JSON String */
    public String buildComparisonData(Submission submission, List<Sequence> sequences, double similarityScore) {
        FileHandler handler = new FileHandler();
        JSONObject comparisonJson = new JSONObject();
        List<Token> submissionCode = submission.getTokens();
        sequences.sort(Comparator.comparingInt(Sequence::getStart));
        comparisonJson.put("submission_id", submission.getId());
        comparisonJson.put("code", handler.getTokenListCSV(submissionCode));

        JSONArray tokensArray = new JSONArray();
        for (Token token : submissionCode) {
            JSONObject tokenJson = new JSONObject();
            tokenJson.put("token_type", token.getType().toString());
            tokenJson.put("token_value", token.getValue());
            tokensArray.put(tokenJson);
        }

        comparisonJson.put("tokens", tokensArray);

        JSONArray sequenceArray = new JSONArray();
        for (Sequence s : sequences) {
            JSONObject sequenceJson = new JSONObject();
            sequenceJson.put("sequence_start", s.getStart());
            sequenceJson.put("sequence_length", s.getLength());
            sequenceJson.put("flagged_submission", s.getSubmissionId());
            sequenceJson.put("flagged_sequence_start", s.getFlaggedStart());
            sequenceJson.put("flagged_code", handler.getTokenListCSV(s.getTokens()));

            SeverityLevel severityLevel = s.getSeverityLevel();

            if(severityLevel == SeverityLevel.LOW){
                sequenceJson.put("severity_level", "Low");
            } else if(severityLevel == SeverityLevel.MEDIUM){
                sequenceJson.put("severity_level", "Medium");
            } else if(severityLevel == SeverityLevel.HIGH){
                sequenceJson.put("severity_level", "High");
            }
            sequenceArray.put(sequenceJson);
        }

        comparisonJson.put("similarity_sequences", sequenceArray);
        comparisonJson.put("similarity_score", similarityScore);

        return comparisonJson.toString(4);
    }
}
