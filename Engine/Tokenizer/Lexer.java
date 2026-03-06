import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/** Takes in code in the form of a String, outputs a list of Tokens that catagorize and order each piece of code.
 *  These tokens will be used for comparisons for plagiarism detection.
 *  These tokens will be used to reconstruct the report later.
 *
 *  TODO add Python and C support
 *  TODO add String support
 *  TODO parse out comments
 *
 *  Based on Enzo Jade's Tokenizer from the linked tutorial: https://medium.com/@enzojade62/step-by-step-building-a-lexer-in-java-for-tokenizing-source-code-ac4f1d91326f
 *  Modified to support comments, Strings, and non-Java languages.
 *
 * @Version 1.0 (Feb 11th, 2026)
 */
public class Lexer {
    private String input;
    private final Language language;
    private int index;
    FiniteStateMachine currentState;

    public Lexer(String input){
        this.input = input;
        this.language = Language.Java;
        this.index = 0;
    }

    /** Creates a Lexer (also known as a tokenizer,) that can be used to tokenize the given String input
     *
     * @param input Code to be tokenized
     */
    public Lexer(String input, Language language){
        this.input = input;
        this.language = language;
        this.index = 0;
    }

    /** Creates the list of tokens from the given text from construction
     *  TODO I'm pretty sure a double whitespace breaks it. That needs to be fixed at some point.
     *
     * @return  List of Tokens
     */
    public List<Token> tokenize() {
        List<Token> tokens = new ArrayList<>();

        input = removeComments(input, language);

        while (index < input.length()) {
            char currentChar = input.charAt(index);

            //Handles whitespaces, ignoring them and ending single line comments if relevant.
            if (Character.isWhitespace(currentChar)) {
                if(currentChar == '\n' && currentState == FiniteStateMachine.SINGLE_LINE_COMMENT) currentState = FiniteStateMachine.CODE;
                index++;
                continue;
            }

            Token token = nextToken();
            if (token != null) {
                tokens.add(token);
            } else {
                throw new RuntimeException("Unknown character: " + currentChar);
            }
        }

        correctStrings(tokens);
        correctCharacters(tokens);
        return tokens;
    }

    /** Creates the next Token beginning at the current index
     *  Compares the current string to the regular expressions representing the different types of Tokens
     *  TODO Need to make this more resilient. Currently handles errors poorly
     *
     * @return  Null if something fails,
     */
    private Token nextToken() {
        if (index >= input.length()) {
            return null;
        }

        String[] tokenPatterns = {
                "_|abstract|assert|boolean|break|byte|case|catch|char|class|continue|default|do|double|else|enum|extends|final|finally|float|for|if|implements|import|instanceof|int|interface|long|native|new|package|private|protected|public|return|short|static|super|switch|synchronized|this|throw|throws|transient|try|void|volatile|while|const|goto|strictfp",         // Keywords
                "[a-zA-Z_][a-zA-Z0-9_]*",   // Identifiers
                "\\d+",              // Literals
                "//[a-zA-Z0-9_]*",          // Single-Line Commments
                "/\\*[a-zA-Z0-9_]*",        // Multi-Line Comments
                "\\*/",                     // Comment End
                "[+-/*=<>!?]",              // Operators
                "[.,;(){}\"']",              // Punctuation
        };

        TokenType[] tokenTypes = {
                TokenType.KEYWORD,
                TokenType.IDENTIFIER,
                TokenType.LITERAL,
                TokenType.SINGLE_LINE_COMMENT,
                TokenType.MULTI_LINE_COMMENT,
                TokenType.COMMENT_END,
                TokenType.OPERATOR,
                TokenType.PUNCTUATION
        };

        for (int i = 0; i < tokenPatterns.length; i++) {
            Pattern pattern = Pattern.compile("^" + tokenPatterns[i]);
            Matcher matcher = pattern.matcher(input.substring(index));

            if (matcher.find()) {
                String value = matcher.group();
                index += value.length();
                TokenType t = tokenTypes[i];


                if(t == TokenType.SINGLE_LINE_COMMENT) currentState = FiniteStateMachine.SINGLE_LINE_COMMENT;
                if(t == TokenType.MULTI_LINE_COMMENT) currentState = FiniteStateMachine.MULTI_LINE_COMMENT;
                if(t == TokenType.COMMENT_END) currentState = FiniteStateMachine.CODE;
                if(currentState == FiniteStateMachine.SINGLE_LINE_COMMENT || currentState == FiniteStateMachine.MULTI_LINE_COMMENT)  return new Token(TokenType.COMMENT, value);
                System.out.println(value);
                return new Token(tokenTypes[i], value);
            }
        }

        return null;
    }

    /**Searches for and removes all comments
     * Finds them using Java's replace all function
     *
     * Single line java/c comments are defined by the regular expression "// .* \n".
     * Multiline java/c comments are defined by the regular expression "/ \\* .* \\* /".
     *
     * Single line python comments are defined by the regular expression "# .* \n".
     * There are no official python multiline comments. multiline quotes however function as comments.
     * Multiline strings functioning as comments are defined by the regex "\n \t* """ .* """ ".
     *
     * @param string    String to remove comments from
     * @param l         language being processed
     * @return  String with all comments removed.
     */
    private String removeComments(String string, Language l){
        String s = string;
        if(l == Language.C || l == Language.Java) {
            s = s.replaceAll("/\\*.*\\*/", ""); //Deletes multiline comments
            s = s.replaceAll("//.*\n", "");     //Deletes single line comments
        } else if (l == Language.Python) {
            s = s.replaceAll("\n\t*\"\"\".*\"\"\"", "\n");    //Deletes standalone multiline quotes
            s = s.replaceAll("#.*\\n", ""); //Deletes single line comments
        }
        return s;
    }

    /**Rewrites the type of all tokens between quote tokens as literals, as they are part of strings.
     *
     * @param tokens    List of tokens to modify
     * @return  updated List
     */
    private List<Token> correctStrings(List<Token> tokens){
        int l = -1; //left/starting index
        int r = -1; //right/final index
        int counter = 0;

        for(Token token : tokens){
            if(token.getValue().equals("\"")){
                if(l == -1) l = counter;
                else{
                    r = counter;
                    for(int i = l + 1; i < r; i++) tokens.get(i).updateType(TokenType.LITERAL);
                    l = -1;
                    r = -1;
                }
            }

            counter++;
        }
        return tokens;
    }

    /**Rewrites the type of any tokens between single quote tokens as literals, as they are character values.
     * Will only update if a single token is nestled between the quotes
     *
     * @param tokens    List of tokens to modify
     * @return  updated List
     */
    private List<Token> correctCharacters(List<Token> tokens){
        int l = -1; //left/starting index
        int r = -1; //right/final index
        int counter = 0;

        for(Token token : tokens){
            if(token.getValue().equals("'") && token.getType() == TokenType.PUNCTUATION){
                if(l == -1) l = counter;
                else{
                    r = counter;
                    if(r-l == 2) {
                        tokens.get(l + 1).updateType(TokenType.LITERAL);
                        l = -1;
                    }else l = r;
                    r = -1;
                }
            }

            counter++;
        }
        return tokens;
    }
}
