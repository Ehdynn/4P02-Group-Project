import java.util.List;

public class Submission {
    private Token[] tokens;
    private int id;

    /** Constructor for Submissions
     *
     * @param tokens  List of code tokens
     * @param id Submissions id
     */
    public Submission(Token[] tokens, int id){
        this.tokens = tokens;
        this.id = id;
    }

    /** The type of token
     *
     * @return  the TokenType of the Token
     */
    public Token[] getTokens() {
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
