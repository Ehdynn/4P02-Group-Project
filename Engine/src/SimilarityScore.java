import java.util.List;

public class SimilarityScore {
    /** Takes in a list of tokens and a list of sequences flagged for similarity,
     *  outputs a double representing the weighted percentage of similar code found in the submission.
     *
     *  The output is rounded to 2 decimal places.
     *
     * @Version 1.1 (Mar 12th, 2026)
     */
    public double getSimilarityScore(List<Token> submission, List<Sequence> sequences){
        double plagarismValues = 0;
        double submissionLength = submission.size();

        for(Sequence s: sequences){
            for(Token t: s.getTokens()){
                plagarismValues += t.getPlagiarismValue();
            }
        }

        double score = Math.round(plagarismValues/submissionLength * 10000);
        score /= 100;

        return score;

    }
}
