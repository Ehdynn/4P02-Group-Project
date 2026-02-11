/** Token object the Lexer will use to break code into comparable segments
 *
 */
public class Token implements Comparable<Token>{
    private TokenType type;
    private String value;
    private double plagiarismValue; //TODO figure out the scale of this thing

    /** Constructor for Tokens
     *
     * @param type  Type of Token
     * @param value String the Token holds
     */
    public Token(TokenType type, String value){
        this.type = type;
        this.value = value;
    }

    /** Sets the Token's likelihood of being stolen to plagiarismValue
     *
     * @param plagiarismValue   likelihood of this code chunk being stolen.
     */
    public void setPlagiarismValue(double plagiarismValue) {
        this.plagiarismValue = plagiarismValue;
    }

    /** The type of token
     *
     * @return  the TokenType of the Token
     */
    public TokenType getType() {
        return type;
    }

    /** The String the token holds and represents
     *
     * @return  the String value of the Token
     */
    public String getValue() {
        return value;
    }

    /** The computed value that represents the likelihood this token represents a stolen piece of code.
     *  TODO Figure out how the scale on this will work
     *
     * @return
     */
    public double getPlagiarismValue(){
        return plagiarismValue;
    }

    /** Writes out the value and type of this token
     *  For testing purposes primarily
     *
     * @return  String of type and value of the token
     */
    @Override
    public String toString() {
        return "Token{" + "type=" + type + ", value='" + value + '\'' + '}';
    }

    /** Implements compareTo, allowing the comparison of 2 tokens.
     *
     *
     * @param token the token this token is to be compared to
     * @return  1 if tokens are the same, 0 if tokens are the same type but different, 0 if tokens are different types.
     */
    @Override
    public int compareTo(Token token) {
        if(this.getType() == token.getType() && this.getValue() == token.getValue()) return 1;
        if(this.getType() == token.getType()) return 0;
        return -1;
    }
}
