import java.util.ArrayList;
import java.util.List;

/// Sequences of similar tokens that will be used to calculate the similarity score
public class Sequence {
    private int start;
    private int length;
    private List<Token> tokens;
    private String submissionId;
    private SeverityLevel level;

    /** Sequence Constructor
     *
     * @param start Index of first token in sequence
     * @param len   Length of sequence
     * @param submissionId   ID of flagged submission
     */
    Sequence(int start, int len, String submissionId) {
        this.start = start;
        this.length = len;
        this.tokens = new ArrayList<>();
        this.submissionId = submissionId;

        if(len <= 10){
            this.level = SeverityLevel.LOW;
        } else if(len <= 25){
            this.level = SeverityLevel.MEDIUM;
        } else {
            this.level = SeverityLevel.HIGH;
        }
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
    public String getSubmissionId() {
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

    /** Returns the severity level of the flagged sequence
     *
     * @return  Enum value of severity level
     */
    public SeverityLevel getSeverityLevel() { return level; }
}
