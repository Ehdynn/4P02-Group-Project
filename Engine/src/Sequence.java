import java.util.ArrayList;
import java.util.List;

/** Sequence Class used in similarity score calculation and reports
 *
 * @Version 1.2 (April 23rd, 2026)
 */
public class Sequence {
    private int start;
    private int length;
    private int flaggedStart;
    private List<Token> tokens;
    private String submissionId;
    private SeverityLevel level;

    /** Sequence Constructor
     *
     * @param start Index of first token in sequence
     * @param len   Length of sequence
     * @param submissionId   ID of flagged submission
     * @param flaggedStart Index of first matching token in the flagged submission
     */
    Sequence(int start, int len, String submissionId, int flaggedStart) {
        this.start = start;
        this.length = len;
        this.flaggedStart = flaggedStart;
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

    public int getFlaggedStart() {
        return flaggedStart;
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
