import java.util.List;

public class Submission {
    private List<Token> tokens;
    private int id;

    /** Constructor for Submissions
     *
     * @param tokens  List of code tokens
     * @param id Submissions id
     */
    public Submission(List<Token> tokens, int id){
        this.tokens = tokens;
        this.id = id;
    }

    /** The type of token
     *
     * @return  the TokenType of the Token
     */
    public List<Token> getTokens() {
        return tokens;
    }

    /** The type of token
     *
     * @return  the TokenType of the Token
     */
    public int getId() {
        return id;
    }
}
