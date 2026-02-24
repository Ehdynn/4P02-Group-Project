import java.util.List;

public class SimilarityScore {
    /** Takes in a list of tokens and a list of sequences flagged for similarity,
     *  outputs a double representing the percentage of similar code found in the submission.
     *
     *  The output is rounded to 2 decimal places.
     *
     * @Version 1.0 (Feb 24th, 2026)
     */
    public static double getSimilarityScore(Token[] submission, List<Sequence> sequences){
        int similarTokens = 0;
        double submissionLength = submission.length;

        for(Sequence s: sequences){
            similarTokens += s.getLength();
        }

        double score = Math.round(similarTokens/submissionLength * 10000);
        score /= 100;

        return score;

    }
}
