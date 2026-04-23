import java.util.List;

/** User submissions, containing a list of tokens and an ID
 *
 */
public class Submission {
    private List<Token> tokens;
    private String id;

    /** Constructor for Submissions
     *
     * @param tokens  List of code tokens
     * @param id Submissions id
     */
    public Submission(List<Token> tokens, String id){
        this.tokens = tokens;
        this.id = id;
    }

    /** Returns the submissions tokenized code
     *
     * @return The list of tokens
     */
    public List<Token> getTokens() {
        return tokens;
    }

    /** Returns the submission ID
     *
     * @return The submission ID
     */
    public String getId() {
        return id;
    }
}
