import java.util.ArrayList;
import java.util.List;

/// Sequences of similar tokens that will be used to calculate the similarity score
public class Sequence {
    private int start;
    private int length;
    private List<Token> tokens;
    private int submissionId;

    /** Sequence Constructor
     *
     * @param start Index of first token in sequence
     * @param len   Length of sequence
     * @param submissionId   ID of flagged submission
     */
    Sequence(int start, int len, int submissionId) {
        this.start = start;
        this.length = len;
        this.tokens = new ArrayList<>();
        this.submissionId = submissionId;
    }

    /** First token index
     *
     * @return  the index of the first token as an int
     */
    public int getStart() {
        return start;
    }

    /** Sequence length
     *
     * @return  the length of the sequence as an int
     */
    public int getLength() {
        return length;
    }

    /** Submission ID
     *
     * @return  the ID of the flagged submission
     */
    public int getSubmissionId() {
        return submissionId;
    }

    /** Token list
     *
     * @return  a list of all tokens included in the sequence
     */
    public List<Token> getTokens() {
        return tokens;
    }

    /** Adds a new token to this sequence
     *
     * @param t a token to be added to this sequence
     */
    public void addToken(Token t){
        tokens.add(t);
    }

    /** Prints the starting index and length of sequence
     *
     * @return  String of starting index and length of sequence
     */
    @Override
    public String toString() {
        return "(Start: " + start + ", length: " + length +")";
    }
}
