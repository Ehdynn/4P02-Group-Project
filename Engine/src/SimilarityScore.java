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
        return getSimilarityScore(submission, sequences, new boolean[submission.size()]);
    }

    /**Gets the similarity score of a token list 
     *
     * @param submission token list to be compared
     * @param sequences list of sequences of tokens to be compared to 
     * @param ignoredTokens flags for each token in submission on whether or not to have them be compared
     * return similarity score as a double */
    public double getSimilarityScore(List<Token> submission, List<Sequence> sequences, boolean[] ignoredTokens){
        double plagarismValues = 0;
        double submissionLength = 0;

        for (int i = 0; i < submission.size(); i++) {
            if (ignoredTokens == null || i >= ignoredTokens.length || !ignoredTokens[i]) {
                submissionLength += 1;
            }
        }

        if (submissionLength == 0) {
            return 0;
        }

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
